// Lipana Webhook Handler for Netlify
const LIPANA_SECRET_KEY = process.env.LIPANA_SECRET_KEY
const LIPANA_WEBHOOK_SECRET = process.env.LIPANA_WEBHOOK_SECRET

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const payload = JSON.parse(event.body)
    
    const signature = event.headers['x-lipana-signature']
    
    if (!signature) {
      console.error('Missing Lipana signature')
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing signature' })
      }
    }

    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha512', LIPANA_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid Lipana signature')
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' })
      }
    }

    const eventType = payload.event
    const data = payload.data

    console.log(`Lipana webhook received: ${eventType}`)
    console.log('Webhook data:', JSON.stringify(data, null, 2))

    switch (eventType) {
      case 'payment.success':
        console.log('Payment successful:', {
          merchant_reference: data.merchant_reference,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          mobile: data.mobile
        })
        break

      case 'payment.failed':
        console.log('Payment failed:', {
          merchant_reference: data.merchant_reference,
          status: data.status,
          reason: data.reason
        })
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
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