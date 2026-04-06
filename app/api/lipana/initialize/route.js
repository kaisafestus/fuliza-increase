import { NextResponse } from 'next/server'


const LIPANA_BASE_URL = 'https://api.lipana.com'

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, email, phone, name, packageLimit } = body

    if (!amount || !email || !phone || !name || !packageLimit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const publicKey = process.env.LIPANA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY
    const secretKey = process.env.LIPANA_SECRET_KEY || process.env.NEXT_PUBLIC_LIPANA_SECRET_KEY

    console.log('[Lipana] ENV - hasPublicKey:', !!publicKey, 'hasSecretKey:', !!secretKey)

    if (!publicKey || !secretKey) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 500 })
    }

    const callbackUrl = 'https://fulizacom.netlify.app/api/webhooks/mpesa'
    const merchantReference = `FULIZA-${Date.now()}`

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

    const text = await response.text()
    console.log('[Lipana] Response status:', response.status)

    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.log('[Lipana] Invalid response:', text.substring(0, 200))
      return NextResponse.json({ error: 'Invalid API response', details: text.substring(0, 200) }, { status: 500 })
    }

    if (!response.ok || data.status !== 'success') {
      return NextResponse.json({ error: data.message || 'Payment failed', details: data }, { status: 500 })
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
    return NextResponse.json({ error: error.message || 'Failed to initialize payment' }, { status: 500 })
  }
}