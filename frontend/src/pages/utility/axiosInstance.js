import axios from "axios";
// import { json } from "react-router-dom";


const axiosInstance=axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials:true,

    headers:{
        ContentType:"multipart/form-data",
    }
})

export default axiosInstance;