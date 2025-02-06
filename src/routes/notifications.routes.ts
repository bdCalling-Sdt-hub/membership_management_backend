import {
  mark_all_as_read,
  mark_as_read,
  notifications,
  notifications_by_id,
  notifications_count,
} from "@controllers/notifications";
import { Router } from "express";

const router = Router();

router.get("/", notifications);
router.get("/:userId", notifications_by_id); // Using a different endpoint for notificationById because of different security levels
router.get("/count/:userId", notifications_count);
router.get("/mark-as-read/:notificationId", mark_as_read);
router.get("/mark-all-as-read/:userId", mark_all_as_read);

export default router;
