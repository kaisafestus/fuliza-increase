// Paystack API Service
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

// Initialize payment transaction
export async function initializePayment(email, amount, reference, callbackUrl, metadata = {}) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo (smallest currency unit)
        reference,
        callback_url: callbackUrl,
        metadata
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize payment')
    }

    return {
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference
    }
  } catch (error) {
    console.error('Paystack initialization error:', error)
    throw error
  }
}

// Verify payment transaction
export async function verifyPayment(reference) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify payment')
    }

    return {
      success: true,
      status: data.data.status,
      reference: data.data.reference,
      amount: data.data.amount / 100, // Convert from kobo
      currency: data.data.currency,
      paid_at: data.data.paid_at,
      channel: data.data.channel,
      customer: data.data.customer,
      metadata: data.data.metadata
    }
  } catch (error) {
    console.error('Paystack verification error:', error)
    throw error
  }
}

// Generate unique reference
export function generateReference(prefix = 'FULIZA') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `${prefix}-${timestamp}-${random}`
}
