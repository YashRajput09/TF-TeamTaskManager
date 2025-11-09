import express from "express";
import cloudinary from "../config/cloudConfig.js";
import { groupModel } from "../models/group.model.js";
import { Task } from "../models/task.modal.js";
import { generateSearchQuery } from "../utils/search.js";
import User from "../models/user_model.js";

export const searchBlogs = async (req, res) => {
  const searchQuery = req.query.search || ""; // Default to an empty string if search is not provided
  // console.log(req.query.search);
  if (searchQuery) {
    const searchTasks = generateSearchQuery(searchQuery);
    // console.log("searchBlogs", searchBlogs)
    const allSearchTasks = await Task.find(searchTasks);
    return res.status(200).json(allSearchTasks); // Return search results as JSON
  } else {
    return res.status(400).json({ message: "Search query is required" }); // Handle missing query
  }
};

export const createTask = async (req, res) => {
  try {
    console.log(req.body);
    const {
      title,
      description,
      priority,
      assignedTo,
      status,
      deadline,
      category,
    } = req.body;
    // console.log(req.body);

    console.log(req?.files);
    const { groupId } = req.params;
    const adminId = req?.user?._id;
    const attachment = req.files?.attachments;

    if (attachment) {
      console.log(attachment);
      console.log("file aa gyi");
    }
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
      group: groupId,
      attachments: attachment
        ? {
            uploadedBy: adminId,
            url: cloudinaryResponse?.secure_url || "None",
          }
        : null,
      history: {
        message: `Task Created by ${adminId} `,
        date: Date.now(),
      },
    });

    await newTask.save();

    if (find_assignedUser !== null) {
      newTask.history.push({
        message: `Assigned to ${find_assignedUser?.name} `,
      });
    }

    find_group?.allTasks?.push(newTask?._id);

    if (assignedTo) find_assignedUser?.assignedTasks?.push(newTask?._id);
    await find_assignedUser?.save();

    const findAdmin = await User.findById(adminId);
    if (adminId) findAdmin?.createdTasks?.push(newTask?._id);

    await find_group.save();
    await findAdmin.save();

    const populatedTask = await newTask.populate("group");
    return res
      .status(200)
      .json({ message: "Task Created", newTask: populatedTask });
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

    if (assignedUserId) {
      find_assignedUser?.assignedTasks?.push(taskId);
      find_task.history.push({
        message: `Assigned to ${find_assignedUser?.name} `,
      });
    }

    await find_assignedUser?.save();
    await find_task?.save();

    return res.status(200).json({ message: "Task Assigned", find_task });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getAllTask = async (req, res) => {
  try {
    const { groupId } = req.params;

    const find_group = await groupModel
      .findById(groupId)
      .populate("allTasks")
      .populate({
        path: "allTasks",
        populate: [{ path: "assignedTo", model: "User" }],
      });
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
      // .populate("createdTasks")
      .populate({
        path: "createdTasks",
        populate: [
          { path: "assignedTo", model: "User" },
          { path: "group", model: "Group" },
        ],
      })
      .populate({
        path: "assignedTasks",
        populate: [
          { path: "assignedTo", model: "User" },
          { path: "group", model: "Group" },
        ],
      });

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

export const getSingleAllTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const find_task = await Task.findById(taskId)
      .populate("createdBy")
      .populate("attachments.uploadedBy")
      .populate("assignedTo").populate("group");
    if (!find_task) return res.status(404).json({ message: "Task Not Found" });

    return res.status(200).json(find_task);
  } catch (error) {
    return res.status(200).json({ message: "Internal Error", error });
  }
};

