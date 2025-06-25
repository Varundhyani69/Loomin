import { Outlet } from "react-router-dom"
import LeftSidebar from "./LeftSidebar"

const MainLayout = () => {
  return (
    <div className="flex bg-[#121212] text-white min-h-screen">
      <LeftSidebar />
      <div className="flex-1 md:ml-72">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout;