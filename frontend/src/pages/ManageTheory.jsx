import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaBookOpen } from "react-icons/fa";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://theory-hub-project.onrender.com";

const ManageTheory = () => {
  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all theory from backend
  useEffect(() => {
    const fetchTheory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/theory`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setTheories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load theory data. Please check backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchTheory();
  }, []);

  // Delete a theory
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this theory?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/theory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setTheories((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed. Check backend route.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading theory...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Manage Theory
        </h1>
        <p className="text-gray-400 text-lg md:text-xl">
          View, edit, or delete theory topics efficiently
        </p>
      </header>

      {error && (
        <p className="text-red-500 text-center mb-6">{error}</p>
      )}

      {/* Theory Cards */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {theories.length === 0 && !error && (
          <p className="col-span-full text-center text-gray-400">
            No theory available
          </p>
        )}

        {theories.map((theory) => (
          <div
            key={theory._id}
            className="bg-gradient-to-tr from-slate-800 to-slate-900 rounded-3xl p-6 shadow-xl hover:shadow-purple-500/50 transition transform hover:-translate-y-1 hover:scale-105"
          >
            <FaBookOpen className="text-4xl text-purple-400 mb-4" />

            <h2 className="text-xl font-bold mb-2">
              {theory.title || "Untitled"}
            </h2>

            <p className="text-gray-400 mb-4">
              Language:{" "}
              <span className="text-white">
                {theory.language?.name || "N/A"}
              </span>
            </p>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                to={`/admin/edit-theory/${theory._id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-xl transition"
              >
                <FaEdit /> Edit
              </Link>

              <button
                onClick={() => handleDelete(theory._id)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-xl transition"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ManageTheory;
