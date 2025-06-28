import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  return (
    <div className="flex flex-col md:flex-row bg-[#121212] text-white min-h-screen">
      <LeftSidebar />
      <div className="flex-1 md:ml-72 mt-16 md:mt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
