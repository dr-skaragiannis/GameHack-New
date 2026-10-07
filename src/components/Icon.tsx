type Props = { name: string; className?: string; size?: number };

const paths: Record<string, string> = {
  terminal:
    "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 3 4 3-4 3m6 0h6",
  flag: "M4 21V4m0 0h10l-2 4 2 4H4",
  radar: "M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0 M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0 M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0 M12 3v2 M21 12h-2",
  scan: "M4 7V4h3 M17 4h3v3 M20 17v3h-3 M7 20H4v-3 M7 12h10",
  hammer: "M14 4 20 10 M4 20l8-8 M15 5l4 4-3 3-4-4z",
  database: "M12 4c4 0 8 1.5 8 3.5S16 11 12 11 4 9.5 4 7.5 8 4 12 4z M4 7.5v9C4 18.5 8 20 12 20s8-1.5 8-3.5v-9",
  crown: "M3 18h18l-2-10-5 4-4-7-4 7-5-4z",
  check: "M5 12l5 5L20 7",
  bulb: "M9 18h6 M10 21h4 M12 3a5 5 0 0 1 3 9c-.5.5-1 1.2-1 2H10c0-.8-.5-1.5-1-2A5 5 0 0 1 12 3z",
  medal: "M8 4h8l-1 5a5 5 0 1 1-6 0z M12 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  lock: "M8 11V8a4 4 0 1 1 8 0v3 M6 11h12v9H6z",
  key: "M8 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M10 12h11l-2 2 2 2",
  folder: "M3 7h6l2 2h10v10H3z",
  wifi: "M5 12a9 9 0 0 1 14 0 M8.5 15a5 5 0 0 1 7 0 M12 19h.01",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c2.5 3 2.5 15 0 18 M12 3c-2.5 3-2.5 15 0 18",
  git: "M5 6v12 M5 6h8a3 3 0 0 1 0 6H5 M13 12h3a3 3 0 0 1 0 6H5",
  share: "M8 12h8 M16 12l3-4 M16 12l3 4 M5 6v12",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20a8 8 0 0 1 16 0",
  users: "M16 13a4 4 0 1 0-2-7 M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 20a6 6 0 0 1 12 0 M14 20a6 6 0 0 1 8-5",
  mail: "M4 6h16v12H4z M4 6l8 7 8-7",
  ticket: "M4 8a2 2 0 0 1 0-4h16v4a2 2 0 0 0 0 4v4H4a2 2 0 0 1 0-4 2 2 0 0 0 0-4z",
  map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15",
  home: "M4 12 12 4l8 8 M6 10.5V20h12v-9.5",
  logout: "M10 17l-5-5 5-5 M5 12h12 M16 5h3v14h-3",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
  book: "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z M8 7h8",
  chart: "M4 20h16 M7 16V10 M12 16V6 M17 16v-4",
  skull:
    "M12 3c4.5 0 8 3 8 7 0 3-1.5 5-3 6v3H7v-3c-1.5-1-3-3-3-6 0-4 3.5-7 8-7z M9 11h.01 M15 11h.01 M9 16c1 .8 2 .8 3 .8s2 0 3-.8",
  ghost: "M6 10a6 6 0 1 1 12 0v9l-3-2-3 2-3-2-3 2z M9 10h.01 M15 10h.01",
  dragon: "M4 16c2-6 6-10 12-10 0 0 2 3 0 6 M8 14c2 0 3 2 3 2 M16 8l4-3",
  bug: "M8 9h8v6H8z M7 7l2 2 M17 7l-2 2 M7 17l2-2 M17 17l-2-2 M12 9V6",
  shield: "M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z",
  wolf: "M4 10 8 6l4 2 4-2 4 4-2 4-6 6-6-6z",
  owl: "M12 4a7 7 0 0 1 7 8v6H5v-6a7 7 0 0 1 7-8z M8 12h.01 M16 12h.01 M9 16h6",
  raven: "M4 16c4-10 14-10 16-4-4 1-6 4-6 4s6 1 6 4H4c0-2 2-4 4-4S6 12 4 16z",
  phoenix: "M12 20c0-6 6-8 8-12-4 1-6 3-8 3S8 9 4 8c2 4 8 6 8 12z",
  atom: "M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0 M12 12c5-4 8-4 8 0s-3 4-8 0-8 4-8 0 3-4 8 0z",
  cpu: "M8 8h8v8H8z M12 2v3 M12 19v3 M2 12h3 M19 12h3",
  qubit: "M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z M4 8l16 8 M4 16l16-8",
  cybereye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0",
  wyvern: "M3 17c5-9 13-9 18-2-5-1-8 2-9 2s-4-3-9 0z M11 10l1-6 3 4",
  volume: "M5 10v4h3l4 4V6L8 10H5z M16 9a4 4 0 0 1 0 6",
  mute: "M5 10v4h3l4 4V6L8 10H5z M17 9l5 6 M22 9l-5 6",
  chevron: "M9 6l6 6-6 6",
  close: "M6 6l12 12 M18 6 6 18",
  maximize: "M8 3H3v5 M3 3l7 7 M16 3h5v5 M21 3l-7 7 M3 16v5h5 M3 21l7-7 M21 16v5h-5 M21 21l-7-7",
  minimize: "M8 3v5H3 M3 3l7 7 M16 3v5h5 M21 3l-7 7 M3 16h5v5 M3 21l7-7 M21 16h-5v5 M21 21l-7-7",
  plus: "M12 5v14 M5 12h14",
  spark: "M12 2v6 M12 16v6 M4 12h6 M14 12h6 M6 6l4 4 M14 14l4 4 M18 6l-4 4 M10 14l-4 4",
  target: "M12 12m-8 0a8 8 0 1 0 16 0 8 8 0 1 0-16 0 M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0 M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0",
  download: "M12 3v12 M7 10l5 5 5-5 M4 21h16",
  warning: "M12 3 22 20H2L12 3z M12 9v5 M12 17h.01",
  "file-text": "M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6",
  "hard-drive": "M4 6h16v12H4z M4 10h16 M8 15h.01 M12 15h.01 M16 15h.01",
  layers: "m12 3 9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 16l9 5 9-5",
};

export const MODULE_ICON: Record<string, string> = {
  "linux-basics": "terminal",
  files: "folder",
  permissions: "lock",
  networking: "wifi",
  recon: "radar",
  scanning: "scan",
  bruteforce: "key",
  sqli: "database",
  privesc: "crown",
  "raven-recon": "radar",
  "raven-foothold": "key",
  "raven-web": "globe",
  "raven-root": "crown",
  "ssh-keys": "key",
  "ssh-hop": "git",
  "ssh-tunnel": "share",
  "sr-intro": "terminal",
  "sr-help": "book",
  "sr-search": "scan",
  "sr-files": "folder",
  "sr-text": "book",
  "sr-apt": "download",
  "sr-perms": "lock",
  "sr-net": "wifi",
  "sr-proc": "cpu",
  "sr-env": "settings",
  "sr-bash": "terminal",
  "sr-cron": "settings",
  "sr-svc": "globe",
  "dfir-intake": "shield",
  "dfir-windows": "settings",
  "dfir-documents": "file-text",
  "dfir-web": "globe",
  "dfir-network": "share",
  "dfir-disk": "hard-drive",
  "dfir-malware": "bug",
  "dfir-memory": "cpu",
  "dfir-container": "layers",
  "dfir-passwords": "key",
};

export default function Icon({ name, className = "w-5 h-5", size }: Props) {
  const d = paths[name] || paths.spark;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
