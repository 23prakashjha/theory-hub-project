import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaCode, FaBookOpen } from "react-icons/fa";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  // useLocation() subscribes Navbar to every route change, so this re-renders
  // and any freshly stored state is picked up instantly.
  useLocation();

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-400 font-semibold"
      : "text-gray-300 font-semibold hover:text-white transition";

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center relative">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <FaCode className="text-blue-500 text-2xl" />
          <span className="text-xl font-extrabold text-white">CodeTheory</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>

          <NavLink to="/library" className={navLinkClass}>
            <span className="flex items-center gap-1">
              <FaBookOpen /> My Library
            </span>
          </NavLink>

          <a
            href="https://quiz-project-blush-two.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-gray-300 font-semibold hover:text-white transition"
          >
            Quiz Practice
          </a>
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
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-8 py-6 flex flex-col items-center text-center space-y-4">
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

          <NavLink
            to="/library"
            onClick={() => setOpen(false)}
            className="text-gray-300 hover:text-white transition"
          >
            My Library
          </NavLink>

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