//used when member accept task and start to work on
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const loggedUserId = req?.user?._id;

    console.log(loggedUserId);
    console.log("hello");
    // 1. Find Task
    const task = await Task.findById(taskId).populate("createdBy assignedTo");
    if (!task) return res.status(404).json({ message: "Task not found" });

    // console.log(task.createdBy.id,task.assignedTo.id,loggedUserId)
    // 3. Permission Check
    const isGroupAdmin = task.createdBy?.id === loggedUserId.toString();
    const isAssignedUser = task.assignedTo?.id === loggedUserId.toString();

    if (!isGroupAdmin && !isAssignedUser) {
      return res.status(403).json({
        message:
          "Permission denied. Only admin or assigned user can update task status.",
      });
    }

    // 4. Update Status
    task.status = status;
    task?.history.push({ message: `In progess By ${task?.assignedTo}` });
    await task.save();

    return res.status(200).json({
      message: "Task status updated ,  In progress by member",
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating status", error });
  }
};

export const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { url, message } = req.body;
    const loggedUserId = req?.user?._id;

    console.log("Incoming files:", req.files);

    // Safely extract single or multiple attachments
    let attachments = req.files?.attachment || null;

    const find_task = await Task.findById(taskId).populate(
      "attachments.uploadedBy"
    );
    if (!find_task) return res.status(404).json({ message: "Task not found" });

    // ✅ Ensure attachments array exists
    if (!Array.isArray(find_task.attachments)) {
      find_task.attachments = [];
    }

    // 🔒 Only assigned user can submit
    if (find_task.assignedTo.toString() !== loggedUserId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the assigned user can submit this task." });
    }

    // ✅ Handle file uploads if present
    if (attachments) {
      attachments = Array.isArray(attachments) ? attachments : [attachments];

      console.log("Attachments to upload:", attachments);

      const allowedFormats = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "text/plain",
        "text/csv",
      ];

      for (const file of attachments) {
        if (!allowedFormats.includes(file.mimetype)) {
          return res.status(400).json({
            message: `Invalid file format (${file.mimetype}). Allowed: jpg, png, pdf, txt, csv.`,
          });
        }

        const cloudinaryResponse = await cloudinary.uploader.upload(
          file.tempFilePath,
          {
            folder: "TF-TeamTaskManager/attachments",
            resource_type: "auto",
          }
        );

        console.log("✅ Uploaded file:", cloudinaryResponse.secure_url);

        // ✅ Now safe to push
        find_task.attachments.push({
          uploadedBy: loggedUserId,
          url: cloudinaryResponse?.secure_url,
        });
      }
    }

    // ✅ Optional URL-based attachment
    if (url) {
      find_task.attachments.push({
        uploadedBy: loggedUserId,
        url,
      });
    }

    // ✅ Optional message
    if (message) {
      find_task.submitMessage = message;
    }

    // 🟡 Change status and add history
    find_task.status = "Pending";
    find_task.history.push({
      message: `Task submitted for review by ${loggedUserId}`,
      date: Date.now(),
    });

    await find_task.save();

    return res.status(200).json({
      message: "✅ Task submitted successfully and sent for review.",
      task: find_task,
    });
  } catch (error) {
    console.error("❌ Error in submitTask:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Task Approval Only by Admin
export const approveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    // const { isAccept, declineMessage  ,payload} = req.body;
    const { action,message} = req.body;
    const loggedUserId = req?.user?._id; //Admin and creator of project of Group

console.log(req.body)
    console.log(action,message);
    const find_task = await Task.findById(taskId);
    if (!find_task) return res.status(400).json({ message: "Task not found" });

    console.log(find_task.createdBy, loggedUserId);
    //Check if logged user is creator of group or not
    const find_loggedUser = await User.findById(loggedUserId);
    if (find_task?.createdBy.toString() !== loggedUserId.toString())
      return res.status(400).json({ message: "Only Admin can approve" });

    if (action=="decline") {
      if (message) {
        find_task.declineMessage = message;
      }

      find_task.history.push({
        message: "submission declined ",
        date: Date.now(),
      });

      return res
        .status(400)
        .json({ message: "Submission Declined",message });
    }
    find_task.history.push({ message: "Task completed", date: Date.now() });
   find_task.status="Completed"

    await find_task.save();

    return res.status(200).json({ message: "Task Completed", find_task });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
