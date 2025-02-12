import { account_link, create_payment } from "@controllers/stripe";
import { Router } from "express";

const router = Router();

router.post("/create-payment", create_payment);
router.post("/account-link", account_link);

export default router;
