import { overview, referral_history } from "@controllers/dashboard";
import { isAuthenticated } from "@middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/", isAuthenticated, overview);
router.get("/referral-history", isAuthenticated, referral_history);

export default router;
