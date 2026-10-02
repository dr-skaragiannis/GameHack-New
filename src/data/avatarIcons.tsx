import type { ReactNode } from "react";

// HACKFORGE avatar icon library — all ORIGINAL geometric line-art on a 24x24
// grid using currentColor, so every glyph can be recolored. No glyph depicts a
// copyrighted/trademarked character; they are original symbolic designs.
//
// Organized into categories. Keys are globally unique across categories.

export const AVATAR_COLORS: { name: string; hex: string }[] = [
  { name: "Ember", hex: "#ff6a2b" },
  { name: "Amber", hex: "#fcd34d" },
  { name: "Lime", hex: "#a3e635" },
  { name: "Neon Green", hex: "#3ddc84" },
  { name: "Teal", hex: "#2dd4bf" },
  { name: "Cyan", hex: "#22d3ee" },
  { name: "Sky", hex: "#38bdf8" },
  { name: "Indigo", hex: "#818cf8" },
  { name: "Violet", hex: "#a78bfa" },
  { name: "Fuchsia", hex: "#e879f9" },
  { name: "Pink", hex: "#f472b6" },
  { name: "Crimson", hex: "#f43f5e" },
  { name: "Red", hex: "#f87171" },
  { name: "Steel", hex: "#cbd5e1" },
  { name: "Gold", hex: "#eab308" },
  { name: "Bone", hex: "#e7e5e4" },
];

type Items = Record<string, ReactNode>;

