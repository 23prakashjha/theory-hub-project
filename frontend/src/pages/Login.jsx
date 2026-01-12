import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://theory-hub-project.onrender.com";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      // Save user and token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect based on role
      const role = res.data.user.role.toLowerCase();
      if (role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response) {
        // Backend responded with status code
        setError(err.response.data?.message || "Login failed");
      } else {
        // Network or other error
        setError("Unable to reach server. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-6">Login to CodeTheory 🔐</p>

        {error && <p className="text-red-400 text-center mb-4 font-semibold">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-white hover:scale-105 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

