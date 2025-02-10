import { Request as ExpressRequest, Response } from "express";
interface Request extends ExpressRequest {
  user?: any;
}
import DB from "src/db";

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

  const balance = await DB.UserModel.findById(req.user.id, {
    balance: 1,
    _id: 0,
  });

  if (!balance?.balance || amount > balance?.balance) {
    res.status(400).json({
      message: "Insufficient balance",
    });
    return;
  }

  try {
    await DB.WithdrawalModel.create({
      requesterId: req.user.id,
      amount,
    });

    res
      .status(200)
      .json({ message: "Withdrawal request submitted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { balance, request_withdrawal };
