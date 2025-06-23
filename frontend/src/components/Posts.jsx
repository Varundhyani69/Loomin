import { useSelector } from "react-redux";
import Post from "./Post.jsx";
import React from "react";

const Posts = () => {
  const postState = useSelector((store) => store.post);
  const posts = Array.isArray(postState?.posts) ? postState.posts : [];

  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      {(!sortedPosts || sortedPosts.length === 0) ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginLeft: "85px",
            alignItems: "center",
            height: "100vh",
            width: "100%",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
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
