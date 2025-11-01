import userModel from '../models/user_model.js';
import  mongoose from 'mongoose';
import cloudinary from '../config/cloudConfig.js';
import createTokenAndSaveCookie from '../jwt/authenticateToken.js'
import bcrypt from 'bcryptjs';

// signup user
export const signUpUser = async(req, res) =>{
      try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ message: "User profile image is required" });
    }
    const { profileImage } = req.files;

    const allowedFormates = ["image/jpeg", "image/png", "image/pdf"];
    if (!allowedFormates.includes(profileImage.mimetype)) {
      return res.status(400).json({
        message: "Invalid image formate, only jpg, png, pdf are allowed",
      });
    }

    console.log(req.body);
    

    const { name, email, password, mobileNumber, bio } =
      req.body;
    if (
      !name ||
      !email ||
      !password ||
      !mobileNumber ||
      !bio
      // !profileImage
    ) {
      return res.status(400).json({ message: "Please fill required fields" });
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exist with this email" });
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
      profileImage.tempFilePath,
      {
        folder: "TF-TeamTaskManager",
      }
    );
    // console.log("cloudinary response : ", cloudinaryResponse);

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.log(cloudinaryResponse.error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      bio,
      profileImage: {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id,
      },
    });
    await newUser.save();

    if (newUser) {
      const token = await createTokenAndSaveCookie(newUser._id, res);
      return res
        .status(200)
        .json({
          message: "User registered successfully",
          newUser,
          token: token,
        });
    }
    console.log("New response : ", newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
}