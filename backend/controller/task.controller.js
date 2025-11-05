import express from "express";
import cloudinary from "../config/cloudConfig.js";
import { groupModel } from "../models/group.model.js";
import { Task } from "../models/task.modal.js";
import User from "../models/user_model.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, status, deadline, category } =
      req.body;
      // console.log(req.body);
      
    const { groupId } = req.params;
    const adminId = req?.user?._id;
    const attachment = req.files?.attachment;

    // if (!req.files || Object.keys(req.files).length === 0) {
    //   return res
    //     .status(400)
    //     .json({ message: "User profile image is required" });
    // }
    if (!title || !priority)
      return res.status(404).json({ message: "Fill All Fields" });

    console.log(groupId);
    const find_group = await groupModel.findById(groupId);
    if (!find_group) {
      return res.status(404).json({ message: "No Such Group Found" });
    }

    // const find_assignedUser=find_group?.members?.includes(assignedTo);
    // console.log(find_group);
    let find_assignedUser = null;
    if (assignedTo) {
      if (!find_group?.members?.some((m) => m.toString() === assignedTo))
        return res.status(404).json({ message: "User not in group yet !!" });

      find_assignedUser = await User.findById(assignedTo);
    }

    let cloudinaryResponse = null;
    if (attachment) {
      const allowedFormates = ["image/jpeg", "image/png", "image/pdf"];
      if (!allowedFormates.includes(attachment.mimetype)) {
        return res.status(400).json({
          message: "Invalid image formate, only jpg, png, pdf are allowed",
        });
      }

      cloudinaryResponse = await cloudinary.uploader.upload(
        attachment.tempFilePath,
        {
          folder: "TF-TeamTaskManager/attachments",
          resource_type: "auto",
        }
      );
      console.log(cloudinaryResponse);
    }
    // console.log(title, description, priority, status, assignedTo, deadline);
    // console.log(cloudinaryResponse?.public_id);
    // console.log(cloudinaryResponse?.secure_url);
    // console.log(cloudinaryResponse?.url);

    const newTask = new Task({
      title,
      description,
      priority,
      status,
      createdBy: adminId,
      assignedTo: assignedTo ? assignedTo : null,
      deadline,
      category,
      attachments: attachment
        ? {
            public_id: cloudinaryResponse?.public_id || "None",
            url: cloudinaryResponse?.secure_url || "None",
          }
        : null,
    });

    await newTask.save();

    find_group?.allTasks?.push(newTask?._id);

    if (assignedTo) find_assignedUser?.assignedTasks?.push(newTask?._id);
    await find_assignedUser?.save();

    const findAdmin = await User.findById(adminId);
    if (adminId) findAdmin?.createdTasks?.push(newTask?._id);

    await find_group.save();
    await findAdmin.save();

    return res.status(200).json({ message: "Task Created", newTask });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mwssage: "Internal Server Error", error });
  }
};

export const assignTask = async (req, res) => {
  try {
    const { assignedUserId, taskId } = req.body;
    const { groupId } = req.params;

    const find_task = await Task.findById(taskId);
    if (!find_task)
      return res.status(404).json({ message: "Task Not Found !!" });

    const find_group = await groupModel.findById(groupId);
    if (!find_group)
      return res.status(404).json({ message: "group Not Found !!" });

    let find_assignedUser = null;
    if (assignedUserId) {
      if (!find_group?.members?.some((m) => m.toString() === assignedUserId))
        return res.status(404).json({ message: "User not in group yet !!" });

      find_assignedUser = await User.findById(assignedUserId);
    }

    if (assignedUserId) find_assignedUser?.assignedTasks?.push(taskId);
    await find_assignedUser?.save();

    return res.status(200).json({ message: "Task Assigned", find_task });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getAllTask = async (req, res) => {
  try {
    const { groupId } = req.params;

    const find_group = await groupModel.findById(groupId).populate("allTasks");
    if (!find_group) return res.status(404).json({ message: "No Group Found" });

    const groupName = find_group?.name;
    const groupTasks = find_group.allTasks;

    return res.status(200).json({ groupName, groupTasks });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Internal server error", error });
  }
};
export const getUserAllTask = async (req, res) => {
  try {
    const loggedUserId = req?.user?._id;

    console.log(loggedUserId);
    const find_user = await User.findById(loggedUserId)
      .populate("createdTasks")
      .populate("assignedTasks");
    if (!find_user) return res.status(404).json({ message: "User Not Found" });
    
    const userTasks = {
      userName: find_user?.name,
      createdTasks: find_user?.createdTasks,
      assignedTasks: find_user?.assignedTasks,
    };
    
    return res.status(200).json(userTasks);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Internal server error", error });
  }
};

export const getSingleAllTask = async (req, res) =>{
 const {taskId}=req.params;

 const find_task=await Task.findById(taskId).populate('createdBy').populate('assignedTo');
 if(!find_task)  return res.status(404).json({ message: "Task Not Found" });
 
 
  return res.status(404).json(find_task);

  

}