import React from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaBook, FaCode } from "react-icons/fa";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white px-4 py-10">

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-16 text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          Central control panel to manage languages, theory topics,
          and educational content efficiently.
        </p>
      </header>

      {/* Cards */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

        {/* Add Theory */}
        <DashboardCard
          to="/admin/add-theory"
          icon={<FaPlus />}
          title="Add Theory"
          description="Create new theory topics with explanations and code samples."
          gradient="from-blue-600/20 to-blue-900/40"
          hover="hover:shadow-blue-500/40"
          iconColor="text-blue-400"
        />

        {/* Manage Theory */}
        <DashboardCard
          to="/admin/manage-theory"
          icon={<FaBook />}
          title="Manage Topics"
          description="Edit, update, or delete existing theory content."
          gradient="from-purple-600/20 to-purple-900/40"
          hover="hover:shadow-purple-500/40"
          iconColor="text-purple-400"
        />

        {/* Manage Languages */}
        <DashboardCard
          to="/admin/manage-languages"
          icon={<FaCode />}
          title="Manage Languages"
          description="Add, update, or remove programming languages."
          gradient="from-green-600/20 to-green-900/40"
          hover="hover:shadow-green-500/40"
          iconColor="text-green-400"
        />

      </section>
    </div>
  );
};

export default AdminDashboard;

/* ---------- Reusable Card Component ---------- */

const DashboardCard = ({
  to,
  icon,
  title,
  description,
  gradient,
  hover,
  iconColor,
}) => {
  return (
    <Link
      to={to}
      className={`group relative rounded-3xl p-8 backdrop-blur-xl border border-white/10 
      bg-gradient-to-br ${gradient} shadow-xl ${hover}
      transition-all duration-300 hover:-translate-y-2`}
    >
      {/* Icon */}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6
        bg-black/40 ${iconColor} group-hover:scale-110 transition`}
      >
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-3 group-hover:text-white transition">
        {title}
      </h2>

      {/* Description */}
      <p className="text-gray-400 group-hover:text-gray-300 transition leading-relaxed">
        {description}
      </p>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
    </Link>
  );
};
