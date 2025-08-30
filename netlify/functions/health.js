exports.handler = async function(event, context) {
  const startTime = Date.now();
  
  try {
    // Basic health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production',
      version: process.env.npm_package_version || 'unknown',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      responseTime: Date.now() - startTime,
      platform: 'netlify',
    };

    // Check if we're in production mode
    if (process.env.NODE_ENV === 'production') {
      // Add additional production checks
      const additionalChecks = {
        // Check if critical environment variables are set
        env: {
          hasContractAddress: !!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          hasNetworkId: !!process.env.NEXT_PUBLIC_NETWORK_ID,
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasRpcUrl: !!process.env.NEXT_PUBLIC_RPC_URL,
        },
        // Add blockchain network status if available
        blockchain: {
          networkId: process.env.NEXT_PUBLIC_NETWORK_ID || 'unknown',
          networkName: process.env.NEXT_PUBLIC_NETWORK_NAME || 'unknown',
        },
      };

      Object.assign(healthStatus, additionalChecks);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(healthStatus),
    };
  } catch (error) {
    console.error('Health check failed:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
        responseTime: Date.now() - startTime,
        platform: 'netlify',
      }),
    };
  }
};
