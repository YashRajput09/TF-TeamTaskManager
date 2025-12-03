import { Task } from "../models/task.modal.js";
import { groupModel } from "../models/group.model.js";
import { userModel } from "../models/user_model.js";
import { generateSearchQuery, generateGroupSearchQuery, generateUserSearchQuery } from "../utils/search.js";

/**
 * 🔍 Combined Search Controller
 * Searches across Tasks and Groups (expandable for Users later)
 */
export const globalSearch = async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim() || "";
    if (!searchQuery) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Generate filters
    const taskQuery = generateSearchQuery(searchQuery);
    const groupQuery = generateGroupSearchQuery(searchQuery);
    const userQuery = generateUserSearchQuery(searchQuery);

    // if(userQuery){
    //   await userModel.find(taskQuery).select("name email mobileNumber")
    // }

    // Run both searches in parallel
    const [tasks, groups, users] = await Promise.all([
      Task.find(taskQuery).select("title category status createdBy"),
      groupModel.find(groupQuery).select("name description members"),
      userModel.find(userQuery).select("name email mobileNumber"),
    ]);


    return res.status(200).json({
      success: true,
      totalResults: tasks.length + groups.length + users.length,
      results: {
        tasks,
        groups,
        users,
      },
    });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during search",
      error: error.message,
    });
  }
};
