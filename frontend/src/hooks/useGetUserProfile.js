import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/authSlice";
import { useNavigate } from "react-router-dom";

const useGetUserProfile = (userId, refreshFlag) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/user/${userId}/profile`, {
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
                    navigate('/login'); // 🔐 redirect if not authenticated
                }
                dispatch(setUserProfile(null));
            }
        };

        if (userId) fetchUserProfile();

        // ✅ Listen for bookmark or post refresh triggers
        const handleProfileRefresh = () => {
            if (userId) fetchUserProfile();
        };

        window.addEventListener('refreshProfile', handleProfileRefresh);

        return () => {
            window.removeEventListener('refreshProfile', handleProfileRefresh);
        };
    }, [userId, refreshFlag, dispatch, navigate]);
};

export default useGetUserProfile;
