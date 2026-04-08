import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('[Lipana Initialize] Request received')
    
    const body = await request.json()
    console.log('[Lipana Initialize] Request body:', body)
    
    const { amount, email, phone, name, packageLimit } = body

    if (!amount || !email || !phone || !name || !packageLimit) {
      console.log('[Lipana Initialize] Missing fields:', { amount, email, phone, name, packageLimit })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if environment variables are set
    const publicKey = process.env.LIPANA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY
    const secretKey = process.env.LIPANA_SECRET_KEY || process.env.NEXT_PUBLIC_LIPANA_SECRET_KEY
    
    console.log('[Lipana Initialize] ENV check:', { 
      hasPublicKey: !!publicKey, 
      hasSecretKey: !!secretKey,
      publicKeyPrefix: publicKey ? publicKey.substring(0, 10) + '...' : 'none'
    })

    if (!publicKey || !secretKey) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 500 })
    }

    const LIPANA_BASE_URL = 'https://api.lipana.com'
    const callbackUrl = 'https://fulizacom.netlify.app/api/webhooks/mpesa'
    const merchantReference = `FULIZA-${Date.now()}`

    console.log('[Lipana Initialize] Making API call to:', LIPANA_BASE_URL)

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

    console.log('[Lipana Initialize] Response status:', response.status)
    console.log('[Lipana Initialize] Response headers:', Object.fromEntries(response.headers.entries()))

    const text = await response.text()
    console.log('[Lipana Initialize] Response body:', text.substring(0, 500))

    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.log('[Lipana Initialize] Invalid JSON response:', text.substring(0, 200))
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
    console.error('[Lipana Initialize] Error stack:', error.stack)
    return NextResponse.json({ 
      error: error.message || 'Failed to initialize payment',
      details: error.toString(),
      stack: error.stack 
    }, { status: 500 })
  }
}
