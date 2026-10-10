export const AVATAR_COLORS = ["#f97316", "#eab308", "#a3e635", "#2dd4bf", "#818cf8", "#e879f9", "#fb7185", "#f8fafc"];

export const AVATAR_COLOR = AVATAR_COLORS[0];

export const AVATAR_CATEGORIES: { id: string; labelKey: string; icons: string[] }[] = [
  {
    id: "cyberpunk",
    labelKey: "avatarCatCyberpunk",
    icons: ["cybereye", "cpu", "qubit", "atom", "radar", "terminal", "scan", "wifi", "chip", "drone", "visor", "circuit", "satellite", "hologram", "neural"],
  },
  {
    id: "vampire",
    labelKey: "avatarCatVampire",
    icons: ["vampire", "skull", "bat", "ghost", "raven", "wolf", "fang", "coffin", "moon", "rose", "cloak", "chalice", "spider", "candle", "blooddrop"],
  },
  {
    id: "nordic",
    labelKey: "avatarCatNordic",
    icons: ["rune", "hammer", "shield", "owl", "crown", "wolf", "axe", "longship", "helmet", "knot", "spear", "horn", "mountain", "compass", "ygg"],
  },
  {
    id: "fantasy",
    labelKey: "avatarCatFantasy",
    icons: ["dragon", "phoenix", "wyvern", "wand", "crown", "spark", "sword", "castle", "potion", "crystal", "unicorn", "wizard", "griffon", "portal", "scroll"],
  },
  {
    id: "cute",
    labelKey: "avatarCatCute",
    icons: ["cat", "ghost", "owl", "spark", "bulb", "bug", "bunny", "fox", "panda", "star", "heart", "mushroom", "penguin", "frog", "cloud"],
  },
  {
    id: "halloween",
    labelKey: "avatarCatHalloween",
    icons: ["pumpkin", "bat", "vampire", "skull", "ghost", "raven", "witch", "cauldron", "spider", "candle", "moon", "coffin", "candy", "zombie", "web"],
  },
];

export const AVATAR_ICONS = [...new Set(AVATAR_CATEGORIES.flatMap((category) => category.icons))];
