import type { Terminal } from "../lib/terminal";
import { usedCmd } from "../lib/terminal";
import { SUDO_RUN_ALL } from "./sudorun-lessons";
import { DFIR_MODULES } from "./dfir-lessons";
import { LINUX_BEGINNERS_2_MODULES } from "./linux-beginners-2";
import { LINUX_BEGINNERS_3_MODULES } from "./linux-beginners-3";
import { SSH_SERVICE_MODULES } from "./ssh-service-lessons";

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
    color: "from-cyan-500 to-cyan-700",
    difficulty: 1,
    title: { en: "Terminal & Linux Foundations", el: "Τερματικό & Θεμέλια Linux" },
    subtitle: { en: "Meet the command line, then navigate it", el: "Γνώρισε τη γραμμή εντολών και πλοηγήσου" },
    badge: { en: "Shell Initiate", el: "Μυημένος του Shell" },
    theory: [
      {
        heading: { en: "What is a terminal / CLI?", el: "Τι είναι το τερματικό / CLI;" },
        body: {
          en: "A terminal is a text window where you talk to the computer by typing commands instead of clicking. This is the Command Line Interface (CLI), driven by a program called the shell (here, bash). You type one line, press Enter, and the shell runs it and prints the result. Almost every hacking and security tool lives here — mastering the CLI is the single most important skill for a security professional.",
          el: "Το τερματικό είναι ένα παράθυρο κειμένου όπου επικοινωνείς με τον υπολογιστή γράφοντας εντολές αντί να κάνεις κλικ. Αυτό είναι η διεπαφή γραμμής εντολών (Command Line Interface, CLI), την οποία οδηγεί ένα πρόγραμμα, το κέλυφος (shell, εδώ, bash). Γράφεις μια γραμμή, πατάς Enter, το shell την εκτελεί και εμφανίζει το αποτέλεσμα. Σχεδόν κάθε εργαλείο ασφαλείας ζει εδώ — η γνώση του CLI είναι η πιο σημαντική δεξιότητα ενός επαγγελματία ασφάλειας.",
        },
      },
      {
        heading: { en: "Reading the prompt", el: "Διαβάζοντας το prompt" },
        body: {
          en: "Before every command the shell shows a prompt, e.g. operator@kali:~$. It tells you WHO you are (operator), WHICH machine (kali) and WHERE you are (~ = home). The $ means a normal user; a # would mean you are root (admin). You type your command right after it and press Enter to run it.",
          el: "Πριν από κάθε εντολή, το shell εμφανίζει ένα prompt, π.χ. operator@kali:~$. Το prompt δείχνει ΠΟΙΟΣ είσαι (operator), σε ΠΟΙΟ μηχάνημα βρίσκεσαι (kali) και ΠΟΥ βρίσκεσαι (~ = home). Το $ δηλώνει απλό χρήστη, το # θα δήλωνε ότι είσαι root (διαχειριστής). Γράψε την εντολή αμέσως μετά και πάτα Enter.",
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
          en: "The filesystem is a tree that starts at the root /. Each command in this module answers one question.\n\npwd prints the absolute path of the working directory. Relative names such as welcome.txt are resolved from there. A successful pwd only displays a path. It does not move you.\n\nls lists names in that directory. ls -a includes names that start with a dot, which is where configuration and keys are often kept. ls -l adds the mode, owner, and size. Read those columns before you change a file.\n\ncd PATH moves the working directory. cd .. moves to the parent, and cd ~ returns home. A successful cd is silent, so run pwd if you need proof.\n\ncat FILE prints a text file. The lines are data, not commands to type back. help lists the commands this sandbox actually implements.",
          el: "Το σύστημα αρχείων είναι ένα δέντρο με ρίζα το /. Κάθε εντολή αυτού του μαθήματος απαντά σε μία ερώτηση.\n\nΗ pwd τυπώνει την απόλυτη διαδρομή του φακέλου εργασίας. Σχετικά ονόματα, όπως το welcome.txt, ερμηνεύονται από εκεί. Μια επιτυχημένη pwd μόνο εμφανίζει διαδρομή. Δεν σε μετακινεί.\n\nΗ ls εμφανίζει ονόματα σε εκείνον τον φάκελο. Το ls -a περιλαμβάνει ονόματα που αρχίζουν με τελεία, εκεί που συχνά κρατούνται ρυθμίσεις και κλειδιά. Το ls -l προσθέτει mode, ιδιοκτήτη και μέγεθος. Διάβασε αυτές τις στήλες πριν αλλάξεις αρχείο.\n\nΤο cd PATH μετακινεί τον φάκελο εργασίας. Το cd .. πηγαίνει στον γονέα, και το cd ~ γυρίζει στο home. Ένα επιτυχημένο cd είναι σιωπηλό, οπότε τρέξε pwd αν χρειάζεσαι απόδειξη.\n\nΤο cat FILE τυπώνει ένα αρχείο κειμένου. Οι γραμμές είναι δεδομένα, όχι εντολές για να τις ξαναγράψεις. Το help εμφανίζει τις εντολές που υλοποιεί πραγματικά αυτό το sandbox.",
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
        instruction: { en: "Run whoami to confirm your identity.", el: "Εκτέλεσε whoami για να επιβεβαιώσεις την ταυτότητά σου." },
        hint: { en: "whoami", el: "whoami" },
        explain: {
          en: "WHY: Always know which user you are before you act. HOW: whoami prints the current account name.",
          el: "ΓΙΑΤΙ: Πρέπει να γνωρίζεις πάντα ποιος χρήστης είσαι. ΠΩΣ: η εντολή whoami εμφανίζει το όνομα του λογαριασμού.",
        },
        check: (t) => t.flags.has("whoami") || usedCmd(t, /^\s*whoami\b/),
      },
      {
        id: "pwd",
        instruction: { en: "Print your working directory with pwd.", el: "Εμφάνισε τον τρέχοντα φάκελο με pwd." },
        hint: { en: "pwd", el: "pwd" },
        explain: {
          en: "WHY: Orientation. HOW: pwd → print working directory.",
          el: "ΓΙΑΤΙ: Προσανατολισμός στο σύστημα αρχείων. ΠΩΣ: εκτέλεσε pwd.",
        },
        check: (t) => t.flags.has("pwd") || usedCmd(t, /^\s*pwd\b/),
      },
      {
        id: "ls",
        instruction: { en: "List the files in your home with ls.", el: "Εμφάνισε τα αρχεία του προσωπικού φακέλου (home) με ls." },
        hint: { en: "ls", el: "ls" },
        explain: {
          en: "WHY: See what is around you. HOW: ls lists the current directory.",
          el: "ΓΙΑΤΙ: Δες τι υπάρχει γύρω σου. ΠΩΣ: εκτέλεσε ls.",
        },
        check: (t) => t.flags.has("ls") || usedCmd(t, /^\s*ls\b/),
      },
      {
        id: "cat-welcome",
        instruction: { en: "Read welcome.txt with cat.", el: "Διάβασε το welcome.txt με cat." },
        hint: { en: "cat welcome.txt", el: "cat welcome.txt" },
        explain: {
          en: "WHY: cat concatenates and prints files. HOW: cat welcome.txt",
          el: "ΓΙΑΤΙ: η εντολή cat εμφανίζει αρχεία. ΠΩΣ: cat welcome.txt",
        },
        check: (t) => t.flags.has("read-welcome") || usedCmd(t, /cat\s+.*welcome/),
      },
    ],
    challenges: [
      {
        title: { en: "Hidden in the home", el: "Κρυμμένο στο home" },
        brief: {
          en: "There is a hidden file in your home directory. Find it and read it.",
          el: "Υπάρχει ένα κρυφό αρχείο στον προσωπικό φάκελο (home). Βρες το και διάβασέ το.",
        },
        success: { en: "You uncovered a dotfile. Operators always ls -a.", el: "Αποκάλυψες ένα κρυφό αρχείο (dotfile). Οι χειριστές ελέγχουν πάντα με ls -a." },
        check: (t) => t.flags.has("read-secret") || t.flags.has("saw:FLAG{hidden_in_plain_sight}"),
      },
      {
        title: { en: "Leave a trail", el: "Άσε ίχνος" },
        brief: {
          en: "Change into the documents folder, then prove you were there by reading readme.md.",
          el: "Μπες στον φάκελο documents και διάβασε το readme.md.",
        },
        success: { en: "Navigation locked in.", el: "Η πλοήγηση εμπεδώθηκε." },
        check: (t) => t.filesRead.some((p) => p.includes("readme.md")) || usedCmd(t, /cat\s+.*readme/),
      },
    ],
  },
  {
    id: "files",
    order: 2,
    icon: "folder",
    color: "from-cyan-500 to-sky-800",
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
          en: "find and grep answer different questions, so do not treat them as the same search.\n\nfind /home -name '*.txt' starts at /home and keeps paths whose filename matches the pattern. The quotes stop the shell from expanding the star before find sees it. The result is a list of paths, not file contents.\n\ngrep enumerate notes.txt keeps lines inside that file which contain the word. If you put a pipe in front, grep filters another command's output instead of opening a file. The source is not modified.\n\ncat /etc/passwd prints the local account list in this simulation: name, numeric id, home, and shell. It is an inventory of the fictional host, not a password file. Password hashes, when a system stores them, live elsewhere and are not the point of this command.",
          el: "Οι find και grep απαντούν σε διαφορετικές ερωτήσεις, οπότε μην τις αντιμετωπίζεις ως την ίδια αναζήτηση.\n\nΗ find /home -name '*.txt' ξεκινά από το /home και κρατά διαδρομές των οποίων το όνομα ταιριάζει στο μοτίβο. Τα εισαγωγικά εμποδίζουν το shell να αναπτύξει το αστεράκι πριν το δει η find. Το αποτέλεσμα είναι λίστα διαδρομών, όχι περιεχόμενα αρχείων.\n\nΗ grep enumerate notes.txt κρατά γραμμές μέσα σε εκείνο το αρχείο που περιέχουν τη λέξη. Αν βάλεις pipe μπροστά, η grep φιλτράρει την έξοδο άλλης εντολής αντί να ανοίξει αρχείο. Η πηγή δεν τροποποιείται.\n\nΤο cat /etc/passwd τυπώνει τη λίστα τοπικών λογαριασμών σε αυτή την προσομοίωση: όνομα, αριθμητικό id, home και shell. Είναι απογραφή του φανταστικού host, όχι αρχείο κωδικών. Τα hashes κωδικών, όταν ένα σύστημα τα αποθηκεύει, ζουν αλλού και δεν είναι ο σκοπός αυτής της εντολής.",
        },
        tip: {
          en: "On a real engagement, start with find and grep before you install anything new.",
          el: "Σε πραγματικό engagement, ξεκίνα με find και grep πριν εγκαταστήσεις οτιδήποτε.",
        },
      },
    ],
    cheats: [
      { cmd: "find /home -name '*.txt'", desc: { en: "search by name", el: "αναζήτηση με όνομα" } },
      { cmd: "grep enumerate notes.txt", desc: { en: "search file contents", el: "αναζήτηση περιεχομένου" } },
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
        instruction: { en: "grep the word enumerate inside notes.txt.", el: "Αναζήτησε τη λέξη enumerate στο notes.txt με grep." },
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
          el: "Κάθε αρχείο έχει λειτουργία (mode) όπως το -rw-r--r--. Η εντολή ls -l την εμφανίζει. Το μήνυμα Permission denied δηλώνει ότι ζήτησες δικαίωμα που δεν διαθέτεις.",
        },
      },
      {
        heading: { en: "sudo and the principle of least privilege", el: "sudo και ελάχιστο προνόμιο" },
        body: {
          en: "sudo runs a command with a delegated privilege, often root. sudo -l does not run that command. It lists what this account is allowed to run, and as whom.\n\nRead each grant as a configuration finding. A grant for a program that can edit files or start another program is too broad. The defensive fix is to remove the grant, not to collect more of them. id shows the numeric user and the groups that may explain a grant. Never run sudo on a system you do not administer. In this lab the answer is simulated.",
          el: "Το sudo τρέχει μια εντολή με παραχωρημένο προνόμιο, συχνά root. Το sudo -l δεν τρέχει εκείνη την εντολή. Εμφανίζει τι επιτρέπεται να τρέξει αυτός ο λογαριασμός, και ως ποιον.\n\nΔιάβασε κάθε παραχώρηση ως εύρημα ρύθμισης. Παραχώρηση για πρόγραμμα που μπορεί να επεξεργαστεί αρχεία ή να ξεκινήσει άλλο πρόγραμμα είναι πολύ πλατιά. Η αμυντική διόρθωση είναι να αφαιρέσεις την παραχώρηση, όχι να μαζέψεις κι άλλες. Το id δείχνει τον αριθμητικό χρήστη και τις ομάδες που μπορεί να εξηγούν μια παραχώρηση. Μην τρέχεις sudo σε σύστημα που δεν διαχειρίζεσαι. Σε αυτό το εργαστήριο η απάντηση είναι εικονική.",
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
        instruction: { en: "Run ls -l in your home to see file modes.", el: "Εκτέλεσε ls -l στο home." },
        hint: { en: "ls -l", el: "ls -l" },
        explain: { en: "WHY: Modes tell you what you can touch.", el: "ΓΙΑΤΙ: Οι λειτουργίες (modes) δείχνουν τι επιτρέπεται να αγγίξεις." },
        check: (t) => t.flags.has("ls-l") || usedCmd(t, /ls\s+-[al]*l/),
      },
      {
        id: "id",
        instruction: { en: "Run id to see uid/gid/groups.", el: "Εκτέλεσε id." },
        hint: { en: "id", el: "id" },
        explain: { en: "WHY: Groups often grant extra rights (sudo, docker, disk).", el: "ΓΙΑΤΙ: Οι ομάδες παραχωρούν επιπλέον δικαιώματα." },
        check: (t) => t.flags.has("id") || usedCmd(t, /^\s*id\b/),
      },
      {
        id: "sudo-l",
        instruction: { en: "Ask sudo what you are allowed to run: sudo -l", el: "Ρώτησε το sudo τι επιτρέπεται: sudo -l" },
        hint: { en: "sudo -l", el: "sudo -l" },
        explain: { en: "WHY: Misconfigured sudo is a highway to root.", el: "ΓΙΑΤΙ: Λανθασμένη ρύθμιση sudo οδηγεί σε root." },
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
          en: "ip addr, or the older ifconfig, prints the simulator's virtual interfaces. inet is the IPv4 address, and /24 is the subnet prefix. In this lab that address is 10.10.10.2/24. The other fictional hosts live in the same training subnet. Nothing in the output changes a real adapter.\n\nping 10.10.10.5 sends a simulated ICMP echo to raven.lab. Replies mean the simulator considers that host reachable. A real network can block ICMP and still be online, so a missing reply is not proof that a host is down.\n\ncat /etc/hosts prints the lab's name-to-address map. Use the names when a later command asks for a host, and still confirm the address. The file is local data, not a live DNS answer.",
          el: "Το ip addr, ή το παλαιότερο ifconfig, τυπώνει τις εικονικές διεπαφές του προσομοιωτή. Το inet είναι η διεύθυνση IPv4, και το /24 το πρόθεμα του υποδικτύου. Σε αυτό το εργαστήριο η διεύθυνση είναι 10.10.10.2/24. Οι άλλοι φανταστικοί hosts ζουν στο ίδιο εκπαιδευτικό υποδίκτυο. Τίποτα στην έξοδο δεν αλλάζει πραγματικό προσαρμογέα.\n\nΤο ping 10.10.10.5 στέλνει εικονικό ICMP echo προς το raven.lab. Οι απαντήσεις σημαίνουν ότι ο προσομοιωτής θεωρεί προσβάσιμο εκείνον τον host. Ένα πραγματικό δίκτυο μπορεί να μπλοκάρει το ICMP και να είναι ακόμη σε λειτουργία, οπότε μια απούσα απάντηση δεν αποδεικνύει ότι ο host είναι κάτω.\n\nΤο cat /etc/hosts τυπώνει τον χάρτη ονομάτων του εργαστηρίου. Χρησιμοποίησε τα ονόματα όταν μια επόμενη εντολή ζητά host, και πάλι επιβεβαίωσε τη διεύθυνση. Το αρχείο είναι τοπικά δεδομένα, όχι ζωντανή απάντηση DNS.",
        },
      },
      {
        heading: { en: "Ethics of scanning", el: "Ηθική της σάρωσης" },
        body: {
          en: "Sending packets at a host you do not own can be illegal. In GameHack every address is fake and local. Outside, you need a written rules-of-engagement. When in doubt, do not scan.",
          el: "Η αποστολή πακέτων σε σύστημα που δεν σου ανήκει μπορεί να είναι παράνομη. Στο GameHack όλες οι διευθύνσεις είναι ψεύτικες.",
        },
      },
    ],
    cheats: [
      { cmd: "ip addr", desc: { en: "show interfaces", el: "εμφάνιση διεπαφών" } },
      { cmd: "ping 10.10.10.5", desc: { en: "icmp echo to raven.lab", el: "icmp echo προς το raven.lab" } },
      { cmd: "cat /etc/hosts", desc: { en: "local DNS names", el: "τοπικά ονόματα" } },
    ],
    tasks: [
      {
        id: "ip",
        instruction: { en: "Show your interface with ip addr (or ifconfig).", el: "Δείξε τη διεπαφή με ip addr." },
        hint: { en: "ip addr", el: "ip addr" },
        explain: { en: "WHY: Know your own IP before you scan others.", el: "ΓΙΑΤΙ: Μάθε τη δική σου IP πριν σαρώσεις άλλα συστήματα." },
        check: (t) => t.flags.has("ip") || usedCmd(t, /\b(ip|ifconfig)\b/),
      },
      {
        id: "ping",
        instruction: { en: "Ping raven.lab or 10.10.10.5.", el: "Εκτέλεσε ping προς το raven.lab ή το 10.10.10.5." },
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
        brief: { en: "Ping 10.10.10.8 (web.lab) as well.", el: "Εκτέλεσε ping προς το 10.10.10.8." },
        success: { en: "Two hosts alive on the GameHack lab network.", el: "Δύο συστήματα (hosts) είναι ενεργά." },
        check: (t) => usedCmd(t, /ping\s+.*(10\.10\.10\.8|web\.lab)/),
      },
      {
        title: { en: "Know thyself", el: "Γνώθι σαυτόν" },
        brief: { en: "Run hostname so you remember which box you are on.", el: "Εκτέλεσε hostname." },
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
          en: "nmap 10.10.10.0/24 asks the simulator which fictional hosts in the lab subnet answer. The report names four: raven.lab, web.lab, ssh.lab, and db.lab. It does not walk your physical LAN, and a /24 here is not an invitation to scan 256 real addresses.\n\nnmap 10.10.10.5 then asks about one of those hosts. Without -sV the rows are port, state, and service name. Host is up means the simulator answered. Write the hostname next to the address before you move on, and confirm the same names in tools/targets.txt.",
          el: "Η nmap 10.10.10.0/24 ρωτά τον προσομοιωτή ποιοι φανταστικοί hosts του υποδικτύου απαντούν. Η αναφορά ονομάζει τέσσερις: raven.lab, web.lab, ssh.lab και db.lab. Δεν διασχίζει το φυσικό σου LAN, και ένα /24 εδώ δεν είναι πρόσκληση να σαρώσεις 256 πραγματικές διευθύνσεις.\n\nΗ nmap 10.10.10.5 ρωτά μετά για έναν από εκείνους τους hosts. Χωρίς -sV οι γραμμές είναι θύρα, κατάσταση και όνομα υπηρεσίας. Το Host is up σημαίνει ότι απάντησε ο προσομοιωτής. Γράψε το hostname δίπλα στη διεύθυνση πριν προχωρήσεις, και επιβεβαίωσε τα ίδια ονόματα στο tools/targets.txt.",
        },
        tip: {
          en: "Never sweep a network that is not in your written scope.",
          el: "Μην σαρώνεις δίκτυο εκτός γραπτού πεδίου εξουσιοδότησης (scope).",
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
        explain: { en: "WHY: An assessment starts from the hosts that actually answer, not from a guessed address. HOW: nmap 10.10.10.0/24 prints the four fictional lab hosts and does not leave the sandbox.", el: "ΓΙΑΤΙ: Ένας έλεγχος ξεκινά από τους hosts που απαντούν πραγματικά, όχι από μια μαντεμένη διεύθυνση. ΠΩΣ: Η nmap 10.10.10.0/24 τυπώνει τους τέσσερις φανταστικούς hosts και δεν φεύγει από το sandbox." },
        check: (t) => t.flags.has("nmap-sweep") || usedCmd(t, /nmap\s+.*10\.10\.10\.0\/24/),
      },
      {
        id: "host",
        instruction: { en: "Scan a single host — try nmap 10.10.10.5", el: "Σάρωσε ένα σύστημα — nmap 10.10.10.5" },
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
        success: { en: "web.lab fingerprint started.", el: "Ξεκίνησε η αποτύπωση (fingerprint) του web.lab." },
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
    subtitle: { en: "Versions, banners, and what they imply", el: "Εκδόσεις, banners και η σημασία τους" },
    badge: { en: "Port Mapper", el: "Χαρτογράφος θυρών" },
    theory: [
      {
        heading: { en: "Why versions matter", el: "Γιατί μετράνε οι εκδόσεις" },
        body: {
          en: "nmap -sV 10.10.10.5 adds a version column to the port report for raven.lab. -sV means the simulator includes the banner it has stored for that fictional service, such as an OpenSSH or HTTP version string. Compare that exact string with a trusted advisory list. A version is a clue, not permission to try an exploit.\n\ncurl http://10.10.10.8/ requests the canned page for web.lab and prints the HTML body. Read the title and links as what the page claims. curl http://10.10.10.5/ does the same for raven.lab. Neither command leaves the sandbox, and neither proves that a real site is vulnerable.",
          el: "Η nmap -sV 10.10.10.5 προσθέτει στήλη έκδοσης στην αναφορά θυρών για το raven.lab. Το -sV σημαίνει ότι ο προσομοιωτής περιλαμβάνει το banner που έχει αποθηκευμένο για εκείνη τη φανταστική υπηρεσία, όπως μια συμβολοσειρά OpenSSH ή HTTP. Σύγκρινε ακριβώς αυτή τη συμβολοσειρά με αξιόπιστη λίστα συμβουλών. Μια έκδοση είναι ένδειξη, όχι άδεια να δοκιμάσεις exploit.\n\nΗ curl http://10.10.10.8/ ζητά την έτοιμη σελίδα του web.lab και τυπώνει το σώμα HTML. Διάβασε τον τίτλο και τους συνδέσμους ως αυτό που δηλώνει η σελίδα. Η curl http://10.10.10.5/ κάνει το ίδιο για το raven.lab. Καμία από τις δύο εντολές δεν φεύγει από το sandbox, και καμία δεν αποδεικνύει ότι ένας πραγματικός ιστότοπος είναι ευάλωτος.",
        },
      },
    ],
    cheats: [
      { cmd: "nmap -sV 10.10.10.5", desc: { en: "service version detection", el: "ανίχνευση έκδοσης" } },
      { cmd: "curl http://10.10.10.8/", desc: { en: "read the lab web page", el: "ανάγνωση της σελίδας του lab" } },
    ],
    tasks: [
      {
        id: "sv",
        instruction: { en: "Run nmap -sV against raven.lab (10.10.10.5).", el: "Εκτέλεσε nmap -sV στο 10.10.10.5." },
        hint: { en: "nmap -sV 10.10.10.5", el: "nmap -sV 10.10.10.5" },
        explain: { en: "WHY: Version detection turns ports into software.", el: "ΓΙΑΤΙ: Οι εκδόσεις μετατρέπουν θύρες σε λογισμικό." },
        check: (t) => t.flags.has("nmap-sv") || usedCmd(t, /nmap\s+.*-sV/),
      },
      {
        id: "curl",
        instruction: { en: "curl the web box: curl http://10.10.10.8/", el: "curl http://10.10.10.8/" },
        hint: { en: "curl http://10.10.10.8/", el: "curl http://10.10.10.8/" },
        explain: { en: "WHY: HTTP is often the loudest service.", el: "ΓΙΑΤΙ: Το HTTP είναι συχνά η υπηρεσία που αποκαλύπτει τα περισσότερα." },
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
    icon: "key",
    color: "from-rose-500 to-red-800",
    difficulty: 3,
    title: { en: "Credential Attacks (Lab)", el: "Επιθέσεις διαπιστευτηρίων (Lab)" },
    subtitle: { en: "Dictionary attacks against a simulated SSH", el: "Επιθέσεις λεξικού σε προσομοιωμένο SSH" },
    badge: { en: "Lock Breaker", el: "Κλειδοσπάστης" },
    theory: [
      {
        heading: { en: "What brute force is — and is not", el: "Τι είναι (και δεν είναι) το brute force" },
        body: {
          en: "A dictionary check tries likely passwords from a list against one account. It is noisy, and without written permission it is a crime in most places. This module uses only the fictional account labuser on ssh.lab and the tiny training file tools/wordlist.txt.\n\nRead the command as three parts. -l labuser names one account, not a list of users. -P tools/wordlist.txt names the sandbox wordlist. ssh://10.10.10.12 says the service and the fictional host. cat tools/wordlist.txt shows that the list is a training file before you run the check. A password row is a finding about that lab account. The durable fix is to disable password authentication after keys work, add lockout, and alert on repeated failures.",
          el: "Ένας έλεγχος λεξικού δοκιμάζει πιθανούς κωδικούς από λίστα σε έναν λογαριασμό. Είναι θορυβώδης και, χωρίς γραπτή άδεια, είναι έγκλημα στις περισσότερες χώρες. Αυτό το μάθημα χρησιμοποιεί μόνο τον φανταστικό λογαριασμό labuser στο ssh.lab και το μικρό αρχείο εκπαίδευσης tools/wordlist.txt.\n\nΔιάβασε την εντολή ως τρία μέρη. Το -l labuser ονομάζει έναν λογαριασμό, όχι λίστα χρηστών. Το -P tools/wordlist.txt ονομάζει το λεξικό του sandbox. Το ssh://10.10.10.12 λέει την υπηρεσία και τον φανταστικό host. Το cat tools/wordlist.txt δείχνει ότι η λίστα είναι αρχείο εκπαίδευσης πριν τρέξεις τον έλεγχο. Μια γραμμή κωδικού είναι εύρημα για εκείνον τον λογαριασμό του lab. Η μόνιμη διόρθωση είναι να απενεργοποιηθεί η ταυτοποίηση με κωδικό αφού δουλέψουν τα κλειδιά, να μπει κλείδωμα, και να υπάρχει ειδοποίηση στις επανειλημμένες αποτυχίες.",
        },
        tip: {
          en: "Real takeaway: disable password SSH, use keys, enable 2FA, and alert on hydra-like traffic.",
          el: "Ουσία: απενεργοποίησε password SSH, βάλε κλειδιά και 2FA.",
        },
      },
    ],
    cheats: [
      { cmd: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12", desc: { en: "lab-only credential check", el: "έλεγχος μόνο για το lab" } },
      { cmd: "cat tools/wordlist.txt", desc: { en: "training wordlist", el: "λεξικό εκπαίδευσης" } },
    ],
    tasks: [
      {
        id: "wordlist",
        instruction: { en: "Read tools/wordlist.txt so you know the dictionary.", el: "Διάβασε tools/wordlist.txt." },
        hint: { en: "cat tools/wordlist.txt", el: "cat ~/tools/wordlist.txt" },
        explain: { en: "WHY: You need to see that the wordlist is a small training file, not a list of real passwords. HOW: cat displays tools/wordlist.txt inside the virtual filesystem.", el: "ΓΙΑΤΙ: Πρέπει να δεις ότι το λεξικό είναι μικρό αρχείο εκπαίδευσης και όχι λίστα πραγματικών κωδικών. ΠΩΣ: Το cat εμφανίζει το tools/wordlist.txt στο εικονικό σύστημα αρχείων." },
        check: (t) => t.flags.has("read-wordlist"),
      },
      {
        id: "hydra",
        instruction: {
          en: "Check the lab account: hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12",
          el: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12",
        },
        hint: { en: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12", el: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12" },
        explain: {
          en: "WHY: If the check succeeds immediately, the lab account has a weak password and password authentication should be closed. HOW: -l names labuser, -P names the training wordlist, and the target must stay ssh.lab.",
          el: "ΓΙΑΤΙ: Αν ο έλεγχος πετύχει αμέσως, ο λογαριασμός του εργαστηρίου έχει αδύναμο κωδικό και πρέπει να κλείσει η ταυτοποίηση με κωδικό. ΠΩΣ: Το -l ονομάζει τον labuser, το -P το λεξικό εκπαίδευσης, και ο στόχος μένει το ssh.lab.",
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
    color: "from-yellow-400 to-sky-800",
    difficulty: 4,
    title: { en: "SQL Injection (Lab)", el: "SQL Injection (Lab)" },
    subtitle: { en: "Detect and extract — simulated only", el: "Ανίχνευση και εξαγωγή — μόνο προσομοίωση" },
    badge: { en: "Query Bender", el: "Λυγιστής ερωτημάτων" },
    theory: [
      {
        heading: { en: "The idea, not a weapon", el: "Η ιδέα, όχι όπλο" },
        body: {
          en: "SQL injection happens when an application copies untrusted input into a query string. The defence is to keep data and the query separate: parameterised queries, and a database account that cannot read more than that application needs.\n\ncurl http://10.10.10.8/login.php?id=1 fetches the fictional login and gives you a clean baseline. Read the page before you compare it with anything else. sqlmap -u names that same lab URL. The simulator returns a canned finding and does not send a request to a real application. The point of the tool card is to recognise how loud an automated check is, and why a defender notices it, not to build a query.",
          el: "Το SQL injection συμβαίνει όταν μια εφαρμογή αντιγράφει μη έμπιστη είσοδο μέσα σε συμβολοσειρά ερωτήματος. Η άμυνα είναι να μείνουν χωριστά τα δεδομένα και το ερώτημα: παραμετροποιημένα ερωτήματα, και λογαριασμός βάσης που δεν διαβάζει περισσότερα από όσα χρειάζεται η εφαρμογή.\n\nΗ curl http://10.10.10.8/login.php?id=1 φέρνει τη φανταστική σελίδα σύνδεσης και σου δίνει καθαρή βάση σύγκρισης. Διάβασε τη σελίδα πριν τη συγκρίνεις με οτιδήποτε άλλο. Το sqlmap -u ονομάζει το ίδιο URL του εργαστηρίου. Ο προσομοιωτής επιστρέφει έτοιμο εύρημα και δεν στέλνει αίτημα σε πραγματική εφαρμογή. Ο σκοπός της κάρτας του εργαλείου είναι να αναγνωρίσεις πόσο θορυβώδης είναι ένας αυτοματοποιημένος έλεγχος, και γιατί τον βλέπει ο αμυνόμενος, όχι να φτιάξεις ερώτημα.",
        },
      },
    ],
    cheats: [
      { cmd: "curl 'http://10.10.10.8/login.php?id=1'", desc: { en: "normal request", el: "κανονικό αίτημα" } },
      { cmd: "sqlmap -u http://10.10.10.8/login.php?id=1", desc: { en: "canned lab detection", el: "έτοιμη ανίχνευση του lab" } },
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
        instruction: { en: "Run sqlmap against the lab URL (simulated).", el: "Εκτέλεσε sqlmap στη διεύθυνση URL του εργαστηρίου." },
        hint: { en: "sqlmap -u http://10.10.10.8/login.php?id=1", el: "sqlmap -u http://10.10.10.8/login.php?id=1" },
        explain: { en: "WHY: Tools show how loud automated injection is — defenders notice.", el: "ΓΙΑΤΙ: Τα εργαλεία είναι θορυβώδη — οι defenders το βλέπουν." },
        check: (t) => t.flags.has("sqlmap") || t.flags.has("sqli-win"),
      },
    ],
    challenges: [
      {
        title: { en: "Union extract", el: "Εξαγωγή UNION" },
        brief: { en: "Trigger the simulated UNION path (quote + or/union in the id param) or finish sqlmap.", el: "Ενεργοποίησε την προσομοιωμένη διαδρομή UNION." },
        success: { en: "You extracted a lab flag from a fake database.", el: "Απέσπασες flag από φανταστική βάση." },
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
    color: "from-cyan-300 to-cyan-700",
    difficulty: 5,
    title: { en: "Privilege Escalation", el: "Ανύψωση προνομίων" },
    subtitle: { en: "sudo -l, GTFOBins, and getting root in the sandbox", el: "sudo -l, GTFOBins και root στο sandbox" },
    badge: { en: "Root Master", el: "Ειδικός root" },
    theory: [
      {
        heading: { en: "From user to root", el: "Από χρήστη σε root" },
        body: {
          en: "After a lab session exists, the next defensive question is whether that account can do more than it should. sudo -l lists the simulated grants. In this module the grant says find may run as root.\n\nRead that as a configuration mistake. find is a search tool, and a root grant for it is broader than a search needs to be, because a powerful program running as root can change the host. The lab command sudo find / -name flag.txt is the sandbox demonstration of that grant. It does not change your computer. The fix on a system you administer is to remove the grant.",
          el: "Αφού υπάρχει μια συνεδρία του εργαστηρίου, η επόμενη αμυντική ερώτηση είναι αν εκείνος ο λογαριασμός μπορεί να κάνει περισσότερα από όσα πρέπει. Το sudo -l εμφανίζει τις εικονικές παραχωρήσεις. Σε αυτό το μάθημα η παραχώρηση λέει ότι η find μπορεί να τρέξει ως root.\n\nΔιάβασέ το ως λάθος ρύθμισης. Η find είναι εργαλείο αναζήτησης, και μια παραχώρηση root για αυτήν είναι πλατύτερη από όσο χρειάζεται μια αναζήτηση, γιατί ένα ισχυρό πρόγραμμα που τρέχει ως root μπορεί να αλλάξει τον host. Η εντολή του εργαστηρίου sudo find / -name flag.txt είναι η επίδειξη εκείνης της παραχώρησης μέσα στο sandbox. Δεν αλλάζει τον υπολογιστή σου. Η διόρθωση σε σύστημα που διαχειρίζεσαι είναι να αφαιρέσεις την παραχώρηση.",
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
        instruction: { en: "Re-check sudo -l.", el: "Έλεγξε ξανά το sudo -l." },
        hint: { en: "sudo -l", el: "sudo -l" },
        explain: { en: "WHY: Always re-enumerate on a new box.", el: "ΓΙΑΤΙ: Πάντα επαναρίθμηση." },
        check: (t) => t.flags.has("sudo-l"),
      },
      {
        id: "root",
        instruction: { en: "Escalate using sudo find (see cheatsheet).", el: "Κάνε ανύψωση προνομίων με sudo find." },
        hint: { en: "sudo find / -name flag.txt", el: "sudo find / -name flag.txt" },
        explain: { en: "WHY: find with sudo can spawn a shell. Defenders: never sudo find.", el: "ΓΙΑΤΙ: η εντολή find με sudo μπορεί να δώσει κέλυφος (shell)." },
        check: (t) => t.flags.has("got-root") || t.flags.has("privesc-find"),
      },
    ],
    challenges: [
      {
        title: { en: "Read the root flag", el: "Διάβασε το root flag" },
        brief: { en: "As root, cat /root/flag.txt", el: "Ως root, cat /root/flag.txt" },
        success: { en: "You have root access in the training lab — stay ethical.", el: "Έφτασες στο root — συνέχισε με υπευθυνότητα. Μείνε ηθικός." },
        check: (t) => t.flags.has("read-root-flag") || t.flags.has("saw:FLAG{root_of_the_lab}") || t.flags.has("got-root"),
      },
      {
        title: { en: "Submit it", el: "Υπέβαλέ το" },
        brief: { en: "submit FLAG{root_of_the_lab}", el: "submit FLAG{root_of_the_lab}" },
        success: { en: "Campaign I complete.", el: "Καμπάνια I ολοκληρώθηκε." },
        check: (t) => t.flags.has("submit:FLAG{root_of_the_lab}") || t.flags.has("got-root"),
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
          en: "Raven is a fictional box inside this sandbox. The loop is identify the service, read what it claims, then decide the hardening control. Stay on 10.10.10.5.\n\nnmap -sV 10.10.10.5 asks for the stored banners. Expect SSH and HTTP in the service column, plus a version string when -sV is present. Write the banner down before you request the page.\n\ncurl http://10.10.10.5/ prints the canned HTML. The heading names the CMS. That name is a clue about which files to look for later. It is not a vulnerability by itself. A /24 sweep, if you run one, only lists the other fictional lab hosts.",
          el: "Ο Raven είναι φανταστικό μηχάνημα μέσα σε αυτό το sandbox. Ο κύκλος είναι να αναγνωρίσεις την υπηρεσία, να διαβάσεις τι δηλώνει, και μετά να διαλέξεις τον έλεγχο σκλήρυνσης. Μείνε στο 10.10.10.5.\n\nΗ nmap -sV 10.10.10.5 ζητά τα αποθηκευμένα banners. Περίμενε SSH και HTTP στη στήλη υπηρεσίας, και συμβολοσειρά έκδοσης όταν υπάρχει το -sV. Κράτησε το banner πριν ζητήσεις τη σελίδα.\n\nΗ curl http://10.10.10.5/ τυπώνει το έτοιμο HTML. Η επικεφαλίδα ονομάζει το CMS. Αυτό το όνομα είναι ένδειξη για το ποια αρχεία θα αναζητήσεις αργότερα. Δεν είναι από μόνο του ευπάθεια. Μια σάρωση /24, αν την τρέξεις, εμφανίζει μόνο τους άλλους φανταστικούς hosts του εργαστηρίου.",
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
    color: "from-cyan-400 to-stone-800",
    difficulty: 4,
    title: { en: "Raven — Foothold", el: "Raven — Foothold" },
    subtitle: { en: "Weak creds, then user.txt", el: "Αδύναμα creds, μετά user.txt" },
    badge: { en: "Nevermore", el: "Nevermore" },
    scenario: "raven",
    theory: [
      {
        heading: { en: "Password reuse is a gift", el: "Η επαναχρησιμοποίηση κωδικών είναι δώρο" },
        body: {
          en: "The finding on raven.lab is a weak password for one fictional account. hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5 checks that one name against the training list. -l is not a spray across many accounts. The simulator prints the stored lab answer and does not try the list anywhere else.\n\nssh raven@10.10.10.5 then opens the fictional session so you can see that a valid password is enough. user.txt is the training flag in that home directory. The defensive reading is the same as on ssh.lab: do not leave password authentication on, and do not reuse a password that appears in a short list.",
          el: "Το εύρημα στο raven.lab είναι ένας αδύναμος κωδικός για έναν φανταστικό λογαριασμό. Η hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5 ελέγχει εκείνο το ένα όνομα στο λεξικό εκπαίδευσης. Το -l δεν είναι ψεκασμός σε πολλούς λογαριασμούς. Ο προσομοιωτής τυπώνει την αποθηκευμένη απάντηση του lab και δεν δοκιμάζει τη λίστα πουθενά αλλού.\n\nΤο ssh raven@10.10.10.5 ανοίγει μετά τη φανταστική συνεδρία, ώστε να δεις ότι ένας έγκυρος κωδικός αρκεί. Το user.txt είναι το εκπαιδευτικό flag σε εκείνον τον προσωπικό φάκελο. Η αμυντική ανάγνωση είναι η ίδια με το ssh.lab: μην αφήνεις ενεργή την ταυτοποίηση με κωδικό, και μην επαναχρησιμοποιείς κωδικό που εμφανίζεται σε σύντομη λίστα.",
        },
      },
    ],
    cheats: [
      { cmd: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5", desc: { en: "lab check for one raven account", el: "έλεγχος ενός λογαριασμού raven" } },
      { cmd: "ssh raven@10.10.10.5", desc: { en: "open a session", el: "άνοιξε συνεδρία" } },
    ],
    tasks: [
      {
        id: "hydra-r",
        instruction: { en: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5", el: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5" },
        hint: { en: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5", el: "hydra -l raven -P tools/wordlist.txt ssh://10.10.10.5" },
        explain: { en: "WHY: A password that sits in the training list is already a finding. HOW: -l names the one account raven, -P names the sandbox wordlist, and the host must stay 10.10.10.5.", el: "ΓΙΑΤΙ: Κωδικός που κάθεται στο λεξικό εκπαίδευσης είναι ήδη εύρημα. ΠΩΣ: Το -l ονομάζει τον έναν λογαριασμό raven, το -P το λεξικό του sandbox, και ο host μένει το 10.10.10.5." },
        check: (t) => t.flags.has("hydra-raven") || t.flags.has("hydra"),
      },
      {
        id: "ssh-r",
        instruction: { en: "ssh raven@10.10.10.5", el: "ssh raven@10.10.10.5" },
        hint: { en: "ssh raven@10.10.10.5", el: "ssh raven@10.10.10.5" },
        explain: { en: "WHY: Foothold is a shell.", el: "ΓΙΑΤΙ: Το foothold είναι ένα shell." },
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
          en: "A valid lab session can read files the account is allowed to read. cat /var/www/html/config.php prints the fictional CMS configuration. Look for a database password stored next to the application, which is a common operational mistake.\n\ncat /var/backups/cms.sql prints a simulated SQL dump. A backup is a second copy of the same data, often with weaker permissions than the live database. The training flag in that file is there so you can see why backups need the same access control as the original.\n\nNeither cat sends data off the machine. The defensive control is to keep secrets out of web directories and to restrict who can read backup files.",
          el: "Μια έγκυρη συνεδρία του εργαστηρίου μπορεί να διαβάσει αρχεία που ο λογαριασμός επιτρέπεται να διαβάσει. Το cat /var/www/html/config.php τυπώνει τη φανταστική ρύθμιση του CMS. Ψάξε για κωδικό βάσης αποθηκευμένο δίπλα στην εφαρμογή, που είναι συνηθισμένο λειτουργικό λάθος.\n\nΤο cat /var/backups/cms.sql τυπώνει ένα εικονικό SQL dump. Ένα αντίγραφο ασφαλείας είναι δεύτερο αντίγραφο των ίδιων δεδομένων, συχνά με ασθενέστερα δικαιώματα από τη ζωντανή βάση. Το εκπαιδευτικό flag σε εκείνο το αρχείο υπάρχει για να δεις γιατί τα αντίγραφα χρειάζονται τον ίδιο έλεγχο πρόσβασης με το πρωτότυπο.\n\nΚανένα cat δεν στέλνει δεδομένα έξω από το μηχάνημα. Ο αμυντικός έλεγχος είναι να μείνουν τα μυστικά έξω από καταλόγους web και να περιοριστεί ποιος μπορεί να διαβάσει αρχεία αντιγράφων.",
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
        success: { en: "backup.sh runs as root. That's your ladder.", el: "Το backup.sh εκτελείται ως root." },
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
          en: "The finding is a root-owned job whose script an ordinary account can change. cat /usr/local/bin/backup.sh prints the fictional script so you can see who would run it and what it is supposed to do. Read it before you touch it.\n\nnano /usr/local/bin/backup.sh opens the simulator's editor notice. It records that the lab file was opened. It does not apply a payload, and keyboard editing is not implemented. sudo /usr/local/bin/backup.sh then runs that simulated job with the lab's root grant.\n\nThe control is specific. Do not let root execute a script that another account can write. Fix the mode, or stop scheduling that file as root. This sandbox does not change a real cron table.",
          el: "Το εύρημα είναι μια εργασία του root της οποίας το script μπορεί να αλλάξει ένας απλός λογαριασμός. Το cat /usr/local/bin/backup.sh τυπώνει το φανταστικό script ώστε να δεις ποιος θα το έτρεχε και τι υποτίθεται ότι κάνει. Διάβασέ το πριν το αγγίξεις.\n\nΤο nano /usr/local/bin/backup.sh ανοίγει την ειδοποίηση editor του προσομοιωτή. Καταγράφει ότι το αρχείο του lab άνοιξε. Δεν εφαρμόζει payload, και η επεξεργασία με πλήκτρα δεν υλοποιείται. Το sudo /usr/local/bin/backup.sh τρέχει μετά εκείνη την εικονική εργασία με την παραχώρηση root του εργαστηρίου.\n\nΟ έλεγχος είναι συγκεκριμένος. Μην αφήνεις τον root να εκτελεί script που μπορεί να γράψει άλλος λογαριασμός. Διόρθωσε το mode, ή σταμάτα να προγραμματίζεις εκείνο το αρχείο ως root. Αυτό το sandbox δεν αλλάζει πραγματικό πίνακα cron.",
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
        explain: { en: "WHY: Trigger the job.", el: "ΓΙΑΤΙ: Ενεργοποίησε την προγραμματισμένη εργασία." },
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
        success: { en: "Box rooted. Hang the badge on the wall.", el: "Το σύστημα παραβιάστηκε πλήρως (rooted)." },
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
          en: "Public-key login trusts a private key that stays on the client. ls -la ~/.ssh lists the simulated identity files, including names that start with a dot. The mode column should show 600 on a private key: owner read and write, nothing for anyone else.\n\ncat ~/.ssh/config prints Host aliases. A short name such as jump stands for a user, a hostname, and sometimes a key file, so you do not retype the whole route. ssh jump uses that alias and opens the fictional bastion session.\n\nssh -i selects a named key file when the alias does not. The keys in this lab are fixtures. Do not copy a private key out of the sandbox, and do not treat a readable key as harmless.",
          el: "Η σύνδεση με δημόσιο κλειδί εμπιστεύεται ένα ιδιωτικό κλειδί που μένει στον client. Το ls -la ~/.ssh εμφανίζει τα εικονικά αρχεία ταυτότητας, μαζί με ονόματα που αρχίζουν με τελεία. Η στήλη mode πρέπει να δείχνει 600 σε ιδιωτικό κλειδί: ανάγνωση και εγγραφή για τον ιδιοκτήτη, τίποτα για κανέναν άλλον.\n\nΤο cat ~/.ssh/config τυπώνει τα alias Host. Ένα σύντομο όνομα όπως jump σημαίνει χρήστη, hostname και μερικές φορές αρχείο κλειδιού, ώστε να μην ξαναγράφεις όλη τη διαδρομή. Το ssh jump χρησιμοποιεί εκείνο το alias και ανοίγει τη φανταστική συνεδρία του bastion.\n\nΤο ssh -i διαλέγει ένα ονομασμένο αρχείο κλειδιού όταν το alias δεν το κάνει. Τα κλειδιά σε αυτό το εργαστήριο είναι fixtures. Μην αντιγράφεις ιδιωτικό κλειδί έξω από το sandbox, και μην αντιμετωπίζεις ένα αναγνώσιμο κλειδί ως ακίνδυνο.",
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
          en: "Some fictional hosts accept SSH only from the bastion, not from the first lab prompt. ssh -J jump dev@10.10.20.14 says that in one line. -J names the jump host. The destination after it is dev@10.10.20.14, still an address on the lab map.\n\nThe simulator chains the two fictional sessions and changes the prompt. It does not open a network path on your computer. ssh -i id_dev dev@10.10.20.14 is the same destination with an explicit key file, used when the alias is not enough.\n\nThe defensive point of a bastion is that it is the only door. It still needs its own strong authentication, logs, and no broad permission to reach every internal host.",
          el: "Κάποιοι φανταστικοί hosts δέχονται SSH μόνο από το bastion, όχι από το πρώτο prompt του εργαστηρίου. Το ssh -J jump dev@10.10.20.14 το λέει σε μία γραμμή. Το -J ονομάζει τον jump host. Ο προορισμός μετά από αυτό είναι dev@10.10.20.14, ακόμη διεύθυνση στον χάρτη του lab.\n\nΟ προσομοιωτής ενώνει τις δύο φανταστικές συνεδρίες και αλλάζει το prompt. Δεν ανοίγει διαδρομή δικτύου στον υπολογιστή σου. Το ssh -i id_dev dev@10.10.20.14 είναι ο ίδιος προορισμός με ρητό αρχείο κλειδιού, όταν το alias δεν αρκεί.\n\nΤο αμυντικό νόημα ενός bastion είναι ότι είναι η μόνη πόρτα. Χρειάζεται ακόμη τη δική του ισχυρή ταυτοποίηση, αρχεία καταγραφής, και όχι πλατιά άδεια να φτάνει κάθε εσωτερικό host.",
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
        explain: { en: "WHY: -J is ProxyJump.", el: "ΓΙΑΤΙ: Η επιλογή -J ενεργοποιεί το ProxyJump." },
        check: (t) => t.flags.has("ssh-hop") || t.flags.has("ssh-dev"),
      },
    ],
    challenges: [
      {
        title: { en: "Land on dev", el: "Προσγείωση στο dev" },
        brief: { en: "Reach host dev via the jump box.", el: "Φτάσε στο dev μέσω jump." },
        success: { en: "You hopped.", el: "Πραγματοποίησες την αναπήδηση (hop)." },
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
          en: "db-int.lab at 10.10.20.30 does not answer from the first lab prompt. It answers only after the fictional session is on dev. That is the segmentation this module is about.\n\nssh -J jump dev@10.10.20.14 gets you to that intermediate host inside the simulator. ssh db-int, or ssh 10.10.20.30, then uses the alias or the address from that context. A welcome banner means the lab route was accepted. No socket is opened on your computer.\n\nA local forward is the same idea in production: an authenticated session can reach a service that was not directly exposed. This module does not build that tunnel. The control, on a host you administer, is AllowTcpForwarding no unless a named task needs it, plus logs for SSH between internal hosts.",
          el: "Το db-int.lab στο 10.10.20.30 δεν απαντά από το πρώτο prompt του εργαστηρίου. Απαντά μόνο αφού η φανταστική συνεδρία είναι στο dev. Αυτή είναι η τμηματοποίηση για την οποία μιλά το μάθημα.\n\nΤο ssh -J jump dev@10.10.20.14 σε πάει σε εκείνον τον ενδιάμεσο host μέσα στον προσομοιωτή. Το ssh db-int, ή το ssh 10.10.20.30, χρησιμοποιεί μετά το alias ή τη διεύθυνση από εκείνο το πλαίσιο. Μήνυμα υποδοχής σημαίνει ότι η διαδρομή του lab έγινε δεκτή. Δεν ανοίγει socket στον υπολογιστή σου.\n\nΜια τοπική προώθηση είναι η ίδια ιδέα σε παραγωγή: μια ταυτοποιημένη συνεδρία μπορεί να φτάσει υπηρεσία που δεν ήταν άμεσα εκτεθειμένη. Αυτό το μάθημα δεν φτιάχνει εκείνο το τούνελ. Ο έλεγχος, σε host που διαχειρίζεσαι, είναι AllowTcpForwarding no εκτός αν μια συγκεκριμένη εργασία το χρειάζεται, μαζί με αρχεία καταγραφής για SSH ανάμεσα σε εσωτερικούς hosts.",
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
        instruction: { en: "Hop to dev (ssh -J jump dev@10.10.20.14).", el: "Μεταπήδησε στο dev." },
        hint: { en: "ssh -J jump dev@10.10.20.14", el: "ssh -J jump dev@10.10.20.14" },
        explain: { en: "WHY: You cannot skip the hop.", el: "ΓΙΑΤΙ: Δεν παραλείπεις το hop." },
        check: (t) => t.flags.has("ssh-dev") || t.flags.has("ssh-hop"),
      },
      {
        id: "db",
        instruction: { en: "From that context, ssh to 10.10.20.30 or db-int.", el: "ssh στο 10.10.20.30" },
        hint: { en: "ssh 10.10.20.30", el: "ssh 10.10.20.30" },
        explain: { en: "WHY: Dual-homed hosts are pivots.", el: "ΓΙΑΤΙ: Τα συστήματα με δύο συνδέσεις (dual-homed) λειτουργούν ως pivots." },
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

const REHOMED_LINUX_BEGINNERS_MODULE_IDS = new Set([
  "sr-net", "sr-proc", "sr-env",
  "sr-bash", "sr-cron", "sr-svc",
]);

export const CAMPAIGNS: Campaign[] = ([
  {
    id: "gamehack",
    pathNumber: 1,
    title: { en: "In the Beginning... Linux Was Born", el: "Στην αρχή... γεννήθηκε το Linux" },
    subtitle: { en: "Linux foundations: from your first command to root", el: "Θεμέλια Linux: από την πρώτη εντολή ως το root" },
    blurb: {
      en: "Nine sequenced labs from first prompt to root. Linux, recon, scanning, credentials, SQLi, privesc — all simulated.",
      el: "Εννέα εργαστήρια από το πρώτο prompt ως το root. Όλα προσομοιωμένα.",
    },
    scenario: "lab",
    accent: "cyan",
    modules: MODULES.filter((m) =>
      ["linux-basics", "files", "permissions", "networking", "recon", "scanning", "bruteforce", "sqli", "privesc"].includes(m.id)
    ),
  },
  {
    id: "raven",
    pathNumber: 6,
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
    pathNumber: 5,
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
    title: { en: "Linux for Beginners #1", el: "Linux για αρχάριους #1" },
    subtitle: { en: "The terminal, files, text, packages and permissions", el: "Τερματικό, αρχεία, κείμενο, πακέτα και δικαιώματα" },
    blurb: {
      en: "The first Linux beginners course: why the shell exists, how to read a prompt, and the everyday commands for files, text, packages and permissions. Every example stays in the sandbox. Networking, processes and Bash continue in #2 and #3.",
      el: "Το πρώτο μάθημα Linux για αρχάριους: γιατί υπάρχει το shell, πώς διαβάζεται ένα prompt, και οι καθημερινές εντολές για αρχεία, κείμενο, πακέτα και δικαιώματα. Κάθε παράδειγμα μένει στο sandbox. Δίκτυα, διεργασίες και Bash συνεχίζουν στα #2 και #3.",
    },
    scenario: "sudorun",
    accent: "lime",
    modules: SUDO_RUN_ALL
      .filter((module) => !REHOMED_LINUX_BEGINNERS_MODULE_IDS.has(module.id))
      .map((module, index) => ({ ...module, order: index + 1 })),
  },
  {
    id: "linux-beginners-2",
    pathNumber: 3,
    title: { en: "Linux for Beginners #2", el: "Linux για αρχάριους #2" },
    subtitle: {
      en: "Networks, processes, scheduling and the shell environment",
      el: "Δίκτυα, διεργασίες, προγραμματισμός και περιβάλλον shell",
    },
    blurb: {
      en: "Read and configure fictional interfaces, resolve lab names, inspect and signal processes, schedule simulated jobs, and manage shell variables.",
      el: "Έλεγξε εικονικές διεπαφές, επίλυσε ονόματα του εργαστηρίου, παρατήρησε διεργασίες, δοκίμασε προγραμματισμένες εργασίες και διαχειρίσου μεταβλητές shell.",
    },
    scenario: "sudorun",
    accent: "cyan",
    modules: LINUX_BEGINNERS_2_MODULES,
  },
  {
    id: "linux-beginners-3",
    pathNumber: 4,
    title: { en: "Linux for Beginners #3", el: "Linux για αρχάριους #3" },
    subtitle: {
      en: "Bash scripting, cron, boot services, Apache, SSH and FTP",
      el: "Bash scripting, cron, υπηρεσίες εκκίνησης, Apache, SSH και FTP",
    },
    blurb: {
      en: "Continue the Linux series with readable Bash scripts, a fixture-only Nmap pipeline, recurring schedules, SysV boot links, and simulations of Apache, OpenSSH and FTP, with every file and service in the player’s persistent VFS.",
      el: "Συνέχισε τη σειρά Linux με κατανοητά Bash scripts, εικονικό pipeline Nmap, επαναλαμβανόμενα προγράμματα, SysV συνδέσμους εκκίνησης και προσομοιώσεις Apache, OpenSSH και FTP, με όλα τα αρχεία και τις υπηρεσίες στο μόνιμο VFS του παίκτη.",
    },
    scenario: "sudorun",
    accent: "lime",
    modules: LINUX_BEGINNERS_3_MODULES,
  },
  {
    id: "dfir-fieldwork",
    pathNumber: 7,
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
  {
    id: "ssh-service",
    pathNumber: 8,
    title: { en: "SSH Service Security Testing", el: "Ελεγχος ασφάλειας υπηρεσίας SSH" },
    subtitle: { en: "From the banner to hardening, inside the fictional lab", el: "Από το banner ως τη σκλήρυνση, μέσα στο φανταστικό εργαστήριο" },
    blurb: {
      en: "Five labs for the SSH service: banner, authentication methods, a lab-only credential check, keys and forwarding, and an isolated practice loop. Impacts of a valid session are named so you can harden against them. Every command stays in the sandbox.",
      el: "Πέντε εργαστήρια για την υπηρεσία SSH: banner, μέθοδοι ταυτοποίησης, έλεγχος διαπιστευτηρίων μόνο του lab, κλειδιά και προώθηση, και απομονωμένος κύκλος εξάσκησης. Οι συνέπειες μιας έγκυρης συνεδρίας ονομάζονται, για να σκληρύνεις εναντίον τους. Κάθε εντολή μένει στο sandbox.",
    },
    scenario: "lab",
    accent: "cyan",
    modules: SSH_SERVICE_MODULES,
  },
] as Campaign[]).sort((a, b) => a.pathNumber - b.pathNumber);

export const LEARNING_PATHS = [...CAMPAIGNS];

export function moduleById(id: string): Module | undefined {
  return (
    MODULES.find((module) => module.id === id) ||
    CAMPAIGNS.flatMap((campaign) => campaign.modules).find((module) => module.id === id) ||
    SUDO_RUN_ALL.find((module) => module.id === id) ||
    LINUX_BEGINNERS_2_MODULES.find((module) => module.id === id) ||
    LINUX_BEGINNERS_3_MODULES.find((module) => module.id === id) ||
    DFIR_MODULES.find((module) => module.id === id) ||
    SSH_SERVICE_MODULES.find((module) => module.id === id)
  );
}

export function campaignById(id: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

export function campaignForModule(moduleId: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.modules.some((m) => m.id === moduleId));
}
