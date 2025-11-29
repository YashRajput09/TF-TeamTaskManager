// pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "../components/Card";
import { LogIn, User, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import axiosInstance from "./utility/axiosInstance";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth(); // Use the login function from context
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("🔐 Login attempt:");
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("email and password are required.");
      setError("email and password are required.");
      return;
    }

    try {
      setSubmitting(true);

      // Use the auth context login function instead of axiosInstance
      await login(form.email, form.password);

      // Navigate to dashboard on success

      const { data } = await axiosInstance.post("/user/login", form);
      // pretend API call
     
      toast.success("loged in successfully");
      await new Promise((r) => setTimeout(r, 600));
      localStorage.setItem("auth_user", JSON.stringify({ email: form.email }));
      navigate("/dashboard");
    } catch (err) {
      // console.error("❌ Login error:", err);
      toast.error(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 bg-gray-900 h-lvh">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Log in
          </h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="your@email.com"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none border border-gray-300 dark:border-gray-600"
                autoComplete="email"
                required
              />
            </div>
          </div>

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
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none border border-gray-300 dark:border-gray-600"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
         
          <div className="flex m-0 px-4 w-full">
            <span onClick={()=>navigate(`/user/forgot-password`,{state:{email:form.email}})} className="ml-auto text-sm hover:underline text-blue-500 cursor-pointer">
              Forgot Password ??
            </span>
          </div>
        

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
