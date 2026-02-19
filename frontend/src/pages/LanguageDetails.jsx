import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaBookOpen, FaCode } from "react-icons/fa";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600 text-lg animate-pulse">
        Loading content...
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500 text-lg">
        {error}
      </div>
    );
  }

  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
        Language not found
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-800">

      {/* 🔷 Hero Section */}
      <section className="py-14 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-600">
          {language.name}
        </h1>
        <p className="max-w-3xl mx-auto text-gray-600 mt-4 text-lg">
          {language.description}
        </p>
      </section>

      {/* 📘 Theory Section */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {topics.length === 0 ? (
          <p className="text-center text-gray-500">
            No theory available for this language.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition duration-300 border border-gray-100"
              >
                {/* Title */}
                <div className="flex items-center gap-3 mb-4">
                  <FaBookOpen className="text-blue-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">
                    {topic.title}
                  </h2>
                </div>

                {/* Content as Points */}
                <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
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
                    <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm">
                      <FaCode />
                      Code Example
                    </div>
                    <pre className="bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto text-sm">
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



