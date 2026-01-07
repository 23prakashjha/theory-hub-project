import React, { useState, useEffect } from "react";
import axios from "axios";

const AddTheory = () => {
  const [languages, setLanguages] = useState([]);
  const [formData, setFormData] = useState({
    languageId: "",
    newLanguageName: "",
    title: "",
    content: "",
    codeExample: "",
  });

  // Fetch existing languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await axios.get("https://theory-hub-project.onrender.com");
        if (res.data) setLanguages(res.data);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
        alert("Failed to load languages. Check backend.");
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.languageId && !formData.newLanguageName.trim()) {
      alert("Select existing language or type a new one");
      return;
    }
    if (!formData.title || !formData.content) {
      alert("Fill in title and content");
      return;
    }

    try {
      await axios.post("https://theory-hub-project.onrender.com", formData);
      alert("Theory added successfully!");
      setFormData({
        languageId: "",
        newLanguageName: "",
        title: "",
        content: "",
        codeExample: "",
      });
    } catch (error) {
      console.error(error.response || error);
      alert(
        error.response?.data?.message || "Failed to add theory. Check backend."
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl p-6 md:p-10 shadow-xl">
        <h1 className="text-3xl font-extrabold mb-8 text-center">
          Add Programming Theory
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Select existing language */}
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">
              Select Existing Language
            </label>
            <select
              name="languageId"
              value={formData.languageId}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Or select a language --</option>
              {languages.map((lang) => (
                <option key={lang._id} value={lang._id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Or type new language */}
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">
              Or Type a New Language
            </label>
            <input
              type="text"
              name="newLanguageName"
              value={formData.newLanguageName}
              onChange={handleChange}
              placeholder="e.g. Rust, Go"
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">
              Topic Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Variables"
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">
              Theory Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Write detailed explanation..."
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 min-h-160px focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Optional Code Example */}
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">
              Code Example (Optional)
            </label>
            <textarea
              name="codeExample"
              value={formData.codeExample}
              onChange={handleChange}
              placeholder="Write code example..."
              className="w-full p-3 rounded bg-black border border-gray-700 min-h-140px font-mono text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 font-semibold hover:opacity-90 transition"
          >
            Save Theory
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTheory;
