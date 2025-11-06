// import axios from "axios";
// import React, { createContext, useContext, useEffect, useState } from "react";
// // import Cookies from "js-cookie";
// // dotenv.config();


// export const AuthContext = createContext(); //creates a context to that manage authenticated data (blog Info) golbally.

// // context provider component
// export const AuthProvider = ({ children }) => {
//   // takes {children} as a props, (means wraped with provider will be consider its children).
// //   const [blogs, setBlogs] = useState(); // manage the blogs state, initialy blogs is undefined.
//   const [profile, setProfile] = useState(); //  manage the profile state, initialy profile is undefined.
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
// //   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       // console.log("🔥 fetchProfile called");

//       try {
//         const { data } = await axios.get(
//           // `${import.meta.env.VITE_APP_BACKEND_URL}/user/myprofile`,
//           `http://localhost:3000/user/myprofile`,
//           {
//             withCredentials: true, // This ensures cookies are sent
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         setIsAuthenticated(true);
//         setProfile(data);
//         console.log("profiledata : ",data);

//         // }
//       }  catch (error) {
//         console.error(error);
//         setIsAuthenticated(false); // If fetching profile fails, user is not authenticated
//       } 
//     //   finally {
//     //     setLoading(false); // Once profile fetch is done, set loading to false
//     //   }
//     };

    
//     fetchProfile();
//   }, []); // '[]' indicates useEffect will run only once after component mounts.
//   return (
//     <AuthContext.Provider
//       value={{ profile,setProfile, isAuthenticated, setIsAuthenticated }}
//     //   value={{ blogs, profile, isAuthenticated, setIsAuthenticated }}
//     >
//       {children}
//       {/* {loading ? <BreezBlogsLoader count={6} /> : children} Show loading spinner if loading is true */}
//     </AuthContext.Provider> // provides the data to the childrean via the value prop
//   );
// };

// export const useAuth = () => useContext(AuthContext); // use the data





import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/user/myprofile", {
        withCredentials: true, // 👈 this sends the cookie
      });
      setUser(res.data.user || res.data);
      console.log(res);
      console.log(res.data);
      
    } catch (err) {
      console.error("❌ Error fetching profile:", err.response?.data || err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
