import categoryModel from "../models/category.model.js";

export const createCategory = async (req, res) => {
  try {
      console.log(req.body);
    const { name, description, color } = req.body;
    const { groupId } = req.params;    

    const category = await categoryModel.create({
      name,
      description,
      color,
      group: groupId,
      createdBy: req.user._id, // assume user is logged in
    });
console.log(category);

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const {groupId} = req.params;
    const categories = await categoryModel.find({ createdBy: req.user._id, group: groupId });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCategoriesWithTasks = async (req, res) => {
  try {
    const categories = await categoryModel.find({ createdBy: req.user._id })
      .populate("tasks") // fetch linked tasks automatically
      .exec();

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
