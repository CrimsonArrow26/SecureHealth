/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Netlify deployment support
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  // Static export only for production builds (Netlify deployment)
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
    env: {
      NEXT_PUBLIC_STATIC_EXPORT: 'true',
    },
  }),

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

export default nextConfig
