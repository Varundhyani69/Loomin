import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setMessage } from '@/redux/chatSlice';
import axiosInstance from '@/utils/axios';  // Use the configured axios instance

const useGetAllMessage = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;

        const fetchMessages = async () => {
            try {
                const res = await axiosInstance.get(`/message/all/${userId}`, {
                    withCredentials: true,
                });

                if (res.data.success && Array.isArray(res.data.messages)) {
                    dispatch(setMessage(res.data.messages));
                }
            } catch (err) {
                console.error('Error loading messages', err);
            }
        };

        fetchMessages();
    }, [userId, dispatch]);
};

export default useGetAllMessage;
