import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaBookOpen,
  FaCloudUploadAlt,
  FaEye,
  FaFilePdf,
  FaFolderOpen,
  FaLock,
  FaRegStar,
  FaSearch,
  FaTags,
  FaUpload,
  FaWindows,
} from "react-icons/fa";
import {
  Button,
  Card,
  Eyebrow,
  SectionHeading,
} from "../components/ui/primitives";
import { cx } from "../lib/cx";

const QUIZ_URL = "https://quiz-project-blush-two.vercel.app/";

const FEATURES = [
  {
    icon: FaCloudUploadAlt,
    title: "Drop in a file",
    body: "Drag a PDF onto the browser or pick one from your device. It lands in your library in seconds.",
    tone: "from-brand-500 to-brand-700",
    ring: "group-hover:shadow-brand",
  },
  {
    icon: FaEye,
    title: "Read in one click",
    body: "Every document opens instantly in a fresh tab, so you can skim, search and annotate without downloads.",
    tone: "from-aqua-500 to-aqua-600",
    ring: "group-hover:shadow-[0_28px_60px_-28px_rgba(56,189,248,0.85)]",
  },
  {
    icon: FaTags,
    title: "Tag and pin",
    body: "Group files by topic and star the ones you keep coming back to, so they float to the top.",
    tone: "from-mint-500 to-mint-600",
    ring: "group-hover:shadow-[0_28px_60px_-28px_rgba(16,185,129,0.85)]",
  },
  {
    icon: FaSearch,
    title: "Find anything fast",
    body: "Search across titles and file names, then sort by newest, name or size to narrow the pile.",
    tone: "from-gold-500 to-gold-400",
    ring: "group-hover:shadow-[0_28px_60px_-28px_rgba(245,158,11,0.85)]",
  },
  {
    icon: FaLock,
    title: "Yours by default",
    body: "No account needed. Your library is tied to this browser, so nobody else sees what you are reading.",
    tone: "from-rose-ink to-brand-500",
    ring: "group-hover:shadow-[0_28px_60px_-28px_rgba(251,113,133,0.85)]",
  },
  {
    icon: FaWindows,
    title: "Looks right everywhere",
    body: "Phone, tablet or a wide desktop — the layout adapts, so your library is usable on any screen.",
    tone: "from-brand-400 to-aqua-400",
    ring: "group-hover:shadow-brand",
  },
];

const STEPS = [
  {
    icon: FaUpload,
    title: "Upload",
    body: "Any PDF up to 15 MB. Drop it on the card or browse your files.",
  },
  {
    icon: FaFolderOpen,
    title: "Organise",
    body: "Add tags and pin the keepers so the important stuff stays on top.",
  },
  {
    icon: FaBookOpen,
    title: "Read anywhere",
    body: "Open it full screen on any device, then come back to it whenever you need.",
  },
];

const STATS = [
  { value: "15 MB", label: "Max file size" },
  { value: "PDF", label: "Supported format" },
  { value: "0", label: "Accounts needed" },
];

