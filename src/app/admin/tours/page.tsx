import React from "react";
import Sidebar from "@/Components/Sidebar";

const ToursPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">

        <div className="mt-8">
          <h2 className="text-2xl font-bold">Tours</h2>
        </div>
      </div>
    </div>
  );
};

export default ToursPage;
