import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  //Dashboard ekata enakota token eka naththam login form ekata redirect karnava .
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex">
      <div className="w-64 h-screen fixed">
        <MenuBar />
      </div>

      <div className="ml-64 flex-1 overflow-y-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
