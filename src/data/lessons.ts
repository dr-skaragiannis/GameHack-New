import type { Terminal } from "../lib/terminal";
import { usedCmd } from "../lib/terminal";
import { SUDO_RUN_ALL } from "./sudorun-lessons";
import { DFIR_MODULES } from "./dfir-lessons";

export type Bi = { en: string; el: string };

export type CheckCtx = Terminal;

export type Task = {
  id: string;
  instruction: Bi;
  hint: Bi;
  explain: Bi;
  check: (ctx: CheckCtx) => boolean;
  reward?: number;
};

export type Shot = { cmd?: string; caption?: Bi; lines: string[] };
export type VisualItem = {
  label: Bi;
  value?: Bi;
  detail?: Bi;
  tone?: "hot" | "cool" | "good" | "muted";
  depth?: number;
};
export type SectionVisual = {
  kind: "chain" | "timeline" | "tree" | "table" | "network" | "hash" | "hex" | "layers" | "memory" | "document" | "spectrum" | "report";
  title: Bi;
  caption?: Bi;
  items: VisualItem[];
};
export type Section = { heading: Bi; body: Bi; tip?: Bi; shots?: Shot[]; visual?: SectionVisual };

export type Challenge = {
  title: Bi;
  brief: Bi;
  success: Bi;
  check: (ctx: CheckCtx) => boolean;
};

export type Module = {
  id: string;
  order: number;
  icon: string;
  color: string;
  title: Bi;
  subtitle: Bi;
  difficulty: 1 | 2 | 3 | 4 | 5;
  badge: Bi;
  theory: Section[];
  cheats: { cmd: string; desc: Bi }[];
  tasks: Task[];
  challenges: [Challenge, Challenge];
  tool?: "terminal" | "browser" | "both";
  scenario?: "lab" | "raven" | "ssh" | "sudorun" | "dfir";
};

export type Campaign = {
  id: string;
  pathNumber: number;
  title: Bi;
  subtitle: Bi;
  blurb: Bi;
  scenario: "lab" | "raven" | "ssh" | "sudorun" | "dfir";
  accent: string;
  modules: Module[];
};

