import mongoose from "mongoose";
import { Task } from "./task.modal.js";

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
    allTasks: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Task",
      },
    ],
    // allTasks: [
    //   {
    //     assignedTo:{
    //       type: mongoose.Schema.ObjectId,
    //       ref: "User",

    //     },
    //     taskId:{
    //       type: mongoose.Schema.ObjectId,
    //       ref: "Task",
    //     }
    //   },
    // ],
    //   createdAt: Date,
  },
  { timestamps: true }
);

export const groupModel = mongoose.model("Group", group_scheme);
// export default User;
