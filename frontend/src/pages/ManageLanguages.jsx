import React, { useEffect, useState } from "react";
import { FaCode, FaEdit, FaTrash } from "react-icons/fa";

const API_BASE_URL = "https://theory-hub-project.onrender.com";

const ManageLanguages = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/languages`)
      .then((res) => res.json())
      .then((data) => {
        setLanguages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this language?")) return;

    await fetch(`${API_BASE_URL}/api/languages/${id}`, {
      method: "DELETE",
    });

    setLanguages(languages.filter((l) => l._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading languages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black text-white p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-emerald-500">
            Manage Languages
          </h1>
          <p className="text-gray-400 mt-2">
            Control available programming languages
          </p>
        </div>

        <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl shadow-lg font-semibold transition">
          + Add Language
        </button>
      </header>

      {/* Languages Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {languages.map((lang) => (
          <div
            key={lang._id}
            className="group bg-linear-to-tr from-green-800 to-green-900 rounded-3xl p-6 shadow-xl hover:shadow-green-500/40 transition transform hover:-translate-y-1"
          >
            <FaCode className="text-4xl text-green-300 mb-4 group-hover:text-emerald-400 transition" />

            <h2 className="text-2xl font-bold mb-2">
              {lang.name}
            </h2>

            <p className="text-gray-300 mb-6">
              {lang.description || "No description available"}
            </p>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-xl transition">
                <FaEdit /> Edit
              </button>

              <button
                onClick={() => handleDelete(lang._id)}
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

export default ManageLanguages;
