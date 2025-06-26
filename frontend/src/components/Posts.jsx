import { useSelector } from "react-redux";
import Post from "./Post";

const Posts = () => {
  const { posts } = useSelector((state) => state.post);
  const { user } = useSelector((state) => state.auth);

  // Filter to include only user's own and following's posts
  const visiblePosts = posts
    .filter(
      (post) =>
        user._id === post.author._id ||
        user.following.includes(post.author._id)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

  return (
    <div className="space-y-6">
      {visiblePosts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
