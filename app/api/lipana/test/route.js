import { NextResponse } from 'next/server'

// Test endpoint to verify env vars without calling Lipana API
export async function GET() {
  const publicKey = process.env.LIPANA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY
  const secretKey = process.env.LIPANA_SECRET_KEY || process.env.NEXT_PUBLIC_LIPANA_SECRET_KEY
  
  return NextResponse.json({
    status: 'ok',
    env: {
      LIPANA_PUBLISHABLE_KEY: publicKey ? publicKey.substring(0, 12) + '...' : 'NOT SET',
      LIPANA_SECRET_KEY: secretKey ? secretKey.substring(0, 12) + '...' : 'NOT SET',
      path: process.env.LIPANA_PUBLISHABLE_KEY ? 'LIPANA_PUBLISHABLE_KEY' : 'NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY'
    }
  })
}

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

    // Return test success without calling Lipana API
    return NextResponse.json({
      success: true,
      test: true,
      checkout_id: 'TEST-' + Date.now(),
      merchant_reference: 'FULIZA-TEST-' + Date.now(),
      message: 'Test mode - env vars working!'
    })

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}