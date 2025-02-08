import DB from "src/db";

export default async function distributeReferralEarnings(
  userId: string,
  amount: number
) {
  const user = await DB.UserModel.findById(userId).populate("referredBy");

  if (!user) return;

  let referrer = user.referredBy;
  let level: number = 1;
  const commissionRates: { [key: number]: number } = {
    1: 0.5,
    2: 0.1,
    3: 0.05,
  };

  while (referrer && level <= 3) {
    const commission = amount * commissionRates[level];

    // Update referrer's earnings
    await DB.UserModel.findByIdAndUpdate(referrer._id, {
      $inc: { referralEarnings: commission },
    });

    // Move to the next level referrer
    referrer = (await DB.UserModel.findById(referrer).populate("referredBy"))
      ?.referredBy;
    level++;
  }
}
