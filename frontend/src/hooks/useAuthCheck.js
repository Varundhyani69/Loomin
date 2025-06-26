// hooks/useAuthCheck.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";

export default function useAuthCheck() {
    const [checking, setChecking] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/v1/user/me", {
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
