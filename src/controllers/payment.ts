import { Request, Response } from "express";

const create_payment = async (req: Request, res: Response): Promise<void> => {
  const {} = req.body || {};
  res.status(200).json({ message: "hello" });
};

export { create_payment };
