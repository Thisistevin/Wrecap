# AvocadoPay Webhook Configuration

## Webhook Details for AvocadoPay Dashboard

When creating the webhook in AvocadoPay dashboard, use the following information:

### Webhook Name
```
wrecap
```

### Webhook URL

**Development:**
```
http://localhost:3000/api/avocadopay-webhook
```
(ou `http://localhost:3001/api/avocadopay-webhook` se estiver usando porta 3001)

**Production:**
```
https://yourdomain.com/api/avocadopay-webhook
```
*(Replace `yourdomain.com` with your actual domain)*

### Webhook Secret

1. Generate a secure secret using one of these methods:

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Add the generated secret to your `.env.local` file:
```
AVOCADOPAY_WEBHOOK_SECRET=your_generated_secret_here
```

3. Use the **same secret** when creating the webhook in AvocadoPay dashboard.

### Events to Select

In the "Selecione os Eventos" dropdown, select:
- ✅ **billing.paid - Cobrança paga** (Billing paid - Payment charged)

This is the event that triggers when a payment is successfully completed.

### How It Works

1. User completes payment in AvocadoPay checkout
2. AvocadoPay sends a webhook POST request to `/api/avocadopay-webhook`
3. The webhook handler:
   - Verifies the webhook signature using the secret
   - Extracts the `retrospectiveId` from the payload metadata
   - Triggers the retrospective processing
4. The retrospective is generated using Gemini API
5. User is redirected to the processing page, then to the completed retrospective

### Testing the Webhook

For local development, you'll need to expose your local server using a tool like ngrok or localtunnel.

#### Using ngrok

1. **Install ngrok:**
   - Download from [ngrok.com](https://ngrok.com/download)
   - Or install via Homebrew: `brew install ngrok`

2. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```
   (ou `ngrok http 3001` se o Next.js estiver rodando na porta 3001)

4. **Get your ngrok domain:**
   - After running the command, ngrok will display a forwarding URL like:
     ```
     Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3000
     ```
   - Copy the HTTPS URL (e.g., `https://abc123-def456.ngrok-free.app`)

5. **Use this URL in AvocadoPay dashboard:**
   - Webhook URL: `https://abc123-def456.ngrok-free.app/api/avocadopay-webhook`
   - Replace `abc123-def456.ngrok-free.app` with your actual ngrok domain

**Note:** Free ngrok domains change every time you restart ngrok. For a fixed domain, you'll need a paid ngrok account.

#### Alternative: Using localtunnel

```bash
npx localtunnel --port 3000
```
(ou `npx localtunnel --port 3001` se o Next.js estiver rodando na porta 3001)

Then use the provided URL (e.g., `https://xyz.localtunnel.me`) as your webhook URL.

### Security Notes

- The webhook signature is verified using HMAC SHA256
- Never commit your `AVOCADOPAY_WEBHOOK_SECRET` to version control
- Use different secrets for development and production environments
- The webhook endpoint returns 401 if signature verification fails

