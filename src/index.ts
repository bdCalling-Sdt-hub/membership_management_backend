require("dotenv").config();
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import routes from "./routes";

// config
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);
app.use(cors({ origin: "*" }));
app.use(express.json());

routes(app);
// config

const server = app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

server.setTimeout(50000);
