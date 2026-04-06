import { NextResponse } from 'next/server'
import { verifyPayment } from '../../../lib/lipana'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference parameter is required' },
        { status: 400 }
      )
    }

    const result = await verifyPayment(reference)

    return NextResponse.json({
      success: result.success,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      reference: result.merchant_reference,
      payment_method: result.payment_method,
      completed_at: result.completed_at
    })

  } catch (error) {
    console.error('Lipana verification error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}