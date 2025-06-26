import { useSelector } from "react-redux";
import Post from "./Post";

const Posts = () => {
  const { posts, user } = useSelector((state) => state.post);

  if (!user || !Array.isArray(posts)) {
    return <div className="text-center text-gray-500">No posts available</div>;
  }

  const visiblePosts = posts
    .filter(
      (post) =>
        post?.author?._id &&
        (user._id === post.author._id ||
          user.following?.includes(post.author._id))
    )
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

  return (
    <div className="space-y-6">
      {visiblePosts.length > 0 ? (
        visiblePosts.map((post) => (
          <Post key={post._id} post={post} />
        ))
      ) : (
        <div className="text-center text-gray-500">No posts to display</div>
      )}
    </div>
  );
};

export default Posts;