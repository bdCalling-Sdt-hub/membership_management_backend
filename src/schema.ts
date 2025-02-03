import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
  id: ObjectId,
  createdAt: { type: String, default: new Date() },
  photoUrl: { type: String, default: "https://ui-avatars.com/api/" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: String,
  dateOfBirth: Date,
  gender: String,
  referralCode: String,
  // auth
  passwordHash: { type: String, required: true },
  accountStatus: { type: String, default: "Active", required: true },
});

const Referral = new Schema({
  referredBy: ObjectId,
});

// Tools tab
const Video = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  views: { type: Number, default: 0, required: true },
});

const File = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  downloads: { type: Number, default: 0, required: true },
});

const Tool = new Schema({
  name: { type: String, required: true },
  videos: [Video],
  files: [File],
});

const Tools = new Schema({
  list: [Tool],
});

// Wallet tab
// const Withdraw = new Schema({
//   transactionId: { type: String, required: true },
//   createdAt: { type: Date, required: true, default: new Date() },
//   amount: { type: mongoose.Decimal128, default: 0.0, required: true },
//   status: { type: String, required: true, default: "Requested" },
// });

export = { User };
