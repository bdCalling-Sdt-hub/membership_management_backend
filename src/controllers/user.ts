import { Request, Response } from "express";
import DB from "src/db";

const users = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req?.query || {};

    const users = await DB.UserModel.find(
      {},
      {
        __v: 0,
        passwordHash: 0,
      }
    )
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const toggle_ban = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.query || {};

    const user = await DB.UserModel.findById(id);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
    }

    if (user?.isBanned) {
      await DB.UserModel.findByIdAndUpdate(id, { isBanned: false });
      res.status(200).json({ message: "User unbanned" });
    } else {
      await DB.UserModel.findByIdAndUpdate(id, { isBanned: true });
      res.status(200).json({ message: "User banned" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export { users, toggle_ban };
