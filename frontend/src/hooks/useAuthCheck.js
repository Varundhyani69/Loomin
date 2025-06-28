// src/hooks/useAuthCheck.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from '@/utils/axios';
import { setNotifications } from '@/redux/notificationSlice';

const useAuthCheck = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const res = await axios.get('/user/notifications', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setNotifications(res.data.notifications));
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        loadNotifications();
    }, [dispatch]);
};

export default useAuthCheck;
