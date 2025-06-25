import { useSelector } from "react-redux";
import Post from "./Post.jsx";
import React from "react";

const Posts = () => {
  const postState = useSelector((store) => store.post);
  const posts = Array.isArray(postState?.posts) ? postState.posts : [];

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto px-4 py-8">
      {(!sortedPosts || sortedPosts.length === 0) ? (
        <div className="flex justify-center items-center h-64 text-lg font-semibold text-gray-400">
          No posts yet
        </div>
      ) : (
        sortedPosts.map((post) => (
          <Post key={post._id} post={post} />
        ))
      )}
    </div>
  );
};

export default Posts;
