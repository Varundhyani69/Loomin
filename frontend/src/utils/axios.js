import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://loomin-production.up.railway.app/api/v1",
    withCredentials: true, // send cookies with requests if needed
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
