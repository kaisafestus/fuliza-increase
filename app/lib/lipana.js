const LIPANA_BASE_URL = 'https://api.lipana.com'

function getKeys() {
  const publicKey = process.env.LIPANA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_LIPANA_PUBLISHABLE_KEY
  const secretKey = process.env.LIPANA_SECRET_KEY || process.env.NEXT_PUBLIC_LIPANA_SECRET_KEY

  if (!publicKey) {
    throw new Error('LIPANA_PUBLISHABLE_KEY is not defined. Please set environment variable in Netlify.')
  }
  if (!secretKey) {
    throw new Error('LIPANA_SECRET_KEY is not defined. Please set environment variable in Netlify.')
  }

  return { publicKey, secretKey }
}

export async function initializePayment(email, amount, phone, name, packageLimit) {
  const { publicKey, secretKey } = getKeys()

  const callbackUrl = 'https://fulizacom.netlify.app/api/webhooks/mpesa'

  console.log('[Lipana] Initializing payment with callback:', callbackUrl)

  try {
    const response = await fetch(`${LIPANA_BASE_URL}/v1/payments/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_key: publicKey,
        timestamp: new Date().toISOString(),
        duration_expiry: 30,
        currency: 'KES',
        amount: amount,
        message: `Fuliza Limit Increase - KES ${amount}`,
        merchant_reference: `FULIZA-${Date.now()}`,
        callback_url: callbackUrl,
        mobile: phone
      })
    })

    const data = await response.json()

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to initialize payment')
    }

    return {
      success: true,
      checkout_id: data.checkout_id,
      merchant_reference: data.merchant_reference,
      client_reference: data.client_reference,
      otp: data.otp,
      status: data.status
    }
  } catch (error) {
    console.error('Lipana initialization error:', error)
    throw error
  }
}

export async function verifyPayment(merchantReference) {
  const { secretKey } = getKeys()

  try {
    const response = await fetch(`${LIPANA_BASE_URL}/v1/payments/status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_reference: merchantReference
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify payment')
    }

    return {
      success: data.status === 'success',
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      merchant_reference: data.merchant_reference,
      payment_method: data.payment_method,
      completed_at: data.completed_at
    }
  } catch (error) {
    console.error('Lipana verification error:', error)
    throw error
  }
}

export function generateReference(prefix = 'FULIZA') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `${prefix}-${timestamp}-${random}`
}