import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">

      {/* Hero */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Learn Programming & Frameworks
        </h1>
        <p className="max-w-3xl mx-auto text-gray-300 mt-4 text-lg">
          Master theory, examples, and interview concepts for modern technologies.
        </p>
      </section>

      {/* PDF library feature banner */}
      <section className="max-w-5xl mx-auto px-4 mb-14">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 border border-blue-500/20 p-8 md:p-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Upload your PDFs &amp; keep them saved
            </h2>
            <p className="text-gray-400 mt-3 max-w-lg">
              Drop in a book chapter, lecture slides or a spec. Every file stays
              in your library so you can open and read it again whenever you need.
            </p>
            <Link
              to="/library"
              className="mt-6 inline-block px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-105"
            >
              Go to my library →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            {[
              { icon: "📄", label: "Upload PDF" },
              { icon: "💾", label: "Saved safely" },
              { icon: "👁️", label: "Read anytime" },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center justify-center text-2xl mb-2">
                  {step.icon}
                </div>
                <p className="text-xs font-semibold text-gray-300">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

