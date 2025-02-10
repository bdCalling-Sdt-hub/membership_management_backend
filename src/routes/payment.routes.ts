import {
  balance,
  request_withdrawal,
  update_withdraw_requests,
  withdraw_history,
  withdraw_requests,
} from "@controllers/payment";
import { isAuthenticated } from "@middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/balance", isAuthenticated, balance);
router.post("/request-withdrawal", isAuthenticated, request_withdrawal);
router.get("/withdraw-history", isAuthenticated, withdraw_history);

// admin
router.get("/withdraw-requests", isAuthenticated, withdraw_requests);
router.post("/update-withdraw-requests", update_withdraw_requests);

export default router;
