import React from "react";
import { FaUsers, FaLightbulb, FaRocket, FaChalkboardTeacher, FaLaptopCode, FaAward } from "react-icons/fa";
import { Link } from "react-router-dom";

const About = () => {
  const teamMembers = [
    { name: "Prakash Jha", role: "Frontend Developer" },
    { name: "Sourav Singh", role: "Backend Developer" },
    { name: "Balram", role: "Full Stack Developer" },
    { name: "Sarfarz", role: "UI/UX Designer" },
    { name: "Aman", role: "Project Manager" },
    { name: "Anita", role: "QA Engineer" },
    { name: "Sachin", role: "full stack Engineer" },
    { name: "Rahul Yadav", role: "full stack Engineer" }
  ];

  const testimonials = [
    { name: "Alice", text: "CodeTheory helped me understand programming concepts clearly and gave me confidence to build real projects." },
    { name: "Bob", text: "The tutorials are structured and easy to follow, perfect for beginners and intermediates." },
    { name: "Charlie", text: "Hands-on exercises helped me practice coding and improve my skills effectively." },
    { name: "Alice", text: "CodeTheory helped me understand programming concepts clearly and gave me confidence to build real projects." },
    { name: "Bob", text: "The tutorials are structured and easy to follow, perfect for beginners and intermediates." },
    { name: "Charlie", text: "Hands-on exercises helped me practice coding and improve my skills effectively." },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-gray-900 to-black text-white px-4 py-16">
      <div className="max-w-7xl mx-auto">

        {/* 🔹 Hero Section */}
        <section className="text-center mb-16 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-linear-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            About CodeTheory
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
            CodeTheory is your ultimate platform for learning programming theory, practicing coding, and exploring tutorials across multiple programming languages. 
            Our mission is to make coding <strong>simple, interactive, and accessible</strong> for everyone.
          </p>
        </section>

        {/* 🔹 Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/40 transition transform hover:-translate-y-2">
            <FaLightbulb className="text-yellow-400 text-4xl mb-4 mx-auto" />
            <h2 className="text-2xl font-bold mb-2 text-center">Learn Efficiently</h2>
            <p className="text-gray-400 text-center">
              Structured tutorials and theory for every programming language to help you learn efficiently and confidently.
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-green-500/40 transition transform hover:-translate-y-2">
            <FaUsers className="text-green-400 text-4xl mb-4 mx-auto" />
            <h2 className="text-2xl font-bold mb-2 text-center">Community Support</h2>
            <p className="text-gray-400 text-center">
              Connect with other learners, ask questions, and share knowledge in a vibrant coding community.
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-purple-500/40 transition transform hover:-translate-y-2">
            <FaRocket className="text-purple-400 text-4xl mb-4 mx-auto" />
            <h2 className="text-2xl font-bold mb-2 text-center">Practical Coding</h2>
            <p className="text-gray-400 text-center">
              Hands-on examples and practice exercises to build real-world programming skills and boost your career.
            </p>
          </div>
        </section>

        {/* 🔹 Why Choose Us Section */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-linear-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Why Choose CodeTheory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/40 transition transform hover:-translate-y-2">
              <FaChalkboardTeacher className="text-yellow-400 text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2 text-center">Expert Tutors</h3>
              <p className="text-gray-400 text-center">
                Learn from experienced instructors with clear, step-by-step explanations.
              </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/40 transition transform hover:-translate-y-2">
              <FaLaptopCode className="text-blue-400 text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2 text-center">Hands-On Projects</h3>
              <p className="text-gray-400 text-center">
                Build projects alongside theory to solidify your coding skills.
              </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-purple-500/40 transition transform hover:-translate-y-2">
              <FaAward className="text-purple-400 text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2 text-center">Certification</h3>
              <p className="text-gray-400 text-center">
                Earn certificates to showcase your coding expertise to employers.
              </p>
            </div>
          </div>
        </section>

        {/* 🔹 Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center bg-linear-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-gray-800 rounded-2xl p-6 text-center hover:shadow-blue-500/40 transition transform hover:-translate-y-2">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-gray-700 text-3xl text-white font-bold">
                  {member.name[0]}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🔹 Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-linear-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            What Our Students Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-green-500/40 transition transform hover:-translate-y-2">
                <p className="text-gray-300 italic mb-4">
                  "{item.text}"
                </p>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-gray-400 text-sm">Student</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🔹 Call to Action */}
        <section className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to start learning?
          </h2>
          <p className="text-gray-400 mb-6">
            Explore our tutorials and start building your programming skills today!
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
          >
            Explore Languages
          </Link>
        </section>

      </div>
    </div>
  );
};

export default About;
