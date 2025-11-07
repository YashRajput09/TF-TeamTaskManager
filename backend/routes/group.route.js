import expresss from "express"
import { addMember, createGroup, getUserGroups, removeMember,getAllUserGroups, getAllGroups } from "../controller/group.controller.js";
import { isAuthenticated, isAdmin } from "../middleware/authenticateUser.js";

const router=expresss.Router();

router.post("/create-group",isAuthenticated,createGroup);
router.post("/add-member/:groupId",isAuthenticated,isAdmin,addMember);
router.post("/remove-member/:groupId",isAuthenticated,isAdmin,removeMember);

//get all group of logged in user associated with
router.get("/get-allUserGroup/:userId",isAuthenticated,getUserGroups);

router.get("/my-groups", isAuthenticated, getAllUserGroups);
router.get("/all-groups", isAuthenticated, getAllGroups);


export default router;

