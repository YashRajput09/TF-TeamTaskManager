import express from 'express';
import {isAuthenticated, isAdmin} from '../middleware/authenticateUser.js'
import {signUpUser, logInUser, logOutUser, getMyProfile, getAllUsers, updateUserProfile, searchUser, sendGroupJoinRequest, respondGroupJoinRequest, getMyGroupInvites } from '../controller/user.controller.js';
import { resetPassword, sendOtp, validateOtp } from '../controller/password.controller.js';

const router = express.Router();

router.route('/signup').post(signUpUser);
router.route('/login').post(logInUser);
router.route('/logout').post(isAuthenticated, logOutUser);
router.route("/myprofile").get(isAuthenticated, getMyProfile);
router.get("/get-all-users",isAuthenticated,getAllUsers);
router.put("/update-profile", isAuthenticated, updateUserProfile);

//Email verification and forgot password route
router.post("/forgot-password",sendOtp);
router.post("/verifyotp",validateOtp);
router.post("/reset-password",resetPassword);

router.get("/api/search", searchUser);

router.post("/:groupId/invite", isAuthenticated, isAdmin, sendGroupJoinRequest);

router.post("/request/:requestId/respond", isAuthenticated, respondGroupJoinRequest);
router.get("/my-group/invites", isAuthenticated, getMyGroupInvites)


export default router;