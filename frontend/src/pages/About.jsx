import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaAward,
  FaBalanceScale,
  FaBolt,
  FaBookOpen,
  FaChalkboardTeacher,
  FaCheck,
  FaChevronDown,
  FaCode,
  FaDatabase,
  FaFlask,
  FaLaptopCode,
  FaLayerGroup,
  FaLightbulb,
  FaLock,
  FaMapSigns,
  FaNodeJs,
  FaPuzzlePiece,
  FaQuoteLeft,
  FaReact,
  FaRocket,
  FaServer,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import { Badge, Button, Card, Eyebrow, SectionHeading } from "../components/ui/primitives";
import { cx } from "../lib/cx";

const FEATURES = [
  {
    icon: FaLightbulb,
    title: "Learn efficiently",
    body: "Structured tutorials and theory for every programming language, so you always know what to study next.",
    tone: "from-gold-400 to-gold-500",
  },
  {
    icon: FaUsers,
    title: "Community support",
    body: "Learn alongside other developers — share notes, compare approaches and keep each other accountable.",
    tone: "from-mint-400 to-mint-600",
  },
  {
    icon: FaRocket,
    title: "Practical coding",
    body: "Hands-on examples and practice exercises that turn concepts into skills you can actually use.",
    tone: "from-brand-400 to-brand-600",
  },
];

const DIFFERENTIATORS = [
  {
    icon: FaChalkboardTeacher,
    title: "Expert mentors",
    body: "Learn from engineers who explain concepts clearly, step by step, without the jargon.",
    tone: "from-gold-400 to-gold-500",
  },
  {
    icon: FaLaptopCode,
    title: "Hands-on projects",
    body: "Build alongside the theory so every concept has something real attached to it.",
    tone: "from-aqua-400 to-aqua-600",
  },
  {
    icon: FaAward,
    title: "Recognition",
    body: "Track what you have finished and show your progress to the people who ask.",
    tone: "from-brand-400 to-brand-600",
  },
];

const TEAM = [
  { name: "Prakash Jha", role: "Frontend Developer" },
  { name: "Sourav Singh", role: "Backend Developer" },
  { name: "Balram", role: "Full Stack Developer" },
  { name: "Sarfarz", role: "UI/UX Designer" },
  { name: "Aman", role: "Project Manager" },
  { name: "Anita", role: "QA Engineer" },
  { name: "Sachin", role: "Full Stack Engineer" },
  { name: "Rahul Yadav", role: "Full Stack Engineer" },
];

const TESTIMONIALS = [
  {
    name: "Alice Johnson",
    role: "Frontend Developer",
    text: "CodeTheory made the theory click. The examples are short enough to read between meetings but solid enough to actually use.",
  },
  {
    name: "Bob Williams",
    role: "Backend Developer",
    text: "The PDF library alone saves me time. I keep a chapter per topic, and finding the right one is a search box away.",
  },
  {
    name: "Charlie Davis",
    role: "Full Stack Developer",
    text: "Structured, no fluff, and it works on my phone. That combination is rarer than it should be.",
  },
  {
    name: "Priya Nair",
    role: "QA Engineer",
    text: "I used the pinned documents feature constantly during interview prep. It is the first study tool I have not abandoned after a week.",
  },
  {
    name: "Daniel Okafor",
    role: "Engineering Student",
    text: "Clear explanations, real examples, and a place to keep the reference material. Exactly what I was missing.",
  },
  {
    name: "Meera Sharma",
    role: "UI/UX Designer",
    text: "The interface is genuinely pleasant on a small screen, which matters more than most courses admit.",
  },
];

const MILESTONES = [
  { value: "8", label: "Contributors" },
  { value: "6", label: "Focus areas" },
  { value: "24/7", label: "Access" },
  { value: "0", label: "Accounts needed" },
];

