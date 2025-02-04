import type { Request, Response } from "express";
import { validate } from "email-validator";
import { StatusCodes } from "http-status-codes";
import DB from "src/db";
import { compare, hash } from "bcrypt";
import { generate } from "otp-generator";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { OTPTypes } from "@services/otpService";

const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email: emailFromBody,
      password,
      referralCode,
    } = req.body || {};

    // Validate input
    if (!name || !emailFromBody || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Name, Email, and Password are required",
      });
      return;
    }

    // normalize email
    const email = emailFromBody.trim().toLowerCase();

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

    if (referralCode) {
      const referrer = await DB.UserModel.findOne({ referralCode }).exec();
      if (!referrer) {
        res.status(400).json({ message: "Invalid referral code." });
      }
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    const newUser = new DB.UserModel({
      name,
      email,
      passwordHash,
      accountStatus: "Pending",
      referralCode,
    });

    await newUser.save();

    // handle otp
    const otpParams = {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    };
    let otp = generate(6, otpParams);
    let result = await DB.OTPModel.findOne({ otp: otp });
    while (result) {
      otp = generate(6, otpParams);
      result = await DB.OTPModel.findOne({ otp: otp });
    }

    await DB.OTPModel.create({ email, otp, type: OTPTypes.SIGNUP });

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

const resend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email: emailFromBody, type } = req.body || {};

    // normalize email
    const email = emailFromBody.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await DB.UserModel.findOne({ email }).exec();
    if (!existingUser) {
      res.status(StatusCodes.CONFLICT).json({
        message: `User with the email ${email} doesn't exist.`,
      });
      return;
    }
    if (existingUser.accountStatus === "Verified") {
      res.status(StatusCodes.CONFLICT).json({
        message: `This user is already verified.`,
      });
      return;
    }

    const otpParams = {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    };
    let otp = generate(6, otpParams);
    let result = await DB.OTPModel.findOne({ otp: otp });
    while (result) {
      otp = generate(6, otpParams);
      result = await DB.OTPModel.findOne({ otp: otp });
    }

    await DB.OTPModel.create({ email, otp, type });

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

const validate_otp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email: emailFromBody, otp } = req.body || {};

    if (!emailFromBody || !otp) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email and OTP are required",
      });
    }

    // normalize email
    const email = emailFromBody.trim().toLowerCase();

    // Find the most recent OTP for the email
    const response = await DB.OTPModel.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      res.status(400).json({
        message: "The OTP is not valid",
      });
      return;
    }

    // delete otp document after verification
    await DB.OTPModel.deleteMany({ email });

    // Update user account status
    if (response[0].type === OTPTypes.SIGNUP) {
      await DB.UserModel.updateOne(
        { email },
        { $set: { accountStatus: "Verified" } }
      );
    }

    if (response[0].type === OTPTypes.FORGOT_PASSWORD) {
      const passwordResetToken = sign(
        { email, purpose: "password_reset" },
        process.env.PASSWORD_RESET_SECRET || "fallback_secret",
        { expiresIn: "10m" }
      );

      res.status(200).json({
        message: "OTP verified successfully",
        passwordResetToken,
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: `Email ${email} verified successfully`,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const forgot_password = async (req: Request, res: Response): Promise<void> => {
  const { email: emailFromBody } = req.body || {};

  // normalize email
  const email = emailFromBody.trim().toLowerCase();

  const existingUser = await DB.UserModel.findOne({ email }).exec();
  if (!existingUser) {
    res.status(StatusCodes.CONFLICT).json({
      message: `User with the email ${email} doesn't exist.`,
    });
    return;
  }

  const otpParams = {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  };
  let otp = generate(6, otpParams);
  let result = await DB.OTPModel.findOne({ otp: otp });
  while (result) {
    otp = generate(6, otpParams);
    result = await DB.OTPModel.findOne({ otp: otp });
  }

  await DB.OTPModel.create({ email, otp, type: OTPTypes.FORGOT_PASSWORD });

  res.status(200).json({
    success: true,
    message: "OTP for resetting the password sent successfully",
    otp,
  });
};

const update_password = async (req: Request, res: Response): Promise<void> => {
  const { password } = req?.body || {};
  const passwordResetToken = req.headers.authorization?.split(" ")[1];

  if (!passwordResetToken) {
    res.status(401).json({ message: "Unauthorized. Missing token." });
    return;
  }

  // Verify JWT
  let decoded: JwtPayload;
  try {
    decoded = verify(
      passwordResetToken,
      process.env.PASSWORD_RESET_SECRET || "fallback_secret"
    ) as JwtPayload;
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
    return;
  }

  if (!decoded?.purpose || decoded?.purpose !== "password_reset") {
    res.status(403).json({ message: "Invalid token purpose." });
    return;
  }

  const email = decoded?.email;

  const existingUser = await DB.UserModel.findOne({ email }).exec();
  if (!existingUser) {
    res.status(StatusCodes.CONFLICT).json({
      message: `User with the email ${email} doesn't exist.`,
    });
    return;
  }

  // Hash password
  const passwordHash = await hash(password, 10);

  await DB.UserModel.updateOne({ email }, { $set: { passwordHash } });

  res.status(StatusCodes.OK).json({
    message: "Password updated successfully",
  });
};

const signin = async (req: Request, res: Response): Promise<void> => {
  const { email: emailFromBody, password, remember_me } = req.body || {};

  // normalize email
  const email = emailFromBody.trim().toLowerCase();

  // check if email password matches with DB
  const user = await DB.UserModel.find({ email }).exec();
  if (user.length === 0) throw new Error("User doesn't exist");

  // check if user account is verified
  if (user[0].accountStatus !== "Verified") {
    res.status(403).json({
      message: "Account is not verified. Please verify your email first.",
    });
  }

  // Compare passwords
  const isMatch = await compare(password, user[0].passwordHash);
  if (!isMatch) {
    res.status(StatusCodes.CONFLICT).json({
      message: "Password is incorrect",
    });

    return;
  }

  // Generate tokens
  const accessToken = sign(
    { email, userId: user[0]._id },
    process.env.ACCESS_TOKEN_SECRET || "fallback_secret",
    { expiresIn: "2m" }
  );

  const refreshToken = sign(
    { email, userId: user[0]._id },
    process.env.REFRESH_TOKEN_SECRET || "fallback_secret",
    { expiresIn: remember_me ? "30d" : "10m" }
  );

  res.status(StatusCodes.OK).json({
    message: "Login successful",
    accessToken,
    refreshToken,
  });
};

export {
  signup,
  resend,
  validate_otp,
  forgot_password,
  update_password,
  signin,
};
