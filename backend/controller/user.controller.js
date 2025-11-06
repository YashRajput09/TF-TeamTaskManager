import userModel from '../models/user_model.js';
import  mongoose from 'mongoose';
import cloudinary from '../config/cloudConfig.js';
import createTokenAndSaveCookie from '../jwt/authenticateToken.js'
import bcrypt from 'bcryptjs';
import User from '../models/user_model.js';

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


// Login User
export const logInUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill required fields" });
    }
    const user = await userModel.findOne({ email }).select("+password");
    if (!user.password) {
      return res.status(400).json({ message: "User password is missing" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!user || !isValidPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = await createTokenAndSaveCookie(user._id, res);
    // console.log(token);
req.user = user;
    res.status(200).json({
      message: "User loggedIn successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
};

// Logout user
export const logOutUser = async (req, res) => {
  try {
    res.clearCookie("jwttoken", {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({ message: "User loggedOut successfully " });
  } catch (errro) {
    return res.status(500).json({ message: "Internal server error " });
  }
};

export const getMyProfile = async (req, res) => {
  // console.log(req);
  const userId=req.user?._id;

  const profileDetails = await User.findById(userId).populate('groups');
  // console.log(profileDetails);
  res.status(200).json(profileDetails);
};