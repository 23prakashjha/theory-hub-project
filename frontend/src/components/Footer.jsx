import React from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaCode, FaEnvelope,FaFacebook, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-linear-to-tr from-gray-900 via-gray-800 to-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand & About */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FaCode className="text-blue-500 text-2xl" />
            <span className="text-xl font-bold text-white">CodeTheory</span>
          </div>
          <p className="text-gray-400 text-sm">
            Learn programming theory with clean examples, tutorials, and guides across popular languages and frameworks.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-blue-400 transition">Home</a></li>
            <li><a href="/about" className="hover:text-blue-400 transition">About</a></li>
            <li><a href="https://quiz-project-blush-two.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">Quiz Project</a></li>
          </ul>
        </div>

        {/* Connect / Social */}
       <div className="flex space-x-4">
  <a href="#" className="hover:text-blue-500 transition">
    <FaGithub size={20} />
  </a>
  <a href="#" className="hover:text-blue-500 transition">
    <FaLinkedin size={20} />
  </a>
  <a href="#" className="hover:text-blue-500 transition">
    <FaTwitter size={20} />
  </a>
  <a href="#" className="hover:text-blue-500 transition">
    <FaFacebook size={20} />
  </a>
  <a href="#" className="hover:text-blue-500 transition">
    <FaWhatsapp size={20} />
  </a>
</div>

        {/* Newsletter / Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Subscribe</h3>
          <p className="text-gray-400 text-sm mb-2">Get updates on new tutorials and courses.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button className="px-4 py-2 rounded-r-lg bg-blue-500 hover:bg-blue-600 transition text-white font-semibold">
              <FaEnvelope />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} CodeTheory. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
