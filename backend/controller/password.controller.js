import { sendEmail } from "../config/nodemailer.js";
import  user  from "../models/user_model.js";
import crypto from "crypto";
import bycrypt from "bcryptjs"
import { json } from "express";
import { otp_model } from "../models/otp.model.js";


export const sendOtp = async (req, res) => {
  const { email ,context } = req.body;

  console.log(email,context);
  try {
    let otp,user_name

    const all=await user.find();

    console.log(all);
    if(context==="forgot-password"){
      console.log("object")
      const find_user = await user.findOne({ email });
    
      if (!find_user) {
        return res.status(400).json({ message: "Invalid Email" });
      }
    
      user_name=find_user.name;
    
      // console.log(user_name , context)
    
       otp = crypto.randomInt(100000, 999999).toString();
    
      // console.log(otp)
      // console.log(email);
      find_user.otp = otp;
      find_user.otpExpires = Date.now() + 10 * 60 * 1000;
    
      await find_user.save();

    }else if(context==="register"){
        const existing_otp=await otp_model.findOne({email});

        if(existing_otp){
          await otp_model.deleteOne({email});
        }

        user_name="User";

        otp = crypto.randomInt(100000, 999999).toString();
        // console.log(otp);
        // console.log(email);
  
        const otpEntry = new otp_model({
          email,
          otp,
          otpExpires: Date.now() + 10 * 60 * 1000,
        });
  
        await otpEntry.save();
    }

      await sendEmail({
        to:email,
        subject: "Email Verification",
        html: ` <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          color: #333;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        "
      >
        <div style="padding: 0px; text-align: center; border-radius: 8px 8px 0 0">
          <h1 style="margin: 0; font-size: 32px">
            Cool<span style="color: rgb(0, 123, 255); font-weight: bolder"
              >Blogs</span
            >
          </h1>
        </div>
        <div style="padding: 0 20px">
          <h1 style="color: #4caf50; margin-bottom: 10px">Hello, ${user_name}!</h1>
  
          <p style="font-size: 16px; color: #555">
            We received a request to reset your password. Please use the OTP below
            to reset your password:
          </p>
        </div>
        <div
          style="
            padding: 10px 20px;
            text-align: center;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          "
        >
          <h2 style="font-size: 32px; color: #4caf50; margin: 10px 0">${otp}</h2>
        </div>
        <div style="padding: 0 20px">
          <p style="font-size: 16px; line-height: 1.6; color: #555">
            This OTP is valid for the next <strong>10 minutes</strong>. If you did
            not request this, please ignore this email or contact our support team
            immediately.
          </p>
          <p style="margin: 0 0 15px; font-size: 16px; color: #555">Thank you</p>
        </div>
        <div
          style="
            background-color: #f4f4f4;
            margin-top: 20px;
            color: #666666;
            padding: 10px;
            text-align: center;
            border-radius: 0 0 8px 8px;
          "
        >
          <p style="margin: 0; font-size: 14px">
            If you have any questions, Contact us at
            <a
              href="mailto:support@coolblogs.com"
              style="color: #4caf50; text-decoration: none"
              >support@yourapp.com</a
            >.
          </p>
          <p>
            Visit us at
            <a href="#" style="color: #4caf50; text-decoration: none"
              >www.coolblogs.com</a
            >
          </p>
        </div>
      </div>
        `,

      });
    res.status(200).json({message:"Otp Send to "+ email})
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Error in sending",error})
  }
};

export const validateOtp= async (req,res)=>{
     const {email,otp,context}=req.body;
     try {
      let find_user;

      if(context==="forgot-password"){
         find_user=await user.findOne({email});
        
      }else if(context==="register"){
       find_user=await otp_model.findOne({email});
      }
     
      // console.log(find_user);
       if(!find_user){
        return res.status(400).json({message:"No User Found"});
       }
  
       if(Date.now() > find_user.otpExpires){
        return res.status(400).json({message:"OTP has Expired"})
       }
  
       if(otp!==find_user.otp){
        return res.status(400).json({message:"Invalid OTP"});
       }
       find_user.otp=null;
       find_user.otpExpires=null;
       find_user.isOtpVerified=true;
       find_user.save();

       res.status(200).json({message:"Validation Successfull"});
     } catch (error) {
        return res.status(500).json({message:"Error in Validation",error})
     }
    
}

export const resetPassword =async (req,res)=>{
    const {email,new_password,cpassword}=req.body;

    try {
            const find_user=await user.findOne({email});

            if(!find_user){
              return res.status(400).json({message:"No User Found"});
            }

            if(!find_user.isOtpVerified){
              return res.status(400).json({message:"Verify OTP First"});
            }

            if(!new_password || !cpassword){
              return res.status(400).json({message:"All Fields Are Required"});
            }

            if(new_password!==cpassword){
              return res.status(400).json({message:"Password Not Matched"});
            }

            const hashed_password=await bycrypt.hash(new_password,10);

            find_user.password=hashed_password;
            find_user.isOtpVerified=null;
            find_user.save();

            res.status(200).json({message:"Password Change Successfully"});
    } catch(error) {
      console.log(error)
      res.status(500).json({message:"Internal Server error",error})
    }


}
