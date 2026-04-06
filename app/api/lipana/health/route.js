import { NextResponse } from 'next/server'

export async function GET() {
  const publicKey = process.env.LIPANA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY
  const secretKey = process.env.LIPANA_SECRET_KEY || process.env.NEXT_PUBLIC_LIPANA_SECRET_KEY
  const webhookUrl = 'https://fulizacom.netlify.app/api/webhooks/mpesa'

  const issues = []

  if (!publicKey) {
    issues.push('LIPANA_PUBLISHABLE_KEY is not set')
  } else if (!publicKey.startsWith('lip_pk_live_')) {
    issues.push('LIPANA_PUBLISHABLE_KEY must be a live key (lip_pk_live_...)')
  }

  if (!secretKey) {
    issues.push('LIPANA_SECRET_KEY is not set')
  } else if (!secretKey.startsWith('lip_sk_live_')) {
    issues.push('LIPANA_SECRET_KEY must be a live key (lip_sk_live_...)')
  }

  if (issues.length > 0) {
    return NextResponse.json({
      status: 'error',
      message: 'Environment configuration issues found',
      issues,
      config: {
        hasPublicKey: !!publicKey,
        hasSecretKey: !!secretKey,
        webhookUrl: webhookUrl
      }
    }, { status: 500 })
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Lipana environment is configured correctly',
    config: {
      hasPublicKey: !!publicKey,
      hasSecretKey: !!secretKey,
      webhookUrl: webhookUrl,
      apiBaseUrl: 'https://api.lipana.com',
      keyPrefix: publicKey?.substring(0, 12) + '...'
    }
  })
}