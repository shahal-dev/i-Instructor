# 🚀 Deployment Guide for i-Instructor

This guide covers deploying the i-Instructor application to various hosting platforms using Docker.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Firebase project set up
- Environment variables configured

## 🌐 Deployment Options

### 1. Railway Deployment (Recommended)

Railway offers free hosting with automatic deployments from GitHub.

#### Steps:

1. **Connect to Railway:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   ```

2. **Deploy:**
   ```bash
   # Initialize Railway project
   railway init
   
   # Deploy
   railway up
   ```

3. **Set Environment Variables:**
   In Railway dashboard, add these environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secure-jwt-secret
   
   # Backend Firebase Configuration
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_API_KEY=your-firebase-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=your-firebase-app-id
   
   # Frontend Firebase Configuration (Vite variables)
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # API Configuration
   VITE_API_URL=https://your-railway-domain.railway.app
   VITE_SOCKET_URL=https://your-railway-domain.railway.app
   ```

4. **Custom Domain (Optional):**
   Configure your custom domain in Railway dashboard.

### 2. Render Deployment

1. **Connect GitHub Repository**
2. **Configure Build Settings:**
   - Build Command: `docker build -t i-instructor .`
   - Start Command: `docker run -p $PORT:3004 i-instructor`
3. **Add Environment Variables** (same as Railway)

### 3. Heroku Deployment

1. **Install Heroku CLI**
2. **Create Heroku App:**
   ```bash
   heroku create your-app-name
   heroku stack:set container
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secure-jwt-secret
   # ... add other variables
   ```

### 4. DigitalOcean App Platform

1. **Create App from GitHub**
2. **Configure:**
   - Source: Your GitHub repository
   - Build Command: `docker build -t i-instructor .`
   - Run Command: `docker run -p $PORT:3004 i-instructor`
3. **Add Environment Variables**

## 🐳 Local Docker Deployment

### Development Mode:
```bash
# Run with hot reload
docker-compose up --build
```

### Production Mode:
```bash
# Build and run production version
docker-compose -f docker-compose.prod.yml up --build
```

### Single Container:
```bash
# Build the image
docker build -t i-instructor .

# Run the container
docker run -p 3004:3004 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  -e FIREBASE_PROJECT_ID=your-project \
  i-instructor
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

**Required Variables:**

**Backend Variables:**
- `NODE_ENV`: Set to "production"
- `JWT_SECRET`: Strong secret key for JWT tokens
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_API_KEY`: Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `FIREBASE_APP_ID`: Firebase app ID

**Frontend Variables (Vite - must be prefixed with VITE_):**
- `VITE_FIREBASE_API_KEY`: Firebase API key (same as backend)
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID (optional)
- `VITE_API_URL`: Your deployed API URL
- `VITE_SOCKET_URL`: Your deployed Socket.IO URL

### Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Authentication (Google provider)

2. **Get Configuration:**
   - Go to Project Settings
   - Copy the config values to your environment variables

3. **Configure Authentication:**
   - Enable Google Sign-in method
   - Add your domain to authorized domains

## 🔍 Health Checks

The application includes a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

## 📊 Monitoring

### Logs
- Railway: View logs in Railway dashboard
- Heroku: `heroku logs --tail`
- Docker: `docker logs container_name`

### Performance
- Monitor response times via health check endpoint
- Check database performance
- Monitor memory usage

## 🔒 Security

### Production Checklist:
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS
- [ ] Set up proper Firebase security rules
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

### CORS Configuration:
Update `CORS_ORIGIN` environment variable to your domain:
```
CORS_ORIGIN=https://yourdomain.com
```

## 🗄️ Database

The application uses SQLite with better-sqlite3. The database file is stored in:
- Development: `server/data/iinstructor.db`
- Production: `/app/server/data/iinstructor.db` (in container)

### Backup:
```bash
# Copy database from running container
docker cp container_name:/app/server/data/iinstructor.db ./backup.db
```

## 🔄 Updates

### Railway/Render (Auto-deploy):
1. Push changes to main branch
2. Platform automatically rebuilds and deploys

### Manual Deploy:
```bash
# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors

2. **Database Issues:**
   - Ensure data directory is writable
   - Check SQLite version compatibility
   - Verify database initialization

3. **Firebase Auth Issues:**
   - Verify Firebase configuration
   - Check authorized domains
   - Ensure CORS is properly configured

4. **Port Issues:**
   - Ensure PORT environment variable is set
   - Check if port is available
   - Verify firewall settings

### Debugging:
```bash
# Check container logs
docker logs container_name

# Access container shell
docker exec -it container_name sh

# Check health endpoint
curl http://your-domain/health
```

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test locally with Docker
4. Check platform-specific documentation

## 🎉 Success!

Once deployed, your i-Instructor application will be available at your chosen domain with:
- ✅ User authentication via Firebase
- ✅ Real-time features via Socket.IO
- ✅ File uploads and management
- ✅ Admin dashboard with analytics
- ✅ Responsive design for all devices

Happy learning and teaching! 🎓
