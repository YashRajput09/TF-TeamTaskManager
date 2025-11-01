import express from "express";
import {signUpUser} from "../controller/user_controller.js";

const router = express.Router();
// const app = express();
// app.get("/signup", (req, res)=>{

//     res.send("radhe radhe");
// })
router.route('/signup').post(signUpUser).get((req,res)=>{
    res.send("radhe radhe");

});
// router.route('/login').post(logInUser);
// router.route('/logout').post(logOutUser);

export default router;