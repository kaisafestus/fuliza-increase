'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Processing your payment...')
  const [details, setDetails] = useState(null)

  useEffect(() => {
    // Get payment status from URL parameters
    const checkout_id = searchParams.get('checkout_id')
    const tracking_id = searchParams.get('tracking_id')
    const statusParam = searchParams.get('status')
    const api_ref = searchParams.get('api_ref')

    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        if (statusParam === 'COMPLETE' || statusParam === 'completed') {
          setStatus('success')
          setMessage('Payment successful! Your Fuliza limit will be increased within 5 minutes.')
          setDetails({
            checkout_id,
            tracking_id,
            api_ref,
            status: statusParam,
          })
        } else if (statusParam === 'FAILED' || statusParam === 'failed') {
          setStatus('failed')
          setMessage('Payment failed. Please try again.')
          setDetails({
            checkout_id,
            tracking_id,
            api_ref,
            status: statusParam,
          })
        } else if (statusParam === 'PENDING' || statusParam === 'pending') {
          setStatus('pending')
          setMessage('Payment is pending. We will notify you once confirmed.')
          setDetails({
            checkout_id,
            tracking_id,
            api_ref,
            status: statusParam,
          })
        } else {
          // If no status parameter, check with backend
          const response = await fetch(`/api/intasend/check-status?checkout_id=${checkout_id}`)
          const data = await response.json()
          
          if (data.status === 'COMPLETE') {
            setStatus('success')
            setMessage('Payment successful! Your Fuliza limit will be increased within 5 minutes.')
          } else if (data.status === 'FAILED') {
            setStatus('failed')
            setMessage('Payment failed. Please try again.')
          } else {
            setStatus('pending')
            setMessage('Payment is being processed...')
          }
          
          setDetails(data)
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        setStatus('error')
        setMessage('Unable to verify payment status. Please contact support.')
      }
    }

    if (checkout_id || statusParam) {
      checkPaymentStatus()
    } else {
      setStatus('error')
      setMessage('Invalid payment callback. Missing required parameters.')
    }
  }, [searchParams])

  return (
    <div className="payment-callback">
      <div className="payment-callback-container">
        {status === 'processing' && (
          <div className="payment-status processing">
            <div className="payment-spinner"></div>
            <h2>Processing Payment</h2>
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="payment-status success">
            <div className="payment-icon success">✓</div>
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            {details && (
              <div className="payment-details">
                <p><strong>Reference:</strong> {details.api_ref || details.checkout_id}</p>
                {details.tracking_id && (
                  <p><strong>Tracking ID:</strong> {details.tracking_id}</p>
                )}
              </div>
            )}
            <a href="/" className="payment-button">
              Return to Home
            </a>
          </div>
        )}

        {status === 'failed' && (
          <div className="payment-status failed">
            <div className="payment-icon failed">✕</div>
            <h2>Payment Failed</h2>
            <p>{message}</p>
            {details && (
              <div className="payment-details">
                <p><strong>Reference:</strong> {details.api_ref || details.checkout_id}</p>
              </div>
            )}
            <a href="/" className="payment-button">
              Try Again
            </a>
          </div>
        )}

        {status === 'pending' && (
          <div className="payment-status pending">
            <div className="payment-icon pending">⏳</div>
            <h2>Payment Pending</h2>
            <p>{message}</p>
            {details && (
              <div className="payment-details">
                <p><strong>Reference:</strong> {details.api_ref || details.checkout_id}</p>
              </div>
            )}
            <a href="/" className="payment-button">
              Return to Home
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="payment-status error">
            <div className="payment-icon error">!</div>
            <h2>Error</h2>
            <p>{message}</p>
            <a href="/" className="payment-button">
              Return to Home
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
