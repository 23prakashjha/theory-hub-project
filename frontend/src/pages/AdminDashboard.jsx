import React from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaBook, FaCode } from "react-icons/fa";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black text-white p-6">

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 text-lg md:text-xl">
          Manage programming languages, topics, and theory content efficiently
        </p>
      </header>

      {/* Dashboard Cards */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Add Theory */}
        <Link
          to="/admin/add-theory"
          className="group bg-linear-to-tr from-blue-800 to-blue-900 rounded-3xl p-8 shadow-xl hover:shadow-blue-500/50 transform hover:scale-105 transition duration-300"
        >
          <FaPlus className="text-5xl text-white mb-5 group-hover:text-yellow-400 transition duration-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white group-hover:text-yellow-400 transition">
            Add Theory
          </h2>
          <p className="text-gray-300 group-hover:text-white transition">
            Add new theory topics with code examples and explanations.
          </p>
        </Link>

        {/* Manage Topics */}
        <Link
          to="/admin/manage-theory"
          className="group bg-linear-to-tr from-purple-800 to-purple-900 rounded-3xl p-8 shadow-xl hover:shadow-purple-500/50 transform hover:scale-105 transition duration-300"
        >
          <FaBook className="text-5xl text-white mb-5 group-hover:text-pink-400 transition duration-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white group-hover:text-pink-400 transition">
            Manage Topics
          </h2>
          <p className="text-gray-300 group-hover:text-white transition">
            Edit or delete existing theory content to keep it updated.
          </p>
        </Link>

        {/* Manage Languages */}
        <Link
          to="/admin/manage-languages"
          className="group bg-linear-to-tr from-green-800 to-green-900 rounded-3xl p-8 shadow-xl hover:shadow-green-500/50 transform hover:scale-105 transition duration-300"
        >
          <FaCode className="text-5xl text-white mb-5 group-hover:text-green-400 transition duration-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white group-hover:text-green-400 transition">
            Manage Languages
          </h2>
          <p className="text-gray-300 group-hover:text-white transition">
            Add or update programming languages for your platform.
          </p>
        </Link>

      </section>
    </div>
  );
};

export default AdminDashboard;