const Home = () => (
  <div className="relative">
    {/* ================================================================ Hero */}
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28 lg:pb-28">
      <div
        aria-hidden="true"
        className="dot-backdrop absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
      />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow icon={FaBolt} className="animate-rise">
            PDF library &middot; quiz practice
          </Eyebrow>

          <h1
            className="mt-7 text-4xl leading-[1.06] font-extrabold tracking-tight sm:text-6xl lg:text-7xl animate-rise"
            style={{ animationDelay: "60ms" }}
          >
            <span className="gradient-text">Your PDFs,</span>
            <br className="hidden sm:block" />{" "}
            <span className="text-white">organised in seconds.</span>
          </h1>

          <p
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg animate-rise"
            style={{ animationDelay: "120ms" }}
          >
            CodeTheory keeps lecture slides, book chapters and specs in one tidy
            place. Upload, tag, pin, and read them again on any screen — no account
            required.
          </p>

          <div
            className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row animate-rise"
            style={{ animationDelay: "180ms" }}
          >
            <Button to="/library" size="lg" className="group">
              <FaBookOpen className="size-4" />
              Open my library
              <FaArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
            <Button href={QUIZ_URL} size="lg" variant="outline">
              Try quiz practice
            </Button>
          </div>

          <dl
            className="mt-14 grid w-full max-w-lg grid-cols-3 divide-x divide-white/8 rounded-2xl border border-white/8 bg-white/4 px-2 py-5 backdrop-blur-xl animate-rise"
            style={{ animationDelay: "240ms" }}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="px-2">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-xl font-bold text-white sm:text-2xl">
                    {stat.value}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Product preview */}
        <div
          className="relative mx-auto mt-16 max-w-5xl animate-rise lg:mt-20"
          style={{ animationDelay: "300ms" }}
        >
          <div
            aria-hidden="true"
            className="absolute -inset-x-8 -top-10 bottom-0 -z-10 rounded-[2.5rem] bg-brand-600/20 blur-3xl"
          />

          <div className="glass overflow-hidden rounded-2xl shadow-lift sm:rounded-3xl">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3.5 sm:px-5">
              <span className="size-2.5 rounded-full bg-rose-400/70" />
              <span className="size-2.5 rounded-full bg-gold-400/70" />
              <span className="size-2.5 rounded-full bg-mint-400/70" />
              <span className="ml-3 hidden truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-500 sm:inline">
                codetheory.app/library
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-2.5 py-1 text-[11px] font-semibold text-brand-200">
                <FaRegStar className="size-3" />
                3 pinned
              </span>
            </div>

            {/* Preview body */}
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {[
                { title: "react-hooks-guide.pdf", size: "2.4 MB", tag: "react", pin: true },
                { title: "dbms-normalisation.pdf", size: "5.1 MB", tag: "dbms", pin: false },
                { title: "dsa-cheatsheet.pdf", size: "860 KB", tag: "dsa", pin: true },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group flex flex-col rounded-xl border border-white/8 bg-ink-900/60 p-4 transition-colors duration-200 hover:border-brand-400/40"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-rose-500/12 text-rose-ink">
                      <FaFilePdf />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {item.size} &middot; just now
                      </p>
                    </div>
                    <FaRegStar
                      className={cx(
                        "size-3.5 shrink-0",
                        item.pin ? "text-gold-400" : "text-slate-600",
                      )}
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-md bg-brand-500/12 px-1.5 py-0.5 text-[10px] font-medium text-brand-200">
                      #{item.tag}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-aqua-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <FaEye className="size-3" />
                      Read
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-5 -right-3 hidden items-center gap-2.5 rounded-2xl border border-white/10 bg-ink-850/90 px-4 py-3 shadow-lift backdrop-blur-xl animate-float sm:flex lg:-right-10">
            <span className="grid size-8 place-items-center rounded-lg bg-mint-500/15 text-mint-300">
              <FaBolt />
            </span>
            <div>
              <p className="text-xs font-semibold text-white">Upload complete</p>
              <p className="text-[11px] text-slate-500">Saved to your library</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* =========================================================== Features */}
    <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Why CodeTheory"
          icon={FaBolt}
          title={
            <>
              Built for the way you <span className="gradient-brand-text">actually</span> study
            </>
          }
          description="No clutter, no paywalls, no twelve-step onboarding. Just a fast, focused home for the material you need to read again."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {FEATURES.map(({ icon: Icon, title, body, tone, ring }) => (
            <Card
              key={title}
              hover
              className={cx("group p-6 transition-shadow duration-300", ring)}
            >
              <div
                className={cx(
                  "grid size-12 place-items-center rounded-xl bg-linear-to-br text-lg text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
                  tone,
                )}
              >
                <Icon />
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* =============================================================== Steps */}
    <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="How it works"
              icon={FaBolt}
              title={
                <>
                  From <span className="gradient-brand-text">“where did I put it?”</span> to reading in three steps
                </>
              }
              description="The whole flow is deliberately short. If it takes more than a few seconds, something is wrong."
            />

            <ol className="mt-10 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <Card hover className="flex items-start gap-4 p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 font-display text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="flex items-center gap-2 text-base font-bold">
                        {step.title}
                        <step.icon className="size-3.5 text-aqua-300" />
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                        {step.body}
                      </p>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>

            <Button to="/library" variant="soft" className="mt-8 group">
              Start uploading
              <FaArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Library banner */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-brand-600/25 via-aqua-500/12 to-transparent blur-2xl"
            />

            <div className="glass rounded-3xl p-7 shadow-lift sm:p-9">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-brand-200 uppercase">
                <FaFilePdf className="size-3" />
                PDF library
              </span>

              <h3 className="mt-5 text-2xl font-extrabold leading-tight sm:text-3xl">
                Keep every reference <span className="gradient-brand-text">one tap</span> away
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
                Drop in a book chapter, lecture slides or a spec. Every file stays
                in your library so you can open and read it again whenever you need —
                on a laptop at your desk or a phone on the commute.
              </p>

              <ul className="mt-7 space-y-3">
                {[
                  "Up to 15 MB per file, PDF only",
                  "Tag files by topic and pin favourites",
                  "Search and sort without re-uploading",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint-500/15 text-mint-300">
                      <svg viewBox="0 0 12 12" className="size-2.5" fill="none" aria-hidden="true">
                        <path
                          d="M2 6.2 4.6 8.8 10 3.4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {line}
                  </li>
                ))}
              </ul>

              <Button to="/library" className="mt-8 w-full group sm:w-auto">
                Go to my library
                <FaArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ============================================================ Final CTA */}
    <section className="px-4 pt-8 pb-24 sm:px-6 lg:px-8 lg:pb-32">
      <div className="mx-auto w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-linear-to-br from-brand-700/25 via-ink-900/60 to-ink-950/80 px-6 py-14 text-center shadow-lift sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="grid-backdrop absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl"
          />

          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              <span className="gradient-text">Ready when you are.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
              Open your library, upload the first PDF, and stop losing that
              half-finished chapter to a messy Downloads folder.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Button to="/library" size="lg" className="group">
                <FaBookOpen className="size-4" />
                Upload your first PDF
                <FaArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
              <Button to="/about" size="lg" variant="soft">
                Learn more about us
              </Button>
            </div>

            <p className="mt-8 text-xs text-slate-500">
              No sign-up &middot; Works offline after first load &middot;{" "}
              <Link to="/library" className="text-brand-300 underline-offset-4 hover:underline">
                Start now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
