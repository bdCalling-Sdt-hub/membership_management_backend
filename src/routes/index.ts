import { Express } from "express";
import authRoutes from "@routes/auth.routes";
import toolsRoutes from "@routes/tools.routes";
import profileRoutes from "@routes/profile.routes";
import userRoutes from "@routes/user.routes";
import referralRoutes from "@routes/referral.routes";
import notificationsRoutes from "@routes/notifications.routes";
import stripeRoutes from "@routes/stripe.routes";
import webhookRoutes from "@routes/webhook.routes";
import dashboardRoutes from "@routes/dashboard.routes";
import paymentRoutes from "@routes/payment.routes";
import legalRoutes from "@routes/legal.routes";

const registerRoutes = (app: Express) => {
  app.use("/auth", authRoutes);
  app.use("/tools", toolsRoutes);
  app.use("/profile", profileRoutes);
  app.use("/users", userRoutes);
  app.use("/referrals", referralRoutes);
  app.use("/notifications", notificationsRoutes);
  app.use("/stripe", stripeRoutes);
  app.use("/dashboard", dashboardRoutes);
  app.use("/payment", paymentRoutes);
  app.use("/legal", legalRoutes);
};

const registerRoutesThatNeedsRawBody = (app: Express) => {
  app.use("/webhook", webhookRoutes);
};

export { registerRoutes, registerRoutesThatNeedsRawBody };
