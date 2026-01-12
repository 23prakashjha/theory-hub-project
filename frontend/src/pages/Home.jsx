import React, { useEffect, useState } from "react";
import { FaSearch, FaCode } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

// ✅ API BASE URL
const API_BASE_URL = "https://theory-hub-project.onrender.com";

const Home = () => {
  const [languages, setLanguages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const gradients = [
    "from-blue-400 to-purple-500",
    "from-pink-500 to-yellow-400",
    "from-green-400 to-teal-500",
    "from-red-400 to-orange-400",
    "from-indigo-500 to-purple-600",
    "from-cyan-400 to-blue-500",
    "from-rose-400 to-fuchsia-500",
    "from-lime-400 to-green-500",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-indigo-500",
  ];

  // ---------------- FETCH LANGUAGES ----------------
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/languages`,
          { withCredentials: true }
        );

        const withGradients = (res.data || []).map((lang, index) => ({
          ...lang,
          gradient: gradients[index % gradients.length],
        }));

        setLanguages(withGradients);
      } catch (error) {
        console.error("Error fetching languages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // ---------------- SEARCH ----------------
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400 animate-pulse">
        Loading languages...
      </div>
    );
  }

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">

      {/* 🌟 Hero */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Learn Programming & Frameworks
        </h1>
        <p className="max-w-3xl mx-auto text-gray-300 mt-4 text-lg">
          Master theory, examples, and interview concepts for modern technologies.
        </p>
      </section>

      {/* 🔍 Search */}
      <div className="max-w-xl mx-auto px-4 mb-14">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search language, framework, or tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 🧠 Languages */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        {filteredLanguages.length === 0 ? (
          <p className="text-center text-gray-400">
            No languages found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredLanguages.map((lang) => (
              <div
                key={lang._id}
                className={`bg-gradient-to-br ${lang.gradient} rounded-2xl shadow-xl hover:scale-105 transition duration-300`}
              >
                <div className="p-6 text-center bg-gray-900/60 rounded-2xl h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-center mb-3 text-white/80">
                      <FaCode size={22} />
                    </div>

                    <h2 className="text-xl font-bold mb-2">
                      {lang.name}
                    </h2>

                    <p className="text-gray-200 text-sm line-clamp-3">
                      {lang.description ||
                        "Learn theory, syntax, and best practices."}
                    </p>
                  </div>

                  <Link
                    to={`/language/${lang._id}`}
                    className="mt-6 inline-block py-2 rounded-xl bg-black/70 hover:bg-black/90 text-white font-semibold transition"
                  >
                    View Theory →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

