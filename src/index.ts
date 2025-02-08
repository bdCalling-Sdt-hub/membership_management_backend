require("dotenv").config();
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import http from "http";
import "@services/notificationService";
import { registerRoutes, registerRoutesThatNeedsRawBody } from "./routes";

// config
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);
app.use(cors({ origin: "*" }));

registerRoutesThatNeedsRawBody(app); // have to call this before express.json() to get raw body
app.use(express.json());
registerRoutes(app);
// config

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.setTimeout(50000);

// socket.io for notifications
io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("leave", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { io };
