import { NextResponse } from 'next/server'

export async function GET() {
  const publicKey = process.env.LIPANA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY
  const secretKey = process.env.LIPANA_SECRET_KEY || process.env.NEXT_PUBLIC_LIPANA_SECRET_KEY
  const webhookUrl = process.env.LIPANA_WEBHOOK_URL || process.env.NEXT_PUBLIC_LIPANA_WEBHOOK_URL
  const webhookSecret = process.env.LIPANA_WEBHOOK_SECRET || process.env.NEXT_PUBLIC_LIPANA_WEBHOOK_SECRET

  console.log('[Lipana Health] Checking env vars...')
  console.log('[Lipana Health] PUBLIC_KEY exists:', !!publicKey)
  console.log('[Lipana Health] SECRET_KEY exists:', !!secretKey)
  console.log('[Lipana Health] WEBHOOK_URL exists:', !!webhookUrl)
  console.log('[Lipana Health] WEBHOOK_SECRET exists:', !!webhookSecret)

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

  if (!webhookUrl) {
    issues.push('LIPANA_WEBHOOK_URL is not set')
  }

  if (!webhookSecret) {
    issues.push('LIPANA_WEBHOOK_SECRET is not set')
  }

  if (issues.length > 0) {
    return NextResponse.json({
      status: 'error',
      message: 'Environment configuration issues',
      issues,
      hasPublicKey: !!publicKey,
      hasSecretKey: !!secretKey,
      hasWebhookUrl: !!webhookUrl,
      hasWebhookSecret: !!webhookSecret
    }, { status: 500 })
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Lipana environment variables are configured',
    config: {
      hasPublishableKey: !!publicKey,
      hasSecretKey: !!secretKey,
      hasWebhookUrl: !!webhookUrl,
      hasWebhookSecret: !!webhookSecret,
      keyPrefix: publicKey?.substring(0, 12) + '...'
    }
  })
}