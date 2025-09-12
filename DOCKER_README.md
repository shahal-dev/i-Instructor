# 🐳 Docker Setup for i-Instructor

## Quick Start

### 1. Production Build (Single Container)
```bash
# Build the production image
docker build -t i-instructor .

# Run the container
docker run -p 3004:3004 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret-key \
  -e FIREBASE_PROJECT_ID=your-project-id \
  i-instructor
```

### 2. Development with Docker Compose
```bash
# Start development environment
docker-compose up --build

# Stop and remove containers
docker-compose down
```

### 3. Production with Docker Compose
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

## 📁 File Structure

```
i-Instructor/
├── Dockerfile                 # Production build (frontend + backend) - Node.js 20
├── Dockerfile.dev            # Development build (frontend only) - Node.js 20
├── server/Dockerfile.dev     # Development build (backend only) - Node.js 20
├── docker-compose.yml        # Development environment
├── docker-compose.prod.yml   # Production environment
├── .dockerignore             # Files to exclude from Docker build
├── railway.json              # Railway deployment config
├── railway.toml              # Railway deployment config (alternative)
├── start.sh                  # Production startup script
└── env.example               # Environment variables template
```

## 🚀 Deployment Platforms

### Railway (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Render
1. Connect repository
2. Use Docker build
3. Set environment variables

### Heroku
```bash
heroku create your-app-name
heroku stack:set container
git push heroku main
```

### DigitalOcean App Platform
1. Create app from GitHub
2. Use Docker configuration
3. Set environment variables

## 🔧 Environment Variables

Required for production:

**Backend Variables:**
```bash
NODE_ENV=production
JWT_SECRET=your-secure-secret
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-domain
FIREBASE_STORAGE_BUCKET=your-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

**Frontend Variables (Vite - prefixed with VITE_):**
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=https://your-domain.com
VITE_SOCKET_URL=https://your-domain.com
```

## 📊 Health Check

Access health endpoint: `http://your-domain/health`

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

## 🔍 Useful Commands

```bash
# View running containers
docker ps

# View container logs
docker logs container_name

# Access container shell
docker exec -it container_name sh

# Remove all containers and images
docker system prune -a

# Build without cache
docker build --no-cache -t i-instructor .
```

## 🎯 Production Checklist

- [ ] Set all required environment variables
- [ ] Configure Firebase authentication
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain
- [ ] Test all features after deployment
- [ ] Set up monitoring/logging

## 🚨 Troubleshooting

1. **Build fails**: Check Node.js version, dependencies
2. **Container won't start**: Check environment variables, logs
3. **Database issues**: Ensure data directory is writable
4. **Firebase auth fails**: Verify Firebase config, authorized domains

Ready to deploy! 🎉
