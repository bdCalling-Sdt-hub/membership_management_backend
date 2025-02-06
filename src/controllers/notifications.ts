import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
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

const notifications_by_id = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit } = req.query || {};
    const { userId } = req.params || {};

    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid id" });
      return;
    }

    const notifications = await DB.NotificationModel.find(
      { recipientId: userId },
      { __v: 0 }
    )
      .sort({ createdAt: -1 })
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

    const total = await DB.NotificationModel.countDocuments({
      recipientId: userId,
    });
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

const notifications_count = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req?.params || {};

    const count = await DB.NotificationModel.countDocuments({
      isRead: false,
      recipientId: userId,
    });
    res.status(200).json({ count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { notifications, notifications_by_id, notifications_count };
