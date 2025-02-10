import { balance, request_withdrawal } from "@controllers/payment";
import { isAuthenticated } from "@middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/balance", isAuthenticated, balance);
router.post("/request-withdrawal", isAuthenticated, request_withdrawal);

export default router;
