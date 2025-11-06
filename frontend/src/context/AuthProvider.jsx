// // context/AuthProvider.jsx
// import axios from "axios";
// import React, { createContext, useContext, useEffect, useState } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [profile, setProfile] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const fetchProfile = async () => {
//     try {
//       console.log("🔐 Fetching profile...");
      
//       const response = await axios.get(
//         "http://localhost:3000/user/myprofile",
//         {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
      
//       console.log("✅ Profile data:", response.data);
//       setIsAuthenticated(true);
//       setProfile(response.data);
      
//       // Store user info in localStorage for your RequireAuth helper
//       localStorage.setItem("auth_user", JSON.stringify({
//         id: response.data._id,
//         name: response.data.name,
//         email: response.data.email
//       }));
      
//     } catch (error) {
//       console.error("❌ Profile fetch error:", error.response?.data || error.message);
//       setIsAuthenticated(false);
//       setProfile(null);
//       localStorage.removeItem("auth_user");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:3000/user/login",
//         { email, password },
//         { 
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       console.log("✅ Login successful:", response.data);
      
//       // After successful login, fetch the profile
//       await fetchProfile();
      
//       return response.data;
//     } catch (error) {
//       console.error("❌ Login error:", error.response?.data || error.message);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post(
//         "http://localhost:3000/user/logout",
//         {},
//         { withCredentials: true }
//       );
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       setIsAuthenticated(false);
//       setProfile(null);
//       localStorage.removeItem("auth_user");
//     }
//   };

//   const signup = async (userData) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:3000/user/signup",
//         userData,
//         { 
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );
      
//       console.log("✅ Signup successful:", response.data);
      
//       // After successful signup, fetch the profile
//       await fetchProfile();
      
//       return response.data;
//     } catch (error) {
//       console.error("❌ Signup error:", error.response?.data || error.message);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{ 
//         profile, 
//         setProfile, 
//         isAuthenticated, 
//         setIsAuthenticated,
//         login,
//         logout,
//         signup,
//         refreshProfile: fetchProfile,
//         loading
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// context/AuthProvider.jsx
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      console.log("🔐 Fetching profile...");
      
      const response = await axios.get(
        "http://localhost:3000/user/myprofile",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("✅ Profile data:", response.data);
      setIsAuthenticated(true);
      setProfile(response.data);
      
      localStorage.setItem("auth_user", JSON.stringify({
        id: response.data._id,
        name: response.data.name,
        email: response.data.email
      }));
      
    } catch (error) {
      console.error("❌ Profile fetch error:", error.response?.data || error.message);
      setIsAuthenticated(false);
      setProfile(null);
      localStorage.removeItem("auth_user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login...");
      
      const response = await axios.post(
        "http://localhost:3000/user/login",
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("✅ Login successful:", response.data);
      
      // After successful login, fetch the profile
      await fetchProfile();
      
      return response.data;
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      throw error;
    }
  };

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

  const signup = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/user/signup",
        userData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log("✅ Signup successful:", response.data);
      
      // After successful signup, fetch the profile
      await fetchProfile();
      
      return response.data;
    } catch (error) {
      console.error("❌ Signup error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Only fetch profile on initial app load if we might already be logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Check if we have auth_user in localStorage (might be logged in from previous session)
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
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};