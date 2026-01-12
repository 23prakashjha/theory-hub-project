import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import About from "./components/About";
import LanguageDetails from "./pages/LanguageDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AddTheory from "./pages/AddTheory";
import ManageTheory from "./pages/ManageTheory";
import ManageLanguages from "./pages/ManageLanguages";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="grow">
          <Routes>

            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/language/:id" element={<LanguageDetails />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-theory" element={<AddTheory />} />
            <Route path="/admin/manage-theory" element={<ManageTheory />} />
            <Route path="/admin/manage-languages" element={<ManageLanguages />} />

          </Routes>
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </Router>
  );
};

export default App;
