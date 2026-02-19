import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaBookOpen, FaCode, FaLayerGroup } from "react-icons/fa";

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
          axios.get(`${API_BASE_URL}/api/languages/${id}`),
          axios.get(`${API_BASE_URL}/api/theory`, {
            params: { languageId: id },
          }),
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-14 h-14 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg animate-pulse">
          Loading amazing content...
        </p>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-3">Oops!</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 text-lg">
        Language not found
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-800">

      {/* 🔷 Hero Section */}
      <section className="relative py-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language.name}
          </h1>

          <p className="mt-6 text-gray-600 text-lg md:text-xl leading-relaxed">
            {language.description}
          </p>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 bg-white shadow-md px-5 py-2 rounded-full text-sm font-medium text-gray-600">
              <FaLayerGroup className="text-blue-500" />
              {topics.length} Topics Available
            </div>
          </div>
        </div>
      </section>

      {/* 📘 Theory Section */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        {topics.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No theory available for this language yet.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                {/* Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <FaBookOpen className="text-blue-600 text-lg" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {topic.title}
                  </h2>
                </div>

                {/* Content */}
                <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6 text-sm leading-relaxed">
                  {topic.content
                    ?.split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                </ul>

                {/* Code Example */}
                {topic.codeExample && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                      <FaCode className="text-purple-500" />
                      Code Example
                    </div>

                    <pre className="bg-gray-900 text-green-400 rounded-2xl p-4 overflow-x-auto text-sm shadow-inner">
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



