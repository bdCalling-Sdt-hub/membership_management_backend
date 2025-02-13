import mongoose from "mongoose";
import Schema from "./schema";
import { attachOTPHooks } from "@services/otpService";

const startDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || "");
  console.log("MongoDB Connected!");

  initializeDB();
};

const initializeDB = async () => {
  attachOTPHooks();
  try {
    const existingDoc = await ToolModel.findOne({ name: "Youtube" });

    if (!existingDoc) {
      await ToolModel.create({
        name: "Youtube",
        icon: "https://static.cdnlogo.com/logos/y/57/youtube-icon.svg",
      });
      console.log("Youtube tool created.");
    }
  } catch (error) {
    console.error("Error ensuring document exists:", error);
  }
};

startDB();

const UserModel = mongoose.model("User", Schema.User);
const OTPModel = mongoose.model("OTP", Schema.OTP);
const ToolModel = mongoose.model("Tool", Schema.Tool);
const VideoModel = mongoose.model("Video", Schema.Video);
const FileModel = mongoose.model("File", Schema.File);
const NotificationModel = mongoose.model("Notification", Schema.Notification);
const ReferralModel = mongoose.model("Referral", Schema.Referral);
const PaymentModel = mongoose.model("Payment", Schema.Payment);
const WithdrawalModel = mongoose.model("Withdrawal", Schema.Withdrawal);
const LegalModel = mongoose.model("Legal", Schema.Legal);

export = {
  UserModel,
  OTPModel,
  ToolModel,
  VideoModel,
  FileModel,
  NotificationModel,
  ReferralModel,
  PaymentModel,
  WithdrawalModel,
  LegalModel,
};
