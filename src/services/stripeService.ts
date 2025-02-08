import { config } from "dotenv";
import Stripe from "stripe";

config();
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  throw new Error(
    "Stripe publishable key is not defined in environment variables"
  );
}
const stripe = new Stripe(stripePublishableKey, {
  apiVersion: "2025-01-27.acacia",
});

export class StripeService {
  async createCustomer(email: string, name: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error}`);
    }
  }

  async createCharge(customerId: string, amount: number, currency: string) {
    try {
      const charge = await stripe.charges.create({
        amount,
        currency,
        customer: customerId,
      });
      return charge;
    } catch (error) {
      throw new Error(`Failed to create charge: ${error}`);
    }
  }

  async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      });
      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error}`);
    }
  }

  async retrieveCustomer(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      throw new Error(`Failed to retrieve customer: ${error}`);
    }
  }
}
