# ⚡ Quick Deploy to Render

## 🚀 One-Click Deployment

1. **Run the deployment script:**
   ```bash
   # Windows
   deploy.bat
   
   # Mac/Linux
   ./deploy.sh
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Deploy automatically! 🎉

## 📋 Required Files Checklist

- ✅ `server.js` - Main server
- ✅ `package.json` - Dependencies
- ✅ `render.yaml` - Render config
- ✅ `public/` - Static files
- ✅ Git repository

## 🔧 Post-Deployment Setup

1. **Update Firebase:**
   - Add domain: `your-app-name.onrender.com`
   - Update authorized domains

2. **Test the app:**
   - Visit: `https://your-app-name.onrender.com`
   - Create a meeting room
   - Test video/audio

## 🆘 Need Help?

- **Deployment Guide**: See `DEPLOYMENT.md`
- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)

## 💡 Pro Tips

- Use the **Starter Plan** (free) for testing
- **Standard Plan** ($7/month) for production
- Enable **Auto-Deploy** for continuous updates
- Monitor logs in Render dashboard 