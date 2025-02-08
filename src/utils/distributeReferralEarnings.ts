import DB from "src/db";

export default async function distributeReferralEarnings(
  userId: string,
  amount: number
) {
  const user = await DB.UserModel.findById(userId).populate("referredBy");

  if (!user) return;

  let referrer = user.referredBy;
  let level = 1;

  // Fetch commission rates from DB and create a mapping
  const commissionRatesFromDB = await DB.ReferralModel.find();
  const commissionRates: { [key: number]: number } = {};

  commissionRatesFromDB.forEach((rate) => {
    commissionRates[rate.referralLevel] = rate.commission / 100;
  });

  while (referrer && level <= 3) {
    if (commissionRates[level]) {
      const commission = amount * commissionRates[level];

      // Update referrer's earnings
      await DB.UserModel.findByIdAndUpdate(referrer._id, {
        $inc: { referralEarnings: commission },
      });
    }

    // Move to the next level referrer
    referrer = (await DB.UserModel.findById(referrer).populate("referredBy"))
      ?.referredBy;
    level++;
  }
}