// ------------------------------------------------------------------
// 1) MEDIEVAL & FANTASY CREATURES
// ------------------------------------------------------------------
const MEDIEVAL: Items = {
  dragon: (
    <>
      <path d="M5 16c0-4 3-7 7-7l2-2 1 2 3-1-1.5 3 2 1-3 1c0 3-2 6-5.5 6" />
      <circle cx="14.5" cy="9.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M5 16c-1 1-1.5 2.5-1 4 1.5 0 3-.8 3.5-2" />
    </>
  ),
  wyvern: (
    <>
      <path d="M4 6c3 1 5 3 6 6 2-2 5-2 8 0-2 1-3 3-3 5-2-1-4-1-6 0-1-4-3-7-5-8Z" />
      <path d="M10 12 8 20l3-3" />
      <circle cx="16" cy="11" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  griffin: (
    <>
      <path d="M6 5c2 0 3 1 3 3 1-1 3-1 4 0 0 0 4-2 6 1-2 0-3 1-3 3 0 4-3 7-7 7" />
      <path d="M9 19c-2 0-3-1.5-3-3.5" />
      <circle cx="8" cy="8" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  phoenix: (
    <>
      <path d="M12 5c1.5 2 1.5 4 0 6 2-1 4-1 6 1-1.5 1-2 2.5-2 4-2-1-3-1-4 0-1-1-2-1-4 0 0-1.5-.5-3-2-4 2-2 4-2 6-1-1.5-2-1.5-4 0-6Z" />
      <path d="M12 15v5m-2-2 2 2 2-2" />
    </>
  ),
  unicorn: (
    <>
      <path d="M6 20c0-5 3-9 8-9l-1-5 3 4 3-2-2 4c1 1 1 3 0 5" />
      <path d="m13 6 2-3" />
      <circle cx="15" cy="12" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  pegasus: (
    <>
      <path d="M7 19c0-5 3-8 8-8l3-4v4c1 1 1 3 0 4" />
      <path d="M7 12c-2-1-3-3-3-5 2 1 4 2 5 4M9 11c-2 0-4-1-5-3" />
      <circle cx="16" cy="12" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  kraken: (
    <>
      <path d="M9 4a4 4 0 0 1 6 3c0 2-1 3-1 3" />
      <path d="M8 10c-1 3-3 4-5 4m7-4c-.5 4-2 6-4 7m6-7c0 4 .5 6 1 7m3-7c.5 4 2 5 4 6m-2-7c1 2 3 3 5 3" />
      <circle cx="10.5" cy="7" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="7" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  hydra: (
    <>
      <path d="M12 20c-2-3-2-6 0-8M12 20c2-3 2-6 0-8M12 12c0-2 2-3 2-6M12 12c0-2-2-3-2-6M12 12c0-1.5 0-3 0-5" />
      <circle cx="14" cy="5.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="5.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  serpent: (
    <>
      <path d="M6 18c4 0 4-4 0-4s-4-4 0-4 5-3 5-5" />
      <path d="M11 5a3 3 0 0 1 6 0c0 2-2 2-2 4" />
      <circle cx="15" cy="12" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  basilisk: (
    <>
      <path d="M4 14c0-4 4-7 9-7 2 0 4 1 5 3l2-1-1 3 2 1-3 1c-1 2-3 3-5 3" />
      <path d="M4 14c-.5 2 0 4 2 5" />
      <path d="m8 11 1-3 1 3" />
      <circle cx="15" cy="10.5" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  golem: (
    <>
      <rect x="7" y="6" width="10" height="13" rx="1.5" />
      <path d="M7 10h10M12 10v9M4 9v4m16-4v4" />
      <circle cx="9.5" cy="8" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="8" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  minotaur: (
    <>
      <path d="M6 7c0 4 2.5 7 6 7s6-3 6-7" />
      <path d="M6 7C4 6 3 4 3 4c2 0 3 .5 4 1.5M18 7c2-1 3-3 3-3-2 0-3 .5-4 1.5" />
      <path d="M9 14v4m6-4v4" />
      <circle cx="10" cy="8.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="8.5" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  cerberus: (
    <>
      <path d="M4 16c0-4 2-7 5-7M20 16c0-4-2-7-5-7M12 18c-2 0-3-3-3-6s1-3 3-3 3 0 3 3-1 6-3 6Z" />
      <circle cx="6" cy="11" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="11" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="11" cy="11" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13" cy="11" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  fairy: (
    <>
      <circle cx="12" cy="9" r="2.4" />
      <path d="M12 11v8M9 14l3 2 3-2" />
      <path d="M9 7C6 5 4 6 4 9c0 2 3 2 5 1M15 7c3-2 5-1 5 2 0 2-3 2-5 1" />
    </>
  ),
  mermaid: (
    <>
      <circle cx="12" cy="6" r="2.2" />
      <path d="M12 8c-2 1-3 3-3 6s1 4 1 6c-2-1-3-2-4-1 1-2 1-3 0-4 2 0 3-4 3-7" />
      <path d="M12 8c2 1 3 3 3 6s-1 4-1 6c2-1 3-2 4-1-1-2-1-3 0-4-2 0-3-4-3-7" />
    </>
  ),
  castle: (
    <>
      <path d="M4 20V9l2 1V7l2 1V6h2v2l2-1v2l2-1v3l2-1v11Z" />
      <path d="M10 20v-4h4v4" />
    </>
  ),
  helmet: (
    <>
      <path d="M5 11a7 7 0 0 1 14 0v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
      <path d="M12 4v15M9 11h6" />
    </>
  ),
  sword: (
    <>
      <path d="M14.5 4 20 4v5.5l-9 9-2-2Z" />
      <path d="m8 14-4 4 2 2 4-4M6.5 15.5 8.5 17.5" />
    </>
  ),
  axe: (
    <>
      <path d="M14 3c3 0 6 2 6 6 0 0-4 1-7-1" />
      <path d="M13 8 5 16l3 3 8-8" />
    </>
  ),
  dagger: (
    <>
      <path d="M12 3 10 14h4L12 3Z" />
      <path d="M8 14h8M12 14v5m-2 1h4" />
    </>
  ),
  bow: (
    <>
      <path d="M6 4a14 14 0 0 1 0 16" />
      <path d="M6 4 18 12 6 20" />
      <path d="m3 12 16 0" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4.2 2.9 7.5 7 9 4.1-1.5 7-4.8 7-9V6Z" />,
  shieldcrest: (
    <>
      <path d="M12 3 5 6v5c0 4.2 2.9 7.5 7 9 4.1-1.5 7-4.8 7-9V6Z" />
      <path d="M12 7v8m-3-4h6" />
    </>
  ),
  crown: (
    <>
      <path d="M2.5 6.5 6 16h12l3.5-9.5L16 12l-4-7.5L8 12z" />
      <path d="M6 19h12" />
    </>
  ),
  potion: (
    <>
      <path d="M10 3h4v4l3 7a4 4 0 0 1-3.6 6h-2.8A4 4 0 0 1 7 14l3-7Z" />
      <path d="M8.5 13h7" />
      <circle cx="11" cy="16" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 5a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
      <path d="M6 5a2 2 0 0 0-2 2v1h4M11 9h6M11 12h6M11 15h4" />
    </>
  ),
  torch: (
    <>
      <path d="M12 3c1 2-1 3-1 5a1.6 1.6 0 0 0 3 0c0-1 .5-1.5 .5-1.5C16 8 16 10 15 11" />
      <path d="M9 11h6l-1 3h-4Z" />
      <path d="M11 14 10 21m3-7 1 7" />
    </>
  ),
  chalice: (
    <>
      <path d="M7 4h10c0 4-2 7-5 7S7 8 7 4Z" />
      <path d="M12 11v6m-3 3h6m-3-3v0" />
    </>
  ),
  wolf: (
    <>
      <path d="M4 5l3 3h10l3-3-1 7c0 4-3 7-7 7s-7-3-7-7Z" />
      <path d="m10 12 2 1.5L14 12" />
      <circle cx="9" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  owl: (
    <>
      <path d="M6 4c0 2 1 3 1 3M18 4c0 2-1 3-1 3" />
      <rect x="5" y="7" width="14" height="13" rx="6.5" />
      <circle cx="9.5" cy="12" r="2" />
      <circle cx="14.5" cy="12" r="2" />
      <path d="m11 15 1 1.2 1-1.2" />
    </>
  ),
  raven: (
    <>
      <path d="M4 7c3-1 5 0 6 2 1-3 4-4 7-3-1 2-1 3-3 4 1 1 1 3 0 5-2 3-6 4-9 2 2-1 3-2 3-4-2 0-4-2-4-6Z" />
      <circle cx="9" cy="8.5" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  cat: (
    <>
      <path d="M5 5l2.5 3M19 5l-2.5 3" />
      <path d="M6 9a6 6 0 0 1 12 0v3a6 6 0 0 1-12 0Z" />
      <circle cx="9.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11 14h2M9 14l-2 1m10-1 2 1" />
    </>
  ),
  gem: (
    <>
      <path d="M7 4h10l4 5-9 11L3 9Z" />
      <path d="M3 9h18M8 4l-1 5 5 11 5-11-1-5" />
    </>
  ),
  banner: (
    <>
      <path d="M6 3h12v14l-6-3-6 3Z" />
      <path d="M12 7v5m-2-3h4M6 3v18" />
    </>
  ),
};

// ------------------------------------------------------------------
// 2) VAMPIRES & UNDEAD
// ------------------------------------------------------------------
const VAMPIRE: Items = {
  skull: (
    <>
      <path d="M5 10a7 7 0 0 1 14 0v4l-1.5 1.5V18a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-2.5L5 14Z" />
      <circle cx="9" cy="11" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.6" fill="currentColor" stroke="none" />
      <path d="M11 15h2" />
    </>
  ),
  fangs: (
    <>
      <path d="M5 6h14v3c0 1-1 1-1.5 2L16 9l-2 3-2-3-2 3-1.5-1C8 10 7 10 7 9Z" />
      <path d="M8.5 12.5 9 16l1-3.5M14 12.5l1 3.5 1-3.5" />
    </>
  ),
  bat: (
    <>
      <path d="M12 7c-1-2-3-3-5-3 .5 1.5 0 2.5-1 3 2 0 3 1 3 3 1-1 2-1.5 3-1.5s2 .5 3 1.5c0-2 1-3 3-3-1-.5-1.5-1.5-1-3-2 0-4 1-5 3Z" />
      <path d="M9 10c0 2 1.5 4 3 5 1.5-1 3-3 3-5" />
    </>
  ),
  ghost: (
    <>
      <path d="M6 11a6 6 0 0 1 12 0v8l-2-1.5L14 19l-2-1.5L10 19l-2-1.5L6 19Z" />
      <circle cx="10" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  coffin: (
    <>
      <path d="M8 3h8l2 6-2 12H8L6 9Z" />
      <path d="M12 8v8m-2-4h4" />
    </>
  ),
  tombstone: (
    <>
      <path d="M6 20V11a6 6 0 0 1 12 0v9Z" />
      <path d="M12 7v6m-2.5-3h5M4 20h16" />
    </>
  ),
  gravecross: (
    <>
      <path d="M11 20V8m-3 3h6" />
      <path d="M4 20c2-2 14-2 16 0" />
      <path d="M11 8V5" />
    </>
  ),
  skeletonhand: (
    <>
      <path d="M7 20v-6M10 20V9M13 20V8M16 20v-7" />
      <path d="M6 14h12v-2a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2Z" />
    </>
  ),
  scythe: (
    <>
      <path d="M18 20 8 6" />
      <path d="M8 6c-4 0-6 3-6 6 3 0 5-2 6-4" />
      <path d="m16 17 4 1" />
    </>
  ),
  blooddrop: (
    <>
      <path d="M12 3c3 5 5 7.5 5 10a5 5 0 0 1-10 0c0-2.5 2-5 5-10Z" />
      <path d="M10 13a2 2 0 0 0 1 2.5" />
    </>
  ),
  candelabra: (
    <>
      <path d="M12 20V8M8 20h8M6 9V7m0 0 1-1m-1 1-1-1M18 9V7m0 0 1-1m-1 1-1-1M12 5V3m0 0 1-1m-1 1-1-1" />
      <path d="M6 9v3M18 9v3M6 12h12" />
    </>
  ),
  cobweb: (
    <>
      <path d="M4 4 20 20" />
      <path d="M4 4c6 0 12 6 12 12M4 4c0 6 6 12 12 12" />
      <path d="M4 10c4 0 8 4 8 8M4 16c2 0 4 2 4 4" />
    </>
  ),
  crystalball: (
    <>
      <circle cx="12" cy="10" r="6" />
      <path d="M9 8a3 3 0 0 1 3-2" />
      <path d="M7 16h10l1 4H6Z" />
    </>
  ),
  cauldron: (
    <>
      <path d="M5 11h14a7 7 0 0 1-14 0Z" />
      <path d="M5 11 3 9m16 2 2-2M9 11V8c0-1 1-1 1-2m4 5V8" />
      <path d="M8 18l-1 2m8-2 1 2" />
    </>
  ),
  pentacle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 4 9 20l12-12H3l12 12Z" />
    </>
  ),
  spider: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 8.8V6m0 0 1.5-2M12 6l-1.5-2" />
      <path d="M9 10 5.5 8 4 9.5M9 12H5l-1.5 2M9.6 14.2 7 17l.5 2.5M15 10l3.5-2L20 9.5M15 12h4l1.5 2M14.4 14.2 17 17l-.5 2.5" />
    </>
  ),
  moon: (
    <>
      <path d="M15 3a8 8 0 1 0 6 12 7 7 0 0 1-6-12Z" />
      <circle cx="8" cy="9" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="10" cy="14" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  stake: (
    <>
      <path d="M12 3v14m-2-14h4" />
      <path d="M10 17h4l-2 4Z" />
    </>
  ),
  reaper: (
    <>
      <path d="M8 9a4 4 0 0 1 8 0c0 2-1 3-1 4l1 7h-2l-1-4-1 4h-2l-1-4-1 4H5l1-7c0-1-1-2-1-4" />
      <circle cx="10" cy="9" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  batwings: (
    <>
      <path d="M12 8v8" />
      <path d="M12 8C9 5 5 5 3 7c1 1 1 2 0 3 2 0 3 1 4 3 1-2 3-3 5-3M12 8c3-3 7-3 9-1-1 1-1 2 0 3-2 0-3 1-4 3-1-2-3-3-5-3" />
    </>
  ),
  bonecross: (
    <>
      <path d="M5 5c1-1 2 0 2 1s1 2 2 2 2 1 2 2-1 2-2 2-1 1-2 2-2 0-2-1 1-1 1-2-1-1-2-1 0-2 1-2 2 0 2-1-1-1-1-1Z" transform="rotate(45 12 12)" />
    </>
  ),
  zombiehand: (
    <>
      <path d="M8 21v-7m3 7V9m3 12v-9m-9 9v-5" />
      <path d="M5 16c-1-1-1-2 0-3m14 3c1-1 1-2 0-3" />
      <path d="M7 14c-.5-2 0-3 1-3" />
    </>
  ),
};

// ------------------------------------------------------------------
// 3) NORDIC RUNES (Elder Futhark + symbols)
// ------------------------------------------------------------------
const RUNES: Items = {
  fehu: <path d="M9 4v16M9 7l6-2.5M9 11l6-2.5" />,
  uruz: <path d="M8 20V5l7 4v11" />,
  thurisaz: <path d="M11 4v16M11 9l5 3-5 3" />,
  ansuz: <path d="M10 4v16M10 6l5 3M10 10l5 3" />,
  raido: <path d="M9 4v16M9 4h4a3 3 0 0 1 0 6H9M12 10l4 10" />,
  kenaz: <path d="M15 5 9 12l6 7" />,
  gebo: <path d="m7 5 10 14M17 5 7 19" />,
  wunjo: <path d="M9 4v16M9 4l7 3.5L9 11" />,
  hagalaz: <path d="M8 4v16M16 4v16M8 11l8 2" />,
  nauthiz: <path d="M12 4v16M8 14l8-4" />,
  isa: <path d="M12 4v16" />,
  jera: <path d="M9 5l4 3-4 3M15 19l-4-3 4-3" />,
  eihwaz: <path d="M12 4v16M12 6l3-2M12 18l-3 2" />,
  perthro: <path d="M16 4 10 7v10l6 3" />,
  algiz: <path d="M12 20V10M12 10 7 5M12 10l5-5" />,
  sowilo: <path d="M15 4 10 9l4 3-5 8" />,
  tiwaz: <path d="M12 20V6M8 10l4-5 4 5" />,
  berkano: <path d="M9 4v16M9 4l6 3.5L9 11M9 11l6 4-6 4" />,
  ehwaz: <path d="M8 20V5M16 20V5M8 5l4 4 4-4" />,
  mannaz: <path d="M8 20V5M16 20V5M8 5l8 6M16 5 8 11" />,
  laguz: <path d="M10 4v16M10 4l5 4" />,
  ingwaz: <path d="M12 6l4 6-4 6-4-6Z" />,
  dagaz: <path d="M7 5v14M17 5v14M7 5l10 14M7 19 17 5" />,
  othala: <path d="M12 4l5 6-5 6-5-6ZM9 14l-2 6M15 14l2 6" />,
  mjolnir: (
    <>
      <path d="M6 5h12v5a6 6 0 0 1-6 2 6 6 0 0 1-6-2Z" />
      <path d="M12 12v8m-2 0h4" />
    </>
  ),
  valknut: (
    <>
      <path d="M12 3 6 13h12Z" />
      <path d="M8 9 4 19h10Z" />
      <path d="M16 9l4 10H10Z" />
    </>
  ),
  triquetra: (
    <>
      <path d="M12 4a5 5 0 0 1 4.3 7.5A5 5 0 0 1 12 19a5 5 0 0 1-4.3-7.5A5 5 0 0 1 12 4Z" />
      <path d="M8 11a5 5 0 0 0 8 0" />
    </>
  ),
  yggdrasil: (
    <>
      <path d="M12 21V8" />
      <path d="M12 8c0-2-2-3-2-5m2 5c0-2 2-3 2-5m-2 7c-2-1-4-1-5-3m5 5c2-1 4-1 5-3" />
      <path d="M8 21c1-2 1-4 4-4s3 2 4 4" />
    </>
  ),
  longship: (
    <>
      <path d="M3 13h18l-2 4H5Z" />
      <path d="M4 13c-1-2 0-3 2-3M20 13c1-2 0-4-2-4" />
      <path d="M12 10V4m-3 2h6" />
    </>
  ),
  aegishjalmur: (
    <>
      <circle cx="12" cy="12" r="1.5" />
      <path d="M12 3v18M3 12h18M5 5l14 14M19 5 5 19" />
      <path d="M12 3l-1.5 2h3ZM12 21l-1.5-2h3ZM3 12l2-1.5v3ZM21 12l-2-1.5v3Z" />
    </>
  ),
  vegvisir: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
      <path d="M12 7l-2 2h4ZM12 17l-2-2h4ZM7 12l2-2v4ZM17 12l-2-2v4Z" />
    </>
  ),
  drinkinghorn: (
    <>
      <path d="M4 7c6 0 12 3 16 10-5 1-9 0-11-3" />
      <path d="M4 7c0 3 2 5 5 6" />
      <path d="M4 5v4m-2-2h4" />
    </>
  ),
  shieldknot: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1" transform="rotate(45 12 12)" />
      <path d="M12 6v12M6 12h12" />
    </>
  ),
  worldserpent: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5c-2 1-2 3 0 4m0 0c2 1 2 3 0 4" />
      <path d="M17 10a3 3 0 0 0-2-2" />
      <circle cx="16" cy="9" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
};

// ------------------------------------------------------------------
// 4) CYBERPUNK
// ------------------------------------------------------------------
const CYBERPUNK: Items = {
  cybereye: (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M12 3v2m0 14v2" />
    </>
  ),
  dataskull: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0v3l-1 1v3h-3v-2h-4v2H7v-3l-1-1Z" />
      <path d="M9 10h2M13 10h2M11 13h2" />
    </>
  ),
  neonkatana: (
    <>
      <path d="M20 4 7 17l-3 3 3-.5L20 6Z" />
      <path d="M7 17l-2-2m10-6 2 2" />
    </>
  ),
  hologram: (
    <>
      <path d="M5 6h14M5 18h14" />
      <path d="M9 6 7 18m8-12 2 12" />
      <path d="M8 12h8" />
    </>
  ),
  drone: (
    <>
      <rect x="9" y="10" width="6" height="4" rx="1" />
      <circle cx="5" cy="7" r="2" />
      <circle cx="19" cy="7" r="2" />
      <path d="M7 8 9 11m8-3-2 3M11 14l-2 4m4-4 2 4" />
    </>
  ),
  mech: (
    <>
      <rect x="8" y="4" width="8" height="7" rx="1.5" />
      <path d="M10 7h4M8 11l-2 3v5m12-8 2 3v5M11 11v8m2-8v8" />
    </>
  ),
  vrheadset: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="3" />
      <path d="M12 8V6M9 16l-1 2m8-2 1 2" />
      <circle cx="8" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  synthsun: (
    <>
      <path d="M12 4a6 6 0 0 1 6 6H6a6 6 0 0 1 6-6Z" />
      <path d="M4 13h16M5 16h14M7 19h10" />
    </>
  ),
  glitch: (
    <>
      <path d="M4 8h10v3H6M20 10h-8v3h6M4 15h12v3H8" />
    </>
  ),
  cyberarm: (
    <>
      <path d="M7 3v6l3 2M7 9h4" />
      <rect x="9" y="11" width="6" height="4" rx="1" />
      <path d="M12 15v3l4 3M12 18H9" />
    </>
  ),
  neuralchip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 7V4m0 16v-3m-5-5H4m16 0h-3M9 9 7 7m8 2 2-2m-8 6-2 2m8-2 2 2" />
    </>
  ),
  cityscape: (
    <>
      <path d="M3 20V11l3-2v3l3-2v4l4-3v5l4-2v3l4-2v6Z" />
      <path d="M7 14v1m4-2v1m4-1v1" />
    </>
  ),
  broadcast: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M8 8a6 6 0 0 0 0 8M16 8a6 6 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
    </>
  ),
  cyberheart: (
    <>
      <path d="M12 20S4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z" />
      <path d="M6 11h3l1-2 2 4 1-2h5" />
    </>
  ),
  barcode: (
    <>
      <path d="M4 5v14M7 5v14M9 5v10M11 5v14M14 5v10M16 5v14M18 5v14M20 5v10" />
    </>
  ),
  visor: (
    <>
      <path d="M4 9a8 8 0 0 1 16 0v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" />
      <path d="M7 11h10" />
    </>
  ),
  spraycan: (
    <>
      <rect x="8" y="8" width="7" height="12" rx="1.5" />
      <path d="M9 8V6h5v2M15 10h2M18 6l2-1m-2 3 2 0m-2 3 2 1" />
    </>
  ),
  implant: (
    <>
      <rect x="6" y="9" width="12" height="6" rx="3" />
      <path d="M9 9V6m6 3V6M9 15v3m6-3v3" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  neonskullface: (
    <>
      <path d="M7 6h10v8l-2 2v3h-6v-3l-2-2Z" />
      <path d="M10 10v2m4-2v2m-3 5h2" />
    </>
  ),
  turntable: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="m16 8-5 5" />
    </>
  ),
  antenna2: (
    <>
      <path d="M12 21v-9" />
      <path d="M8 6l4 6 4-6M6 4l6 8 6-8" />
    </>
  ),
  pill: (
    <>
      <rect x="4" y="9" width="16" height="6" rx="3" transform="rotate(-30 12 12)" />
      <path d="M9.5 7.5 14.5 16.5" />
    </>
  ),
};

// ------------------------------------------------------------------
// 5) TECHNOLOGY
// ------------------------------------------------------------------
const TECH: Items = {
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
      <path d="M10 4v3m4-3v3m-4 10v3m4-3v3M4 10h3m-3 4h3m10-4h3m-3 4h3" />
    </>
  ),
  chip2: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8m-4-4h8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="7" rx="1.5" />
      <rect x="4" y="13" width="16" height="7" rx="1.5" />
      <circle cx="8" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M12 7.5h5M12 16.5h5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18a4 4 0 0 1-.5-8A5 5 0 0 1 16 9a4 4 0 0 1 1 9Z" />
    </>
  ),
  wifi: (
    <>
      <path d="M4 9a12 12 0 0 1 16 0" />
      <path d="M7 12.5a8 8 0 0 1 10 0" />
      <path d="M9.5 15.5a4 4 0 0 1 5 0" />
      <circle cx="12" cy="18.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  satellite: (
    <>
      <path d="m4 13 4-4 3 3-4 4Z" />
      <path d="m8 9 2-2 3 3-2 2" />
      <path d="M13 10a4 4 0 0 1 1 4m2-7a7 7 0 0 1 2 7" />
      <path d="m7 16-2 3" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3 2 4.5 5 4.5 9L12 15l-4.5-3c0-4 1.5-7 4.5-9Z" />
      <circle cx="12" cy="9" r="1.4" />
      <path d="M9 15l-2 4 3-1.5M15 15l2 4-3-1.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="8" width="16" height="8" rx="2" />
      <path d="M21 11v2" />
      <path d="M7 12h6M10 9v6" />
    </>
  ),
  usb: (
    <>
      <path d="M12 21V6" />
      <path d="m9 9 3-5 3 5" />
      <path d="M12 14l4-2v-2M12 17l-4-2v-2" />
      <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
      <rect x="6.5" y="12.5" width="3" height="3" rx="0.5" />
    </>
  ),
  bluetooth: <path d="M8 7l8 10-4 3V4l4 3L8 17" />,
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M9 20h6m-3-4v4" />
      <path d="M7 8l2 2-2 2m4 0h4" />
    </>
  ),
  keyboard: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M9 13h6" />
    </>
  ),
  harddrive: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <circle cx="16" cy="12" r="1.5" />
      <path d="M6 12h5" />
    </>
  ),
  memory: (
    <>
      <rect x="3" y="7" width="18" height="8" rx="1" />
      <path d="M6 15v2m4-2v2m4-2v2m4-2v2M7 7v8m4-8v8m6-8v8" />
    </>
  ),
  bulb: (
    <>
      <path d="M9.5 18h5M10 21.5h4" />
      <path d="M12 2.5a6.5 6.5 0 0 0-4 11.6V17h8v-2.9A6.5 6.5 0 0 0 12 2.5Z" />
    </>
  ),
  solar: (
    <>
      <rect x="4" y="5" width="16" height="10" rx="1" />
      <path d="M4 9h16M4 12h16M9 5v10M14 5v10" />
      <path d="M12 15v4m-3 0h6" />
    </>
  ),
  router: (
    <>
      <rect x="4" y="13" width="16" height="6" rx="2" />
      <path d="M8 16h.01M11 16h4" />
      <path d="M8 10l-2-2m10 2 2-2M12 9V5" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V4h10v5" />
      <rect x="4" y="9" width="16" height="7" rx="1.5" />
      <rect x="7" y="14" width="10" height="6" rx="1" />
      <circle cx="17" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  radar: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 7a5 5 0 1 0 5 5" />
      <path d="M12 12 20 4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.5 4 5.7 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.7-4-9s1.4-6.5 4-9Z" />
    </>
  ),
  circuit: (
    <>
      <path d="M4 8h5l3 3h8" />
      <path d="M4 16h8l3-3" />
      <circle cx="4" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="20" cy="11" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="4" cy="16" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1.3" />
    </>
  ),
};

// ------------------------------------------------------------------
// 6) QUANTUM & SCIENCE
// ------------------------------------------------------------------
const QUANTUM: Items = {
  atom: (
    <>
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </>
  ),
  qubit: (
    <>
      <circle cx="12" cy="12" r="8" />
      <ellipse cx="12" cy="12" rx="8" ry="3" />
      <path d="M12 4 16 15" />
      <circle cx="16" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  wavefn: <path d="M2 12c2-6 4-6 5 0s3 6 5 0 3-6 5 0 2 2 3 0" />,
  entangle: (
    <>
      <circle cx="7" cy="12" r="3.5" />
      <circle cx="17" cy="12" r="3.5" />
      <path d="M10.5 12h3M8 9l8 6M8 15l8-6" />
    </>
  ),
  superposition: (
    <>
      <path d="M12 3v18" />
      <path d="M12 7c-4 0-6 2-6 5s2 5 6 5M12 7c4 0 6 2 6 5s-2 5-6 5" />
    </>
  ),
  photon: (
    <>
      <path d="M3 12c3-5 6-5 9 0s6 5 9 0" />
      <path d="m18 9 3 3-3 3" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(30 12 12)" />
      <circle cx="19" cy="9" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  blackhole: (
    <>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
      <path d="M3.5 10c3 3 14 3 17 0" />
    </>
  ),
  wormhole: (
    <>
      <ellipse cx="12" cy="7" rx="8" ry="3" />
      <path d="M4 7c0 6 3 10 8 10s8-4 8-10" />
      <ellipse cx="12" cy="7" rx="3.5" ry="1.3" />
    </>
  ),
  infinity: (
    <path d="M8 12a3 3 0 1 1 0 .01M8 12c1.5-3 6.5-3 8 0s6.5 3 8 0-6.5-3-8 0-6.5 3-8 0" transform="translate(-2)" />
  ),
  tesseract: (
    <>
      <rect x="6" y="6" width="9" height="9" />
      <rect x="9" y="9" width="9" height="9" />
      <path d="M6 6 9 9m6-3 3 3M6 15l3 3m6-3 3 3" />
    </>
  ),
  lattice: (
    <>
      <circle cx="6" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none" />
      <path d="M6 6h12M6 12h12M6 6v6m6-6v6m6-6v6" />
    </>
  ),
  spin: (
    <>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 12 12 3m0 18 0-5" />
      <path d="M9 5a8 8 0 0 0 0 14M15 19a8 8 0 0 0 0-14" />
    </>
  ),
  interference: (
    <>
      <path d="M4 4v16" />
      <path d="M4 12h3" />
      <path d="M9 7a6 6 0 0 1 0 10M13 5a9 9 0 0 1 0 14M17 7a6 6 0 0 1 0 10" />
    </>
  ),
  dna: (
    <>
      <path d="M8 3c0 5 8 5 8 10s-8 5-8 8" />
      <path d="M16 3c0 5-8 5-8 10s8 5 8 8" />
      <path d="M9 6h6M9 18h6M10.5 9h3M10.5 15h3" />
    </>
  ),
  molecule: (
    <>
      <circle cx="6" cy="8" r="2" />
      <circle cx="17" cy="7" r="2" />
      <circle cx="12" cy="16" r="2" />
      <path d="M7.5 9.5 11 14.5M15.5 8.5 13 14.5M8 8h7" />
    </>
  ),
  flask: (
    <>
      <path d="M10 3h4v6l4 8a2 2 0 0 1-2 3H8a2 2 0 0 1-2-3l4-8Z" />
      <path d="M8.5 14h7" />
    </>
  ),
  magnet: (
    <>
      <path d="M6 4v8a6 6 0 0 0 12 0V4" />
      <path d="M6 9h4V4H6m8 5h4V4h-4" />
    </>
  ),
  pendulum: (
    <>
      <path d="M4 5h16" />
      <path d="M12 5v10" />
      <circle cx="12" cy="17" r="2.5" />
      <path d="M6 5 8 11m10-6-2 6" />
    </>
  ),
  vortex: (
    <path d="M12 12a3 3 0 0 1 3-3 5 5 0 0 1-5 5 7 7 0 0 1 7-7 9 9 0 0 1-9 9" />
  ),
  fractal: (
    <>
      <path d="M12 21V3M12 15l-5-5m5 5 5-5M7 10V6m0 4H3m14 0V6m0 4h4" />
    </>
  ),
  gaussian: (
    <>
      <path d="M3 19c3 0 4-1 5-4s2-9 4-9 3 6 4 9 2 4 5 4" />
      <path d="M3 19h18" />
    </>
  ),
};

// ------------------------------------------------------------------
// 7) DEVELOPER
// ------------------------------------------------------------------
const DEVELOPER: Items = {
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="m7 10 3 2.5L7 15" />
      <path d="M12.5 15H16" />
    </>
  ),
  codetags: <path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 5l-2 14" />,
  braces: (
    <>
      <path d="M9 4c-2 0-2 3-2 4s0 3-2 3c2 0 2 2 2 4s0 4 2 4" />
      <path d="M15 4c2 0 2 3 2 4s0 3 2 3c-2 0-2 2-2 4s0 4-2 4" />
    </>
  ),
  brackets: <path d="M8 4H5v16h3M16 4h3v16h-3" />,
  gitbranch: (
    <>
      <circle cx="7" cy="6" r="2.5" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M7 8.5v7M17 10.5c0 4-4 3-7 5" />
    </>
  ),
  gitmerge: (
    <>
      <circle cx="7" cy="6" r="2.5" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="12" r="2.5" />
      <path d="M7 8.5v7M7 9c0 4 3 3 7.5 3" />
    </>
  ),
  commit: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M3 12h6M15 12h6" />
    </>
  ),
  pullrequest: (
    <>
      <circle cx="7" cy="6" r="2.5" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
      <path d="M7 8.5v7M17 15.5V10l-3-3m0 0h3m-3 0v3" />
    </>
  ),
  bug: (
    <>
      <rect x="8" y="8" width="8" height="10" rx="4" />
      <path d="M8 11H4m16 0h-4M8 15H4m16 0h-4M9 8l-1.5-2M15 8l1.5-2M12 6V4" />
    </>
  ),
  function: <path d="M14 4h-1a3 3 0 0 0-3 3L8 17a3 3 0 0 1-3 3H4M6 10h8" />,
  semicolon: (
    <>
      <circle cx="10" cy="9" r="1.3" fill="currentColor" stroke="none" />
      <path d="M14 8a1.3 1.3 0 1 1 0 2.5M14 14c1 1 .5 2.5-1 3.5" />
      <circle cx="14" cy="9.2" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  stack: (
    <>
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  container: (
    <>
      <rect x="3" y="8" width="18" height="11" rx="1.5" />
      <path d="M7 8V5h10v3M7 12v4m4-4v4m4-4v4" />
    </>
  ),
  api: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M7 10v4m0-2h2m0-2v4M13 10v4m0-2h2m0 0 0-2m0 4M18 10v4" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 8h12v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
      <path d="M17 9h2a2 2 0 0 1 0 4h-2" />
      <path d="M8 4c-.5 1 .5 1.5 0 3M12 4c-.5 1 .5 1.5 0 3" />
    </>
  ),
  rubberduck: (
    <>
      <path d="M8 8a4 4 0 0 1 8 0c2 0 4 0 4 1l-3 1c0 3-2 6-6 6a6 6 0 0 1-6-6c0-2 2-3 3-3Z" />
      <path d="M4 11h3" />
      <circle cx="10" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  regex: (
    <>
      <path d="M12 4v8m-4-6 8 4m-8 0 8-4" />
      <circle cx="6" cy="18" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  lambda: <path d="M6 20 13 5l5 15M10 12l-1-3" />,
  binary: (
    <>
      <path d="M8 4v7M6 4h2m-2 7h4" />
      <rect x="13" y="4" width="4" height="7" rx="2" />
      <rect x="7" y="13" width="4" height="7" rx="2" />
      <path d="M17 13v7m-2 0h4m-4-7h2" />
    </>
  ),
  hashtag: <path d="M9 3 7 21m10-18-2 18M4 8.5h16M3.5 15.5h16" />,
  cursor: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10v4m-1-4h2m-2 4h2M12 14h4" />
    </>
  ),
  database2: (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v13c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5v-13" />
      <path d="M5 12c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5" />
    </>
  ),
  pointer: (
    <>
      <path d="M6 4l5 15 2-6 6-2Z" />
    </>
  ),
  nullset: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m6 6 12 12" />
    </>
  ),
  tabspace: (
    <>
      <path d="M4 8v8M20 8v8M4 12h12m0 0-3-3m3 3-3 3" />
    </>
  ),
  deploy: (
    <>
      <path d="M12 3v12m-4-4 4 4 4-4" />
      <path d="M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" />
    </>
  ),
  keyboard2: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M9 13h6" />
    </>
  ),
};

// ------------------------------------------------------------------
// Category registry
// ------------------------------------------------------------------
export type AvatarCategory = { id: string; name: string; tabIcon: string; items: Items };

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  { id: "medieval", name: "Medieval & Fantasy", tabIcon: "crown", items: MEDIEVAL },
  { id: "vampire", name: "Vampires & Undead", tabIcon: "skull", items: VAMPIRE },
  { id: "runes", name: "Nordic Runes", tabIcon: "hexagon", items: RUNES },
  { id: "cyberpunk", name: "Cyberpunk", tabIcon: "network", items: CYBERPUNK },
  { id: "tech", name: "Technology", tabIcon: "terminal", items: TECH },
  { id: "quantum", name: "Quantum & Science", tabIcon: "radar", items: QUANTUM },
  { id: "developer", name: "Developer", tabIcon: "terminal", items: DEVELOPER },
];

// flat merged map (keys are unique across categories)
export const AVATAR_ICONS: Items = AVATAR_CATEGORIES.reduce<Items>((acc, cat) => {
  for (const [k, v] of Object.entries(cat.items)) acc[k] = v;
  return acc;
}, {});

export const AVATAR_ICON_KEYS = Object.keys(AVATAR_ICONS);

// avatar value encoding: "ic:<key>:<hex>"
export function encodeIconAvatar(key: string, hex: string): string {
  return `ic:${key}:${hex}`;
}
export function parseIconAvatar(v?: string): { key: string; hex: string } | null {
  if (!v || !v.startsWith("ic:")) return null;
  const [, key, hex] = v.split(":");
  if (!key || !AVATAR_ICONS[key]) return null;
  return { key, hex: hex || "#ff6a2b" };
}
