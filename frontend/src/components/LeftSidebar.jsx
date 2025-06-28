import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
    Home,
    LogOut,
    MessageCircle,
    PlusSquare,
    Search,
    Bell
} from 'lucide-react';
import React, { useState, useContext, useEffect } from 'react'; // ✅ Added useContext, useEffect
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import { setHasNewMessage } from '@/redux/chatSlice';
import { setHasNewNotification } from '@/redux/notificationSlice';
import CreatePost from './CreatePost';
import { Dialog, DialogTrigger, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';
import { Input } from './ui/input';
import SocketContext from '@/context/SocketContext'; // ✅ Added socket context

const LeftSidebar = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "https://loomin-backend-production.up.railway.app";
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const { user } = useSelector(store => store.auth);
    const { hasNewMessage } = useSelector(store => store.chat);
    const { hasNewNotification } = useSelector(store => store.notification);
    const { socket } = useContext(SocketContext); // ✅ Destructure socket from context

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = () => {
            dispatch(setHasNewMessage(true)); // ✅ Show red dot
        };

        const handleNewNotification = () => {
            dispatch(setHasNewNotification(true)); // ✅ Show red dot
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('newNotification', handleNewNotification);
        };
    }, [socket, dispatch]); // ✅ Dependency array

    const logoutHandler = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/user/logout`, null, {
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                navigate('/login', { replace: true });
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') logoutHandler();
        else if (textType === 'Create') setOpen(true);
        else if (textType === 'Profile') navigate(`/profile/${user?._id}`, { replace: true });
        else if (textType === 'Home') navigate('/', { replace: true });
        else if (textType === 'Messages') {
            dispatch(setHasNewMessage(false)); // ✅ Hide red dot
            navigate('/chat', { replace: true });
        }
        else if (textType === 'Messages') {
            dispatch(setHasNewMessage(false)); // ✅ Clear red dot
            navigate('/chat');
        }

        else if (textType === 'Search') {
            setSearchOpen(true);
        }
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.length < 2) {
            setResults([]);
            return;
        }
        try {
            const res = await axios.get(`${API_BASE_URL}/user/search?username=${value}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setResults(res.data.users);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const SidebarItems = [
        { icon: <Home />, text: 'Home' },
        { icon: <Search />, text: 'Search' },
        {
            icon: (
                <div className="relative">
                    <MessageCircle />
                    {hasNewMessage && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </div>
            ),
            text: 'Messages',
        },
        { icon: <PlusSquare />, text: 'Create' },
        // LeftSidebar.jsx
        {
            icon: (
                <div className="relative">
                    <MessageCircle />
                    {hasNewMessage && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </div>
            ),
            text: 'Messages',
        },
        {
            icon: (
                <Avatar>
                    <AvatarImage className="w-6 h-6 rounded-full" src={user?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: 'Profile',
        },
        { icon: <LogOut />, text: 'Logout' },
    ];

    return (
        <>
            <div className="hidden md:flex fixed top-0 left-0 z-10 h-screen w-72 flex-col bg-[#1e1e1e] text-white border-r border-gray-800 shadow-[4px_0_10px_rgba(0,0,0,0.4)] px-4">
                <Link to="/" >
                    <img className="h-25 w-35" src="/NoBg.png" alt="logo" />
                </Link>

                <div className="space-y-3">
                    {SidebarItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                sidebarHandler(item.text);
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2a2a2a] cursor-pointer transition-all"
                        >
                            {item.icon}
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
                <CreatePost open={open} setOpen={setOpen} />
            </div >

            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                <DialogContent className="bg-[#1e1e1e] text-white z-50 w-full max-w-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4">Search Users</h2>

                    <Input
                        placeholder="Type username..."
                        value={query}
                        onChange={handleSearch}
                        className="mb-4 bg-[#2a2a2a] text-white border border-gray-700 focus-visible:ring-0"
                    />

                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scroll">
                        {results.length > 0 ? (
                            results.map((u) => (
                                <div
                                    key={u._id}
                                    onClick={() => {
                                        navigate(`/profile/${u._id}`);
                                        setSearchOpen(false);
                                        setQuery('');
                                        setResults([]);
                                    }}
                                    className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#2e2e2e] rounded-md transition"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={u.profilePicture}
                                            alt={u.username}
                                            className="rounded-full object-cover"
                                        />
                                        <AvatarFallback>{u.username[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{u.username}</span>
                                </div>
                            ))
                        ) : (
                            query && <span className="text-sm text-gray-400">No users found</span>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LeftSidebar;
