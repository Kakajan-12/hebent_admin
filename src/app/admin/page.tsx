"use client";
import Sidebar from "@/Components/Sidebar";

const AdminPanel = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-10 ml-72 h-screen"></div>
    </div>
  );
};

export default AdminPanel;
