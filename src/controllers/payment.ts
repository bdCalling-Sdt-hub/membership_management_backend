import { transferToConnectedAccount } from "@services/stripeService";
import { Request as ExpressRequest, Response } from "express";
interface Request extends ExpressRequest {
  user?: any;
}
import DB from "src/db";
import { v4 } from "uuid";

const balance = async (req: Request, res: Response): Promise<void> => {
  const balance = await DB.UserModel.findById(req.user.id, {
    balance: 1,
    _id: 0,
  });
  res.status(200).json(balance);
};

const request_withdrawal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { amount } = req.body || {};

  if (amount < 100) {
    res.status(400).json({
      message: "The minimum withdrawal amount is $100",
    });
    return;
  }

  const user = await DB.UserModel.findById(req.user.id, {
    balance: 1,
    stripeAccountId: 1,
    _id: 0,
  });

  if (!user?.balance || amount > user?.balance) {
    res.status(400).json({
      message: "Insufficient balance",
    });
    return;
  }

  if (!user?.stripeAccountId) {
    res.status(400).json({
      message: "Stripe account not found",
    });
    return;
  }

  try {
    let transactionId;
    let isUnique = false;

    while (!isUnique) {
      transactionId = v4().replace(/-/g, "").slice(0, 8).toUpperCase();
      const existingTransaction = await DB.WithdrawalModel.findOne({
        transactionId,
      });
      if (!existingTransaction) {
        isUnique = true;
      }
    }

    await DB.WithdrawalModel.create({
      requesterId: req.user.id,
      amount,
      transactionId,
      stripeAccountId: user.stripeAccountId,
    });

    res
      .status(200)
      .json({ message: "Withdrawal request submitted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const withdraw_history = async (req: Request, res: Response): Promise<void> => {
  const { page, limit } = req?.query || {};

  const withdraw_history = await DB.WithdrawalModel.find(
    {
      requesterId: req.user.id,
    },
    { __v: 0 }
  )
    .sort({ createdAt: -1 })
    .skip((+(page || 1) - 1) * +(limit || 10))
    .limit(+(limit || 10));

  const total = await DB.WithdrawalModel.countDocuments({
    requesterId: req.user.id,
  });

  const pagination = {
    page: +(page || 1),
    limit: +(limit || 10),
    total,
    totalPages: Math.ceil(total / +(limit || 10)),
  };
  res.status(200).json({ withdraw_history, pagination });
};

const withdraw_requests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page, limit } = req.query || {};

  const withdraw_requests = await DB.WithdrawalModel.find({}, { __v: 0 })
    .sort({ createdAt: -1 })
    .skip((+(page || 1) - 1) * +(limit || 10))
    .limit(+(limit || 10));

  const total = await DB.WithdrawalModel.countDocuments();

  const pagination = {
    page: +(page || 1),
    limit: +(limit || 10),
    total,
    totalPages: Math.ceil(total / +(limit || 10)),
  };

  res.status(200).json({ withdraw_requests, pagination });
};

const update_withdraw_requests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { withdraw_id, status } = req.body || {};

  if (!withdraw_id || !status) {
    res.status(400).json({ message: "Withdraw ID and status are required" });
    return;
  }

  if (!["approved", "rejected", "pending", "failed"].includes(status)) {
    res.status(400).json({ message: "Invalid status value" });
    return;
  }

  const withdraw = await DB.WithdrawalModel.findById(withdraw_id);

  if (!withdraw) {
    res.status(404).json({ message: "Withdrawal request not found" });
    return;
  }

  if (status === "approved") {
    if (withdraw.status === "approved") {
      res
        .status(400)
        .json({ message: "This withdrawal request has already been approved" });
      return;
    }
    try {
      const stripeTransfer = await transferToConnectedAccount({
        destinationAccountId: withdraw.stripeAccountId,
        amountInCents: withdraw.amount * 100,
      });

      if (!stripeTransfer.success) {
        await DB.WithdrawalModel.findByIdAndUpdate(withdraw_id, {
          status: "failed",
          stripeResponse: stripeTransfer,
        });
        res.status(200).json({
          message: "Withdrawal request failed",
          stripeResponse: stripeTransfer,
        });
        return;
      }

      await DB.UserModel.findByIdAndUpdate(withdraw.requesterId, {
        $inc: { balance: -withdraw.amount },
      });
      await DB.WithdrawalModel.findByIdAndUpdate(withdraw_id, {
        status,
        stripeResponse: stripeTransfer,
      });
      res
        .status(200)
        .json({ message: "Withdrawal request approved successfully" });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  }

  try {
    await DB.WithdrawalModel.findByIdAndUpdate(withdraw_id, {
      status,
    });
    res
      .status(200)
      .json({ message: "Withdrawal request updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const earnings = async (req: Request, res: Response): Promise<void> => {
  const { page, limit } = req.query || {};

  const usersFromDB = await DB.UserModel.find()
    .sort({ createdAt: -1 })
    .skip((+(page || 1) - 1) * +(limit || 10))
    .limit(+(limit || 10));

  const users = usersFromDB.map(
    ({ _id, name, photoUrl, subscriptionExpiry, isSubscribed }) => ({
      _id,
      name,
      photoUrl,
      date_and_time: subscriptionExpiry
        ? new Date(Number(subscriptionExpiry) - 30 * 24 * 60 * 60 * 1000)
        : null,
      status: isSubscribed ? "paid" : "unpaid",
    })
  );

  const total = await DB.UserModel.countDocuments();

  const pagination = {
    page: +(page || 1),
    limit: +(limit || 10),
    total,
    totalPages: Math.ceil(total / +(limit || 10)),
  };

  res.status(200).json({ users, pagination });
};

export {
  balance,
  request_withdrawal,
  withdraw_history,
  withdraw_requests,
  update_withdraw_requests,
  earnings,
};
