import type { Terminal } from "../lib/terminal";
import { RAVEN_MODULES } from "./raven-lessons";
import { SSH_MODULES } from "./ssh-lessons";
import { SUDO_MODULES_A } from "./sudorun-lessons-a";
import { SUDO_MODULES_B } from "./sudorun-lessons-b";
import { SUDO_MODULES_C } from "./sudorun-lessons-c";

export type Bi = { en: string; el: string };

// A check receives the active tool context: the Terminal (intro campaign) or the
// RavenSession (raven campaign). Typed loosely so both campaigns can share one shape.
export type CheckCtx = any;

export type Task = {
  id: string;
  instruction: Bi;
  hint: Bi;
  // "?" popup: why this command matters and how to use it.
  explain: Bi;
  check: (ctx: CheckCtx) => boolean;
  reward?: number;
};

export type Section = { heading: Bi; body: Bi; tip?: Bi };

// Final gated challenge — NO hint / no solution is shown to the player.
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
  color: string; // tailwind gradient class fragment
  title: Bi;
  subtitle: Bi;
  difficulty: 1 | 2 | 3 | 4 | 5;
  badge: Bi;
  theory: Section[];
  cheats: { cmd: string; desc: Bi }[];
  tasks: Task[];
  // Two final challenges, both gated and different from the objectives. No
  // hint/solution is shown; the player must solve BOTH to finish the module.
  challenges: [Challenge, Challenge];
  // which tool(s) the lab shows; defaults to terminal-only
  tool?: "terminal" | "browser" | "both";
  // Sudo_Run: custom virtual filesystem builder for the lab terminal
  labFS?: () => import("../lib/terminal").FileNode;
  // Raven-only: seed the shared session so a lab starts from prior progress.
  ravenInit?: (term: CheckCtx) => void;
  // SSH-only: seed the shared session so a lab starts from prior progress.
  sshInit?: (term: CheckCtx) => void;
};

export type Campaign = {
  id: string;
  title: Bi;
  subtitle: Bi;
  scenario: "lab" | "raven" | "ssh";
  modules: Module[];
};

const usedCmd = (t: Terminal, re: RegExp) => t.ran.some((c) => re.test(c));

