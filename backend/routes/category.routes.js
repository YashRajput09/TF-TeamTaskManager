import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoriesWithTasks,
} from "../controller/category.controller.js";
import { isAuthenticated } from "../middleware/authenticateUser.js"; // if you use JWT auth

const router = express.Router();

router.post("/create/:groupId", isAuthenticated, createCategory);
router.get("/get-all-categories/:groupId", isAuthenticated, getAllCategories);
router.get("/get-all-categories/with-tasks", isAuthenticated, getCategoriesWithTasks);

export default router;
