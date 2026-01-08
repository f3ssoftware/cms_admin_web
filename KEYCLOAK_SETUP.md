# Keycloak Realm and Client Setup

This document explains how to set up the Keycloak realm and client for the CMS Admin Web application.

## Prerequisites

1. **Keycloak must be running** and accessible
2. **jq** must be installed (for JSON parsing)
   - macOS: `brew install jq`
   - Ubuntu/Debian: `sudo apt-get install jq`
   - Windows: Download from https://stedolan.github.io/jq/download/
3. **curl** must be installed (usually pre-installed on Linux/macOS)

## Quick Start

### Basic Usage (Default Configuration)

```bash
cd cms_admin_web
./setup-keycloak-realm.sh
```

This will use the default configuration:
- Keycloak URL: `http://localhost:8080`
- Admin username: `admin`
- Admin password: `admin`
- Realm: `portal`
- Client ID: `cms-admin-web`
- Development URL: `http://localhost:5173`

### Custom Configuration

You can override any configuration using environment variables:

```bash
# Set custom Keycloak URL
export KEYCLOAK_URL="https://auth.f3ssoftware.com"

# Set custom admin credentials
export KEYCLOAK_ADMIN_USERNAME="admin"
export KEYCLOAK_ADMIN_PASSWORD="your-password"

# Set custom realm and client
export KEYCLOAK_REALM="portal"
export KEYCLOAK_CLIENT_ID="cms-admin-web"

# Set development and production URLs
export DEV_URL="http://localhost:5173"
export PROD_URL="https://cms.f3ssoftware.com"

# Run the script
./setup-keycloak-realm.sh
```

### Example: Production Setup

```bash
export KEYCLOAK_URL="https://auth.f3ssoftware.com"
export KEYCLOAK_ADMIN_USERNAME="admin"
export KEYCLOAK_ADMIN_PASSWORD="secure-password"
export DEV_URL="http://localhost:5173"
export PROD_URL="https://cms.f3ssoftware.com"

./setup-keycloak-realm.sh
```

## What the Script Does

1. **Checks Keycloak availability** - Waits for Keycloak to be ready
2. **Authenticates** - Gets admin token from master realm
3. **Creates Realm** - Creates the `portal` realm with appropriate settings:
   - Enables login with email
   - Configures token lifespans
   - Enables brute force protection
   - Sets SSL requirements
4. **Creates Client** - Creates the `cms-admin-web` client as a public client (SPA):
   - Configures redirect URIs for development and production
   - Sets web origins for CORS
   - Enables PKCE with S256 method
   - Configures protocol mappers for user claims (username, email, name, roles)
   - Sets default client scopes

## Configuration Details

### Realm Settings

- **Realm Name**: `portal`
- **Display Name**: "F3S Portal"
- **Access Token Lifespan**: 5 minutes (300 seconds)
- **SSO Session Idle Timeout**: 30 minutes
- **SSO Session Max Lifespan**: 10 hours
- **Brute Force Protection**: Enabled
- **SSL Required**: External (production)
- **Registration**: Disabled
- **Email Verification**: Disabled
- **Login with Email**: Allowed

### Client Settings

- **Client ID**: `cms-admin-web`
- **Client Type**: Public Client (SPA)
- **PKCE**: Enabled with S256 method
- **Standard Flow**: Enabled (Authorization Code Flow)
- **Implicit Flow**: Disabled
- **Direct Access Grants**: Disabled (no password grant)
- **Service Accounts**: Disabled

### Redirect URIs

The script configures redirect URIs for:
- Development: `http://localhost:5173/*`, `http://localhost:5173/dashboard`, `http://localhost:5173/`
- Production: (if `PROD_URL` is set) Same patterns with production URL

### Web Origins

Configured for CORS:
- Development: `http://localhost:5173`
- Production: (if `PROD_URL` is set) Production URL

### Protocol Mappers

The client includes protocol mappers for:
- `preferred_username` - Maps to username
- `email` - Maps to email
- `given_name` - Maps to firstName
- `family_name` - Maps to lastName
- `realm_access.roles` - Maps to realm roles

## Environment Variables for CMS Admin Web

After running the script, configure your `.env` file in `cms_admin_web`:

```bash
# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=portal
VITE_KEYCLOAK_CLIENT_ID=cms-admin-web
# Leave empty for public clients (PKCE is used)
VITE_KEYCLOAK_CLIENT_SECRET=
```

## Verification

After running the script, verify the setup:

1. **Check Realm**: Visit `http://localhost:8080/admin` and navigate to the `portal` realm
2. **Check Client**: In the realm, go to Clients and verify `cms-admin-web` exists
3. **Test Login**: Try logging in to the CMS Admin Web application

## Troubleshooting

### Keycloak Not Ready

If you see "Keycloak failed to start within the expected time":
- Ensure Keycloak is running: `docker ps | grep keycloak`
- Check Keycloak logs: `docker logs keycloak`
- Verify the URL is correct: `curl http://localhost:8080/health/ready`

### Authentication Failed

If you see "Failed to get admin token":
- Verify admin credentials are correct
- Check if Keycloak master realm is accessible
- Try logging in manually at `http://localhost:8080/admin`

### Client Already Exists

If the client already exists:
- The script will ask if you want to delete and recreate it
- Answer `y` to recreate, or `N` to skip

### Realm Already Exists

If the realm already exists:
- The script will ask if you want to delete and recreate it
- **Warning**: Deleting a realm will remove all users, clients, and configurations
- Answer `y` to recreate, or `N` to skip

## Manual Configuration

If you prefer to configure Keycloak manually:

1. **Create Realm**:
   - Go to Keycloak Admin Console
   - Click "Create Realm"
   - Name: `portal`
   - Click "Create"

2. **Create Client**:
   - Go to Clients → Create Client
   - Client ID: `cms-admin-web`
   - Client type: OpenID Connect
   - Click "Next"
   - Client authentication: Off (Public client)
   - Authorization: Off
   - Login settings:
     - Root URL: `http://localhost:5173`
     - Home URL: `http://localhost:5173`
     - Valid redirect URIs: `http://localhost:5173/*`
     - Web origins: `http://localhost:5173`
   - Click "Save"
   - Go to Advanced tab
   - PKCE Code Challenge Method: `S256`
   - Click "Save"

3. **Configure Protocol Mappers**:
   - Go to Client Scopes → `cms-admin-web-dedicated` → Mappers
   - Add mappers for: username, email, given_name, family_name, realm roles

## Security Notes

- **Public Client**: The client is configured as a public client (no client secret) which is appropriate for SPAs
- **PKCE**: PKCE (Proof Key for Code Exchange) is enabled for additional security
- **HTTPS**: In production, ensure Keycloak and your application use HTTPS
- **CORS**: Web origins are configured to prevent unauthorized cross-origin requests
- **Token Lifespan**: Access tokens expire after 5 minutes for security

## Next Steps

After setting up Keycloak:

1. **Create Users**: Create users in the `portal` realm
2. **Assign Roles**: (Optional) Create and assign roles to users
3. **Configure Environment**: Set up `.env` file with Keycloak configuration
4. **Test Authentication**: Test login/logout in the CMS Admin Web application

## Support

For issues or questions:
- Check Keycloak logs: `docker logs keycloak`
- Review Keycloak documentation: https://www.keycloak.org/documentation
- Check application console for authentication errors

