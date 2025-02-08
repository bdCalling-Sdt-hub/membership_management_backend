import { config } from "dotenv";
import Stripe from "stripe";

config();
const stripePublishableKey = process.env.STRIPE_SECRET_KEY;
if (!stripePublishableKey) {
  throw new Error(
    "Stripe publishable key is not defined in environment variables"
  );
}

export const createCheckoutSession = async ({ userId }: { userId: string }) => {
  try {
    const stripe = new Stripe(stripePublishableKey);

    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Avantra",
            },
            unit_amount: 1000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "http://localhost:3000/success.html",
      cancel_url: "http://localhost:3000/cancel.html",
    });

    return session;
  } catch (error) {
    return error;
  }
};
