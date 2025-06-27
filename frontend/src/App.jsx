import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import Notification from "./components/Notification";
import ProtectedRoute from "./components/ProtectedRoute";
import useGetAllNotifications from "@/hooks/useGetAllNotifications";
import { useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOnlineUsers,
  setHasNewMessage,
  appendMessage,
} from "./redux/chatSlice";
import {
  addNotification,
  setHasNewNotification,
} from "./redux/notificationSlice";
import useAuthCheck from "./hooks/useAuthCheck";
import SocketContext from "./context/SocketContext";
import { toast } from "sonner";

function App() {
  useAuthCheck();
  useGetAllNotifications();

  const { user, selectedUser } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext); // ✅ FIXED HERE

  useEffect(() => {
    if (!socket || !user) return;

    socket.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on("newMessage", (msg) => {
      if (
        !selectedUser ||
        (msg.senderId !== selectedUser._id && msg.receiverId !== selectedUser._id)
      ) {
        dispatch(setHasNewMessage(true));
      }
      dispatch(appendMessage(msg));
    });

    socket.on("notification", (notification) => {
      dispatch(setHasNewNotification(true));
      dispatch(addNotification(notification));
      toast(notification.message);
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      socket.off("notification");
    };
  }, [socket, dispatch, selectedUser, user]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          element: <ProtectedRoute />,
          children: [
            { path: "/", element: <Home /> },
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

  return <RouterProvider router={router} />;
}

export default App;
