import { createCheckoutSession } from "@services/stripeService";
import { Request, Response } from "express";
import DB from "src/db";
import Stripe from "stripe";

const create_payment = async (req: Request, res: Response): Promise<void> => {
  // const { userId } = req.body || {};
  const userId = "67a1fa43a15af2946da7f379";

  try {
    const session = (await createCheckoutSession({
      userId,
    })) as Stripe.Checkout.Session;

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: error });
  }
};

const stripe_webhook = async (req: Request, res: Response): Promise<void> => {
  const webhook_secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    res.status(500).send("Missing Stripe signature");
    return;
  }
  if (!webhook_secret) {
    res.status(500).send("Missing Stripe webhook secret");
    return;
  }
  try {
    const event = Stripe.webhooks.constructEvent(req.body, sig, webhook_secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await DB.PaymentModel.create({
        amount: (session.amount_total ?? 0) / 100,
        createdAt: session.created,
        paymentId: session.id,
        paymentStatus: session.payment_status,
        userId: session.client_reference_id,
      });

      await DB.UserModel.findByIdAndUpdate(session.client_reference_id, { isSubscribed: true })

      res.send();
    } else {
      console.log(`Unhandled event type ${event.type}`);
      res.send();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(`Webhook Error: ${err}`);
    return;
  }
};

export { create_payment, stripe_webhook };
