import { admin_overview, referral_overview } from "@controllers/dashboard";
import { Router } from "express";

const router = Router();

router.get("/", admin_overview);
router.get("/referral-overview", referral_overview);

export default router;
