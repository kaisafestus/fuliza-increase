import { NextResponse } from 'next/server'

// IntaSend API configuration
const INTASEND_API_URL = 'https://payment.intasend.com/api/v1/payment/collection/'
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

    // Validate phone number format (should be 12 digits starting with 254)
    if (!/^254\d{9}$/.test(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use format: 0712345678 or 254712345678' },
        { status: 400 }
      )
    }

    // Create STK push request with IntaSend
    const requestBody = {
      amount: parseFloat(amount),
      currency: currency || 'KES',
      email: email,
      phone_number: formattedPhone,
      api_ref: api_ref || `FULIZA-${Date.now()}`,
    }

    // Add optional fields if provided
    if (redirect_url) {
      requestBody.redirect_url = redirect_url
    }
    if (webhook_url) {
      requestBody.webhook_url = webhook_url
    }

    console.log('Sending STK push request:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(INTASEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTASEND_SECRET_KEY}`,
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    console.log('IntaSend API response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('IntaSend API error:', data)
      return NextResponse.json(
        { 
          error: data.message || data.detail || 'Failed to create STK push',
          intasend_error: data 
        },
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
