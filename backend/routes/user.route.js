import express from 'express';
import {isAuthenticated} from '../middleware/authenticateUser.js'
import {signUpUser, logInUser, logOutUser, getMyProfile} from '../controller/user.controller.js';

const router = express.Router();

router.route('/signup').post(signUpUser);
router.route('/login').post(logInUser);
router.route('/logout').post(isAuthenticated, logOutUser);
router.route("/myprofile").get(isAuthenticated, getMyProfile);


export default router;