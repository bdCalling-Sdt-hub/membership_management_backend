import type { Express } from "express";
import {
  forgot_password,
  resend,
  signin,
  signup,
  update_password,
  validate_otp,
} from "@controllers/user";

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
  // app.get("/tools");
  // app.get("/tools/:id");

  // NOTIFICATIONS
  // app.get("/notifications")

  // WALLET
  // app.get("/withdraw-history")

  // PROFILE
  // app.get("/profile");
  // app.put("/update-profile");
  // app.delete("/delete-account")

  // ------------------------------

  // DASHBOARD
  // app.get("/dashboard")
  // app.get("/referral-overview")
  // app.get("/admin-notifications")

  // USER MANAGEMENT
  // app.get("/users")
  // app.post("/ban-user")

  // TOOLS MANAGEMENT
  // app.get("/admin-tools")
  // app.put("/admin-tools")
  // app.delete("/admin-tools")

  // EARNINGS
  // app.get("/earnings")
  
  // WITHDRAW REQUEST
  // app.get("/withdraw-requests")

  // REFERRAL COMMISSION
  // app.get("/referral-commissions")
  // app.put("/referral-commissions")
  // app.delete("/referral-commissions")

  // TOOLS CATEGORY
  // app.get("/tools-category")
  // app.put("/tools-category")
  // app.delete("/tools-category")

  // PROFILE
  // app.post("/change-password")
}
