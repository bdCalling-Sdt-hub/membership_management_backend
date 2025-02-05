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
import { notifications } from "@controllers/notifications";
import { isAuthenticated } from "@middleware/auth";
import { toggle_ban, users } from "@controllers/user";

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

  // HOME
  // app.get("/overview")
  // - user info
  // - earnings
  // - traffic data based on dates
  // - referral history

  // TOOLS
  app.get("/tools", tools);

  // NOTIFICATIONS
  app.get("/notifications", notifications);

  // WALLET
  // app.get("/withdraw-history")

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

  // ------------------------------

  // DASHBOARD
  // app.get("/dashboard")
  // app.get("/referral-overview")

  // USER MANAGEMENT
  app.get("/users", users);
  app.get("/toggle-ban", toggle_ban);

  // TOOLS MANAGEMENT
  app.get("/tools/all", all_tools);
  app.post("/tools/upload", uploadFields, upload);
  app.put("/tools/update_tool", uploadFields, update_tool);
  app.delete("/tools/delete_tool", delete_tool);

  // EARNINGS
  // app.get("/earnings")

  // WITHDRAW REQUEST
  // app.get("/withdraw-requests")

  // REFERRAL COMMISSION
  // app.get("/referral-commissions")
  // app.put("/referral-commissions")
  // app.delete("/referral-commissions")

  // TOOLS CATEGORY
  app.post("/tools/add_category", add_category);
  app.put("/tools/update_category", update_category);
  app.delete("/tools/delete_category", delete_category);

  // PROFILE
  // app.post("/change-password")
}
