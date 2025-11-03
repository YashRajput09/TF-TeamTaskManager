import mongoose from "mongoose"

const taskSchema=new mongoose.Schema(
    {
      groupId:{
        type:mongoose.Schema.ObjectId,
        ref:"group"
      },        // Which board this task belongs to
      title: String,
      description: String,
      priority: { type: String, enum: ["High", "Medium", "Low"], default: "Low" },
      assignedTo: ObjectId,      // User ID
      status: { type: String, enum: ["To Do", "In Progress", "Review", "Done"], default: "To Do" },
      deadline: Date,
      attachments: [String],    // URLs
      history: [
        { message: String, date: Date }
      ],
      createdBy: ObjectId,
      createdAt: Date
    }

)

export const Task = mongoose.model("Task", taskSchema);
// export default User;
// tasks.collection
