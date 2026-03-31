import { NextResponse } from 'next/server'

// IntaSend API configuration
const INTASEND_API_URL = 'https://payment.intasend.com/api/v1/checkout/'
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY || 'ISSecretKey_live_bca26356-8e6f-4e86-bb7a-7a83217b50b3'

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, currency, email, phone, api_ref, redirect_url, webhook_url } = body

    // Validate required fields
    if (!amount || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, email, phone' },
        { status: 400 }
      )
    }

    // Create checkout session with IntaSend
    const response = await fetch(INTASEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTASEND_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency || 'KES',
        email: email,
        phone: phone,
        api_ref: api_ref || `FULIZA-${Date.now()}`,
        redirect_url: redirect_url,
        webhook_url: webhook_url,
        method: 'M-PESA',
        hosted: true,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('IntaSend API error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to create checkout session' },
        { status: response.status }
      )
    }

    // Return the checkout URL
    return NextResponse.json({
      success: true,
      url: data.url,
      checkout_id: data.id,
      api_ref: data.api_ref,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
