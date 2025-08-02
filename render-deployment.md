# Render + Vercel Hybrid Deployment Guide

## Overview
This guide shows how to deploy your Socket.IO server on Render (for better WebSocket support) and connect it to a Vercel frontend.

## Step 1: Deploy Server on Render

### 1.1 Prepare Server for Render
Create a `render.yaml` file for easy deployment:

```yaml
services:
  - type: web
    name: video-call-server
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 1.2 Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `video-call-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### 1.3 Get Your Render URL
After deployment, you'll get a URL like:
`https://your-app-name.onrender.com`

## Step 2: Update Frontend for Render Backend

### 2.1 Update Client Configuration
Modify `public/client.js` to connect to your Render server:

```javascript
// Replace the Socket.IO connection
this.socket = io('https://your-app-name.onrender.com', {
  transports: ['websocket', 'polling'],
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
  forceNew: true
});
```

### 2.2 Create Environment-Specific Config
Create `public/config.js`:

```javascript
const config = {
  development: {
    socketUrl: 'http://localhost:3000'
  },
  production: {
    socketUrl: 'https://your-app-name.onrender.com'
  }
};

const env = window.location.hostname === 'localhost' ? 'development' : 'production';
window.SOCKET_URL = config[env].socketUrl;
```

Update `public/index.html` to include this config:

```html
<script src="/config.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script src="/client.js"></script>
```

Then update `public/client.js`:

```javascript
this.socket = io(window.SOCKET_URL, {
  transports: ['websocket', 'polling'],
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
  forceNew: true
});
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare for Vercel
Since you're using Render for the server, you can simplify your Vercel deployment:

1. Remove or rename `api/socket.js` (not needed)
2. Update `vercel.json`:

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

### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Deploy (Vercel will auto-detect it's a static site)

## Step 4: Configure CORS

Update your `server.js` to allow your Vercel domain:

```javascript
const io = new Server(server, {
  cors: {
    origin: [
      "https://your-vercel-app.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## Step 5: Test the Connection

1. Open your Vercel app
2. Open browser console
3. Check for Socket.IO connection success
4. Test video call functionality

## Troubleshooting

### CORS Issues
If you see CORS errors:
1. Ensure your Vercel domain is in the CORS origin list
2. Check that credentials are properly configured

### Connection Issues
1. Verify your Render server is running
2. Check the Socket.IO URL in your client config
3. Ensure WebSocket connections are allowed

### Render Free Tier Limitations
- Free tier has cold starts (first request may be slow)
- Consider upgrading for production use

## Benefits of This Approach

✅ **Better WebSocket Support**: Render provides persistent WebSocket connections
✅ **Cost Effective**: Free tier available on both platforms
✅ **Scalable**: Easy to upgrade either service independently
✅ **Reliable**: Each platform optimized for its specific use case

## Environment Variables

### Render Environment Variables
- `NODE_ENV`: production
- `PORT`: 10000 (Render's default)

### Vercel Environment Variables
- `SOCKET_URL`: Your Render server URL (optional, can be hardcoded)

## Monitoring

- **Render**: Check logs in Render dashboard
- **Vercel**: Check deployment status in Vercel dashboard
- **Client**: Monitor browser console for connection status 