'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const orderId = searchParams.get('order_id')
    const trackingId = searchParams.get('OrderTrackingId')
    const pesapalMerchantReference = searchParams.get('PesapalMerchantReference')

    if (!orderId && !trackingId) {
      setError('No order information found')
      setStatus('error')
      return
    }

    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/pesapal/callback?OrderTrackingId=${trackingId || orderId}`
        )
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check payment status')
        }

        setPaymentDetails(data)
        
        // Set status based on payment status
        if (data.payment_status_description === 'Completed') {
          setStatus('success')
        } else if (data.payment_status_description === 'Failed') {
          setStatus('failed')
        } else {
          setStatus('pending')
        }
      } catch (err) {
        console.error('Error checking payment status:', err)
        setError(err.message)
        setStatus('error')
      }
    }

    checkPaymentStatus()

    // Poll for status updates if pending
    const interval = setInterval(() => {
      if (status === 'pending') {
        checkPaymentStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [searchParams, status])

  const handleReturnHome = () => {
    window.location.href = '/'
  }

  const handleRetry = () => {
    window.location.href = '/'
  }

  if (status === 'processing') {
    return (
      <div className="callback-container">
        <div className="callback-card">
          <div className="callback-icon processing">
            <div className="spinner"></div>
          </div>
          <h1>Processing Payment</h1>
          <p>Please wait while we confirm your payment...</p>
          <div className="callback-info">
            <p>This may take a few moments.</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="callback-container">
        <div className="callback-card">
          <div className="callback-icon error">❌</div>
          <h1>Payment Error</h1>
          <p>{error || 'An error occurred while processing your payment'}</p>
          <div className="callback-actions">
            <button onClick={handleRetry} className="callback-btn primary">
              Try Again
            </button>
            <button onClick={handleReturnHome} className="callback-btn secondary">
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="callback-container">
        <div className="callback-card">
          <div className="callback-icon failed">❌</div>
          <h1>Payment Failed</h1>
          <p>Your payment was not successful.</p>
          {paymentDetails && (
            <div className="callback-details">
              <div className="detail-row">
                <span>Order ID:</span>
                <span>{paymentDetails.order_tracking_id || 'N/A'}</span>
              </div>
              {paymentDetails.confirmation_code && (
                <div className="detail-row">
                  <span>Confirmation Code:</span>
                  <span>{paymentDetails.confirmation_code}</span>
                </div>
              )}
            </div>
          )}
          <div className="callback-actions">
            <button onClick={handleRetry} className="callback-btn primary">
              Try Again
            </button>
            <button onClick={handleReturnHome} className="callback-btn secondary">
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="callback-container">
        <div className="callback-card">
          <div className="callback-icon pending">⏳</div>
          <h1>Payment Pending</h1>
          <p>Your payment is being processed.</p>
          {paymentDetails && (
            <div className="callback-details">
              <div className="detail-row">
                <span>Order ID:</span>
                <span>{paymentDetails.order_tracking_id || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className="status-pending">Pending</span>
              </div>
            </div>
          )}
          <div className="callback-info">
            <p>You will receive a confirmation once the payment is complete.</p>
          </div>
          <div className="callback-actions">
            <button onClick={handleReturnHome} className="callback-btn primary">
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success status
  return (
    <div className="callback-container">
      <div className="callback-card">
        <div className="callback-icon success">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your Fuliza limit has been increased successfully.</p>
        {paymentDetails && (
          <div className="callback-details">
            <div className="detail-row">
              <span>Order ID:</span>
              <span>{paymentDetails.order_tracking_id || 'N/A'}</span>
            </div>
            {paymentDetails.confirmation_code && (
              <div className="detail-row">
                <span>Confirmation Code:</span>
                <span>{paymentDetails.confirmation_code}</span>
              </div>
            )}
            {paymentDetails.amount && (
              <div className="detail-row">
                <span>Amount Paid:</span>
                <span>KSh {paymentDetails.amount}</span>
              </div>
            )}
          </div>
        )}
        <div className="callback-success-info">
          <p>✓ Your Fuliza limit has been updated</p>
          <p>✓ You will receive an M-PESA confirmation</p>
          <p>✓ Check your M-PESA messages</p>
        </div>
        <div className="callback-actions">
          <button onClick={handleReturnHome} className="callback-btn primary">
            Return Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <div className="callback-container">
        <div className="callback-card">
          <div className="callback-icon processing">
            <div className="spinner"></div>
          </div>
          <h1>Loading...</h1>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
