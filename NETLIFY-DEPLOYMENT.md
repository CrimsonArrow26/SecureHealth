# Netlify Deployment Guide for Secure Health Blockchain

This guide covers deploying your Secure Health Blockchain application to Netlify.

## 🚀 **Quick Start**

### 1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

### 2. **Login to Netlify**
```bash
netlify login
```

### 3. **Deploy to Netlify**
```bash
# Build and deploy to production
npm run deploy:netlify

# Or for preview
npm run deploy:netlify:preview
```

## 📋 **Prerequisites**

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git repository set up
- [ ] Netlify account created
- [ ] Environment variables configured

## 🔧 **Configuration Files**

### **netlify.toml**
The main configuration file that tells Netlify how to build and deploy your app.

### **_redirects**
Handles client-side routing and API route forwarding.

### **Next.js Config**
Updated to use `output: 'export'` for static generation.

## 🌐 **Environment Variables**

Set these in your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add each variable from your `.env.production` file:

**Required Variables:**
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
NEXT_PUBLIC_NETWORK_ID=1
NEXT_PUBLIC_NETWORK_NAME=ethereum
NEXT_PUBLIC_RPC_URL=your-rpc-url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

**Optional Variables:**
```
BLOB_READ_WRITE_TOKEN=your-blob-token
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://yourdomain.netlify.app
```

## 🏗️ **Build Process**

### **Local Build Test**
```bash
# Test the build locally
npm run build:netlify

# Check the output directory
ls -la out/
```

### **Build Output**
The build creates an `out/` directory containing:
- Static HTML files
- JavaScript bundles
- CSS files
- Images and assets

## 🔗 **API Routes & Functions**

### **Converting API Routes**
Since we're using static export, API routes need to be converted to Netlify functions:

1. **Move API logic** to `netlify/functions/`
2. **Update frontend calls** to use function URLs
3. **Test functions locally** with `netlify dev`

### **Health Check Function**
Located at `netlify/functions/health.js` - accessible at `/health`

## 🚀 **Deployment Options**

### **Option 1: CLI Deployment**
```bash
# Production deployment
npm run deploy:netlify

# Preview deployment
npm run deploy:netlify:preview
```

### **Option 2: Git Integration**
1. Connect your Git repository to Netlify
2. Set build command: `npm run build:netlify`
3. Set publish directory: `out`
4. Enable automatic deployments

### **Option 3: Drag & Drop**
1. Run `npm run build:netlify`
2. Drag the `out/` folder to Netlify
3. Your site is live instantly!

## 🔒 **Security & Headers**

### **Security Headers**
Configured in `_redirects` file:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000

### **CORS Configuration**
API functions include proper CORS headers for cross-origin requests.

## 📊 **Monitoring & Analytics**

### **Netlify Analytics**
- Built-in performance monitoring
- Form submissions tracking
- Function execution metrics

### **Health Checks**
- `/health` endpoint for monitoring
- Returns system status and environment info
- Useful for uptime monitoring services

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm run build:netlify
   ```

2. **API Routes Not Working**
   - Check function files in `netlify/functions/`
   - Verify redirects in `_redirects`
   - Test locally with `netlify dev`

3. **Environment Variables**
   - Verify in Netlify dashboard
   - Check variable names match exactly
   - Redeploy after adding variables

4. **Client-Side Routing Issues**
   - Ensure `_redirects` file is in `public/`
   - Check redirect rules are correct
   - Verify build output includes redirects

### **Debug Commands**
```bash
# Test build locally
npm run build:netlify

# Test Netlify functions locally
netlify dev

# Check function logs
netlify functions:list
netlify functions:invoke health
```

## 🔄 **Continuous Deployment**

### **Git Integration Setup**
1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose your repository

2. **Build Settings**
   - Build command: `npm run build:netlify`
   - Publish directory: `out`
   - Node version: 18

3. **Environment Variables**
   - Add all required variables
   - Set deployment contexts (production/preview)

4. **Deploy Triggers**
   - Automatic deployment on push to main
   - Preview deployments on pull requests
   - Branch-specific environment variables

## 📱 **Mobile & PWA**

### **PWA Support**
- Service worker configuration
- Manifest file in `public/`
- Offline functionality

### **Mobile Optimization**
- Responsive design
- Touch-friendly interfaces
- Performance optimization

## 🌍 **Custom Domain**

### **Domain Setup**
1. Go to **Domain management** in Netlify
2. Add your custom domain
3. Update DNS records
4. Enable HTTPS (automatic with Netlify)

### **SSL Certificate**
- Automatic SSL provisioning
- Force HTTPS redirect
- HSTS headers configured

## 📈 **Performance Optimization**

### **Build Optimization**
- Code splitting enabled
- Image optimization
- CSS minification
- JavaScript bundling

### **CDN Benefits**
- Global edge locations
- Automatic caching
- Fast content delivery
- DDoS protection

## 🔍 **Testing Deployment**

### **Pre-Deployment Checklist**
- [ ] Build succeeds locally
- [ ] All tests pass
- [ ] Environment variables set
- [ ] API functions working
- [ ] Client-side routing tested

### **Post-Deployment Verification**
- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] API endpoints responding
- [ ] Health check working
- [ ] Performance acceptable

## 📞 **Support & Resources**

### **Netlify Documentation**
- [Netlify Docs](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Functions Guide](https://docs.netlify.com/functions/overview/)

### **Community Support**
- [Netlify Community](https://community.netlify.com/)
- [GitHub Issues](https://github.com/netlify/netlify-cli/issues)

---

## 🎯 **Quick Commands Reference**

```bash
# Build for Netlify
npm run build:netlify

# Deploy to production
npm run deploy:netlify

# Deploy preview
npm run deploy:netlify:preview

# Test locally
netlify dev

# Check function status
netlify functions:list
```

---

**🚀 Your Secure Health Blockchain app is now ready for Netlify deployment!**
