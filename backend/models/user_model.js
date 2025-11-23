import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [validator.isEmail, 'Please provide a valid email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // hide password in queries by default
    },
     mobileNumber: {
    type: Number,
    required: true,
  },
  
//     resetOtp: String,
//   resetOtpExpires: Date,
 otp: String,
  otpExpires: Date,
  isOtpVerified: Boolean,

     profileImage: {
    public_id: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      required: true,
    },
    url: {
      type: String,
      required: [true, "Profile image is required"],
    },
  },
    bio: {
      type: String,
      default: "Hey there! I'm using TaskFlow 🚀",
    },
    token: {
    type: String,
  },

    createdAt: {
    type: Date,
    default: Date.now,
  },

   telegramChatId: {
    type: String,
    default: null,   // no chat until linked
  },
  telegramLinked: {
    type: Boolean,
    default: false,  // useful flag to check quickly
  },
  telegramLinkToken: {
    type: String,
    default: null,   // temporary code for linking
  },
  telegramLinkTokenExpiresAt: {
    type: Date,
    default: null,   // security: code valid only for some time
  },

  googleCalendar: {
      accessToken: String,
      refreshToken: String,
      isConnected: { type: Boolean, default: false },
      lastSync: Date
  },

  createdAt: {
      type: Date,
      default: Date.now,
  },

    // optional: store references for quick user-task queries
  createdTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
  ],
  assignedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
  ],
  groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
  ],
  },
  
  
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
export default User;
