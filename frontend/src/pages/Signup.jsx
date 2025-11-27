import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "../components/Card";
import {
  UserPlus,
  User,
  Lock,
  Phone,
  FileImage,
  FileText,
  Loader2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider"; // ✅ auth context
import axiosInstance from "./utility/axiosInstance";
import EmailVerificationBox from "../components/EmailVerificationBox";

export default function Signup() {
  const navigate = useNavigate();
  const { setIsAuthenticated, setProfile } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    bio: "",
    profileImage: null,
  });

  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      setForm((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Automatically call OTP send request when Modal open
    const { name, email, password, mobileNumber, bio, profileImage } = form;
    if (
      !name ||
      !email ||
      !password ||
      !mobileNumber ||
      !bio ||
      !profileImage
    ) {
      toast.error("Please fill all fields and upload an image!");
      return;
    }
    //Send OTP to email
    try {
      // const { data } = await axiosInstance.post(`/user/forgot-password`, {
      //   email: form.email,
      //   context: "register",
      // });
      // console.log(data);
      setIsModalOpen(true);
      console.log("object")
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message)
    }

    // const formData = new FormData();
    // Object.keys(form).forEach((key) => {
    //   formData.append(key, form[key]);
    // });

    // try {
    //   setSubmitting(true);
    //   const res = await axiosInstance.post("/user/signup", formData, {
    //     withCredentials: true,
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });

    //   const userData = res.data?.newUser || res.data?.user;
    //   toast.success("🎉 Account created successfully!");

    //   // ✅ Auto-login
    //   setIsAuthenticated(true);
    //   setProfile(userData);
    //   localStorage.setItem(
    //     "auth_user",
    //     JSON.stringify({
    //       id: userData._id,
    //       name: userData.name,
    //       email: userData.email,
    //     })
    //   );

    //   navigate("/dashboard");
    // } catch (error) {
    //   console.error("Signup error:", error);
    //   toast.error(error.response?.data?.message || "Signup failed!");
    // } finally {
    //   setSubmitting(false);
    // }
  };


  const handleSignUp = async (response) => {
    //Sign Up when OTP Verified
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      setSubmitting(true);
      // const res = await axiosInstance.post("/user/signup", formData, {
      //   withCredentials: true,
      //   headers: { "Content-Type": "multipart/form-data" },
      // });

      // const userData = res?.data?.newUser || res?.data?.user;
      toast.success("🎉 Account created successfully!");

      // ✅ Auto-login
      // setIsAuthenticated(true);
      // setProfile(userData);
      // localStorage.setItem(
      //   "auth_user",
      //   JSON.stringify({
      //     id: userData._id,
      //     name: userData.name,
      //     email: userData.email,
      //   })
      // );

      // navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed!");
    } finally {
      setSubmitting(false);
    }

    // setTimeout(() => {
      console.log("Verification successful:", response);
    // }, 5000);


    setTimeout(() => {
      
    }, 5000);

    return {success:true}
    // alert("Email verified successfully! ✅");
  };

  const handleChangeEmail = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-gray-900 ">
      {/* 🏷️ Signup heading */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Sign up for{" "}
        <span className="text-primary-600 dark:text-primary-400">TeamTask</span>
      </h1>

      <Card className="w-full max-w-md p-6 shadow-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Create Account
          </h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="John Doe"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="your@email.com"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                name="mobileNumber"
                type="tel"
                value={form.mobileNumber}
                onChange={onChange}
                placeholder="Enter your phone number"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <textarea
                name="bio"
                value={form.bio}
                onChange={onChange}
                placeholder="Tell us something about yourself..."
                rows="2"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none resize-none"
              ></textarea>
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Profile Image
            </label>
            <div className="relative">
              <FileImage className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                name="profileImage"
                type="file"
                accept="image/png, image/jpeg, application/pdf"
                onChange={onChange}
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none"
              />
            </div>
          </div>

          {/* ✅ Submit with loading spinner */}
          <button
            type="submit"
            disabled={submitting}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${
              submitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </Card>

      <EmailVerificationBox
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={form.email}
        onSuccess={handleSignUp}
        onChangeEmail={handleChangeEmail}
        otpLength={6}
        isDark={true}
      />
    </div>
  );
}
