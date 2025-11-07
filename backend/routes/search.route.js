import express from "express";
import { globalSearch } from "../controller/search.controller.js";

const router = express.Router();

// ✅ Search endpoint
router.get("/search", globalSearch);

export default router;
