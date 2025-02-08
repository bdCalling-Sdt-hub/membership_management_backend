import { create_payment } from "@controllers/payment";
import { Router } from "express";

const router = Router();

router.post("/create-payment", create_payment);

export default router;
