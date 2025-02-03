import mongoose from "mongoose";
import Schema from "./schema";
import { sendEmail } from "@services/emailService";

mongoose
  .connect("mongodb://localhost:27017/avantra")
  .then(() => console.log("MongoDB Connected!"));

// OTP stuff
// --------- clean this up later --------
async function sendVerificationEmail(email: string, otp: string, type: string) {
  try {
    const mailResponse = await sendEmail({
      to: email,
      subject: "Verification Email",
      html: `<h1>Please confirm your OTP for ${type}</h1>
       <p>Here is your OTP code: ${otp}</p>`,
    });
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}

Schema.OTP.pre("save", async function (next) {
  console.log("New OTP saved to the database");
  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp, this.type);
  }
  next();
});
// OTP stuff

const UserModel = mongoose.model("User", Schema.User);
const OTPModel = mongoose.model("OTP", Schema.OTP);

export = { mongoose, UserModel, OTPModel };
