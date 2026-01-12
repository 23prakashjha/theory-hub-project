import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaBookOpen, FaCode } from "react-icons/fa";

// ✅ API BASE URL
const API_BASE_URL = "https://theory-hub-project.onrender.com";

const LanguageDetails = () => {
  const { id } = useParams();

  const [language, setLanguage] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || id.length !== 24) {
      setError("Invalid language ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [langRes, theoryRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/languages/${id}`,
            { withCredentials: true }
          ),
          axios.get(
            `${API_BASE_URL}/api/theory`,
            {
              params: { languageId: id },
              withCredentials: true,
            }
          ),
        ]);

        setLanguage(langRes.data);
        setTopics(Array.isArray(theoryRes.data) ? theoryRes.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load language details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400 text-lg animate-pulse">
        Loading content...
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400 text-lg">
        {error}
      </div>
    );
  }

  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Language not found
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white">

      {/* 🔥 Hero */}
      <section className="py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {language.name}
        </h1>
        <p className="max-w-3xl mx-auto text-gray-300 mt-4 text-lg">
          {language.description}
        </p>
      </section>

      {/* 📚 Theory */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {topics.length === 0 ? (
          <p className="text-center text-gray-400">
            No theory available for this language.
          </p>
        ) : (
          <div className="space-y-10">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-blue-500/20 transition"
              >
                {/* Title */}
                <div className="flex items-center gap-3 mb-4">
                  <FaBookOpen className="text-blue-400 text-xl" />
                  <h2 className="text-2xl font-bold">
                    {topic.title}
                  </h2>
                </div>

                {/* Content */}
                <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-6">
                  {topic.content}
                </p>

                {/* Code Example */}
                {topic.codeExample && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                      <FaCode />
                      Code Example
                    </div>
                    <pre className="bg-black rounded-xl p-4 overflow-x-auto text-sm text-green-400">
                      <code>{topic.codeExample}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LanguageDetails;

