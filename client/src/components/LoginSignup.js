import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import baseURL from "../api/baseURL";

function LoginSignup() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [emailToVerify, setEmailToVerify] = useState("");

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = Cookies.get("authToken");
      if (token) {
        try {
          const response = await baseURL.get(
            "/api/validate-token",
            { withCredentials: true }
          );

          if (response.status === 200) {
            navigate("/home");
          }
        } catch (error) {
          console.error("Invalid token:", error);
        }
      }
    };

    checkAuthToken();
  }, [navigate]);

  const handleSubmit = async () => {
    if (isLogin) {
      const { email, password } = formData;
      try {
        const response = await baseURL.post(
          "/api/login",
          { email, password },
          { withCredentials: true }
        );

        Cookies.set("authToken", response.data.token, { expires: 1 });

        navigate("/home");
      } catch (error) {
        alert("Login failed. Please check your credentials.");
      }
    } else {
      const { firstName, lastName, email, password } = formData;
      if (password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      try {
        await baseURL.post("/api/signup", {
          firstName,
          lastName,
          email,
          password,
        });

        setModalOpen(true);
        setEmailToVerify(email);
      } catch (error) {
        alert("Signup failed. Please try again.");
      }
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await baseURL.post("/api/confirm", {
        email: emailToVerify,
        code: confirmationCode,
      });

      Cookies.set("authToken", response.data.token, { expires: 1 });

      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Invalid confirmation code or the code has expired.");
    }
  };

  return (
    <div>
      <nav className="bg-blue-600 text-white p-4 text-2xl font-bold">
        BuzzChat
      </nav>

      <div className="flex justify-center items-center h-screen">
        <div className="w-1/3 p-6 bg-white shadow rounded">
          <h2 className="text-2xl font-bold mb-4">
            {isLogin ? "Login" : "Signup"}
          </h2>

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-2 mb-2 border"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-2 mb-2 border"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-2 border"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-2 border"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 mb-2 border"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          )}

          <button
            className="w-full bg-blue-600 text-white p-2 mt-4 rounded"
            onClick={handleSubmit}
          >
            {isLogin ? "Login" : "Signup"}
          </button>

          <p className="text-center mt-4">
            {isLogin ? "New here?" : "Already have an account?"}
            <button
              className="text-blue-600 underline ml-1"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>

        {modalOpen && (
          <div className="modal fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="modal-content bg-white p-6 rounded shadow">
              <p>Confirmation code sent to your email. Enter the code:</p>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full p-2 border mb-4"
              />
              <button
                className="bg-blue-600 text-white p-2 rounded"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginSignup;
