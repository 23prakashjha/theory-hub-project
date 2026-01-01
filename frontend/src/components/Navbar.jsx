import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaCode, FaSignOutAlt, FaUserShield } from "react-icons/fa";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location]);

  const logoutHandler = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-400 font-semibold"
      : "text-gray-300 font-semibold hover:text-white transition";

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <FaCode className="text-blue-500 text-2xl" />
          <span className="text-xl font-extrabold text-white">CodeTheory</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>

          {user && (
            <NavLink to="/admin" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <FaUserShield /> Admin Dashboard
              </span>
            </NavLink>
          )}

          <a
            href="https://quiz-project-blush-two.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-gray-300 font-semibold hover:text-white transition"
          >
            Quiz Practice
          </a>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-white font-semibold">Hi, {user.name}</span>
              <button
                onClick={logoutHandler}
                className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-2xl"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-8 py-6 flex flex-col space-y-4">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold"
                : "text-gray-300 hover:text-white transition"
            }
          >
            About
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-white transition"
              >
                Admin Dashboard
              </NavLink>
              <span className="text-white font-semibold">Hi, {user.name}</span>
              <button
                onClick={logoutHandler}
                className="text-red-400 font-semibold text-left"
              >
                Logout
              </button>
            </>
          )}

          {!user && (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block text-center py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold transition"
            >
              Login
            </Link>
          )}

          <a
            href="https://quiz-project-blush-two.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-gray-300 font-semibold hover:text-white transition"
          >
            Quiz Practice
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
