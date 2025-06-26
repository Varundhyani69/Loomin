import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { setAuthUser, logoutUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(user?.profilePicture);
    const [showConfirm, setShowConfirm] = useState(false);

    const [input, setInput] = useState({
        profilePhoto: null,
        bio: user?.bio,
        gender: user?.gender
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, profilePhoto: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const editProfileHandler = async () => {
        const formData = new FormData();
        formData.append("bio", input.bio);
        formData.append("gender", input.gender);
        if (input.profilePhoto) {
            formData.append("profilePhoto", input.profilePhoto);
        }
        try {
            setLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/profile/edit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (res.data.success) {
                const updatedUser = {
                    ...user,
                    bio: res.data.user?.bio,
                    profilePicture: res.data.user?.profilePicture,
                    gender: res.data.user?.gender
                };
                dispatch(setAuthUser(updatedUser));
                navigate(`/profile/${user._id}`);
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/user/delete`, { withCredentials: true });
            dispatch(logoutUser());
            navigate('/signup');
            toast.success("Account deleted successfully");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete account");
        }
    };

    return (
        <div className="p-6 text-white bg-[#121212] min-h-screen">
            <section className="max-w-xl mx-auto flex flex-col gap-6">
                <h1 className="text-2xl font-bold">Edit Profile</h1>
                <div className="flex justify-between items-center p-4 bg-[#1e1e1e] rounded-xl shadow-md">
                    <div className="flex gap-4 items-center">
                        <Avatar>
                            <AvatarImage className="h-20 w-20 rounded-full object-cover" src={previewImage} />
                            <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-lg">
                                <Link to={`/profile/${user._id}`}>{user?.username}</Link>
                            </h2>
                            <p className="text-gray-400 text-sm">{input.bio || "No bio yet."}</p>
                        </div>
                    </div>
                    <div>
                        <input ref={imageRef} onChange={fileChangeHandler} type="file" className="hidden" />
                        <Button onClick={() => imageRef.current.click()} className="bg-[#0095F6] hover:bg-[#0094f6a0]">
                            Change Photo
                        </Button>
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Bio</h2>
                    <Textarea
                        value={input.bio}
                        onChange={(e) => setInput({ ...input, bio: e.target.value })}
                        className="bg-[#1e1e1e] text-white border-none focus:ring-0"
                    />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Gender</h2>
                    <select
                        value={input.gender}
                        onChange={(e) => setInput({ ...input, gender: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-sm text-white"
                    >
                        <option value="">Select gender</option>
                        <option value="male">👦 Male</option>
                        <option value="female">👧 Female</option>
                        <option value="other">🧑 Other</option>
                    </select>
                </div>
                <div className="flex flex-col gap-3">
                    {loading ? (
                        <Button disabled className="bg-[#0095F6]">
                            <Loader className="mr-2 h-4 w-4 animate-spin" /> Please wait
                        </Button>
                    ) : (
                        <Button onClick={editProfileHandler} className="bg-[#0095F6] hover:bg-[#0094f6a9]">
                            Submit
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => setShowConfirm(true)}
                    >
                        Delete Account
                    </Button>
                </div>
            </section>
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-[#1e1e1e] text-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4">
                        <h2 className="text-xl font-bold text-center">Delete Account?</h2>
                        <p className="text-sm text-gray-400 text-center">
                            This action is irreversible. Are you sure you want to delete your account?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button className='text-black' variant="outline" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteAccount}>
                                Yes, Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfile;