import axios from "axios";
// import { json } from "react-router-dom";


const axiosInstance=axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL,
    withCredentials:true,

    headers:{
        ContentType:"application/json",
    }
})

export default axiosInstance;