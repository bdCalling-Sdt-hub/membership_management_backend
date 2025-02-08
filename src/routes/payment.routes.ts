import { balance, withdraw_history } from "@controllers/payment";
import { Router } from "express";

const router = Router();

router.get("/balance", balance);
router.get("/earnings", balance);

// withdrawal
// router.get("/withdraw-history", withdraw_history);
// router.post("/withdrawal/request", withdraw_history);
// router.post("/withdrawal/approve", withdraw_history);
// router.get("/withdrawal/requests", withdraw_history);

// // admin panel
// router.get("/all-earnings", withdraw_history);
// router.get("/all-withdrawls", withdraw_history);

export default router;
