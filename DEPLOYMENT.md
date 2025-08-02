# Video Call App Deployment Guide

This guide covers multiple deployment options for your video call application.

## Prerequisites

- Node.js 16+ installed
- Git repository set up
- Account on your chosen deployment platform

## Deployment Options

### 1. Heroku (Recommended for beginners)

**Steps:**

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Login to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create your-app-name`
4. Deploy: `git push heroku main`
5. Open your app: `heroku open`

**Alternative (using Heroku Dashboard):**

1. Go to https://dashboard.heroku.com/
2. Click "New" → "Create new app"
3. Connect your GitHub repository
4. Enable automatic deploys

### 2. Vercel (Fast and easy)

**Steps:**

1. Go to https://vercel.com/
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Deploy automatically

**Using Vercel CLI:**

```bash
npm i -g vercel
vercel login
vercel
```

**⚠️ Important: Socket.IO on Vercel**

The app has been configured to work with Vercel's serverless environment. Key changes made:

- Added Socket.IO serverless function in `api/socket.js`
- Updated client configuration for better WebSocket handling
- Enhanced server configuration with proper timeouts and transport options
- Updated `vercel.json` with Socket.IO routing

If you experience connection issues:

1. Ensure the `api/socket.js` file is deployed
2. Check that WebSocket connections are allowed
3. Consider using Railway or Heroku for better Socket.IO support

### 3. Railway (Simple and reliable)

**Steps:**

1. Go to https://railway.app/
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Deploy automatically

### 4. Render (Free tier available)

**Steps:**

1. Go to https://render.com/
2. Sign up/Login
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Deploy

### 5. DigitalOcean App Platform

**Steps:**

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect your GitHub repository
4. Configure build settings
5. Deploy

### 6. Docker Deployment

**Local Docker:**

```bash
# Build and run locally
docker build -t video-call-app .
docker run -p 3000:3000 video-call-app

# Using Docker Compose
docker-compose up -d
```

**Docker on cloud platforms:**

- **Google Cloud Run**: Upload container and deploy
- **AWS ECS**: Use the Dockerfile to create a task definition
- **Azure Container Instances**: Deploy the container directly

### 7. Traditional VPS (DigitalOcean, AWS EC2, etc.)

**Steps:**

1. Set up a VPS with Ubuntu/CentOS
2. Install Node.js and PM2
3. Clone your repository
4. Install dependencies: `npm install --production`
5. Use PM2 to run: `pm2 start server.js --name video-call-app`
6. Set up Nginx as reverse proxy (optional)
7. Configure firewall and SSL

## Environment Variables

Set these in your deployment platform:

```bash
NODE_ENV=production
PORT=3000  # Most platforms set this automatically
```

## Important Notes

1. **WebRTC Requirements**: Your app uses WebRTC which requires HTTPS in production
2. **Socket.IO**: Works with most platforms, but some may require specific configuration
3. **CORS**: The app is configured to accept connections from any origin (`*`)
4. **Port**: The app uses `process.env.PORT` which most platforms set automatically

## Testing Your Deployment

After deployment:

1. Open your app URL
2. Create a room
3. Open another browser/incognito window
4. Join the same room
5. Test video/audio functionality

## Troubleshooting

**Common Issues:**

- **Port issues**: Ensure your platform sets the PORT environment variable
- **CORS errors**: Check if your platform requires specific CORS configuration
- **WebRTC not working**: Ensure HTTPS is enabled
- **Socket.IO connection issues**: Some platforms require specific Socket.IO configuration

**Socket.IO Connection Issues:**

If you see WebSocket connection errors:

1. Check browser console for specific error messages
2. Ensure your deployment platform supports WebSockets
3. Try refreshing the page
4. Check if the Socket.IO server is running properly
5. For Vercel: Ensure the `api/socket.js` function is deployed

**Logs:**

- Heroku: `heroku logs --tail`
- Vercel: Check deployment logs in dashboard
- Railway: View logs in dashboard
- Docker: `docker logs <container-id>`

## Security Considerations

For production use, consider:

1. Adding authentication
2. Implementing rate limiting
3. Using environment variables for sensitive data
4. Setting up proper CORS policies
5. Adding input validation
6. Implementing room access controls
