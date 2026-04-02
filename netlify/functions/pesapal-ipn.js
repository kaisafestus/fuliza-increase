// Netlify Function for PesaPal IPN (Instant Payment Notification)
// This function receives payment notifications from PesaPal

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the incoming data from PesaPal
    // PesaPal sends data as URL query parameters
    const { 
      pesapal_notification_type, 
      pesapal_transaction_tracking_id, 
      pesapal_merchant_reference 
    } = event.queryStringParameters || {};

    console.log('PesaPal IPN Received:', {
      notification_type: pesapal_notification_type,
      tracking_id: pesapal_transaction_tracking_id,
      merchant_reference: pesapal_merchant_reference,
    });

    // Validate required parameters
    if (!pesapal_transaction_tracking_id || !pesapal_merchant_reference) {
      console.error('Missing required IPN parameters');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Here you would typically:
    // 1. Call PesaPal API to verify the transaction status
    // 2. Update your database with the payment status
    // 3. Send confirmation email/SMS to the customer
    // 4. Update the user's Fuliza limit if payment is successful

    // Example: Verify transaction status with PesaPal API
    // const transactionStatus = await verifyTransaction(pesapal_transaction_tracking_id);
    
    // Example: Update database
    // await updatePaymentStatus(pesapal_merchant_reference, transactionStatus);

    console.log('IPN processed successfully for:', pesapal_merchant_reference);

    // Mandatory Response to PesaPal
    // You MUST return the same parameters back to stop retries
    const responseBody = `pesapal_notification_type=${pesapal_notification_type}&pesapal_transaction_tracking_id=${pesapal_transaction_tracking_id}&pesapal_merchant_reference=${pesapal_merchant_reference}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: responseBody,
    };

  } catch (error) {
    console.error('Error processing PesaPal IPN:', error);
    
    // Still return the parameters to acknowledge receipt
    // This prevents PesaPal from retrying
    const { 
      pesapal_notification_type, 
      pesapal_transaction_tracking_id, 
      pesapal_merchant_reference 
    } = event.queryStringParameters || {};

    const responseBody = `pesapal_notification_type=${pesapal_notification_type}&pesapal_transaction_tracking_id=${pesapal_transaction_tracking_id}&pesapal_merchant_reference=${pesapal_merchant_reference}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: responseBody,
    };
  }
};

// Helper function to verify transaction status with PesaPal API
// Uncomment and implement this function
/*
async function verifyTransaction(trackingId) {
  const PESAPAL_API_BASE = process.env.PESAPAL_ENVIRONMENT === 'live' 
    ? 'https://pay.pesapal.com/v3/api'
    : 'https://cybqa.pesapal.com/pesapalv3/api';

  // Get OAuth token
  const tokenResponse = await fetch(`${PESAPAL_API_BASE}/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });

  const tokenData = await tokenResponse.json();
  const token = tokenData.token;

  // Get transaction status
  const statusResponse = await fetch(
    `${PESAPAL_API_BASE}/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  return await statusResponse.json();
}
*/

// Helper function to update payment status in database
// Uncomment and implement this function
/*
async function updatePaymentStatus(orderId, status) {
  // Example using Supabase
  // const { createClient } = require('@supabase/supabase-js');
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY
  // );

  // const { error } = await supabase
  //   .from('payments')
  //   .update({
  //     status: status.payment_status_description?.toLowerCase(),
  //     confirmation_code: status.confirmation_code,
  //     updated_at: new Date().toISOString(),
  //     raw_response: status,
  //   })
  //   .eq('order_id', orderId);

  // if (error) {
  //   console.error('Error updating payment status:', error);
  //   throw error;
  // }

  console.log('Payment status updated for order:', orderId);
}
*/
