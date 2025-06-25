import { Outlet } from "react-router-dom";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import useGetAllPosts from "../hooks/useGetAllPosts.js";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import { useSelector } from "react-redux";

const Home = () => {
  const { user } = useSelector((store) => store.auth);

  useGetSuggestedUsers();
  if (user) useGetAllPosts();

  return (
    <div className="flex flex-col md:flex-row bg-[#121212] min-h-screen">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <div className="hidden xl:block">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
