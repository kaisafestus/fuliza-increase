// Paystack Webhook Handler for Netlify
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const payload = JSON.parse(event.body)
    
    // Verify webhook signature (Paystack sends x-paystack-signature header)
    const signature = event.headers['x-paystack-signature']
    
    if (!signature) {
      console.error('Missing Paystack signature')
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing signature' })
      }
    }

    // Verify the signature using HMAC SHA512
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid Paystack signature')
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' })
      }
    }

    // Process the webhook event
    const event_type = payload.event
    const data = payload.data

    console.log(`Paystack webhook received: ${event_type}`)
    console.log('Webhook data:', JSON.stringify(data, null, 2))

    // Handle different event types
    switch (event_type) {
      case 'charge.success':
        // Payment was successful
        console.log('Payment successful:', {
          reference: data.reference,
          amount: data.amount / 100, // Convert from kobo
          currency: data.currency,
          status: data.status,
          paid_at: data.paid_at,
          channel: data.channel,
          customer: data.customer,
          metadata: data.metadata
        })
        
        // Here you would typically:
        // 1. Update your database with the payment details
        // 2. Send confirmation email/SMS
        // 3. Update user's Fuliza limit
        break

      case 'charge.failed':
        // Payment failed
        console.log('Payment failed:', {
          reference: data.reference,
          status: data.status,
          gateway_response: data.gateway_response
        })
        break

      case 'transfer.success':
        // Transfer was successful
        console.log('Transfer successful:', data)
        break

      case 'transfer.failed':
        // Transfer failed
        console.log('Transfer failed:', data)
        break

      default:
        console.log(`Unhandled event type: ${event_type}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook processed successfully' })
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
