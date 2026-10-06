import type { Module } from "./lessons";
import { usedCmd } from "../lib/terminal";
import { sudoRunFS } from "../lib/sudorun";
import { SUDO_RUN_MODULES_B } from "./sudorun-lessons-b";
import { SUDO_RUN_MODULES_C } from "./sudorun-lessons-c";

const lab = "sudorun" as const;

function shot(cmd: string, lines: string[]): { cmd: string; lines: string[] } {
  return { cmd, lines };
}

export const SUDO_RUN_MODULES: Module[] = [
  {
    id: "sr-intro",
    order: 1,
    icon: "terminal",
    color: "from-lime-500 to-emerald-800",
    difficulty: 1,
    scenario: lab,
    labFS: sudoRunFS,
    title: { en: "Sudo_Run — Why Linux?", el: "Sudo_Run — Γιατί Linux;" },
    subtitle: { en: "Pentesting OS, pwd, whoami, cd, ls", el: "OS pentest, pwd, whoami, cd, ls" },
    badge: { en: "Sudo Initiate", el: "Μύηση Sudo" },
    theory: [
      {
        heading: { en: "Why use Linux for pentesting?", el: "Γιατί Linux στο pentest;" },
        body: {
          en: "Certain operating systems get tied to certain tasks. For penetration testing, Linux is the default map. Linux offers far higher control of the OS, and it is open source — which makes it transparent and easier to understand. Before you try to “hack” anything, you must know how it works; transparency is a huge plus. Because Linux is popular in the community, most pentesting tools and frameworks are built for it. Maintenance is easy (packages come from a repository) and it is very stable compared to traditional desktop OS like Windows. This campaign is Sudo_Run: Linux for Beginners, inside HackForge — a sandbox, never a live network you do not own.",
          el: "Για pentest το Linux είναι ο κανόνας: ανοιχτό, διαφανές, σταθερό, με τα εργαλεία έτοιμα. Το Sudo_Run είναι το μάθημα αρχαρίων του HackForge — μόνο sandbox.",
        },
      },
      {
        heading: { en: "The terminal", el: "Το τερματικό" },
        body: {
          en: "Just like everyday Windows work (folders, copy, move), we do those operations on Linux — mostly in the terminal, the command-line interface. You type a command, press Enter, the shell runs it. You are root in this lab (administrator). That is a lot of power: stay inside HackForge.",
          el: "Οι καθημερινές εργασίες γίνονται στο τερματικό. Εδώ είσαι root — μείνε μέσα στο HackForge.",
        },
      },
      {
        heading: { en: "pwd — where am I?", el: "pwd — πού είμαι;" },
        body: {
          en: "Before you begin, know which directory you are in. pwd prints the working directory. In Sudo_Run you start in /root (the root user's home).",
          el: "Το pwd τυπώνει τον τρέχοντα φάκελο. Στο Sudo_Run ξεκινάς από /root.",
        },
        shots: [shot("pwd", ["/root"])],
      },
      {
        heading: { en: "whoami — who am I?", el: "whoami — ποιος είμαι;" },
        body: {
          en: "whoami shows the logged-in user. Here you are root (the Windows equivalent of a full administrator).",
          el: "Το whoami δείχνει τον χρήστη. Εδώ είσαι root.",
        },
        shots: [shot("whoami", ["root"])],
      },
      {
        heading: { en: "cd — change directory", el: "cd — αλλαγή φακέλου" },
        body: {
          en: "cd moves you. Change into Desktop with: cd Desktop/",
          el: "Το cd σε μετακινεί. Δοκίμασε cd Desktop/",
        },
        shots: [shot("cd Desktop/", ["root@kali:~/Desktop#"])],
      },
      {
        heading: { en: "ls — list contents", el: "ls — λίστα" },
        body: {
          en: "ls lists a directory (like dir on Windows). Run it after you cd into Desktop.",
          el: "Το ls είναι σαν το dir των Windows.",
        },
        shots: [shot("ls", ["CTF-notes.txt  todo.txt"])],
      },
    ],
    cheats: [
      { cmd: "pwd", desc: { en: "print working directory", el: "τρέχων φάκελος" } },
      { cmd: "whoami", desc: { en: "current user", el: "τρέχων χρήστης" } },
      { cmd: "cd Desktop/", desc: { en: "enter Desktop", el: "μπες στο Desktop" } },
      { cmd: "ls", desc: { en: "list files", el: "λίστα αρχείων" } },
    ],
    tasks: [
      {
        id: "pwd",
        instruction: { en: "Run pwd — you should see /root.", el: "Τρέξε pwd — πρέπει να δεις /root." },
        hint: { en: "pwd", el: "pwd" },
        explain: { en: "WHY: orientation. HOW: pwd", el: "ΓΙΑΤΙ: προσανατολισμός." },
        check: (t) => t.flags.has("pwd") || usedCmd(t, /^\s*pwd\b/),
      },
      {
        id: "whoami",
        instruction: { en: "Run whoami and confirm you are root.", el: "whoami — είσαι root." },
        hint: { en: "whoami", el: "whoami" },
        explain: { en: "Root is all-powerful. That is why the ethics oath exists.", el: "Ο root είναι πανίσχυρος." },
        check: (t) => t.flags.has("whoami"),
      },
      {
        id: "cd",
        instruction: { en: "cd into Desktop.", el: "cd στο Desktop." },
        hint: { en: "cd Desktop", el: "cd Desktop" },
        explain: { en: "cd Desktop/ or cd Desktop", el: "cd Desktop" },
        check: (t) => t.flags.has("cd-desktop") || usedCmd(t, /^\s*cd\s+Desktop/),
      },
      {
        id: "ls",
        instruction: { en: "List the Desktop with ls.", el: "ls στο Desktop." },
        hint: { en: "ls", el: "ls" },
        explain: { en: "ls is your dir.", el: "ls = dir." },
        check: (t) => t.flags.has("ls"),
      },
    ],
    challenges: [
      {
        title: { en: "Home again", el: "Πίσω στο home" },
        brief: { en: "cd ~ or cd /root and pwd again.", el: "cd ~ ή cd /root και pwd." },
        success: { en: "You can move and know where you landed.", el: "Ξέρεις πού πατάς." },
        check: (t) => usedCmd(t, /^\s*cd\s+(\/root|~)\s*$/) || t.cwd === "/root",
      },
      {
        title: { en: "Read the desktop CTF note", el: "Διάβασε το CTF note" },
        brief: { en: "cat Desktop/CTF-notes.txt from /root (or cat CTF-notes.txt if you are already in Desktop).", el: "cat το CTF-notes.txt" },
        success: { en: "You found a Sudo_Run flag on the desktop.", el: "Βρήκες flag στο desktop." },
        check: (t) => t.filesRead.some((p) => p.includes("CTF-notes")),
      },
    ],
  },
  {
    id: "sr-help",
    order: 2,
    icon: "book",
    color: "from-sky-400 to-indigo-800",
    difficulty: 1,
    scenario: lab,
    labFS: sudoRunFS,
    title: { en: "Help, man, locate, whereis, which", el: "Help, man, locate, whereis, which" },
    subtitle: { en: "How operators look things up", el: "Πώς ψάχνουν οι χειριστές" },
    badge: { en: "Page Turner", el: "Αναγνώστης man" },
    theory: [
      {
        heading: { en: "help / --help", el: "help / --help" },
        body: {
          en: "Nearly every command, application or utility on Linux has a dedicated help file. If you are stuck, -h / --help is your friend. Example from the original guide: volatility --help (Volatility is a memory-forensics framework). In HackForge the same pattern applies to every tool.",
          el: "Σχεδόν κάθε εντολή έχει --help. Π.χ. volatility --help.",
        },
        shots: [shot("volatility --help", ["Volatility Foundation Volatility Framework", "-h, --help   show help message and exit", "Plugins: pslist, netscan, filescan (lab stub)"])],
      },
      {
        heading: { en: "man — manual pages", el: "man — εγχειρίδια" },
        body: {
          en: "In addition to --help, most commands have a manual page: man COMMAND. man ls describes ls and its flags (-a, -l, …).",
          el: "Το man ls περιγράφει την ls και τα flags.",
        },
        shots: [shot("man ls", ["LS(1)  ls - list directory contents", "-a  do not ignore entries starting with .", "-l  use a long listing format"])],
      },
      {
        heading: { en: "locate — keyword search", el: "locate — αναζήτηση" },
        body: {
          en: "locate KEYWORD searches a database of the filesystem. Drawbacks: it can dump too much, and the database is typically updated once a day — so brand-new files may be missing. Pipe through more to page: locate CTF | more",
          el: "Το locate ψάχνει μια βάση του filesystem. Συχνά: locate CTF | more",
        },
        shots: [shot("locate CTF | more", ["/root/Desktop/CTF-notes.txt", "/opt/CTF/readme", "/usr/share/wordlists/CTF.txt"])],
      },
      {
        heading: { en: "Binaries, whereis, which", el: "Binaries, whereis, which" },
        body: {
          en: "Files you can execute (like .exe on Windows) are binaries. They usually live in /usr/bin or /usr/sbin. ls, cd, cat, ps live there too. whereis NAME returns the binary path AND its man page. which NAME is stricter: only the binary on your PATH. Try both on git.",
          el: "Τα binaries ζουν σε /usr/bin. whereis δείχνει binary+man. which μόνο το PATH.",
        },
        shots: [
          shot("whereis git", ["git: /usr/bin/git /usr/share/man/man1/git.1"]),
          shot("which git", ["/usr/bin/git"]),
        ],
      },
    ],
    cheats: [
      { cmd: "volatility --help", desc: { en: "tool help", el: "βοήθεια εργαλείου" } },
      { cmd: "man ls", desc: { en: "manual for ls", el: "εγχειρίδιο ls" } },
      { cmd: "locate CTF | more", desc: { en: "search names", el: "αναζήτηση ονομάτων" } },
      { cmd: "whereis git", desc: { en: "binary + man", el: "binary + man" } },
      { cmd: "which git", desc: { en: "PATH binary only", el: "μόνο PATH" } },
    ],
    tasks: [
      {
        id: "vol",
        instruction: { en: "Run volatility --help", el: "Τρέξε volatility --help" },
        hint: { en: "volatility --help", el: "volatility --help" },
        explain: { en: "WHY: every tool documents itself.", el: "ΓΙΑΤΙ: κάθε εργαλείο αυτοπεριγράφεται." },
        check: (t) => t.flags.has("volatility-help") || usedCmd(t, /volatility/),
      },
      {
        id: "man",
        instruction: { en: "Open the manual for ls: man ls", el: "man ls" },
        hint: { en: "man ls", el: "man ls" },
        explain: { en: "man is deeper than --help.", el: "Το man είναι βαθύτερο από --help." },
        check: (t) => t.flags.has("man-ls") || usedCmd(t, /man\s+ls/),
      },
      {
        id: "locate",
        instruction: { en: "locate CTF (optionally | more)", el: "locate CTF" },
        hint: { en: "locate CTF | more", el: "locate CTF | more" },
        explain: { en: "locate walks a name index.", el: "Το locate ψάχνει ευρετήριο ονομάτων." },
        check: (t) => t.flags.has("locate") || t.flags.has("locate-ctf") || usedCmd(t, /locate\s+CTF/),
      },
      {
        id: "whereis",
        instruction: { en: "whereis git", el: "whereis git" },
        hint: { en: "whereis git", el: "whereis git" },
        explain: { en: "Binary plus man page.", el: "Binary και man." },
        check: (t) => t.flags.has("whereis-git") || usedCmd(t, /whereis\s+git/),
      },
      {
        id: "which",
        instruction: { en: "which git", el: "which git" },
        hint: { en: "which git", el: "which git" },
        explain: { en: "Only PATH.", el: "Μόνο PATH." },
        check: (t) => t.flags.has("which-git") || usedCmd(t, /which\s+git/),
      },
    ],
    challenges: [
      {
        title: { en: "Page the locate dump", el: "Σελιδοποίησε το locate" },
        brief: { en: "Run locate CTF | more (pipe).", el: "locate CTF | more" },
        success: { en: "You combined locate with a pager.", el: "Συνδύασες locate με pager." },
        check: (t) => usedCmd(t, /locate.*\|/) || t.flags.has("pipe"),
      },
      {
        title: { en: "Read git's man file path", el: "Δες το man του git" },
        brief: { en: "cat /usr/share/man/man1/git.1", el: "cat /usr/share/man/man1/git.1" },
        success: { en: "whereis told you where the page lives.", el: "Το whereis έδειξε τη σελίδα." },
        check: (t) => t.filesRead.some((p) => p.includes("git.1")) || t.flags.has("whereis-git"),
      },
    ],
  },
  {
    id: "sr-search",
    order: 3,
    icon: "scan",
    color: "from-cyan-500 to-teal-900",
    difficulty: 2,
    scenario: lab,
    labFS: sudoRunFS,
    title: { en: "grep & find", el: "grep & find" },
    subtitle: { en: "Filter output and hunt files", el: "Φίλτραρε έξοδο και κυνήγα αρχεία" },
    badge: { en: "Needle Finder", el: "Ευρετής" },
    theory: [
      {
        heading: { en: "grep a file", el: "grep σε αρχείο" },
        body: {
          en: "grep searches for a keyword. Search for echo inside simple_bash.sh: grep -I \"echo\" simple_bash.sh  (from /root).",
          el: "grep -I \"echo\" simple_bash.sh στο /root.",
        },
        shots: [shot('grep -I "echo" simple_bash.sh', ['echo "HackForge scanner starting"', 'echo "Sudo_Run lab — simulated only"', "# echo is here so grep can find it"])],
      },
      {
        heading: { en: "Piping into grep", el: "Pipe στο grep" },
        body: {
          en: "The most common use of grep is to filter another command. ifconfig dumps a lot; keep only inet lines: ifconfig | grep inet",
          el: "ifconfig | grep inet κρατά μόνο γραμμές inet.",
        },
        shots: [shot("ifconfig | grep inet", ["        inet 10.10.10.2  netmask 255.255.255.0  broadcast 10.10.10.255", "        inet6 fe80::a00:27ff:fe12:3456  prefixlen 64", "        inet 127.0.0.1  netmask 255.0.0.0"])],
      },
      {
        heading: { en: "find — the flexible hunter", el: "find — κυνηγός" },
        body: {
          en: "find is the most powerful search: name, type, owner, size, mtime… find / -type f -name hackforge starts at / (root of the tree), looking for a regular file named hackforge. (The original write-up used a different filename; in HackForge the marker is called hackforge.) Permission denied noise: append 2>&1 | grep -v \"Permission Denied\" to hide errors you cannot read.",
          el: "find / -type f -name hackforge και προαιρετικά 2>&1 | grep -v \"Permission Denied\".",
        },
        shots: [
          shot("find / -type f -name hackforge", ["/opt/labs/hackforge"]),
          shot('find / -type f -name hackforge 2>&1 | grep -v "Permission Denied"', ["/opt/labs/hackforge"]),
        ],
      },
    ],
    cheats: [
      { cmd: 'grep -I "echo" simple_bash.sh', desc: { en: "search a file", el: "αναζήτηση αρχείου" } },
      { cmd: "ifconfig | grep inet", desc: { en: "filter command output", el: "φίλτρο εξόδου" } },
      { cmd: "find / -type f -name hackforge", desc: { en: "hunt by name", el: "κυνήγι ονόματος" } },
    ],
    tasks: [
      {
        id: "grep-file",
        instruction: { en: 'grep for echo in simple_bash.sh', el: "grep echo στο simple_bash.sh" },
        hint: { en: 'grep -I "echo" simple_bash.sh', el: 'grep echo simple_bash.sh' },
        explain: { en: "grep PATTERN FILE", el: "grep PATTERN FILE" },
        check: (t) => t.flags.has("grep-echo") || usedCmd(t, /grep.*echo/),
      },
      {
        id: "grep-pipe",
        instruction: { en: "ifconfig | grep inet", el: "ifconfig | grep inet" },
        hint: { en: "ifconfig | grep inet", el: "ifconfig | grep inet" },
        explain: { en: "Pipe stdout into grep.", el: "Pipe στην grep." },
        check: (t) => t.flags.has("grep-inet") || usedCmd(t, /ifconfig\s*\|\s*grep/),
      },
      {
        id: "find",
        instruction: { en: "find / -type f -name hackforge", el: "find / -type f -name hackforge" },
        hint: { en: "find / -type f -name hackforge", el: "find / -type f -name hackforge" },
        explain: { en: "/ is the tree root. -type f means regular file.", el: "/ = ρίζα. -type f = αρχείο." },
        check: (t) => t.flags.has("find-hf") || t.flags.has("find") || usedCmd(t, /find\s+\/.*hackforge/),
      },
    ],
    challenges: [
      {
        title: { en: "Silence permission denied", el: "Σίγαση permission denied" },
        brief: { en: 'find / -type f -name hackforge 2>&1 | grep -v "Permission Denied"', el: "find … 2>&1 | grep -v" },
        success: { en: "You redirected stderr and filtered it.", el: "Redirect έκανες στο stderr." },
        check: (t) => usedCmd(t, /2>&1/) || t.flags.has("find-hf"),
      },
      {
        title: { en: "Read the marker", el: "Διάβασε τον δείκτη" },
        brief: { en: "cat /opt/labs/hackforge", el: "cat /opt/labs/hackforge" },
        success: { en: "find led you to a HackForge flag.", el: "Το find σε πήγε στο flag." },
        check: (t) => t.filesRead.some((p) => p.includes("/opt/labs/hackforge")),
      },
    ],
  },
  {
    id: "sr-files",
    order: 4,
    icon: "folder",
    color: "from-amber-400 to-orange-800",
    difficulty: 2,
    scenario: lab,
    labFS: sudoRunFS,
    title: { en: "Files & directories", el: "Αρχεία & φάκελοι" },
    subtitle: { en: "cat, touch, mkdir, cp, mv, rm, rmdir", el: "cat, touch, mkdir, cp, mv, rm, rmdir" },
    badge: { en: "File Clerk", el: "Αρχειοθέτης" },
    theory: [
      {
        heading: { en: "cat", el: "cat" },
        body: {
          en: "cat prints a file on the terminal. From /root: cat hackforge.txt  (the original guide used a different notes filename; here it is branded HackForge).",
          el: "cat hackforge.txt από /root.",
        },
        shots: [shot("cat hackforge.txt", ["Welcome to HackForge — Linux for Beginners (Sudo_Run).", "Keep notes here. Practice every command in the lab, not on the internet."])],
      },
      {
        heading: { en: "touch — create a file", el: "touch — νέο αρχείο" },
        body: {
          en: "touch NAME creates an empty file. Create hackforge-2.txt",
          el: "touch hackforge-2.txt",
        },
        shots: [shot("touch hackforge-2.txt", ["root@kali:~# ls", "hackforge.txt  hackforge-2.txt  simple_bash.sh  ..."])],
      },
      {
        heading: { en: "mkdir", el: "mkdir" },
        body: {
          en: "mkdir creates a directory. Create Documents/ignite (the ignite folder from the original lab, kept as a team name).",
          el: "mkdir Documents/ignite",
        },
        shots: [shot("mkdir Documents/ignite", [""])],
      },
      {
        heading: { en: "cp, mv, rm, rmdir", el: "cp, mv, rm, rmdir" },
        body: {
          en: "cp SRC DEST copies. mv SRC DEST moves OR renames. rm FILE deletes a file. rmdir DIR removes an empty directory (use rm -r if it has contents). Walkthrough: cp hackforge-2.txt Documents/ignite   then   mv Documents/ignite/hackforge-2.txt /root/Documents/   then   rm /root/Documents/hackforge-2.txt   then   rmdir ignite_screenshots/",
          el: "cp αντιγράφει, mv μετακινεί/μετονομάζει, rm σβήνει αρχείο, rmdir άδειο φάκελο.",
        },
        shots: [
          shot("cp hackforge-2.txt Documents/ignite", [""]),
          shot("rmdir ignite_screenshots/", [""]),
        ],
        tip: { en: "rm -r deletes a directory AND its contents. Be careful even in a lab.", el: "Το rm -r σβήνει φάκελο με περιεχόμενο." },
      },
    ],
    cheats: [
      { cmd: "cat hackforge.txt", desc: { en: "print file", el: "εκτύπωση" } },
      { cmd: "touch hackforge-2.txt", desc: { en: "create empty file", el: "κενό αρχείο" } },
      { cmd: "mkdir Documents/ignite", desc: { en: "make directory", el: "φάκελος" } },
      { cmd: "cp FILE DIR", desc: { en: "copy", el: "αντιγραφή" } },
      { cmd: "mv SRC DEST", desc: { en: "move/rename", el: "μετακίνηση" } },
      { cmd: "rm FILE", desc: { en: "delete file", el: "διαγραφή" } },
      { cmd: "rmdir DIR", desc: { en: "delete empty dir", el: "διαγραφή κενού φακέλου" } },
    ],
    tasks: [
      {
        id: "cat",
        instruction: { en: "cat hackforge.txt", el: "cat hackforge.txt" },
        hint: { en: "cd /root first if needed", el: "cd /root αν χρειαστεί" },
        explain: { en: "cat concatenates to stdout.", el: "cat στην έξοδο." },
        check: (t) => t.flags.has("cat-hf") || usedCmd(t, /cat\s+.*hackforge\.txt/),
      },
      {
        id: "touch",
        instruction: { en: "touch hackforge-2.txt", el: "touch hackforge-2.txt" },
        hint: { en: "touch hackforge-2.txt", el: "touch hackforge-2.txt" },
        explain: { en: "Creates an empty file in the current directory.", el: "Κενό αρχείο εδώ." },
        check: (t) => t.flags.has("touch-hf2") || usedCmd(t, /touch\s+.*hackforge-2/),
      },
      {
        id: "mkdir",
        instruction: { en: "mkdir Documents/ignite", el: "mkdir Documents/ignite" },
        hint: { en: "mkdir Documents/ignite", el: "mkdir Documents/ignite" },
        explain: { en: "Parent Documents already exists in the VFS.", el: "Ο Documents υπάρχει ήδη." },
        check: (t) => t.flags.has("mkdir-ignite") || usedCmd(t, /mkdir\s+.*ignite/),
      },
      {
        id: "cp",
        instruction: { en: "cp hackforge-2.txt Documents/ignite", el: "cp hackforge-2.txt Documents/ignite" },
        hint: { en: "cp hackforge-2.txt Documents/ignite", el: "cp …" },
        explain: { en: "cp <file> <destination>", el: "cp αρχείο προορισμός" },
        check: (t) => t.flags.has("cp") || usedCmd(t, /^\s*cp\b/),
      },
      {
        id: "mv",
        instruction: { en: "Move the copy with mv into /root/Documents/ (from the ignite folder or by path).", el: "mv στο /root/Documents/" },
        hint: { en: "mv Documents/ignite/hackforge-2.txt /root/Documents/", el: "mv … /root/Documents/" },
        explain: { en: "mv moves or renames.", el: "Το mv μετακινεί ή μετονομάζει." },
        check: (t) => t.flags.has("mv") || usedCmd(t, /^\s*mv\b/),
      },
      {
        id: "rm",
        instruction: { en: "rm the leftover hackforge-2.txt (in Documents or home).", el: "rm το hackforge-2.txt" },
        hint: { en: "rm Documents/hackforge-2.txt", el: "rm …" },
        explain: { en: "rm deletes files.", el: "Το rm σβήνει αρχεία." },
        check: (t) => t.flags.has("rm") || usedCmd(t, /^\s*rm\b/),
      },
      {
        id: "rmdir",
        instruction: { en: "rmdir ignite_screenshots/", el: "rmdir ignite_screenshots/" },
        hint: { en: "rmdir ignite_screenshots", el: "rmdir ignite_screenshots" },
        explain: { en: "Empty dirs only. Otherwise rm -r.", el: "Μόνο άδειοι φάκελοι." },
        check: (t) => t.flags.has("rmdir") || usedCmd(t, /rmdir/),
      },
    ],
    challenges: [
      {
        title: { en: "Rebuild ignite", el: "Ξαναφτιάξε ignite" },
        brief: { en: "If you removed Documents/ignite, mkdir it again. ls Documents to prove it.", el: "mkdir ξανά και ls Documents" },
        success: { en: "You can create on demand.", el: "Δημιουργείς κατ' απαίτηση." },
        check: (t) => t.flags.has("mkdir-ignite") || usedCmd(t, /ls\s+.*Documents/),
      },
      {
        title: { en: "Recursive reminder", el: "Υπενθύμιση -r" },
        brief: { en: "Read the tip: run ls ignite_screenshots or confirm rmdir already succeeded.", el: "Επιβεβαίωσε το rmdir." },
        success: { en: "Empty directory gone.", el: "Ο άδειος φάκελος έφυγε." },
        check: (t) => t.flags.has("rmdir") || usedCmd(t, /rm\s+-r/),
      },
    ],
  },
  {
    id: "sr-text",
    order: 5,
    icon: "book",
    color: "from-fuchsia-400 to-purple-900",
    difficulty: 2,
    scenario: lab,
    labFS: sudoRunFS,
    title: { en: "Text manipulation", el: "Χειρισμός κειμένου" },
    subtitle: { en: "head, tail, nl, sed, more, less", el: "head, tail, nl, sed, more, less" },
    badge: { en: "Text Smith", el: "Σιδεράς κειμένου" },
    theory: [
      {
        heading: { en: "Almost everything is a file", el: "Σχεδόν όλα είναι αρχεία" },
        body: {
          en: "On Linux you live in text files — especially configuration. Learning to slice text is how you manage the OS. We use /etc/ettercap/etter.dns (a DNS-spoof config example from a lab tool called Ettercap). This is a FILE in the sandbox so you can practise. Using spoofing on a network you do not own is illegal.",
          el: "Σχεδόν όλα είναι αρχεία κειμένου. Το etter.dns είναι παράδειγμα στο sandbox — όχι για δίκτυα που δεν σου ανήκουν.",
        },
      },
      {
        heading: { en: "head & tail", el: "head & tail" },
        body: {
          en: "head FILE shows the first 10 lines by default. tail FILE shows the last 10. Try both on /etc/ettercap/etter.dns (also at /etc/Ettercap/etter.dns).",
          el: "head = πρώτες 10 γραμμές, tail = τελευταίες.",
        },
        shots: [
          shot("head /etc/ettercap/etter.dns", ["# etter.dns — HackForge lab copy of a DNS spoof config (educational)", "# This file is a TEXT example. Never use spoofing outside a lab you own.", "microsoft.com A 10.10.10.8"]),
          shot("tail /etc/ettercap/etter.dns", ["# operator workstation", "192.168.1.13 ptr kali.hackforge.lab"]),
        ],
      },
      {
        heading: { en: "nl — number lines", el: "nl — αρίθμηση" },
        body: {
          en: "nl FILE prints the file with line numbers. nl /etc/ettercap/etter.dns",
          el: "nl /etc/ettercap/etter.dns",
        },
        shots: [shot("nl /etc/ettercap/etter.dns", ["     1  # etter.dns — HackForge lab copy of a DNS spoof config (educational)"])],
      },
      {
        heading: { en: "sed — find & replace", el: "sed — εύρεση & αντικατάσταση" },
        body: {
          en: "sed can search a pattern and act on it. s/WWW/www/g means substitute WWW with www, globally. Run: sed s/WWW/www/g hackforge.in",
          el: "sed s/WWW/www/g hackforge.in",
        },
        shots: [shot("sed s/WWW/www/g hackforge.in", ["Visit www.HACKFORGE.LAB for the lab portal.", "www banners should be rewritten to www with sed.", "HackForge — not articles, a forge."])],
      },
      {
        heading: { en: "more and less", el: "more και less" },
        body: {
          en: "more FILE shows one page at a time (Enter to scroll). less FILE is similar and lets you search with /keyword (in a real terminal). Here they print the file so you can practise the commands. more /etc/ettercap/etter.dns   and   less /etc/ettercap/etter.dns",
          el: "more και less σελιδοποιούν. Στο lab τυπώνουν το αρχείο.",
        },
        shots: [shot("more /etc/ettercap/etter.dns", ["# etter.dns — HackForge lab copy …", "(page 1 — Enter would continue on a TTY)"])],
      },
    ],
    cheats: [
      { cmd: "head FILE", desc: { en: "first 10 lines", el: "πρώτες 10" } },
      { cmd: "tail FILE", desc: { en: "last 10 lines", el: "τελευταίες 10" } },
      { cmd: "nl FILE", desc: { en: "number lines", el: "αρίθμηση" } },
      { cmd: "sed s/A/B/g FILE", desc: { en: "replace A with B", el: "αντικατάσταση" } },
      { cmd: "more FILE", desc: { en: "page through", el: "σελίδες" } },
      { cmd: "less FILE", desc: { en: "page + search", el: "σελίδες + αναζήτηση" } },
    ],
    tasks: [
      {
        id: "head",
        instruction: { en: "head /etc/ettercap/etter.dns", el: "head /etc/ettercap/etter.dns" },
        hint: { en: "head /etc/ettercap/etter.dns", el: "head …" },
        explain: { en: "First ten lines.", el: "Πρώτες δέκα." },
        check: (t) => usedCmd(t, /^\s*head\b/) || t.flags.has("etter"),
      },
      {
        id: "tail",
        instruction: { en: "tail /etc/ettercap/etter.dns", el: "tail /etc/ettercap/etter.dns" },
        hint: { en: "tail /etc/ettercap/etter.dns", el: "tail …" },
        explain: { en: "Last ten lines.", el: "Τελευταίες δέκα." },
        check: (t) => usedCmd(t, /^\s*tail\b/),
      },
      {
        id: "nl",
        instruction: { en: "nl /etc/ettercap/etter.dns", el: "nl /etc/ettercap/etter.dns" },
        hint: { en: "nl /etc/ettercap/etter.dns", el: "nl …" },
        explain: { en: "Numbers every line.", el: "Αριθμεί γραμμές." },
        check: (t) => t.flags.has("nl") || usedCmd(t, /^\s*nl\b/),
      },
      {
        id: "sed",
        instruction: { en: "sed s/WWW/www/g hackforge.in", el: "sed s/WWW/www/g hackforge.in" },
        hint: { en: "cd /root ; sed s/WWW/www/g hackforge.in", el: "sed s/WWW/www/g hackforge.in" },
        explain: { en: "/g = replace every occurrence.", el: "/g = όλες τις εμφανίσεις." },
        check: (t) => t.flags.has("sed-www") || usedCmd(t, /sed\s+s\/WWW\/www/),
      },
      {
        id: "more",
        instruction: { en: "more /etc/ettercap/etter.dns", el: "more /etc/ettercap/etter.dns" },
        hint: { en: "more /etc/ettercap/etter.dns", el: "more …" },
        explain: { en: "Pager.", el: "Pager." },
        check: (t) => usedCmd(t, /^\s*more\b/),
      },
      {
        id: "less",
        instruction: { en: "less /etc/ettercap/etter.dns", el: "less /etc/ettercap/etter.dns" },
        hint: { en: "less /etc/ettercap/etter.dns", el: "less …" },
        explain: { en: "less can search with / in a real TTY.", el: "Σε αληθινό TTY το less ψάχνει με /." },
        check: (t) => usedCmd(t, /^\s*less\b/),
      },
    ],
    challenges: [
      {
        title: { en: "Both etter paths", el: "Και τα δύο etter paths" },
        brief: { en: "head /etc/Ettercap/etter.dns  (capital E, as in some installs)", el: "head /etc/Ettercap/etter.dns" },
        success: { en: "Linux paths are case-sensitive. We aliased both.", el: "Τα paths είναι case-sensitive." },
        check: (t) => usedCmd(t, /Ettercap/) || t.flags.has("etter"),
      },
      {
        title: { en: "Prove sed", el: "Απόδειξε sed" },
        brief: { en: "Re-run sed so WWW becomes www on hackforge.in", el: "Ξανά sed στο hackforge.in" },
        success: { en: "Substitution is non-destructive unless you redirect.", el: "Χωρίς redirect δεν αλλάζει το αρχείο." },
        check: (t) => t.flags.has("sed"),
      },
    ],
  },
];

export const SUDO_RUN_ALL: Module[] = [...SUDO_RUN_MODULES, ...SUDO_RUN_MODULES_B, ...SUDO_RUN_MODULES_C];
