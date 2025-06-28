import React from "react";
import { useSelector } from "react-redux";
import Post from "./Post.jsx";

const Posts = () => {
  const { posts } = useSelector((store) => store.post);

  const sortedPosts = Array.isArray(posts)
    ? [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return (
    <div className="w-full space-y-6 px-4 sm:px-6 md:px-8">
      {sortedPosts.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh] text-white font-semibold text-lg">
          No posts yet
        </div>
      ) : (
        sortedPosts.map((post) => <Post key={post._id} post={post} />)
      )}
    </div>
  );
};

export default Posts;
