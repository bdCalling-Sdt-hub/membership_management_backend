import type { Request, Response } from "express";
import { validate } from "email-validator";
import { StatusCodes } from "http-status-codes";
import DB from "src/db";
import { hash } from "bcrypt";
import { sendEmail } from "src/services/emailService";
import { generate } from "otp-generator";

const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body || {};

    // Validate input
    if (!name || !email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Name, Email, and Password are required",
      });
    }

    // Validate email format
    if (!validate(email)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email is not valid",
      });
    }

    // Check if email already exists
    const existingUser = await DB.UserModel.findOne({ email }).exec();
    if (existingUser) {
      res.status(StatusCodes.CONFLICT).json({
        message: `User with the email ${email} already exists.`,
      });
      return;
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    const newUser = new DB.UserModel({
      name,
      email,
      passwordHash,
      accountStatus: "Pending"
    });

    await newUser.save();

    // handle otp

    let otp = generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await DB.OTPModel.findOne({ otp: otp });
    while (result) {
      otp = generate(6, {
        upperCaseAlphabets: false,
      });
      result = await DB.OTPModel.findOne({ otp: otp });
    }

    await DB.OTPModel.create({ email, otp });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export default signup;

export { signup };
