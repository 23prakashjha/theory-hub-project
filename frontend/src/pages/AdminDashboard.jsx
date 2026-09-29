import React from "react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white px-4 py-10">

      {/* Header */}
      <header className="max-w-7xl mx-auto text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          Central control panel for managing your account and documents.
        </p>
      </header>
    </div>
  );
};

export default AdminDashboard;
