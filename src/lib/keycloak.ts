/**
 * Keycloak Service
 * Following Single Responsibility Principle
 */

import Keycloak from "keycloak-js";
import { CONFIG } from "@/constants";

// Keycloak configuration from centralized config
const keycloakConfig = {
  url: CONFIG.keycloak.url,
  realm: CONFIG.keycloak.realm,
  clientId: CONFIG.keycloak.clientId,
};

// Initialize Keycloak instance
export const keycloak = new Keycloak(keycloakConfig);

// Initialize Keycloak and return a promise
export async function initKeycloak(): Promise<boolean> {
  try {
    const authenticated = await keycloak.init({
      onLoad: "check-sso", // Check SSO on load
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
      checkLoginIframe: false,
    });

    return authenticated;
  } catch (error) {
    console.error("Failed to initialize Keycloak", error);
    return false;
  }
}

// Login function
export async function loginKeycloak(): Promise<void> {
  try {
    console.log("Keycloak login called, redirecting to Keycloak...");
    await keycloak.login({
      redirectUri: window.location.origin + "/dashboard",
    });
    console.log("Keycloak login redirect initiated");
  } catch (error) {
    console.error("Failed to login with Keycloak", error);
    throw error;
  }
}

// Logout function
export async function logoutKeycloak(): Promise<void> {
  try {
    await keycloak.logout({
      redirectUri: window.location.origin,
    });
  } catch (error) {
    console.error("Failed to logout from Keycloak", error);
    throw error;
  }
}

// Get user info from Keycloak token
export function getUserInfo() {
  if (!keycloak.authenticated || !keycloak.tokenParsed) {
    return null;
  }

  const token = keycloak.tokenParsed as any;
  return {
    id: token.sub, // Keycloak user ID
    username: token.preferred_username || token.username,
    email: token.email,
    firstName: token.given_name,
    lastName: token.family_name,
    roles: token.realm_access?.roles || [],
  };
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return keycloak.authenticated || false;
}

// Get access token
export function getAccessToken(): string | null {
  return keycloak.token || null;
}

// Refresh token
export async function refreshToken(): Promise<boolean> {
  try {
    return await keycloak.updateToken(30); // Refresh if token expires within 30 seconds
  } catch (error) {
    console.error("Failed to refresh token", error);
    return false;
  }
}

// Set up token refresh interval
export function setupTokenRefresh() {
  // Refresh token every 5 minutes
  setInterval(async () => {
    if (keycloak.authenticated) {
      try {
        await keycloak.updateToken(30);
      } catch (error) {
        console.error("Token refresh failed", error);
      }
    }
  }, 5 * 60 * 1000);
}

