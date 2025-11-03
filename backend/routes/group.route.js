import expresss from "express"
import { addMember, createGroup, removeMember } from "../controller/group.controller.js";
import { isAuthenticated, isAdmin } from "../middleware/authenticateUser.js";

const router=expresss.Router();

router.post("/create-group",isAuthenticated,createGroup);
router.post("/add-member/:groupId",isAuthenticated,isAdmin,addMember);
router.post("/remove-member/:groupId",isAuthenticated,isAdmin,removeMember);

export default router;

