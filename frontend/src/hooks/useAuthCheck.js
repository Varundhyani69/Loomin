// hooks/useAuthCheck.js
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axios"; // Use your custom axios instance with baseURL set
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";

export default function useAuthCheck() {
    const [checking, setChecking] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axiosInstance.get("/user/me", {
                    withCredentials: true,
                });
                dispatch(setUser(res.data.user));
            } catch (err) {
                console.log("Not logged in");
            } finally {
                setChecking(false);
            }
        };

        fetchUser();
    }, [dispatch]);

    return checking;
}
