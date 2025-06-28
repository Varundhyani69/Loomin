import { Outlet } from "react-router-dom";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import useGetAllPosts from "../hooks/useGetAllPosts.js";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import { useSelector } from "react-redux";

const Home = () => {
  const { user } = useSelector((store) => store.auth);

  useGetSuggestedUsers();
  useGetAllPosts();

  return (
    <div className="flex flex-col md:flex-row bg-[#121212] min-h-screen">
      <div className="flex-1">
        <Feed />
        <Outlet />
      </div>
      <div className="hidden xl:block w-[300px] pr-6">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
