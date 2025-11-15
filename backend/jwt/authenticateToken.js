import jwt from 'jsonwebtoken';
import userModel from '../models/user_model.js';

const createTokenAndSaveCookies = async (userId, res, rememberMe = false) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: rememberMe ? "7d" : "1h",
    });
    
    // FIXED: For localhost development, use this configuration:
    res.cookie("jwttoken", token, {
        httpOnly: true, // Protect from XSS attacks
        sameSite: 'lax', // Changed from 'none' to 'lax' for localhost
        secure: true,   // false for localhost (HTTP)
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 7 days or 1 hour
        path: '/',
    });
    
    console.log(token)
    await userModel.findByIdAndUpdate(userId, { token });
    return token;
}

export default createTokenAndSaveCookies;
