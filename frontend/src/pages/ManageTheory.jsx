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
        const res = await fetch(`${API_BASE_URL}/api/theory/all`);

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();
        setTheories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load theory data");
      } finally {
        setLoading(false);
      }
    };

    fetchTheory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this theory?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/theory/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setTheories((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
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
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black text-white p-6">
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-500">
          Manage Theory
        </h1>
        <p className="text-gray-400 mt-2">
          View, edit, or delete all theory topics
        </p>
      </header>

      {error && (
        <p className="text-red-500 text-center mb-6">{error}</p>
      )}

      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {theories.length === 0 && !error && (
          <p className="col-span-full text-center text-gray-400">
            No theory available
          </p>
        )}

        {theories.map((theory) => (
          <div
            key={theory._id}
            className="bg-linear-to-tr from-slate-800 to-slate-900 rounded-3xl p-6 shadow-xl hover:shadow-purple-500/30 transition"
          >
            <FaBookOpen className="text-4xl text-purple-400 mb-4" />

            <h2 className="text-xl font-bold mb-1">
              {theory.title}
            </h2>

            <p className="text-gray-400 mb-4">
              Language:{" "}
              <span className="text-white">
                {theory.language?.name || "N/A"}
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

