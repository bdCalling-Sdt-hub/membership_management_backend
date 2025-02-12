import {
  admin_overview,
  overview,
  referral_history,
  referral_overview,
} from "@controllers/dashboard";
import { isAuthenticated } from "@middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/", isAuthenticated, overview);
router.get("/referral-history", isAuthenticated, referral_history);

router.get("/admin", isAuthenticated, admin_overview);
router.get("/referral-overview", isAuthenticated, referral_overview);

export default router;
