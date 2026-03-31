import { NextResponse } from 'next/server'

// IntaSend API configuration
const INTASEND_API_URL = 'https://payment.intasend.com/api/v1/payment/mpesa-stk-push/'
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY

export async function POST(request) {
  try {
    // Validate that the secret key is configured
    if (!INTASEND_SECRET_KEY) {
      console.error('INTASEND_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please set INTASEND_SECRET_KEY environment variable.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { amount, currency, email, phone, api_ref, redirect_url, webhook_url } = body

    // Validate required fields
    if (!amount || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, email, phone' },
        { status: 400 }
      )
    }

    // Format phone number (remove leading 0 or +254 and add 254)
    let formattedPhone = phone.replace(/^0/, '').replace(/^\+254/, '').replace(/^254/, '')
    formattedPhone = `254${formattedPhone}`

    // Create STK push request with IntaSend
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
        phone_number: formattedPhone,
        api_ref: api_ref || `FULIZA-${Date.now()}`,
        redirect_url: redirect_url,
        webhook_url: webhook_url,
        method: 'M-PESA',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('IntaSend API error:', data)
      return NextResponse.json(
        { error: data.message || data.detail || 'Failed to create STK push' },
        { status: response.status }
      )
    }

    // Return the STK push response
    return NextResponse.json({
      success: true,
      checkout_id: data.id || data.checkout_id,
      api_ref: data.api_ref,
      state: data.state,
      message: data.message || 'STK push sent successfully',
    })

  } catch (error) {
    console.error('Error creating STK push:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
