import axiosInstance from "@/utils/axios";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setMessage } from '@/redux/chatSlice';

const useGetAllMessage = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;

        const fetchMessages = async () => {
            try {
                const res = await axiosInstance.get(`/message/all/${userId}`);

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
