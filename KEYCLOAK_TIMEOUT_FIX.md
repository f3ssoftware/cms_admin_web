# Keycloak Timeout Error Fix

## Problem

The application was experiencing Keycloak initialization errors:
- `step1.html:1 Failed to load resource: the server responded with a status of 500 ()`
- `Timeout when waiting for 3rd party check iframe message`

## Root Cause

The Keycloak initialization was timing out due to:
1. Silent SSO check trying to use an iframe that was timing out
2. Network issues or Keycloak server problems (500 error)
3. No timeout handling, causing the app to hang

## Solution

### Changes Made

1. **Added Timeout Handling** (`src/lib/keycloak.ts`):
   - Added 10-second timeout wrapper for Keycloak initialization
   - Disabled silent SSO check (commented out `silentCheckSsoRedirectUri`)
   - Reduced `messageReceiveTimeout` to 5 seconds
   - Added error handling that allows the app to continue even if Keycloak fails

2. **Improved Error Handling** (`src/stores/auth.ts`):
   - Added 20-second timeout wrapper in auth store
   - Made initialization failures non-blocking
   - App continues to load even if Keycloak initialization fails
   - Users can still manually login

### Key Changes

```typescript
// Before: No timeout, would hang indefinitely
const authenticated = await keycloak.init({...});

// After: With timeout and error handling
const timeoutPromise = new Promise<boolean>((_, reject) => {
  setTimeout(() => {
    reject(new Error("Keycloak initialization timeout"));
  }, 10000);
});

const authenticated = await Promise.race([initPromise, timeoutPromise])
  .catch(() => false);
```

## Behavior After Fix

1. **If Keycloak is available**: Normal authentication flow works
2. **If Keycloak times out**: 
   - App still loads
   - User sees login page
   - User can manually click "Sign in with Keycloak"
   - No blocking errors

## Testing

To verify the fix works:

1. **Normal case**: App should initialize Keycloak successfully
2. **Timeout case**: If Keycloak server is down, app should:
   - Log a warning (not an error)
   - Continue loading
   - Show login page
   - Allow manual login attempt

## Additional Notes

- The silent SSO check is disabled to prevent iframe timeout issues
- The app is now more resilient to Keycloak server issues
- Users can still authenticate manually if automatic check fails
- All errors are logged but don't block app initialization

## Future Improvements

If you want to re-enable silent SSO check:
1. Ensure Keycloak server is stable and accessible
2. Verify CORS is properly configured
3. Test the `silent-check-sso.html` file is accessible
4. Uncomment `silentCheckSsoRedirectUri` in `keycloak.ts`

