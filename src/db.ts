import mongoose from "mongoose";
import Schema from "./schema";

mongoose
  .connect("mongodb://localhost:27017/avantra")
  .then(() => console.log("MongoDB Connected!"));

const UserModel = mongoose.model("User", Schema.User);

export = { mongoose, UserModel };
