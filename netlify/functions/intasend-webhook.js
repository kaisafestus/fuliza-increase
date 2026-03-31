// IntaSend Webhook Handler for Netlify Functions
// This function receives webhook notifications from IntaSend

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the webhook payload
    const payload = JSON.parse(event.body);
    
    // Verify the challenge (IntaSend sends this for verification)
    const challenge = payload.challenge;
    const expectedChallenge = process.env.INTASEND_CHALLENGE;
    
    if (challenge && expectedChallenge && challenge !== expectedChallenge) {
      console.error('Challenge verification failed');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized - Invalid challenge' }),
      };
    }
    
    // If this is a challenge verification request, return the challenge
    if (challenge && !payload.invoice_id) {
      console.log('Challenge verification request received');
      return {
        statusCode: 200,
        body: JSON.stringify({ challenge: challenge }),
      };
    }
    
    // Log the webhook data (for debugging)
    console.log('IntaSend Webhook Received:', JSON.stringify(payload, null, 2));
    
    // Extract key information from the webhook
    const {
      invoice_id,
      state,
      provider,
      charges,
      net_amount,
      currency,
      value,
      account,
      api_ref,
      host,
      created_at,
      updated_at,
    } = payload;
    
    // Verify the webhook (optional but recommended)
    // You can add signature verification here if IntaSend provides it
    
    // Handle different payment states
    switch (state) {
      case 'COMPLETE':
        // Payment was successful
        console.log(`Payment successful for invoice: ${invoice_id}`);
        console.log(`Amount: ${value} ${currency}`);
        console.log(`Account: ${account}`);
        
        // TODO: Add your business logic here
        // - Update your database
        // - Send confirmation email
        // - Update user account
        // - etc.
        
        break;
        
      case 'FAILED':
        // Payment failed
        console.log(`Payment failed for invoice: ${invoice_id}`);
        
        // TODO: Handle failed payment
        // - Notify user
        // - Update order status
        // - etc.
        
        break;
        
      case 'PENDING':
        // Payment is pending
        console.log(`Payment pending for invoice: ${invoice_id}`);
        
        // TODO: Handle pending payment
        
        break;
        
      default:
        console.log(`Unknown payment state: ${state} for invoice: ${invoice_id}`);
    }
    
    // Return success response to IntaSend
    // IntaSend expects a 200 status code to confirm receipt
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Webhook received successfully',
        invoice_id: invoice_id,
        state: state,
      }),
    };
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
