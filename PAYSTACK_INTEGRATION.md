# Paystack Integration Guide

This document provides instructions for setting up and using the Paystack payment gateway integration in the Fuliza application.

## Overview

The Paystack integration allows users to pay for Fuliza limit increases using various payment methods including:
- Credit/Debit Cards
- Bank Transfer
- USSD
- Mobile Money (M-Pesa, etc.)

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
# Paystack API Keys
PAYSTACK_SECRET_KEY=sk_test_a00c3776b52e194d9a2d73b2171c02701e7a1ac1
PAYSTACK_PUBLIC_KEY=pk_test_86b833342a5e9880e7f9b832e53641cf11132694

# Paystack Environment (test or live)
PAYSTACK_ENVIRONMENT=test

# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=https://fulizacom.netlify.app
```

### Paystack Dashboard Configuration

1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com/)
2. Go to **Settings** → **API Keys & Webhooks**
3. Configure the following:
   - **Test Callback URL**: `https://fulizacom.netlify.app/payment/callback`
   - **Test Webhook URL**: `https://fulizacom.netlify.app/.netlify/functions/paystack-webhook`

## File Structure

```
app/
├── lib/
│   └── paystack.js              # Paystack API service
├── components/
│   └── PaystackPayment.js       # Payment component
├── api/
│   └── paystack/
│       ├── initialize/
│       │   └── route.js         # Payment initialization endpoint
│       └── verify/
│           └── route.js         # Payment verification endpoint
└── payment/
    └── callback/
        └── page.js              # Payment callback page

netlify/
└── functions/
    └── paystack-webhook.js      # Webhook handler
```

## Payment Flow

1. **User selects package**: User clicks "Get Now" on a Fuliza package
2. **Payment initialization**: 
   - Frontend calls `/api/paystack/initialize`
   - Backend creates Paystack transaction
   - User is redirected to Paystack payment page
3. **Payment processing**:
   - User completes payment on Paystack
   - Paystack sends webhook to Netlify function
   - User is redirected to callback page
4. **Payment verification**:
   - Callback page verifies payment with `/api/paystack/verify`
   - Displays success/failure status to user

## API Endpoints

### POST /api/paystack/initialize

Initializes a new payment transaction.

**Request Body:**
```json
{
  "amount": 49,
  "email": "user@example.com",
  "phone": "0700000000",
  "name": "John Doe",
  "packageLimit": "5,000"
}
```

**Response:**
```json
{
  "success": true,
  "authorization_url": "https://checkout.paystack.com/...",
  "reference": "FULIZA-1234567890-abc123"
}
```

### GET /api/paystack/verify?reference=xxx

Verifies a payment transaction.

**Response:**
```json
{
  "success": true,
  "status": "success",
  "reference": "FULIZA-1234567890-abc123",
  "amount": 49,
  "currency": "KES",
  "paid_at": "2024-01-01T00:00:00Z",
  "channel": "card",
  "customer": {
    "email": "user@example.com"
  },
  "metadata": {
    "phone": "0700000000",
    "name": "John Doe",
    "package_limit": "5,000"
  }
}
```

## Webhook Events

The Netlify function handles the following Paystack webhook events:

- `charge.success`: Payment was successful
- `charge.failed`: Payment failed
- `transfer.success`: Transfer was successful
- `transfer.failed`: Transfer failed

## Testing

### Test Cards

Use the following test cards for testing:

**Successful Payment:**
- Card Number: `4084 0840 8408 4081`
- Expiry: Any future date
- CVV: `408`
- PIN: `0000`
- OTP: `123456`

**Failed Payment:**
- Card Number: `4084 0840 8408 4082`
- Expiry: Any future date
- CVV: `408`

### Test Bank Transfer

Use the following bank details for testing:
- Bank: Any bank
- Account Number: Any valid account number

## Production Deployment

When deploying to production:

1. Update environment variables with live API keys:
   ```env
   PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
   PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
   PAYSTACK_ENVIRONMENT=live
   ```

2. Update callback URLs in Paystack dashboard to production URLs

3. Ensure webhook URL is accessible and properly configured

## Troubleshooting

### Common Issues

1. **"Invalid signature" error**
   - Verify that `PAYSTACK_SECRET_KEY` is correctly set
   - Check that webhook URL is correctly configured in Paystack dashboard

2. **"Payment verification failed"**
   - Ensure the payment reference is valid
   - Check that the payment was actually completed on Paystack

3. **"Module not found" error**
   - Verify that `tsconfig.json` has correct path mappings
   - Ensure all files are in the correct locations

### Debug Mode

Enable debug logging by adding to your environment:
```env
DEBUG=paystack:*
```

## Support

For Paystack API documentation, visit: https://paystack.com/docs/api

For issues with the integration, check:
1. Paystack dashboard for transaction logs
2. Netlify function logs for webhook events
3. Browser console for frontend errors
