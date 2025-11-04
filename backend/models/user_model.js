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

// // 🔐 Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // 🧠 Password comparison method
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

const User = mongoose.model("User", userSchema);
export default User;
