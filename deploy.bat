@echo off
echo 🚀 Preparing Video Call App for Render Deployment...
echo.

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    pause
    exit /b 1
)

REM Check if files exist
echo 📋 Checking required files...

if not exist "server.js" (
    echo ❌ server.js not found!
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ package.json not found!
    pause
    exit /b 1
)

if not exist "render.yaml" (
    echo ❌ render.yaml not found!
    pause
    exit /b 1
)

if not exist "public" (
    echo ❌ public/ directory not found!
    pause
    exit /b 1
)

echo ✅ All required files found!
echo.

echo 🎯 Next Steps:
echo.
echo 1. Push your code to GitHub:
echo    git push origin main
echo.
echo 2. Go to Render Dashboard:
echo    https://dashboard.render.com
echo.
echo 3. Click "New +" ^> "Blueprint"
echo.
echo 4. Connect your GitHub repository
echo.
echo 5. Render will automatically detect render.yaml and deploy
echo.
echo 6. Your app will be available at:
echo    https://your-app-name.onrender.com
echo.
echo 📝 Don't forget to:
echo    - Update Firebase authorized domains
echo    - Configure environment variables if needed
echo    - Test the deployment
echo.
echo 🔗 Useful links:
echo    - Render Docs: https://docs.render.com
echo    - Firebase Console: https://console.firebase.google.com
echo.
echo Good luck! 🍀
pause 