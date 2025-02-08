import { create_payment } from "@controllers/stripe";
import { Router } from "express";

const router = Router();

router.post("/create-payment", create_payment);
// router.post("/create-connect-account", create_payment);
// router.post("/account-link", create_payment);
// router.post("/transfer-funds", create_payment);

export default router;
