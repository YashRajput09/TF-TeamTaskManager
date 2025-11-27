import React, { useEffect, useRef, useState } from "react";
import { X, Mail, Check, AlertCircle, Moon, Sun } from "lucide-react";
import axiosInstance from "../pages/utility/axiosInstance";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
const api = {
  verifyOTP: async (email, otp) => {
    try {
      const { data } = await axiosInstance.post("/user/verifyotp", {
        email,
        context: "register",
        otp,
      });
      console.log(data)
      return { success: true, message: "OTP verified " }
    } catch (error) {
      console.log(error);
      // toast.error(error?.response?.data?.message || "Invalid")
      return { success: false, message: "Invalid OTP" }
    }
  },
  verifyOT: async (email, otp) => {
    // Example: await axios.post('/api/auth/verify-otp', { email, otp });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === "123456") {
          resolve({ success: true, message: "OTP verified " });
        } else {
          reject({ success: false, message: "Invalid OTP" });
        }
      }, 10000);
    });
  },

  resendOTP: async (email) => {
    console.log("object")
    // Example: await axios.post('/api/auth/resend-otp', { email });
     try {
      const { data } = await axiosInstance.post(`/user/forgot-password`, {
        email,
        context: "register",
      });
      // console.log(data);
      return { success: true }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
    // return new Promise((resolve) => {
    //   setTimeout(() => resolve({ success: true }), 1000);
    // });
  },
};

const EmailVerificationBox = ({
  isOpen,
  onClose,
  email,
  onSuccess,
  onChangeEmail,
  otpLength = 6,
  isDark = true,
}) => {
  const [otp, setOtp] = useState(Array(otpLength).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const otpRefs = useRef([]);

  const navigateTo=useNavigate();
  //Send Email Automatically when Modal open
  useEffect(() => {
    {
      isOpen && console.log("Email Sended");
    }
  }, [isOpen]);

  // Mask email function
  const maskEmail = (email) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) return email;
    const masked = localPart.slice(0, 2) + "****" + localPart.slice(-1);
    return `${masked}@${domain}`;
  };

  // Timer countdown
  useEffect(() => {
    if (isOpen && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer, isOpen]);

  // Auto-focus first input on modal open
  useEffect(() => {
    if (isOpen && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const [redirectTimer, setRedirectTimer] = useState(5);

  useEffect(() => {
    if (!successState) return; // only run when success UI is shown

    // const timer = setInterval(() => {
    //   setRedirectTimer((prev) => {
    //     if (prev <= 1) {
    //       clearInterval(timer);
    //       // redirect here
    //       // navigate("/login") OR handleClose()
    //       return 0;
    //     }
    //     return prev - 1;
    //   });
    // }, 1000);
     const timer = setTimeout(() => {
      if(redirectTimer>0){
        clearTimeout(timer)
        Navigate("/dashboard")
        return
      }
      setRedirectTimer(redirectTimer-1)
     }, 1000);

    return () => clearTimeout(timer);
  }, [successState]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-advance to next input
    if (value && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, otpLength).split("");
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      if (idx < otpLength) newOtp[idx] = digit;
    });
    setOtp(newOtp);

    // Focus on next empty input or last input
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    const focusIndex = nextEmptyIndex === -1 ? otpLength - 1 : nextEmptyIndex;
    otpRefs.current[focusIndex]?.focus();
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== otpLength) {
      setError("Please enter complete OTP");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await api.verifyOTP(email, otpValue);

      console.log(response);
      if(!response?.success){
        setError(response?.message)
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return
      }
      // Close modal with delay for success animation
      const signupResult = await onSuccess(response);

      if (signupResult?.success) {
        setSuccessState(true);
      } else {
        toast.error(signupResult?.message);
        handleClose();
      }
      // console.log(signupResult);
    } catch (err) {
      setError(err.message || "Invalid OTP");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setOtp(Array(otpLength).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      await api.resendOTP(email);
      setResendTimer(30);
      setOtp(Array(otpLength).fill(""));
      setError("");
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setOtp(Array(otpLength).fill(""));
    setError("");
    setResendTimer(30);
    setSuccessState(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
        isDark ? "bg-black/70" : "bg-black/60"
      }`}
      style={{
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 ${
          isShaking ? "animate-shake" : ""
        } ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"}`}
        style={{
          animation: "modalSlideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark
              ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success State */}
        {successState ? (
          <div className="text-center py-8 animate-fadeIn">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-scaleIn ${
                isDark ? "bg-green-900/50" : "bg-green-100"
              }`}
            >
              <Check
                className={`w-8 h-8 ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}
                strokeWidth={3}
              />
            </div>
            {/* <h3
              className={`text-2xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Verified!
            </h3> */}
            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } text-xl font-bold mb-8 `}
            >
              🎉 Account created successfully!
            </p>
            <span className="text-xs px-2 text-gray-400/60 flex items-start">
              Auto Redirect in {redirectTimer}
            </span>
            <button
              onClick={() => navigateTo("/dashboard")}
              disabled={loading}
              className={`w-full py-3  rounded-lg font-semibold transform transition-all flex flex-col items-center justify-center ${
                isDark
                  ? "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-[1.02]"
              } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Home"
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDark
                  ? "bg-gradient-to-br from-blue-600 to-purple-700"
                  : "bg-gradient-to-br from-blue-500 to-purple-600"
              }`}
            >
              <Mail className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h2
              className={`text-2xl font-bold text-center mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Verify Your Email
            </h2>
            <p
              className={`text-center mb-6 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              We've sent a {otpLength}-digit code to
              <br />
              <span
                className={`font-semibold ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {maskEmail(email)}
              </span>
            </p>

            {/* OTP Input */}
            <div className="mb-6">
              <label
                className={`block text-sm font-medium mb-3 text-center ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Enter Verification Code
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={loading || successState}
                    className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 rounded-lg transition-all focus:outline-none ${
                      error
                        ? isDark
                          ? "border-red-500 bg-red-900/30 text-red-400"
                          : "border-red-500 bg-red-50 text-red-600"
                        : digit
                        ? isDark
                          ? "border-blue-500 bg-blue-900/30 text-blue-400 focus:ring-2 focus:ring-blue-500"
                          : "border-blue-500 bg-blue-50 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        : isDark
                        ? "border-gray-600 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 flex items-center justify-center gap-2 text-red-500 text-sm animate-fadeIn">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOTP}
              disabled={otp.join("").length !== otpLength || loading}
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

            {/* Resend OTP */}
            <div className="text-center mt-6">
              {resendTimer > 0 ? (
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Resend OTP in{" "}
                  <span
                    className={`font-semibold ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {resendTimer}s
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className={`text-sm font-medium hover:underline disabled:opacity-50 ${
                    isDark
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Change Email */}
            {onChangeEmail && (
              <div className="text-center mt-4">
                <button
                  onClick={onChangeEmail}
                  disabled={loading}
                  className={`text-sm hover:underline disabled:opacity-50 ${
                    isDark
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Change Email Address
                </button>
              </div>
            )}

            {/* Demo Hint */}
            <p
              className={`text-xs text-center mt-6 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Demo: Use code "123456" to verify
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
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

export default EmailVerificationBox;
