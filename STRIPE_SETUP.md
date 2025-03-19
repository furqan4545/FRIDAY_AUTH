# Stripe Integration Setup

This guide will help you set up Stripe for your Friday Auth application to handle payments for your monthly and lifetime plans.

## 1. Create a Stripe Account

If you haven't already, [sign up for a Stripe account](https://dashboard.stripe.com/register).

## 2. Configure Your Products and Prices

1. In the Stripe Dashboard, go to **Products** > **Add Product**
2. Create two products:

### Monthly Subscription Plan ($3/month)
- **Name**: Monthly Plan
- **Description**: Access to all updates and beta features
- **Pricing**: Recurring, $3/month
- After creating, note the **Price ID** - you'll need it for your environment variables

### Lifetime Plan ($10 one-time)
- **Name**: Lifetime Plan
- **Description**: One-time payment for one year of updates and bug fixes
- **Pricing**: One-time, $10
- After creating, note the **Price ID** - you'll need it for your environment variables

## 3. Get Your API Keys

1. In the Stripe Dashboard, go to **Developers** > **API keys**
2. Note your **Publishable key** and **Secret key**
3. Add these to your `.env.local` file:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_MONTHLY_PRICE_ID=price_id_for_monthly_plan
STRIPE_LIFETIME_PRICE_ID=price_id_for_lifetime_plan
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Set Up Webhook for Local Testing

For local development and testing with webhooks:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login to Stripe CLI:
   ```
   stripe login
   ```
3. Start webhook forwarding:
   ```
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```
4. The CLI will output a webhook signing secret. Add this to your `.env.local` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

## 5. Set Up Webhook for Production

When you're ready to go live:

1. In the Stripe Dashboard, go to **Developers** > **Webhooks**
2. Add an endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
4. Get the signing secret and update your production environment variable

## 6. Testing the Integration

1. Start your application with `npm run dev`
2. Sign in with your Google account
3. Choose either the monthly or lifetime plan
4. You'll be redirected to Stripe's checkout page
5. For testing, use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 9995`
   - Any future date for expiration, any 3-digit CVC

## 7. Integrating with Firebase (Next Steps)

To store subscription data in Firebase:

1. Set up Firestore in your Firebase project
2. In the webhook handler (`app/api/webhooks/stripe/route.ts`), uncomment and update the Firestore code to save subscription data
3. Extend your application to check subscription status when users access premium features

## Need Help?

Refer to the [Stripe Documentation](https://stripe.com/docs) for more details on customizing checkout, managing subscriptions, and handling payments. 