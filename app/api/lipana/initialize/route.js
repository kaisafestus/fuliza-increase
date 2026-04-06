import { NextResponse } from 'next/server'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const LIPANA_BASE_URL = 'https://api.lipana.com'

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, email, phone, name, packageLimit } = body

    if (!amount || !email || !phone || !name || !packageLimit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const publicKey = process.env.LIPANA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY
    const secretKey = process.env.LIPANA_SECRET_KEY || process.env.NEXT_PUBLIC_LIPANA_SECRET_KEY

    console.log('[Lipana] ENV - hasPublicKey:', !!publicKey)
    console.log('[Lipana] ENV - hasSecretKey:', !!secretKey)

    if (!publicKey || !secretKey) {
      return NextResponse.json({
        error: 'API keys not configured',
        hasPublicKey: !!publicKey,
        hasSecretKey: !!secretKey
      }, { status: 500 })
    }

    const callbackUrl = 'https://fulizacom.netlify.app/api/webhooks/mpesa'
    const merchantReference = `FULIZA-${Date.now()}`

    console.log('[Lipana] Initiating payment:', { amount, phone, callbackUrl, merchantReference })

    const response = await fetch(`${LIPANA_BASE_URL}/v1/payments/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_key: publicKey,
        timestamp: new Date().toISOString(),
        duration_expiry: 30,
        currency: 'KES',
        amount: parseInt(amount),
        message: `Fuliza Limit Increase - KES ${amount}`,
        merchant_reference: merchantReference,
        callback_url: callbackUrl,
        mobile: phone
      })
    })

    const data = await response.json()
    console.log('[Lipana] Response status:', response.status)
    console.log('[Lipana] Response data:', JSON.stringify(data))

    if (!response.ok || data.status !== 'success') {
      return NextResponse.json({
        error: data.message || 'Payment initialization failed',
        details: data
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      checkout_id: data.checkout_id,
      merchant_reference: data.merchant_reference,
      client_reference: data.client_reference,
      otp: data.otp,
      status: data.status
    })

  } catch (error) {
    console.error('[Lipana Initialize] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}