const VALUES = [
  {
    icon: FaBookOpen,
    title: "Depth before breadth",
    body: "We would rather cover one topic properly than list fifty of them shallowly. Every chapter ends with something you can actually build.",
    tone: "from-brand-400 to-brand-600",
  },
  {
    icon: FaBalanceScale,
    title: "Open by default",
    body: "The platform is MIT licensed and lives in a public repository. Fork it, translate it, or point it at your own study group.",
    tone: "from-aqua-400 to-aqua-600",
  },
  {
    icon: FaShieldAlt,
    title: "Your files stay yours",
    body: "Documents belong to the account that uploaded them. Nothing is sold, shared or quietly repurposed into someone's ad targeting.",
    tone: "from-mint-400 to-mint-600",
  },
  {
    icon: FaFlask,
    title: "Built by using it",
    body: "Every feature on this page started as a gap someone hit while studying. Anything that does not survive real use gets cut.",
    tone: "from-gold-400 to-gold-500",
  },
];

const STEPS = [
  {
    icon: FaMapSigns,
    title: "Pick a topic",
    body: "Browse a language or framework and open the theory behind it.",
    tone: "from-brand-400 to-brand-600",
  },
  {
    icon: FaPuzzlePiece,
    title: "Add your material",
    body: "Upload slides, chapters and specs, then tag them so they stay findable.",
    tone: "from-aqua-400 to-aqua-600",
  },
  {
    icon: FaRocket,
    title: "Revise and repeat",
    body: "Pin the keepers, search the rest, and come back to the gap you left.",
    tone: "from-mint-400 to-mint-600",
  },
];

const STACK = [
  { label: "React 19", icon: FaReact, tone: "brand" },
  { label: "Vite", icon: FaCode, tone: "aqua" },
  { label: "Tailwind CSS v4", icon: FaLaptopCode, tone: "mint" },
  { label: "React Router", icon: FaMapSigns, tone: "gold" },
  { label: "Axios", icon: FaBolt, tone: "brand" },
  { label: "Node.js", icon: FaNodeJs, tone: "mint" },
  { label: "Express.js", icon: FaServer, tone: "brand" },
  { label: "MongoDB", icon: FaDatabase, tone: "mint" },
  { label: "Mongoose", icon: FaLayerGroup, tone: "aqua" },
  { label: "JWT auth", icon: FaLock, tone: "gold" },
  { label: "bcryptjs", icon: FaShieldAlt, tone: "brand" },
  { label: "Vercel-ready", icon: FaCheck, tone: "aqua" },
];

