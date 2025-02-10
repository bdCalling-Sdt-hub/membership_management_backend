import { Request as ExpressRequest, Response } from "express";
interface Request extends ExpressRequest {
  user?: any;
}
import DB from "src/db";

const overview = async (req: Request, res: Response): Promise<void> => {};

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
