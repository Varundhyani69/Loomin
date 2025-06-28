// components/ChatPage.jsx
import { setSelectedUser } from '@/redux/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import { toast } from 'sonner';
import axios from 'axios';
import {
    appendMessage,
    setHasNewMessage,
    addNewMessageSender,
    clearNewMessageSender
} from '@/redux/chatSlice';
import SocketContext from '@/context/SocketContext';

const ChatPage = () => {
    const { user, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, newMessageFrom } = useSelector(store => store.chat);
    const dispatch = useDispatch();
    const [textMessage, setTextMessage] = useState("");
    const [followings, setFollowings] = useState([]);
    const socket = useContext(SocketContext);

    useEffect(() => {
        const fetchFollowings = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/followings`, {
                    withCredentials: true,
                });
                setFollowings(res.data.followings || []);
            } catch (err) {
                toast.error("Failed to fetch followings");
            }
        };
        fetchFollowings();
    }, []);

    useEffect(() => {
        return () => dispatch(setSelectedUser(null));
    }, [dispatch]);

    useEffect(() => {
        if (!socket) return;

        const handleIncomingMessage = (newMessage) => {
            dispatch(setHasNewMessage(true));
            dispatch(appendMessage(newMessage));
            if (!selectedUser || newMessage.senderId !== selectedUser._id) {
                dispatch(addNewMessageSender(newMessage.senderId));
            }
        };

        socket.on("newMessage", handleIncomingMessage);

        return () => {
            socket.off("newMessage", handleIncomingMessage);
        };
    }, [socket, dispatch, selectedUser]);

    const sendMessageHandler = async (receiverId) => {
        if (!textMessage.trim()) return toast.error("Message cannot be empty");
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/message/send/${receiverId}`,
                { message: textMessage },
                { withCredentials: true }
            );
            if (res.data.success) {
                dispatch(appendMessage(res.data.newMessage));
                socket?.emit("newMessage", res.data.newMessage);
                setTextMessage("");
            } else {
                toast.error(res.data.message || "Message sending failed");
            }
        } catch (error) {
            toast.error("Error sending message");
        }
    };

    const selectUserHandler = (userObj) => {
        dispatch(setSelectedUser(userObj));
        dispatch(clearNewMessageSender(userObj._id));
    };

    return (
        <div className='flex h-screen'>
            {/* Sidebar */}
            <section className="w-full md:w-1/4 h-screen overflow-y-auto bg-[#1e1e1e] text-white border-r border-gray-700 px-3 py-6">
                <h1 className='font-bold mb-3 p-3 text-xl'>{user?.username}</h1>
                <hr className='mb-4 border-gray-300' />
                <div className='overflow-y-auto h-[80vh]'>
                    {followings.length > 0 ? (
                        followings.map(followedUser => {
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
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col items-start'>
                                        <span className='font-medium'>{followedUser.username}</span>
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

            {/* Chat Area */}
            {selectedUser ? (
                <section className="flex-1 flex flex-col h-screen bg-[#121212] text-white">
                    <div className='flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 z-10'>
                        <Avatar>
                            <AvatarImage className='h-12 w-12 rounded-full' src={selectedUser.profilePicture} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span>{selectedUser.username}</span>
                        </div>
                    </div>
                    <Messages selectedUser={selectedUser} />
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