const FAQS = [
  {
    q: "Is it really free?",
    a: "Yes. The project is MIT licensed and there is no paid tier to unlock the library. Everything you can see here is what you get.",
  },
  {
    q: "Do I need an account?",
    a: "Only if you want your uploads to stick around. Browsing is open to everyone; an account ties documents to you so they survive a refresh or a new device.",
  },
  {
    q: "What can I upload?",
    a: "Lecture slides, book chapters, specs and notes. PDFs are the default because they survive reflow, but any format the browser can preview is accepted.",
  },
  {
    q: "Who can see my documents?",
    a: "Nobody else. Your library is scoped to your account, and nothing is indexed publicly or shared with third parties.",
  },
  {
    q: "Can admins see everything?",
    a: "Admins manage users and content, which means they can see what exists and remove it if it breaks the rules. They cannot read private note content beyond what moderation requires.",
  },
  {
    q: "How do I contribute?",
    a: "The repository is public. Open an issue describing the topic or fix you want, or send a pull request — small, focused changes are the easiest to merge.",
  },
];

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const FaqItem = ({ question, answer, open, onToggle }) => (
  <Card className="overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
    >
      <span
        className={cx(
          "text-[15px] font-semibold transition-colors duration-200",
          open ? "text-white" : "text-slate-200",
        )}
      >
        {question}
      </span>
      <FaChevronDown
        className={cx(
          "size-4 shrink-0 text-slate-500 transition-transform duration-300",
          open && "rotate-180 text-brand-300",
        )}
      />
    </button>

    {/* Kept mounted and collapsed via height so the answer is still reachable
        to find-in-page and screen readers. */}
    <div
      className={cx(
        "grid transition-[grid-template-rows] duration-300 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="overflow-hidden">
        <p className="px-6 pb-6 text-sm leading-relaxed text-slate-400">{answer}</p>
      </div>
    </div>
  </Card>
);

const About = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="relative">
    {/* ================================================================ Hero */}
    <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
      <div
        aria-hidden="true"
        className="dot-backdrop absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
      />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow icon={FaCode}>About CodeTheory</Eyebrow>

          <h1 className="mt-7 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="gradient-text">We make coding theory</span>{" "}
            <span className="text-white">feel simple.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            CodeTheory is a learning hub for programming theory, hands-on practice
            and a personal library of the PDFs you keep needing. Our mission is to
            make learning <strong className="font-semibold text-white">simple,
            interactive and accessible</strong> — for your first commit and your
            hundredth.
          </p>

          <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
            <Button to="/library" size="lg">
              Explore the library
            </Button>
            <Button href="#team" size="lg" variant="outline">
              Meet the team
            </Button>
          </div>
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-4">
          {MILESTONES.map((item) => (
            <div
              key={item.label}
              className="bg-ink-950/80 px-5 py-6 text-center backdrop-blur-xl"
            >
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block font-display text-2xl font-bold text-white sm:text-3xl">
                  {item.value}
                </span>
                <span className="mt-1.5 block text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  {item.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>

    {/* ============================================================ Features */}
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="What we do"
          icon={FaLightbulb}
          title="Three things we obsess over"
          description="Everything in CodeTheory is built around these. If a feature does not serve one of them, it does not ship."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {FEATURES.map(({ icon: Icon, title, body, tone }) => (
            <Card key={title} hover className="group p-7 text-center">
              <span
                className={cx(
                  "mx-auto grid size-14 place-items-center rounded-2xl bg-linear-to-br text-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
                  tone,
                )}
              >
                <Icon />
              </span>
              <h3 className="mt-6 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* ====================================================== Differentiators */}
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Why CodeTheory"
          icon={FaAward}
          title="Why learners choose us"
          description="A short list, kept intentionally short — because every promise we make has to survive a real deadline."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {DIFFERENTIATORS.map(({ icon: Icon, title, body, tone }) => (
            <Card key={title} hover className="group flex gap-5 p-6">
              <span
                className={cx(
                  "grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br text-lg text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
                  tone,
                )}
              >
                <Icon />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* ============================================================== Values */}
    <section id="values" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="What we believe"
          icon={FaBookOpen}
          title="The rules we hold ourselves to"
          description="Four commitments that decide what gets built, what gets cut, and what never ships."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
          {VALUES.map(({ icon: Icon, title, body, tone }) => (
            <Card key={title} hover className="group flex gap-5 p-6">
              <span
                className={cx(
                  "grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br text-lg text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
                  tone,
                )}
              >
                <Icon />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* =========================================================== How it works */}
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="How it works"
          icon={FaMapSigns}
          title="Three steps, then repeat"
          description="There is no onboarding to sit through. Open a topic, add what you are studying, come back when you need it."
        />

        <ol className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {STEPS.map(({ icon: Icon, title, body, tone }, index) => (
            <li key={title}>
              <Card hover className="group relative h-full p-7">
                <span className="absolute top-6 right-6 font-display text-4xl font-extrabold text-white/6 transition-colors duration-300 group-hover:text-white/12">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cx(
                    "grid size-14 place-items-center rounded-2xl bg-linear-to-br text-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
                    tone,
                  )}
                >
                  <Icon />
                </span>
                <h3 className="mt-6 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* ============================================================== Stack */}
    <section id="stack" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Under the hood"
          icon={FaCode}
          title="Built with tools we trust"
          description="Nothing exotic here — just a stack we can debug at 2am and hand to a new contributor without a week of onboarding."
        />

        <Card className="mt-14 p-8 sm:p-10">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/8 sm:grid-cols-3 lg:grid-cols-4">
            {STACK.map(({ label, icon: Icon, tone }) => (
              <div
                key={label}
                className="group flex items-center gap-3 bg-ink-900/80 px-5 py-5 transition-colors duration-300 hover:bg-ink-850/80"
              >
                <span
                  className={cx(
                    "grid size-10 shrink-0 place-items-center rounded-xl text-[15px] transition-transform duration-300 group-hover:scale-110",
                    tone === "brand" && "bg-brand-500/14 text-brand-300",
                    tone === "aqua" && "bg-aqua-500/14 text-aqua-300",
                    tone === "mint" && "bg-mint-500/14 text-mint-300",
                    tone === "gold" && "bg-gold-500/14 text-gold-300",
                  )}
                >
                  <Icon />
                </span>
                <span className="min-w-0 text-[13px] font-semibold text-slate-200">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["Responsive", "Dark only", "MIT licensed", "Open source", "No tracking"].map(
              (label) => (
                <Badge key={label} tone="muted">
                  {label}
                </Badge>
              ),
            )}
          </div>
        </Card>
      </div>
    </section>

    {/* ================================================================ Team */}
    <section id="team" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="The people"
          icon={FaUsers}
          title="Meet our team"
          description="A small group of engineers and designers building CodeTheory in the open."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {TEAM.map((member) => (
            <Card key={member.name} hover className="group p-6 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-linear-to-br from-brand-500/90 to-aqua-600/90 font-display text-lg font-bold text-white shadow-lg ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105 sm:size-20 sm:text-xl">
                {initials(member.name)}
              </span>
              <h3 className="mt-5 text-sm font-bold sm:text-base">{member.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                {member.role}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* ======================================================== Testimonials */}
    <section
      id="testimonials"
      className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Testimonials"
          icon={FaQuoteLeft}
          title="What our students say"
          description="Straight from the people who use CodeTheory every week."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <Card
              key={item.name}
              hover
              className="group flex flex-col justify-between p-6"
            >
              <FaQuoteLeft className="size-5 text-brand-400/50 transition-colors duration-300 group-hover:text-brand-300" />

              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {item.text}
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-white/8 pt-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-ink-700 to-ink-600 text-[11px] font-bold text-white">
                  {initials(item.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {item.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">{item.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* ================================================================ FAQ */}
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="FAQ"
          icon={FaLightbulb}
          title="Questions, answered"
          description="The things people ask us most often. If yours is not here, the repository issue tracker is the fastest way to reach us."
        />

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3">
          {FAQS.map((item, index) => (
            <FaqItem
              key={item.q}
              question={item.q}
              answer={item.a}
              open={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>

    {/* ============================================================= Final CTA */}
    <section className="px-4 pt-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-linear-to-br from-brand-700/25 via-ink-900/60 to-ink-950/80 px-6 py-14 text-center shadow-lift sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="grid-backdrop absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl"
          />

          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              <span className="gradient-text">Ready to start learning?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-300/90">
              Upload your first PDF, work through a chapter, and keep it all in one
              place. It takes about a minute.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Button to="/library" size="lg">
                Open my library
              </Button>
              <Button to="/" size="lg" variant="soft">
                Back to home
              </Button>
            </div>

            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-1.5 text-xs text-slate-500">
              <span>Questions?</span>
              <Link
                to="/about#faq"
                className="text-brand-300 underline-offset-4 hover:underline"
              >
                Read the FAQ
              </Link>{" "}
              or just{" "}
              <Link to="/library" className="text-brand-300 underline-offset-4 hover:underline">
                start uploading
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default About;
