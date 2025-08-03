# 🚀 Deploy Video Call App to Render

This guide will help you deploy your video call application to Render.

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Firebase Project**: Make sure your Firebase configuration is set up

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your repository has these files:
- `server.js` - Main server file
- `package.json` - Dependencies and scripts
- `render.yaml` - Render configuration
- `public/` folder - Static files (HTML, CSS, JS)

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Automatic Deployment**:
   - Render will create the service automatically
   - The app will be deployed to: `https://your-app-name.onrender.com`

#### Option B: Manual Setup

1. **Create Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `video-call-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Starter` (Free tier)

3. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

### 3. Update Firebase Configuration

After deployment, update your Firebase configuration in `public/meeting-room.html`:

```javascript
// Update the Firebase config with your production settings
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 4. Configure Firebase Authentication

1. **Add Authorized Domains**:
   - Go to Firebase Console → Authentication → Settings
   - Add your Render domain: `your-app-name.onrender.com`

2. **Update OAuth Redirect URLs**:
   - Add: `https://your-app-name.onrender.com/__/auth/handler`

## 🔍 Health Check

Your app includes a health check endpoint at `/health`. Render will use this to monitor the service.

## 📊 Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor performance and usage
- **Health**: Automatic health checks every 30 seconds

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check `package.json` has all required dependencies
   - Verify Node.js version compatibility

2. **Runtime Errors**:
   - Check logs in Render dashboard
   - Verify environment variables are set

3. **Firebase Issues**:
   - Ensure authorized domains are configured
   - Check Firebase project settings

4. **WebRTC Issues**:
   - Verify HTTPS is enabled (Render provides this)
   - Check browser console for errors

### Debug Commands:

```bash
# Check health
curl https://your-app-name.onrender.com/health

# Check rooms
curl https://your-app-name.onrender.com/api/rooms
```

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch. To disable:
- Go to service settings → "Auto-Deploy" → Turn off

## 💰 Costs

- **Starter Plan**: Free (with limitations)
- **Standard Plan**: $7/month (recommended for production)

## 📞 Support

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)

## 🎉 Success!

Once deployed, your video call app will be available at:
`https://your-app-name.onrender.com`

Users can:
- Sign up/login with Firebase authentication
- Create and join video meetings
- Use real-time video/audio communication
- Share screen and chat
