import { NextResponse } from 'next/server'
import { initializePayment, generateReference } from '../../lib/lipana'

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

    const reference = generateReference('FULIZA')

    const result = await initializePayment(
      email,
      amount,
      phone,
      name,
      packageLimit
    )

    return NextResponse.json({
      success: true,
      checkout_id: result.checkout_id,
      merchant_reference: result.merchant_reference,
      client_reference: result.client_reference,
      otp: result.otp,
      status: result.status
    })

  } catch (error) {
    console.error('Lipana initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}