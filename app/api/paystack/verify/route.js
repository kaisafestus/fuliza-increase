import { NextResponse } from 'next/server'
import { verifyPayment } from '../../../lib/paystack'

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

    // Verify payment with Paystack
    const result = await verifyPayment(reference)

    return NextResponse.json({
      success: true,
      status: result.status,
      reference: result.reference,
      amount: result.amount,
      currency: result.currency,
      paid_at: result.paid_at,
      channel: result.channel,
      customer: result.customer,
      metadata: result.metadata
    })

  } catch (error) {
    console.error('Paystack verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
