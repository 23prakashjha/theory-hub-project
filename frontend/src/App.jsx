import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Library from "./pages/Library";
import AdminDashboard from "./pages/AdminDashboard";

/** Route changes should land at the top, unless the link targets an anchor. */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      /* getElementById rather than querySelector — hashes are not always
         valid CSS selectors, and this can never throw. */
      const target = document.getElementById(hash.replace(/^#/, ""));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
};

const App = () => (
  <Router>
    <Background />
    <ScrollToTop />

    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 3800,
        className:
          "!rounded-xl !border !border-white/10 !bg-ink-850/95 !text-slate-100 " +
          "!font-sans !text-sm !shadow-lift !backdrop-blur-xl",
        success: { iconTheme: { primary: "#34d399", secondary: "#0b1020" } },
        error: { iconTheme: { primary: "#fb7185", secondary: "#0b1020" } },
      }}
    />

    <div className="relative z-10 flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/library" element={<Library />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Removed pages redirect home instead of rendering a blank view. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  </Router>
);

export default App;
