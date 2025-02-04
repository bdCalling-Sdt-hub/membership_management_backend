import mongoose from "mongoose";
import Schema from "./schema";
import { attachOTPHooks } from "@services/otpService";

mongoose
  .connect("mongodb://localhost:27017/avantra")
  .then(() => console.log("MongoDB Connected!"));

attachOTPHooks();

const UserModel = mongoose.model("User", Schema.User);
const OTPModel = mongoose.model("OTP", Schema.OTP);

export = { mongoose, UserModel, OTPModel };
