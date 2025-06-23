import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { setAuthUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import { logoutUser } from '@/redux/authSlice';

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(user?.profilePicture);

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

    const selectChangeHandler = (value) => {
        setInput({ ...input, gender: value });
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
            const res = await axios.post('http://localhost:8080/api/v1/user/profile/edit', formData, {
                headers: {
                    'Content-type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    bio: res.data.user?.bio,
                    profilePicture: res.data.user?.profilePicture,
                    gender: res.data.user?.gender
                };
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user._id}`);
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDeleteAccount = async () => {
        try {
            await axios.delete('http://localhost:8080/api/v1/user/delete', { withCredentials: true });
            dispatch(logoutUser());
            navigate('/signup');
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete account");
        }
    };


    return (
        <div className='ml-130 flex max-2xl mx-auto pl-10'>
            <section className='flex flex-col gap-6 w-150'>
                <h1 className='font-bold text-xl'>Edit Profile</h1>

                <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4 gap-5">
                    <div className="flex items-center gap-8">
                        <Avatar>
                            <AvatarImage className='h-32 w-32 rounded-full object-cover' src={previewImage} alt="User" />
                            <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-bold text-m">
                                <Link to={`/profile/${user._id}`}>{user?.username}</Link>
                            </h1>
                            <span className="text-gray-600">
                                {input.bio || "Bio Here..."}
                            </span>
                        </div>
                    </div>

                    <input ref={imageRef} type="file" onChange={fileChangeHandler} className='hidden' />
                    <Button onClick={() => imageRef.current.click()} className="bg-[#0095F6] h-8 hover:bg-[#0094f6a0]">
                        Change Photo
                    </Button>
                </div>

                <div>
                    <h1 className='font-bold text-xl mb-2'>Bio</h1>
                    <Textarea value={input.bio} onChange={(e) => setInput({ ...input, bio: e.target.value })} />
                </div>

                <div>
                    <h1 className='font-bold text-xl mb-2'>Gender</h1>
                    <select
                        name="gender"
                        value={input.gender}
                        onChange={(e) => selectChangeHandler(e.target.value)}
                        className="w-[200px] px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0095F6] transition"
                    >
                        <option value="">Select gender</option>
                        <option value="male">👦 Male</option>
                        <option value="female">👧 Female</option>
                        <option value="other">🧑 Other</option>
                    </select>
                </div>


                <div className="gap-2">

                    <div className='flex justify-end'>
                        {loading ? (
                            <Button className='w-full bg-[#0095F6] hover:bg-[#0094f6a9]'>
                                <Loader className='mr-2 h-4 w-4 animate-spin' />Please wait
                            </Button>
                        ) : (
                            <Button onClick={editProfileHandler} className='w-full bg-[#0095F6] hover:bg-[#0094f6a9]'>
                                Submit
                            </Button>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button
                            className=" mt-2 bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => setShowConfirm(true)}
                        >
                            Delete Account
                        </Button>

                    </div>
                </div>
            </section>
            {/* Confirm Delete Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-4 text-center">Delete Account?</h2>
                        <p className="text-sm text-gray-600 mb-6 text-center">
                            This action cannot be undone. Are you sure you want to delete your account?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                                onClick={handleDeleteAccount}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EditProfile;
