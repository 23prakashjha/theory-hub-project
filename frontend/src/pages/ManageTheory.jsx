import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaBookOpen } from "react-icons/fa";

const API_BASE_URL = "https://theory-hub-project.onrender.com";

const ManageTheory = () => {
  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTheory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/theory`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API ${res.status}: ${text}`);
        }

        const data = await res.json();
        console.log("Theory API Response:", data);

        /**
         * HANDLE ALL POSSIBLE BACKEND RESPONSES
         */
        if (Array.isArray(data)) {
          setTheories(data);
        } else if (Array.isArray(data.theory)) {
          setTheories(data.theory);
        } else if (Array.isArray(data.data)) {
          setTheories(data.data);
        } else {
          setTheories([]); // fallback
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load theory data (Bad API request)");
      } finally {
        setLoading(false);
      }
    };

    fetchTheory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this theory?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/theory/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Delete API failed");
      }

      setTheories((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed. Backend rejected request.");
    }
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

      {error && (
        <p className="text-red-500 text-center mb-6">{error}</p>
      )}

      {/* Theory Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {theories.length === 0 && !error && (
          <p className="col-span-full text-center text-gray-400">
            No theory found.
          </p>
        )}

        {Array.isArray(theories) &&
          theories.map((theory) => (
            <div
              key={theory._id}
              className="group bg-linear-to-tr from-slate-800 to-slate-900 rounded-3xl p-6 shadow-xl hover:shadow-purple-500/40 transition transform hover:-translate-y-1"
            >
              <FaBookOpen className="text-4xl text-purple-400 mb-4" />

              <h2 className="text-xl font-bold mb-1">
                {theory.title || "Untitled"}
              </h2>

              <p className="text-gray-400 mb-6">
                Language:{" "}
                <span className="text-white">
                  {theory.language || "N/A"}
                </span>
              </p>

              <div className="flex gap-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-xl">
                  <FaEdit className="inline mr-2" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(theory._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-xl"
                >
                  <FaTrash className="inline mr-2" /> Delete
                </button>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
};

export default ManageTheory;
