import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import baseURL from "../api/baseURL";

const socket = io("http://localhost:5000");

function Chat({ selectedGroup, onJoinGroup, userInfo }) {
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sender, setSender] = useState("");

  useEffect(() => {
    if (userInfo) {
      setSender(`${userInfo?.firstName} ${userInfo?.lastName}`);
    }
  }, [userInfo]);

  useEffect(() => {
    const checkMembership = async () => {
      if (selectedGroup) {
        try {
          const response = await baseURL.get(
            `/api/groups/${selectedGroup.id}/members`,
            { withCredentials: true }
          );
          const isUserMember = response.data.length > 0;
          setIsJoined(isUserMember);
        } catch (error) {
          console.error(
            "Error checking membership:",
            error.response ? error.response.data : error.message
          );
        }
      }
    };

    checkMembership();
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      baseURL
        .get(`/api/groups/${selectedGroup.id}/messages`, {
          withCredentials: true,
        })
        .then((response) => setMessages(response.data))
        .catch((error) => {
          console.error(
            "Error fetching messages:",
            error.response ? error.response.data : error.message
          );
        });

      socket.emit("joinGroup", selectedGroup.id);

      const handleReceiveMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [selectedGroup]);

  const handleJoinGroup = () => {
    baseURL
      .post(
        `/api/groups/${selectedGroup.id}/join`,
        { user: sender },
        { withCredentials: true }
      )
      .then(() => {
        onJoinGroup(selectedGroup.id);
        setIsJoined(true);
      })
      .catch((error) => {
        console.error(
          "Error joining group:",
          error.response ? error.response.data : error.message
        );
      });
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const messageData = {
      content: newMessage,
      groupId: selectedGroup.id,
      sender,
    };

    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  return (
    <div className="p-6">
      {selectedGroup ? (
        <div>
          <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
          <p className="mt-4">
            This is the {selectedGroup.name} group, where you can discuss topics
            related to {selectedGroup.name}.
          </p>

          {!isJoined ? (
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleJoinGroup}
            >
              Join Group
            </button>
          ) : (
            <div>
              <p className="mt-4 text-green-600">You have joined this group!</p>
              <div className="mt-4">
                <div className="chat-window border p-4 h-64 overflow-y-auto bg-gray-100">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div key={index}>
                        <strong>{msg.sender}:</strong> {msg.content}
                      </div>
                    ))
                  ) : (
                    <p>No messages yet. Start the conversation!</p>
                  )}
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Type a message"
                  />
                  <button
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={sendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Select a group to see details.</p>
      )}
    </div>
  );
}

export default Chat;
