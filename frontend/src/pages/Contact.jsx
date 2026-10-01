import React, { useState } from "react";
import {
  FaArrowRight,
  FaComments,
  FaGithub,
  FaPaperPlane,
  FaRegEnvelope,
} from "react-icons/fa";
import {
  Button,
  Card,
  Eyebrow,
  Field,
  SectionHeading,
} from "../components/ui/primitives";
import { cx } from "../lib/cx";

const REPO_URL = "https://github.com/23prakashjha/theory-hub-project";

/* Placeholders only — swap these for real inboxes before shipping. */
const CHANNELS = [
  {
    icon: FaPaperPlane,
    label: "Bugs and feature requests",
    value: "Open an issue on GitHub",
    href: `${REPO_URL}/issues`,
    note: "Fastest route. Search first — someone may have hit it already.",
    external: true,
  },
  {
    icon: FaGithub,
    label: "Contributions",
    value: "Send a pull request",
    href: REPO_URL,
    note: "Small, focused changes are the easiest to review and merge.",
    external: true,
  },
  {
    icon: FaComments,
    label: "Everything else",
    value: "hello@example.com",
    href: null,
    note: "Placeholder address — replace before publishing.",
  },
];

const MAX_MESSAGE = 2000;

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const update = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const message = form.message.trim();
  const tooLong = message.length > MAX_MESSAGE;

  /* No mail backend exists, so this hands the message to the user's own client
     rather than pretending a request went out. */
  const mailto = () => {
    const subject = form.name.trim()
      ? `CodeTheory: message from ${form.name.trim()}`
      : "CodeTheory feedback";

    const body = [
      message,
      "",
      "---",
      `From: ${form.name.trim() || "not given"}`,
      `Email: ${form.email.trim() || "not given"}`,
    ].join("\n");

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const canSend =
    message.length > 0 && !tooLong && form.email.trim().length > 0;

  return (
    <div className="relative">
      {/* ============================================================== Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-14 sm:px-6 sm:pt-24 lg:px-8">
        <div
          aria-hidden="true"
          className="dot-backdrop absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
        />

        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow icon={FaRegEnvelope}>Contact</Eyebrow>
            <h1 className="mt-7 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">Found a bug?</span>{" "}
              <span className="text-white">Tell us.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              This is a student project, so there is no support desk — just a small
              team of people who actually want to hear what got in your way.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================== Channels */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto w-full max-w-7xl">
          <SectionHeading
            eyebrow="Where to reach us"
            icon={FaComments}
            title="Pick whichever is easiest"
            description="Anything you send ends up in the same place: the issue tracker."
          />

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {CHANNELS.map(({ icon: Icon, label, value, href, note, external }) => {
              const inner = (
                <Card
                  hover
                  className={cx(
                    "group flex h-full flex-col p-6",
                    href && "cursor-pointer",
                  )}
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-linear-to-br from-brand-400 to-brand-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Icon className="text-base" />
                  </span>

                  <p className="mt-5 text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-base font-bold text-white">
                    {value}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {note}
                  </p>

                  {href ? (
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-300">
                      {external ? "Open GitHub" : "Open"}
                      <FaArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  ) : null}
                </Card>
              );

              return href ? (
                <a
                  key={label}
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="rounded-2xl"
                >
                  {inner}
                </a>
              ) : (
                <div key={label}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== Form */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="mx-auto w-full max-w-4xl">
          <SectionHeading
            eyebrow="Compose"
            icon={FaPaperPlane}
            title="Draft it here"
            description="This opens your own email client with the message pre-filled. Nothing is uploaded anywhere."
          />

          <Card className="mt-12 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-slate-300">Name</span>
                <Field
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-slate-300">
                  Email
                  <span className="ml-1 font-normal text-slate-500">(to sign off)</span>
                </span>
                <Field
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="mt-5 flex flex-col gap-2">
              <span className="flex items-baseline justify-between text-[13px] font-semibold text-slate-300">
                Message
                <span
                  className={cx(
                    "font-mono text-[11px] font-normal",
                    tooLong ? "text-rose-300" : "text-slate-500",
                  )}
                >
                  {message.length} / {MAX_MESSAGE}
                </span>
              </span>
              <textarea
                name="message"
                value={form.message}
                onChange={update}
                rows={6}
                maxLength={MAX_MESSAGE + 200}
                placeholder="What happened, what you expected, and which browser you were on."
                className={cx(
                  "w-full resize-none rounded-xl border bg-ink-900/70 px-4 py-3 text-sm text-white",
                  "placeholder:text-slate-500 transition outline-none",
                  "focus:bg-ink-850 focus:ring-4 focus:ring-brand-500/18",
                  tooLong
                    ? "border-rose-400/60 focus:border-rose-400 focus:ring-rose-500/18"
                    : "border-white/10 focus:border-brand-400/60",
                )}
              />
            </label>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-slate-500">
                {canSend
                  ? "Ready — this will open your email client."
                  : "Add a message and an email address to continue."}
              </p>
              <Button
                onClick={mailto}
                disabled={!canSend}
                size="lg"
                className="shrink-0"
              >
                <FaPaperPlane className="size-4" />
                Send via email
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;