import userModel from '../models/user_model.js';
import {groupModel} from '../models/group.model.js';
import GroupRequest from '../models/group.request.model.js';
import  mongoose, { trusted } from 'mongoose';
import cloudinary from '../config/cloudConfig.js';
import createTokenAndSaveCookie from '../jwt/authenticateToken.js'
import bcrypt from 'bcryptjs';
import User from '../models/user_model.js';
import { pushNotification } from '../utils/sendNotification.js';
import { generateUserSearchQuery } from '../utils/search.js';

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
      const token = await createTokenAndSaveCookie(newUser._id, res,true);
      return res
        .status(200)
        .json({
          message: "User registered successfully",
          newUser,
          token: token,
        });
    }
    // console.log("New response : ", newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
}

// Login User
export const logInUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password)
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
    const token = await createTokenAndSaveCookie(user._id, res,true);
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

export const getAllUsers=async (req,res)=>{
  try {

    const allusers=await User.find();

    if(!allusers) return res.status(404).json({message:"NO User found"})

    return res.status(200).json(allusers);
  } catch (error) {
console.log(error)
  }
}

// ✅ Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id; // Logged-in user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, bio } = req.body;
    let updatedFields = { name, email, bio };

    // ✅ Handle optional profile image update
    if (req.files && req.files.profileImage) {
      const { profileImage } = req.files;

      const allowedFormats = ["image/jpeg", "image/png"];
      if (!allowedFormats.includes(profileImage.mimetype)) {
        return res.status(400).json({ message: "Only JPG or PNG allowed" });
      }

      const cloudinaryResponse = await cloudinary.uploader.upload(
        profileImage.tempFilePath,
        { folder: "TF-TeamTaskManager" }
      );

      updatedFields.profileImage = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// search user
export const searchUser = async(req, res) => {
  try {
  const searchQuery = req.query.search || "";
  if(searchQuery){
    const searchUser = generateUserSearchQuery(searchQuery);
    const allSearchUsers = await userModel.find(searchUser);
     return res.status(200).json(allSearchUsers);
  }else {
    return res.status(400).json({ message: "Search query is required"}); // Handle missing query
  }
   } catch (error) {
    console.log(error);
  }
}

// grp join request
export const sendGroupJoinRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body; // user to invite
    const adminId = req.user._id; // admin

    const group = await groupModel.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check permission
    if (group.createdBy.toString() !== adminId.toString())
      return res.status(403).json({ message: "Only admin can invite" });

    // Check if user already in group
    if (group.members.includes(userId))
      return res.status(400).json({ message: "User already in group" });

    // Create join request
    const request = await GroupRequest.create({
      group: groupId,
      user: userId,
      invitedBy: adminId,
    });

    // Send Notification
    await pushNotification({
      userId,
      title: "Group Invitation",
      message: `You are invited to join group: ${group.name}`,
      type: "group_invite",
    });

    return res.json({ message: "Invitation sent", request });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// User Accepts / Rejects
export const respondGroupJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // "accept" or "reject"
    const loggedUserId = req.user._id;

    const reqData = await GroupRequest.findById(requestId).populate("group");
    if (!reqData) return res.status(404).json({ message: "Request not found" });

    if (reqData.user.toString() !== loggedUserId.toString())
      return res.status(403).json({ message: "Not allowed" });

    if (action === "reject") {
      reqData.status = "rejected";
      await reqData.save();

      await pushNotification({
        userId: reqData.invitedBy,
        title: "Invitation Rejected",
        message: `${req.user.name} rejected your group invite`,
        type: "group_reject",
      });

      return res.json({ message: "Request rejected" });
    }

    // ACCEPT
    reqData.status = "accepted";
    await reqData.save();
    console.log("reqData: ", reqData);

    await groupModel.findByIdAndUpdate(reqData.group._id, {
      $push: { members: loggedUserId },
    });

    await User.findByIdAndUpdate(loggedUserId,{
      $push:{groups : reqData?.group._id}
    })

    await pushNotification({
      userId: reqData.invitedBy,
      title: "Invitation Accepted",
      message: `${req.user.name} joined your group: ${reqData.group.name}`,
      type: "group_accept",
    });

    return res.json({ message: "Joined successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyGroupInvites = async (req, res) => {
  try {
    const invites = await GroupRequest.find({
      user: req.user._id,
      status: "pending",
    })
      .populate("group", "name description")
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, invites });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};