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
  address: String,

  // referral stuff
  referralCode: { type: String, unique: true },
  referredBy: { type: ObjectId, ref: "User" },
  referredUsers: [{ type: ObjectId, ref: "User" }],
  referralEarnings: { type: Number, default: 0 },

  // stripe stuff
  stripeAccountId: { type: String },
  stripeOnboardingDone: { type: Boolean, default: false },

  // auth
  passwordHash: { type: String, required: true },

  // account statuses
  accountStatus: {
    type: String,
    default: "active",
    enum: ["active", "deleted"],
    required: true,
  },
  emailVerified: { type: Boolean, default: false, required: true },
  isBanned: { type: Boolean, default: false, required: true },
  isSubscribed: { type: Boolean, default: false, required: true },
  subscriptionExpiry: { type: Date },
});

const OTP = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 5 },
  type: { type: String, required: true },
});

// Tools tab
const Video = new Schema({
  toolId: { type: ObjectId, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  views: { type: Number, default: 0, required: true },
});

const File = new Schema({
  toolId: { type: ObjectId, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  downloads: { type: Number, default: 0, required: true },
});

const Tool = new Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
});

// Notifcations tab
const Notification = new Schema({
  createdAt: { type: Date, default: Date.now },
  recipientId: { type: ObjectId, ref: "User" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  isRead: { type: Boolean, default: false, required: true },
});

// Referral Commissions
const Referral = new Schema({
  referralLevel: { type: Number, required: true },
  levelName: { type: String, required: true },
  commission: { type: Number, required: true },
});

const Payment = new Schema({
  userId: { type: ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

export = {
  User,
  OTP,
  Tool,
  Video,
  File,
  Notification,
  Referral,
  Payment,
};
