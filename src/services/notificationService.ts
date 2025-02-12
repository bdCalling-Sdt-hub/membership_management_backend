import eventBus from "@utils/eventBus";
import { io } from "src";
import DB from "src/db";

export const EVENTS = {
  USER_SIGNUP: "user_signup",
  EMAIL_VERIFIED: "email_verified",
  PASSWORD_UPDATE: "password_update",
  ACCOUNT_DELETED: "account_deleted",
};

// user_signup // admin & user
eventBus.on(EVENTS.USER_SIGNUP, async (data) => {
  try {
    const notification = new DB.NotificationModel({
      recipientId: data.userId,
      title: "Welcome to Avantra!",
      description: "Your account has been successfully created.",
      type: "info",
    });

    await notification.save();
    io.to(data.userId).emit("new_notification", notification);
    io.to("admin").emit("admin_notification", notification);
  } catch (error) {
    console.error("Error handling user signup notification:", error);
  }
});

// email_verified // admin & user
eventBus.on(EVENTS.EMAIL_VERIFIED, async (data) => {
  try {
    const notification = new DB.NotificationModel({
      recipientId: data.userId,
      title: "Email Verified!",
      description: "Your email has been successfully verified.",
      type: "success",
    });

    await notification.save();
    io.to(data.userId).emit("new_notification", notification);
    io.to("admin").emit("admin_notification", notification);
  } catch (error) {
    console.error("Error handling email verification notification:", error);
  }
});

// password_update // user
eventBus.on(EVENTS.PASSWORD_UPDATE, async (data) => {
  try {
    const notification = new DB.NotificationModel({
      recipientId: data.userId,
      title: "Password Updated Successfully",
      description:
        "Your account password has been updated successfully. If you did not make this change, please reset your password immediately.",
      type: "success",
    });

    await notification.save();
    io.to(data.userId).emit("new_notification", notification);
  } catch (error) {
    console.error("Error handling password update notification:", error);
  }
});

// account_deleted // admin
eventBus.on(EVENTS.ACCOUNT_DELETED, async (data) => {
  try {
    const notification = new DB.NotificationModel({
      title: "User Account Deleted",
      description: `The account associated with ${data.userEmail} has been deleted. Review the details if necessary.`,
      type: "warning",
    });

    await notification.save();
    io.to("admin").emit("admin_notification", notification);
  } catch (error) {
    console.error("Error handling account deleted notification:", error);
  }
});
