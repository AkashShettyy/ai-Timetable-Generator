import React, { useState } from "react";
import { verifyOTP } from "../api/authService";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const pending = JSON.parse(localStorage.getItem("pendingUser") || "null");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!pending) return alert("No signup data found. Please sign up first.");

    setLoading(true);
    try {
      // Send OTP for verification
      const response = await verifyOTP({ email: pending.email, otp });

      // Save user data locally for future login
      localStorage.setItem("user", JSON.stringify(pending));
      localStorage.removeItem("pendingUser");

      // Show backend message
      const message = response.data.message || "OTP verified successfully.";
      alert(message);

      // Special note for faculty
      if (pending.role === "faculty") {
        alert("Please wait for admin approval before you can login.");
      }

      // Navigate to login
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter the OTP sent to <span className="font-medium">{pending?.email || "your email"}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
