# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: Deploy to Render + Vercel (Recommended)

#### Deploy Server to Render
1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Use these settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: None needed

#### Deploy Client to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Use these settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_SERVER_URL`: Your Render server URL

### Option 2: Deploy to Railway

#### One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

1. Fork this repository
2. Click the Railway button above
3. Connect your GitHub account
4. Railway will auto-deploy both services

### Option 3: Local Docker Deployment

```bash
# Create Dockerfile for server
cd server
cat > Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
EOF

# Create Dockerfile for client
cd ../client
cat > Dockerfile << EOF
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create docker-compose.yml
cd ..
cat > docker-compose.yml << EOF
version: '3.8'
services:
  server:
    build: ./server
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
  
  client:
    build: ./client
    ports:
      - "3000:80"
    depends_on:
      - server
EOF

# Deploy
docker-compose up -d
```

## Environment Configuration

### Client Environment Variables
Create `client/.env` file:
```env
VITE_SERVER_URL=http://localhost:8000
# For production, replace with your deployed server URL
# VITE_SERVER_URL=https://your-app.render.com
```

### Server Environment Variables
No additional environment variables needed for basic deployment.

For production, you might want to add:
```env
PORT=8000
NODE_ENV=production
CORS_ORIGIN=https://your-client-app.vercel.app
```

## Post-Deployment Checklist

### ✅ Verify Deployment
1. **Server Health Check**: Visit `https://your-server.com/` - should return server info
2. **Client Access**: Visit your client URL - should load login page
3. **WebSocket Connection**: Check browser console for connection logs
4. **File Upload**: Test image/file sharing functionality
5. **Real-time Features**: Test messaging, reactions, typing indicators

### ✅ Update CORS Settings
Update server CORS configuration for production:

```javascript
// server/server.js
app.use(cors({
  origin: ["https://your-client-app.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST"]
}));

const io = new Server(server, {
  cors: {
    origin: ["https://your-client-app.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});
```

### ✅ Update Client Socket URL
Update the client socket connection:

```javascript
// client/src/socket/socket.js
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
```

## Performance Optimization

### Client Optimizations
- Enable Vite build optimizations
- Implement code splitting for large components
- Use React.memo for expensive components
- Optimize image uploads with compression

### Server Optimizations
- Implement Redis for session storage (for multi-instance deployments)
- Add rate limiting for API endpoints
- Use PM2 for process management
- Enable gzip compression

## Monitoring & Analytics

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics
- **Performance**: Vercel Analytics
- **Uptime Monitoring**: UptimeRobot

## Security Considerations

### Production Security
1. **Rate Limiting**: Implement request rate limiting
2. **Input Validation**: Validate all user inputs
3. **File Upload Security**: Scan uploaded files
4. **HTTPS Only**: Force HTTPS in production
5. **Environment Variables**: Never commit secrets

### Example Rate Limiting
```javascript
// server/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Troubleshooting

### Common Issues

#### WebSocket Connection Failed
- Check CORS settings
- Verify server URL in client
- Ensure WebSocket is supported by hosting provider

#### File Upload Not Working
- Check file size limits (default 5MB)
- Verify upload directory permissions
- Ensure multipart/form-data is supported

#### Messages Not Appearing
- Check browser console for errors
- Verify Socket.io connection status
- Test with multiple browser tabs

### Debug Mode
Enable debug mode for detailed logging:

```javascript
// Client debug
localStorage.debug = 'socket.io-client:socket';

// Server debug
DEBUG=socket.io:* npm start
```

## Support & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Monitor error logs
- Backup user data if persistent storage is added
- Test all features after updates

### Scaling Considerations
- Use Redis adapter for horizontal scaling
- Implement database for message persistence
- Add CDN for file uploads
- Consider microservices architecture

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
