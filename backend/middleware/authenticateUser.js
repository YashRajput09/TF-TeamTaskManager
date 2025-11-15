import { groupModel } from '../models/group.model.js';
import userModel from '../models/user_model.js';
import jwt from 'jsonwebtoken';

export const isAuthenticated = async (req, res, next) => {
  try {
    const jwtToken = req.cookies.jwttoken;
    
    console.log('🔐 Auth Check - Headers:', req.headers);
    console.log('🔐 Auth Check - Cookies:', req.cookies);
    console.log('🔐 Extracted Token:', jwtToken ? 'Present' : 'Missing');
    
    if (!jwtToken) {
      return res.status(401).json({ message: "Unauthorized access, You need to login first." });
    }
    
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || 'fallbackSecret');
    console.log('🔐 Decoded Token User ID:', decoded.userId);
    
    const user = await userModel.findById(decoded.userId);
    console.log("🔐 Found User:", user ? user.email : 'No user found');
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    console.log('🔐 Auth Error:', error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const loggedUserId = req.user._id;
    
    const find_group = await groupModel.findById(groupId);

    if (!find_group) return res.status(404).json({ message: "Group Not Found" });

    if (find_group?.createdBy?.toString() != loggedUserId.toString()) {
      return res.status(403).json({ message: "Only Admin Of Group Have Permission" });
    }
    
    next();
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Make sure you're exporting both functions
export default {
  isAuthenticated,
  isAdmin
};