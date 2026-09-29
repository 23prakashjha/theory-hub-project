import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import About from "./components/About";
import AdminDashboard from "./pages/AdminDashboard";
import Library from "./pages/Library";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
          }}
        />

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="grow">
          <Routes>

            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* PDF library */}
            <Route path="/library" element={<Library />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Anything else (e.g. removed pages) goes home instead of rendering a blank view */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </Router>
  );
};

export default App;
