# IntaSend Webhook for Netlify

This Netlify serverless function handles webhook notifications from IntaSend payment gateway.

## Webhook URL

After deploying to Netlify, your webhook URL will be:

```
https://fulizacom.netlify.app/.netlify/functions/intasend-webhook
```

## Setup Instructions

### 1. Add Webhook to IntaSend Dashboard

1. Log in to your IntaSend dashboard
2. Go to **Settings** → **Webhooks**
3. Add a new webhook with the URL: `https://fulizacom.netlify.app/.netlify/functions/intasend-webhook`
4. Select the events you want to receive (e.g., payment completed, failed, pending)
5. Save the webhook configuration

### 2. Environment Variables (Optional)

If you need to verify webhook signatures or store sensitive data, add these environment variables in Netlify:

1. Go to your Netlify dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment**
3. Add the following variables:
   - `INTASEND_API_KEY`: Your IntaSend API key
   - `INTASEND_WEBHOOK_SECRET`: Your webhook secret (if IntaSend provides one)

### 3. Webhook Payload

The webhook receives a POST request with a JSON payload containing:

```json
{
  "invoice_id": "invoice_id",
  "state": "COMPLETE|FAILED|PENDING",
  "provider": "payment_provider",
  "charges": 0.00,
  "net_amount": 0.00,
  "currency": "KES",
  "value": 1000.00,
  "account": "customer_account",
  "api_ref": "your_reference",
  "host": "intasend.com",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "challenge": "verification_challenge"
}
```

### 4. Payment States

The webhook handles the following payment states:

- **COMPLETE**: Payment was successful
- **FAILED**: Payment failed
- **PENDING**: Payment is pending

### 5. Customization

Edit the `intasend-webhook.js` file to add your business logic:

- Update database records
- Send confirmation emails
- Update user accounts
- Trigger other actions

### 6. Testing

You can test the webhook locally using Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

Then use a tool like ngrok or Postman to send test webhook payloads to:
```
http://localhost:8888/.netlify/functions/intasend-webhook
```

## Security Considerations

1. **Verify webhook signatures**: If IntaSend provides webhook signatures, implement verification in the handler
2. **Use HTTPS**: Always use HTTPS for webhook URLs
3. **Validate payload**: Always validate the webhook payload before processing
4. **Log events**: Keep logs of webhook events for debugging and auditing
5. **Idempotency**: Handle duplicate webhook deliveries gracefully

## Troubleshooting

### Webhook not receiving events

1. Check that the webhook URL is correct in IntaSend dashboard
2. Verify that the function is deployed (check Netlify function logs)
3. Ensure the function returns a 200 status code
4. Check Netlify function logs for errors

### Function errors

1. Check Netlify function logs in the dashboard
2. Verify that the payload format matches expectations
3. Ensure all required environment variables are set

## Support

For IntaSend documentation, visit: https://intasend.com/docs
For Netlify Functions documentation, visit: https://docs.netlify.com/functions/overview/
