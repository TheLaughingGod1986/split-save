import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    vercelUrl: process.env.VERCEL_URL,
    vercelBranch: process.env.VERCEL_GIT_COMMIT_REF,
    requestUrl: request.url,
    requestOrigin: request.headers.get('origin'),
    requestHost: request.headers.get('host'),
    timestamp: new Date().toISOString()
  })
}
