import { NextResponse } from 'next/server'

// IntaSend API configuration
const INTASEND_API_URL = 'https://payment.intasend.com/api/v1/payment/collection/'
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY

export async function GET(request) {
  try {
    // Validate that the secret key is configured
    if (!INTASEND_SECRET_KEY) {
      console.error('INTASEND_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please set INTASEND_SECRET_KEY environment variable.' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const checkout_id = searchParams.get('checkout_id')

    if (!checkout_id) {
      return NextResponse.json(
        { error: 'Missing checkout_id parameter' },
        { status: 400 }
      )
    }

    // Check payment status with IntaSend
    const response = await fetch(`${INTASEND_API_URL}${checkout_id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INTASEND_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('IntaSend API error:', data)
      return NextResponse.json(
        { error: data.message || data.detail || 'Failed to check payment status' },
        { status: response.status }
      )
    }

    // Return payment status
    return NextResponse.json({
      success: true,
      checkout_id: data.id || data.checkout_id,
      status: data.state || data.status,
      api_ref: data.api_ref,
      amount: data.amount,
      currency: data.currency,
      email: data.email,
      phone: data.phone_number || data.phone,
      created_at: data.created_at,
      updated_at: data.updated_at,
      narrative: data.narrative,
      mpesa_reference: data.mpesa_reference,
    })

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
