import React from "react";
import { FaCheck, FaCreditCard, FaServer, FaUsers } from "react-icons/fa";
import {
  Button,
  Card,
  Eyebrow,
  SectionHeading,
} from "../components/ui/primitives";
import { cx } from "../lib/cx";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    body: "Everything you need to study. No card, no trial clock.",
    highlight: true,
    cta: "Open your library",
    features: [
      "Unlimited PDF uploads",
      "Tag, pin and search",
      "Library history",
      "Read on any device",
    ],
  },
  {
    name: "Coming next",
    price: "—",
    period: "not yet",
    body: "What we are building once the basics stop being painful.",
    highlight: false,
    cta: "See what is planned",
    features: [
      "Shared study collections",
      "Collaborative notes",
      "Progress tracking",
      "Offline export",
    ],
  },
];

const INCLUDED = [
  {
    icon: FaCreditCard,
    title: "No payment details",
    body: "There is no checkout on this project. Nothing is billed and nothing is stored.",
  },
  {
    icon: FaServer,
    title: "Self-hosted friendly",
    body: "Point the app at your own MongoDB and file storage if you would rather not share anything.",
  },
  {
    icon: FaUsers,
    title: "Open to everyone",
    body: "No login wall in front of the library, so a study partner can just open the link.",
  },
];

const Pricing = () => (
  <div className="relative">
    {/* ================================================================ Hero */}
    <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:px-6 sm:pt-24 lg:px-8">
      <div
        aria-hidden="true"
        className="dot-backdrop absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
      />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow icon={FaCreditCard}>Pricing</Eyebrow>
          <h1 className="mt-7 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="gradient-text">Everything costs</span>{" "}
            <span className="text-white">nothing.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            CodeTheory is a student project, not a subscription. There is one tier,
            it is free, and it is not going to change while this stays a portfolio
            piece rather than a company.
          </p>
        </div>
      </div>
    </section>

    {/* =============================================================== Plans */}
    <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="What it costs"
          icon={FaCheck}
          title="One plan, no tiers"
          description="The second card is a placeholder for features we have not built yet — it is here so nobody has to guess."
        />

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              hover
              className={cx(
                "relative flex flex-col p-8",
                plan.highlight &&
                  "border-brand-400/40 bg-linear-to-b from-brand-700/25 to-ink-900/60 shadow-brand",
              )}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-brand-500 to-aqua-500 px-4 py-1 text-[11px] font-bold tracking-wide text-white uppercase shadow-brand">
                  Available now
                </span>
              ) : null}

              <h3 className="font-display text-lg font-bold">{plan.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{plan.body}</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>

              <ul className="mt-8 flex flex-col gap-3.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <span
                      className={cx(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px]",
                        plan.highlight
                          ? "bg-mint-500/15 text-mint-300"
                          : "bg-white/6 text-slate-400",
                      )}
                    >
                      <FaCheck />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                to={plan.highlight ? "/library" : "/about"}
                variant={plan.highlight ? "primary" : "soft"}
                size="md"
                className="mt-9 w-full"
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* ============================================================= Included */}
    <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="What that gets you"
          icon={FaUsers}
          title="No strings attached"
          description="The reasons the price is zero, spelled out."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {INCLUDED.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-linear-to-br from-brand-400 to-brand-600 text-white shadow-lg">
                <Icon className="text-base" />
              </span>
              <h3 className="mt-5 text-base font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Pricing;