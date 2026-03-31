# IntaSend Payment Integration

This document describes the IntaSend payment gateway integration for the Fuliza website.

## Overview

The website now uses IntaSend as the payment gateway instead of PayHero. IntaSend provides a secure, hosted payment page that supports M-PESA and other payment methods.

## Configuration

### Environment Variables

The following environment variables are required:

```env
# IntaSend API Keys
INTASEND_SECRET_KEY=ISSecretKey_live_bca26356-8e6f-4e86-bb7a-7a83217b50b3
NEXT_PUBLIC_INTASEND_PUBLISHABLE_KEY=ISPubKey_live_2ace7e71-4cc3-4897-aac6-785d485f08d0

# IntaSend Webhook Challenge
INTASEND_CHALLENGE=MyFulizaWebsite001
```

### Netlify Environment Variables

Add these variables in Netlify dashboard:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add the following variables:
   - `INTASEND_SECRET_KEY`: Your IntaSend secret key
   - `NEXT_PUBLIC_INTASEND_PUBLISHABLE_KEY`: Your IntaSend publishable key
   - `INTASEND_CHALLENGE`: Your webhook challenge string

## Payment Flow

### 1. User Initiates Payment

1. User selects a Fuliza package
2. User enters ID number and M-PESA phone number
3. User clicks "Pay via IntaSend"

### 2. Create Checkout Session

The frontend calls `/api/intasend/create-checkout` which:

1. Validates the payment details
2. Creates a checkout session with IntaSend API
3. Returns the IntaSend payment page URL

### 3. Redirect to IntaSend

1. User is redirected to IntaSend's hosted payment page
2. User selects payment method (M-PESA, card, etc.)
3. User completes payment

### 4. Payment Callback

After payment, IntaSend redirects to `/payment/callback` with:

1. `checkout_id`: Unique checkout identifier
2. `tracking_id`: IntaSend tracking ID
3. `status`: Payment status (COMPLETE, FAILED, PENDING)
4. `api_ref`: Your reference (e.g., FULIZA-5000)

### 5. Webhook Notification

IntaSend sends a webhook to `/.netlify/functions/intasend-webhook` with:

1. Payment status
2. Transaction details
3. Challenge verification

The webhook:

1. Verifies the challenge
2. Processes the payment
3. Returns a 200 status code

## API Routes

### `/api/intasend/create-checkout`

Creates a new checkout session with IntaSend.

**Request:**
```json
{
  "amount": 49,
  "currency": "KES",
  "email": "user@example.com",
  "phone": "254712345678",
  "api_ref": "FULIZA-5000",
  "redirect_url": "https://fulizacom.netlify.app/payment/callback",
  "webhook_url": "https://fulizacom.netlify.app/.netlify/functions/intasend-webhook"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://payment.intasend.com/checkout/...",
  "checkout_id": "checkout_id",
  "api_ref": "FULIZA-5000"
}
```

### `/api/intasend/check-status`

Checks the status of a payment.

**Request:**
```
GET /api/intasend/check-status?checkout_id=checkout_id
```

**Response:**
```json
{
  "success": true,
  "checkout_id": "checkout_id",
  "status": "COMPLETE",
  "api_ref": "FULIZA-5000",
  "amount": 49,
  "currency": "KES",
  "email": "user@example.com",
  "phone": "254712345678"
}
```

## Webhook Handler

The webhook handler at `netlify/functions/intasend-webhook.js`:

1. Verifies the challenge from IntaSend
2. Handles different payment states:
   - `COMPLETE`: Payment successful
   - `FAILED`: Payment failed
   - `PENDING`: Payment pending
3. Logs payment details
4. Returns appropriate response

## Payment States

### COMPLETE

Payment was successful. The webhook:

1. Logs the successful payment
2. Can trigger additional actions:
   - Update database
   - Send confirmation email
   - Update user account

### FAILED

Payment failed. The webhook:

1. Logs the failed payment
2. Can trigger notifications to user

### PENDING

Payment is pending. The webhook:

1. Logs the pending payment
2. Can set up status checks

## Security

### Challenge Verification

The webhook verifies the challenge from IntaSend:

1. IntaSend sends a challenge in the webhook payload
2. The webhook compares it with `INTASEND_CHALLENGE` environment variable
3. If they don't match, the webhook returns 401 Unauthorized

### API Key Security

1. Secret key is stored in environment variables
2. Never exposed to the frontend
3. Used only in server-side API routes

## Testing

### Local Testing

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify dev`
3. Test webhook with ngrok or Postman

### Test Cards

IntaSend provides test cards for testing:

- **Success**: Use any valid card
- **Failure**: Use specific test card numbers

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL in IntaSend dashboard
2. Verify function is deployed
3. Check Netlify function logs
4. Ensure function returns 200 status

### Payment Not Completing

1. Check IntaSend dashboard for payment status
2. Verify API keys are correct
3. Check browser console for errors
4. Review Netlify function logs

### Challenge Verification Failing

1. Verify `INTASEND_CHALLENGE` is set in Netlify
2. Check that challenge matches IntaSend dashboard
3. Review webhook logs

## Support

- IntaSend Documentation: https://intasend.com/docs
- Netlify Functions: https://docs.netlify.com/functions/overview/
- IntaSend Dashboard: https://intasend.com/dashboard
