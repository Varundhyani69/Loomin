import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const useGetAllPosts = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchFollowingPosts = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8080/api/v1/post/following",
                    { withCredentials: true }
                );

                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchFollowingPosts();
    }, []);
};

export default useGetAllPosts;
