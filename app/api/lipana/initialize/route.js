import { NextResponse } from 'next/server'
import { initializePayment, generateReference } from '../../../lib/lipana'

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
    console.error('[Lipana Initialize] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment'
    
    const publicKey = process.env.LIPANA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY
    const secretKey = process.env.LIPANA_SECRET_KEY || process.env.NEXT_PUBLIC_LIPANA_SECRET_KEY
    
    console.error('[Lipana Initialize] Env check:', {
      hasPublicKey: !!publicKey,
      hasSecretKey: !!secretKey,
      publicKeyPrefix: publicKey?.substring(0, 12) + '...'
    })
    
    return NextResponse.json(
      { error: errorMessage, debug: { hasPublicKey: !!publicKey, hasSecretKey: !!secretKey } },
      { status: 500 }
    )
  }
}