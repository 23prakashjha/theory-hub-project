import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaCode,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFacebook,
  FaGithub,
  FaLinkedin,
  FaPaperPlane,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { Button, Field } from "./ui/primitives";

const QUIZ_URL = "https://quiz-project-blush-two.vercel.app/";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Home", to: "/" },
      { label: "My Library", to: "/library" },
      { label: "Quiz Practice", href: QUIZ_URL },
      { label: "Dashboard", to: "/admin" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Our team", to: "/about#team" },
      { label: "What learners say", to: "/about#testimonials" },
    ],
  },
];

/* Only GitHub has a real destination; the rest are surfaced honestly. */
const SOCIALS = [
  { label: "GitHub", icon: FaGithub, href: "https://github.com/23prakashjha/theory-hub-project" },
  { label: "LinkedIn", icon: FaLinkedin },
  { label: "X / Twitter", icon: FaTwitter },
  { label: "Facebook", icon: FaFacebook },
  { label: "WhatsApp", icon: FaWhatsapp },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Footer = () => {
  const [email, setEmail] = useState("");

  const subscribe = (event) => {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      toast.error("Enter a valid email address.");
      return;
    }
    toast.success("You're on the list — we'll keep you posted.");
    setEmail("");
  };

  return (
    <footer className="relative mt-auto border-t border-white/8 bg-ink-950/60 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-aqua-500 shadow-[0_8px_24px_-10px_rgba(102,102,245,0.9)]">
                <FaCode className="text-[15px] text-white" />
              </span>
              <span className="font-display text-[17px] font-bold tracking-tight text-white">
                Code<span className="gradient-brand-text">Theory</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              A calm corner of the internet for the PDFs you keep coming back to —
              lecture slides, specs and chapters, always one click away.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid size-9 place-items-center rounded-xl border border-white/8 bg-white/4 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
                  >
                    <Icon className="text-sm" />
                  </a>
                ) : (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    title={`${label} — coming soon`}
                    onClick={() => toast(`${label} profile is coming soon.`)}
                    className="grid size-9 place-items-center rounded-xl border border-white/8 bg-white/4 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
                  >
                    <Icon className="text-sm" />
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((column) => (
            <nav key={column.title} className="lg:col-span-2" aria-label={column.title}>
              <h3 className="font-display text-sm font-semibold tracking-wide text-white">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        <span className="h-px w-0 bg-brand-400 transition-all duration-200 group-hover:w-3" />
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                        <FaExternalLinkAlt className="size-2.5 opacity-50" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="font-display text-sm font-semibold tracking-wide text-white">
              Stay in the loop
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              Occasional notes on new features and study tips. No noise, ever.
            </p>

            <form onSubmit={subscribe} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <div className="relative flex-1">
                <FaEnvelope
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-slate-500"
                />
                <Field
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 pr-4 pl-10"
                />
              </div>
              <Button type="submit" className="sm:w-auto" aria-label="Subscribe">
                <FaPaperPlane className="size-3.5" />
                Subscribe
              </Button>
            </form>

            <Link
              to="/library"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 transition-colors hover:text-white"
            >
              <FaBookOpen className="size-3.5" />
              Open your library
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            &copy; {new Date().getFullYear()} CodeTheory. Built for learners.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link to="/about" className="transition-colors hover:text-white">
              About
            </Link>
            <Link to="/library" className="transition-colors hover:text-white">
              Library
            </Link>
            <a
              href={QUIZ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Quiz Practice
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
