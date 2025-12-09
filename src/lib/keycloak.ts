/**
 * Keycloak Service
 * Using Direct Access Grants (Resource Owner Password Credentials) flow
 * WARNING: This is simpler but less secure than PKCE. Client secret should NOT be in frontend code.
 * For production, consider using PKCE with proper CORS configuration instead.
 */

import { CONFIG } from "@/constants";

// Token storage
let accessToken: string | null = null;
let refreshTokenValue: string | null = null;
let tokenExpiry: number = 0;
let userInfo: any = null;

// Get token endpoint URL
// In development, use Vite proxy to avoid CORS issues
function getTokenUrl(): string {
  const isDevelopment = import.meta.env.DEV;
  const keycloakUrl = isDevelopment 
    ? '/api/keycloak'  // Use Vite proxy in development
    : CONFIG.keycloak.url;  // Use direct URL in production
  
  return `${keycloakUrl}/realms/${CONFIG.keycloak.realm}/protocol/openid-connect/token`;
}

// Make authenticated request to Keycloak
async function keycloakRequest(username: string, password: string): Promise<any> {
  const formData = new URLSearchParams();
  formData.append("grant_type", "password");
  formData.append("client_id", CONFIG.keycloak.clientId);
  formData.append("username", username);
  formData.append("password", password);
  
  // Only add client_secret if it's configured (for confidential clients)
  if (CONFIG.keycloak.clientSecret) {
    formData.append("client_secret", CONFIG.keycloak.clientSecret);
  }

  const response = await fetch(getTokenUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: "Unknown error", error_description: errorText };
    }
    throw new Error(error.error_description || error.error || "Authentication failed");
  }

  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error("Failed to parse response as JSON:", responseText);
    throw new Error("Invalid response format from Keycloak");
  }
}

// Initialize Keycloak - check for existing token
export async function initKeycloak(): Promise<boolean> {
  try {
    // Check if we have a stored token
    const storedToken = localStorage.getItem("keycloak_token");
    const storedRefresh = localStorage.getItem("keycloak_refresh_token");
    const storedExpiry = localStorage.getItem("keycloak_token_expiry");
    const storedUser = localStorage.getItem("keycloak_user");

    if (storedToken && storedRefresh && storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      // If token is still valid (with 30 second buffer), use it
      if (expiry > Date.now() + 30000) {
        accessToken = storedToken;
        refreshTokenValue = storedRefresh;
        tokenExpiry = expiry;
        if (storedUser) {
          userInfo = JSON.parse(storedUser);
        }
        return true;
      } else {
        // Try to refresh the token
        return await refreshToken();
      }
    }

    return false;
  } catch (error) {
    console.error("Failed to initialize Keycloak", error);
    return false;
  }
}

// Login function - using Direct Access Grants (username/password)
export async function loginKeycloak(username: string, password: string): Promise<void> {
  try {
    const tokenData = await keycloakRequest(username, password);
    
    // Debug: Log token data structure
    console.log("Token data received:", {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
    
    // Store tokens
    accessToken = tokenData.access_token;
    refreshTokenValue = tokenData.refresh_token || null;
    
    // Calculate token expiry (expires_in is in seconds)
    tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
    
    // Decode and store user info
    if (accessToken) {
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3 && tokenParts[1]) {
          // Decode base64 payload (add padding if needed)
          let base64Payload = tokenParts[1];
          // Add padding if necessary
          while (base64Payload.length % 4) {
            base64Payload += '=';
          }
          const payload = JSON.parse(atob(base64Payload));
          userInfo = {
            id: payload.sub || "",
            username: (payload.preferred_username || payload.username || username) as string,
            email: (payload.email || "") as string,
            firstName: (payload.given_name || "") as string,
            lastName: (payload.family_name || "") as string,
            roles: (payload.realm_access?.roles || []) as string[],
          };
        } else {
          // If token format is invalid, create minimal user info from username
          console.warn("Token format invalid, creating minimal user info");
          userInfo = {
            id: "",
            username: username,
            email: "",
            firstName: "",
            lastName: "",
            roles: [],
          };
        }
      } catch (parseError) {
        // If JWT parsing fails, create minimal user info so authentication can proceed
        console.warn("Failed to parse JWT token, creating minimal user info:", parseError);
        userInfo = {
          id: "",
          username: username,
          email: "",
          firstName: "",
          lastName: "",
          roles: [],
        };
      }
    }
    
    // Store in localStorage
    localStorage.setItem("keycloak_token", accessToken || "");
    localStorage.setItem("keycloak_refresh_token", refreshTokenValue || "");
    localStorage.setItem("keycloak_token_expiry", tokenExpiry.toString());
    if (userInfo) {
      localStorage.setItem("keycloak_user", JSON.stringify(userInfo));
    }
    
    // Debug: Log authentication state
    console.log("Login successful:", {
      hasAccessToken: !!accessToken,
      hasUserInfo: !!userInfo,
      userInfo: userInfo,
      isAuthenticated: isAuthenticated(),
    });
  } catch (error: any) {
    console.error("Failed to login with Keycloak", error);
    
    // Provide helpful error message
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network Error: Unable to connect to Keycloak. " +
        "Please check your network connection and Keycloak server configuration."
      );
    }
    
    throw new Error(error.message || "Authentication failed");
  }
}

