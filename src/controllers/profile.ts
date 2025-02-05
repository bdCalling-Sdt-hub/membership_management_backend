import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { config } from "dotenv";
import DB from "src/db";
config();

const profile = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    res.status(500).json({ message: "Internal Server error" });
    return;
  }

  verify(token, secret, async (err, decoded) => {
    if (err || !decoded) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const user = await DB.UserModel.findById((decoded as any).userId, {
      photoUrl: 1,
      name: 1,
      email: 1,
      phoneNumber: 1,
      dateOfBirth: 1,
      gender: 1,
    });
    res.status(200).json({
      photoUrl: user?.photoUrl || null,
      name: user?.name || null,
      email: user?.email || null,
      phoneNumber: user?.phoneNumber || null,
      dateOfBirth: user?.dateOfBirth || null,
      gender: user?.gender || null,
    });
  });
};
const update_profile = async (req: Request, res: Response): Promise<void> => {};
const delete_account = async (req: Request, res: Response): Promise<void> => {};
const change_password = async (
  req: Request,
  res: Response
): Promise<void> => {};

export { profile, update_profile, delete_account, change_password };
