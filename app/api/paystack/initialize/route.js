import { NextResponse } from 'next/server'
import { initializePayment, generateReference } from '@/app/lib/paystack'

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, email, phone, name, packageLimit } = body

    // Validate required fields
    if (!amount || !email || !phone || !name || !packageLimit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique reference
    const reference = generateReference('FULIZA')

    // Get callback URL from environment or use default
    const callbackUrl = process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`
      : 'https://fulizacom.netlify.app/payment/callback'

    // Initialize payment with Paystack
    const result = await initializePayment(
      email,
      amount,
      reference,
      callbackUrl,
      {
        phone,
        name,
        package_limit: packageLimit,
        custom_fields: [
          {
            display_name: 'Phone Number',
            variable_name: 'phone_number',
            value: phone
          },
          {
            display_name: 'Package Limit',
            variable_name: 'package_limit',
            value: packageLimit
          }
        ]
      }
    )

    return NextResponse.json({
      success: true,
      authorization_url: result.authorization_url,
      reference: result.reference
    })

  } catch (error) {
    console.error('Paystack initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
