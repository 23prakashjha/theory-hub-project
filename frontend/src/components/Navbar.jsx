import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBookOpen, FaCode, FaExternalLinkAlt, FaBars, FaTimes } from "react-icons/fa";
import { Button } from "./ui/primitives";
import { cx } from "../lib/cx";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/library", label: "Library", icon: FaBookOpen },
];

const QUIZ_URL = "https://quiz-project-blush-two.vercel.app/";

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });

  const navRef = useRef(null);
  const linkRefs = useRef({});

  /* Condense the bar once the page scrolls. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close the mobile panel whenever the route changes. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Lock the page behind the mobile panel. */
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Position the sliding pill under the active link. */
  const measure = () => {
    const node = linkRefs.current[pathname];
    if (!node) {
      setPill((prev) => ({ ...prev, visible: false }));
      return;
    }
    setPill({ left: node.offsetLeft, width: node.offsetWidth, visible: true });
  };

  useLayoutEffect(measure, [pathname]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <header
      className={cx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav shadow-[0_10px_40px_-24px_rgba(0,0,0,1)]" : "border-b border-transparent",
      )}
    >
      <nav
        className={cx(
          "mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-8",
          scrolled ? "h-16" : "h-[4.5rem]",
        )}
        aria-label="Main"
      >
        {/* Brand */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg"
          aria-label="CodeTheory home"
        >
          <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-linear-to-br from-brand-500 to-aqua-500 shadow-[0_8px_24px_-10px_rgba(102,102,245,0.9)] transition-transform duration-300 group-hover:scale-105">
            <FaCode className="text-[15px] text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-bold tracking-tight text-white">
              Code<span className="gradient-brand-text">Theory</span>
            </span>
            <span className="mt-0.5 hidden text-[10px] font-medium tracking-[0.18em] text-slate-500 uppercase sm:block">
              Study hub
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden lg:block">
          <div
            ref={navRef}
            className="relative flex items-center gap-1 rounded-2xl border border-white/8 bg-white/4 p-1"
          >
            <span
              aria-hidden="true"
              className={cx(
                "absolute top-1 bottom-1 rounded-xl bg-linear-to-r from-brand-500/90 to-brand-700/90",
                "shadow-[0_8px_24px_-12px_rgba(102,102,245,0.95)] transition-all duration-300 ease-out",
                pill.visible ? "opacity-100" : "opacity-0",
              )}
              style={{ left: pill.left, width: pill.width }}
            />

            {LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                ref={(node) => {
                  linkRefs.current[to] = node;
                }}
                className={({ isActive }) =>
                  cx(
                    "relative z-10 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-white",
                  )
                }
              >
                {Icon ? <Icon className="text-[13px]" /> : null}
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={QUIZ_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
          >
            Quiz Practice
            <FaExternalLinkAlt className="size-3 opacity-50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <Button to="/library" size="sm" className="px-4">
            <FaBookOpen className="size-3.5" />
            Open library
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button to="/library" size="sm" variant="soft" className="px-3.5" aria-label="Open library">
            <FaBookOpen className="size-3.5" />
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
          >
            <span className={cx("transition-transform duration-200", open && "rotate-90")}>
              {open ? <FaTimes className="size-4" /> : <FaBars className="size-4" />}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      <div
        id="mobile-menu"
        className={cx(
          "overflow-hidden border-t border-white/8 bg-ink-950/95 backdrop-blur-xl transition-all duration-300 ease-out lg:hidden",
          open ? "max-h-[80dvh] opacity-100" : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <ul className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cx(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-colors",
                    isActive
                      ? "bg-brand-500/15 text-white ring-1 ring-brand-400/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )
                }
              >
                {Icon ? (
                  <Icon className="size-4 text-brand-300" />
                ) : (
                  <span className="size-4 rounded-full bg-brand-400/60" />
                )}
                {label}
              </NavLink>
            </li>
          ))}

          <li className="my-2 h-px rule-fade" aria-hidden="true" />

          <li>
            <a
              href={QUIZ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <FaExternalLinkAlt className="size-4 text-aqua-300" />
              Quiz Practice
            </a>
          </li>

          <li className="pt-2">
            <Button to="/library" className="w-full" size="lg">
              <FaBookOpen className="size-4" />
              Go to my library
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
