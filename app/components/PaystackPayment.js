'use client'

import { useState } from 'react'

export default function PaystackPayment({ 
  amount, 
  email, 
  phone,
  name,
  packageLimit,
  onSuccess, 
  onError,
  onClose 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize payment
  const initiatePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Create payment initialization
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          email,
          phone,
          name,
          packageLimit
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url

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
    <div className="paystack-payment">
      <button
        onClick={initiatePayment}
        disabled={loading}
        className="paystack-button"
      >
        {loading ? 'Initializing Payment...' : `Pay KSh ${amount} via Paystack`}
      </button>
      
      {error && (
        <div className="paystack-error">
          {error}
        </div>
      )}
    </div>
  )
}
