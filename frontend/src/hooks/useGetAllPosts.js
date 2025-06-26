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

                if (res.data.success && Array.isArray(res.data.posts)) {
                    dispatch(setPosts(res.data.posts));
                } else {
                    dispatch(setPosts([]));
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
                dispatch(setPosts([]));
            }
        };

        fetchFollowingPosts();
    }, [dispatch]);
};

export default useGetAllPosts;
