#!/bin/bash

# Keycloak Realm and Client Setup Script for CMS Admin Web
# This script creates the 'portal' realm and 'cms-admin-web' client
# Required for the CMS Admin Web application to authenticate with Keycloak

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration - Can be overridden by environment variables
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USERNAME="${KEYCLOAK_ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
REALM_NAME="${KEYCLOAK_REALM:-portal}"
CLIENT_ID="${KEYCLOAK_CLIENT_ID:-cms-admin-web}"

# Frontend URLs - Can be overridden by environment variables
# Development URLs
DEV_URL="${DEV_URL:-http://localhost:5173}"
# Production URL (if not set, will use DEV_URL)
PROD_URL="${PROD_URL:-}"

# Function to wait for Keycloak to be ready
wait_for_keycloak() {
    print_status "Waiting for Keycloak to be ready at $KEYCLOAK_URL..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1 || \
           curl -s -f "$KEYCLOAK_URL/health" > /dev/null 2>&1; then
            print_success "Keycloak is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - Keycloak not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Keycloak failed to start within the expected time"
    return 1
}

# Function to get admin token
get_admin_token() {
    print_status "Getting admin token from master realm..."
    
    local token_response=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$ADMIN_USERNAME&password=$ADMIN_PASSWORD&grant_type=password&client_id=admin-cli")
    
    if [ $? -ne 0 ]; then
        print_error "Failed to get admin token"
        return 1
    fi
    
    local access_token=$(echo "$token_response" | jq -r '.access_token')
    
    if [ "$access_token" = "null" ] || [ -z "$access_token" ]; then
        print_error "Failed to extract access token from response"
        echo "Response: $token_response"
        return 1
    fi
    
    echo "$access_token"
}

# Function to check if realm exists
check_realm_exists() {
    local admin_token="$1"
    local realm_name="$2"
    
    local response=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$realm_name" \
        -H "Authorization: Bearer $admin_token" \
        -w "\n%{http_code}")
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        return 0  # Realm exists
    else
        return 1  # Realm doesn't exist
    fi
}

# Function to delete realm if it exists
delete_realm() {
    local admin_token="$1"
    local realm_name="$2"
    
    print_status "Deleting existing realm '$realm_name'..."
    
    local response=$(curl -s -X DELETE "$KEYCLOAK_URL/admin/realms/$realm_name" \
        -H "Authorization: Bearer $admin_token" \
        -w "\n%{http_code}")
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "204" ] || [ "$http_code" = "404" ]; then
        print_success "Realm '$realm_name' deleted or didn't exist"
        return 0
    else
        print_warning "Failed to delete realm (HTTP $http_code)"
        return 1
    fi
}

# Function to create realm
create_realm() {
    local admin_token="$1"
    
    print_status "Creating realm: $REALM_NAME"
    
    local realm_data='{
        "realm": "'$REALM_NAME'",
        "enabled": true,
        "displayName": "F3S Portal",
        "displayNameHtml": "<div class=\"kc-logo-text\"><span>F3S Portal</span></div>",
        "loginTheme": "keycloak",
        "accountTheme": "keycloak",
        "adminTheme": "keycloak",
        "emailTheme": "keycloak",
        "accessTokenLifespan": 300,
        "accessTokenLifespanForImplicitFlow": 900,
        "ssoSessionIdleTimeout": 1800,
        "ssoSessionMaxLifespan": 36000,
        "offlineSessionIdleTimeout": 2592000,
        "accessCodeLifespan": 60,
        "accessCodeLifespanUserAction": 300,
        "accessCodeLifespanLogin": 1800,
        "actionTokenGeneratedByAdminLifespan": 43200,
        "actionTokenGeneratedByUserLifespan": 300,
        "enabled": true,
        "sslRequired": "external",
        "registrationAllowed": false,
        "registrationEmailAsUsername": false,
        "rememberMe": true,
        "verifyEmail": false,
        "loginWithEmailAllowed": true,
        "duplicateEmailsAllowed": false,
        "resetPasswordAllowed": true,
        "editUsernameAllowed": false,
        "bruteForceProtected": true,
        "permanentLockout": false,
        "maxFailureWaitSeconds": 900,
        "minimumQuickLoginWaitSeconds": 60,
        "waitIncrementSeconds": 60,
        "quickLoginCheckMilliSeconds": 1000,
        "maxDeltaTimeSeconds": 43200,
        "failureFactor": 30
    }'
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $admin_token" \
        -H "Content-Type: application/json" \
        -d "$realm_data" \
        -w "\n%{http_code}")
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "201" ]; then
        print_success "Realm '$REALM_NAME' created successfully"
        return 0
    else
        print_error "Failed to create realm '$REALM_NAME' (HTTP $http_code)"
        echo "Response: $(echo "$response" | head -n -1)"
        return 1
    fi
}

