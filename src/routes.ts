import type { Express } from "express";
import { resend, signup, validate_otp } from "@controllers/user";

export default function (app: Express) {
  // USER AUTH
  app.post("/sign-up", signup);
  app.post("/resend", resend);
  app.post("/validate-otp", validate_otp);
  //   app.post("/sign-in");
  //   app.post("/forgot-password");
  //   app.post("/reset-password");
  //   app.get("/profile");
  //   app.put("/update-profile");

  // TOOLS
  //   app.get("/tools");
  //   app.post("/add-tools");
}
