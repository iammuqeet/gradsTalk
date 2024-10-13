import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import baseURL from "../api/baseURL";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const token = Cookies.get("authToken");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await baseURL.post(
          "/api/verifyToken",
          {},
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsAuthenticated(false);
    }
  }, [token]);

  if (isAuthenticated === null) {
    return (
      <div>
        <div class="container">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
