import React from "react";
import GroupList from "./GroupList";
import Chat from "./Chat";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import baseURL from "../api/baseURL";

function Home() {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = React.useState(null);
  const [joinedGroups, setJoinedGroups] = React.useState([]);
  const [userInfo, setUserInfo] = React.useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleJoinGroup = (groupId) => {
    setJoinedGroups((prev) => [...prev, groupId]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await baseURL.post("/api/logout", {}, { withCredentials: true });
      // Clear user information and redirect if needed
      setUserInfo(null);
      setJoinedGroups([]);
      setSelectedGroup(null);
      // Optionally redirect the user to a login page or show a message
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error.response ? error.response.data : error.message);
    }
  };
  

  React.useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await baseURL.get("/api/user", {
          withCredentials: true,
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error(
          "Error fetching user info:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchUserInfo();
  }, []);
  

  return (
    <div className="h-screen grid grid-rows-[auto,1fr]">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none md:hidden"
        >
          {isSidebarOpen ? (
            <img
              src="/cross-icon.svg"
              alt="Close Sidebar"
              className="h-6 w-6"
            />
          ) : (
            <img
              src="/burger-icon.svg"
              alt="Open Sidebar"
              className="h-6 w-6"
            />
          )}
        </button>
        <div className="text-2xl font-bold">GradsTalk</div>
        <button className="bg-white text-blue-600 px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="md:grid md:grid-cols-[250px,1fr] h-full">
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? "block" : "hidden"
          } md:block`}
        >
          <GroupList setSelectedGroup={setSelectedGroup} />
        </div>
        <Chat
          selectedGroup={selectedGroup}
          joinedGroups={joinedGroups}
          onJoinGroup={handleJoinGroup}
          userInfo={userInfo}
        />
      </div>
    </div>
  );
}

export default Home;
