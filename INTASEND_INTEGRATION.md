# IntaSend Payment Integration

This document describes the IntaSend payment gateway integration for the Fuliza website.

## Overview

The website uses IntaSend's M-Pesa STK Push API for seamless mobile payments. This allows users to complete payments directly from their phone without being redirected to a separate payment page.

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
3. User clicks "Pay via M-Pesa"

### 2. Create STK Push Request

The frontend calls `/api/intasend/create-checkout` which:

1. Validates the payment details
2. Formats the phone number (removes leading 0 or +254)
3. Creates an STK push request with IntaSend API (`/api/v1/payment/collection/`)
4. Returns the checkout ID for status tracking

### 3. STK Push Notification

1. User receives an STK push notification on their phone
2. User enters their M-Pesa PIN to authorize the payment
3. Payment is processed by M-Pesa

### 4. Payment Status Polling

The frontend polls `/api/intasend/check-status` every 5 seconds to check payment status:

1. Checks payment status using the checkout ID
2. Updates UI based on status:
   - `COMPLETE`: Payment successful
   - `FAILED`: Payment failed
   - `PENDING`: Payment still processing

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

Creates an M-Pesa STK push request with IntaSend.

**Request:**
```json
{
  "amount": 49,
  "currency": "KES",
  "email": "user@example.com",
  "phone": "0712345678",
  "api_ref": "FULIZA-5000",
  "redirect_url": "https://fulizacom.netlify.app/payment/callback",
  "webhook_url": "https://fulizacom.netlify.app/.netlify/functions/intasend-webhook"
}
```

**Response:**
```json
{
  "success": true,
  "checkout_id": "checkout_id",
  "api_ref": "FULIZA-5000",
  "state": "PENDING",
  "message": "STK push sent successfully"
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
  "phone": "254712345678",
  "mpesa_reference": "ABC123XYZ"
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

### Test Phone Numbers

IntaSend provides test phone numbers for testing:

- **Success**: Use a valid M-Pesa registered phone number
- **Failure**: Use specific test numbers provided by IntaSend

## Troubleshooting

### STK Push Not Received

1. Check that phone number is correctly formatted (254XXXXXXXXX)
2. Verify the phone number is registered with M-Pesa
3. Check IntaSend dashboard for error messages
4. Verify API keys are correct

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