// Logout function
export async function logoutKeycloak(): Promise<void> {
  try {
    // Store refresh token before clearing (for logout request)
    const currentRefreshToken = refreshTokenValue;
    
    // Clear tokens
    accessToken = null;
    refreshTokenValue = null;
    tokenExpiry = 0;
    userInfo = null;
    
    // Clear localStorage
    localStorage.removeItem("keycloak_token");
    localStorage.removeItem("keycloak_refresh_token");
    localStorage.removeItem("keycloak_token_expiry");
    localStorage.removeItem("keycloak_user");
    
    // Optionally revoke token on server
    if (currentRefreshToken) {
      try {
        const formData = new URLSearchParams();
        formData.append("client_id", CONFIG.keycloak.clientId);
        if (CONFIG.keycloak.clientSecret) {
          formData.append("client_secret", CONFIG.keycloak.clientSecret);
        }
        formData.append("refresh_token", currentRefreshToken);
        
        // Use proxy in development, direct URL in production
        const isDevelopment = import.meta.env.DEV;
        const keycloakUrl = isDevelopment 
          ? '/api/keycloak'  // Use Vite proxy in development
          : CONFIG.keycloak.url;  // Use direct URL in production
        
        await fetch(`${keycloakUrl}/realms/${CONFIG.keycloak.realm}/protocol/openid-connect/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });
      } catch (error) {
        // Ignore logout errors - tokens are cleared locally anyway
        console.warn("Failed to revoke token on server", error);
      }
    }
  } catch (error) {
    console.error("Failed to logout from Keycloak", error);
    throw error;
  }
}

// Get user info
export function getUserInfo() {
  return userInfo;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return accessToken !== null && tokenExpiry > Date.now();
}

// Get access token
export function getAccessToken(): string | null {
  return accessToken;
}

// Refresh token
export async function refreshToken(): Promise<boolean> {
  try {
    if (!refreshTokenValue) {
      return false;
    }

    const formData = new URLSearchParams();
    formData.append("grant_type", "refresh_token");
    formData.append("client_id", CONFIG.keycloak.clientId);
    formData.append("refresh_token", refreshTokenValue);
    
    if (CONFIG.keycloak.clientSecret) {
      formData.append("client_secret", CONFIG.keycloak.clientSecret);
    }

    const response = await fetch(getTokenUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      // Refresh failed - clear tokens
      await logoutKeycloak();
      return false;
    }

    const tokenData = await response.json();
    
    // Update tokens
    accessToken = tokenData.access_token;
    refreshTokenValue = tokenData.refresh_token || null;
    tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
    
    // Update localStorage
    localStorage.setItem("keycloak_token", accessToken || "");
    localStorage.setItem("keycloak_refresh_token", refreshTokenValue || "");
    localStorage.setItem("keycloak_token_expiry", tokenExpiry.toString());
    
    return true;
  } catch (error) {
    console.error("Failed to refresh token", error);
    await logoutKeycloak();
    return false;
  }
}

// Set up token refresh interval
export function setupTokenRefresh() {
  // Refresh token every 5 minutes
  setInterval(async () => {
    if (isAuthenticated()) {
      try {
        await refreshToken();
      } catch (error) {
        console.error("Token refresh failed", error);
      }
    }
  }, 5 * 60 * 1000);
}

