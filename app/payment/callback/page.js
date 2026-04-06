'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reference = searchParams.get('reference')
    
    if (!reference) {
      setStatus('error')
      setError('No payment reference found')
      return
    }

    // Verify payment with Lipana
    verifyPayment(reference)
  }, [searchParams])

  const verifyPayment = async (reference) => {
    try {
      const response = await fetch(`/api/lipana/verify?reference=${reference}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment')
      }

      if (data.status === 'success') {
        setStatus('success')
        setPaymentDetails({
          reference: data.reference,
          amount: data.amount,
          currency: data.currency,
          paid_at: data.paid_at,
          channel: data.channel,
          customer: data.customer,
          metadata: data.metadata
        })
      } else if (data.status === 'failed') {
        setStatus('failed')
        setError('Payment was not successful')
      } else {
        setStatus('pending')
        setError('Payment is still being processed')
      }
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className="payment-callback-container">
      <div className="payment-callback-card">
        {status === 'verifying' && (
          <>
            <div className="payment-icon verifying">⏳</div>
            <h1>Verifying Payment</h1>
            <p>Please wait while we verify your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="payment-icon success">✓</div>
            <h1>Payment Successful!</h1>
            <p>Your Fuliza limit has been increased successfully.</p>
            
            {paymentDetails && (
              <div className="payment-details">
                <div className="detail-row">
                  <span className="detail-label">Reference:</span>
                  <span className="detail-value">{paymentDetails.reference}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">KSh {paymentDetails.amount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{paymentDetails.channel}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(paymentDetails.paid_at).toLocaleString()}
                  </span>
                </div>
                {paymentDetails.metadata?.package_limit && (
                  <div className="detail-row">
                    <span className="detail-label">New Limit:</span>
                    <span className="detail-value">KSh {paymentDetails.metadata.package_limit}</span>
                  </div>
                )}
              </div>
            )}

            <a href="/" className="payment-button">
              Return to Home
            </a>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="payment-icon failed">✕</div>
            <h1>Payment Failed</h1>
            <p>{error || 'Your payment was not successful. Please try again.'}</p>
            <a href="/" className="payment-button">
              Try Again
            </a>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="payment-icon pending">⏳</div>
            <h1>Payment Pending</h1>
            <p>{error || 'Your payment is being processed. Please check back later.'}</p>
            <a href="/" className="payment-button">
              Return to Home
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="payment-icon error">⚠</div>
            <h1>Verification Error</h1>
            <p>{error || 'An error occurred while verifying your payment.'}</p>
            <a href="/" className="payment-button">
              Return to Home
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <div className="payment-callback-container">
        <div className="payment-callback-card">
          <div className="payment-icon verifying">⏳</div>
          <h1>Loading...</h1>
          <p>Please wait...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
