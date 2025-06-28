import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
    Home,
    LogOut,
    MessageCircle,
    PlusSquare,
    Search,
    Bell,
    Menu,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import {
    Dialog,
    DialogContent,
    DialogOverlay,
} from '@radix-ui/react-dialog';
import { Input } from './ui/input';

const LeftSidebar = () => {
    const API_BASE_URL =
        import.meta.env.VITE_API_URL ||
        'https://loomin-backend-production.up.railway.app';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const { user } = useSelector((store) => store.auth);

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
        setMenuOpen(false);
        switch (textType) {
            case 'Logout':
                logoutHandler();
                break;
            case 'Create':
                setOpen(true);
                break;
            case 'Profile':
                navigate(`/profile/${user?._id}`, { replace: true });
                break;
            case 'Home':
                navigate('/', { replace: true });
                break;
            case 'Messages':
                navigate('/chat', { replace: true });
                break;
            case 'Notifications':
                navigate('/notifications');
                break;
            case 'Search':
                setSearchOpen(true);
                break;
            default:
                break;
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
            const res = await axios.get(
                `${API_BASE_URL}/user/search?username=${value}`,
                {
                    withCredentials: true,
                }
            );
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
        { icon: <MessageCircle />, text: 'Messages' },
        { icon: <PlusSquare />, text: 'Create' },
        { icon: <Bell />, text: 'Notifications' },
        {
            icon: (
                <Avatar>
                    <AvatarImage
                        className="w-6 h-6 rounded-full"
                        src={user?.profilePicture}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: 'Profile',
        },
        { icon: <LogOut />, text: 'Logout' },
    ];

    return (
        <>
            {/* Mobile Top Navbar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-[#1e1e1e] h-16 flex items-center justify-between px-4 border-b border-gray-800">
                <Link to="/">
                    <img src="/NoBg.png" alt="logo" className="h-10 w-auto" />
                </Link>
                <button onClick={() => setMenuOpen(!menuOpen)}>
                    <Menu className="text-white" />
                </button>
            </div>

            {/* Mobile Sidebar */}
            {menuOpen && (
                <div className="md:hidden fixed top-16 left-0 w-full bg-[#1e1e1e] z-30 p-4 space-y-3 border-b border-gray-700">
                    {SidebarItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => sidebarHandler(item.text)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2a2a2a] cursor-pointer transition-all"
                        >
                            {item.icon}
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex fixed top-0 left-0 z-10 h-screen w-72 flex-col bg-[#1e1e1e] text-white border-r border-gray-800 shadow-lg px-4">
                <Link to="/">
                    <img className="h-24 w-auto" src="/NoBg.png" alt="logo" />
                </Link>

                <div className="space-y-3">
                    {SidebarItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => sidebarHandler(item.text)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2a2a2a] cursor-pointer transition-all"
                        >
                            {item.icon}
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
                <CreatePost open={open} setOpen={setOpen} />
            </div>

            {/* Search Dialog */}
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
                                        <AvatarFallback>
                                            {u.username[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{u.username}</span>
                                </div>
                            ))
                        ) : (
                            query && (
                                <span className="text-sm text-gray-400">No users found</span>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LeftSidebar;
