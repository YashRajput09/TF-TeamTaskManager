import express from 'express';
import {isAuthenticated} from '../middleware/authenticateUser.js'
import {signUpUser, logInUser, logOutUser} from '../controller/user.controller.js';

const router = express.Router();

router.route('/signup').post(signUpUser);
router.route('/login').post(logInUser);
router.route('/logout').post(isAuthenticated, logOutUser);

export default router;