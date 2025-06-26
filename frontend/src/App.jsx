import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile.jsx";
import ChatPage from "./components/ChatPage";
import Notification from "./components/Notification";
import ProtectedRoute from "./components/ProtectedRoute";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers, setHasNewMessage, appendMessage } from "./redux/chatSlice";
import { addNotification, setHasNewNotification } from "./redux/notificationSlice";
import SocketContext from "./context/SocketContext";
import { toast } from "sonner";
import axios from "axios";
import { setAuthUser } from "./redux/authSlice";

function App() {
  const { user, selectedUser } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true); // 🔁 new

  // Get API URL from env
  const API_URL = import.meta.env.VITE_API_URL; // e.g. https://loomin-production.up.railway.app/api/v1
  // Remove the "/api/v1" part for socket connection base URL
  const socketBaseUrl = API_URL.replace(/\/api\/v1$/, "");

  // ✅ Auto-login using cookies
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/me`, {
          withCredentials: true,
        });
        dispatch(setAuthUser(data.user));
      } catch (err) {
        console.log("User not authenticated");
      } finally {
        setLoading(false); // 🔁 only stop loading when done
      }
    };
    fetchUser();
  }, [dispatch, API_URL]);

  // ✅ Connect socket after user is set
  useEffect(() => {
    if (!user) return;

    const socketio = io(socketBaseUrl, {
      query: { userId: user._id },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketio);

    socketio.on("connect", () => {
      console.log("✅ Socket connected:", socketio.id);
    });

    socketio.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socketio.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socketio.on("newMessage", (msg) => {
      if (
        !selectedUser ||
        (msg.senderId !== selectedUser._id && msg.receiverId !== selectedUser._id)
      ) {
        dispatch(setHasNewMessage(true));
      }
      dispatch(appendMessage(msg));
    });

    socketio.on("notification", (notification) => {
      dispatch(setHasNewNotification(true));
      dispatch(addNotification(notification));
      toast(notification.message);
    });

    socketio.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socketio.disconnect();
      setSocket(null);
    };
  }, [user, dispatch, selectedUser, socketBaseUrl]);

  const browserRouter = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { path: "/", element: <Home /> },
        {
          element: <ProtectedRoute />,
          children: [
            { path: "/profile/:id", element: <Profile /> },
            { path: "/account/edit", element: <EditProfile /> },
            { path: "/chat", element: <ChatPage /> },
            { path: "/notifications", element: <Notification /> },
          ],
        },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
  ]);

  // 🔁 Show loading screen while checking cookies
  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <SocketContext.Provider value={socket}>
      <RouterProvider router={browserRouter} />
    </SocketContext.Provider>
  );
}

export default App;
