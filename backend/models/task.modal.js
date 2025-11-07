import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
    }, // Which board this task belongs to
    title: {
      type: String,
      required: true,
    },
    description: String,
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Low" },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    }, // User ID
    status: {
      type: String,
      enum: ["Assigned", "In-progress", "Pending", "Done"],
      default: "Assigned",
    },
    deadline: Date,
    calendarEventId: { type: String },
    attachments: [
      {
        uploadedBy: {
          type:mongoose.Schema.ObjectId,
          ref:"User"
        },
        url: {
          type: String,
        },
      },
    ], // URLs
    submitMessage: {
      type: String,
    },
    declineMessage: {
      type: String,
    },

    comment: [
      {
        commentedBy: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        message: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    group:[{
      type:mongoose.Schema.ObjectId,
      ref:"User"
    }],

    history: [{ message: String, date: Date }],
    createdBy: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    category: {
      type: String,
      default: "uncategorized",
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
// export default User;
// tasks.collection
