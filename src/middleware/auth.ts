import { Request as ExpressRequest, Response, NextFunction } from "express";
interface Request extends ExpressRequest {
  user?: any;
}
import { verify } from "jsonwebtoken";
import { config } from "dotenv";

config();

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // get jwt from header
  const jwt = req.headers.authorization?.split(" ")[1];

  // verify jwt
  if (!jwt) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
  verify(jwt, secret, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
    } else {
      if (decoded) {
        req.user = {
          id: (decoded as any).userId,
          email: (decoded as any).email,
        };
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    }
  });
}
