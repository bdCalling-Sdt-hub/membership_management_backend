import { Router } from "express";
import { isAuthenticated } from "@middleware/auth";
import multer from "multer";
import {
  change_password,
  delete_account,
  profile,
  update_profile,
} from "@controllers/profile";

const router = Router();
const multerUpload = multer({ dest: "uploads/" });

router.get("/", isAuthenticated, profile);
router.put(
  "/update",
  isAuthenticated,
  multerUpload.single("photo"),
  update_profile
);
router.delete("/delete", isAuthenticated, delete_account);
router.post("/change-password", isAuthenticated, change_password);

export default router;