export const MODULES: Module[] = [
  {
    id: "linux-basics",
    order: 1,
    icon: "terminal",
    color: "from-ember-500 to-ember-700",
    difficulty: 1,
    title: { en: "Terminal & Linux Foundations", el: "Τερματικό & Θεμέλια Linux" },
    subtitle: { en: "Meet the command line, then navigate it", el: "Γνώρισε τη γραμμή εντολών και πλοηγήσου" },
    badge: { en: "Shell Initiate", el: "Μυημένος του Shell" },
    theory: [
      {
        heading: { en: "What is a terminal / CLI?", el: "Τι είναι το τερματικό / CLI;" },
        body: {
          en: "A terminal is a text window where you talk to the computer by typing commands instead of clicking. This is the Command Line Interface (CLI), driven by a program called the shell (here, bash). You type one line, press Enter, and the shell runs it and prints the result. Almost every hacking and security tool lives here — mastering the CLI is the single most important skill for a security professional.",
          el: "Το τερματικό είναι ένα παράθυρο κειμένου όπου μιλάς στον υπολογιστή γράφοντας εντολές αντί να κάνεις κλικ. Αυτό είναι το Command Line Interface (CLI), που το οδηγεί ένα πρόγραμμα, το shell (εδώ, bash). Γράφεις μια γραμμή, πατάς Enter, το shell την εκτελεί και τυπώνει το αποτέλεσμα. Σχεδόν κάθε εργαλείο χάκινγκ ζει εδώ — η κατοχή του CLI είναι η πιο σημαντική δεξιότητα ενός επαγγελματία ασφάλειας.",
        },
      },
      {
        heading: { en: "Reading the prompt", el: "Διαβάζοντας το prompt" },
        body: {
          en: "Before every command the shell shows a prompt, e.g. operator@kali:~$. It tells you WHO you are (operator), WHICH machine (kali) and WHERE you are (~ = home). The $ means a normal user; a # would mean you are root (admin). You type your command right after it and press Enter to run it.",
          el: "Πριν από κάθε εντολή το shell δείχνει ένα prompt, π.χ. operator@kali:~$. Σου λέει ΠΟΙΟΣ είσαι (operator), ΠΟΙΟ μηχάνημα (kali) και ΠΟΥ βρίσκεσαι (~ = home). Το $ σημαίνει απλός χρήστης· ένα # θα σήμαινε ότι είσαι root (διαχειριστής). Γράφεις την εντολή αμέσως μετά και πατάς Enter.",
        },
      },
      {
        heading: { en: "Work faster: Tab, history, clear", el: "Δούλεψε πιο γρήγορα: Tab, ιστορικό, clear" },
        body: {
          en: "Pros rarely type full commands. Press Tab to auto-complete a command or filename. Press ↑ and ↓ to scroll through commands you already ran. When the screen gets messy, type clear (or Ctrl+L). And help lists every command available in this lab.",
          el: "Οι επαγγελματίες σπάνια γράφουν ολόκληρες εντολές. Πάτα Tab για αυτόματη συμπλήρωση. Πάτα ↑ και ↓ για το ιστορικό. Γράψε clear (ή Ctrl+L) για καθαρισμό. Το help εμφανίζει όλες τις διαθέσιμες εντολές.",
        },
        tip: {
          en: "Tab is your best friend: it saves time AND prevents typos in long filenames.",
          el: "Το Tab είναι ο καλύτερός σου φίλος: γλιτώνει χρόνο ΚΑΙ αποτρέπει λάθη.",
        },
      },
      {
        heading: { en: "Where am I? (pwd, ls, cd, cat)", el: "Πού βρίσκομαι;" },
        body: {
          en: "The filesystem is a tree that starts at the root /. pwd prints your current location. ls lists a folder; ls -a also reveals hidden files (names starting with a dot). cd folder moves in, cd .. goes up, and cat file prints a file's contents.",
          el: "Το σύστημα αρχείων είναι ένα δέντρο από τη ρίζα /. Το pwd δείχνει τη θέση σου. Το ls εμφανίζει φάκελο· το ls -a αποκαλύπτει κρυφά αρχεία. Το cd μπαίνει σε φάκελο, το cd .. ανεβαίνει, και το cat τυπώνει αρχείο.",
        },
        tip: {
          en: "Hidden files are a favorite place to stash secrets and config — always check with ls -a.",
          el: "Τα κρυφά αρχεία είναι αγαπημένο σημείο για μυστικά — έλεγχε πάντα με ls -a.",
        },
      },
    ],
    cheats: [
      { cmd: "help", desc: { en: "list all available commands", el: "όλες οι διαθέσιμες εντολές" } },
      { cmd: "Tab ↹", desc: { en: "auto-complete command/file", el: "αυτόματη συμπλήρωση" } },
      { cmd: "whoami", desc: { en: "current user", el: "τρέχων χρήστης" } },
      { cmd: "pwd", desc: { en: "print current directory", el: "τρέχων φάκελος" } },
      { cmd: "ls / ls -a / ls -l", desc: { en: "list files (all / long)", el: "λίστα αρχείων" } },
      { cmd: "cd DIR / cd ..", desc: { en: "change directory / go up", el: "αλλαγή φακέλου" } },
      { cmd: "cat FILE", desc: { en: "show file contents", el: "εμφάνιση περιεχομένου" } },
    ],
    tasks: [
      {
        id: "help",
        instruction: { en: "Type help to see every command available in this lab.", el: "Γράψε help για να δεις όλες τις εντολές." },
        hint: { en: "help", el: "help" },
        explain: {
          en: "WHY: When you sit at an unfamiliar shell, learn what you can do first. HOW: type help and press Enter.",
          el: "ΓΙΑΤΙ: Σε άγνωστο shell, μάθε πρώτα τι μπορείς να κάνεις. ΠΩΣ: γράψε help και πάτα Enter.",
        },
        check: (t) => usedCmd(t, /^\s*help\b/),
      },
      {
        id: "whoami",
        instruction: { en: "Run whoami to confirm your identity.", el: "Τρέξε whoami για να επιβεβαιώσεις την ταυτότητά σου." },
        hint: { en: "whoami", el: "whoami" },
        explain: {
          en: "WHY: Always know which user you are before you act. HOW: whoami prints the current account name.",
          el: "ΓΙΑΤΙ: Πάντα να ξέρεις ποιος χρήστης είσαι. ΠΩΣ: το whoami τυπώνει το όνομα λογαριασμού.",
        },
        check: (t) => t.flags.has("whoami") || usedCmd(t, /^\s*whoami\b/),
      },
      {
        id: "pwd",
        instruction: { en: "Print your working directory with pwd.", el: "Τύπωσε τον τρέχοντα φάκελο με pwd." },
        hint: { en: "pwd", el: "pwd" },
        explain: {
          en: "WHY: Orientation. HOW: pwd → print working directory.",
          el: "ΓΙΑΤΙ: Προσανατολισμός. ΠΩΣ: pwd.",
        },
        check: (t) => t.flags.has("pwd") || usedCmd(t, /^\s*pwd\b/),
      },
      {
        id: "ls",
        instruction: { en: "List the files in your home with ls.", el: "Λίσταρχεία στο home με ls." },
        hint: { en: "ls", el: "ls" },
        explain: {
          en: "WHY: See what is around you. HOW: ls lists the current directory.",
          el: "ΓΙΑΤΙ: Δες τι υπάρχει γύρω σου. ΠΩΣ: ls.",
        },
        check: (t) => t.flags.has("ls") || usedCmd(t, /^\s*ls\b/),
      },
      {
        id: "cat-welcome",
        instruction: { en: "Read welcome.txt with cat.", el: "Διάβασε το welcome.txt με cat." },
        hint: { en: "cat welcome.txt", el: "cat welcome.txt" },
        explain: {
          en: "WHY: cat concatenates and prints files. HOW: cat welcome.txt",
          el: "ΓΙΑΤΙ: το cat τυπώνει αρχεία. ΠΩΣ: cat welcome.txt",
        },
        check: (t) => t.flags.has("read-welcome") || usedCmd(t, /cat\s+.*welcome/),
      },
    ],
    challenges: [
      {
        title: { en: "Hidden in the home", el: "Κρυμμένο στο home" },
        brief: {
          en: "There is a hidden file in your home directory. Find it and read it.",
          el: "Υπάρχει κρυφό αρχείο στο home. Βρες το και διάβασέ το.",
        },
        success: { en: "You uncovered a dotfile. Operators always ls -a.", el: "Αποκάλυψες ένα dotfile. Οι χειριστές πάντα κάνουν ls -a." },
        check: (t) => t.flags.has("read-secret") || t.flags.has("saw:FLAG{hidden_in_plain_sight}"),
      },
      {
        title: { en: "Leave a trail", el: "Άσε ίχνος" },
        brief: {
          en: "Change into the documents folder, then prove you were there by reading readme.md.",
          el: "Μπες στον φάκελο documents και διάβασε το readme.md.",
        },
        success: { en: "Navigation locked in.", el: "Η πλοήγηση κλείδωσε." },
        check: (t) => t.filesRead.some((p) => p.includes("readme.md")) || usedCmd(t, /cat\s+.*readme/),
      },
    ],
  },
  {
    id: "files",
    order: 2,
    icon: "folder",
    color: "from-amber-500 to-orange-700",
    difficulty: 1,
    title: { en: "Files, Paths & Hunting", el: "Αρχεία, διαδρομές & αναζήτηση" },
    subtitle: { en: "find, grep and the shape of the tree", el: "find, grep και το δέντρο αρχείων" },
    badge: { en: "File Hunter", el: "Κυνηγός αρχείων" },
    theory: [
      {
        heading: { en: "Absolute vs relative paths", el: "Απόλυτες vs σχετικές διαδρομές" },
        body: {
          en: "An absolute path starts at / (e.g. /etc/passwd). A relative path starts from where you are (e.g. ../notes.txt). ~ always means your home. Mixing them up is the #1 beginner trap.",
          el: "Μια απόλυτη διαδρομή ξεκινά από / (π.χ. /etc/passwd). Μια σχετική ξεκινά από εκεί που είσαι. Το ~ είναι πάντα το home.",
        },
      },
      {
        heading: { en: "find and grep", el: "find και grep" },
        body: {
          en: "find /home -name '*.txt' walks a tree looking for names. grep PATTERN file searches inside a file. Together they are how you hunt secrets, configs and leftovers on a box.",
          el: "Το find περπατά το δέντρο. Το grep ψάχνει μέσα σε αρχείο. Μαζί κυνηγάς μυστικά και ρυθμίσεις.",
        },
        tip: {
          en: "On a real engagement, start with find and grep before you install anything new.",
          el: "Σε πραγματικό engagement, ξεκίνα με find και grep πριν εγκαταστήσεις οτιδήποτε.",
        },
      },
    ],
    cheats: [
      { cmd: "find PATH -name GLOB", desc: { en: "search by name", el: "αναζήτηση με όνομα" } },
      { cmd: "grep PAT FILE", desc: { en: "search file contents", el: "αναζήτηση περιεχομένου" } },
      { cmd: "cat /etc/passwd", desc: { en: "list local users", el: "λίστα χρηστών" } },
    ],
    tasks: [
      {
        id: "etc-passwd",
        instruction: { en: "Read /etc/passwd to list local accounts.", el: "Διάβασε το /etc/passwd." },
        hint: { en: "cat /etc/passwd", el: "cat /etc/passwd" },
        explain: {
          en: "WHY: User enumeration starts with /etc/passwd. HOW: cat /etc/passwd",
          el: "ΓΙΑΤΙ: Η απαρίθμηση χρηστών ξεκινά από /etc/passwd.",
        },
        check: (t) => t.flags.has("read-passwd"),
      },
      {
        id: "find-txt",
        instruction: { en: "Use find to locate files named *.txt under /home.", el: "Βρες αρχεία *.txt κάτω από /home με find." },
        hint: { en: "find /home -name '*.txt'", el: "find /home -name '*.txt'" },
        explain: {
          en: "WHY: You will not remember every path. HOW: find /home -name '*.txt'",
          el: "ΓΙΑΤΙ: Δεν θα θυμάσαι κάθε διαδρομή. ΠΩΣ: find /home -name '*.txt'",
        },
        check: (t) => t.flags.has("find") || usedCmd(t, /^\s*find\b/),
      },
      {
        id: "grep-todo",
        instruction: { en: "grep the word enumerate inside notes.txt.", el: "Κάνε grep τη λέξη enumerate στο notes.txt." },
        hint: { en: "grep enumerate notes.txt", el: "grep enumerate notes.txt" },
        explain: {
          en: "WHY: grep pulls signal out of noise. HOW: grep enumerate notes.txt",
          el: "ΓΙΑΤΙ: το grep βγάζει σήμα από θόρυβο.",
        },
        check: (t) => t.flags.has("grep") || usedCmd(t, /^\s*grep\b/),
      },
    ],
    challenges: [
      {
        title: { en: "Wordlist in the toolbox", el: "Wordlist στα εργαλεία" },
        brief: { en: "Read the wordlist in your tools folder.", el: "Διάβασε το wordlist στον φάκελο tools." },
        success: { en: "You found the dictionary. Brute-force labs will need it.", el: "Βρήκες το λεξικό." },
        check: (t) => t.flags.has("read-wordlist"),
      },
      {
        title: { en: "Hosts file intel", el: "Πληροφορίες hosts" },
        brief: { en: "Read /etc/hosts and learn the lab hostnames.", el: "Διάβασε το /etc/hosts." },
        success: { en: "Name resolution mapped.", el: "Η ανάλυση ονομάτων χαρτογραφήθηκε." },
        check: (t) => t.flags.has("read-hosts"),
      },
    ],
  },
  {
    id: "permissions",
    order: 3,
    icon: "lock",
    color: "from-violet-500 to-purple-800",
    difficulty: 2,
    title: { en: "Permissions & Identity", el: "Δικαιώματα & ταυτότητα" },
    subtitle: { en: "ls -l, sudo -l, and why root is a big deal", el: "ls -l, sudo -l και γιατί το root μετράει" },
    badge: { en: "Gatekeeper", el: "Θυρωρός" },
    theory: [
      {
        heading: { en: "rwx and ls -l", el: "rwx και ls -l" },
        body: {
          en: "Every file has a mode string like -rw-r--r--. The first char is type (- file, d directory). Then three triples: owner, group, others — read, write, execute. ls -l shows this. Permission denied means you asked for a bit you do not have.",
          el: "Κάθε αρχείο έχει mode όπως -rw-r--r--. Το ls -l το δείχνει. Permission denied σημαίνει ότι ζήτησες bit που δεν έχεις.",
        },
      },
      {
        heading: { en: "sudo and the principle of least privilege", el: "sudo και ελάχιστο προνόμιο" },
        body: {
          en: "sudo lets a user run a command as root. sudo -l lists what YOU are allowed to run. On a pentest, sudo -l is one of the first privilege-escalation checks — misconfigured sudo is a classic path to root. Never run sudo on a system you do not own.",
          el: "Το sudo τρέχει εντολή ως root. Το sudo -l δείχνει τι ΕΠΙΤΡΕΠΕΤΑΙ σε σένα. Σε pentest είναι από τους πρώτους ελέγχους ανύψωσης προνομίων.",
        },
      },
    ],
    cheats: [
      { cmd: "ls -l", desc: { en: "long listing with modes", el: "αναλυτική λίστα" } },
      { cmd: "id", desc: { en: "uid, gid, groups", el: "uid, gid, ομάδες" } },
      { cmd: "sudo -l", desc: { en: "list sudo privileges", el: "λίστα sudo" } },
    ],
    tasks: [
      {
        id: "lsl",
        instruction: { en: "Run ls -l in your home to see file modes.", el: "Τρέξε ls -l στο home." },
        hint: { en: "ls -l", el: "ls -l" },
        explain: { en: "WHY: Modes tell you what you can touch.", el: "ΓΙΑΤΙ: Τα modes λένε τι μπορείς να αγγίξεις." },
        check: (t) => t.flags.has("ls-l") || usedCmd(t, /ls\s+-[al]*l/),
      },
      {
        id: "id",
        instruction: { en: "Run id to see uid/gid/groups.", el: "Τρέξε id." },
        hint: { en: "id", el: "id" },
        explain: { en: "WHY: Groups often grant extra rights (sudo, docker, disk).", el: "ΓΙΑΤΙ: Οι ομάδες δίνουν έξτρα δικαιώματα." },
        check: (t) => t.flags.has("id") || usedCmd(t, /^\s*id\b/),
      },
      {
        id: "sudo-l",
        instruction: { en: "Ask sudo what you are allowed to run: sudo -l", el: "Ρώτα το sudo: sudo -l" },
        hint: { en: "sudo -l", el: "sudo -l" },
        explain: { en: "WHY: Misconfigured sudo is a highway to root.", el: "ΓΙΑΤΙ: Λάθος sudo οδηγεί σε root." },
        check: (t) => t.flags.has("sudo-l") || usedCmd(t, /sudo\s+-l/),
      },
    ],
    challenges: [
      {
        title: { en: "Shadow is not for you", el: "Το shadow δεν είναι για σένα" },
        brief: { en: "Try to read /etc/shadow. Observe the denial. That is the lesson.", el: "Δοκίμασε να διαβάσεις /etc/shadow." },
        success: { en: "Denied — as it should be. Root-only files exist for a reason.", el: "Άρνηση — όπως πρέπει." },
        check: (t) => usedCmd(t, /cat\s+\/etc\/shadow/),
      },
      {
        title: { en: "Who is root, really?", el: "Ποιος είναι root;" },
        brief: { en: "Confirm with whoami after reviewing sudo -l — stay a mortal for now.", el: "Επιβεβαίωσε με whoami — μείνε απλός χρήστης προς το παρόν." },
        success: { en: "Identity check complete.", el: "Έλεγχος ταυτότητας OK." },
        check: (t) => t.flags.has("whoami") && t.flags.has("sudo-l"),
      },
    ],
  },
  {
    id: "networking",
    order: 4,
    icon: "wifi",
    color: "from-cyan-500 to-sky-800",
    difficulty: 2,
    title: { en: "Networking Primer", el: "Εισαγωγή στα δίκτυα" },
    subtitle: { en: "Interfaces, ping, and the lab subnet", el: "Διεπαφές, ping και το subnet του lab" },
    badge: { en: "Packet Rider", el: "Αναβάτης πακέτων" },
    theory: [
      {
        heading: { en: "Your address on the wire", el: "Η διεύθυνσή σου στο δίκτυο" },
        body: {
          en: "ip addr (or ifconfig) shows your interfaces. In this lab you are 10.10.10.2/24 — a private training net. Hosts you will attack later live in 10.10.10.0/24. Ping proves a host is up (if ICMP is allowed).",
          el: "Το ip addr δείχνει τις διεπαφές. Εδώ είσαι 10.10.10.2/24. Οι στόχοι ζουν στο 10.10.10.0/24.",
        },
      },
      {
        heading: { en: "Ethics of scanning", el: "Ηθική της σάρωσης" },
        body: {
          en: "Sending packets at a host you do not own can be illegal. In HACKFORGE every address is fake and local. Outside, you need a written rules-of-engagement. When in doubt, do not scan.",
          el: "Η αποστολή πακέτων σε σύστημα που δεν σου ανήκει μπορεί να είναι παράνομη. Στο HACKFORGE όλες οι διευθύνσεις είναι ψεύτικες.",
        },
      },
    ],
    cheats: [
      { cmd: "ip addr", desc: { en: "show interfaces", el: "εμφάνιση διεπαφών" } },
      { cmd: "ping HOST", desc: { en: "icmp echo", el: "icmp echo" } },
      { cmd: "cat /etc/hosts", desc: { en: "local DNS names", el: "τοπικά ονόματα" } },
    ],
    tasks: [
      {
        id: "ip",
        instruction: { en: "Show your interface with ip addr (or ifconfig).", el: "Δείξε τη διεπαφή με ip addr." },
        hint: { en: "ip addr", el: "ip addr" },
        explain: { en: "WHY: Know your own IP before you scan others.", el: "ΓΙΑΤΙ: Ξέρε τη IP σου πριν σαρώσεις." },
        check: (t) => t.flags.has("ip") || usedCmd(t, /\b(ip|ifconfig)\b/),
      },
      {
        id: "ping",
        instruction: { en: "Ping raven.lab or 10.10.10.5.", el: "Κάνε ping το raven.lab ή 10.10.10.5." },
        hint: { en: "ping 10.10.10.5", el: "ping 10.10.10.5" },
        explain: { en: "WHY: Host discovery 101.", el: "ΓΙΑΤΙ: Ανακάλυψη hosts." },
        check: (t) => t.flags.has("ping") || usedCmd(t, /^\s*ping\b/),
      },
      {
        id: "hosts",
        instruction: { en: "Read /etc/hosts to map names to IPs.", el: "Διάβασε /etc/hosts." },
        hint: { en: "cat /etc/hosts", el: "cat /etc/hosts" },
        explain: { en: "WHY: Names beat remembering octets.", el: "ΓΙΑΤΙ: Τα ονόματα είναι καλύτερα από οκτάδες." },
        check: (t) => t.flags.has("read-hosts"),
      },
    ],
    challenges: [
      {
        title: { en: "Touch the web box", el: "Άγγιξε το web" },
        brief: { en: "Ping 10.10.10.8 (web.lab) as well.", el: "Κάνε ping το 10.10.10.8." },
        success: { en: "Two hosts alive on the forge net.", el: "Δύο hosts ζωντανοί." },
        check: (t) => usedCmd(t, /ping\s+.*(10\.10\.10\.8|web\.lab)/),
      },
      {
        title: { en: "Know thyself", el: "Γνώθι σαυτόν" },
        brief: { en: "Run hostname so you remember which box you are on.", el: "Τρέξε hostname." },
        success: { en: "You are kali. Don't lose the plot.", el: "Είσαι kali." },
        check: (t) => usedCmd(t, /^\s*hostname\b/),
      },
    ],
  },
  {
    id: "recon",
    order: 5,
    icon: "radar",
    color: "from-emerald-400 to-teal-800",
    difficulty: 3,
    title: { en: "Reconnaissance", el: "Αναγνώριση" },
    subtitle: { en: "Sweep the subnet. Find what is alive.", el: "Σάρωσε το subnet. Βρες τι ζει." },
    badge: { en: "Recon Scout", el: "Κατάσκοπος recon" },
    theory: [
      {
        heading: { en: "Active vs passive recon", el: "Ενεργητική vs παθητική recon" },
        body: {
          en: "Passive recon uses public data (DNS, whois, search engines) and does not touch the target. Active recon sends packets (ping sweeps, nmap). This lab teaches active recon against simulated hosts only.",
          el: "Η παθητική recon χρησιμοποιεί δημόσια δεδομένα. Η ενεργητική στέλνει πακέτα. Εδώ μόνο προσομοιωμένοι στόχοι.",
        },
      },
      {
        heading: { en: "Network sweeps with nmap", el: "Σαρώσεις με nmap" },
        body: {
          en: "nmap 10.10.10.0/24 asks every address in the /24 if it is up. On a /24 that is 256 hosts. Use this to build your target list before you port-scan a single machine.",
          el: "Το nmap 10.10.10.0/24 ρωτά κάθε διεύθυνση αν είναι ζωντανή. Χτίσε λίστα στόχων πριν σαρώσεις θύρες.",
        },
        tip: {
          en: "Never sweep a network that is not in your written scope.",
          el: "Μην σαρώνεις δίκτυο εκτός γραπτού scope.",
        },
      },
    ],
    cheats: [
      { cmd: "nmap 10.10.10.0/24", desc: { en: "ping sweep the lab net", el: "σάρωση του lab net" } },
      { cmd: "nmap 10.10.10.5", desc: { en: "quick host scan", el: "γρήγορη σάρωση host" } },
    ],
    tasks: [
      {
        id: "sweep",
        instruction: { en: "Sweep the lab subnet: nmap 10.10.10.0/24", el: "Σάρωσε: nmap 10.10.10.0/24" },
        hint: { en: "nmap 10.10.10.0/24", el: "nmap 10.10.10.0/24" },
        explain: { en: "WHY: You cannot hack a host you have not found.", el: "ΓΙΑΤΙ: Δεν χτυπάς host που δεν βρήκες." },
        check: (t) => t.flags.has("nmap-sweep") || usedCmd(t, /nmap\s+.*10\.10\.10\.0\/24/),
      },
      {
        id: "host",
        instruction: { en: "Scan a single host — try nmap 10.10.10.5", el: "Σάρωσε ένα host — nmap 10.10.10.5" },
        hint: { en: "nmap 10.10.10.5", el: "nmap 10.10.10.5" },
        explain: { en: "WHY: Host scans reveal open ports.", el: "ΓΙΑΤΙ: Οι σαρώσεις αποκαλύπτουν θύρες." },
        check: (t) => t.flags.has("nmap-host") || t.flags.has("nmap-raven") || usedCmd(t, /nmap\s+.*10\.10\.10\.\d+/),
      },
    ],
    challenges: [
      {
        title: { en: "Name the four", el: "Ονόμασε τους τέσσερις" },
        brief: { en: "After the sweep, read tools/targets.txt and confirm the four lab hosts.", el: "Διάβασε tools/targets.txt." },
        success: { en: "Target list confirmed.", el: "Η λίστα στόχων επιβεβαιώθηκε." },
        check: (t) => t.filesRead.some((p) => p.includes("targets.txt")) || usedCmd(t, /cat\s+.*targets/),
      },
      {
        title: { en: "Web box ports", el: "Θύρες του web" },
        brief: { en: "Port-scan 10.10.10.8.", el: "Σάρωσε θύρες στο 10.10.10.8." },
        success: { en: "web.lab fingerprint started.", el: "Το fingerprint του web.lab ξεκίνησε." },
        check: (t) => t.flags.has("nmap-web") || usedCmd(t, /nmap\s+.*10\.10\.10\.8/),
      },
    ],
  },
  {
    id: "scanning",
    order: 6,
    icon: "scan",
    color: "from-sky-400 to-indigo-800",
    difficulty: 3,
    title: { en: "Service Scanning", el: "Σάρωση υπηρεσιών" },
    subtitle: { en: "Versions, banners, and what they imply", el: "Εκδόσεις, banners και τι σημαίνουν" },
    badge: { en: "Port Mapper", el: "Χαρτογράφος θυρών" },
    theory: [
      {
        heading: { en: "Why versions matter", el: "Γιατί μετράνε οι εκδόσεις" },
        body: {
          en: "An open port is a door. The version behind it tells you which key might fit. nmap -sV probes services for banners (OpenSSH 8.4, Apache 2.4, …). You then research known weaknesses — in scope, in a lab, never in the wild without permission.",
          el: "Μια ανοιχτή θύρα είναι πόρτα. Η έκδοση λέει ποιο κλειδί ίσως ταιριάζει. Το nmap -sV διαβάζει banners.",
        },
      },
    ],
    cheats: [
      { cmd: "nmap -sV HOST", desc: { en: "service version detection", el: "ανίχνευση έκδοσης" } },
      { cmd: "curl http://HOST/", desc: { en: "grab a web banner", el: "web banner" } },
    ],
    tasks: [
      {
        id: "sv",
        instruction: { en: "Run nmap -sV against raven.lab (10.10.10.5).", el: "Τρέξε nmap -sV στο 10.10.10.5." },
        hint: { en: "nmap -sV 10.10.10.5", el: "nmap -sV 10.10.10.5" },
        explain: { en: "WHY: Version detection turns ports into software.", el: "ΓΙΑΤΙ: Οι εκδόσεις μετατρέπουν θύρες σε λογισμικό." },
        check: (t) => t.flags.has("nmap-sv") || usedCmd(t, /nmap\s+.*-sV/),
      },
      {
        id: "curl",
        instruction: { en: "curl the web box: curl http://10.10.10.8/", el: "curl http://10.10.10.8/" },
        hint: { en: "curl http://10.10.10.8/", el: "curl http://10.10.10.8/" },
        explain: { en: "WHY: HTTP is often the loudest service.", el: "ΓΙΑΤΙ: Το HTTP είναι συχνά η πιο φωνακλάδικη υπηρεσία." },
        check: (t) => t.flags.has("curl-web") || t.flags.has("curl-raven") || usedCmd(t, /^\s*curl\b/),
      },
    ],
    challenges: [
      {
        title: { en: "Raven's HTTP", el: "Το HTTP του Raven" },
        brief: { en: "curl http://10.10.10.5/ and note the CMS name.", el: "curl http://10.10.10.5/" },
        success: { en: "Raven CMS spotted.", el: "Εντοπίστηκε Raven CMS." },
        check: (t) => t.flags.has("curl-raven") || usedCmd(t, /curl\s+.*10\.10\.10\.5/),
      },
      {
        title: { en: "SSH on the jump", el: "SSH στο jump" },
        brief: { en: "Version-scan 10.10.10.12 (ssh.lab).", el: "Σάρωσε το 10.10.10.12." },
        success: { en: "OpenSSH banner captured.", el: "Banner OpenSSH." },
        check: (t) => t.flags.has("nmap-ssh") || usedCmd(t, /nmap\s+.*10\.10\.10\.12/),
      },
    ],
  },
  {
    id: "bruteforce",
    order: 7,
    icon: "hammer",
    color: "from-rose-500 to-red-800",
    difficulty: 3,
    title: { en: "Credential Attacks (Lab)", el: "Επιθέσεις διαπιστευτηρίων (Lab)" },
    subtitle: { en: "Dictionary attacks against a simulated SSH", el: "Επιθέσεις λεξικού σε προσομοιωμένο SSH" },
    badge: { en: "Lock Breaker", el: "Κλειδοσπάστης" },
    theory: [
      {
        heading: { en: "What brute force is — and is not", el: "Τι είναι (και δεν είναι) το brute force" },
        body: {
          en: "A dictionary attack tries likely passwords from a list. It is noisy, slow, and illegal against systems you do not own. We simulate hydra against ssh.lab so you understand the pattern: service + username + wordlist. Defenders rate-limit, lock accounts, and require keys for a reason.",
          el: "Μια επίθεση λεξικού δοκιμάζει πιθανούς κωδικούς. Είναι θορυβώδης και παράνομη εκτός εξουσιοδότησης. Εδώ είναι προσομοίωση.",
        },
        tip: {
          en: "Real takeaway: disable password SSH, use keys, enable 2FA, and alert on hydra-like traffic.",
          el: "Ουσία: απενεργοποίησε password SSH, βάλε κλειδιά και 2FA.",
        },
      },
    ],
    cheats: [
      { cmd: "hydra -l USER -P FILE ssh://HOST", desc: { en: "dictionary SSH (sim)", el: "λεξικό SSH (sim)" } },
      { cmd: "cat tools/wordlist.txt", desc: { en: "training wordlist", el: "λεξικό εκπαίδευσης" } },
    ],
    tasks: [
      {
        id: "wordlist",
        instruction: { en: "Read tools/wordlist.txt so you know the dictionary.", el: "Διάβασε tools/wordlist.txt." },
        hint: { en: "cat tools/wordlist.txt", el: "cat ~/tools/wordlist.txt" },
        explain: { en: "WHY: Know your ammo.", el: "ΓΙΑΤΙ: Ξέρε τα πυρομαχικά σου." },
        check: (t) => t.flags.has("read-wordlist"),
      },
      {
        id: "hydra",
        instruction: {
          en: "Spray ssh.lab: hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12",
          el: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12",
        },
        hint: { en: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12", el: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12" },
        explain: {
          en: "WHY: See how fast a weak password falls in a lab. HOW: hydra with -l user and -P wordlist.",
          el: "ΓΙΑΤΙ: Δες πόσο γρήγορα πέφτει αδύναμος κωδικός στο lab.",
        },
        check: (t) => t.flags.has("hydra-win") || t.flags.has("hydra"),
      },
    ],
    challenges: [
      {
        title: { en: "Confirm the login", el: "Επιβεβαίωσε τη σύνδεση" },
        brief: { en: "SSH as labuser to 10.10.10.12 using the recovered password.", el: "SSH ως labuser στο 10.10.10.12." },
        success: { en: "Session opened on ssh.lab.", el: "Συνεδρία στο ssh.lab." },
        check: (t) => t.flags.has("ssh-labuser") || usedCmd(t, /ssh\s+.*labuser/),
      },
      {
        title: { en: "Read the note", el: "Διάβασε τη σημείωση" },
        brief: { en: "Read documents/credentials.txt — never store plaintext creds.", el: "Διάβασε documents/credentials.txt." },
        success: { en: "You saw why secrets in git/home dirs get people fired.", el: "Είδες γιατί τα μυστικά στο home είναι λάθος." },
        check: (t) => t.flags.has("read-creds"),
      },
    ],
  },
  {
    id: "sqli",
    order: 8,
    icon: "database",
    color: "from-yellow-400 to-orange-700",
    difficulty: 4,
    title: { en: "SQL Injection (Lab)", el: "SQL Injection (Lab)" },
    subtitle: { en: "Detect and extract — simulated only", el: "Ανίχνευση και εξαγωγή — μόνο προσομοίωση" },
    badge: { en: "Query Bender", el: "Λυγιστής ερωτημάτων" },
    theory: [
      {
        heading: { en: "The idea, not a weapon", el: "Η ιδέα, όχι όπλο" },
        body: {
          en: "SQL injection happens when untrusted input is concatenated into a query. Classic test: a single quote that breaks syntax. In this lab, curl a simulated login with an id= parameter. We do not teach bypassing real WAF/production DBs. Defenders: use parameterised queries, ORMs, and least-privilege DB users.",
          el: "Το SQLi συμβαίνει όταν μη έμπιστη είσοδος μπαίνει σε ερώτημα. Υπερασπιστές: parameterized queries.",
        },
      },
    ],
    cheats: [
      { cmd: "curl 'http://10.10.10.8/login.php?id=1'", desc: { en: "normal request", el: "κανονικό αίτημα" } },
      { cmd: "sqlmap -u URL", desc: { en: "automated detection (sim)", el: "αυτόματη ανίχνευση (sim)" } },
    ],
    tasks: [
      {
        id: "normal",
        instruction: { en: "Fetch the login page: curl http://10.10.10.8/login.php?id=1", el: "curl http://10.10.10.8/login.php?id=1" },
        hint: { en: "curl 'http://10.10.10.8/login.php?id=1'", el: "curl 'http://10.10.10.8/login.php?id=1'" },
        explain: { en: "WHY: Always capture a clean baseline.", el: "ΓΙΑΤΙ: Πάντα baseline." },
        check: (t) => usedCmd(t, /curl\s+.*login\.php/) || t.flags.has("curl"),
      },
      {
        id: "sqlmap",
        instruction: { en: "Run sqlmap against the lab URL (simulated).", el: "Τρέξε sqlmap στο lab URL." },
        hint: { en: "sqlmap -u http://10.10.10.8/login.php?id=1", el: "sqlmap -u http://10.10.10.8/login.php?id=1" },
        explain: { en: "WHY: Tools show how loud automated injection is — defenders notice.", el: "ΓΙΑΤΙ: Τα εργαλεία είναι θορυβώδη — οι defenders το βλέπουν." },
        check: (t) => t.flags.has("sqlmap") || t.flags.has("sqli-win"),
      },
    ],
    challenges: [
      {
        title: { en: "Union extract", el: "Εξαγωγή UNION" },
        brief: { en: "Trigger the simulated UNION path (quote + or/union in the id param) or finish sqlmap.", el: "Πυροδότησε το προσομοιωμένο UNION." },
        success: { en: "You extracted a lab flag from a fake database.", el: "Έβγαλες flag από ψεύτικη βάση." },
        check: (t) => t.flags.has("sqli-win") || t.flags.has("saw:FLAG{sqli_union_selected}"),
      },
      {
        title: { en: "Submit the flag", el: "Υπέβαλε τη σημαία" },
        brief: { en: "submit FLAG{sqli_union_selected}", el: "submit FLAG{sqli_union_selected}" },
        success: { en: "Query bent. Parameterise your SQL in real apps.", el: "Λύγισες το ερώτημα. Στις πραγματικές εφαρμογές: parameterized SQL." },
        check: (t) => t.flags.has("submit:FLAG{sqli_union_selected}") || t.flags.has("sqli-win"),
      },
    ],
  },
  {
    id: "privesc",
    order: 9,
    icon: "crown",
    color: "from-amber-300 to-ember-700",
    difficulty: 5,
    title: { en: "Privilege Escalation", el: "Ανύψωση προνομίων" },
    subtitle: { en: "sudo -l, GTFOBins, and getting root in the sandbox", el: "sudo -l, GTFOBins και root στο sandbox" },
    badge: { en: "Root Forged", el: "Root σφυρηλατημένο" },
    theory: [
      {
        heading: { en: "From user to root", el: "Από χρήστη σε root" },
        body: {
          en: "Privilege escalation is what you do after a foothold: look for sudo rights, SUID binaries, writable cron, kernel bugs. In this lab, sudo -l reveals that find can run as root — a well-known GTFOBins path. Understanding it makes you a better defender (remove those rights).",
          el: "Η ανύψωση προνομίων γίνεται μετά το foothold: sudo, SUID, cron. Εδώ το find επιτρέπεται ως root.",
        },
      },
    ],
    cheats: [
      { cmd: "sudo -l", desc: { en: "list sudo grants", el: "λίστα sudo" } },
      { cmd: "sudo find / -name flag.txt", desc: { en: "abused find (sim)", el: "find ως root (sim)" } },
    ],
    tasks: [
      {
        id: "sudo-l",
        instruction: { en: "Re-check sudo -l.", el: "Ξανατσέκαρε sudo -l." },
        hint: { en: "sudo -l", el: "sudo -l" },
        explain: { en: "WHY: Always re-enumerate on a new box.", el: "ΓΙΑΤΙ: Πάντα επαναρίθμηση." },
        check: (t) => t.flags.has("sudo-l"),
      },
      {
        id: "root",
        instruction: { en: "Escalate using sudo find (see cheatsheet).", el: "Ανύψωσε με sudo find." },
        hint: { en: "sudo find / -name flag.txt", el: "sudo find / -name flag.txt" },
        explain: { en: "WHY: find with sudo can spawn a shell. Defenders: never sudo find.", el: "ΓΙΑΤΙ: το find με sudo μπορεί να δώσει shell." },
        check: (t) => t.flags.has("got-root") || t.flags.has("privesc-find"),
      },
    ],
    challenges: [
      {
        title: { en: "Read the root flag", el: "Διάβασε το root flag" },
        brief: { en: "As root, cat /root/flag.txt", el: "Ως root, cat /root/flag.txt" },
        success: { en: "Root of the forge. You are dangerous — stay ethical.", el: "Root του καμινιού. Μείνε ηθικός." },
        check: (t) => t.flags.has("read-root-flag") || t.flags.has("saw:FLAG{root_of_the_forge}") || t.flags.has("got-root"),
      },
      {
        title: { en: "Submit it", el: "Υπέβαλέ το" },
        brief: { en: "submit FLAG{root_of_the_forge}", el: "submit FLAG{root_of_the_forge}" },
        success: { en: "Campaign I complete.", el: "Καμπάνια I ολοκληρώθηκε." },
        check: (t) => t.flags.has("submit:FLAG{root_of_the_forge}") || t.flags.has("got-root"),
      },
    ],
  },
  {
    id: "raven-recon",
    order: 1,
    icon: "radar",
    color: "from-zinc-400 to-zinc-800",
    difficulty: 3,
    title: { en: "Raven — Recon", el: "Raven — Αναγνώριση" },
    subtitle: { en: "Enumerate the nevermore box", el: "Απαρίθμησε το nevermore" },
    badge: { en: "Raven Scout", el: "Κατάσκοπος Raven" },
    scenario: "raven",
    theory: [
      {
        heading: { en: "Boot2root methodology", el: "Μεθοδολογία boot2root" },
        body: {
          en: "A boot2root machine is a legal playground: recon → foothold → enumerate → privesc → flags. Raven is inspired by classic CTF boxes. Stay inside the lab.",
          el: "Ένα boot2root είναι νόμιμο πεδίο: recon → foothold → enumerate → privesc → flags.",
        },
      },
    ],
    cheats: [
      { cmd: "nmap -sV 10.10.10.5", desc: { en: "version scan Raven", el: "σάρωση Raven" } },
      { cmd: "curl http://10.10.10.5/", desc: { en: "CMS banner", el: "banner CMS" } },
    ],
    tasks: [
      {
        id: "scan",
        instruction: { en: "nmap -sV 10.10.10.5", el: "nmap -sV 10.10.10.5" },
        hint: { en: "nmap -sV 10.10.10.5", el: "nmap -sV 10.10.10.5" },
        explain: { en: "WHY: Raven speaks SSH and HTTP.", el: "ΓΙΑΤΙ: Ο Raven μιλά SSH και HTTP." },
        check: (t) => t.flags.has("nmap-raven") || t.flags.has("nmap-sv"),
      },
      {
        id: "http",
        instruction: { en: "curl http://10.10.10.5/", el: "curl http://10.10.10.5/" },
        hint: { en: "curl http://10.10.10.5/", el: "curl http://10.10.10.5/" },
        explain: { en: "WHY: Confirm Raven CMS.", el: "ΓΙΑΤΙ: Επιβεβαίωσε Raven CMS." },
        check: (t) => t.flags.has("curl-raven"),
      },
    ],
    challenges: [
      {
        title: { en: "Full ports", el: "Όλες οι θύρες" },
        brief: { en: "Sweep 10.10.10.0/24 so Raven is not your only host.", el: "Σάρωσε 10.10.10.0/24." },
        success: { en: "Network context collected.", el: "Συλλέχθηκε πλαίσιο δικτύου." },
        check: (t) => t.flags.has("nmap-sweep"),
      },
      {
        title: { en: "SSH version", el: "Έκδοση SSH" },
        brief: { en: "Note OpenSSH on 22 from your -sV output (already done if you scanned).", el: "Σημείωσε το OpenSSH στη 22." },
        success: { en: "Banner noted.", el: "Banner καταγράφηκε." },
        check: (t) => t.flags.has("nmap-sv") || t.flags.has("nmap-raven"),
      },
    ],
  },
  {
    id: "raven-foothold",
    order: 2,
    icon: "key",
    color: "from-orange-400 to-stone-800",
    difficulty: 4,
    title: { en: "Raven — Foothold", el: "Raven — Foothold" },
    subtitle: { en: "Weak creds, then user.txt", el: "Αδύναμα creds, μετά user.txt" },
    badge: { en: "Nevermore", el: "Nevermore" },
    scenario: "raven",
    theory: [
      {
        heading: { en: "Password reuse is a gift", el: "Η επαναχρησιμοποίηση κωδικών είναι δώρο" },
        body: {
          en: "CTF boxes often hide the password in a wordlist or a CMS config. Here, hydra + the lab wordlist against raven SSH yields nevermore. Then grab user.txt.",
          el: "Στα CTF συχνά ο κωδικός είναι στο wordlist. Εδώ hydra → nevermore.",
        },
      },
    ],
    cheats: [
      { cmd: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5", desc: { en: "spray raven ssh", el: "spray raven ssh" } },
      { cmd: "ssh raven@10.10.10.5", desc: { en: "open a session", el: "άνοιξε συνεδρία" } },
    ],
    tasks: [
      {
        id: "hydra-r",
        instruction: { en: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5", el: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5" },
        hint: { en: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5", el: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5" },
        explain: { en: "WHY: Weak passwords still exist. HOW: hydra.", el: "ΓΙΑΤΙ: Οι αδύναμοι κωδικοί υπάρχουν ακόμα." },
        check: (t) => t.flags.has("hydra-raven") || t.flags.has("hydra"),
      },
      {
        id: "ssh-r",
        instruction: { en: "ssh raven@10.10.10.5", el: "ssh raven@10.10.10.5" },
        hint: { en: "ssh raven@10.10.10.5", el: "ssh raven@10.10.10.5" },
        explain: { en: "WHY: Foothold is a shell.", el: "ΓΙΑΤΙ: Foothold = shell." },
        check: (t) => t.flags.has("ssh-raven"),
      },
    ],
    challenges: [
      {
        title: { en: "user.txt", el: "user.txt" },
        brief: { en: "Read /home/raven/user.txt (after SSH).", el: "Διάβασε /home/raven/user.txt." },
        success: { en: "User flag bagged.", el: "User flag." },
        check: (t) => t.flags.has("read-user-flag") || t.flags.has("saw:FLAG{raven_user_nevermore}") || t.flags.has("ssh-raven"),
      },
      {
        title: { en: "Read the note", el: "Διάβασε τη σημείωση" },
        brief: { en: "cat note.txt in raven's home — it hints the next module.", el: "cat note.txt στο home του raven." },
        success: { en: "Backup path noted.", el: "Σημειώθηκε το backup." },
        check: (t) => t.filesRead.some((p) => p.includes("note.txt")) || t.flags.has("ssh-raven"),
      },
    ],
  },
  {
    id: "raven-web",
    order: 3,
    icon: "globe",
    color: "from-cyan-400 to-slate-800",
    difficulty: 4,
    title: { en: "Raven — Web & Loot", el: "Raven — Web & λάφυρα" },
    subtitle: { en: "Config files and SQL backups", el: "Config και SQL backups" },
    badge: { en: "Looter", el: "Λαφυραγωγός" },
    scenario: "raven",
    theory: [
      {
        heading: { en: "Post-foothold loot", el: "Λάφυρα μετά το foothold" },
        body: {
          en: "Once you have a shell, read configs. /var/www/html/config.php and /var/backups/cms.sql are realistic leftovers. They are how real breaches cascade.",
          el: "Με shell, διάβασε configs. Τα leftovers είναι ο τρόπος που επεκτείνονται οι παραβιάσεις.",
        },
      },
    ],
    cheats: [
      { cmd: "cat /var/www/html/config.php", desc: { en: "CMS credentials", el: "διαπιστευτήρια CMS" } },
      { cmd: "cat /var/backups/cms.sql", desc: { en: "SQL dump", el: "SQL dump" } },
    ],
    tasks: [
      {
        id: "cfg",
        instruction: { en: "SSH to raven if needed, then cat /var/www/html/config.php", el: "cat /var/www/html/config.php" },
        hint: { en: "cat /var/www/html/config.php", el: "cat /var/www/html/config.php" },
        explain: { en: "WHY: App configs store DB passwords in plaintext far too often.", el: "ΓΙΑΤΙ: Τα configs έχουν κωδικούς σε plaintext." },
        check: (t) => t.flags.has("read-config") || t.flags.has("ssh-raven"),
      },
      {
        id: "sql",
        instruction: { en: "Read /var/backups/cms.sql", el: "Διάβασε /var/backups/cms.sql" },
        hint: { en: "cat /var/backups/cms.sql", el: "cat /var/backups/cms.sql" },
        explain: { en: "WHY: Backups are treasure chests.", el: "ΓΙΑΤΙ: Τα backups είναι θησαυροφυλάκια." },
        check: (t) => t.flags.has("read-sql"),
      },
    ],
    challenges: [
      {
        title: { en: "Web flag", el: "Web flag" },
        brief: { en: "Submit the flag from the SQL dump.", el: "Υπέβαλε το flag από το dump." },
        success: { en: "Database looted.", el: "Η βάση λεηλατήθηκε." },
        check: (t) => t.flags.has("read-sql") || t.flags.has("saw:FLAG{raven_web_dump}") || t.flags.has("submit:FLAG{raven_web_dump}"),
      },
      {
        title: { en: "Cron clue", el: "Ίχνος cron" },
        brief: { en: "cat /etc/crontab — privilege lives in scheduled jobs.", el: "cat /etc/crontab" },
        success: { en: "backup.sh runs as root. That's your ladder.", el: "Το backup.sh τρέχει ως root." },
        check: (t) => t.flags.has("read-cron") || usedCmd(t, /crontab/),
      },
    ],
  },
  {
    id: "raven-root",
    order: 4,
    icon: "crown",
    color: "from-yellow-300 to-red-800",
    difficulty: 5,
    title: { en: "Raven — Root", el: "Raven — Root" },
    subtitle: { en: "Writable cron script to root.txt", el: "εγγράψιμο cron ως root.txt" },
    badge: { en: "Raven Rooted", el: "Raven rooted" },
    scenario: "raven",
    theory: [
      {
        heading: { en: "Writable scripts run by root", el: "Εγγράψιμα script που τρέχει ο root" },
        body: {
          en: "If root runs a script that world-writable users can edit, they can insert a payload. Here, nano /usr/local/bin/backup.sh then sudo that script. Defenders: lock down permissions, don't run user-writable jobs as root.",
          el: "Αν ο root τρέχει εγγράψιμο script, κάποιος μπορεί να βάλει payload. Υπερασπιστές: κλειδώστε δικαιώματα.",
        },
      },
    ],
    cheats: [
      { cmd: "cat /usr/local/bin/backup.sh", desc: { en: "inspect the job", el: "δες τη δουλειά" } },
      { cmd: "nano /usr/local/bin/backup.sh", desc: { en: "edit (sim)", el: "επεξεργασία (sim)" } },
      { cmd: "sudo /usr/local/bin/backup.sh", desc: { en: "run as root", el: "εκτέλεση ως root" } },
    ],
    tasks: [
      {
        id: "readsh",
        instruction: { en: "cat /usr/local/bin/backup.sh", el: "cat /usr/local/bin/backup.sh" },
        hint: { en: "cat /usr/local/bin/backup.sh", el: "cat /usr/local/bin/backup.sh" },
        explain: { en: "WHY: Always read before you write.", el: "ΓΙΑΤΙ: Διάβαζε πριν γράψεις." },
        check: (t) => t.flags.has("read-backup-script") || t.flags.has("ssh-raven"),
      },
      {
        id: "edit",
        instruction: { en: "nano /usr/local/bin/backup.sh  (simulated edit)", el: "nano /usr/local/bin/backup.sh" },
        hint: { en: "nano /usr/local/bin/backup.sh", el: "nano /usr/local/bin/backup.sh" },
        explain: { en: "WHY: Planting a payload in a root cron is a classic privesc.", el: "ΓΙΑΤΙ: Κλασική ανύψωση." },
        check: (t) => t.flags.has("wrote-backup") || usedCmd(t, /nano\s+.*backup/),
      },
      {
        id: "run",
        instruction: { en: "sudo /usr/local/bin/backup.sh", el: "sudo /usr/local/bin/backup.sh" },
        hint: { en: "sudo /usr/local/bin/backup.sh", el: "sudo /usr/local/bin/backup.sh" },
        explain: { en: "WHY: Trigger the job.", el: "ΓΙΑΤΙ: Πυροδότησε τη δουλειά." },
        check: (t) => t.flags.has("got-root") || t.flags.has("ran-backup-root"),
      },
    ],
    challenges: [
      {
        title: { en: "root.txt", el: "root.txt" },
        brief: { en: "cat /root/root.txt", el: "cat /root/root.txt" },
        success: { en: "Raven is yours.", el: "Ο Raven είναι δικός σου." },
        check: (t) => t.flags.has("read-root-flag") || t.flags.has("got-root"),
      },
      {
        title: { en: "Submit nevermore", el: "Υπέβαλε nevermore" },
        brief: { en: "submit FLAG{raven_rooted_the_nevermore}", el: "submit FLAG{raven_rooted_the_nevermore}" },
        success: { en: "Box rooted. Hang the badge on the wall.", el: "Το κουτί rooted." },
        check: (t) => t.flags.has("submit:FLAG{raven_rooted_the_nevermore}") || t.flags.has("got-root"),
      },
    ],
  },
  {
    id: "ssh-keys",
    order: 1,
    icon: "key",
    color: "from-lime-400 to-emerald-900",
    difficulty: 2,
    title: { en: "SSH Keys & Config", el: "Κλειδιά SSH & config" },
    subtitle: { en: "Identity files, config stanzas, ssh -i", el: "Identity files και ssh -i" },
    badge: { en: "Keybearer", el: "Κλειδοκράτορας" },
    scenario: "ssh",
    theory: [
      {
        heading: { en: "Keys beat passwords", el: "Τα κλειδιά νικούν τους κωδικούς" },
        body: {
          en: "SSH public-key auth uses a private key (id_ed25519) kept at 600 permissions. ~/.ssh/config maps Host aliases. ssh -i file user@host selects a key. Never share private keys — in this lab they are fake.",
          el: "Η πιστοποίηση με κλειδί SSH χρησιμοποιεί ιδιωτικό κλειδί. Ποτέ μην μοιράζεσαι ιδιωτικά κλειδιά.",
        },
      },
    ],
    cheats: [
      { cmd: "ls -la ~/.ssh", desc: { en: "list keys", el: "λίστα κλειδιών" } },
      { cmd: "cat ~/.ssh/config", desc: { en: "read ssh config", el: "διάβασε config" } },
      { cmd: "ssh jump", desc: { en: "use the Host alias", el: "χρήση alias" } },
    ],
    tasks: [
      {
        id: "ls-ssh",
        instruction: { en: "ls -la ~/.ssh  (or ls -la /home/operator/.ssh)", el: "ls -la ~/.ssh" },
        hint: { en: "ls -la ~/.ssh", el: "ls -la ~/.ssh" },
        explain: { en: "WHY: Inventory identities first.", el: "ΓΙΑΤΙ: Πρώτα απογραφή ταυτοτήτων." },
        check: (t) => usedCmd(t, /ls\s+.*\.ssh/) || usedCmd(t, /ls\s+-la/),
      },
      {
        id: "cfg",
        instruction: { en: "cat ~/.ssh/config", el: "cat ~/.ssh/config" },
        hint: { en: "cat /home/operator/.ssh/config", el: "cat ~/.ssh/config" },
        explain: { en: "WHY: Host aliases hide ProxyJump complexity.", el: "ΓΙΑΤΙ: Τα alias κρύβουν πολυπλοκότητα." },
        check: (t) => t.filesRead.some((p) => p.includes(".ssh/config") || p.endsWith("/config")),
      },
      {
        id: "jump",
        instruction: { en: "ssh jump   or   ssh operator@10.10.20.2", el: "ssh jump" },
        hint: { en: "ssh jump", el: "ssh jump" },
        explain: { en: "WHY: Bastion first.", el: "ΓΙΑΤΙ: Πρώτα το bastion." },
        check: (t) => t.flags.has("ssh-jump"),
      },
    ],
    challenges: [
      {
        title: { en: "Read the map", el: "Διάβασε τον χάρτη" },
        brief: { en: "cat jump.txt in your home.", el: "cat jump.txt" },
        success: { en: "Three-hop topology learned.", el: "Τοπολογία 3 hop." },
        check: (t) => t.flags.has("read-jump"),
      },
      {
        title: { en: "Private key", el: "Ιδιωτικό κλειδί" },
        brief: { en: "cat the operator private key (simulated).", el: "cat το ιδιωτικό κλειδί." },
        success: { en: "You treated a key as a secret. Good.", el: "Το κλειδί είναι μυστικό." },
        check: (t) => t.flags.has("read-ssh-key"),
      },
    ],
  },
  {
    id: "ssh-hop",
    order: 2,
    icon: "git",
    color: "from-teal-400 to-cyan-900",
    difficulty: 3,
    title: { en: "ProxyJump & Hopping", el: "ProxyJump & hopping" },
    subtitle: { en: "Bastion → dev with -J", el: "Bastion → dev με -J" },
    badge: { en: "Wirewalker", el: "Πεζοπόρος καλωδίων" },
    scenario: "ssh",
    theory: [
      {
        heading: { en: "Jump hosts", el: "Jump hosts" },
        body: {
          en: "Internal boxes often accept SSH only from a bastion. ssh -J jump dev@10.10.20.14 (ProxyJump) chains the sessions. This is how real corporate networks are segmented — and how attackers pivot, which is why bastions need MFA, monitoring, and no outbound-any.",
          el: "Τα εσωτερικά μηχανήματα δέχονται SSH μόνο από bastion. Το ProxyJump αλυσιδώνει συνεδρίες.",
        },
      },
    ],
    cheats: [
      { cmd: "ssh -J jump dev@10.10.20.14", desc: { en: "ProxyJump", el: "ProxyJump" } },
      { cmd: "ssh -i id_dev dev@10.10.20.14", desc: { en: "explicit key", el: "ρητό κλειδί" } },
    ],
    tasks: [
      {
        id: "hop",
        instruction: { en: "ssh -J jump dev@10.10.20.14   (or ssh with ProxyJump)", el: "ssh -J jump dev@10.10.20.14" },
        hint: { en: "ssh -J jump dev@10.10.20.14", el: "ssh -J jump dev@10.10.20.14" },
        explain: { en: "WHY: -J is ProxyJump.", el: "ΓΙΑΤΙ: -J = ProxyJump." },
        check: (t) => t.flags.has("ssh-hop") || t.flags.has("ssh-dev"),
      },
    ],
    challenges: [
      {
        title: { en: "Land on dev", el: "Προσγείωση στο dev" },
        brief: { en: "Reach host dev via the jump box.", el: "Φτάσε στο dev μέσω jump." },
        success: { en: "You hopped.", el: "Πήδηξες." },
        check: (t) => t.flags.has("ssh-dev") || t.flags.has("ssh-hop"),
      },
      {
        title: { en: "Hop flag", el: "Flag hop" },
        brief: { en: "cat /tmp/flag-hop.txt", el: "cat /tmp/flag-hop.txt" },
        success: { en: "FLAG{ssh_proxyjump_ok}", el: "FLAG{ssh_proxyjump_ok}" },
        check: (t) => t.filesRead.some((p) => p.includes("flag-hop")) || t.flags.has("ssh-hop"),
      },
    ],
  },
  {
    id: "ssh-tunnel",
    order: 3,
    icon: "share",
    color: "from-fuchsia-400 to-purple-900",
    difficulty: 4,
    title: { en: "Pivots & Internal DB", el: "Pivots & εσωτερική DB" },
    subtitle: { en: "Reach db-int from dev", el: "Φτάσε db-int από dev" },
    badge: { en: "Deep Pivot", el: "Βαθύ pivot" },
    scenario: "ssh",
    theory: [
      {
        heading: { en: "Segmentation", el: "Τμηματοποίηση" },
        body: {
          en: "db-int.lab (10.10.20.30) is not reachable from kali — only from dev. That is network segmentation. After hopping to dev, ssh to the DB. Local port forwards (ssh -L) would do the same in production. Monitor east-west SSH.",
          el: "Το db-int δεν φαίνεται από kali — μόνο από dev. Αυτό είναι segmentation.",
        },
      },
    ],
    cheats: [
      { cmd: "ssh -J jump dev@10.10.20.14", desc: { en: "get to dev first", el: "πρώτα dev" } },
      { cmd: "ssh db-int", desc: { en: "from dev, land on db", el: "από dev στη db" } },
    ],
    tasks: [
      {
        id: "dev",
        instruction: { en: "Hop to dev (ssh -J jump dev@10.10.20.14).", el: "Πήδα στο dev." },
        hint: { en: "ssh -J jump dev@10.10.20.14", el: "ssh -J jump dev@10.10.20.14" },
        explain: { en: "WHY: You cannot skip the hop.", el: "ΓΙΑΤΙ: Δεν παραλείπεις το hop." },
        check: (t) => t.flags.has("ssh-dev") || t.flags.has("ssh-hop"),
      },
      {
        id: "db",
        instruction: { en: "From that context, ssh to 10.10.20.30 or db-int.", el: "ssh στο 10.10.20.30" },
        hint: { en: "ssh 10.10.20.30", el: "ssh 10.10.20.30" },
        explain: { en: "WHY: Dual-homed hosts are pivots.", el: "ΓΙΑΤΙ: Dual-homed hosts = pivots." },
        check: (t) => t.flags.has("ssh-db"),
      },
    ],
    challenges: [
      {
        title: { en: "Deep flag", el: "Βαθύ flag" },
        brief: { en: "Reach db-int and capture FLAG{ssh_deep_pivot}.", el: "Φτάσε db-int." },
        success: { en: "You walked the wire.", el: "Περπάτησες το καλώδιο." },
        check: (t) => t.flags.has("ssh-db") || t.flags.has("saw:FLAG{ssh_deep_pivot}"),
      },
      {
        title: { en: "Tunnel souvenir", el: "Σουβενίρ τούνελ" },
        brief: { en: "cat /opt/tunnel.flag on kali.", el: "cat /opt/tunnel.flag" },
        success: { en: "Local forward imagined.", el: "Το local forward φαντάστηκες." },
        check: (t) => t.filesRead.some((p) => p.includes("tunnel.flag")) || t.flags.has("ssh-db"),
      },
    ],
  },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "forge",
    pathNumber: 1,
    title: { en: "In the Beginning... Linux Was Born", el: "Στην αρχή... γεννήθηκε το Linux" },
    subtitle: { en: "Linux foundations: from your first command to root", el: "Θεμέλια Linux: από την πρώτη εντολή ως το root" },
    blurb: {
      en: "Nine sequenced labs from first prompt to root. Linux, recon, scanning, credentials, SQLi, privesc — all simulated.",
      el: "Εννέα εργαστήρια από το πρώτο prompt ως το root. Όλα προσομοιωμένα.",
    },
    scenario: "lab",
    accent: "ember",
    modules: MODULES.filter((m) =>
      ["linux-basics", "files", "permissions", "networking", "recon", "scanning", "bruteforce", "sqli", "privesc"].includes(m.id)
    ),
  },
  {
    id: "raven",
    pathNumber: 4,
    title: { en: "Operation Raven", el: "Επιχείρηση Raven" },
    subtitle: { en: "A boot2root CTF box", el: "Ένα κουτί boot2root CTF" },
    blurb: {
      en: "Recon, foothold, loot the CMS, ride a writable cron to root. Four flags. One nevermore.",
      el: "Recon, foothold, CMS, cron ως root. Τέσσερις σημαίες.",
    },
    scenario: "raven",
    accent: "zinc",
    modules: MODULES.filter((m) => m.id.startsWith("raven-")),
  },
  {
    id: "wirewalk",
    pathNumber: 3,
    title: { en: "Wirewalk", el: "Wirewalk" },
    subtitle: { en: "SSH labyrinth", el: "Λαβύρινθος SSH" },
    blurb: {
      en: "Keys, bastions, ProxyJump and an internal database you cannot see from kali.",
      el: "Κλειδιά, bastions, ProxyJump και εσωτερική βάση αόρατη από kali.",
    },
    scenario: "ssh",
    accent: "cyan",
    modules: MODULES.filter((m) => m.id.startsWith("ssh-")),
  },
  {
    id: "sudorun",
    pathNumber: 2,
    title: { en: "Sudo_Run", el: "Sudo_Run" },
    subtitle: { en: "Linux for Beginners", el: "Linux για αρχάριους" },
    blurb: {
      en: "Thirteen labs from pwd to Apache, SSH and FTP. Every command from the classic beginner path — rewritten for HackForge, simulated in a safe VFS.",
      el: "Δεκατρία εργαστήρια από pwd μέχρι Apache, SSH και FTP. Όλες οι εντολές του κλασικού οδηγού αρχαρίων — στο HackForge.",
    },
    scenario: "sudorun",
    accent: "lime",
    modules: SUDO_RUN_ALL,
  },
  {
    id: "dfir-fieldwork",
    pathNumber: 5,
    title: { en: "DFIR Fieldwork", el: "Επιτόπια Ψηφιακή Εγκληματολογία" },
    subtitle: { en: "Digital Forensics & Incident Response", el: "Digital Forensics & Incident Response" },
    blurb: {
      en: "Ten linked forensic labs: evidence handling, Windows artifacts, document analysis, web and network forensics, disk, malware, memory, containers, and password hashes. Every artifact is a safe, fictional local fixture.",
      el: "Δέκα συνδεδεμένα labs: διατήρηση τεκμηρίων, Windows artifacts, έγγραφα, web/network, disk, malware, memory, containers και password hashes. Όλα τα τεκμήρια είναι ασφαλή, φανταστικά τοπικά fixtures.",
    },
    scenario: "dfir",
    accent: "cyan",
    modules: DFIR_MODULES,
  },
];

export const LEARNING_PATHS = [...CAMPAIGNS].sort((a, b) => a.pathNumber - b.pathNumber);

export function moduleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id) || SUDO_RUN_ALL.find((m) => m.id === id) || DFIR_MODULES.find((m) => m.id === id);
}

export function campaignById(id: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

export function campaignForModule(moduleId: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.modules.some((m) => m.id === moduleId));
}
