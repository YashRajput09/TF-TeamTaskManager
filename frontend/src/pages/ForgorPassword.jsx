import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, Check, X, Moon, Sun } from "lucide-react";
import axiosInstance from "./utility/axiosInstance";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailDisabled, setEmailDisabled] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [slideOut, setSlideOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [theme, setTheme] = useState("system");
  const [isDark, setIsDark] = useState(false);

  const otpRefs = useRef([]);

 const location=useLocation();
 const autoFillEmail=location?.state?.email
useEffect(()=>{
  setEmail(autoFillEmail);
},[])

  useEffect(() => {
    const checkTheme = () => {
      if (theme === "system") {
        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDark(systemDark);
      } else {
        setIsDark(theme === "dark");
      }
    };

    checkTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => checkTheme();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(`/user/forgot-password`, {
        email,
        context: "forgot-password",
      });
      toast.success("OTP Send Successfully");
      setTimeout(() => {
        setLoading(false);
        setEmailDisabled(true);
        setStep(2);
        setResendTimer(30);
      }, 1500);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
    setLoading(false);
  };

  const handleChangeEmail = () => {
    setEmailDisabled(false);
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;

    try {
      setLoading(true);
      const { data } = await axiosInstance.post(`/user/verifyotp`, {
        email,
        context: "forgot-password",
        otp: otpValue,
      });
    
      //   setTimeout(() => {
      //   setLoading(false);
      // if (otpValue === "123456") {
      setSlideOut(true);
      setTimeout(() => {
        setStep(3);
        setSlideOut(false);
      }, 500);
      // } else {
      //   setOtpError(true);
      //   setTimeout(() => setOtpError(false), 500);
      // }
      //   }, 1000);
    } catch (error) {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 1500);
      console.log(error);
    }
    setLoading(false);
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setOtp(["", "", "", "", "", ""]);
    otpRefs.current[0]?.focus();
  };

  const getPasswordStrength = () => {
    if (!newPassword) return { text: "", color: "", width: "0%" };
    const length = newPassword.length;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*]/.test(newPassword);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
      Boolean
    ).length;

    if (length < 6) return { text: "Weak", color: "bg-red-500", width: "33%" };
    if (length < 10 || strength < 3)
      return { text: "Medium", color: "bg-yellow-500", width: "66%" };
    return { text: "Strong", color: "bg-green-500", width: "100%" };
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword || newPassword !== confirmPassword)
      return;

    setLoading(true);
    try {
      const { data } = await axiosInstance.post(`/user/reset-password`, {
        email,
        new_password: newPassword,
        cpassword:confirmPassword,
      });
      toast.success("Password Change Successfully")
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 1500);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
    setLoading(false);
  };

  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={cycleTheme}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                : "bg-white hover:bg-gray-100 text-gray-700 shadow-md"
            }`}
            title={`Current: ${theme}`}
          >
            {theme === "system" ? (
              <div className="relative w-5 h-5">
                <Sun className="absolute w-3 h-3 top-0 right-0" />
                <Moon className="absolute w-3 h-3 bottom-0 left-0" />
              </div>
            ) : isDark ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>

        <div
          className={`rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${
            slideOut
              ? "translate-x-full opacity-0"
              : "translate-x-0 opacity-100"
          } ${otpError ? "animate-shake" : ""} ${
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          {/* Step 1 & 2: Email and OTP */}
          {step !== 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isDark
                      ? "bg-gradient-to-br from-blue-600 to-purple-700"
                      : "bg-gradient-to-br from-blue-500 to-purple-600"
                  }`}
                >
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Forgot Password?
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {step === 1
                    ? "Enter your registered email to receive OTP"
                    : "Enter the 6-digit code sent to your email"}
                </p>
              </div>

              {/* Email Input */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={emailDisabled}
                    placeholder="your.email@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all ${
                      isDark
                        ? "bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-800"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    } border focus:ring-2 disabled:cursor-not-allowed`}
                  />
                </div>
                {emailDisabled && (
                  <button
                    onClick={handleChangeEmail}
                    className={`text-sm mt-2 font-medium ${
                      isDark
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    Change Email
                  </button>
                )}
              </div>

              {/* Send OTP Button */}
              {step === 1 && (
                <button
                  onClick={handleSendOTP}
                  disabled={!email || loading}
                  className={`w-full py-3 rounded-lg font-semibold transform transition-all flex items-center justify-center ${
                    isDark
                      ? "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-[1.02]"
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Send OTP"
                  )}
                </button>
              )}

              {/* OTP Input */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Enter OTP
                    </label>
                    <div className="flex gap-2 justify-between">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all ${
                            otpError
                              ? "border-red-500"
                              : isDark
                              ? "border-gray-600 bg-gray-900 text-white focus:ring-blue-500 focus:border-blue-500"
                              : "border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-transparent"
                          } focus:ring-2`}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <X className="w-4 h-4" /> Invalid OTP. Please try again.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={otp.join("").length !== 6 || loading}
                    className={`w-full py-3 rounded-lg font-semibold transform transition-all flex items-center justify-center ${
                      isDark
                        ? "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-[1.02]"
                    } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Verify OTP"
                    )}
                  </button>

                  <div className="text-center text-sm">
                    {resendTimer > 0 ? (
                      <span
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        Resend OTP in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        className={`font-medium ${
                          isDark
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <p
                    className={`text-xs text-center ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Hint: Use OTP "123456" for demo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && !success && (
            <div className="p-8 animate-fadeIn">
              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isDark
                      ? "bg-gradient-to-br from-green-600 to-teal-700"
                      : "bg-gradient-to-br from-green-500 to-teal-600"
                  }`}
                >
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Reset Password
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Create a strong new password
                </p>
              </div>

              <div className="space-y-6">
                {/* New Password */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`w-full pl-10 pr-12 py-3 rounded-lg transition-all ${
                        isDark
                          ? "bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-transparent"
                      } border focus:ring-2`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDark
                          ? "text-gray-500 hover:text-gray-400"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Password Strength:
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.text === "Weak"
                              ? "text-red-500"
                              : passwordStrength.text === "Medium"
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div
                        className={`w-full rounded-full h-2 overflow-hidden ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={`w-full pl-10 pr-12 py-3 rounded-lg transition-all ${
                        isDark
                          ? "bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-transparent"
                      } border focus:ring-2`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDark
                          ? "text-gray-500 hover:text-gray-400"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <X className="w-4 h-4" /> Passwords do not match
                    </p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Passwords match
                    </p>
                  )}
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    loading
                  }
                  className={`w-full py-3 rounded-lg font-semibold transform transition-all flex items-center justify-center ${
                    isDark
                      ? "bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800"
                      : "bg-gradient-to-r from-green-500 to-teal-600 hover:shadow-lg hover:scale-[1.02]"
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="p-8 text-center animate-fadeIn">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn ${
                  isDark
                    ? "bg-gradient-to-br from-green-600 to-teal-700"
                    : "bg-gradient-to-br from-green-500 to-teal-600"
                }`}
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <h2
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Success!
              </h2>
              <p
                className={`mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Your password has been reset successfully
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className={`w-full py-3 rounded-lg font-semibold transform transition-all ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-[1.02]"
                } text-white`}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <a
            href="/login"
            className={`text-sm transition-colors ${
              isDark
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            ← Back to Login
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-10px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(10px);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
