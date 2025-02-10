import { Request as ExpressRequest, Response } from "express";
interface Request extends ExpressRequest {
  user?: any;
}
import DB from "src/db";
import { Types } from "mongoose";

const overview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { overview_year } = req.query;
    const year = overview_year
      ? parseInt(overview_year as string)
      : new Date().getFullYear();

    // Get user info
    const user = await DB.UserModel.findById(req.user.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userInfo = {
      name: user.name || "",
      photo_url: user.photoUrl || "",
      total_earnings: user.referralEarnings || 0,
    };

    // Unread notifications count
    const unread_notifications_count =
      await DB.NotificationModel.countDocuments({
        recipientId: req.user.id,
        isRead: false,
      });

    // Recursive function to count referrals by month
    const getReferralCountByYear = async (
      userId: Types.ObjectId,
      year: number
    ): Promise<{ [key: number]: number }> => {
      // Fetch user and populate referredUsers to get actual user data
      const user = await DB.UserModel.findById(userId).populate<{
        referredUsers: (typeof DB.UserModel)[];
      }>("referredUsers");

      if (!user || !user.referredUsers) return {};

      const referralCountByMonth: { [key: number]: number } = {};

      for (const referredUser of user.referredUsers) {
        if (!(referredUser instanceof DB.UserModel) || !referredUser.createdAt)
          continue;

        const createdAtDate = new Date(referredUser.createdAt);
        const createdYear = createdAtDate.getFullYear();
        const createdMonth = createdAtDate.getMonth() + 1; // Months are 0-indexed

        if (createdYear === year) {
          referralCountByMonth[createdMonth] =
            (referralCountByMonth[createdMonth] || 0) + 1;
        }

        // Recursively check deeper referrals
        const deeperReferrals = await getReferralCountByYear(
          referredUser._id as Types.ObjectId,
          year
        );
        for (const month in deeperReferrals) {
          referralCountByMonth[parseInt(month)] =
            (referralCountByMonth[parseInt(month)] || 0) +
            deeperReferrals[parseInt(month)];
        }
      }

      return referralCountByMonth;
    };

    // Fetch referral data
    const referral_count = await getReferralCountByYear(
      user._id as Types.ObjectId,
      year
    );

    // Ensure all 12 months are present in the response
    const formattedReferralCount = Array.from(
      { length: 12 },
      (_, i) => referral_count[i + 1] || 0
    );

    res.status(200).json({
      ...userInfo,
      unread_notifications_count,
      overview: {
        year,
        referral_count: formattedReferralCount,
      },
    });
  } catch (error) {
    console.error("Error fetching referral overview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const referral_history = async (req: Request, res: Response): Promise<void> => {
  const user = await DB.UserModel.findById(req.user.id);

  if (!user) {
    res.status(400).json({
      message: "User not found",
    });
    return;
  }

  // Fetch commission rates dynamically from DB
  const commissionRatesFromDB = await DB.ReferralModel.find();
  const commissionRates: Record<number, number> = {};

  commissionRatesFromDB.forEach((rate: any) => {
    commissionRates[rate.referralLevel] = 10 * (rate.commission / 100); // Convert percentage to fraction
  });

  // Level 1 referrals
  const referredUsersLevel1 = await DB.UserModel.find({
    _id: { $in: user.referredUsers.map((user: any) => user._id) },
  });

  // Level 2 referrals
  const referredUsersLevel2 = await DB.UserModel.find({
    _id: {
      $in: referredUsersLevel1.flatMap((user: any) =>
        user.referredUsers.map((u: any) => u._id)
      ),
    },
  });

  // Level 3 referrals
  const referredUsersLevel3 = await DB.UserModel.find({
    _id: {
      $in: referredUsersLevel2.flatMap((user: any) =>
        user.referredUsers.map((u: any) => u._id)
      ),
    },
  });

  const mappedUsers = [
    ...referredUsersLevel1.map((user: any) => ({
      name: user.name || "",
      photoUrl: user.photoUrl || "",
      createdAt: user.createdAt || new Date(),
      commission: commissionRates[1],
      active: user.isSubscribed || false,
    })),
    ...referredUsersLevel2.map((user: any) => ({
      name: user.name || "",
      photoUrl: user.photoUrl || "",
      createdAt: user.createdAt || new Date(),
      commission: commissionRates[2],
      active: user.isSubscribed || false,
    })),
    ...referredUsersLevel3.map((user: any) => ({
      name: user.name || "",
      photoUrl: user.photoUrl || "",
      createdAt: user.createdAt || new Date(),
      commission: commissionRates[3],
      active: user.isSubscribed || false,
    })),
  ];

  res.status(200).json(mappedUsers);
};

export { overview, referral_history };
