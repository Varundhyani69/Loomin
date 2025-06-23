import { Outlet } from "react-router-dom"
import Feed from "./Feed"
import RightSidebar from "./RightSidebar"
import useGetAllPosts from "../hooks/useGetAllPosts.js"
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers"

const Home = () => {
  useGetAllPosts();
  useGetSuggestedUsers();
  return (
    <div className="flex">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  )
}

export default Home
