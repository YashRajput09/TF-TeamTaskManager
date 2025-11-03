import mongoose from "mongoose";

const group_scheme = new mongoose.Schema(
  {
    name: String,
    description: String,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    members: [
       {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      
    ],
    //   createdAt: Date,
  },
  { timestamps: true }
);

export const groupModel = mongoose.model("Group", group_scheme);
// export default User;
