import type { Module } from "./lessons";
import { usedCmd } from "../lib/terminal";

const lab = "sudorun" as const;
const shot = (cmd: string, lines: string[]) => ({ cmd, lines });

export const SUDO_RUN_MODULES_B: Module[] = [
  {
    id: "sr-apt",
    order: 6,
    icon: "download",
    color: "from-orange-400 to-red-800",
    difficulty: 2,
    scenario: lab,
    title: { en: "Installing & removing software", el: "Εγκατάσταση & αφαίρεση λογισμικού" },
    subtitle: { en: "apt-cache, apt-get, sources.list", el: "apt-cache, apt-get, sources.list" },
    badge: { en: "Packager", el: "Συσκευαστής" },
    theory: [
      {
        heading: { en: "apt and repositories", el: "apt και αποθετήρια" },
        body: {
          en: "Debian-family distros (Kali is one) use APT — Advanced Packaging Tool. Think of a repository as the app store: you search it, install from it, remove from it. Do this in the lab; do not blindly add random repos on a real box.",
          el: "Debian/Kali: APT. Το repository είναι το app store.",
        },
      },
      {
        heading: { en: "Search", el: "Αναζήτηση" },
        body: {
          en: "apt-cache search hydra   (Hydra is a login-cracking tool — we only search the package name here.)",
          el: "apt-cache search hydra",
        },
        shots: [shot("apt-cache search hydra", ["hydra - very fast network logon cracker", "libhydra - hydra library (lab)", "qhydra - qt frontend"])],
      },
      {
        heading: { en: "Install, remove, purge", el: "Install, remove, purge" },
        body: {
          en: "apt-get install git   pulls git (useful to clone GitHub repos later). apt-get remove git   removes the package but may leave config. apt-get purge git   wipes residual files too. The sandbox stops remove and purge before changing package state, so you can practise the command syntax safely.",
          el: "install / remove / purge. Εδώ το remove/purge κάνουν Abort όπως το 'press n' του οδηγού.",
        },
        shots: [
          shot("apt-get install git", ["The following NEW packages will be installed:", "  git", "Setting up git (lab) ..."]),
          shot("apt-get remove git", ["The following packages will be REMOVED:", "  git", "Do you want to continue? [Y/n] n", "Abort."]),
        ],
      },
      {
        heading: { en: "update vs upgrade", el: "update vs upgrade" },
        body: {
          en: "apt-get update   refreshes the list of available packages (downloads index, does not install). apt-get upgrade   applies those updates. Upgrade can take a while on a real machine.",
          el: "update = ευρετήριο. upgrade = εγκατάσταση ενημερώσεων.",
        },
        shots: [
          shot("apt-get update", ["Hit:1 http://http.kali.org/kali kali-rolling InRelease", "Reading package lists... Done"]),
          shot("apt-get upgrade", ["Calculating upgrade... Done", "0 upgraded, 0 newly installed, 0 to remove."]),
        ],
      },
      {
        heading: { en: "sources.list", el: "sources.list" },
        body: {
          en: "The servers that hold packages are listed in /etc/apt/sources.list. nano /etc/apt/sources.list to read it. Do NOT add experimental repos — they can break a box. Highlighted in a real Kali is the kali-rolling line.",
          el: "nano /etc/apt/sources.list — μην προσθέτεις experimental repos.",
        },
        shots: [shot("nano /etc/apt/sources.list", ["deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware", "# HackForge lab — do not add experimental repos."])],
      },
    ],
    cheats: [
      { cmd: "apt-cache search hydra", desc: { en: "search repo", el: "αναζήτηση" } },
      { cmd: "apt-get install git", desc: { en: "install", el: "εγκατάσταση" } },
      { cmd: "apt-get remove git", desc: { en: "remove", el: "αφαίρεση" } },
      { cmd: "apt-get purge git", desc: { en: "remove + configs", el: "πλήρης αφαίρεση" } },
      { cmd: "apt-get update", desc: { en: "refresh index", el: "ανανέωση ευρετηρίου" } },
      { cmd: "apt-get upgrade", desc: { en: "apply updates", el: "εφαρμογή" } },
      { cmd: "nano /etc/apt/sources.list", desc: { en: "repo list", el: "λίστα repos" } },
    ],
    tasks: [
      { id: "search", instruction: { en: "apt-cache search hydra", el: "apt-cache search hydra" }, hint: { en: "apt-cache search hydra", el: "apt-cache search hydra" }, explain: { en: "Search before you install.", el: "Ψάξε πριν εγκαταστήσεις." }, check: (t) => t.flags.has("apt-search") },
      { id: "install", instruction: { en: "apt-get install git", el: "apt-get install git" }, hint: { en: "apt-get install git", el: "apt-get install git" }, explain: { en: "Install from the repo.", el: "Εγκατάσταση από το repo." }, check: (t) => t.flags.has("apt-install") },
      { id: "remove", instruction: { en: "apt-get remove git  (sandbox aborts like pressing n)", el: "apt-get remove git" }, hint: { en: "apt-get remove git", el: "apt-get remove git" }, explain: { en: "The sandbox stops before removing the package.", el: "Το sandbox σταματά πριν αφαιρέσει το πακέτο." }, check: (t) => t.flags.has("apt-remove") },
      { id: "purge", instruction: { en: "apt-get purge git", el: "apt-get purge git" }, hint: { en: "apt-get purge git", el: "apt-get purge git" }, explain: { en: "Purge leftover configs.", el: "Καθαρίζει configs." }, check: (t) => t.flags.has("apt-purge") },
      { id: "update", instruction: { en: "apt-get update", el: "apt-get update" }, hint: { en: "apt-get update", el: "apt-get update" }, explain: { en: "Refresh package lists.", el: "Ανανέωση λιστών." }, check: (t) => t.flags.has("apt-update") },
      { id: "upgrade", instruction: { en: "apt-get upgrade", el: "apt-get upgrade" }, hint: { en: "apt-get upgrade", el: "apt-get upgrade" }, explain: { en: "Apply the index from update.", el: "Εφαρμογή του update." }, check: (t) => t.flags.has("apt-upgrade") },
      { id: "src", instruction: { en: "nano /etc/apt/sources.list", el: "nano /etc/apt/sources.list" }, hint: { en: "nano /etc/apt/sources.list", el: "nano /etc/apt/sources.list" }, explain: { en: "See which repo Kali uses.", el: "Δες το repo." }, check: (t) => t.flags.has("nano-sources") || t.flags.has("read-sources") || usedCmd(t, /sources\.list/) },
    ],
    challenges: [
      {
        title: { en: "Read sources without nano", el: "Διάβασε χωρίς nano" },
        brief: { en: "cat /etc/apt/sources.list", el: "cat /etc/apt/sources.list" },
        success: { en: "Same file, different tool.", el: "Ίδιο αρχείο." },
        check: (t) => t.filesRead.some((p) => p.includes("sources.list")) || t.flags.has("nano-sources"),
      },
      {
        title: { en: "Search then install", el: "Ψάξε μετά εγκατέστησε" },
        brief: { en: "You already searched hydra and installed git — that is the full loop.", el: "Search + install = πλήρης βρόχος." },
        success: { en: "Repo workflow complete.", el: "Ροή repo OK." },
        check: (t) => t.flags.has("apt-search") && t.flags.has("apt-install"),
      },
    ],
  },
  {
    id: "sr-perms",
    order: 7,
    icon: "lock",
    color: "from-violet-400 to-purple-900",
    difficulty: 3,
    scenario: lab,
    title: { en: "Playing with permissions", el: "Δικαιώματα" },
    subtitle: { en: "ls -l, chown, chgrp, chmod, SUID, SGID", el: "ls -l, chown, chgrp, chmod, SUID, SGID" },
    badge: { en: "Mode Bender", el: "Λυγιστής mode" },
    theory: [
      {
        heading: { en: "Users, groups, rwx", el: "Χρήστες, ομάδες, rwx" },
        body: {
          en: "Root can do anything. Other users are limited and often collected into groups (developers, admins…). Every file has three permission triples: owner, group, others. r = open/view, w = edit, x = execute (x does not imply you can read). ls -l shows: type (- file, d directory), rwxrwxrwx, links, owner, group, size, mtime, name.",
          el: "r ανάγνωση, w εγγραφή, x εκτέλεση. ls -l δείχνει τα πάντα.",
        },
        shots: [shot("ls -l hackforge.txt", ["-rw-r--r-- 1 root root  142 hackforge.txt"])],
      },
      {
        heading: { en: "chown and chgrp", el: "chown και chgrp" },
        body: {
          en: "chown USER FILE changes the owner. chown Raj hackforge.txt  (Raj is a lab user). chgrp GROUP FILE changes the group. chgrp ignite hackforge.txt  so only the ignite team owns it as a group.",
          el: "chown Raj hackforge.txt και chgrp ignite hackforge.txt",
        },
        shots: [
          shot("chown Raj hackforge.txt", [""]),
          shot("chgrp ignite hackforge.txt", [""]),
          shot("ls -l hackforge.txt", ["-rw-r--r-- 1 Raj ignite  142 hackforge.txt"]),
        ],
      },
      {
        heading: { en: "chmod numeric table", el: "Πίνακας chmod" },
        body: {
          en: "0 ---  ·  1 --x  ·  2 -w-  ·  3 -wx  ·  4 r--  ·  5 r-x  ·  6 rw-  ·  7 rwx. chmod 777 FILE gives everyone everything. chmod 111 FILE is execute-only. Symbolic: chmod +x hackforge.txt makes it executable (often shown in a different colour on a real TTY).",
          el: "chmod 777 όλα. chmod +x εκτελέσιμο.",
        },
        shots: [shot("chmod +x hackforge.txt", ["-rwxr--r-- 1 Raj ignite  142 hackforge.txt"])],
      },
      {
        heading: { en: "SUID and SGID", el: "SUID και SGID" },
        body: {
          en: "SUID: any user executing the file runs it with the OWNER's permissions, only for that file. Set by prefixing 4: chmod 4644 hackforge.txt (regular 644 + SUID). SGID: same idea for the owner's GROUP, prefix 2: chmod 2466 hackforge.txt. These bits are famous privilege-escalation findings — understand them so you can remove them as a defender.",
          el: "SUID = 4xxx (δικαιώματα ιδιοκτήτη). SGID = 2xxx (ομάδας).",
        },
        shots: [
          shot("chmod 4644 hackforge.txt", ["-rw-r--r-- with SUID bit set (rws / 4644)"]),
          shot("chmod 2466 hackforge.txt", ["SGID set (2466)"]),
        ],
      },
    ],
    cheats: [
      { cmd: "ls -l FILE", desc: { en: "long listing", el: "αναλυτικά" } },
      { cmd: "chown Raj hackforge.txt", desc: { en: "change owner", el: "ιδιοκτήτης" } },
      { cmd: "chgrp ignite hackforge.txt", desc: { en: "change group", el: "ομάδα" } },
      { cmd: "chmod +x FILE", desc: { en: "add execute", el: "+x" } },
      { cmd: "chmod 4644 FILE", desc: { en: "SUID + 644", el: "SUID" } },
      { cmd: "chmod 2466 FILE", desc: { en: "SGID + 466", el: "SGID" } },
    ],
    tasks: [
      { id: "lsl", instruction: { en: "ls -l hackforge.txt", el: "ls -l hackforge.txt" }, hint: { en: "ls -l /root/hackforge.txt", el: "ls -l" }, explain: { en: "Read the owner/group columns.", el: "Δες ιδιοκτήτη/ομάδα." }, check: (t) => t.flags.has("ls-l") || usedCmd(t, /ls\s+-l/) },
      { id: "chown", instruction: { en: "chown Raj hackforge.txt", el: "chown Raj hackforge.txt" }, hint: { en: "chown Raj hackforge.txt", el: "chown Raj hackforge.txt" }, explain: { en: "Owner becomes Raj.", el: "Ιδιοκτήτης ο Raj." }, check: (t) => t.flags.has("chown-raj") || usedCmd(t, /chown\s+Raj/) },
      { id: "chgrp", instruction: { en: "chgrp ignite hackforge.txt", el: "chgrp ignite hackforge.txt" }, hint: { en: "chgrp ignite hackforge.txt", el: "chgrp ignite hackforge.txt" }, explain: { en: "Group becomes ignite.", el: "Ομάδα ignite." }, check: (t) => t.flags.has("chgrp-ignite") || usedCmd(t, /chgrp\s+ignite/) },
      { id: "plusx", instruction: { en: "chmod +x hackforge.txt", el: "chmod +x hackforge.txt" }, hint: { en: "chmod +x hackforge.txt", el: "chmod +x hackforge.txt" }, explain: { en: "Execute bit for the owner.", el: "Bit εκτέλεσης." }, check: (t) => t.flags.has("chmod-x") || usedCmd(t, /chmod\s+\+x/) },
      { id: "suid", instruction: { en: "chmod 4644 hackforge.txt", el: "chmod 4644 hackforge.txt" }, hint: { en: "chmod 4644 hackforge.txt", el: "chmod 4644" }, explain: { en: "4 prefix = SUID.", el: "4 = SUID." }, check: (t) => t.flags.has("suid") || usedCmd(t, /chmod\s+4644/) },
      { id: "sgid", instruction: { en: "chmod 2466 hackforge.txt", el: "chmod 2466 hackforge.txt" }, hint: { en: "chmod 2466 hackforge.txt", el: "chmod 2466" }, explain: { en: "2 prefix = SGID.", el: "2 = SGID." }, check: (t) => t.flags.has("sgid") || usedCmd(t, /chmod\s+2466/) },
    ],
    challenges: [
      {
        title: { en: "Verify with ls -l", el: "Επιβεβαίωση ls -l" },
        brief: { en: "ls -l hackforge.txt after the chown/chmod chain.", el: "ls -l μετά τις αλλαγές." },
        success: { en: "You can read the mode string.", el: "Διαβάζεις το mode." },
        check: (t) => t.flags.has("ls-l"),
      },
      {
        title: { en: "Know the table", el: "Ξέρε τον πίνακα" },
        brief: { en: "chmod 755 on any file you created (e.g. hackforge-2.txt if it still exists, or touch one).", el: "chmod 755 σε ένα αρχείο." },
        success: { en: "755 = rwxr-xr-x — classic executable.", el: "755 = rwxr-xr-x." },
        check: (t) => usedCmd(t, /chmod\s+755/) || t.flags.has("chmod"),
      },
    ],
  },
  {
    id: "sr-net",
    order: 8,
    icon: "wifi",
    color: "from-cyan-400 to-blue-900",
    difficulty: 3,
    scenario: lab,
    title: { en: "Managing networks", el: "Διαχείριση δικτύων" },
    subtitle: { en: "ifconfig, iwconfig, DHCP, dig, DNS, hosts", el: "ifconfig, iwconfig, DHCP, dig, DNS, hosts" },
    badge: { en: "Net Rider", el: "Αναβάτης δικτύου" },
    theory: [
      {
        heading: { en: "ifconfig", el: "ifconfig" },
        body: {
          en: "ifconfig shows active interfaces. You should see eth0 (your NIC) and lo (loopback, always 127.0.0.1) with IP, netmask, broadcast, MAC.",
          el: "ifconfig: eth0 και lo (127.0.0.1).",
        },
        shots: [shot("ifconfig", ["eth0: flags=4163<UP,BROADCAST,RUNNING> mtu 1500", "        inet 10.10.10.2  netmask 255.255.255.0  broadcast 10.10.10.255", "        ether 08:00:27:12:34:56", "lo: flags=73<UP,LOOPBACK,RUNNING>", "        inet 127.0.0.1  netmask 255.0.0.0"])],
      },
      {
        heading: { en: "iwconfig", el: "iwconfig" },
        body: {
          en: "iwconfig talks to wireless adapters (SSID, mode, MAC…). No wifi in this lab? You still run it — output shows 'no wireless extensions' on eth0/lo.",
          el: "iwconfig για ασύρματα. Εδώ: no wireless extensions.",
        },
        shots: [shot("iwconfig", ["lo        no wireless extensions.", "eth0      no wireless extensions.", "wlan0     IEEE 802.11  ESSID:off/any"])],
      },
      {
        heading: { en: "Change IP", el: "Αλλαγή IP" },
        body: {
          en: "ifconfig eth0 10.10.10.13   assigns that address. Run ifconfig again to see it.",
          el: "ifconfig eth0 10.10.10.13",
        },
        shots: [shot("ifconfig eth0 10.10.10.13", ["eth0 inet 10.10.10.13"])],
      },
      {
        heading: { en: "Spoof MAC (lab only)", el: "Spoof MAC (μόνο lab)" },
        body: {
          en: "A MAC address identifies an interface on its local link; it is not reliable proof of a person's identity. In an authorized lab, the locally administered test value 02:00:00:00:00:13 can be set with ifconfig eth0 down, ifconfig eth0 hw ether 02:00:00:00:00:13, then ifconfig eth0 up. This simulator changes only the fictional interface; never use a MAC change to bypass access controls.",
          el: "Η MAC χαρακτηρίζει διεπαφή στο τοπικό δίκτυο· δεν αποδεικνύει την ταυτότητα ανθρώπου. Σε εξουσιοδοτημένο εργαστήριο μπορείς να ορίσεις τη δοκιμαστική, τοπικά διαχειριζόμενη τιμή 02:00:00:00:00:13 με τη σειρά ifconfig eth0 down, ifconfig eth0 hw ether 02:00:00:00:00:13 και ifconfig eth0 up. Ο προσομοιωτής αλλάζει μόνο την εικονική διεπαφή· μην χρησιμοποιείς αλλαγή MAC για παράκαμψη ελέγχων πρόσβασης."
        },
        shots: [
          shot("ifconfig eth0 down", [""]),
          shot("ifconfig eth0 hw ether 02:00:00:00:00:13", ["ether 02:00:00:00:00:13"]),
          shot("ifconfig eth0 up", [""]),
        ],
      },
      {
        heading: { en: "dhclient", el: "dhclient" },
        body: {
          en: "DHCP assigns addresses automatically. dhclient eth0 asks the (simulated) server for a lease — it will overwrite the IP you set by hand.",
          el: "dhclient eth0 ζητά IP από DHCP.",
        },
        shots: [shot("dhclient eth0", ["DHCPREQUEST of 10.10.10.42 on eth0", "bound to 10.10.10.42 -- renewal in 1800 seconds."])],
      },
      {
        heading: { en: "dig — DNS", el: "dig — DNS" },
        body: {
          en: "DNS maps names to IPs. dig hackforge.lab   (A record). dig hackforge.lab mx   (mail). dig hackforge.lab ns   (nameservers). All answers for hackforge.lab are fictional fixtures served inside the sandbox; no public domain is queried.",
          el: "dig hackforge.lab  / mx / ns",
        },
        shots: [
          shot("dig hackforge.lab", ["hackforge.lab.    300 IN A 10.10.10.8"]),
          shot("dig hackforge.lab mx", ["hackforge.lab.    300 IN MX 10 mail.hackforge.lab."]),
          shot("dig hackforge.lab ns", ["hackforge.lab.    300 IN NS ns1.hackforge.lab."]),
        ],
      },
      {
        heading: { en: "resolv.conf and hosts", el: "resolv.conf και hosts" },
        body: {
          en: "The resolver reads DNS server addresses from /etc/resolv.conf. In this isolated lab, echo \"nameserver 10.10.10.53\" > /etc/resolv.conf writes the fictional lab resolver. /etc/hosts is a static name-to-address table for this machine only; it does not publish DNS or redirect another user's traffic. Use nano /etc/hosts to inspect the entries, and add only authorized local training names.",
          el: "Ο resolver διαβάζει διευθύνσεις DNS από το /etc/resolv.conf. Στο απομονωμένο εργαστήριο, η εντολή echo \"nameserver 10.10.10.53\" > /etc/resolv.conf γράφει τον εικονικό resolver. Το /etc/hosts είναι στατικός πίνακας ονομάτων για αυτόν τον υπολογιστή· δεν δημοσιεύει εγγραφή DNS ούτε αλλάζει την κίνηση άλλου χρήστη. Με το nano /etc/hosts ελέγχεις τις εγγραφές και προσθέτεις μόνο εξουσιοδοτημένα ονόματα εκπαίδευσης."
        },
        shots: [
          shot('echo "nameserver 10.10.10.53" > /etc/resolv.conf', [""]),
          shot("cat /etc/resolv.conf", ["nameserver 10.10.10.53"]),
          shot("nano /etc/hosts", ["127.0.0.1 localhost", "10.10.10.8 hackforge.lab www.hackforge.lab"]),
        ],
      },
    ],
    cheats: [
      { cmd: "ifconfig", desc: { en: "interfaces", el: "διεπαφές" } },
      { cmd: "iwconfig", desc: { en: "wifi info", el: "wifi" } },
      { cmd: "ifconfig eth0 10.10.10.13", desc: { en: "set IP", el: "ορισμός IP" } },
      { cmd: "ifconfig eth0 hw ether MAC", desc: { en: "set MAC (lab)", el: "MAC (lab)" } },
      { cmd: "dhclient eth0", desc: { en: "DHCP lease", el: "DHCP" } },
      { cmd: "dig hackforge.lab mx", desc: { en: "DNS MX", el: "DNS MX" } },
      { cmd: "echo nameserver 10.10.10.53 > /etc/resolv.conf", desc: { en: "set DNS", el: "DNS" } },
    ],
    tasks: [
      { id: "ifc", instruction: { en: "ifconfig", el: "ifconfig" }, hint: { en: "ifconfig", el: "ifconfig" }, explain: { en: "See eth0 and lo.", el: "eth0 και lo." }, check: (t) => t.flags.has("ip") || usedCmd(t, /^\s*ifconfig\b/) },
      { id: "iw", instruction: { en: "iwconfig", el: "iwconfig" }, hint: { en: "iwconfig", el: "iwconfig" }, explain: { en: "Wireless info.", el: "Ασύρματα." }, check: (t) => t.flags.has("iwconfig") },
      { id: "ipset", instruction: { en: "ifconfig eth0 10.10.10.13", el: "ifconfig eth0 10.10.10.13" }, hint: { en: "ifconfig eth0 10.10.10.13", el: "ifconfig eth0 10.10.10.13" }, explain: { en: "Static IP in the lab.", el: "Στατική IP." }, check: (t) => t.flags.has("ip-set") || usedCmd(t, /ifconfig\s+eth0\s+10\.10\.10\.13/) },
      { id: "mac", instruction: { en: "ifconfig eth0 down ; ifconfig eth0 hw ether 02:00:00:00:00:13 ; ifconfig eth0 up  (one at a time is fine)", el: "down, hw ether, up" }, hint: { en: "ifconfig eth0 down\nifconfig eth0 hw ether 02:00:00:00:00:13\nifconfig eth0 up", el: "ifconfig eth0 down\nifconfig eth0 hw ether 02:00:00:00:00:13\nifconfig eth0 up" }, explain: { en: "Lab-only MAC change.", el: "Αλλαγή MAC μόνο lab." }, check: (t) => t.flags.has("mac-spoof") || usedCmd(t, /hw\s+ether/) },
      { id: "dhcp", instruction: { en: "dhclient eth0", el: "dhclient eth0" }, hint: { en: "dhclient eth0", el: "dhclient eth0" }, explain: { en: "Ask DHCP for an address.", el: "Ζήτα DHCP." }, check: (t) => t.flags.has("dhclient") },
      { id: "dig", instruction: { en: "dig hackforge.lab", el: "dig hackforge.lab" }, hint: { en: "dig hackforge.lab", el: "dig hackforge.lab" }, explain: { en: "A record.", el: "A record." }, check: (t) => t.flags.has("dig-a") || t.flags.has("dig") },
      { id: "digmx", instruction: { en: "dig hackforge.lab mx  AND  dig hackforge.lab ns", el: "dig mx και ns" }, hint: { en: "dig hackforge.lab mx", el: "dig hackforge.lab mx" }, explain: { en: "Mail and nameserver records.", el: "MX και NS." }, check: (t) => t.flags.has("dig-mx") || t.flags.has("dig-ns") || usedCmd(t, /dig\s+.*mx/) },
      { id: "dns", instruction: { en: 'echo "nameserver 10.10.10.53" > /etc/resolv.conf', el: "echo nameserver στο resolv.conf" }, hint: { en: 'echo "nameserver 10.10.10.53" > /etc/resolv.conf', el: "echo … > /etc/resolv.conf" }, explain: { en: "Overwrite resolver.", el: "Overwrite resolver." }, check: (t) => t.flags.has("dns-set") || usedCmd(t, /resolv\.conf/) },
      { id: "hosts", instruction: { en: "nano /etc/hosts  (or cat it)", el: "nano /etc/hosts" }, hint: { en: "nano /etc/hosts", el: "nano /etc/hosts" }, explain: { en: "Static names.", el: "Στατικά ονόματα." }, check: (t) => t.flags.has("nano-hosts") || t.flags.has("read-hosts") || usedCmd(t, /\/etc\/hosts/) },
    ],
    challenges: [
      {
        title: { en: "Prove the new DNS", el: "Νέο DNS" },
        brief: { en: "cat /etc/resolv.conf after the echo redirect.", el: "cat /etc/resolv.conf" },
        success: { en: "10.10.10.53 is in the file.", el: "10.10.10.53 στο αρχείο." },
        check: (t) => t.flags.has("dns-set") || t.filesRead.some((p) => p.includes("resolv")),
      },
      {
        title: { en: "ifconfig after DHCP", el: "ifconfig μετά το DHCP" },
        brief: { en: "ifconfig and notice the lease IP.", el: "ifconfig — δες τη νέα IP." },
        success: { en: "DHCP overwrote your static address.", el: "Το DHCP έγραψε από πάνω." },
        check: (t) => t.flags.has("dhclient") && t.flags.has("ip"),
      },
    ],
  },
  {
    id: "sr-proc",
    order: 9,
    icon: "cpu",
    color: "from-rose-400 to-red-900",
    difficulty: 3,
    scenario: lab,
    title: { en: "Process management", el: "Διαχείριση διεργασιών" },
    subtitle: { en: "ps, top, nice, kill, jobs, at", el: "ps, top, nice, kill, jobs, at" },
    badge: { en: "Process Whisperer", el: "Ψίθυρος διεργασιών" },
    theory: [
      {
        heading: { en: "ps and ps aux", el: "ps και ps aux" },
        body: {
          en: "A process is a running program. ps lists YOUR active processes (PID is unique). ps aux lists ALL users: PID, user, %CPU, %MEM, COMMAND. Filter: ps aux | grep msfconsole",
          el: "ps = δικές σου. ps aux = όλες. grep για φίλτρο.",
        },
        shots: [
          shot("ps", ["  PID TTY          TIME CMD", "    1 pts/0    00:00:00 init"]),
          shot("ps aux | grep msfconsole", ["root       880 1.2  2.1  msfconsole"]),
        ],
      },
      {
        heading: { en: "top", el: "top" },
        body: {
          en: "top sorts by resource use and refreshes (about every 10s on a real box). Use it to find the greediest process.",
          el: "Το top ταξινομεί κατά πόρους.",
        },
        shots: [shot("top", ["PID USER      %CPU %MEM COMMAND", "4378 root  8.4  6.2  [zombie-lab]"])],
      },
      {
        heading: { en: "nice / renice", el: "nice / renice" },
        body: {
          en: "nice -n 10 /usr/bin/ssh-agent starts a command with lower scheduling priority. Linux niceness ranges from -20 (highest priority) to 19 (lowest); renice 19 6242 sets the absolute value for PID 6242.",
          el: "Η nice ορίζει τιμή κατά την εκκίνηση· η renice αλλάζει υπάρχον PID. Πιο θετική τιμή σημαίνει χαμηλότερη προτεραιότητα.",
        },
        shots: [
          shot("nice -n 10 /usr/bin/ssh-agent", ["would start /usr/bin/ssh-agent with nice 10 (simulated; positive values lower scheduling priority)"]),
          shot("renice 19 6242", ["6242: old priority 0, new priority 19"]),
        ],
      },
      {
        heading: { en: "kill", el: "kill" },
        body: {
          en: "kill sends a signal to a PID. SIGTERM (15) requests a normal stop; SIGHUP (1) reports a hangup and some programs use it to reload configuration, so it is not a universal gentle-stop command. SIGKILL (9) forces termination without cleanup. Verify the PID first; every process here is fictional.",
          el: "Το SIGHUP μπορεί να προκαλέσει επαναφόρτωση ή τερματισμό· το SIGKILL επιβάλλει άμεσο τερματισμό. Έλεγξε το PID και μείνε στο lab.",
        },
        shots: [
          shot("kill -1 6242", ["sent SIGHUP to 6242; outcome depends on the process (simulated)."]),
          shot("kill -9 4378", ["sent SIGKILL to 4378; process stopped (simulated)."]),
        ],
      },
      {
        heading: { en: "Background, fg, jobs, at", el: "Background, fg, jobs, at" },
        body: {
          en: "Append & to run in the background: nano hackforge.txt &  (prints a PID). jobs lists background jobs. fg PID (or fg) brings one back. at 9:00pm  schedules a one-shot job (crond is for repeating). Example: at 9:00pm  then /root/simple_bash.sh",
          el: "εντολή &  ·  jobs  ·  fg  ·  at 9:00pm",
        },
        shots: [
          shot("nano hackforge.txt &", ["[1] 7100"]),
          shot("jobs", ["[1]  Running  nano hackforge.txt"]),
          shot("at 9:00pm", ["at> (type a command then Ctrl-D in a real shell)", "job 1 at 9:00pm"]),
        ],
      },
    ],
    cheats: [
      { cmd: "ps", desc: { en: "your processes", el: "οι διεργασίες σου" } },
      { cmd: "ps aux", desc: { en: "all processes", el: "όλες" } },
      { cmd: "ps aux | grep msfconsole", desc: { en: "filter", el: "φίλτρο" } },
      { cmd: "top", desc: { en: "live resource view", el: "πόροι live" } },
      { cmd: "nice -n 10 CMD", desc: { en: "start at lower priority", el: "εκκίνηση με χαμηλότερη προτεραιότητα" } },
      { cmd: "renice 19 PID", desc: { en: "reprioritise", el: "αλλαγή nice" } },
      { cmd: "kill -9 PID", desc: { en: "force stop", el: "βίαιο stop" } },
      { cmd: "CMD &", desc: { en: "background", el: "παρασκήνιο" } },
      { cmd: "jobs / fg", desc: { en: "job control", el: "jobs" } },
      { cmd: "at 9:00pm", desc: { en: "one-shot schedule", el: "προγραμματισμός μία φορά" } },
    ],
    tasks: [
      { id: "ps", instruction: { en: "ps", el: "ps" }, hint: { en: "ps", el: "ps" }, explain: { en: "Your session's processes.", el: "Οι δικές σου." }, check: (t) => t.flags.has("ps") },
      { id: "aux", instruction: { en: "ps aux", el: "ps aux" }, hint: { en: "ps aux", el: "ps aux" }, explain: { en: "Everyone's processes.", el: "Όλων." }, check: (t) => t.flags.has("ps-aux") || usedCmd(t, /ps\s+aux/) },
      { id: "psg", instruction: { en: "ps aux | grep msfconsole", el: "ps aux | grep msfconsole" }, hint: { en: "ps aux | grep msfconsole", el: "ps aux | grep msfconsole" }, explain: { en: "Filter by name.", el: "Φίλτρο ονόματος." }, check: (t) => t.flags.has("ps-grep") || usedCmd(t, /ps\s+aux\s*\|/) },
      { id: "top", instruction: { en: "top", el: "top" }, hint: { en: "top", el: "top" }, explain: { en: "Greediest first.", el: "Οι πιο αχόρταγοι πρώτα." }, check: (t) => t.flags.has("top") },
      { id: "nice", instruction: { en: "nice -n 10 /usr/bin/ssh-agent", el: "nice -n 10 /usr/bin/ssh-agent" }, hint: { en: "nice -n 10 /usr/bin/ssh-agent", el: "nice -n 10 /usr/bin/ssh-agent" }, explain: { en: "Start with priority.", el: "Εκκίνηση με προτεραιότητα." }, check: (t) => t.flags.has("nice") || usedCmd(t, /^\s*nice\b/) },
      { id: "renice", instruction: { en: "renice 19 6242", el: "renice 19 6242" }, hint: { en: "renice 19 6242", el: "renice 19 6242" }, explain: { en: "Absolute nice value + PID.", el: "Τιμή + PID." }, check: (t) => t.flags.has("renice") || usedCmd(t, /renice/) },
      { id: "k1", instruction: { en: "kill -1 6242", el: "kill -1 6242" }, hint: { en: "kill -1 6242", el: "kill -1 6242" }, explain: { en: "SIGHUP.", el: "SIGHUP." }, check: (t) => t.flags.has("kill-1") || usedCmd(t, /kill\s+-1/) },
      { id: "k9", instruction: { en: "kill -9 4378", el: "kill -9 4378" }, hint: { en: "kill -9 4378", el: "kill -9 4378" }, explain: { en: "SIGKILL.", el: "SIGKILL." }, check: (t) => t.flags.has("kill-9") || usedCmd(t, /kill\s+-9/) },
      { id: "bg", instruction: { en: "nano hackforge.txt &", el: "nano hackforge.txt &" }, hint: { en: "nano hackforge.txt &", el: "nano hackforge.txt &" }, explain: { en: "& backgrounds.", el: "Το & πάει πίσω." }, check: (t) => t.flags.has("bg") || usedCmd(t, /&\s*$/) },
      { id: "jobs", instruction: { en: "jobs   then   fg", el: "jobs και fg" }, hint: { en: "jobs", el: "jobs" }, explain: { en: "Job control.", el: "Job control." }, check: (t) => t.flags.has("jobs") || t.flags.has("fg") || usedCmd(t, /^\s*jobs\b/) },
      { id: "at", instruction: { en: "at 9:00pm", el: "at 9:00pm" }, hint: { en: "at 9:00pm", el: "at 9:00pm" }, explain: { en: "One-shot schedule.", el: "Μία φορά." }, check: (t) => t.flags.has("at") },
    ],
    challenges: [
      {
        title: { en: "Confirm msf is a row", el: "Επιβεβαίωσε msf" },
        brief: { en: "ps aux | grep msfconsole should have shown PID 880.", el: "PID 880." },
        success: { en: "You can hunt processes by name.", el: "Κυνηγάς διεργασίες με όνομα." },
        check: (t) => t.flags.has("ps-grep") || t.flags.has("ps-aux"),
      },
      {
        title: { en: "Schedule the bash stub", el: "Προγραμμάτισε το bash" },
        brief: { en: "You ran at 9:00pm — in a real shell you would then type /root/simple_bash.sh", el: "at + simple_bash.sh" },
        success: { en: "Daemon scheduling introduced.", el: "Γνώρισες το at." },
        check: (t) => t.flags.has("at"),
      },
    ],
  },
  {
    id: "sr-env",
    order: 10,
    icon: "settings",
    color: "from-zinc-300 to-slate-800",
    difficulty: 2,
    scenario: lab,
    title: { en: "Environment variables", el: "Μεταβλητές περιβάλλοντος" },
    subtitle: { en: "set, HISTSIZE, export, unset", el: "set, HISTSIZE, export, unset" },
    badge: { en: "Env Smith", el: "Σιδεράς env" },
    theory: [
      {
        heading: { en: "env vs shell", el: "env vs shell" },
        body: {
          en: "Variables are key=value strings. Shell variables last for this session; environment variables are inherited. set | more  dumps them (set is bigger than env).",
          el: "set | more για όλες τις μεταβλητές.",
        },
        shots: [shot("set | more", ["HOME=/root", "USER=root", "HISTSIZE=1000", "PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin"])],
      },
      {
        heading: { en: "Filter HISTSIZE", el: "Φίλτρο HISTSIZE" },
        body: {
          en: "set | grep HISTSIZE   — default history size is 1000 commands.",
          el: "set | grep HISTSIZE → 1000.",
        },
        shots: [shot("set | grep HISTSIZE", ["HISTSIZE=1000"])],
      },
      {
        heading: { en: "Temporary change", el: "Προσωρινή αλλαγή" },
        body: {
          en: "HISTSIZE=0   (no spaces around =). Up-arrow history goes quiet for this session. A new terminal would restore the default — unless you export.",
          el: "HISTSIZE=0 χωρίς κενά.",
        },
        shots: [shot("HISTSIZE=0", [""])],
      },
      {
        heading: { en: "Save then export", el: "Αποθήκευσε και export" },
        body: {
          en: "Always stash the old value: echo $HISTSIZE > ~/valueofHISTSIZE.txt   then HISTSIZE=0  and  export HISTSIZE  to make it stick for child processes.",
          el: "echo $HISTSIZE > ~/valueofHISTSIZE.txt και export HISTSIZE",
        },
        shots: [
          shot("echo $HISTSIZE > ~/valueofHISTSIZE.txt", [""]),
          shot("export HISTSIZE", [""]),
        ],
      },
      {
        heading: { en: "User-defined + unset", el: "Δικές σου + unset" },
        body: {
          en: 'url_variable="hackforge.lab/"   creates a custom variable. echo $url_variable to read it. unset url_variable deletes it — echo then prints nothing.',
          el: "url_variable=… και unset url_variable",
        },
        shots: [
          shot('url_variable="hackforge.lab/"', [""]),
          shot("unset url_variable", [""]),
        ],
      },
    ],
    cheats: [
      { cmd: "set | more", desc: { en: "dump variables", el: "dump" } },
      { cmd: "set | grep HISTSIZE", desc: { en: "filter", el: "φίλτρο" } },
      { cmd: "HISTSIZE=0", desc: { en: "session value", el: "τιμή συνεδρίας" } },
      { cmd: "echo $HISTSIZE > ~/valueofHISTSIZE.txt", desc: { en: "backup", el: "αντίγραφο" } },
      { cmd: "export HISTSIZE", desc: { en: "export to env", el: "export" } },
      { cmd: "unset NAME", desc: { en: "delete var", el: "διαγραφή" } },
    ],
    tasks: [
      { id: "set", instruction: { en: "set | more   (or just set)", el: "set | more" }, hint: { en: "set | more", el: "set | more" }, explain: { en: "Dump vars.", el: "Dump." }, check: (t) => t.flags.has("set") || usedCmd(t, /^\s*set\b/) },
      { id: "greph", instruction: { en: "set | grep HISTSIZE", el: "set | grep HISTSIZE" }, hint: { en: "set | grep HISTSIZE", el: "set | grep HISTSIZE" }, explain: { en: "Should show 1000 first.", el: "Αρχικά 1000." }, check: (t) => t.flags.has("grep-hist") || usedCmd(t, /grep\s+HISTSIZE/) },
      { id: "zero", instruction: { en: "HISTSIZE=0", el: "HISTSIZE=0" }, hint: { en: "HISTSIZE=0", el: "HISTSIZE=0" }, explain: { en: "No spaces.", el: "Χωρίς κενά." }, check: (t) => t.flags.has("histsize") || usedCmd(t, /HISTSIZE=0/) },
      { id: "save", instruction: { en: "echo $HISTSIZE > ~/valueofHISTSIZE.txt", el: "echo $HISTSIZE > ~/valueofHISTSIZE.txt" }, hint: { en: "echo $HISTSIZE > ~/valueofHISTSIZE.txt", el: "echo $HISTSIZE > ~/valueofHISTSIZE.txt" }, explain: { en: "Backup before you break history.", el: "Backup πριν πειράξεις το history." }, check: (t) => t.flags.has("hist-save") || usedCmd(t, /valueofHISTSIZE/) },
      { id: "export", instruction: { en: "export HISTSIZE", el: "export HISTSIZE" }, hint: { en: "export HISTSIZE", el: "export HISTSIZE" }, explain: { en: "Inherit in children.", el: "Κληρονομιά στα παιδιά." }, check: (t) => t.flags.has("export") || usedCmd(t, /export\s+HISTSIZE/) },
      { id: "url", instruction: { en: 'url_variable="hackforge.lab/"', el: "url_variable=hackforge.lab/" }, hint: { en: 'url_variable="hackforge.lab/"', el: "url_variable=…" }, explain: { en: "Custom variable.", el: "Δική σου μεταβλητή." }, check: (t) => t.flags.has("url-var") || usedCmd(t, /url_variable=/) },
      { id: "unset", instruction: { en: "unset url_variable", el: "unset url_variable" }, hint: { en: "unset url_variable", el: "unset url_variable" }, explain: { en: "Delete it.", el: "Διαγραφή." }, check: (t) => t.flags.has("unset") || usedCmd(t, /unset\s+url_variable/) },
    ],
    challenges: [
      {
        title: { en: "Read the backup", el: "Διάβασε το backup" },
        brief: { en: "cat ~/valueofHISTSIZE.txt", el: "cat ~/valueofHISTSIZE.txt" },
        success: { en: "You can undo because you saved.", el: "Σώθηκες γιατί αποθήκευσες." },
        check: (t) => t.filesRead.some((p) => p.includes("valueofHISTSIZE")) || t.flags.has("hist-save"),
      },
      {
        title: { en: "echo the custom var before unset", el: "echo πριν το unset" },
        brief: { en: "If you already unset, recreate url_variable then echo $url_variable", el: "Ξαναφτιάξ' την και echo" },
        success: { en: "$ expands variables.", el: "Το $ κάνει expand." },
        check: (t) => t.flags.has("url-var") || usedCmd(t, /echo\s+\$url/),
      },
    ],
  },
];