# Function to check if client exists
check_client_exists() {
    local admin_token="$1"
    local realm_name="$2"
    local client_id="$3"
    
    local response=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$realm_name/clients?clientId=$client_id" \
        -H "Authorization: Bearer $admin_token")
    
    local client_count=$(echo "$response" | jq '. | length')
    
    if [ "$client_count" -gt 0 ]; then
        return 0  # Client exists
    else
        return 1  # Client doesn't exist
    fi
}

# Function to get client UUID
get_client_uuid() {
    local admin_token="$1"
    local realm_name="$2"
    local client_id="$3"
    
    local response=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$realm_name/clients?clientId=$client_id" \
        -H "Authorization: Bearer $admin_token")
    
    echo "$response" | jq -r '.[0].id // empty'
}

# Function to delete client if it exists
delete_client() {
    local admin_token="$1"
    local realm_name="$2"
    local client_id="$3"
    
    local client_uuid=$(get_client_uuid "$admin_token" "$realm_name" "$client_id")
    
    if [ -n "$client_uuid" ] && [ "$client_uuid" != "null" ]; then
        print_status "Deleting existing client '$client_id'..."
        
        local response=$(curl -s -X DELETE "$KEYCLOAK_URL/admin/realms/$realm_name/clients/$client_uuid" \
            -H "Authorization: Bearer $admin_token" \
            -w "\n%{http_code}")
        
        local http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" = "204" ]; then
            print_success "Client '$client_id' deleted successfully"
            return 0
        else
            print_warning "Failed to delete client (HTTP $http_code)"
            return 1
        fi
    else
        print_status "Client '$client_id' doesn't exist, skipping deletion"
        return 0
    fi
}

# Function to create client
create_client() {
    local admin_token="$1"
    
    print_status "Creating client: $CLIENT_ID"
    
    # Build redirect URIs array
    local redirect_uris="[\"$DEV_URL/*\", \"$DEV_URL/dashboard\", \"$DEV_URL/\"]"
    
    # Add production URL if provided
    if [ -n "$PROD_URL" ] && [ "$PROD_URL" != "" ]; then
        redirect_uris="[\"$DEV_URL/*\", \"$DEV_URL/dashboard\", \"$DEV_URL/\", \"$PROD_URL/*\", \"$PROD_URL/dashboard\", \"$PROD_URL/\"]"
    fi
    
    # Build web origins array
    local web_origins="[\"$DEV_URL\"]"
    if [ -n "$PROD_URL" ] && [ "$PROD_URL" != "" ]; then
        web_origins="[\"$DEV_URL\", \"$PROD_URL\"]"
    fi
    
    local client_data='{
        "clientId": "'$CLIENT_ID'",
        "name": "CMS Admin Web",
        "description": "CMS Admin Web Application - Single Page Application",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "protocol": "openid-connect",
        "publicClient": true,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": false,
        "serviceAccountsEnabled": false,
        "authorizationServicesEnabled": false,
        "redirectUris": '$redirect_uris',
        "webOrigins": '$web_origins',
        "attributes": {
            "pkce.code.challenge.method": "S256",
            "post.logout.redirect.uris": "'$DEV_URL'/*"
        },
        "defaultClientScopes": ["web-origins", "role_list", "profile", "roles", "email"],
        "optionalClientScopes": ["offline_access", "phone", "address"],
        "fullScopeAllowed": false,
        "nodeReRegistrationTimeout": -1,
        "defaultRoles": [],
        "consentRequired": false,
        "protocolMappers": [
            {
                "name": "username",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-property-mapper",
                "config": {
                    "user.attribute": "username",
                    "claim.name": "preferred_username",
                    "jsonType.label": "String",
                    "id.token.claim": "true",
                    "access.token.claim": "true",
                    "userinfo.token.claim": "true"
                }
            },
            {
                "name": "email",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-property-mapper",
                "config": {
                    "user.attribute": "email",
                    "claim.name": "email",
                    "jsonType.label": "String",
                    "id.token.claim": "true",
                    "access.token.claim": "true",
                    "userinfo.token.claim": "true"
                }
            },
            {
                "name": "given name",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-property-mapper",
                "config": {
                    "user.attribute": "firstName",
                    "claim.name": "given_name",
                    "jsonType.label": "String",
                    "id.token.claim": "true",
                    "access.token.claim": "true",
                    "userinfo.token.claim": "true"
                }
            },
            {
                "name": "family name",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-property-mapper",
                "config": {
                    "user.attribute": "lastName",
                    "claim.name": "family_name",
                    "jsonType.label": "String",
                    "id.token.claim": "true",
                    "access.token.claim": "true",
                    "userinfo.token.claim": "true"
                }
            },
            {
                "name": "realm roles",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-realm-role-mapper",
                "config": {
                    "claim.name": "realm_access.roles",
                    "multivalued": "true",
                    "user.attribute": "",
                    "id.token.claim": "true",
                    "access.token.claim": "true",
                    "userinfo.token.claim": "true"
                }
            }
        ]
    }'
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
        -H "Authorization: Bearer $admin_token" \
        -H "Content-Type: application/json" \
        -d "$client_data" \
        -w "\n%{http_code}")
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "201" ]; then
        print_success "Client '$CLIENT_ID' created successfully"
        
        # Enable PKCE for the client
        enable_pkce "$admin_token"
        
        return 0
    else
        print_error "Failed to create client '$CLIENT_ID' (HTTP $http_code)"
        echo "Response: $(echo "$response" | head -n -1)"
        return 1
    fi
}

