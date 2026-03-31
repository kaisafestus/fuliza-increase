import { NextResponse } from 'next/server'

// IntaSend API configuration
const INTASEND_API_URL = 'https://payment.intasend.com/api/v1/checkout/'
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY || 'ISSecretKey_live_bca26356-8e6f-4e86-bb7a-7a83217b50b3'

export async function GET(request) {
  try {
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
        { error: data.message || 'Failed to check payment status' },
        { status: response.status }
      )
    }

    // Return payment status
    return NextResponse.json({
      success: true,
      checkout_id: data.id,
      status: data.state,
      api_ref: data.api_ref,
      amount: data.amount,
      currency: data.currency,
      email: data.email,
      phone: data.phone_number,
      created_at: data.created_at,
      updated_at: data.updated_at,
    })

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
