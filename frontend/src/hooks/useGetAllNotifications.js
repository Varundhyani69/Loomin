import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setHasNewNotification, addNotification } from "@/redux/notificationSlice";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const useGetAllNotifications = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/user/notifications`, { withCredentials: true });
                if (res.data.success) {
                    const notifications = res.data.notifications || [];

                    const hasUnread = notifications.some(n => !n.read);
                    dispatch(setHasNewNotification(hasUnread));

                    notifications.forEach(n => dispatch(addNotification(n)));
                }
            } catch (err) {
                console.error("❌ Failed to fetch notifications", err);
            }
        };

        fetchNotifications();
    }, [dispatch]);
};

export default useGetAllNotifications;
