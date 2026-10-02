import type { SVGProps } from "react";

// Themed line icons (stroke = currentColor) that match the dark "forged iron"
// terminal aesthetic. Keyed by name so data can reference them as strings.
const PATHS: Record<string, React.ReactNode> = {
  // ---- module icons ----
  terminal: (
    <>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="m6.5 9 3 3-3 3" />
      <path d="M12.5 15h4" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 10h18" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4.5" />
      <path d="m11.2 11.2 8 8" />
      <path d="m16 16 2.4-2.4" />
      <path d="m18.6 18.6 2-2" />
    </>
  ),
  network: (
    <>
      <circle cx="5" cy="5" r="2.2" />
      <circle cx="19" cy="5" r="2.2" />
      <circle cx="12" cy="19" r="2.2" />
      <path d="M6.7 6.5 11 17M17.3 6.5 13 17M6.6 5h10.8" />
    </>
  ),
  radar: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 7a5 5 0 1 0 5 5" />
      <path d="M12 12 20 4" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  scan: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
    </>
  ),
  hammer: (
    <>
      <path d="m13.5 10.5-9 9a2.1 2.1 0 0 1-3-3l9-9" />
      <path d="M10.5 7.5 16 2l6 6-5.5 5.5z" />
      <path d="m14 6 4 4" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  crown: (
    <>
      <path d="M2.5 6.5 6 16h12l3.5-9.5L16 12l-4-7.5L8 12z" />
      <path d="M6 19.5h12" />
    </>
  ),

  // ---- UI icons ----
  bulb: (
    <>
      <path d="M9.5 18h5" />
      <path d="M10 21.5h4" />
      <path d="M12 2.5a6.5 6.5 0 0 0-4 11.6V17h8v-2.9A6.5 6.5 0 0 0 12 2.5Z" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21.5V3" />
      <path d="M5 4h13l-2.2 4L18 12H5" />
    </>
  ),
  sword: (
    <>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="m13 19 6-6" />
      <path d="m16 16 4.5 4.5" />
      <path d="m19.5 21 2-2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  ban: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </>
  ),
  medal: (
    <>
      <path d="M8 2 6 7l4 2 2-4-2-3zM16 2l2 5-4 2-2-4 2-3z" />
      <circle cx="12" cy="15" r="6" />
      <path d="M12 12.5 13 15h-2z" fill="currentColor" stroke="none" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M7 21h10" />
      <path d="M5 6h14" />
      <path d="m5 6-3 6a3 3 0 0 0 6 0Z" />
      <path d="m19 6-3 6a3 3 0 0 0 6 0Z" />
    </>
  ),
  flame: (
    <path d="M12 2.5c1 3-2 4.5-2 7a2 2 0 0 0 4 0c0-.6-.2-1.1-.4-1.6C15.5 9 17 11 17 14a5 5 0 0 1-10 0c0-3.5 3-5.5 5-11.5Z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.5 4 5.7 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.7-4-9s1.4-6.5 4-9Z" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
};

// map module ids -> icon names
export const MODULE_ICON: Record<string, string> = {
  "linux-basics": "terminal",
  files: "folder",
  permissions: "key",
  networking: "network",
  recon: "radar",
  scanning: "scan",
  bruteforce: "hammer",
  sqli: "database",
  privesc: "crown",
  // SSH Penetration Testing campaign
  "ssh-setup": "terminal",
  "ssh-recon": "radar",
  "ssh-creds": "hammer",
  "ssh-access": "terminal",
  "ssh-metasploit": "scan",
  "ssh-keys": "key",
  "ssh-exfil": "folder",
  "ssh-tunnel": "network",
  "ssh-harden": "lock",
};

export default function Icon({
  name,
  className,
  ...props
}: { name: string; className?: string } & SVGProps<SVGSVGElement>) {
  const content = PATHS[name] ?? PATHS.terminal;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {content}
    </svg>
  );
}
