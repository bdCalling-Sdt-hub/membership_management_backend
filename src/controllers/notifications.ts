import { Request, Response } from "express";
import DB from "src/db";

const notifications = async (req: Request, res: Response): Promise<void> => {
  const { page, limit } = req.query;
  try {
    const notifications = await DB.NotificationModel.find({}, { __v: 0 })
      .sort({ createdAt: -1 })
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

    const total = await DB.NotificationModel.countDocuments();

    const pagination = {
      page: +(page || 1),
      limit: +(limit || 10),
      total,
      totalPages: Math.ceil(total / +(limit || 10)),
    };

    res.status(200).json({ notifications, pagination });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { notifications };
