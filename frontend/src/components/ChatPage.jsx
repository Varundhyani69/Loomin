import { setSelectedUser } from '@/redux/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import { toast } from 'sonner';
import axios from 'axios';
import { appendMessage, setHasNewMessage } from '@/redux/chatSlice';
import SocketContext from '@/context/SocketContext';

const ChatPage = () => {
    const { user, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers } = useSelector(store => store.chat);
    const dispatch = useDispatch();
    const [textMessage, setTextMessage] = useState("");
    const [followings, setFollowings] = useState([]);
    const socket = useContext(SocketContext);
    const [newMessageFrom, setNewMessageFrom] = useState([]);

    useEffect(() => {
        const fetchFollowings = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/followings`, {
                    withCredentials: true,
                });
                const users = res.data.users || res.data.followings || [];
                setFollowings(Array.isArray(users) ? users : []);
            } catch (err) {
                toast.error(err?.response?.data?.message || "Failed to fetch followings");
                setFollowings([]);
            }
        };
        fetchFollowings();
    }, [user]);

    useEffect(() => {
        return () => dispatch(setSelectedUser(null));
    }, [dispatch]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleIncomingMessage = (newMessage) => {
            dispatch(setHasNewMessage(true));
            dispatch(appendMessage(newMessage));

            if (
                newMessage?.senderId &&
                (!selectedUser || newMessage.senderId !== selectedUser._id)
            ) {
                setNewMessageFrom(prev =>
                    prev.includes(newMessage.senderId) ? prev : [...prev, newMessage.senderId]
                );
            }
        };

        socket.on("newMessage", handleIncomingMessage);
        return () => socket.off("newMessage", handleIncomingMessage);
    }, [socket, dispatch, selectedUser]);

    const sendMessageHandler = async (receiverId) => {
        if (!receiverId || !textMessage.trim()) return;
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/message/send/${receiverId}`,
                { message: textMessage },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            if (res.data.success) {
                dispatch(appendMessage(res.data.newMessage));
                socket?.emit("newMessage", res.data.newMessage);
                setTextMessage("");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error sending message");
        }
    };

    const selectUserHandler = (userObj) => {
        if (!userObj?._id) return;
        dispatch(setSelectedUser(userObj));
        setNewMessageFrom(prev => prev.filter(id => id !== userObj._id));
    };

    if (!user) {
        return <div className="text-center text-gray-500">Please log in to view messages</div>;
    }

    return (
        <div className='flex h-screen'>
            <section className="w-full md:w-1/4 h-screen overflow-y-auto bg-[#1e1e1e] text-white border-r border-gray-700 px-3 py-6">
                <h1 className='font-bold mb-3 p-3 text-xl'>{user.username || 'User'}</h1>
                <hr className='mb-4 border-gray-300' />
                <div className='overflow-y-auto h-[80vh]'>
                    {Array.isArray(followings) && followings.length > 0 ? (
                        followings.map(followedUser => {
                            if (!followedUser?._id) return null;
                            const isOnline = onlineUsers.includes(followedUser._id);
                            const hasUnread = newMessageFrom.includes(followedUser._id);

                            return (
                                <div
                                    key={followedUser._id}
                                    onClick={() => selectUserHandler(followedUser)}
                                    className='flex gap-3 items-center p-3 hover:bg-[#414141] cursor-pointer relative'
                                >
                                    <Avatar>
                                        <AvatarImage className='h-12 w-12 rounded-full' src={followedUser.profilePicture} />
                                        <AvatarFallback>{followedUser.username?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col items-start'>
                                        <span className='font-medium'>{followedUser.username || 'Unknown'}</span>
                                        <div className='text-xs font-bold flex gap-2'>
                                            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                                                {isOnline ? 'Online' : 'Offline'}
                                            </span>
                                            {hasUnread && <span className='text-red-500'>New Message</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 mt-10">You're not following anyone yet.</p>
                    )}
                </div>
            </section>
            {selectedUser ? (
                <section className="flex-1 flex flex-col h-screen bg-[#121212] text-white">
                    <Messages selectedUser={selectedUser} />
                    <div className='flex items-center p-4 border-t border-gray-300'>
                        <Input
                            value={textMessage}
                            onChange={(e) => setTextMessage(e.target.value)}
                            type="text"
                            className="flex-1 mr-2 focus-visible:ring-transparent"
                            placeholder="Messages"
                        />
                        <Button className='cursor-pointer' onClick={() => sendMessageHandler(selectedUser._id)}>Send</Button>
                    </div>
                </section>
            ) : (
                <div className='flex flex-col items-center justify-center mx-auto'>
                    <MessageCircleCode className='w-32 h-32 my-4' />
                    <h1 className='font-medium text-xl'>Your Messages</h1>
                    <span>Send a message to start</span>
                </div>
            )}
        </div>
    );
};

export default ChatPage;