# Function to enable PKCE for the client
enable_pkce() {
    local admin_token="$1"
    
    print_status "Enabling PKCE for client '$CLIENT_ID'..."
    
    local client_uuid=$(get_client_uuid "$admin_token" "$REALM_NAME" "$CLIENT_ID")
    
    if [ -z "$client_uuid" ] || [ "$client_uuid" = "null" ]; then
        print_warning "Could not find client UUID, skipping PKCE configuration"
        return 1
    fi
    
    # Update client to enable PKCE
    local pkce_data='{
        "attributes": {
            "pkce.code.challenge.method": "S256"
        }
    }'
    
    local response=$(curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$client_uuid" \
        -H "Authorization: Bearer $admin_token" \
        -H "Content-Type: application/json" \
        -d "$pkce_data" \
        -w "\n%{http_code}")
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "204" ]; then
        print_success "PKCE enabled for client '$CLIENT_ID'"
        return 0
    else
        print_warning "Failed to enable PKCE (HTTP $http_code)"
        return 1
    fi
}

# Function to display configuration summary
display_summary() {
    print_status "=========================================="
    print_status "Keycloak Configuration Summary"
    print_status "=========================================="
    echo ""
    echo "Keycloak URL:     $KEYCLOAK_URL"
    echo "Realm:            $REALM_NAME"
    echo "Client ID:        $CLIENT_ID"
    echo "Development URL:  $DEV_URL"
    if [ -n "$PROD_URL" ] && [ "$PROD_URL" != "" ]; then
        echo "Production URL:   $PROD_URL"
    fi
    echo ""
    print_status "=========================================="
    echo ""
    print_status "Environment variables for cms_admin_web:"
    echo ""
    echo "VITE_KEYCLOAK_URL=$KEYCLOAK_URL"
    echo "VITE_KEYCLOAK_REALM=$REALM_NAME"
    echo "VITE_KEYCLOAK_CLIENT_ID=$CLIENT_ID"
    echo ""
    print_status "=========================================="
}

# Main execution
main() {
    print_status "Starting Keycloak realm and client setup for CMS Admin Web..."
    echo ""
    
    # Display configuration
    display_summary
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed. Please install jq first."
        print_status "On macOS: brew install jq"
        print_status "On Ubuntu/Debian: sudo apt-get install jq"
        exit 1
    fi
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed."
        exit 1
    fi
    
    # Wait for Keycloak to be ready
    if ! wait_for_keycloak; then
        print_error "Keycloak is not available. Please ensure Keycloak is running."
        exit 1
    fi
    
    # Get admin token
    local admin_token=$(get_admin_token)
    if [ -z "$admin_token" ]; then
        print_error "Failed to get admin token. Please check your credentials."
        exit 1
    fi
    
    print_success "Admin token obtained successfully"
    echo ""
    
    # Check if realm exists and ask for deletion
    if check_realm_exists "$admin_token" "$REALM_NAME"; then
        print_warning "Realm '$REALM_NAME' already exists"
        read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            delete_realm "$admin_token" "$REALM_NAME"
            sleep 2
        else
            print_status "Skipping realm creation, using existing realm"
        fi
    fi
    
    # Create realm if it doesn't exist
    if ! check_realm_exists "$admin_token" "$REALM_NAME"; then
        create_realm "$admin_token" "$REALM_NAME"
    fi
    
    echo ""
    
    # Check if client exists and ask for deletion
    if check_client_exists "$admin_token" "$REALM_NAME" "$CLIENT_ID"; then
        print_warning "Client '$CLIENT_ID' already exists"
        read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            delete_client "$admin_token" "$REALM_NAME" "$CLIENT_ID"
            sleep 2
        else
            print_status "Skipping client creation, using existing client"
            echo ""
            display_summary
            exit 0
        fi
    fi
    
    # Create client if it doesn't exist
    if ! check_client_exists "$admin_token" "$REALM_NAME" "$CLIENT_ID"; then
        create_client "$admin_token"
    fi
    
    echo ""
    print_success "Setup completed successfully!"
    echo ""
    display_summary
    print_status "You can now use the CMS Admin Web application with Keycloak authentication."
}

# Run main function
main

