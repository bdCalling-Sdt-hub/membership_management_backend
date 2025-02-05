import { io } from "src";
import DB from "src/db";

interface NotificationParams {
  recipientId: string;
  title: string;
  description: string;
  type: string;
}

const createNotification = async ({
  recipientId,
  title,
  description,
  type,
}: NotificationParams) => {
  try {
    const notification = new DB.NotificationModel({
      recipientId,
      title,
      description,
      type,
    });
    await notification.save();

    io.to(recipientId).emit("new_notification", notification);

    return notification;
  } catch (error) {
    console.log("Error creating notification", error);
  }
};

export { createNotification };
