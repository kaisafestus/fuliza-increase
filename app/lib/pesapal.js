// PesaPal API Integration Service
// Documentation: https://developer.pesapal.com/

const PESAPAL_API_BASE = process.env.PESAPAL_ENVIRONMENT === 'live' 
  ? 'https://pay.pesapal.com/v3/api'
  : 'https://cybqa.pesapal.com/pesapalv3/api';

/**
 * Get PesaPal OAuth token
 * @returns {Promise<string>} Access token
 */
export async function getPesapalToken() {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('PesaPal credentials not configured');
  }

  const response = await fetch(`${PESAPAL_API_BASE}/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PesaPal auth failed: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Register IPN (Instant Payment Notification) URL
 * @param {string} ipnUrl - The IPN URL to register
 * @returns {Promise<object>} IPN registration response
 */
export async function registerIPN(ipnUrl) {
  const token = await getPesapalToken();

  const response = await fetch(`${PESAPAL_API_BASE}/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: 'POST',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`IPN registration failed: ${error.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Submit order request to PesaPal
 * @param {object} orderData - Order details
 * @returns {Promise<object>} Order submission response with redirect URL
 */
export async function submitOrder(orderData) {
  const token = await getPesapalToken();
  const ipnId = process.env.PESAPAL_IPN_ID;

  const {
    id,
    currency,
    amount,
    description,
    callback_url,
    notification_id,
    billing_address,
  } = orderData;

  const response = await fetch(`${PESAPAL_API_BASE}/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      id,
      currency: currency || 'KES',
      amount,
      description,
      callback_url,
      notification_id: notification_id || ipnId,
      billing_address,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Order submission failed: ${error.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Get transaction status
 * @param {string} orderTrackingId - The order tracking ID from PesaPal
 * @returns {Promise<object>} Transaction status
 */
export async function getTransactionStatus(orderTrackingId) {
  const token = await getPesapalToken();

  const response = await fetch(
    `${PESAPAL_API_BASE}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get transaction status: ${error.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Generate unique order ID
 * @returns {string} Unique order ID
 */
export function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FULIZA-${timestamp}-${random}`;
}

/**
 * Format phone number for PesaPal (254 format)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  // If starts with +254, remove the +
  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  }
  
  // If doesn't start with 254, add it
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
}