export const MODULES: Module[] = [
  // 1 — LINUX BASICS
  {
    id: "linux-basics",
    order: 1,
    icon: "⌘",
    color: "from-ember-500 to-ember-700",
    difficulty: 1,
    title: { en: "Terminal & Linux Foundations", el: "Τερματικό & Θεμέλια Linux" },
    subtitle: { en: "Meet the command line, then navigate it", el: "Γνώρισε τη γραμμή εντολών και πλοηγήσου" },
    badge: { en: "Shell Initiate", el: "Μυημένος του Shell" },
    theory: [
      {
        heading: { en: "What is a terminal / CLI?", el: "Τι είναι το τερματικό / CLI;" },
        body: {
          en: "A terminal is a text window where you talk to the computer by typing commands instead of clicking. This is the Command Line Interface (CLI), driven by a program called the 'shell' (here, bash). You type one line, press Enter, and the shell runs it and prints the result. Almost every hacking and security tool lives here — mastering the CLI is the single most important skill for a security professional.",
          el: "Το τερματικό είναι ένα παράθυρο κειμένου όπου μιλάς στον υπολογιστή γράφοντας εντολές αντί να κάνεις κλικ. Αυτό είναι το Command Line Interface (CLI), που το οδηγεί ένα πρόγραμμα, το 'shell' (εδώ, bash). Γράφεις μια γραμμή, πατάς Enter, το shell την εκτελεί και τυπώνει το αποτέλεσμα. Σχεδόν κάθε εργαλείο χάκινγκ ζει εδώ — η κατοχή του CLI είναι η πιο σημαντική δεξιότητα ενός επαγγελματία ασφάλειας.",
        },
      },
      {
        heading: { en: "Reading the prompt", el: "Διαβάζοντας το prompt" },
        body: {
          en: "Before every command the shell shows a 'prompt', e.g. operator@kali:~$. It tells you WHO you are (operator), WHICH machine (kali) and WHERE you are (~ = home). The '$' means a normal user; a '#' would mean you are root (admin). You type your command right after it and press Enter to run it.",
          el: "Πριν από κάθε εντολή το shell δείχνει ένα 'prompt', π.χ. operator@kali:~$. Σου λέει ΠΟΙΟΣ είσαι (operator), ΠΟΙΟ μηχάνημα (kali) και ΠΟΥ βρίσκεσαι (~ = home). Το '$' σημαίνει απλός χρήστης· ένα '#' θα σήμαινε ότι είσαι root (διαχειριστής). Γράφεις την εντολή αμέσως μετά και πατάς Enter.",
        },
      },
      {
        heading: { en: "Work faster: Tab, history, clear", el: "Δούλεψε πιο γρήγορα: Tab, ιστορικό, clear" },
        body: {
          en: "Pros rarely type full commands. Press Tab to AUTO-COMPLETE a command or filename — start typing and hit Tab; if there are several matches it lists them. Press ↑ and ↓ to scroll through commands you already ran (your history), so you never retype. When the screen gets messy, type 'clear' (or press Ctrl+L) to wipe it. And 'help' lists every command available in this lab.",
          el: "Οι επαγγελματίες σπάνια γράφουν ολόκληρες εντολές. Πάτα Tab για ΑΥΤΟΜΑΤΗ ΣΥΜΠΛΗΡΩΣΗ εντολής ή αρχείου — άρχισε να γράφεις και πάτα Tab· αν υπάρχουν πολλά, τα εμφανίζει. Πάτα ↑ και ↓ για να δεις εντολές που ήδη έτρεξες (το ιστορικό), ώστε να μην ξαναγράφεις. Όταν η οθόνη γεμίσει, γράψε 'clear' (ή Ctrl+L) για καθαρισμό. Και το 'help' εμφανίζει όλες τις διαθέσιμες εντολές του εργαστηρίου.",
        },
        tip: {
          en: "Tab is your best friend: it saves time AND prevents typos in long filenames and IP-heavy commands.",
          el: "Το Tab είναι ο καλύτερός σου φίλος: γλιτώνει χρόνο ΚΑΙ αποτρέπει λάθη σε μεγάλα ονόματα αρχείων και εντολές με πολλές IP.",
        },
      },
      {
        heading: { en: "Where am I? (pwd)", el: "Πού βρίσκομαι; (pwd)" },
        body: {
          en: "The filesystem is a tree that starts at the root '/'. 'pwd' (print working directory) shows your current location. '~' is a shortcut for your home directory, /home/operator.",
          el: "Το σύστημα αρχείων είναι ένα δέντρο που ξεκινά από τη ρίζα '/'. Το 'pwd' (print working directory) δείχνει την τρέχουσα θέση σου. Το '~' είναι συντόμευση για τον αρχικό σου φάκελο, /home/operator.",
        },
      },
      {
        heading: { en: "Looking & moving (ls, cd)", el: "Παρατήρηση & μετακίνηση (ls, cd)" },
        body: {
          en: "'ls' lists what's in a folder. 'ls -a' also reveals hidden files (their names start with a dot). 'cd folder' moves into a folder, 'cd ..' goes up one level, and 'cat file' prints a file's contents.",
          el: "Το 'ls' εμφανίζει τα περιεχόμενα ενός φακέλου. Το 'ls -a' αποκαλύπτει και κρυφά αρχεία (τα ονόματά τους ξεκινούν με τελεία). Το 'cd φάκελος' μπαίνει σε φάκελο, το 'cd ..' ανεβαίνει ένα επίπεδο, και το 'cat αρχείο' τυπώνει το περιεχόμενο ενός αρχείου.",
        },
        tip: {
          en: "Hidden files are a favorite place to stash secrets and config — always check with 'ls -a'.",
          el: "Τα κρυφά αρχεία είναι αγαπημένο σημείο για μυστικά και ρυθμίσεις — έλεγχε πάντα με 'ls -a'.",
        },
      },
    ],
    cheats: [
      { cmd: "help", desc: { en: "list all available commands", el: "όλες οι διαθέσιμες εντολές" } },
      { cmd: "Tab ↹", desc: { en: "auto-complete command/file", el: "αυτόματη συμπλήρωση" } },
      { cmd: "↑ / ↓", desc: { en: "browse command history", el: "περιήγηση ιστορικού" } },
      { cmd: "clear (Ctrl+L)", desc: { en: "clear the screen", el: "καθαρισμός οθόνης" } },
      { cmd: "whoami", desc: { en: "current user", el: "τρέχων χρήστης" } },
      { cmd: "pwd", desc: { en: "print current directory", el: "τρέχων φάκελος" } },
      { cmd: "ls / ls -a / ls -l", desc: { en: "list files (all / long)", el: "λίστα αρχείων (όλα / αναλυτικά)" } },
      { cmd: "cd DIR / cd ..", desc: { en: "change directory / go up", el: "αλλαγή φακέλου / πάνω" } },
      { cmd: "cat FILE", desc: { en: "show file contents", el: "εμφάνιση περιεχομένου" } },
    ],
    tasks: [
      {
        id: "help",
        instruction: { en: "Type 'help' to see every command available in this lab.", el: "Γράψε 'help' για να δεις όλες τις διαθέσιμες εντολές του εργαστηρίου." },
        hint: { en: "help", el: "help" },
        explain: {
          en: "WHY: When you sit at an unfamiliar shell, the first thing to learn is what you can do. In this lab 'help' lists every supported command grouped by category. HOW: just type 'help' and press Enter — no arguments needed. On a real Linux box you'd use 'man COMMAND' to read a command's manual.",
          el: "ΓΙΑΤΙ: Όταν βρίσκεσαι σε άγνωστο shell, το πρώτο που μαθαίνεις είναι τι μπορείς να κάνεις. Εδώ το 'help' εμφανίζει κάθε υποστηριζόμενη εντολή ανά κατηγορία. ΠΩΣ: γράψε απλά 'help' και πάτα Enter — χωρίς ορίσματα. Σε πραγματικό Linux θα χρησιμοποιούσες 'man ΕΝΤΟΛΗ' για το εγχειρίδιο μιας εντολής.",
        },
        check: (t) => t.ranHelp,
      },
      {
        id: "whoami",
        instruction: { en: "Find out which user you are logged in as with whoami.", el: "Βρες με ποιον χρήστη είσαι συνδεδεμένος με το whoami." },
        hint: { en: "whoami", el: "whoami" },
        explain: {
          en: "WHY: Knowing your identity is step one on any system — your username decides what you're allowed to read, write and run. HOW: 'whoami' prints just your username (e.g. operator). Compare it with the name shown in your prompt.",
          el: "ΓΙΑΤΙ: Η γνώση της ταυτότητάς σου είναι το πρώτο βήμα σε κάθε σύστημα — το όνομα χρήστη καθορίζει τι επιτρέπεσαι να διαβάσεις, να γράψεις και να εκτελέσεις. ΠΩΣ: Το 'whoami' τυπώνει μόνο το όνομα χρήστη (π.χ. operator). Σύγκρινέ το με το όνομα στο prompt σου.",
        },
        check: (t) => t.ranWhoami,
      },
      {
        id: "clear",
        instruction: { en: "The screen is getting busy — clear it with the clear command.", el: "Η οθόνη γέμισε — καθάρισέ την με την εντολή clear." },
        hint: { en: "clear   (or press Ctrl+L)", el: "clear   (ή πάτα Ctrl+L)" },
        explain: {
          en: "WHY: During long sessions the terminal fills with output; clearing it helps you focus on what comes next. It does NOT delete anything — just tidies the view. HOW: type 'clear' and Enter, or the shortcut Ctrl+L. Your command history stays intact (try ↑).",
          el: "ΓΙΑΤΙ: Σε μεγάλες συνεδρίες το τερματικό γεμίζει με έξοδο· ο καθαρισμός σε βοηθά να εστιάσεις στο επόμενο. ΔΕΝ διαγράφει τίποτα — απλώς τακτοποιεί την προβολή. ΠΩΣ: γράψε 'clear' και Enter, ή τη συντόμευση Ctrl+L. Το ιστορικό εντολών παραμένει (δοκίμασε ↑).",
        },
        check: (t) => t.ranClear,
      },
      {
        id: "pwd",
        instruction: { en: "Find out where you are with pwd.", el: "Βρες πού βρίσκεσαι με το pwd." },
        hint: { en: "Just type: pwd", el: "Απλά γράψε: pwd" },
        explain: {
          en: "WHY: You must always know your current location in the filesystem before running commands — many act on the current directory. HOW: 'pwd' (print working directory) takes no arguments and prints the full absolute path, e.g. /home/operator.",
          el: "ΓΙΑΤΙ: Πρέπει πάντα να ξέρεις πού βρίσκεσαι στο σύστημα αρχείων πριν τρέξεις εντολές — πολλές ενεργούν στον τρέχοντα φάκελο. ΠΩΣ: Το 'pwd' (print working directory) δεν παίρνει ορίσματα και τυπώνει την πλήρη διαδρομή, π.χ. /home/operator.",
        },
        check: (t) => t.ranPwd,
      },
      {
        id: "ls",
        instruction: { en: "List the files in your home directory.", el: "Εμφάνισε τα αρχεία στον αρχικό σου φάκελο." },
        hint: { en: "Type: ls", el: "Γράψε: ls" },
        explain: {
          en: "WHY: 'ls' (list) is how you see what a directory contains — the first thing you do when exploring any system. HOW: run 'ls' for the current folder, or 'ls /path' for another. Add '-l' for details, '-a' for hidden files.",
          el: "ΓΙΑΤΙ: Το 'ls' (list) σου δείχνει τι περιέχει ένας φάκελος — το πρώτο πράγμα όταν εξερευνάς ένα σύστημα. ΠΩΣ: τρέξε 'ls' για τον τρέχοντα φάκελο, ή 'ls /διαδρομή' για άλλον. Πρόσθεσε '-l' για λεπτομέρειες, '-a' για κρυφά.",
        },
        check: (t) => t.listedDirs.has("/home/operator"),
      },
      {
        id: "hidden",
        instruction: { en: "Reveal hidden files — there's a secret one.", el: "Αποκάλυψε τα κρυφά αρχεία — υπάρχει ένα μυστικό." },
        hint: { en: "Use the -a flag: ls -a", el: "Χρησιμοποίησε το -a: ls -a" },
        explain: {
          en: "WHY: Files whose name starts with '.' are hidden and often hold secrets, configs and credentials — attackers always look for them. HOW: 'ls -a' shows ALL entries including dotfiles. Combine flags: 'ls -la' for hidden + details.",
          el: "ΓΙΑΤΙ: Τα αρχεία που ξεκινούν με '.' είναι κρυφά και συχνά κρύβουν μυστικά, ρυθμίσεις και διαπιστευτήρια — οι επιτιθέμενοι πάντα τα ψάχνουν. ΠΩΣ: Το 'ls -a' δείχνει ΟΛΑ τα αρχεία μαζί με τα κρυφά. Συνδύασε: 'ls -la' για κρυφά + λεπτομέρειες.",
        },
        check: (t) => t.listedHidden,
      },
      {
        id: "cat-secret",
        instruction: { en: "Read the hidden .secret file with cat.", el: "Διάβασε το κρυφό αρχείο .secret με cat." },
        hint: { en: "cat .secret", el: "cat .secret" },
        explain: {
          en: "WHY: 'cat' prints a file's contents to the screen — essential for reading configs, notes and captured loot. HOW: 'cat filename'. You can read several at once: 'cat a.txt b.txt'. For long files use 'less' to scroll.",
          el: "ΓΙΑΤΙ: Το 'cat' τυπώνει το περιεχόμενο ενός αρχείου στην οθόνη — απαραίτητο για ανάγνωση ρυθμίσεων, σημειώσεων και ευρημάτων. ΠΩΣ: 'cat όνομα'. Μπορείς πολλά μαζί: 'cat a.txt b.txt'. Για μεγάλα αρχεία χρησιμοποίησε 'less'.",
        },
        check: (t) => t.readFiles.has("/home/operator/.secret"),
      },
      {
        id: "cd-docs",
        instruction: { en: "Enter the 'documents' directory and list its files.", el: "Μπες στον φάκελο 'documents' και δες τα αρχεία." },
        hint: { en: "cd documents  then  ls", el: "cd documents  και μετά  ls" },
        explain: {
          en: "WHY: 'cd' (change directory) is how you move around the filesystem to reach files and tools. HOW: 'cd folder' enters it, 'cd ..' goes up one level, 'cd ~' returns home, 'cd /' goes to root. Then 'ls' to see what's there.",
          el: "ΓΙΑΤΙ: Το 'cd' (change directory) σε μετακινεί στο σύστημα αρχείων για να φτάσεις σε αρχεία και εργαλεία. ΠΩΣ: 'cd φάκελος' μπαίνει, 'cd ..' ανεβαίνει ένα επίπεδο, 'cd ~' επιστρέφει στο home, 'cd /' στη ρίζα. Μετά 'ls' για να δεις.",
        },
        check: (t) => t.cwd.join("/").endsWith("home/operator/documents") && t.listedDirs.has("/home/operator/documents"),
      },
    ],
    challenges: [
      {
        title: { en: "The Hidden Vault", el: "Το Κρυφό Θησαυροφυλάκιο" },
        brief: {
          en: "Somewhere in your home directory there is a concealed vault holding a flag. Reveal what is hidden, go inside, and read the flag. No hints — apply what you learned.",
          el: "Κάπου στον αρχικό σου φάκελο υπάρχει ένα κρυφό θησαυροφυλάκιο με ένα flag. Αποκάλυψε το κρυφό, μπες μέσα και διάβασε το flag. Χωρίς υποδείξεις — εφάρμοσε όσα έμαθες.",
        },
        success: { en: "Flag captured — nothing stays hidden from you.", el: "Το flag αποκτήθηκε — τίποτα δεν σου κρύβεται." },
        check: (t) => t.capturedFlags.has("flag{you_navigated_the_hidden_vault}"),
      },
      {
        title: { en: "The Operator's Keys", el: "Τα Κλειδιά του Χειριστή" },
        brief: {
          en: "A hidden folder holds your SSH key pair. A careless operator exposes the private key; a careful one only ever shares the PUBLIC one. Locate the folder and print your public key to the screen.",
          el: "Ένας κρυφός φάκελος κρατά το ζεύγος κλειδιών SSH σου. Ο απρόσεκτος χειριστής εκθέτει το ιδιωτικό· ο προσεκτικός μοιράζεται μόνο το ΔΗΜΟΣΙΟ. Εντόπισε τον φάκελο και τύπωσε το δημόσιο κλειδί σου στην οθόνη.",
        },
        success: { en: "Public key displayed — and the private one stayed secret.", el: "Το δημόσιο κλειδί εμφανίστηκε — και το ιδιωτικό έμεινε μυστικό." },
        check: (t) => t.readFiles.has("/home/operator/.ssh/id_rsa.pub"),
      },
    ],
  },

  // 2 — FILES
  {
    id: "files",
    order: 2,
    icon: "📁",
    color: "from-amber-400 to-ember-600",
    difficulty: 1,
    title: { en: "Files & Text", el: "Αρχεία & Κείμενο" },
    subtitle: { en: "Create, move, search and grep", el: "Δημιουργία, μετακίνηση, αναζήτηση και grep" },
    badge: { en: "File Wrangler", el: "Δαμαστής Αρχείων" },
    theory: [
      {
        heading: { en: "Making & removing", el: "Δημιουργία & διαγραφή" },
        body: {
          en: "'mkdir' makes a directory, 'touch' creates an empty file, 'cp' copies, 'mv' moves/renames, and 'rm' deletes (use 'rm -r' for a folder). Be careful — there is no recycle bin on the command line.",
          el: "Το 'mkdir' φτιάχνει φάκελο, το 'touch' δημιουργεί κενό αρχείο, το 'cp' αντιγράφει, το 'mv' μετακινεί/μετονομάζει, και το 'rm' διαγράφει (με 'rm -r' για φάκελο). Προσοχή — δεν υπάρχει κάδος ανακύκλωσης στη γραμμή εντολών.",
        },
      },
      {
        heading: { en: "Searching (find & grep)", el: "Αναζήτηση (find & grep)" },
        body: {
          en: "'find . -name \"*.txt\"' searches for files by name. 'grep PATTERN file' searches inside a file for text. During recon you'll grep through configs and logs looking for passwords, IPs and secrets.",
          el: "Το 'find . -name \"*.txt\"' ψάχνει αρχεία με βάση το όνομα. Το 'grep ΜΟΤΙΒΟ αρχείο' ψάχνει κείμενο μέσα σε αρχείο. Κατά την αναγνώριση θα κάνεις grep σε configs και logs ψάχνοντας κωδικούς, IP και μυστικά.",
        },
        tip: {
          en: "'grep -i' ignores case. Combine tools with pipes later to build powerful one-liners.",
          el: "Το 'grep -i' αγνοεί πεζά/κεφαλαία. Αργότερα συνδύασε εργαλεία με pipes για ισχυρές εντολές.",
        },
      },
    ],
    cheats: [
      { cmd: "mkdir DIR", desc: { en: "make a directory", el: "δημιουργία φακέλου" } },
      { cmd: "touch FILE", desc: { en: "create empty file", el: "δημιουργία κενού αρχείου" } },
      { cmd: "cp / mv / rm", desc: { en: "copy / move / delete", el: "αντιγραφή / μετακίνηση / διαγραφή" } },
      { cmd: "find . -name \"*.txt\"", desc: { en: "find files by name", el: "εύρεση αρχείων" } },
      { cmd: "grep TEXT FILE", desc: { en: "search inside a file", el: "αναζήτηση μέσα σε αρχείο" } },
    ],
    tasks: [
      {
        id: "mkdir",
        instruction: { en: "Create a directory named 'recon'.", el: "Δημιούργησε φάκελο με όνομα 'recon'." },
        hint: { en: "mkdir recon", el: "mkdir recon" },
        explain: {
          en: "WHY: You need folders to organise your work — keep scan output, loot and notes separate during an engagement. HOW: 'mkdir name' makes a directory. 'mkdir -p a/b/c' creates nested folders in one go.",
          el: "ΓΙΑΤΙ: Χρειάζεσαι φακέλους για να οργανώσεις τη δουλειά σου — κράτα ξεχωριστά αποτελέσματα σάρωσης, ευρήματα και σημειώσεις. ΠΩΣ: 'mkdir όνομα' φτιάχνει φάκελο. Το 'mkdir -p a/b/c' δημιουργεί εμφωλευμένους φακέλους μαζί.",
        },
        check: (t) => usedCmd(t, /^mkdir\s+\S*recon/),
      },
      {
        id: "touch",
        instruction: { en: "Create an empty file called 'targets.txt'.", el: "Δημιούργησε κενό αρχείο 'targets.txt'." },
        hint: { en: "touch targets.txt", el: "touch targets.txt" },
        explain: {
          en: "WHY: You often need an empty file to write findings into, or to create a placeholder/wordlist. HOW: 'touch filename' creates an empty file (or updates its timestamp if it already exists).",
          el: "ΓΙΑΤΙ: Συχνά χρειάζεσαι ένα κενό αρχείο για να γράψεις ευρήματα, ή για placeholder/wordlist. ΠΩΣ: 'touch όνομα' δημιουργεί κενό αρχείο (ή ενημερώνει την ημερομηνία του αν υπάρχει ήδη).",
        },
        check: (t) => usedCmd(t, /^touch\s+.*targets\.txt/),
      },
      {
        id: "find",
        instruction: { en: "Find every .txt file starting from your home directory.", el: "Βρες κάθε αρχείο .txt ξεκινώντας από τον αρχικό φάκελο." },
        hint: { en: 'find . -name "*.txt"', el: 'find . -name "*.txt"' },
        explain: {
          en: "WHY: On a big system you can't browse folder by folder — 'find' searches an entire tree for files matching criteria. HOW: 'find START -name PATTERN', e.g. 'find / -name \"*.conf\"'. Use quotes and '*' as a wildcard.",
          el: "ΓΙΑΤΙ: Σε ένα μεγάλο σύστημα δεν γίνεται να ψάχνεις φάκελο-φάκελο — το 'find' ψάχνει ολόκληρο το δέντρο για αρχεία που ταιριάζουν. ΠΩΣ: 'find ΑΡΧΗ -name ΜΟΤΙΒΟ', π.χ. 'find / -name \"*.conf\"'. Χρησιμοποίησε εισαγωγικά και '*' ως μπαλαντέρ.",
        },
        check: (t) => usedCmd(t, /^find\s+.*-name/),
      },
      {
        id: "grep",
        instruction: { en: "Use grep to find the line containing 'target' in notes.md.", el: "Χρησιμοποίησε grep για τη γραμμή που περιέχει 'target' στο notes.md." },
        hint: { en: "grep target notes.md", el: "grep target notes.md" },
        explain: {
          en: "WHY: 'grep' finds text inside files — the fastest way to spot passwords, IPs, keys or a keyword in logs and configs. HOW: 'grep WORD file'. Add '-i' to ignore case, '-r' to search a whole folder recursively.",
          el: "ΓΙΑΤΙ: Το 'grep' βρίσκει κείμενο μέσα σε αρχεία — ο ταχύτερος τρόπος να εντοπίσεις κωδικούς, IP, κλειδιά ή μια λέξη-κλειδί σε logs και ρυθμίσεις. ΠΩΣ: 'grep ΛΕΞΗ αρχείο'. Πρόσθεσε '-i' για πεζά/κεφαλαία, '-r' για αναδρομική αναζήτηση σε φάκελο.",
        },
        check: (t) => usedCmd(t, /^grep\s+.*target.*notes\.md/),
      },
    ],
    challenges: [
      {
        title: { en: "Hunt the Backdoor", el: "Κυνήγι της Κερκόπορτας" },
        brief: {
          en: "Intel says one file somewhere under your documents contains the word 'BACKDOOR'. Track it down and read it to recover the flag. Combine searching and reading.",
          el: "Οι πληροφορίες λένε ότι ένα αρχείο κάπου μέσα στα documents περιέχει τη λέξη 'BACKDOOR'. Εντόπισέ το και διάβασέ το για να πάρεις το flag. Συνδύασε αναζήτηση και ανάγνωση.",
        },
        success: { en: "Backdoor found — the flag is yours.", el: "Η κερκόπορτα βρέθηκε — το flag είναι δικό σου." },
        check: (t) => t.capturedFlags.has("flag{grep_found_the_backdoor}"),
      },
      {
        title: { en: "Secure the Evidence", el: "Ασφάλισε τα Στοιχεία" },
        brief: {
          en: "Good operators preserve evidence. Place a copy of your recon notes (notes.md) inside the empty 'loot' directory, without deleting the original. Verify it lands in the right place.",
          el: "Οι καλοί χειριστές διατηρούν τα στοιχεία. Τοποθέτησε ένα αντίγραφο των σημειώσεων αναγνώρισης (notes.md) μέσα στον άδειο φάκελο 'loot', χωρίς να διαγράψεις το πρωτότυπο. Επιβεβαίωσε ότι κατέληξε στο σωστό σημείο.",
        },
        success: { en: "Notes safely copied into the loot folder.", el: "Οι σημειώσεις αντιγράφηκαν με ασφάλεια στον φάκελο loot." },
        check: (t) => t.pathExists("/home/operator/loot/notes.md") && t.pathExists("/home/operator/notes.md"),
      },
    ],
  },

  // 3 — PERMISSIONS
  {
    id: "permissions",
    order: 3,
    icon: "🔑",
    color: "from-ember-400 to-red-600",
    difficulty: 2,
    title: { en: "Permissions & Privilege", el: "Δικαιώματα & Προνόμια" },
    subtitle: { en: "Who can read, write, execute?", el: "Ποιος διαβάζει, γράφει, εκτελεί;" },
    badge: { en: "Access Controller", el: "Ελεγκτής Πρόσβασης" },
    theory: [
      {
        heading: { en: "Reading permissions", el: "Ανάγνωση δικαιωμάτων" },
        body: {
          en: "Run 'ls -l'. Each line begins like '-rwxr-xr-x'. The first char is type (- file, d dir). Then three groups of rwx: owner, group, others. r=read, w=write, x=execute. Understanding these is key to both defense and privilege escalation.",
          el: "Τρέξε 'ls -l'. Κάθε γραμμή ξεκινά όπως '-rwxr-xr-x'. Ο πρώτος χαρακτήρας είναι τύπος (- αρχείο, d φάκελος). Μετά τρεις ομάδες rwx: ιδιοκτήτης, ομάδα, άλλοι. r=ανάγνωση, w=εγγραφή, x=εκτέλεση. Η κατανόησή τους είναι κλειδί για άμυνα και ανύψωση προνομίων.",
        },
      },
      {
        heading: { en: "chmod & octal", el: "chmod & οκταδικό" },
        body: {
          en: "'chmod' changes permissions. Numbers: r=4, w=2, x=1. So 7=rwx, 6=rw-, 5=r-x. 'chmod 755 file' = owner full, others read+execute. 'chmod +x script.sh' makes a script runnable.",
          el: "Το 'chmod' αλλάζει δικαιώματα. Αριθμοί: r=4, w=2, x=1. Άρα 7=rwx, 6=rw-, 5=r-x. 'chmod 755 file' = ιδιοκτήτης πλήρη, άλλοι ανάγνωση+εκτέλεση. 'chmod +x script.sh' κάνει ένα script εκτελέσιμο.",
        },
      },
      {
        heading: { en: "sudo & root", el: "sudo & root" },
        body: {
          en: "'root' is the all-powerful admin (uid 0). 'sudo command' runs a single command as root. Misconfigured sudo rights and permissive files are the #1 way attackers escalate from a normal user to root.",
          el: "Ο 'root' είναι ο παντοδύναμος διαχειριστής (uid 0). Το 'sudo command' εκτελεί μία εντολή ως root. Λανθασμένα δικαιώματα sudo και επιτρεπτικά αρχεία είναι ο #1 τρόπος που οι επιτιθέμενοι ανεβαίνουν από απλός χρήστης σε root.",
        },
        tip: {
          en: "As a defender: never chmod 777. As an attacker: world-writable files are a gift.",
          el: "Ως αμυνόμενος: ποτέ chmod 777. Ως επιτιθέμενος: αρχεία εγγράψιμα από όλους είναι δώρο.",
        },
      },
    ],
    cheats: [
      { cmd: "ls -l", desc: { en: "view permissions", el: "προβολή δικαιωμάτων" } },
      { cmd: "chmod 755 FILE", desc: { en: "set octal perms", el: "οκταδικά δικαιώματα" } },
      { cmd: "chmod +x FILE", desc: { en: "make executable", el: "κάνε εκτελέσιμο" } },
      { cmd: "id", desc: { en: "show your uid/groups", el: "uid/ομάδες" } },
      { cmd: "sudo CMD", desc: { en: "run as root", el: "εκτέλεση ως root" } },
    ],
    tasks: [
      {
        id: "ls-l",
        instruction: { en: "View detailed permissions with ls -l.", el: "Δες αναλυτικά δικαιώματα με ls -l." },
        hint: { en: "ls -l", el: "ls -l" },
        explain: {
          en: "WHY: Permissions decide who can read/write/run a file — reading them is the first step of both defense and privilege escalation. HOW: 'ls -l' shows a column like '-rwxr-xr-x': owner, group and others' rights, plus the owner name.",
          el: "ΓΙΑΤΙ: Τα δικαιώματα ορίζουν ποιος διαβάζει/γράφει/εκτελεί ένα αρχείο — η ανάγνωσή τους είναι το πρώτο βήμα άμυνας και ανύψωσης προνομίων. ΠΩΣ: Το 'ls -l' δείχνει στήλη όπως '-rwxr-xr-x': δικαιώματα ιδιοκτήτη, ομάδας και άλλων, μαζί με το όνομα ιδιοκτήτη.",
        },
        check: (t) => t.listedLong,
      },
      {
        id: "id",
        instruction: { en: "Check your user id and groups with id.", el: "Έλεγξε το user id και τις ομάδες σου με id." },
        hint: { en: "id", el: "id" },
        explain: {
          en: "WHY: You must know who you are and which groups you belong to — group membership (like 'sudo') can grant powerful rights an attacker will abuse. HOW: 'id' prints your uid, gid and all groups. 'whoami' just prints the username.",
          el: "ΓΙΑΤΙ: Πρέπει να ξέρεις ποιος είσαι και σε ποιες ομάδες ανήκεις — η συμμετοχή σε ομάδα (π.χ. 'sudo') μπορεί να δίνει ισχυρά δικαιώματα που θα εκμεταλλευτεί ένας επιτιθέμενος. ΠΩΣ: Το 'id' τυπώνει uid, gid και όλες τις ομάδες. Το 'whoami' μόνο το όνομα χρήστη.",
        },
        check: (t) => t.ranId,
      },
      {
        id: "chmod-x",
        instruction: { en: "Make backup.sh executable (chmod +x).", el: "Κάνε το backup.sh εκτελέσιμο (chmod +x)." },
        hint: { en: "chmod +x backup.sh", el: "chmod +x backup.sh" },
        explain: {
          en: "WHY: A script can only be run if it has the execute (x) bit — this is how you turn a downloaded tool or exploit into a runnable program. HOW: 'chmod +x file' adds execute for everyone; 'chmod u+x file' only for the owner.",
          el: "ΓΙΑΤΙ: Ένα script τρέχει μόνο αν έχει το bit εκτέλεσης (x) — έτσι μετατρέπεις ένα κατεβασμένο εργαλείο ή exploit σε εκτελέσιμο πρόγραμμα. ΠΩΣ: 'chmod +x αρχείο' προσθέτει execute σε όλους· 'chmod u+x αρχείο' μόνο στον ιδιοκτήτη.",
        },
        check: (t) => {
          const p = t.pathPerms("/home/operator/backup.sh");
          return !!p && p[2] === "x"; // owner has execute
        },
      },
      {
        id: "chmod-600",
        instruction: { en: "Lock down documents/passwords.txt to owner-only (chmod 600).", el: "Κλείδωσε το documents/passwords.txt μόνο για τον ιδιοκτήτη (chmod 600)." },
        hint: { en: "chmod 600 documents/passwords.txt", el: "chmod 600 documents/passwords.txt" },
        explain: {
          en: "WHY: Sensitive files (keys, passwords) must not be readable by other users — that's a classic finding in a security audit. HOW: octal chmod uses r=4, w=2, x=1. '600' = owner rw-, group and others nothing. '755' = owner rwx, others r-x.",
          el: "ΓΙΑΤΙ: Ευαίσθητα αρχεία (κλειδιά, κωδικοί) δεν πρέπει να διαβάζονται από άλλους χρήστες — κλασικό εύρημα σε έλεγχο ασφάλειας. ΠΩΣ: το οκταδικό chmod: r=4, w=2, x=1. '600' = ιδιοκτήτης rw-, ομάδα/άλλοι τίποτα. '755' = ιδιοκτήτης rwx, άλλοι r-x.",
        },
        check: (t) => t.pathPerms("/home/operator/documents/passwords.txt") === "rw-------",
      },
      {
        id: "sudo",
        instruction: { en: "Read the protected /etc/passwd as root using sudo.", el: "Διάβασε το προστατευμένο /etc/passwd ως root με sudo." },
        hint: { en: "sudo cat /etc/passwd", el: "sudo cat /etc/passwd" },
        explain: {
          en: "WHY: Some files and actions require root (admin) rights. 'sudo' runs one command as root — misconfigured sudo rules are the #1 privilege-escalation path. HOW: prefix any command with 'sudo', e.g. 'sudo cat /etc/shadow'.",
          el: "ΓΙΑΤΙ: Ορισμένα αρχεία και ενέργειες απαιτούν δικαιώματα root (διαχειριστή). Το 'sudo' εκτελεί μία εντολή ως root — λανθασμένοι κανόνες sudo είναι ο #1 δρόμος ανύψωσης προνομίων. ΠΩΣ: βάλε 'sudo' μπροστά από εντολή, π.χ. 'sudo cat /etc/shadow'.",
        },
        check: (t) => t.sudoReadFiles.has("/etc/passwd"),
      },
    ],
    challenges: [
      {
        title: { en: "Secure the Private Key", el: "Ασφάλισε το Ιδιωτικό Κλειδί" },
        brief: {
          en: "Your SSH private key at ~/.ssh/id_rsa has insecure permissions — anyone can read it. A real key must be readable/writable ONLY by its owner (no group, no others, no execute). Fix the permissions.",
          el: "Το ιδιωτικό σου κλειδί SSH στο ~/.ssh/id_rsa έχει επισφαλή δικαιώματα — ο καθένας μπορεί να το διαβάσει. Ένα σωστό κλειδί πρέπει να διαβάζεται/γράφεται ΜΟΝΟ από τον ιδιοκτήτη (χωρίς ομάδα, άλλους, execute). Διόρθωσε τα δικαιώματα.",
        },
        success: { en: "Key locked down correctly — 600 is the golden rule.", el: "Το κλειδί κλειδώθηκε σωστά — το 600 είναι ο χρυσός κανόνας." },
        check: (t) => {
          const p = t.pathPerms("/home/operator/.ssh/id_rsa");
          return !!p && p[0] === "r" && p.slice(3) === "------";
        },
      },
      {
        title: { en: "Harden the Script", el: "Θωράκισε το Script" },
        brief: {
          en: "Your backup.sh must stay fully usable by you (read, write AND execute) but be completely off-limits to the group and everyone else. Set its permissions so only the owner has any access at all.",
          el: "Το backup.sh πρέπει να παραμείνει πλήρως χρήσιμο για σένα (ανάγνωση, εγγραφή ΚΑΙ εκτέλεση) αλλά εντελώς απαγορευμένο για την ομάδα και όλους τους άλλους. Όρισε τα δικαιώματα ώστε μόνο ο ιδιοκτήτης να έχει οποιαδήποτε πρόσβαση.",
        },
        success: { en: "Script hardened — owner-only rwx (700). No one else can touch it.", el: "Το script θωρακίστηκε — μόνο ο ιδιοκτήτης rwx (700). Κανείς άλλος δεν το αγγίζει." },
        check: (t) => t.pathPerms("/home/operator/backup.sh") === "rwx------",
      },
    ],
  },

  // 4 — NETWORKING
  {
    id: "networking",
    order: 4,
    icon: "🌐",
    color: "from-neon-cyan to-blue-600",
    difficulty: 2,
    title: { en: "Networking Basics", el: "Βασικά Δικτύων" },
    subtitle: { en: "IP addresses, ping & connections", el: "Διευθύνσεις IP, ping & συνδέσεις" },
    badge: { en: "Packet Pilot", el: "Πιλότος Πακέτων" },
    theory: [
      {
        heading: { en: "Your address (ip a)", el: "Η διεύθυνσή σου (ip a)" },
        body: {
          en: "Every device on a network has an IP address, like 10.10.10.13. Run 'ip a' (or the older 'ifconfig') to see your interfaces. 'eth0' is your wired card; the 'inet' line shows your IPv4 address and subnet (/24 = 256 addresses).",
          el: "Κάθε συσκευή σε δίκτυο έχει μια διεύθυνση IP, όπως 10.10.10.13. Τρέξε 'ip a' (ή το παλαιότερο 'ifconfig') για να δεις τις διεπαφές σου. Το 'eth0' είναι η ενσύρματη κάρτα· η γραμμή 'inet' δείχνει τη διεύθυνση IPv4 και το subnet (/24 = 256 διευθύνσεις).",
        },
      },
      {
        heading: { en: "Is it alive? (ping)", el: "Είναι ζωντανό; (ping)" },
        body: {
          en: "'ping HOST' sends small ICMP packets and measures the reply time. It answers two questions: is the host reachable, and how fast? It's the first thing you try when checking if a target exists.",
          el: "Το 'ping HOST' στέλνει μικρά πακέτα ICMP και μετρά τον χρόνο απόκρισης. Απαντά σε δύο ερωτήσεις: είναι προσβάσιμος ο υπολογιστής και πόσο γρήγορα; Είναι το πρώτο που δοκιμάζεις όταν ελέγχεις αν ένας στόχος υπάρχει.",
        },
      },
      {
        heading: { en: "Who's connected? (netstat)", el: "Ποιος είναι συνδεδεμένος; (netstat)" },
        body: {
          en: "'netstat' / 'ss' shows active connections and which ports are listening for incoming traffic. A listening port is a door into the machine — remember that for the scanning module.",
          el: "Το 'netstat' / 'ss' δείχνει ενεργές συνδέσεις και ποιες θύρες ακούν για εισερχόμενη κίνηση. Μια θύρα που ακούει είναι μια πόρτα προς το μηχάνημα — θυμήσου το για την ενότητα σάρωσης.",
        },
      },
    ],
    cheats: [
      { cmd: "ip a", desc: { en: "show IP addresses", el: "εμφάνιση διευθύνσεων IP" } },
      { cmd: "ip route", desc: { en: "show routing / gateway", el: "δρομολόγηση / gateway" } },
      { cmd: "ping HOST", desc: { en: "test reachability", el: "έλεγχος προσβασιμότητας" } },
      { cmd: "netstat / ss", desc: { en: "connections & ports", el: "συνδέσεις & θύρες" } },
      { cmd: "ifconfig", desc: { en: "legacy interface info", el: "παλαιότερη προβολή" } },
    ],
    tasks: [
      {
        id: "ip-a",
        instruction: { en: "Find your own IP address with ip a.", el: "Βρες τη δική σου διεύθυνση IP με ip a." },
        hint: { en: "ip a", el: "ip a" },
        explain: {
          en: "WHY: You must know your own IP and subnet to understand what network you're on and what you can reach. HOW: 'ip a' (short for 'ip address') lists all interfaces; look at 'eth0' and its 'inet' line, e.g. 10.10.10.13/24.",
          el: "ΓΙΑΤΙ: Πρέπει να ξέρεις τη δική σου IP και το subnet για να καταλάβεις σε ποιο δίκτυο είσαι και τι μπορείς να φτάσεις. ΠΩΣ: Το 'ip a' (συντομία του 'ip address') δείχνει όλες τις διεπαφές· δες το 'eth0' και τη γραμμή 'inet', π.χ. 10.10.10.13/24.",
        },
        check: (t) => t.ranIpAddr,
      },
      {
        id: "route",
        instruction: { en: "Find the default gateway with ip route.", el: "Βρες το προεπιλεγμένο gateway με ip route." },
        hint: { en: "ip route", el: "ip route" },
        explain: {
          en: "WHY: The default gateway is the router that connects your subnet to everything else — a key pivot point and a target worth knowing. HOW: 'ip route' (or 'ip r') prints the routing table; the 'default via X' line is your gateway.",
          el: "ΓΙΑΤΙ: Το προεπιλεγμένο gateway είναι ο router που συνδέει το subnet σου με τα υπόλοιπα — σημαντικό σημείο pivot και στόχος που αξίζει να ξέρεις. ΠΩΣ: Το 'ip route' (ή 'ip r') τυπώνει τον πίνακα δρομολόγησης· η γραμμή 'default via X' είναι το gateway σου.",
        },
        check: (t) => t.ranIpRoute,
      },
      {
        id: "ping-gw",
        instruction: { en: "Ping the gateway 10.10.10.1 to confirm it's alive.", el: "Κάνε ping στο gateway 10.10.10.1 για επιβεβαίωση." },
        hint: { en: "ping 10.10.10.1", el: "ping 10.10.10.1" },
        explain: {
          en: "WHY: 'ping' proves whether a host is up and reachable before you waste time attacking it. HOW: 'ping HOST' sends ICMP echo packets; replies mean it's alive. Add '-c 4' to send just 4 packets and stop.",
          el: "ΓΙΑΤΙ: Το 'ping' αποδεικνύει αν ένας host είναι ζωντανός και προσβάσιμος πριν χάσεις χρόνο επιτιθέμενος. ΠΩΣ: 'ping HOST' στέλνει πακέτα ICMP echo· οι απαντήσεις σημαίνουν ότι είναι ζωντανός. Πρόσθεσε '-c 4' για μόνο 4 πακέτα.",
        },
        check: (t) => t.pinged.has("10.10.10.1"),
      },
      {
        id: "ping-target",
        instruction: { en: "Ping the target 10.10.10.5.", el: "Κάνε ping στον στόχο 10.10.10.5." },
        hint: { en: "ping 10.10.10.5", el: "ping 10.10.10.5" },
        explain: {
          en: "WHY: Confirming the actual target box is reachable is your go/no-go check before enumeration. HOW: 'ping 10.10.10.5'. If it replies, move on to scanning its ports; if not, check routing or that the host filters ICMP.",
          el: "ΓΙΑΤΙ: Η επιβεβαίωση ότι ο πραγματικός στόχος είναι προσβάσιμος είναι ο έλεγχος go/no-go πριν την απαρίθμηση. ΠΩΣ: 'ping 10.10.10.5'. Αν απαντά, πέρνα σε σάρωση θυρών· αν όχι, έλεγξε δρομολόγηση ή αν ο host φιλτράρει ICMP.",
        },
        check: (t) => t.pinged.has("10.10.10.5"),
      },
      {
        id: "netstat",
        instruction: { en: "List listening ports on your machine (netstat or ss).", el: "Δες τις θύρες που ακούν στο μηχάνημά σου (netstat ή ss)." },
        hint: { en: "netstat -tlnp   (or just: ss)", el: "netstat -tlnp   (ή απλά: ss)" },
        explain: {
          en: "WHY: Listening ports are open doors into a machine — knowing which services listen locally reveals attack surface and running software. HOW: 'netstat -tlnp' or the modern 'ss -tlnp' list TCP (t) listening (l) sockets with numbers (n) and the program (p).",
          el: "ΓΙΑΤΙ: Οι θύρες που ακούν είναι ανοιχτές πόρτες σε ένα μηχάνημα — γνωρίζοντας ποιες υπηρεσίες ακούν τοπικά αποκαλύπτεις επιφάνεια επίθεσης και λογισμικό. ΠΩΣ: 'netstat -tlnp' ή το σύγχρονο 'ss -tlnp' δείχνουν TCP (t) sockets που ακούν (l) με αριθμούς (n) και το πρόγραμμα (p).",
        },
        check: (t) => t.ranNetstat,
      },
    ],
    challenges: [
      {
        title: { en: "Reach the Hidden Web Server", el: "Φτάσε στον Κρυφό Web Server" },
        brief: {
          en: "There is a web server on the lab network named web.hackforge.lab. First resolve its name to an IP, then prove it is alive by pinging that address directly.",
          el: "Υπάρχει ένας web server με όνομα web.hackforge.lab. Πρώτα ανάλυσε το όνομά του σε IP, μετά απόδειξε ότι είναι ζωντανός κάνοντας ping σε αυτή τη διεύθυνση.",
        },
        success: { en: "Host located and confirmed alive. Recon complete.", el: "Ο host εντοπίστηκε και επιβεβαιώθηκε ζωντανός. Recon ολοκληρώθηκε." },
        check: (t) => t.pinged.has("10.10.10.7"),
      },
      {
        title: { en: "Know Your Toolbox", el: "Γνώρισε την Εργαλειοθήκη σου" },
        brief: {
          en: "Real boxes vary — sometimes only the legacy tools exist, sometimes only the modern ones. Prove you can switch: inspect your interfaces with the OLD-school interface tool AND list listening sockets with the MODERN socket tool.",
          el: "Τα πραγματικά μηχανήματα διαφέρουν — άλλοτε υπάρχουν μόνο τα παλιά εργαλεία, άλλοτε μόνο τα σύγχρονα. Απόδειξε ότι εναλλάσσεσαι: εξέτασε τις διεπαφές με το ΠΑΛΙΟ εργαλείο διεπαφών ΚΑΙ δες τα sockets που ακούν με το ΣΥΓΧΡΟΝΟ εργαλείο socket.",
        },
        success: { en: "You handled both the legacy and modern tooling. Versatile.", el: "Χειρίστηκες και τα παλιά και τα σύγχρονα εργαλεία. Ευέλικτος." },
        check: (t) => t.ranIfconfig && t.ranNetstat,
      },
    ],
  },

  // 5 — RECON / DNS
  {
    id: "recon",
    order: 5,
    icon: "🛰️",
    color: "from-neon-green to-emerald-600",
    difficulty: 3,
    title: { en: "Reconnaissance & DNS", el: "Αναγνώριση & DNS" },
    subtitle: { en: "Turn names into targets", el: "Μετέτρεψε ονόματα σε στόχους" },
    badge: { en: "Recon Scout", el: "Ανιχνευτής" },
    theory: [
      {
        heading: { en: "Recon: the first phase", el: "Recon: η πρώτη φάση" },
        body: {
          en: "Every real engagement starts with reconnaissance — gathering information before touching anything. The more you know (hostnames, IPs, technologies, emails), the more precise and quiet your attack. Passive recon uses public data; active recon interacts with the target.",
          el: "Κάθε πραγματική δοκιμή ξεκινά με αναγνώριση — συλλογή πληροφοριών πριν αγγίξεις οτιδήποτε. Όσο περισσότερα ξέρεις (hostnames, IP, τεχνολογίες, emails), τόσο πιο ακριβής και αθόρυβη είναι η επίθεση. Η παθητική αναγνώριση χρησιμοποιεί δημόσια δεδομένα· η ενεργητική αλληλεπιδρά με τον στόχο.",
        },
      },
      {
        heading: { en: "DNS: the phone book", el: "DNS: ο τηλεφωνικός κατάλογος" },
        body: {
          en: "DNS turns human names (target.hackforge.lab) into IP addresses. 'nslookup' and 'dig' query DNS. 'whois' returns registration details about a domain. These reveal infrastructure without ever touching the target directly.",
          el: "Το DNS μετατρέπει ανθρώπινα ονόματα (target.hackforge.lab) σε διευθύνσεις IP. Τα 'nslookup' και 'dig' ρωτούν το DNS. Το 'whois' επιστρέφει στοιχεία καταχώρησης ενός domain. Αυτά αποκαλύπτουν υποδομή χωρίς άμεση επαφή με τον στόχο.",
        },
        tip: {
          en: "Discover live hosts by scanning a whole subnet: nmap 10.10.10.0/24",
          el: "Ανακάλυψε ζωντανούς hosts σαρώνοντας ολόκληρο subnet: nmap 10.10.10.0/24",
        },
      },
    ],
    cheats: [
      { cmd: "nslookup HOST", desc: { en: "resolve name to IP", el: "όνομα σε IP" } },
      { cmd: "dig HOST", desc: { en: "detailed DNS query", el: "αναλυτικό DNS" } },
      { cmd: "whois DOMAIN", desc: { en: "registration info", el: "στοιχεία καταχώρησης" } },
      { cmd: "nmap 10.10.10.0/24", desc: { en: "discover live hosts", el: "εύρεση ζωντανών hosts" } },
    ],
    tasks: [
      {
        id: "nslookup",
        instruction: { en: "Resolve target.hackforge.lab to an IP with nslookup.", el: "Ανάλυσε το target.hackforge.lab σε IP με nslookup." },
        hint: { en: "nslookup target.hackforge.lab", el: "nslookup target.hackforge.lab" },
        explain: {
          en: "WHY: You attack IP addresses, not names — DNS lookups turn a hostname into the IP you'll target, and can reveal extra infrastructure. HOW: 'nslookup HOST' queries DNS and prints the resolved 'Address'. 'host' and 'dig' do the same.",
          el: "ΓΙΑΤΙ: Επιτίθεσαι σε διευθύνσεις IP, όχι σε ονόματα — οι αναζητήσεις DNS μετατρέπουν ένα hostname στην IP που θα στοχεύσεις και αποκαλύπτουν επιπλέον υποδομή. ΠΩΣ: 'nslookup HOST' ρωτά το DNS και τυπώνει το 'Address'. Τα 'host' και 'dig' κάνουν το ίδιο.",
        },
        check: (t) => t.resolved.has("target.hackforge.lab"),
      },
      {
        id: "dig",
        instruction: { en: "Query DNS with dig for web.hackforge.lab.", el: "Ρώτησε το DNS με dig για web.hackforge.lab." },
        hint: { en: "dig web.hackforge.lab", el: "dig web.hackforge.lab" },
        explain: {
          en: "WHY: 'dig' is the pro's DNS tool — cleaner, scriptable output and support for specific record types (A, MX, TXT, NS) that map out an organisation. HOW: 'dig HOST' shows the ANSWER section; 'dig HOST MX' queries mail records.",
          el: "ΓΙΑΤΙ: Το 'dig' είναι το επαγγελματικό εργαλείο DNS — καθαρή, scriptable έξοδος και υποστήριξη συγκεκριμένων εγγραφών (A, MX, TXT, NS) που χαρτογραφούν έναν οργανισμό. ΠΩΣ: 'dig HOST' δείχνει το ANSWER section· 'dig HOST MX' ρωτά εγγραφές mail.",
        },
        check: (t) => t.resolved.has("web.hackforge.lab"),
      },
      {
        id: "whois",
        instruction: { en: "Get registration info with whois hackforge.lab.", el: "Πάρε στοιχεία καταχώρησης με whois hackforge.lab." },
        hint: { en: "whois hackforge.lab", el: "whois hackforge.lab" },
        explain: {
          en: "WHY: 'whois' is passive recon — it returns registration data (registrar, dates, name servers, sometimes contacts) without ever touching the target, so it's stealthy. HOW: 'whois domain.com'. Great for OSINT before any active scan.",
          el: "ΓΙΑΤΙ: Το 'whois' είναι παθητική αναγνώριση — επιστρέφει στοιχεία καταχώρησης (registrar, ημερομηνίες, name servers, ενίοτε επαφές) χωρίς καμία επαφή με τον στόχο, οπότε είναι διακριτικό. ΠΩΣ: 'whois domain.com'. Ιδανικό για OSINT πριν κάθε ενεργή σάρωση.",
        },
        check: (t) => t.whoisDone,
      },
      {
        id: "subnet",
        instruction: { en: "Discover live hosts by scanning the subnet 10.10.10.0/24.", el: "Ανακάλυψε ζωντανούς hosts σαρώνοντας το subnet 10.10.10.0/24." },
        hint: { en: "nmap 10.10.10.0/24", el: "nmap 10.10.10.0/24" },
        explain: {
          en: "WHY: Before targeting one box you map the whole network to see every live host — this 'host discovery' sweep builds your list of targets. HOW: 'nmap 10.10.10.0/24' scans all 256 addresses in that subnet; '/24' means the first 24 bits are the network.",
          el: "ΓΙΑΤΙ: Πριν στοχεύσεις ένα μηχάνημα, χαρτογραφείς όλο το δίκτυο για να δεις κάθε ζωντανό host — αυτή η σάρωση 'host discovery' χτίζει τη λίστα στόχων. ΠΩΣ: 'nmap 10.10.10.0/24' σαρώνει και τις 256 διευθύνσεις του subnet· το '/24' σημαίνει ότι τα πρώτα 24 bits είναι το δίκτυο.",
        },
        check: (t) => t.nmapSubnet,
      },
    ],
    challenges: [
      {
        title: { en: "Map the Network, Fingerprint MySQL", el: "Χαρτογράφησε το Δίκτυο, Ταυτοποίησε τη MySQL" },
        brief: {
          en: "Full reconnaissance: sweep the entire 10.10.10.0/24 subnet for every live host, then run a service/version scan against the host running the MySQL database. Figure out which host that is on your own.",
          el: "Πλήρης αναγνώριση: σάρωσε όλο το subnet 10.10.10.0/24 για κάθε ζωντανό host, μετά τρέξε σάρωση εκδόσεων στον host που τρέχει τη MySQL. Βρες μόνος σου ποιος είναι.",
        },
        success: { en: "Network mapped and MySQL host fingerprinted. Sharp work.", el: "Το δίκτυο χαρτογραφήθηκε και ο host της MySQL ταυτοποιήθηκε. Καλή δουλειά." },
        check: (t) => t.nmapSubnet && t.nmapVersionScans.has("10.10.10.5"),
      },
      {
        title: { en: "Full DNS Picture", el: "Πλήρης Εικόνα DNS" },
        brief: {
          en: "Infrastructure hides behind names. Using DNS tools, resolve EVERY lab hostname to its address — the gateway, the target box, and the web server — so you have the complete map before you strike.",
          el: "Η υποδομή κρύβεται πίσω από ονόματα. Με εργαλεία DNS, ανάλυσε ΚΑΘΕ hostname του εργαστηρίου στη διεύθυνσή του — το gateway, τον στόχο και τον web server — ώστε να έχεις τον πλήρη χάρτη πριν χτυπήσεις.",
        },
        success: { en: "All three hosts resolved. The infrastructure is laid bare.", el: "Και οι τρεις hosts αναλύθηκαν. Η υποδομή αποκαλύφθηκε." },
        check: (t) => t.resolved.has("10.10.10.1") && t.resolved.has("10.10.10.5") && t.resolved.has("10.10.10.7"),
      },
    ],
  },

  // 6 — PORT SCANNING
  {
    id: "scanning",
    order: 6,
    icon: "📡",
    color: "from-violet-500 to-indigo-600",
    difficulty: 3,
    title: { en: "Port Scanning (nmap)", el: "Σάρωση Θυρών (nmap)" },
    subtitle: { en: "Find open doors and services", el: "Βρες ανοιχτές πόρτες και υπηρεσίες" },
    badge: { en: "Port Mapper", el: "Χαρτογράφος Θυρών" },
    theory: [
      {
        heading: { en: "Ports & services", el: "Θύρες & υπηρεσίες" },
        body: {
          en: "A server offers services on numbered ports: 22=SSH, 80=HTTP, 443=HTTPS, 3306=MySQL. Each open port is a potential way in. Mapping which ports are open — and what software answers — is the core of enumeration.",
          el: "Ένας server προσφέρει υπηρεσίες σε αριθμημένες θύρες: 22=SSH, 80=HTTP, 443=HTTPS, 3306=MySQL. Κάθε ανοιχτή θύρα είναι πιθανή είσοδος. Η χαρτογράφηση των ανοιχτών θυρών — και του λογισμικού που απαντά — είναι ο πυρήνας της απαρίθμησης.",
        },
      },
      {
        heading: { en: "nmap essentials", el: "Βασικά του nmap" },
        body: {
          en: "'nmap HOST' scans common ports. Add '-sV' to detect service versions (crucial — old versions have known exploits). '-p 22,80' scans specific ports, '-p-' scans all 65535. Versions guide your next move.",
          el: "Το 'nmap HOST' σαρώνει κοινές θύρες. Πρόσθεσε '-sV' για ανίχνευση εκδόσεων υπηρεσιών (κρίσιμο — παλιές εκδόσεις έχουν γνωστά exploits). Το '-p 22,80' σαρώνει συγκεκριμένες θύρες, το '-p-' και τις 65535. Οι εκδόσεις καθοδηγούν την επόμενη κίνηση.",
        },
        tip: {
          en: "Version detection (-sV) turns 'a port is open' into 'Apache 2.4.52 is running here' — that's a lead.",
          el: "Η ανίχνευση έκδοσης (-sV) μετατρέπει το «η θύρα είναι ανοιχτή» σε «εδώ τρέχει Apache 2.4.52» — αυτό είναι στοιχείο.",
        },
      },
    ],
    cheats: [
      { cmd: "nmap HOST", desc: { en: "scan common ports", el: "σάρωση κοινών θυρών" } },
      { cmd: "nmap -sV HOST", desc: { en: "detect versions", el: "ανίχνευση εκδόσεων" } },
      { cmd: "nmap -p 22,80 HOST", desc: { en: "specific ports", el: "συγκεκριμένες θύρες" } },
      { cmd: "nmap -p- HOST", desc: { en: "all 65535 ports", el: "όλες οι θύρες" } },
    ],
    tasks: [
      {
        id: "scan",
        instruction: { en: "Scan the target 10.10.10.5 for open ports.", el: "Σάρωσε τον στόχο 10.10.10.5 για ανοιχτές θύρες." },
        hint: { en: "nmap 10.10.10.5", el: "nmap 10.10.10.5" },
        explain: {
          en: "WHY: A port scan lists which services a host exposes — each open port is a potential entry point. HOW: 'nmap HOST' checks the ~1000 most common ports and prints their state (open/closed/filtered) and service name.",
          el: "ΓΙΑΤΙ: Μια σάρωση θυρών δείχνει ποιες υπηρεσίες εκθέτει ένας host — κάθε ανοιχτή θύρα είναι πιθανό σημείο εισόδου. ΠΩΣ: 'nmap HOST' ελέγχει τις ~1000 πιο κοινές θύρες και τυπώνει την κατάστασή τους (open/closed/filtered) και το όνομα υπηρεσίας.",
        },
        check: (t) => t.nmapPortScans.has("10.10.10.5"),
      },
      {
        id: "versions",
        instruction: { en: "Detect service versions on the target with -sV.", el: "Ανίχνευσε εκδόσεις υπηρεσιών στον στόχο με -sV." },
        hint: { en: "nmap -sV 10.10.10.5", el: "nmap -sV 10.10.10.5" },
        explain: {
          en: "WHY: Knowing the exact software version (e.g. 'OpenSSH 8.9', 'Apache 2.4.52') lets you look up known vulnerabilities and pick an exploit. HOW: '-sV' enables version detection; nmap probes each open port to fingerprint the service and version.",
          el: "ΓΙΑΤΙ: Γνωρίζοντας την ακριβή έκδοση λογισμικού (π.χ. 'OpenSSH 8.9', 'Apache 2.4.52') μπορείς να ψάξεις γνωστά ευπάθειες και να επιλέξεις exploit. ΠΩΣ: το '-sV' ενεργοποιεί ανίχνευση έκδοσης· το nmap εξετάζει κάθε ανοιχτή θύρα για να ταυτοποιήσει υπηρεσία και έκδοση.",
        },
        check: (t) => t.nmapVersionScans.has("10.10.10.5"),
      },
      {
        id: "specific",
        instruction: { en: "Scan only ports 22 and 3306 on the target.", el: "Σάρωσε μόνο τις θύρες 22 και 3306 στον στόχο." },
        hint: { en: "nmap -p 22,3306 10.10.10.5", el: "nmap -p 22,3306 10.10.10.5" },
        explain: {
          en: "WHY: Scanning only the ports you care about is faster and quieter than a full scan — useful when you already know which services matter. HOW: '-p 22,3306' scans a list; '-p 1-1000' a range; '-p-' all 65535 ports.",
          el: "ΓΙΑΤΙ: Η σάρωση μόνο των θυρών που σε ενδιαφέρουν είναι πιο γρήγορη και διακριτική από πλήρη σάρωση — χρήσιμο όταν ήδη ξέρεις ποιες υπηρεσίες μετρούν. ΠΩΣ: '-p 22,3306' σαρώνει λίστα· '-p 1-1000' εύρος· '-p-' και τις 65535 θύρες.",
        },
        check: (t) => t.nmapSpecificPorts.has("10.10.10.5:22") && t.nmapSpecificPorts.has("10.10.10.5:3306"),
      },
    ],
    challenges: [
      {
        title: { en: "Find the HTTPS Host", el: "Βρες τον HTTPS Host" },
        brief: {
          en: "Exactly one machine on the network exposes HTTPS on port 443. Discover which host it is, then run a version-detection scan of its ports to confirm the finding.",
          el: "Ακριβώς ένα μηχάνημα εκθέτει HTTPS στη θύρα 443. Ανακάλυψε ποιος host είναι, μετά κάνε σάρωση ανίχνευσης εκδόσεων στις θύρες του για επιβεβαίωση.",
        },
        success: { en: "HTTPS host pinned down. Enumeration mastered.", el: "Ο HTTPS host εντοπίστηκε. Κατέκτησες την απαρίθμηση." },
        check: (t) => t.nmapVersionScans.has("10.10.10.7"),
      },
      {
        title: { en: "Leave No Port Unseen", el: "Μην Αφήσεις Θύρα Αόρατη" },
        brief: {
          en: "The default scan only checks the ~1000 most common ports — services often hide on unusual ones. Perform an exhaustive scan of ALL 65535 ports on the target box (10.10.10.5).",
          el: "Η προεπιλεγμένη σάρωση ελέγχει μόνο τις ~1000 πιο κοινές θύρες — οι υπηρεσίες συχνά κρύβονται σε ασυνήθιστες. Κάνε εξαντλητική σάρωση ΟΛΩΝ των 65535 θυρών στον στόχο (10.10.10.5).",
        },
        success: { en: "Full 65535-port sweep complete. Nothing hides from you.", el: "Πλήρης σάρωση 65535 θυρών ολοκληρώθηκε. Τίποτα δεν σου κρύβεται." },
        check: (t) => t.nmapFullScan.has("10.10.10.5"),
      },
    ],
  },

  // 7 — BRUTEFORCE
  {
    id: "bruteforce",
    order: 7,
    icon: "🔨",
    color: "from-rose-500 to-red-700",
    difficulty: 4,
    title: { en: "Password Attacks", el: "Επιθέσεις Κωδικών" },
    subtitle: { en: "Brute-force with hydra", el: "Brute-force με hydra" },
    badge: { en: "Lock Breaker", el: "Σπαστής Κλειδαριών" },
    theory: [
      {
        heading: { en: "Why passwords fall", el: "Γιατί πέφτουν οι κωδικοί" },
        body: {
          en: "Weak, reused and default passwords are the most common way into systems. A brute-force attack tries many passwords automatically; a dictionary attack tries a curated wordlist (like the famous 'rockyou.txt'). Speed and a good list are everything.",
          el: "Αδύναμοι, επαναχρησιμοποιημένοι και προεπιλεγμένοι κωδικοί είναι ο πιο συνηθισμένος τρόπος εισόδου. Μια επίθεση brute-force δοκιμάζει πολλούς κωδικούς αυτόματα· μια επίθεση λεξικού δοκιμάζει μια επιλεγμένη λίστα (όπως το γνωστό 'rockyou.txt'). Η ταχύτητα και μια καλή λίστα είναι το παν.",
        },
      },
      {
        heading: { en: "Hydra", el: "Hydra" },
        body: {
          en: "'hydra' brute-forces logins across many protocols. Pattern: hydra -l USER -P WORDLIST service://HOST. -l is a single login, -L a list of logins, -P a password list. In this module you found SSH open on 10.10.10.5 — attack it.",
          el: "Το 'hydra' κάνει brute-force σε logins πολλών πρωτοκόλλων. Μοτίβο: hydra -l USER -P WORDLIST service://HOST. Το -l είναι ένα login, το -L λίστα logins, το -P λίστα κωδικών. Σε αυτή την ενότητα βρήκες SSH ανοιχτό στο 10.10.10.5 — επιτέθηκε.",
        },
        tip: {
          en: "Defense: rate-limiting, account lockouts, MFA and strong unique passwords defeat brute-force.",
          el: "Άμυνα: rate-limiting, κλείδωμα λογαριασμού, MFA και ισχυροί μοναδικοί κωδικοί νικούν το brute-force.",
        },
      },
    ],
    cheats: [
      { cmd: "hydra -l USER -P LIST ssh://HOST", desc: { en: "brute SSH login", el: "brute σε SSH" } },
      { cmd: "-l / -L", desc: { en: "single / list of users", el: "ένας / λίστα χρηστών" } },
      { cmd: "-P rockyou.txt", desc: { en: "password wordlist", el: "λίστα κωδικών" } },
      { cmd: "ssh user@host", desc: { en: "log in with creds", el: "σύνδεση με creds" } },
    ],
    tasks: [
      {
        id: "hydra",
        instruction: { en: "Brute-force the SSH login for user 'admin' on 10.10.10.5 with a wordlist.", el: "Κάνε brute-force στο SSH για τον χρήστη 'admin' στο 10.10.10.5 με λίστα." },
        hint: { en: "hydra -l admin -P rockyou.txt ssh://10.10.10.5", el: "hydra -l admin -P rockyou.txt ssh://10.10.10.5" },
        explain: {
          en: "WHY: Weak or reused passwords are the most common way in — hydra automates thousands of login attempts against a service. HOW: 'hydra -l USER -P WORDLIST service://HOST'. '-l' one user, '-L' a user list, '-P' a password list (e.g. rockyou.txt).",
          el: "ΓΙΑΤΙ: Αδύναμοι ή επαναχρησιμοποιημένοι κωδικοί είναι ο πιο κοινός τρόπος εισόδου — το hydra αυτοματοποιεί χιλιάδες προσπάθειες login σε μια υπηρεσία. ΠΩΣ: 'hydra -l USER -P WORDLIST service://HOST'. '-l' ένας χρήστης, '-L' λίστα χρηστών, '-P' λίστα κωδικών (π.χ. rockyou.txt).",
        },
        check: (t) => t.bruteforced.has("ssh"),
      },
      {
        id: "ssh",
        instruction: { en: "Use the recovered credentials to SSH into the box (admin@10.10.10.5).", el: "Χρησιμοποίησε τα διαπιστευτήρια για SSH στο μηχάνημα (admin@10.10.10.5)." },
        hint: { en: "ssh admin@10.10.10.5", el: "ssh admin@10.10.10.5" },
        explain: {
          en: "WHY: Once you have valid credentials, SSH gives you an interactive shell on the remote machine — that's your foothold. HOW: 'ssh user@host', then enter the password. You land in the remote shell and can run commands there.",
          el: "ΓΙΑΤΙ: Μόλις έχεις έγκυρα διαπιστευτήρια, το SSH σου δίνει διαδραστικό shell στο απομακρυσμένο μηχάνημα — αυτό είναι το πάτημά σου. ΠΩΣ: 'ssh user@host' και μετά ο κωδικός. Βρίσκεσαι στο απομακρυσμένο shell και εκτελείς εντολές εκεί.",
        },
        check: (t) => t.sshTargets.has("10.10.10.5"),
      },
    ],
    challenges: [
      {
        title: { en: "Crack the Database Login", el: "Σπάσε το Login της Βάσης" },
        brief: {
          en: "SSH wasn't the only weak door. The MySQL service on the target also accepts a weak password. Brute-force the MySQL login for user 'root' on 10.10.10.5 using a wordlist.",
          el: "Το SSH δεν ήταν η μόνη αδύναμη πόρτα. Η MySQL στον στόχο δέχεται κι αυτή αδύναμο κωδικό. Κάνε brute-force στο login της MySQL για τον 'root' στο 10.10.10.5 με wordlist.",
        },
        success: { en: "Database credentials cracked. The vault is open.", el: "Τα διαπιστευτήρια της βάσης έσπασαν. Το θησαυροφυλάκιο άνοιξε." },
        check: (t) => t.bruteforced.has("mysql"),
      },
      {
        title: { en: "Try Another Door", el: "Δοκίμασε Άλλη Πόρτα" },
        brief: {
          en: "Credentials and weak passwords get reused across services. Launch a brute-force attack against a DIFFERENT protocol on the target — the file-transfer service (FTP).",
          el: "Διαπιστευτήρια και αδύναμοι κωδικοί επαναχρησιμοποιούνται σε υπηρεσίες. Εξαπόλυσε brute-force σε ΔΙΑΦΟΡΕΤΙΚΟ πρωτόκολλο στον στόχο — την υπηρεσία μεταφοράς αρχείων (FTP).",
        },
        success: { en: "FTP hammered too — you attack every exposed service, not just one.", el: "Και το FTP χτυπήθηκε — επιτίθεσαι σε κάθε εκτεθειμένη υπηρεσία, όχι μόνο μία." },
        check: (t) => t.bruteforced.has("ftp"),
      },
    ],
  },

  // 8 — SQL INJECTION
  {
    id: "sqli",
    order: 8,
    icon: "💉",
    color: "from-fuchsia-500 to-purple-700",
    difficulty: 4,
    title: { en: "Web & SQL Injection", el: "Web & SQL Injection" },
    subtitle: { en: "Break a login, dump a database", el: "Σπάσε ένα login, άδειασε μια βάση" },
    badge: { en: "Query Bender", el: "Δαμαστής Ερωτημάτων" },
    theory: [
      {
        heading: { en: "How SQL injection works", el: "Πώς λειτουργεί το SQL injection" },
        body: {
          en: "Web apps build database queries from user input. If input isn't sanitised, an attacker can inject SQL. A login query like SELECT * FROM users WHERE user='X' AND pass='Y' becomes bypassable with a payload like ' OR '1'='1 — which is always true, logging you in without a password.",
          el: "Οι web εφαρμογές φτιάχνουν ερωτήματα βάσης από είσοδο χρήστη. Αν η είσοδος δεν καθαριστεί, ο επιτιθέμενος μπορεί να εισάγει SQL. Ένα login SELECT * FROM users WHERE user='X' AND pass='Y' γίνεται παρακάμψιμο με payload όπως ' OR '1'='1 — που είναι πάντα αληθές, συνδέοντάς σε χωρίς κωδικό.",
        },
      },
      {
        heading: { en: "Manual vs automated", el: "Χειροκίνητα vs αυτόματα" },
        body: {
          en: "You can test manually with 'curl', sending the payload to the login endpoint. For deep exploitation, 'sqlmap' automates detection and can dump entire databases. First recon with curl, then unleash sqlmap on the vulnerable parameter.",
          el: "Μπορείς να δοκιμάσεις χειροκίνητα με 'curl', στέλνοντας το payload στο login endpoint. Για βαθιά εκμετάλλευση, το 'sqlmap' αυτοματοποιεί την ανίχνευση και μπορεί να αδειάσει ολόκληρες βάσεις. Πρώτα recon με curl, μετά εξαπόλυσε το sqlmap στην ευάλωτη παράμετρο.",
        },
        tip: {
          en: "Defense: use parameterised queries / prepared statements. Never build SQL by string concatenation.",
          el: "Άμυνα: χρησιμοποίησε parameterised queries / prepared statements. Ποτέ μη φτιάχνεις SQL με ένωση strings.",
        },
      },
    ],
    cheats: [
      { cmd: "curl URL", desc: { en: "fetch a web page", el: "λήψη ιστοσελίδας" } },
      { cmd: "curl --data \"user=' OR '1'='1\"", desc: { en: "send injection payload", el: "αποστολή payload" } },
      { cmd: "sqlmap -u \"URL?id=1\"", desc: { en: "automated SQLi", el: "αυτόματο SQLi" } },
      { cmd: "sqlmap --dbs", desc: { en: "enumerate databases", el: "απαρίθμηση βάσεων" } },
    ],
    tasks: [
      {
        id: "curl",
        instruction: { en: "Fetch the web app login page: curl http://10.10.10.5/", el: "Κατέβασε τη σελίδα login: curl http://10.10.10.5/" },
        hint: { en: "curl http://10.10.10.5/", el: "curl http://10.10.10.5/" },
        explain: {
          en: "WHY: 'curl' fetches web pages from the command line so you can inspect HTML, headers, forms and API responses — the starting point for any web attack. HOW: 'curl URL' prints the response. Add '-i' to see headers, '-X POST' for a method.",
          el: "ΓΙΑΤΙ: Το 'curl' κατεβάζει ιστοσελίδες από τη γραμμή εντολών ώστε να εξετάσεις HTML, headers, φόρμες και API responses — το σημείο εκκίνησης κάθε web επίθεσης. ΠΩΣ: 'curl URL' τυπώνει την απάντηση. Πρόσθεσε '-i' για headers, '-X POST' για μέθοδο.",
        },
        check: (t) => t.curled.has("10.10.10.5"),
      },
      {
        id: "bypass",
        instruction: { en: "Bypass the login with a classic injection payload ' OR '1'='1 via curl.", el: "Παράκαμψε το login με το κλασικό payload ' OR '1'='1 μέσω curl." },
        hint: { en: `curl http://10.10.10.5/login --data "user=' OR '1'='1"`, el: `curl http://10.10.10.5/login --data "user=' OR '1'='1"` },
        explain: {
          en: "WHY: If a login builds its SQL from your input without sanitising it, the payload ' OR '1'='1 makes the WHERE clause always true — logging you in with no password. This is authentication bypass. HOW: send the payload in the form field via 'curl --data'.",
          el: "ΓΙΑΤΙ: Αν ένα login φτιάχνει το SQL από την είσοδό σου χωρίς καθαρισμό, το payload ' OR '1'='1 κάνει τη συνθήκη WHERE πάντα αληθή — σε συνδέει χωρίς κωδικό. Αυτό είναι παράκαμψη ταυτοποίησης. ΠΩΣ: στείλε το payload στο πεδίο φόρμας με 'curl --data'.",
        },
        check: (t) => t.capturedFlags.has("flag{sql_injection_authentication_bypass}"),
      },
    ],
    challenges: [
      {
        title: { en: "Detect the Injection", el: "Εντόπισε το Injection" },
        brief: {
          en: "Manual injection got you in — now go deeper. Use an automated SQL injection tool against a vulnerable URL parameter (for example an 'id' parameter) to confirm the flaw and enumerate the databases behind the web app.",
          el: "Το χειροκίνητο injection σε έβαλε μέσα — τώρα πήγαινε βαθύτερα. Χρησιμοποίησε αυτοματοποιημένο εργαλείο SQL injection σε ευάλωτη παράμετρο URL (π.χ. 'id') για να επιβεβαιώσεις το κενό και να απαριθμήσεις τις βάσεις.",
        },
        success: { en: "Injection confirmed — the databases are enumerated.", el: "Το injection επιβεβαιώθηκε — οι βάσεις απαριθμήθηκαν." },
        check: (t) => t.sqlmapRun,
      },
      {
        title: { en: "Exfiltrate the Data", el: "Εξαγωγή των Δεδομένων" },
        brief: {
          en: "Detecting the flaw isn't the finish line — extracting data is. Make the automated tool actually DUMP the contents of a vulnerable table so you walk away with real records (usernames and passwords).",
          el: "Η ανίχνευση του κενού δεν είναι ο τερματισμός — η εξαγωγή δεδομένων είναι. Κάνε το αυτοματοποιημένο εργαλείο να ΑΔΕΙΑΣΕΙ (dump) τα περιεχόμενα ενός ευάλωτου πίνακα ώστε να φύγεις με πραγματικές εγγραφές (ονόματα χρηστών και κωδικούς).",
        },
        success: { en: "Table dumped — real credentials extracted. That's impact.", el: "Ο πίνακας αδειάστηκε — πραγματικά διαπιστευτήρια εξήχθησαν. Αυτό είναι αντίκτυπος." },
        check: (t) => t.sqlmapDumped,
      },
    ],
  },

  // 9 — PRIV ESC / WRAP UP
  {
    id: "privesc",
    order: 9,
    icon: "👑",
    color: "from-amber-400 to-yellow-600",
    difficulty: 5,
    title: { en: "Privilege Escalation", el: "Ανύψωση Προνομίων" },
    subtitle: { en: "From user to root — the finale", el: "Από χρήστης σε root — το φινάλε" },
    badge: { en: "Root Forged", el: "Σφυρηλατημένος Root" },
    theory: [
      {
        heading: { en: "The goal: root", el: "Ο στόχος: root" },
        body: {
          en: "After landing on a machine as a limited user, the final step is privilege escalation — becoming root. Attackers hunt for misconfigurations: files you can write, SUID binaries, and especially sudo rights that let you run commands as root.",
          el: "Αφού μπεις σε ένα μηχάνημα ως περιορισμένος χρήστης, το τελικό βήμα είναι η ανύψωση προνομίων — να γίνεις root. Οι επιτιθέμενοι ψάχνουν λανθασμένες ρυθμίσεις: εγγράψιμα αρχεία, SUID binaries, και ειδικά δικαιώματα sudo που σου επιτρέπουν εντολές ως root.",
        },
      },
      {
        heading: { en: "Enumerate, then escalate", el: "Απαρίθμησε, μετά ανέβα" },
        body: {
          en: "Check 'id' and 'sudo -l' to see your rights. If you can run a shell as root, take it. Once root, you own the box: read any file, plant persistence, capture the final flag. Then document everything for the client — that report is the real product of ethical hacking.",
          el: "Έλεγξε 'id' και 'sudo -l' για τα δικαιώματά σου. Αν μπορείς να τρέξεις shell ως root, πάρ' το. Ως root κατέχεις το μηχάνημα: διαβάζεις κάθε αρχείο, στήνεις persistence, παίρνεις το τελικό flag. Μετά τεκμηρίωσε τα πάντα για τον πελάτη — αυτή η αναφορά είναι το πραγματικό προϊόν του ηθικού χάκινγκ.",
        },
        tip: {
          en: "The report matters more than the hack. Findings, impact, and clear fixes are what clients pay for.",
          el: "Η αναφορά μετράει πιο πολύ από το hack. Ευρήματα, επιπτώσεις και σαφείς διορθώσεις είναι αυτό που πληρώνουν οι πελάτες.",
        },
      },
    ],
    cheats: [
      { cmd: "id", desc: { en: "check current privileges", el: "έλεγχος προνομίων" } },
      { cmd: "sudo su", desc: { en: "become root", el: "γίνε root" } },
      { cmd: "whoami", desc: { en: "confirm you are root", el: "επιβεβαίωση root" } },
      { cmd: "cat /etc/passwd", desc: { en: "read protected files", el: "ανάγνωση προστατευμένων" } },
    ],
    tasks: [
      {
        id: "enum",
        instruction: { en: "Check your current privileges with id.", el: "Έλεγξε τα προνόμιά σου με id." },
        hint: { en: "id", el: "id" },
        explain: {
          en: "WHY: Privilege escalation starts with enumeration — you check exactly what you can do now (your uid and groups) to find a path to root. HOW: 'id' shows your identity; also try 'sudo -l' to list commands you may run as root.",
          el: "ΓΙΑΤΙ: Η ανύψωση προνομίων ξεκινά με απαρίθμηση — ελέγχεις ακριβώς τι μπορείς να κάνεις τώρα (uid και ομάδες) για να βρεις δρόμο προς root. ΠΩΣ: Το 'id' δείχνει την ταυτότητά σου· δοκίμασε και 'sudo -l' για τις εντολές που μπορείς να τρέξεις ως root.",
        },
        check: (t) => t.ranId,
      },
      {
        id: "root",
        instruction: { en: "Escalate to root with sudo su.", el: "Ανέβα σε root με sudo su." },
        hint: { en: "sudo su", el: "sudo su" },
        explain: {
          en: "WHY: Becoming root is the goal of privilege escalation — as root you control the entire machine. HOW: 'sudo su' opens a root shell (if your user is allowed); 'sudo -i' does the same. Your prompt changes and 'whoami' will say root.",
          el: "ΓΙΑΤΙ: Το να γίνεις root είναι ο στόχος της ανύψωσης προνομίων — ως root ελέγχεις όλο το μηχάνημα. ΠΩΣ: 'sudo su' ανοίγει shell root (αν ο χρήστης σου επιτρέπεται)· το 'sudo -i' κάνει το ίδιο. Το prompt αλλάζει και το 'whoami' θα λέει root.",
        },
        check: (t) => t.user === "root",
      },
      {
        id: "confirm",
        instruction: { en: "Confirm you are root with whoami.", el: "Επιβεβαίωσε ότι είσαι root με whoami." },
        hint: { en: "whoami   (should print: root)", el: "whoami   (πρέπει να τυπώσει: root)" },
        explain: {
          en: "WHY: Always confirm the result of an escalation before continuing — you need to be certain you're really root. HOW: 'whoami' prints the current effective user. If it says 'root', you succeeded and can now read any file on the system.",
          el: "ΓΙΑΤΙ: Επιβεβαίωνε πάντα το αποτέλεσμα μιας ανύψωσης πριν συνεχίσεις — πρέπει να είσαι σίγουρος ότι είσαι πραγματικά root. ΠΩΣ: Το 'whoami' τυπώνει τον τρέχοντα χρήστη. Αν λέει 'root', πέτυχες και μπορείς να διαβάσεις κάθε αρχείο στο σύστημα.",
        },
        check: (t) => t.user === "root" && t.ranWhoami,
      },
    ],
    challenges: [
      {
        title: { en: "Capture the Root Flag", el: "Άρπαξε το Root Flag" },
        brief: {
          en: "The root user keeps a protected flag at /root/flag.txt that no ordinary user can read. Escalate your privileges and read that file.",
          el: "Ο χρήστης root κρατά ένα προστατευμένο flag στο /root/flag.txt που κανένας απλός χρήστης δεν διαβάζει. Ανέβασε τα προνόμιά σου και διάβασέ το.",
        },
        success: { en: "Root flag captured. You are forged. 🔥", el: "Το root flag αρπάχτηκε. Είσαι σφυρηλατημένος. 🔥" },
        check: (t) => t.capturedFlags.has("flag{root_access_the_forge_is_complete}"),
      },
      {
        title: { en: "Raid the Shadow File", el: "Λεηλάτησε το Shadow File" },
        brief: {
          en: "Real power is reading what others cannot. Only root may open /etc/shadow — where every account's password hash is stored. As root, read that file to seize its hidden flag.",
          el: "Η πραγματική δύναμη είναι να διαβάζεις όσα δεν μπορούν οι άλλοι. Μόνο ο root ανοίγει το /etc/shadow — όπου αποθηκεύεται το hash κωδικού κάθε λογαριασμού. Ως root, διάβασε το αρχείο για να αρπάξεις το κρυφό flag.",
        },
        success: { en: "Shadow file read — every hash is in your hands. Total control.", el: "Το shadow διαβάστηκε — κάθε hash στα χέρια σου. Απόλυτος έλεγχος." },
        check: (t) => t.capturedFlags.has("flag{root_reads_the_shadow_file}"),
      },
    ],
  },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "intro",
    title: { en: "Introduction to Cybersecurity", el: "Εισαγωγή στην Κυβερνοασφάλεια" },
    subtitle: {
      en: "From your first Linux command to root — 9 hands-on modules.",
      el: "Από την πρώτη εντολή Linux μέχρι root — 9 πρακτικές ενότητες.",
    },
    scenario: "lab",
    modules: MODULES,
  },
  {
    id: "raven",
    title: { en: "Raven — Boot2Root", el: "Raven — Boot2Root" },
    subtitle: {
      en: "A full CTF: breach a security firm's server, capture 4 flags, get root.",
      el: "Ένα πλήρες CTF: παραβίασε τον server μιας εταιρείας ασφάλειας, βρες 4 flags, γίνε root.",
    },
    scenario: "raven",
    modules: RAVEN_MODULES,
  },
  {
    id: "ssh",
    title: { en: "SSH Penetration Testing", el: "SSH Penetration Testing" },
    subtitle: {
      en: "Attack & defend port 22: recon, brute-force, keys, tunnelling, hardening.",
      el: "Επίθεση & άμυνα στη θύρα 22: recon, brute-force, κλειδιά, tunnelling, θωράκιση.",
    },
    scenario: "ssh",
    modules: SSH_MODULES,
  },
  {
    id: "sudorun",
    title: { en: "Sudo_Run — Linux for Beginners", el: "Sudo_Run — Linux για Αρχάριους" },
    subtitle: {
      en: "Twelve hands-on labs: navigation, search, files, text, packages, permissions, networks, processes, variables, scripting, cron and services.",
      el: "Δώδεκα πρακτικά labs: πλοήγηση, αναζήτηση, αρχεία, κείμενο, πακέτα, δικαιώματα, δίκτυα, διεργασίες, μεταβλητές, scripting, cron και υπηρεσίες.",
    },
    scenario: "lab",
    modules: [...SUDO_MODULES_A, ...SUDO_MODULES_B, ...SUDO_MODULES_C],
  },
];
