import { io } from "src";
import DB from "src/db";

interface NotificationParams {
  title: string;
  description: string;
  type: string;
}

interface UserNotificationParams extends NotificationParams {
  recipientId: string;
}

const createUserNotification = async ({
  recipientId,
  title,
  description,
  type,
}: UserNotificationParams) => {
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

const createAdminNotification = async ({
  title,
  description,
  type,
}: NotificationParams) => {
  try {
    const notification = new DB.NotificationModel({
      title,
      description,
      type,
    });
    await notification.save();

    io.to("admin").emit("admin_notification", notification);

    return notification;
  } catch (error) {
    console.log("Error creating notification", error);
  }
};

export { createUserNotification, createAdminNotification };
