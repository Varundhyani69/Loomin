import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/user/register`,
                input,
                {
                    headers: { "Content-type": "application/json" },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setInput({ username: "", email: "", password: "" });
                navigate(`/profile/${res.data.user._id}`);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white px-4">
            <form
                onSubmit={signupHandler}
                className="w-full max-w-md bg-[#1e1e1e] shadow-[0_4px_20px_rgba(0,0,0,0.6)] rounded-xl p-8 space-y-6"
            >
                <h1 className="text-2xl font-bold text-center">Create Your Account</h1>

                <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="bg-[#2a2a2a] text-white border-none focus:ring-0"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="bg-[#2a2a2a] text-white border-none focus:ring-0"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="bg-[#2a2a2a] text-white border-none focus:ring-0"
                        required
                    />
                </div>

                {loading ? (
                    <Button disabled className="w-full bg-[#333]">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                    </Button>
                ) : (
                    <Button type="submit" className="w-full bg-[#0095F6] hover:bg-[#007adf]">
                        Sign Up
                    </Button>
                )}

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Signup;
