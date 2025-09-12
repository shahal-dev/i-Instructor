# 🔧 Environment Variables Setup Guide

This guide helps you set up all the required environment variables for the i-Instructor application.

## 📋 Quick Setup

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the .env file with your values**

## 🔥 Firebase Configuration

### Get Your Firebase Config:

1. **Go to Firebase Console:**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create a new one)

2. **Get Web App Config:**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click on your web app or create one
   - Copy the config values

3. **Your Firebase config will look like:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef...",
     measurementId: "G-XXXXXXXXXX" // Optional
   };
   ```

## 📝 Environment Variables Mapping

### Backend Variables (server/.env or root .env):
```bash
# Server Configuration
NODE_ENV=production
PORT=3004
JWT_SECRET=your-super-secure-jwt-secret-here

# Backend Firebase (for server-side validation)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=AIzaSyC...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef...
```

### Frontend Variables (root .env - must have VITE_ prefix):
```bash
# Frontend Firebase (for client-side)
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# API Configuration
VITE_API_URL=http://localhost:3004  # Local development
VITE_SOCKET_URL=http://localhost:3004  # Local development

# For production, use your deployed domain:
# VITE_API_URL=https://your-app.railway.app
# VITE_SOCKET_URL=https://your-app.railway.app
```

## 🔐 Generate JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🌍 Environment-Specific Configs

### Development (.env):
```bash
NODE_ENV=development
VITE_API_URL=http://localhost:3004
VITE_SOCKET_URL=http://localhost:3004
```

### Production (hosting platform):
```bash
NODE_ENV=production
VITE_API_URL=https://your-domain.com
VITE_SOCKET_URL=https://your-domain.com
```

## 🚀 Platform-Specific Setup

### Railway:
1. Go to Railway dashboard
2. Select your project
3. Go to "Variables" tab
4. Add each environment variable

### Render:
1. Go to Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add environment variables

### Heroku:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set VITE_FIREBASE_API_KEY=your-key
# ... add all other variables
```

### Vercel (Frontend only):
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add only VITE_ prefixed variables

## ✅ Validation

The app will validate Firebase configuration on startup. Check the browser console for any missing configuration errors.

### Test Your Setup:
1. **Start the development server:**
   ```bash
   npm run dev  # Frontend
   cd server && npm run dev  # Backend
   ```

2. **Check for errors:**
   - Open browser console
   - Look for Firebase configuration errors
   - Test Google sign-in functionality

## 🔍 Troubleshooting

### Common Issues:

1. **"Missing Firebase configuration" error:**
   - Ensure all VITE_FIREBASE_* variables are set
   - Check for typos in variable names

2. **"Firebase app not initialized" error:**
   - Verify VITE_FIREBASE_PROJECT_ID is correct
   - Check Firebase project is active

3. **API calls failing:**
   - Verify VITE_API_URL is correct
   - Check if backend server is running

4. **Authentication not working:**
   - Verify Firebase Auth domain in Firebase Console
   - Check authorized domains include your deployment URL

### Debug Commands:
```bash
# Check environment variables are loaded
npm run dev  # Look for console.log in firebase.ts

# Test Firebase connection
# Open browser console and check for Firebase errors
```

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)

Ready to configure your environment! 🎉
