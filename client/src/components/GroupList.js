import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import baseURL from "../api/baseURL";

function GroupList({ setSelectedGroup }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = Cookies.get("authToken");
        const response = await baseURL.get("/api/groups", {
          withCredentials: true,
        });
        setGroups(response.data);
      } catch (error) {
        console.error(
          "Error fetching groups:",
          error.response ? error.response.data : error.message
        );
        alert("Failed to fetch groups. Please check your authentication.");
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setSelectedGroupId(group.id);
  };

  return (
    <aside className="bg-gray-100 p-4 h-full">
      <h2 className="text-lg font-bold mb-4">Public Groups</h2>
      <ul className="space-y-2">
        {groups.map((group) => (
          <li
            key={group.id}
            className={`cursor-pointer p-2 rounded transition duration-200 ${
              selectedGroupId === group.id
                ? "bg-[rgb(37,99,235)] text-white"
                : "bg-white hover:bg-gray-200 text-black"
            }`}
            onClick={() => handleGroupClick(group)}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default GroupList;
