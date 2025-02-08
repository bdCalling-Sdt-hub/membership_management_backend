import { create_payment, stripe_webhook } from "@controllers/payment";
import { Router } from "express";
import express from "express";

const router = Router();

router.post("/create-payment", create_payment);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripe_webhook
);

export default router;
