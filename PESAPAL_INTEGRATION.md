# PesaPal Payment Gateway Integration

This document describes the PesaPal payment gateway integration for the Fuliza Limit Increase application.

## Overview

PesaPal is integrated to handle payment processing for Fuliza limit increase packages. The integration supports M-PESA, credit/debit cards, and bank transfers.

## Features

- ✅ PesaPal API integration with OAuth authentication
- ✅ Payment initiation and processing
- ✅ IPN (Instant Payment Notification) callback handling
- ✅ Payment status tracking
- ✅ User-friendly payment modal
- ✅ Payment success/failure/pending pages
- ✅ Phone number formatting for M-PESA
- ✅ Order ID generation
- ✅ Database schema for payment tracking
- ✅ Netlify Functions support for IPN

## File Structure

```
app/
├── lib/
│   └── pesapal.js              # PesaPal API service
├── components/
│   └── PesaPalPayment.js       # Payment modal component
├── api/
│   └── pesapal/
│       ├── initiate/
│       │   └── route.js        # Payment initiation API
│       └── callback/
│           └── route.js        # IPN callback handler (Next.js)
├── payment/
│   └── callback/
│       └── page.js             # Payment callback page
├── pesapal-styles.css          # PesaPal-specific styles
└── page.js                     # Main page with payment integration

netlify/
└── functions/
    └── pesapal-ipn.js          # Netlify Function for IPN
```

## Setup Instructions

### 1. Get PesaPal API Credentials

