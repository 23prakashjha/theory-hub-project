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
          Loading content...
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

      {/* HERO */}
      <section className="py-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-blue-600">
          {language.name}
        </h1>

        <p className="mt-6 text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
          {language.description}
        </p>

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 bg-white shadow px-5 py-2 rounded-full text-sm">
            <FaLayerGroup className="text-blue-500" />
            {topics.length} Topics Available
          </div>
        </div>
      </section>

      {/* THEORY */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        {topics.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No theory available for this language.
          </p>
        ) : (
          <div className="space-y-10">
            {topics.map((topic) => {
              let contentLines = [];

              // ✅ HANDLE STRING OR ARRAY
              if (Array.isArray(topic.content)) {
                contentLines = topic.content;
              } else if (typeof topic.content === "string") {
                contentLines = topic.content
                  .split("\n")
                  .filter((line) => line.trim() !== "");
              }

              return (
                <div
                  key={topic._id}
                  className="bg-white rounded-2xl p-8 shadow-md border"
                >
                  {/* TITLE */}
                  <div className="flex items-center gap-3 mb-5">
                    <FaBookOpen className="text-blue-600 text-xl" />
                    <h2 className="text-2xl font-bold text-gray-800">
                      {topic.title}
                    </h2>
                  </div>

                  {/* CONTENT */}
                  <ul className="list-disc pl-6 space-y-3 text-gray-700 text-base leading-relaxed">
                    {contentLines.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>

                  {/* CODE */}
                  {topic.codeExample && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3 text-gray-600 font-medium">
                        <FaCode />
                        Code Example
                      </div>

                      <pre className="bg-gray-900 text-green-400 rounded-xl p-5 overflow-x-auto text-sm">
                        <code>{topic.codeExample}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default LanguageDetails;




