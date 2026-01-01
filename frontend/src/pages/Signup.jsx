import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    // 🔹 Simulate backend signup
    setTimeout(() => {
      // Save user (TEMP — backend later)
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatar: "https://i.pravatar.cc/150?img=3"
        })
      );

      setSuccess("Account created successfully 🎉");
      setLoading(false);

      // Redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-gray-900 to-black px-4">
      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur rounded-2xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Create Account
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Join CodeTheory today 🚀
        </p>

        {success && (
          <div className="mb-4 text-green-400 text-center font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-gray-300 text-sm">Full Name</label>
            <input
              type="text"
              name="name"
              required
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-linear-to-r from-green-500 to-blue-600 font-semibold text-white hover:scale-[1.02] transition disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
