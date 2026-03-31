'use client'

import { useState, useEffect } from 'react'

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
  const [success, setSuccess] = useState(false)
  const [checkoutId, setCheckoutId] = useState(null)
  const [polling, setPolling] = useState(false)

  // Poll for payment status
  useEffect(() => {
    let intervalId
    if (checkoutId && polling) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/intasend/check-status?checkout_id=${checkoutId}`)
          const data = await response.json()

          if (data.success) {
            if (data.status === 'COMPLETE' || data.status === 'completed') {
              setPolling(false)
              setSuccess(true)
              if (onSuccess) {
                onSuccess(data)
              }
            } else if (data.status === 'FAILED' || data.status === 'failed') {
              setPolling(false)
              setError('Payment failed. Please try again.')
              if (onError) {
                onError(new Error('Payment failed'))
              }
            }
          }
        } catch (err) {
          console.error('Error checking payment status:', err)
        }
      }, 5000) // Check every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [checkoutId, polling, onSuccess, onError])

  // Initialize payment
  const initiatePayment = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Create STK push request
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
        throw new Error(data.error || 'Failed to create STK push')
      }

      // STK push sent successfully
      setCheckoutId(data.checkout_id)
      setPolling(true)
      setSuccess(true)
      
      // Show success message
      alert('STK push sent to your phone. Please enter your M-Pesa PIN to complete the payment.')

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
        disabled={loading || polling}
        className="intasend-button"
      >
        {loading ? 'Sending STK Push...' : polling ? 'Waiting for payment...' : `Pay KSh ${amount} via M-Pesa`}
      </button>
      
      {error && (
        <div className="intasend-error">
          {error}
        </div>
      )}
      
      {success && !error && (
        <div className="intasend-success">
          {polling ? 'STK push sent! Please check your phone and enter your M-Pesa PIN.' : 'Payment completed successfully!'}
        </div>
      )}
    </div>
  )
}
