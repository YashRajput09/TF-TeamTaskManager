import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
  email: { type: String},
  otp: { type: String },
  otpExpires: { type: Date },
  isOtpVerified:{type:Boolean},
});

export const otp_model = mongoose.model("otp_model", otpSchema);
