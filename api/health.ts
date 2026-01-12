// ============================================
// Health Check Endpoint for Uptime Monitoring
// ============================================
// Use with UptimeRobot, Pingdom, or similar services
// Endpoint: GET /api/health

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    api: 'ok' | 'error';
    environment: 'ok' | 'error';
    dependencies: 'ok' | 'warning' | 'error';
  };
  responseTimeMs: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const startTime = Date.now();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check environment variables
    const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.VITE_API_KEY);
    const hasSupabase = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);

    // Determine overall status
    const environmentOk = hasApiKey;
    const dependenciesStatus = hasSupabase ? 'ok' : 'warning';

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!environmentOk) {
      overallStatus = 'unhealthy';
    } else if (dependenciesStatus === 'warning') {
      overallStatus = 'degraded';
    }

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || '1.0.0',
      checks: {
        api: 'ok',
        environment: environmentOk ? 'ok' : 'error',
        dependencies: dependenciesStatus,
      },
      responseTimeMs: Date.now() - startTime,
    };

    // Return appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: 'unknown',
      checks: {
        api: 'error',
        environment: 'error',
        dependencies: 'error',
      },
      responseTimeMs: Date.now() - startTime,
      error: 'Health check failed',
    });
  }
}