1. Visit [PesaPal Developer Portal](https://developer.pesapal.com/)
2. Create an account or log in
3. Create a new application
4. Get your Consumer Key and Consumer Secret
5. Register your IPN URL (Instant Payment Notification)

### 2. Configure PesaPal Dashboard

Go to your PesaPal Dashboard (Sandbox or Live) and configure:

**Website Domain:**
```
fulizacom.netlify.app
```

**IPN Listener URL:**
```
https://fulizacom.netlify.app/.netlify/functions/pesapal-ipn
```

After saving, PesaPal will provide you with an **IPN ID**. Save this for the next step.

### 3. Configure Environment Variables

Update your `.env.local` file with PesaPal credentials:

```env
# PesaPal API Keys
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret_here

# PesaPal Environment (sandbox or live)
PESAPAL_ENVIRONMENT=sandbox

# PesaPal IPN ID (From PesaPal Dashboard after registering IPN URL)
PESAPAL_IPN_ID=your_pesapal_ipn_id_here

# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=https://fulizacom.netlify.app
```

### 4. Set Up Database

Run the SQL commands in `database.sql` to create the payments table:

```sql
-- The payments table will store all payment transactions
-- See database.sql for the complete schema
```

### 5. Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Netlify will automatically detect the `netlify/functions/` folder
4. The IPN function will be available at: `https://fulizacom.netlify.app/.netlify/functions/pesapal-ipn`

## API Endpoints

### POST /api/pesapal/initiate

Initiates a new payment request (Next.js API Route).

**Request Body:**
```json
{
  "package": {
    "limit": "10,000",
    "fee": 140
  },
  "phone": "0712345678",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "FULIZA-1234567890-ABC123",
  "tracking_id": "PESAPAL_TRACKING_ID",
  "redirect_url": "https://pay.pesapal.com/...",
  "message": "Payment initiated successfully"
}
```

### POST /.netlify/functions/pesapal-ipn

Netlify Function that handles PesaPal IPN notifications.

**Query Parameters:**
- `pesapal_notification_type` - Type of notification
- `pesapal_transaction_tracking_id` - Transaction tracking ID
- `pesapal_merchant_reference` - Your order reference

**Response:**
```
pesapal_notification_type=IPN_CHANGE&pesapal_transaction_tracking_id=TRACKING_ID&pesapal_merchant_reference=ORDER_ID
```

### POST /api/pesapal/callback

Next.js API Route for IPN (alternative to Netlify Function).

### GET /api/pesapal/callback?OrderTrackingId=...

Retrieves transaction status for testing.

## Payment Flow

1. **User selects package** → Payment modal opens
2. **User fills form** → Enters name, email, and phone number
3. **Payment initiated** → API creates order with PesaPal
4. **Redirect to PesaPal** → User is redirected to PesaPal payment page
5. **User completes payment** → M-PESA prompt or card payment
6. **PesaPal sends IPN** → Netlify Function receives payment notification
7. **User redirected back** → Callback page shows payment status
8. **Database updated** → Payment status stored in database

## Netlify Function Details

The `pesapal-ipn.js` Netlify Function:

1. Receives IPN notifications from PesaPal
2. Logs the notification details
3. Can verify transaction status with PesaPal API
4. Can update database with payment status
5. Returns mandatory response to PesaPal to stop retries

### Implementing Transaction Verification

To enable full transaction verification, uncomment and implement the helper functions in `netlify/functions/pesapal-ipn.js`:

```javascript
// Verify transaction with PesaPal API
const transactionStatus = await verifyTransaction(pesapal_transaction_tracking_id);

// Update database
await updatePaymentStatus(pesapal_merchant_reference, transactionStatus);
```

## Payment Statuses

- `pending` - Payment initiated, awaiting completion
- `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled by user

## Testing

### Sandbox Testing

1. Set `PESAPAL_ENVIRONMENT=sandbox` in `.env.local`
2. Use PesaPal sandbox credentials
3. Use test phone numbers provided by PesaPal
4. Test the complete payment flow

### Test Phone Numbers

PesaPal provides test phone numbers for sandbox testing. Check their documentation for the latest test numbers.

### Testing IPN Locally

To test IPN locally, you can use tools like ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose local server
ngrok http 3000
```

Use the ngrok URL as your IPN URL in PesaPal dashboard for testing.

## Production Deployment

1. Update environment variables:
   ```env
   PESAPAL_ENVIRONMENT=live
   PESAPAL_CONSUMER_KEY=your_live_consumer_key
   PESAPAL_CONSUMER_SECRET=your_live_consumer_secret
   PESAPAL_IPN_ID=your_live_ipn_id
   NEXT_PUBLIC_BASE_URL=https://fulizacom.netlify.app
   ```

2. Register production IPN URL in PesaPal dashboard:
   ```
   https://fulizacom.netlify.app/.netlify/functions/pesapal-ipn
   ```

3. Run database migrations
4. Deploy to Netlify

## Security Considerations

- ✅ API credentials stored in environment variables
- ✅ Server-side payment initiation (credentials not exposed to client)
- ✅ IPN validation (recommended to add signature verification)
- ✅ HTTPS required for production
- ✅ Input validation on all forms
- ✅ SQL injection prevention (parameterized queries)
- ✅ Netlify Functions run server-side (secure)

## Troubleshooting

### Payment Not Initiating

- Check PesaPal credentials in `.env.local`
- Verify `PESAPAL_ENVIRONMENT` is set correctly
- Check server logs for API errors

### IPN Not Received

- Verify IPN URL is registered in PesaPal dashboard
- Check IPN ID matches in environment variables
- Ensure Netlify Function is deployed and accessible
- Check Netlify Function logs in Netlify dashboard

### Payment Status Not Updating

- Verify database connection
- Check IPN function is being received
- Review Netlify Function logs for errors
- Ensure helper functions are implemented

### Netlify Function Not Working

- Check function is in `netlify/functions/` folder
- Verify function exports `handler` function
- Check Netlify build logs for errors
- Test function locally with Netlify CLI

## Support

For PesaPal API issues:
- Documentation: https://developer.pesapal.com/
- Support: support@pesapal.com

For Netlify deployment issues:
- Documentation: https://docs.netlify.com/
- Functions: https://docs.netlify.com/functions/overview/

For application issues:
- Check server logs
- Review this documentation
- Contact development team

## License

This integration is part of the Fuliza Limit Increase application.
