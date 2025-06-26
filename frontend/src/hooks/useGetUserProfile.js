import axiosInstance from "@/utils/axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/authSlice";
import { useNavigate } from "react-router-dom";

const useGetUserProfile = (userId, refreshFlag) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axiosInstance.get(`/user/${userId}/profile`, {
                    withCredentials: true,
                });

                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                } else {
                    dispatch(setUserProfile(null));
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    navigate("/login"); // Redirect if unauthorized
                }
                dispatch(setUserProfile(null));
            }
        };

        if (userId) fetchUserProfile();

        // Listen for profile refresh events
        const handleProfileRefresh = () => {
            if (userId) fetchUserProfile();
        };

        window.addEventListener("refreshProfile", handleProfileRefresh);

        return () => {
            window.removeEventListener("refreshProfile", handleProfileRefresh);
        };
    }, [userId, refreshFlag, dispatch, navigate]);
};

export default useGetUserProfile;
