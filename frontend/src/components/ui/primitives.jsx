import React from "react";
import { Link } from "react-router-dom";
import { cx } from "../../lib/cx";

/* ------------------------------------------------------------------ Button */

const BUTTON_BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold " +
  "whitespace-nowrap transition-all duration-200 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-45";

const BUTTON_VARIANTS = {
  primary:
    "bg-linear-to-r from-brand-500 to-brand-700 text-white shadow-brand " +
    "hover:from-brand-400 hover:to-brand-600 hover:shadow-[0_20px_55px_-18px_rgba(129,132,251,0.9)]",
  soft: "bg-white/6 text-white ring-1 ring-inset ring-white/12 hover:bg-white/12",
  outline:
    "text-slate-200 ring-1 ring-inset ring-white/15 hover:bg-white/6 hover:text-white",
  danger:
    "bg-rose-500/12 text-rose-300 ring-1 ring-inset ring-rose-400/25 hover:bg-rose-500/22 hover:text-rose-200",
};

const BUTTON_SIZES = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px] sm:h-14 sm:px-8 sm:text-base",
};

/**
 * Renders as <button>, <Link> (when `to`) or <a> (when `href`).
 */
export function Button({
  to,
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const classes = cx(BUTTON_BASE, BUTTON_SIZES[size], BUTTON_VARIANTS[variant], className);

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({ hover = false, className = "", children, ...rest }) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl border border-white/8 bg-ink-900/60 backdrop-blur-xl",
        hover &&
          "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-400/40 hover:shadow-lift",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Labels */

export function Eyebrow({ icon: Icon, className = "", children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5",
        "text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-200",
        className,
      )}
    >
      {Icon ? <Icon className="text-[13px] text-aqua-300" /> : null}
      {children}
    </span>
  );
}

export function Badge({ tone = "brand", className = "", children }) {
  const tones = {
    brand: "bg-brand-500/14 text-brand-200 ring-brand-400/25",
    mint: "bg-mint-500/14 text-mint-300 ring-mint-400/25",
    gold: "bg-gold-500/14 text-gold-300 ring-gold-400/25",
    aqua: "bg-aqua-500/14 text-aqua-300 ring-aqua-400/25",
    muted: "bg-white/6 text-slate-300 ring-white/10",
    danger: "bg-rose-500/14 text-rose-300 ring-rose-400/25",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        tones[tone] || tones.muted,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- Headings */

export function SectionHeading({
  eyebrow,
  icon,
  title,
  description,
  align = "center",
  className = "",
  children,
}) {
  const centered = align === "center";

  return (
    <div
      className={cx(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? <Eyebrow icon={icon}>{eyebrow}</Eyebrow> : null}
      <h2 className="max-w-3xl text-3xl leading-[1.12] font-bold sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description ? (
        <p
          className={cx(
            "max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Inputs */

/* Height is left to the call site so `h-*` overrides can never collide. */
const FIELD_BASE =
  "w-full rounded-xl border border-white/10 bg-ink-900/70 px-4 text-sm text-white " +
  "placeholder:text-slate-500 transition outline-none " +
  "focus:border-brand-400/60 focus:bg-ink-850 focus:ring-4 focus:ring-brand-500/18";

export function Field({ className = "", ...rest }) {
  return <input className={cx(FIELD_BASE, className)} {...rest} />;
}

export function Select({ className = "", children, ...rest }) {
  return (
    <div className={cx("relative", className)}>
      <select
        className={cx(
          FIELD_BASE,
          "h-11 cursor-pointer appearance-none pr-9 text-[13px] font-medium",
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500"
      >
        <path
          d="m6 8 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default Button;
