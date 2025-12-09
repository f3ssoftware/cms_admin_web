# Convex Setup Guide

This guide will help you set up Convex for the CMS Admin Web application.

## Quick Start

1. **Install Convex CLI** (if not already installed):
   ```bash
   npm install -g convex
   ```

2. **Login to Convex**:
   ```bash
   npx convex login
   ```

3. **Initialize Convex in this project**:
   ```bash
   cd cms_admin_web
   npx convex dev
   ```

   This will:
   - Create a new Convex project (or link to an existing one)
   - Generate the necessary configuration files
   - Deploy your schema and functions
   - Provide you with a deployment URL

4. **Get your Convex deployment URL**:
   After running `npx convex dev`, you'll receive a deployment URL like:
   ```
   https://your-project-name.convex.cloud
   ```

5. **Set the Convex URL in your .env file**:
   
   Open the `.env` file in the `cms_admin_web` directory and update:
   ```env
   VITE_CONVEX_URL=https://your-project-name.convex.cloud
   ```

6. **Restart your development server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Error: "VITE_CONVEX_URL is not set"

**Solution:**
1. Make sure you have a `.env` file in the `cms_admin_web` directory
2. Add `VITE_CONVEX_URL=https://your-deployment.convex.cloud` to the `.env` file
3. Restart your development server (Vite needs to be restarted to pick up new env variables)

### Error: "Invalid deployment address"

**Solution:**
- Make sure your `VITE_CONVEX_URL` starts with `https://` or `http://`
- The URL should look like: `https://your-project.convex.cloud`
- Don't include trailing slashes

### Error: "Convex client is not initialized"

**Solution:**
- Check that `VITE_CONVEX_URL` is set correctly in your `.env` file
- Make sure the URL is valid and starts with `https://`
- Restart your development server after changing `.env`

## Development vs Production

### Development

For local development, use:
```bash
npx convex dev
```

This will:
- Watch for changes in your `convex/` directory
- Automatically deploy updates
- Provide real-time logs
- Use a development deployment URL

### Production

For production deployment:
```bash
npx convex deploy --prod
```

Then update your production `.env` file with the production deployment URL.

## Environment Variables

The following environment variables are required:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CONVEX_URL` | Your Convex deployment URL | `https://your-project.convex.cloud` |
| `VITE_KEYCLOAK_URL` | Keycloak server URL | `http://localhost:8080` |
| `VITE_KEYCLOAK_REALM` | Keycloak realm name | `portal` |
| `VITE_KEYCLOAK_CLIENT_ID` | Keycloak client ID | `cms-admin-web` |

## Verifying Setup

After setting up Convex, you should:

1. **Check the browser console** - There should be no errors about Convex URL
2. **Check the Network tab** - You should see requests to your Convex deployment
3. **Test a feature** - Try creating a category or viewing news articles

## Next Steps

Once Convex is set up:

1. **Deploy your schema**: Your schema is already defined in `convex/schema.ts`
2. **Test your functions**: Try using the categories or news features
3. **Set up authentication**: Make sure Keycloak is configured (see Keycloak setup docs)

## Need Help?

- **Convex Documentation**: https://docs.convex.dev
- **Convex Dashboard**: https://dashboard.convex.dev
- **Check your deployment**: Visit your Convex dashboard to see your deployment status



