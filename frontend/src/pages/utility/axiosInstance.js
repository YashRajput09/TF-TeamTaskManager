import axios from "axios";
// import { json } from "react-router-dom";

const BackendUrl= import.meta.env.VITE_BACKEND_URL;

const axiosInstance=axios.create({
    baseURL: BackendUrl,
    withCredentials:true,

    headers:{
        "Content-Type": "application/json",
    }
})

export default axiosInstance;