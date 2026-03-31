'use client'

import { useState } from 'react'

// IntaSend Payment Component
export default function IntaSendPayment({ 
  amount, 
  currency = 'KES', 
  email, 
  phone, 
  apiRef, 
  onSuccess, 
  onError,
  onClose 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // IntaSend configuration
  const INTASEND_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_INTASEND_PUBLISHABLE_KEY || 'ISPubKey_live_2ace7e71-4cc3-4897-aac6-785d485f08d0'
  const INTASEND_API_URL = 'https://payment.intasend.com/api/v1/checkout/'

  // Initialize payment
  const initiatePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Create payment session
      const response = await fetch('/api/intasend/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          email: email,
          phone: phone,
          api_ref: apiRef,
          redirect_url: `${window.location.origin}/payment/callback`,
          webhook_url: `${window.location.origin}/.netlify/functions/intasend-webhook`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to IntaSend payment page
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No payment URL received')
      }
    } catch (err) {
      setError(err.message)
      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="intasend-payment">
      <button
        onClick={initiatePayment}
        disabled={loading}
        className="intasend-button"
      >
        {loading ? 'Processing...' : `Pay KSh ${amount} via IntaSend`}
      </button>
      
      {error && (
        <div className="intasend-error">
          {error}
        </div>
      )}
    </div>
  )
}
