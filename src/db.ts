import mongoose from "mongoose";
import Schema from "./schema";
import { attachOTPHooks } from "@services/otpService";

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB Connected!"));

attachOTPHooks();

const UserModel = mongoose.model("User", Schema.User);
const OTPModel = mongoose.model("OTP", Schema.OTP);
const ToolModel = mongoose.model("Tool", Schema.Tool);
const VideoModel = mongoose.model("Video", Schema.Video);
const FileModel = mongoose.model("File", Schema.File);
const NotificationModel = mongoose.model("Notification", Schema.Notification);
const ReferralCommissionModel = mongoose.model(
  "ReferralCommission",
  Schema.ReferralCommission
);

export = {
  UserModel,
  OTPModel,
  ToolModel,
  VideoModel,
  FileModel,
  NotificationModel,
  ReferralCommissionModel,
};
