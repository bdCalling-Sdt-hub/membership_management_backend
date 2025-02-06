import type { Express } from "express";
import multer from "multer";
import {
  forgot_password,
  resend,
  signin,
  signup,
  update_password,
  validate_otp,
} from "@controllers/auth";
import {
  add_category,
  all_tools,
  delete_category,
  delete_tool,
  tools,
  update_category,
  update_tool,
  upload,
} from "@controllers/tools";
import {
  change_password,
  delete_account,
  profile,
  update_profile,
} from "@controllers/profile";
import {
  notifications,
  notifications_by_id,
  notifications_count,
} from "@controllers/notifications";
import { toggle_ban, users } from "@controllers/user";
import {
  referral_commissions,
  update_referral_commissions,
} from "@controllers/referral_commissions";
import { isAuthenticated } from "@middleware/auth";

const multerUpload = multer({ dest: "uploads/" });
const uploadFields = multerUpload.fields([
  { name: "video", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

export default function (app: Express) {
  // USER AUTH
  app.post("/sign-up", signup);
  app.post("/resend", resend);
  app.post("/validate-otp", validate_otp);
  app.post("/forgot-password", forgot_password);
  app.post("/update-password", update_password);
  app.post("/sign-in", signin);

  // TOOLS
  app.get("/tools", tools);

  // NOTIFICATIONS
  app.get("/notifications", notifications);
  app.get("/notifications/:userId", notifications_by_id); // Using a different endpoint for notificationById because of different security levels
  app.get("/notifications-count/:userId", notifications_count);

  // PROFILE
  app.get("/profile", isAuthenticated, profile);
  app.put(
    "/update-profile",
    isAuthenticated,
    multerUpload.single("photo"),
    update_profile
  );
  app.delete("/delete-account", isAuthenticated, delete_account);
  app.post("/change-password", isAuthenticated, change_password);

  // HOME
  // app.get("/overview")
  // - user info
  // - earnings
  // - traffic data based on dates
  // - referral history

  // WALLET
  // app.get("/withdraw-history")

  // ------------------------------

  // USER MANAGEMENT
  app.get("/users", users);
  app.get("/toggle-ban", toggle_ban);

  // TOOLS MANAGEMENT
  app.get("/tools/all", all_tools);
  app.post("/tools/upload", uploadFields, upload);
  app.put("/tools/update_tool", uploadFields, update_tool);
  app.delete("/tools/delete_tool", delete_tool);

  // TOOLS CATEGORY
  app.post("/tools/add_category", add_category);
  app.put("/tools/update_category", update_category);
  app.delete("/tools/delete_category", delete_category);

  // REFERRAL COMMISSION
  app.get("/referral-commissions", referral_commissions);
  app.put("/referral-commissions", update_referral_commissions);

  // DASHBOARD
  // app.get("/dashboard")
  // app.get("/referral-overview")

  // EARNINGS
  // app.get("/earnings")

  // WITHDRAW REQUEST
  // app.get("/withdraw-requests")
}
