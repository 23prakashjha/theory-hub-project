import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaBookOpen } from "react-icons/fa";

const API_BASE_URL = "https://theory-hub-project.onrender.com";

const ManageTheory = () => {
  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/theory`)
      .then((res) => res.json())
      .then((data) => {
        setTheories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this theory?")) return;

    await fetch(`${API_BASE_URL}/api/theory/${id}`, {
      method: "DELETE",
    });

    setTheories(theories.filter((t) => t._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading theory content...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black text-white p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-500">
          Manage Theory
        </h1>
        <p className="text-gray-400 mt-2">
          Edit or remove theory topics from the platform
        </p>
      </header>

      {/* Theory Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {theories.map((theory) => (
          <div
            key={theory._id}
            className="group bg-linear-to-tr from-slate-800 to-slate-900 rounded-3xl p-6 shadow-xl hover:shadow-purple-500/40 transition transform hover:-translate-y-1"
          >
            <FaBookOpen className="text-4xl text-purple-400 mb-4 group-hover:text-pink-400 transition" />

            <h2 className="text-xl font-bold mb-1 group-hover:text-pink-400 transition">
              {theory.title}
            </h2>

            <p className="text-gray-400 mb-6">
              Language: <span className="text-white">{theory.language}</span>
            </p>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-xl transition">
                <FaEdit /> Edit
              </button>

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
