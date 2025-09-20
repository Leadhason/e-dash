# Railway Deployment Guide

## ✅ Setup Complete!

Your Tools & Power Technologies E-commerce Dashboard is now ready for Railway deployment.

## 🚀 Deploy to Railway

### Step 1: Create Railway Project
1. Visit [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `e-dash` repository

### Step 2: Configure Environment Variables
In your Railway project dashboard, add these environment variables:

**Required:**
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-here
```

**Optional:**
```
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Step 3: Add PostgreSQL Database
1. In Railway dashboard: **Add Service** → **Database** → **PostgreSQL**
2. Railway will automatically set `DATABASE_URL`
3. After deployment, run migrations:
   ```bash
   railway run npm run db:push
   ```

## 🔧 What Was Configured

### ✅ Package.json Updates
- Changed name to `tools-power-tech-dashboard`
- Added Node.js version requirements
- Added proper build scripts for Railway

### ✅ Server Configuration  
- **Development**: Binds to `127.0.0.1:5000` (localhost only)
- **Production**: Binds to `0.0.0.0:PORT` (Railway compatible)
- **Fixed Path Resolution**: Handles bundled code properly in production
- Static file serving configured for Railway's file structure

### ✅ Railway Configuration Files
- `railway.json`: Railway deployment settings
- `nixpacks.toml`: Build configuration

### ✅ Path Resolution Fix
- Fixed `import.meta.dirname` issue in bundled production code
- Uses `process.cwd()` for reliable path resolution in Railway environment

## 🧪 Local Testing

### Development Mode (Unchanged)
```bash
npm run dev
# Client: http://localhost:5173 (Vite dev server)
# Server: http://localhost:5000 (API)
```

### Production Mode (Test locally)
```bash
# Build everything
npm run build

# Set environment variables
set DATABASE_URL=your-database-url
set JWT_SECRET=your-jwt-secret

# Start production server
npm run start
# Serves everything on http://localhost:5000
```

## 📋 Build Process

Railway automatically runs:
1. `npm ci` - Install dependencies
2. `npm run build` - Build client and server
3. `npm run start` - Start production server

## 🔍 Verification

Your build test showed:
- ✅ Client builds successfully → `dist/public/`  
- ✅ Server builds successfully → `dist/index.js`
- ✅ Production server starts (missing DATABASE_URL expected)

## 🚀 Next Steps

1. **Push to GitHub**: Commit these changes
2. **Deploy on Railway**: Follow steps above
3. **Add Environment Variables**: Set DATABASE_URL and JWT_SECRET
4. **Run Database Migrations**: `railway run npm run db:push`
5. **Test Your App**: Visit your Railway URL

## 📚 Railway Resources

- [Railway Docs](https://docs.railway.app)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [Environment Variables](https://docs.railway.app/develop/variables)

Your application is ready for deployment! 🎉