import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSuggestedUsers } from "@/redux/authSlice";

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/user/suggested`,
                    { withCredentials: true }
                );

                if (res.data.success) {
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                console.log("Error fetching suggested users:", error);
            }
        };

        fetchSuggestedUsers();
    }, [dispatch]);
};

export default useGetSuggestedUsers;
