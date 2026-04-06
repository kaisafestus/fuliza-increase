import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Lipana webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request) {
  try {
    const payload = await request.json()
    
    const signature = request.headers.get('x-lipana-signature')
    const timestamp = request.headers.get('x-lipana-timestamp')
    
    console.log('[Lipana Webhook] Received webhook')
    console.log('[Lipana Webhook] Signature:', signature)
    console.log('[Lipana Webhook] Timestamp:', timestamp)
    console.log('[Lipana Webhook] Body:', JSON.stringify(payload))

    const eventType = payload.event
    const data = payload.data

    console.log(`[Lipana Webhook] Event: ${eventType}`)

    switch (eventType) {
      case 'payment.success':
        console.log('[Lipana Webhook] Payment successful:', {
          merchant_reference: data.merchant_reference,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          mobile: data.mobile
        })
        break

      case 'payment.failed':
        console.log('[Lipana Webhook] Payment failed:', {
          merchant_reference: data.merchant_reference,
          status: data.status,
          reason: data.reason
        })
        break

      case 'payment.cancelled':
        console.log('[Lipana Webhook] Payment cancelled:', {
          merchant_reference: data.merchant_reference,
          status: data.status
        })
        break

      default:
        console.log(`[Lipana Webhook] Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Webhook received successfully' 
    }, { status: 200 })

  } catch (error) {
    console.error('[Lipana Webhook] Processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}