import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // description: {
    //   type: String,
    //   trim: true,
    // },
    color: {
      type: String,
      default: "#3b82f6", // Tailwind blue-500 default
    },
    // group: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Group",
    //   required: true,
    // },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// 🔗 Virtual relation: Category <--> Tasks
// categorySchema.virtual("tasks", {
//   ref: "Task",
//   localField: "_id",
//   foreignField: "category",
// });

export default mongoose.model("Category", categorySchema);
