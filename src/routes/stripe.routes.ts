import {
  account_link,
  create_payment,
  transfer_funds,
} from "@controllers/stripe";
import { Router } from "express";

const router = Router();

router.post("/create-payment", create_payment);
router.post("/account-link", account_link);
router.post("/transfer-funds", transfer_funds);

export default router;
