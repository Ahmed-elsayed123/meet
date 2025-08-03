# Socket.IO Connection Troubleshooting Guide

## Current Issue

The client is still trying to connect to `wss://meet-topaz-beta.vercel.app/socket.io/` instead of `https://meet-5tup.onrender.com`.

## Root Cause

The `vercel.json` was still configured for the old serverless approach instead of the hybrid deployment approach.

## Changes Made

### 1. Fixed vercel.json

- Changed from serverless function configuration to static file serving
- Now serves files from the `public` directory
- Removed Socket.IO routing to server.js

### 2. Enhanced Debugging

- Added comprehensive logging to `config.js`
- Created test pages (`/test.html` and `/debug.html`)
- Added cache-busting to prevent stale configurations
- Added automatic reload if wrong URL is detected

### 3. Added Debug Links

- Added "Test" and "Debug" links in the header for easy access

## Deployment Steps

### 1. Deploy to Vercel

```bash
# Commit and push your changes
git add .
git commit -m "Fix Socket.IO configuration for hybrid deployment"
git push

# Or deploy directly with Vercel CLI
vercel --prod
```

### 2. Verify Deployment

1. Visit `https://meet-topaz-beta.vercel.app/test.html`
2. Check the console logs for configuration details
3. Click "Test Connection" to verify Socket.IO connection to Render

### 3. Check Console Logs

Open browser console and look for:

- `=== Config.js Debug ===`
- `SOCKET_URL set to: https://meet-5tup.onrender.com`
- `✅ Correctly configured for Render backend`

## Expected Behavior After Fix

### Console Logs

```
=== Config.js Debug ===
Hostname: meet-topaz-beta.vercel.app
Environment: production
Selected socketUrl: https://meet-5tup.onrender.com
SOCKET_URL set to: https://meet-5tup.onrender.com
✅ Correctly configured for Render backend
```

### Network Requests

- Should see WebSocket connections to `wss://meet-5tup.onrender.com`
- Should NOT see connections to `wss://meet-topaz-beta.vercel.app`

## If Issue Persists

### 1. Clear Browser Cache

- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache and cookies
- Try incognito/private mode

### 2. Check Vercel Deployment

- Verify the new `vercel.json` is deployed
- Check Vercel deployment logs
- Ensure static files are being served correctly

### 3. Verify Render Backend

- Test `https://meet-5tup.onrender.com` directly
- Check if Socket.IO server is running
- Verify CORS configuration

### 4. Use Debug Pages

- Visit `/test.html` for connection testing
- Visit `/debug.html` for detailed configuration info
- Check console logs on both pages

## Configuration Files Summary

### vercel.json (Updated)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### public/config.js (Enhanced)

- Environment detection
- Comprehensive logging
- Cache-busting
- Auto-reload on wrong configuration

### server.js (Render Backend)

- CORS configured for Vercel domain
- Socket.IO server running on Render

## Next Steps

1. Deploy the updated configuration
2. Test the connection using `/test.html`
3. Verify console logs show correct SOCKET_URL
4. Test video call functionality
