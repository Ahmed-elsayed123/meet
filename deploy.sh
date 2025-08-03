#!/bin/bash

# 🚀 Video Call App Deployment Script for Render
# This script helps prepare your app for deployment

echo "🚀 Preparing Video Call App for Render Deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if files exist
echo "📋 Checking required files..."

if [ ! -f "server.js" ]; then
    echo "❌ server.js not found!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found!"
    exit 1
fi

if [ ! -d "public" ]; then
    echo "❌ public/ directory not found!"
    exit 1
fi

echo "✅ All required files found!"

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    echo ""
    echo "Or continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Push your code to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Go to Render Dashboard:"
echo "   https://dashboard.render.com"
echo ""
echo "3. Click 'New +' → 'Blueprint'"
echo ""
echo "4. Connect your GitHub repository"
echo ""
echo "5. Render will automatically detect render.yaml and deploy"
echo ""
echo "6. Your app will be available at:"
echo "   https://your-app-name.onrender.com"
echo ""
echo "📝 Don't forget to:"
echo "   - Update Firebase authorized domains"
echo "   - Configure environment variables if needed"
echo "   - Test the deployment"
echo ""
echo "🔗 Useful links:"
echo "   - Render Docs: https://docs.render.com"
echo "   - Firebase Console: https://console.firebase.google.com"
echo ""
echo "Good luck! 🍀" 