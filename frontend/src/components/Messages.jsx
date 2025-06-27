import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import useGetAllMessage from '@/hooks/useGetAllMessage';
import SocketContext from '@/context/SocketContext';
import { appendMessage, setHasNewMessage } from '@/redux/chatSlice';
import axios from 'axios';
import { setSelectedPost } from '@/redux/postSlice';
import CommentDialog from './CommentDialog';

const Messages = ({ selectedUser }) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "https://loomin-backend-production.up.railway.app";
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);
    const { messages } = useSelector((state) => state.chat);
    const currentUserId = useSelector((state) => state.auth.user?._id);
    const messagesEndRef = useRef(null);

    const [selectedPostData, setSelectedPostData] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);

    useGetAllMessage(selectedUser?._id);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (selectedUser?._id) {
            dispatch(setHasNewMessage(false));
        }
    }, [selectedUser?._id, dispatch]);

    useEffect(() => {
        if (!socket || !selectedUser?._id) return;

        const handleNewMessage = async (newMsg) => {
            const isChatOpen =
                newMsg?.senderId === selectedUser._id ||
                newMsg?.receiverId === selectedUser._id;

            if (newMsg?.postId && typeof newMsg.postId === 'string') {
                try {
                    const res = await axios.get(`${API_BASE_URL}/post/${newMsg.postId}`, {
                        withCredentials: true,
                    });
                    if (res.data.success) {
                        newMsg.postId = res.data.post;
                    }
                } catch (err) {
                    console.error('📩 Error fetching shared post:', err);
                }
            }

            if (isChatOpen) {
                dispatch(appendMessage(newMsg));
            } else {
                dispatch(setHasNewMessage(true));
            }
        };

        socket.on('newMessage', handleNewMessage);
        return () => socket.off('newMessage', handleNewMessage);
    }, [socket, selectedUser?._id, dispatch]);

    const handlePostClick = (post) => {
        dispatch(setSelectedPost(post));
        setSelectedPostData(post);
        setDialogOpen(true);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/message/send/${selectedUser._id}`, {
                message: newMessage.trim(),
            }, {
                withCredentials: true,
            });

            if (res.data.success) {
                setNewMessage("");
                // Message will be added via socket, but just in case:
                dispatch(appendMessage(res.data.newMessage));
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setSending(false);
        }
    };

    const safeMessages = Array.isArray(messages) ? messages : [];

    return (
        <div className="flex flex-col h-full">
            <div className="overflow-y-auto flex-1 p-4">
                <div className="flex justify-center mb-4">
                    <div className="flex flex-col items-center justify-center">
                        <Avatar>
                            <AvatarImage className="h-24 w-24 object-cover rounded-full" src={selectedUser?.profilePicture} />
                            <AvatarFallback>{selectedUser?.username?.[0]}</AvatarFallback>
                        </Avatar>
                        <span>{selectedUser?.username}</span>
                        <Link to={`/profile/${selectedUser?._id}`}>
                            <Button className="h-8 my-2" variant="secondary">
                                View Profile
                            </Button>
                        </Link>
                    </div>
                </div>

                {safeMessages.length === 0 ? (
                    <div className="text-center text-gray-500">No messages to display</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {safeMessages.map((msg, i) => {
                            if (!msg || typeof msg !== 'object') return null;
                            const isMe = msg.senderId === currentUserId;
                            const post = msg.postId;

                            return (
                                <div key={`${msg._id}-${i}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${isMe ? 'bg-[#2a2a2a]' : 'bg-[#3a3a3a]'}`}>
                                        {msg.message && <div>{msg.message}</div>}
                                        {post?.image && (
                                            <div className="mt-2 w-60 h-60 cursor-pointer" onClick={() => handlePostClick(post)}>
                                                <img src={post.image} alt="Shared Post" className="w-full h-full object-cover rounded-md" />
                                                <p className="text-xs italic text-white/80 mt-1">{post.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Send Message Input */}
            <div className="p-3 border-t border-gray-700 flex gap-2 items-center">
                <input
                    className="flex-1 bg-[#1f1f1f] text-white px-4 py-2 rounded-xl border border-gray-600 outline-none"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                    }}
                />
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSendMessage}
                    disabled={sending}
                >
                    Send
                </Button>
            </div>

            <CommentDialog open={dialogOpen} setOpen={setDialogOpen} post={selectedPostData} />
        </div>
    );
};

export default Messages;
