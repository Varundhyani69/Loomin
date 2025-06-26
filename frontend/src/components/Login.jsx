import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://loomin-backend-production.up.railway.app";
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((store) => store.auth);

  const redirectPath =
    new URLSearchParams(location.search).get("redirect") || "/";

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (user) navigate(redirectPath, { replace: true });
  }, [user, navigate, redirectPath]);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/user/login`, input, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message);
        navigate(redirectPath);
        setInput({ email: "", password: "" });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white px-4">
      <form
        onSubmit={loginHandler}
        className="w-full max-w-md bg-[#1e1e1e] shadow-[0_4px_20px_rgba(0,0,0,0.6)] rounded-xl p-8 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="bg-[#2a2a2a] text-white border-none focus:ring-0"
            required
            autoComplete="off"
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
            autoComplete="off"
          />
        </div>

        {loading ? (
          <Button disabled className="w-full bg-[#333]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </Button>
        ) : (
          <Button type="submit" className="w-full bg-[#0095F6] hover:bg-[#007adf]">
            Login
          </Button>
        )}

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
