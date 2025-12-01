import { clouddebugger } from "googleapis/build/src/apis/clouddebugger/index.js";
import { Task } from "../models/task.modal.js";

export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;
    const loggedUserId = req?.user?._id;

    if (!message)
      return res.status(404).json({ message: "fill comment field" });

    const find_task = await Task.findById(taskId).populate(
      "comment.commentedBy"
    );
    if (!find_task) return res.status(404).json({ message: "Task not found" });

    // if (!find_task.comment) find_task.comment = [];
    find_task?.comment?.push({
      commentedBy: loggedUserId,
      message: message,
      date: Date.now(),
    });

    await find_task.save();

    res.status(200).json({ message: "done" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
export const getAllComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const find_task = await Task.findById(taskId).populate(
      "comment.commentedBy"
    );
    if (!find_task) return res.status(404).json({ message: "Task Not Found" });

    return res.status(200).json({ allComments: find_task.comment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const userId = req.user?._id;

    //Find Task First
    const find_task = await Task.findById(taskId).populate("comment.commentedBy");
    if (!find_task) return res.status(500).json({ message: "Task Not Found" });

    const find_comment = find_task.comment.id(commentId);
    if (!find_comment) return res.status(500).json({ message: "Comment Not Found" });

    if (find_comment.commentedBy?.id.toString() !== userId.toString())
      return res.status(500).json({ message: "You Not Created this Comment" });

    find_comment.deleteOne();
    await find_task.save()

    // if (find_comment.parentId) {
      //   console.log("first");
      //   await comment_model.findByIdAndUpdate(find_comment.parentId, {
    //     $pull: { replies: commentId },
    //   });
    //   console.log("first");
    //   // console.log(parent_comment.replies);
    // }
    // // console.log(find_comment.parentId);
    
    // // // console.log(find_comment.parentId)
    // // console.log(commentId)

    // await comment_model.deleteMany({ parentId: commentId });
    // await find_comment.deleteOne();

    const all_comment = find_task.comment;
    //    task.history.push({
    //   message: `Comment deleted: "${comment.message?.slice(0, 200)}"`,
    //   by: userId,
    //   date: new Date()
    // });

    res.status(200).json({ message: "Comment Deleted ",all_comment });
    // res.status(200).json({ message: "Comment Deleted ", all_comment });
  } catch (error) {}
};

export const editComment = async (req, res) => {
  try {
    const {taskId,commentId}=req.params
    const { newText} = req.body;
    const userId = req.user?._id;

    const find_task = await Task.findById(taskId).populate("comment.commentedBy");
       if (!find_task)
      return res.status(500).json({ message: "Task Not Found" });


       const find_comment=find_task.comment.id(commentId)
    if (!find_comment)
      return res.status(500).json({ message: "Comment Not Found" });

    if (find_comment.commentedBy?._id.toString() !== userId.toString())
      return res.status(500).json({ message: "You Not Created this Comment" });

  find_comment.message=newText;

    // const updated_comment = await comment_model.findByIdAndUpdate(
    //   commentId, { $set: {comment: newText,modifyAt: Date.now(), },},{ new: true}
    // );
    await find_task.save();
  //  find_comment.populate("commentedBy");
    res.status(200).json({ message: "Updated Successfully", updated_comment:find_comment });
  } catch (error) {
    console.log(error);
  }
};
