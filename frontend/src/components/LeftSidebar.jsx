import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
    Home,
    LogOut,
    MessageCircle,
    PlusSquare,
    Search,
    Bell
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setHasNewMessage } from '@/redux/chatSlice';
import { setHasNewNotification } from '@/redux/notificationSlice';
import { Dialog, DialogTrigger, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';
import { Input } from './ui/input';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const { user } = useSelector(store => store.auth);
    const { hasNewMessage } = useSelector(store => store.chat);
    const { hasNewNotification } = useSelector(store => store.notification);

    const logoutHandler = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/v1/user/logout', {
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
            dispatch(setHasNewMessage(false));
            navigate('/chat', { replace: true });
        }
        else if (textType === 'Notifications') {
            dispatch(setHasNewNotification(false));
            navigate('/notifications');
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
            const res = await axios.get(`http://localhost:8080/api/v1/user/search?username=${value}`, {
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
        {
            icon: (
                <div className="relative">
                    <Bell />
                    {hasNewNotification && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </div>
            ),
            text: 'Notifications',
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
            <div className="fixed top-0 z-10 left-0 px-4 border-4 border-gray-300 w-[16%] h-screen">
                <div className="flex flex-col">
                    <h1 className="my-8 pl-3 font-bold">Logo</h1>
                    <div>
                        {SidebarItems.map((item, index) => (
                            <div
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sidebarHandler(item.text);
                                }}
                                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
                            >
                                {item.icon}
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <CreatePost open={open} setOpen={setOpen} />
            </div>

            {/* ✅ Search Popup Dialog */}
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                <DialogContent className="bg-white z-50 w-full max-w-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Search Users</h2>
                    <Input
                        placeholder="Type username..."
                        value={query}
                        onChange={handleSearch}
                        className="mb-4"
                    />
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {results.length > 0 ? results.map((u) => (
                            <div
                                key={u._id}
                                onClick={() => {
                                    navigate(`/profile/${u._id}`);
                                    setSearchOpen(false);
                                    setQuery('');
                                    setResults([]);
                                }}
                                className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-md"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={u.profilePicture} />
                                    <AvatarFallback>{u.username[0]}</AvatarFallback>
                                </Avatar>
                                <span>{u.username}</span>
                            </div>
                        )) : query && <span className="text-sm text-gray-500">No users found</span>}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LeftSidebar;
