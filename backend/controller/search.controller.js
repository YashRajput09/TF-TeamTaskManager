import { Task } from "../models/task.modal.js";
import { groupModel } from "../models/group.model.js";
import { generateSearchQuery, generateGroupSearchQuery } from "../utils/search.js";

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

    // Run both searches in parallel
    const [tasks, groups] = await Promise.all([
      Task.find(taskQuery).select("title category status createdBy"),
      groupModel.find(groupQuery).select("name description members"),
    ]);

    return res.status(200).json({
      success: true,
      totalResults: tasks.length + groups.length,
      results: {
        tasks,
        groups,
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
