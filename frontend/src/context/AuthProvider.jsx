import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile using cookie-based authentication
  const fetchProfile = async () => {
    try {
      console.log("🔐 Fetching profile...");
      const response = await axios.get("http://localhost:3000/user/myprofile", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Profile data:", response.data);
      setIsAuthenticated(true);
      setProfile(response.data);

      // Store minimal data in localStorage for quick client checks
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
        })
      );
    } catch (error) {
      console.error(
        "❌ Profile fetch error:",
        error.response?.data || error.message
      );
      setIsAuthenticated(false);
      setProfile(null);
      localStorage.removeItem("auth_user");
    } finally {
      setLoading(false);
    }
  };

  // Login user and refresh profile
  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login...");
      const response = await axios.post(
        "http://localhost:3000/user/login",
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("✅ Login successful:", response.data);

      // Fetch user profile after successful login
      await fetchProfile();
      return response.data;
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Logout user and clear context
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/user/logout",
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setProfile(null);
      localStorage.removeItem("auth_user");
    }
  };

  // Signup new user and refresh profile
  const signup = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/user/signup",
        userData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Signup successful:", response.data);

      // Fetch user profile after signup
      await fetchProfile();
      return response.data;
    } catch (error) {
      console.error("❌ Signup error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Auto-fetch profile if session cookie still valid
  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        await fetchProfile();
      } else {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        profile,
        setProfile,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        signup,
        refreshProfile: fetchProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
