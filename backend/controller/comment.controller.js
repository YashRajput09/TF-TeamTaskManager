import { Task } from "../models/task.modal.js";

export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;
    const loggedUserId = req?.user?._id;

    if (!message)
      return res.status(404).json({ message: "fill comment field" });

    const find_task = await Task.findById(taskId);
    if (!find_task) return res.status(404).json({ message: "Task not found" });

    // if (!find_task.comment) find_task.comment = [];
    find_task?.comment?.push({
      commentedBy: loggedUserId,
      message:message,
      date: Date.now(),
    });
    
    await find_task.save();

    res.status(200).json({ message: "done" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
export const getAllComments= async (req,res) =>{
    try {
        const {taskId}=req.params;
        
        const find_task=await Task.findById(taskId)
        if(!find_task) return res.status(404).json({message:"Task Not Found"})

        return res.status(200).json({allComments:find_task.comment});

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal Server Error",error})
    }
    



}
