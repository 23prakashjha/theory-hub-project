import React from "react";

/**
 * Ambient page backdrop: a base wash, three slow-moving colour fields and a
 * masked grid. Fixed and non-interactive so it never affects layout or input.
 */
const Background = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
    <div className="absolute inset-0 bg-ink-950" />

    <div className="absolute -top-52 inset-x-0 mx-auto h-[42rem] w-[42rem] max-w-[150vw] rounded-full bg-brand-600/22 blur-[130px] animate-aurora" />
    <div className="absolute top-1/4 -left-40 h-[26rem] w-[26rem] rounded-full bg-aqua-500/14 blur-[120px] animate-drift" />
    <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-brand-800/25 blur-[130px] animate-drift [animation-delay:-8s]" />

    <div className="grid-backdrop absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black,transparent)]" />

    {/* Bottom fade so the footer dissolves into the canvas. */}
    <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-ink-950 to-transparent" />
  </div>
);

export default Background;
