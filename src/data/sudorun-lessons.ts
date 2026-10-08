import type { Module } from "./lessons";
import { usedCmd } from "../lib/terminal";
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
    title: { en: "Why Linux, and the first commands", el: "Γιατί Linux, και οι πρώτες εντολές" },
    subtitle: { en: "Prompt, pwd, whoami, cd, ls", el: "Prompt, pwd, whoami, cd, ls" },
    badge: { en: "Sudo Initiate", el: "Μύηση Sudo" },
    theory: [
      {
        heading: { en: "Why use Linux for pentesting?", el: "Γιατί Linux στο pentest;" },
        body: {
          en: "Linux is the usual workstation for security work because you can see how the system actually behaves. The kernel, the shell and the everyday utilities are open source, so a permission check or a package install is not a black box. Most security tools are written for this command line first, and a repository can keep a machine current without hunting installers by hand.\n\nNone of that makes Linux magically safe. It gives you the controls and the visibility to notice what is happening. This course is Linux for Beginners #1, inside GameHack. Practise here, or on a throwaway virtual machine you administer. A typo as root on a real disk is permanent: the command line has no recycle bin.",
          el: "Το Linux είναι ο συνηθισμένος σταθμός εργασίας για δουλειά ασφάλειας, γιατί μπορείς να δεις πώς συμπεριφέρεται πραγματικά το σύστημα. Ο πυρήνας, το shell και οι καθημερινές εντολές είναι ανοιχτός κώδικας, οπότε ένας έλεγχος δικαιωμάτων ή μια εγκατάσταση πακέτου δεν είναι μαύρο κουτί. Τα περισσότερα εργαλεία ασφάλειας γράφονται πρώτα για αυτή τη γραμμή εντολών, και ένα αποθετήριο μπορεί να κρατά ένα μηχάνημα ενημερωμένο χωρίς να κυνηγάς εγκαταστάτες στο χέρι.\n\nΤίποτα από αυτά δεν κάνει το Linux μαγικά ασφαλές. Σου δίνει τους ελέγχους και την ορατότητα για να προσέξεις τι συμβαίνει. Αυτό το μάθημα είναι το Linux για αρχάριους #1, μέσα στο GameHack. Εξασκήσου εδώ, ή σε μια αναλώσιμη εικονική μηχανή που διαχειρίζεσαι. Ένα λάθος ως root σε πραγματικό δίσκο είναι μόνιμο: η γραμμή εντολών δεν έχει κάδο ανακύκλωσης.",
        },
      },
      {
        heading: { en: "The terminal", el: "Το τερματικό" },
        body: {
          en: "The terminal is the program that reads a line, interprets it, and asks the operating system to do the work. In this lab the prompt looks like root@kali:~# . root is the account, kali is the machine name, and ~ is your home directory. The final # means you are root. A normal account would end in $ . If you see # and did not expect it, stop and read the next command before you press Enter.\n\nEverything after the prompt is what you typed. Every line under it, until the next prompt, is what the program printed. Nothing runs until Enter. Inside a file, a line that starts with # is a comment, not a command. The same character means two different things depending on whether it sits in the prompt or in a file.\n\nAngle brackets in a lesson, such as cp <source> <destination>, are placeholders. Replace them with a real path. Output in the screenshots is the shape of a Debian-style answer. Sizes and timestamps in your own session can differ. What matters is which field is which.",
          el: "Το τερματικό είναι το πρόγραμμα που διαβάζει μια γραμμή, την ερμηνεύει, και ζητά από το λειτουργικό να κάνει τη δουλειά. Σε αυτό το εργαστήριο το prompt μοιάζει με root@kali:~# . Το root είναι ο λογαριασμός, το kali το όνομα του μηχανήματος, και το ~ ο προσωπικός σου φάκελος. Το τελικό # σημαίνει ότι είσαι root. Ένας απλός λογαριασμός θα τέλειωνε σε $ . Αν δεις # και δεν το περίμενες, σταμάτα και διάβασε την επόμενη εντολή πριν πατήσεις Enter.\n\nΌ,τι ακολουθεί το prompt είναι αυτό που πληκτρολόγησες. Κάθε γραμμή από κάτω, μέχρι το επόμενο prompt, είναι αυτό που τύπωσε το πρόγραμμα. Τίποτα δεν τρέχει πριν το Enter. Μέσα σε αρχείο, μια γραμμή που αρχίζει με # είναι σχόλιο, όχι εντολή. Ο ίδιος χαρακτήρας σημαίνει δύο διαφορετικά πράγματα, ανάλογα με το αν κάθεται στο prompt ή σε αρχείο.\n\nΟι γωνιακές αγκύλες σε ένα μάθημα, όπως cp <πηγή> <προορισμός>, είναι θέσεις που αντικαθιστάς. Βάλε μια πραγματική διαδρομή. Η έξοδος στα στιγμιότυπα έχει το σχήμα μιας απάντησης τύπου Debian. Μεγέθη και χρόνοι στη δική σου συνεδρία μπορεί να διαφέρουν. Αυτό που μετράει είναι ποιο πεδίο είναι ποιο.",
        },
      },
      {
        heading: { en: "pwd — where am I?", el: "pwd — πού είμαι;" },
        body: {
          en: "pwd answers where am I. It takes no arguments, prints one absolute path, and exits. The next command runs in that directory, and a file you create without a path is created there. In this lab you start in /root, which is the home of the root account. The prompt's ~ is shorthand for that home. cd ~ and cd /root are the same move while you are root. A normal account named student would see /home/student instead.\n\nThe output is a single undecorated line. That is deliberate: other programs can read it as easily as you can.",
          el: "Η pwd απαντά στο πού είμαι. Δεν παίρνει ορίσματα, τυπώνει μία απόλυτη διαδρομή, και τελειώνει. Η επόμενη εντολή τρέχει σε εκείνον τον φάκελο, και ένα αρχείο που δημιουργείς χωρίς διαδρομή δημιουργείται εκεί. Σε αυτό το εργαστήριο ξεκινάς στο /root, που είναι το home του λογαριασμού root. Το ~ του prompt είναι συντομογραφία για εκείνο το home. Τα cd ~ και cd /root είναι η ίδια κίνηση όσο είσαι root. Ένας απλός λογαριασμός με όνομα student θα έβλεπε /home/student.\n\nΗ έξοδος είναι μία γραμμή χωρίς στολίδια. Αυτό είναι σκόπιμο: άλλα προγράμματα μπορούν να τη διαβάσουν τόσο εύκολα όσο εσύ.",
        },
        shots: [shot("pwd", ["/root"])],
      },
      {
        heading: { en: "whoami — who am I?", el: "whoami — ποιος είμαι;" },
        body: {
          en: "whoami answers who am I. Linux decides what a process may read, write or execute from that identity, not from which window you opened. Here the answer is root, the administrator account. Root is not stopped by ordinary permission checks, which is why the same command can be refused for a normal user and destructive for root.\n\nid prints the numbers the kernel actually uses: user id, primary group, and extra groups. User id 0 is always root. On Debian-family systems, ordinary human accounts usually start at 1000. A process running as uid=0 that has no reason to do so is a finding, not a convenience.",
          el: "Η whoami απαντά στο ποιος είμαι. Το Linux αποφασίζει τι μπορεί να διαβάσει, να γράψει ή να εκτελέσει μια διεργασία από εκείνη την ταυτότητα, όχι από το ποιο παράθυρο άνοιξες. Εδώ η απάντηση είναι root, ο λογαριασμός διαχειριστή. Ο root δεν σταματά από τους συνηθισμένους ελέγχους δικαιωμάτων, γι' αυτό η ίδια εντολή μπορεί να απορριφθεί για απλό χρήστη και να είναι καταστροφική για τον root.\n\nΗ id τυπώνει τους αριθμούς που χρησιμοποιεί πραγματικά ο πυρήνας: user id, κύρια ομάδα, και επιπλέον ομάδες. Το user id 0 είναι πάντα ο root. Σε συστήματα οικογένειας Debian, οι απλοί ανθρώπινοι λογαριασμοί συνήθως αρχίζουν από το 1000. Μια διεργασία που τρέχει ως uid=0 χωρίς λόγο είναι εύρημα, όχι ευκολία.",
        },
        shots: [shot("whoami", ["root"]), shot("id", ["uid=0(root) gid=0(root) groups=0(root)"])],
      },
      {
        heading: { en: "cd — change directory", el: "cd — αλλαγή φακέλου" },
        body: {
          en: "cd changes the working directory. A path that does not start with / is relative to where you are, so cd Desktop/ from /root lands in /root/Desktop. A path that starts with / is absolute and ignores your current place.\n\nThree shortcuts are worth memorising. cd .. goes to the parent. cd / goes to the root of the whole tree, not to /root. cd ~ goes home. A real shell also has cd - , which returns to the previous directory. This sandbox does not keep that history, so use pwd and an explicit path instead. On success the lab prints Changed directory to … . A real prompt would simply change the path before the # and stay silent. Silence there means success, not a frozen terminal.",
          el: "Η cd αλλάζει τον τρέχοντα φάκελο. Μια διαδρομή που δεν αρχίζει με / είναι σχετική με το πού βρίσκεσαι, οπότε το cd Desktop/ από το /root σε πηγαίνει στο /root/Desktop. Μια διαδρομή που αρχίζει με / είναι απόλυτη και αγνοεί το πού στέκεσαι.\n\nΤρεις συντομεύσεις αξίζει να τις μάθεις. Το cd .. πάει στον γονέα. Το cd / πάει στη ρίζα ολόκληρου του δέντρου, όχι στο /root. Το cd ~ πάει στο home. Ένα πραγματικό shell έχει και cd - , που γυρίζει στον προηγούμενο φάκελο. Αυτό το sandbox δεν κρατά εκείνο το ιστορικό, οπότε χρησιμοποίησε pwd και ρητή διαδρομή. Σε επιτυχία το εργαστήριο τυπώνει Changed directory to … . Ένα πραγματικό prompt θα άλλαζε απλώς τη διαδρομή πριν το # και θα έμενε σιωπηλό. Η σιωπή εκεί σημαίνει επιτυχία, όχι κολλημένο τερματικό.",
        },
        shots: [shot("cd Desktop/", ["Changed directory to /root/Desktop"])],
      },
      {
        heading: { en: "ls — list contents", el: "ls — λίστα" },
        body: {
          en: "ls lists the names in the current directory. It does not enter a directory and it does not open a file. After cd Desktop/, a plain ls shows the visible names, such as CTF-notes.txt and todo.txt.\n\nls -l adds the details. The first character is the type: - for a file, d for a directory. The next nine characters are three groups of rwx, for the owner, the group, and everyone else. Then come the owner, the group, the size in bytes, and the name. ls -a also shows names that start with a dot, including . and .. . Those are not decorations: . is this directory and .. is its parent. ls -lah on a real machine adds human-readable sizes. This lab prints the byte count either way, so read the number as bytes.",
          el: "Η ls απαριθμεί τα ονόματα στον τρέχοντα φάκελο. Δεν μπαίνει σε φάκελο και δεν ανοίγει αρχείο. Μετά το cd Desktop/, μια σκέτη ls δείχνει τα ορατά ονόματα, όπως CTF-notes.txt και todo.txt.\n\nΗ ls -l προσθέτει τις λεπτομέρειες. Ο πρώτος χαρακτήρας είναι ο τύπος: - για αρχείο, d για φάκελο. Οι επόμενοι εννέα χαρακτήρες είναι τρεις ομάδες rwx, για τον ιδιοκτήτη, την ομάδα, και όλους τους άλλους. Ακολουθούν ο ιδιοκτήτης, η ομάδα, το μέγεθος σε bytes, και το όνομα. Η ls -a δείχνει και ονόματα που αρχίζουν με τελεία, μαζί με . και .. . Δεν είναι στολίδια: το . είναι αυτός ο φάκελος και το .. ο γονέας του. Η ls -lah σε πραγματικό μηχάνημα προσθέτει μεγέθη αναγνώσιμα από άνθρωπο. Αυτό το εργαστήριο τυπώνει τον αριθμό των bytes έτσι κι αλλιώς, οπότε διάβασε τον αριθμό ως bytes.",
        },
        shots: [
          shot("ls", ["CTF-notes.txt  todo.txt"]),
          shot("ls -l", ["total 2", "-rw-r--r-- 1 root root   51 CTF-notes.txt", "-rw-r--r-- 1 root root   60 todo.txt"]),
        ],
      },
    ],
    cheats: [
      { cmd: "pwd", desc: { en: "print working directory", el: "τρέχων φάκελος" } },
      { cmd: "whoami", desc: { en: "current user", el: "τρέχων χρήστης" } },
      { cmd: "id", desc: { en: "numeric user and groups", el: "αριθμητικός χρήστης και ομάδες" } },
      { cmd: "cd Desktop/", desc: { en: "enter Desktop", el: "μπες στο Desktop" } },
      { cmd: "cd ..", desc: { en: "parent directory", el: "γονικός φάκελος" } },
      { cmd: "ls -la", desc: { en: "long listing, including dot names", el: "αναλυτική λίστα, και με κρυφά ονόματα" } },
    ],
    tasks: [
      {
        id: "pwd",
        instruction: { en: "Run pwd — you should see /root.", el: "Εκτέλεσε pwd — πρέπει να δεις /root." },
        hint: { en: "pwd", el: "pwd" },
        explain: { en: "WHY: orientation. HOW: pwd", el: "ΓΙΑΤΙ: προσανατολισμός." },
        check: (t) => t.flags.has("pwd") || usedCmd(t, /^\s*pwd\b/),
      },
      {
        id: "whoami",
        instruction: { en: "Run whoami and confirm you are root.", el: "Εκτέλεσε whoami και επιβεβαίωσε ότι είσαι root." },
        hint: { en: "whoami", el: "whoami" },
        explain: { en: "Root is all-powerful. That is why the ethics oath exists.", el: "Ο χρήστης root έχει απεριόριστες δυνατότητες." },
        check: (t) => t.flags.has("whoami"),
      },
      {
        id: "cd",
        instruction: { en: "cd into Desktop.", el: "Μετακινήσου στο Desktop με cd." },
        hint: { en: "cd Desktop", el: "cd Desktop" },
        explain: { en: "cd Desktop/ or cd Desktop", el: "cd Desktop" },
        check: (t) => t.flags.has("cd-desktop") || usedCmd(t, /^\s*cd\s+Desktop/),
      },
      {
        id: "ls",
        instruction: { en: "List the Desktop with ls.", el: "Εμφάνισε τα περιεχόμενα του Desktop με ls." },
        hint: { en: "ls", el: "ls" },
        explain: { en: "ls is your dir.", el: "Το ls αντιστοιχεί στο dir." },
        check: (t) => t.flags.has("ls"),
      },
    ],
    challenges: [
      {
        title: { en: "Home again", el: "Πίσω στο home" },
        brief: { en: "cd ~ or cd /root and pwd again.", el: "Εκτέλεσε cd ~ ή cd /root και μετά pwd." },
        success: { en: "You can move and know where you landed.", el: "Γνωρίζεις πλέον πού βρίσκεσαι." },
        check: (t) => usedCmd(t, /^\s*cd\s+(\/root|~)\s*$/) || t.cwd === "/root",
      },
      {
        title: { en: "Read the desktop CTF note", el: "Διάβασε το CTF note" },
        brief: { en: "cat Desktop/CTF-notes.txt from /root (or cat CTF-notes.txt if you are already in Desktop).", el: "Διάβασε το CTF-notes.txt με cat" },
        success: { en: "You found a Sudo_Run flag on the desktop.", el: "Βρήκες ένα flag στην επιφάνεια εργασίας." },
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
    title: { en: "Help, man, locate, whereis, which", el: "Help, man, locate, whereis, which" },
    subtitle: { en: "How operators look things up", el: "Πώς ψάχνουν οι χειριστές" },
    badge: { en: "Page Turner", el: "Αναγνώστης man" },
    theory: [
      {
        heading: { en: "help / --help", el: "help / --help" },
        body: {
          en: "When you do not remember a flag, ask the command. Most programs accept --help or the shorter -h and print a short summary of their own options to the terminal. That summary is written by the program, so it matches the version you actually have. volatility --help is the lab example. Read the flag names. Do not treat a help page as permission to run the tool against a machine you do not administer.\n\nIf --help is too short, the manual is the longer book. man ls opens the page for ls. The number in parentheses is the section: (1) is user commands, (5) is file formats, (8) is administration. The same word can exist in more than one section, which is why man 5 passwd and man passwd are not the same page on a real system. This lab prints a training page: name, synopsis, a one-line description, and a reminder that the command acts on the virtual filesystem only. man -k WORD searches those summaries, the way apropos does on a real machine.",
          el: "Όταν δεν θυμάσαι μια επιλογή, ρώτα την εντολή. Τα περισσότερα προγράμματα δέχονται --help ή το συντομότερο -h και τυπώνουν μια σύντομη περίληψη των δικών τους επιλογών στο τερματικό. Την περίληψη τη γράφει το ίδιο το πρόγραμμα, οπότε ταιριάζει με την έκδοση που έχεις. Το volatility --help είναι το παράδειγμα του εργαστηρίου. Διάβασε τα ονόματα των επιλογών. Μην αντιμετωπίζεις μια σελίδα βοήθειας ως άδεια να τρέξεις το εργαλείο σε μηχάνημα που δεν διαχειρίζεσαι.\n\nΑν το --help είναι πολύ σύντομο, το εγχειρίδιο είναι το μακρύτερο βιβλίο. Το man ls ανοίγει τη σελίδα της ls. Ο αριθμός στις παρενθέσεις είναι η ενότητα: το (1) είναι εντολές χρήστη, το (5) μορφές αρχείων, το (8) διαχείριση. Η ίδια λέξη μπορεί να υπάρχει σε περισσότερες από μία ενότητες, γι' αυτό σε πραγματικό σύστημα τα man 5 passwd και man passwd δεν είναι η ίδια σελίδα. Αυτό το εργαστήριο τυπώνει μια εκπαιδευτική σελίδα: όνομα, σύνοψη, μία γραμμή περιγραφής, και υπενθύμιση ότι η εντολή ενεργεί μόνο στο εικονικό σύστημα αρχείων. Το man -k WORD ψάχνει εκείνες τις περιλήψεις, όπως το apropos σε πραγματικό μηχάνημα.",
        },
        shots: [shot("volatility --help", ["Volatility Foundation Volatility Framework", "-h, --help   show help message and exit", "Plugins: pslist, netscan, filescan (lab stub)"])],
      },
      {
        heading: { en: "man — manual pages", el: "man — εγχειρίδια" },
        body: {
          en: "man COMMAND is the command you type. On a real terminal, q leaves the page and /word searches inside it. This lab prints the page and returns to the prompt, so there is no pager to quit. The useful habit is the same: read NAME and SYNOPSIS before you invent flags. A synopsis in square brackets is optional. Words in capitals are placeholders you replace. A flag you did not see in the synopsis is a guess, and guesses on a destructive command are how people delete the wrong tree.",
          el: "Το man COMMAND είναι η εντολή που πληκτρολογείς. Σε πραγματικό τερματικό, το q φεύγει από τη σελίδα και το /word ψάχνει μέσα της. Αυτό το εργαστήριο τυπώνει τη σελίδα και γυρίζει στο prompt, οπότε δεν υπάρχει pager για να κλείσεις. Η χρήσιμη συνήθεια είναι η ίδια: διάβασε NAME και SYNOPSIS πριν επινοήσεις επιλογές. Μια σύνοψη σε αγκύλες είναι προαιρετική. Οι λέξεις με κεφαλαία είναι θέσεις που αντικαθιστάς. Μια επιλογή που δεν είδες στη σύνοψη είναι εικασία, και οι εικασίες σε καταστροφική εντολή είναι ο τρόπος που σβήνει κανείς λάθος δέντρο.",
        },
        shots: [shot("man ls", ["LS(1)                         GameHack USER COMMANDS                         LS(1)", "NAME", "       ls - List virtual directory contents.", "SYNOPSIS", "       ls [OPTIONS] [PATH...]"])],
      },
      {
        heading: { en: "locate — keyword search", el: "locate — αναζήτηση" },
        body: {
          en: "locate KEYWORD searches names, not file contents. On a real machine it searches an index that is usually rebuilt once a day, so a file you just created can be missing until that index is refreshed. This lab does not use that stale index. It walks the virtual tree at the moment you ask, and the match is case-insensitive. locate CTF therefore finds names such as /root/Desktop/CTF-notes.txt.\n\nThe result can still be long. The pipe | sends the lines into another command instead of only onto the screen. locate CTF | more is the lab habit: produce the list, then page it. Nothing is written to disk between the two programs.",
          el: "Το locate KEYWORD ψάχνει ονόματα, όχι περιεχόμενο αρχείων. Σε πραγματικό μηχάνημα ψάχνει ένα ευρετήριο που συνήθως ξαναχτίζεται μία φορά την ημέρα, οπότε ένα αρχείο που μόλις δημιούργησες μπορεί να λείπει μέχρι να ανανεωθεί το ευρετήριο. Αυτό το εργαστήριο δεν χρησιμοποιεί εκείνο το παλιό ευρετήριο. Περπατά το εικονικό δέντρο τη στιγμή που ρωτάς, και το ταίριασμα αγνοεί κεφαλαία και πεζά. Το locate CTF βρίσκει λοιπόν ονόματα όπως /root/Desktop/CTF-notes.txt.\n\nΤο αποτέλεσμα μπορεί και πάλι να είναι μακρύ. Το pipe | στέλνει τις γραμμές σε άλλη εντολή αντί να τις αφήνει μόνο στην οθόνη. Το locate CTF | more είναι η συνήθεια του εργαστηρίου: βγάλε τη λίστα, και μετά σελιδοποίησέ την. Τίποτα δεν γράφεται στον δίσκο ανάμεσα στα δύο προγράμματα.",
        },
        shots: [shot("locate CTF | more", ["/root/Desktop/CTF-notes.txt", "/opt/CTF/readme", "/usr/share/wordlists/CTF.txt"])],
      },
      {
        heading: { en: "Binaries, whereis, which", el: "Binaries, whereis, which" },
        body: {
          en: "A command you type is either a file the shell can execute, or a built-in the shell handles itself. whereis git reports both the usual binary path and the manual page path. which git reports only the first executable it would run, by walking the directories in the PATH variable. In this lab that answer is /usr/bin/git. On a real machine, a name that is not installed prints nothing and a failing status. This lab always prints /usr/bin/<name> so you can practise reading the path. Do not treat that line as proof the program exists outside the exercise.\n\nThe current directory is deliberately not on PATH. If the shell says command not found for a script sitting in the folder you are in, name it explicitly, for example ./simple_bash.sh. That extra ./ is a safety measure: a file dropped into a shared folder cannot impersonate ls just by using the same name. A real shell's type command also says whether a name is a built-in, an alias, or a file. This lab does not implement type. Use which for the path, and remember that cd is a built-in, which is why which cd on a real machine is the wrong question.",
          el: "Μια εντολή που πληκτρολογείς είναι είτε αρχείο που μπορεί να εκτελέσει το shell, είτε ενσωματωμένη εντολή που χειρίζεται το ίδιο το shell. Το whereis git αναφέρει και τη συνηθισμένη διαδρομή του binary και τη διαδρομή της σελίδας εγχειριδίου. Το which git αναφέρει μόνο το πρώτο εκτελέσιμο που θα έτρεχε, περπατώντας τους φακέλους της μεταβλητής PATH. Σε αυτό το εργαστήριο η απάντηση είναι /usr/bin/git. Σε πραγματικό μηχάνημα, ένα όνομα που δεν είναι εγκατεστημένο δεν τυπώνει τίποτα και επιστρέφει αποτυχία. Αυτό το εργαστήριο τυπώνει πάντα /usr/bin/<όνομα> ώστε να εξασκηθείς στο διάβασμα της διαδρομής. Μην αντιμετωπίζεις εκείνη τη γραμμή ως απόδειξη ότι το πρόγραμμα υπάρχει έξω από την άσκηση.\n\nΟ τρέχων φάκελος σκόπιμα δεν είναι στο PATH. Αν το shell πει command not found για ένα script που κάθεται στον φάκελο όπου βρίσκεσαι, ονόμασέ το ρητά, για παράδειγμα ./simple_bash.sh. Το επιπλέον ./ είναι μέτρο ασφαλείας: ένα αρχείο που έπεσε σε κοινό φάκελο δεν μπορεί να υποδυθεί την ls μόνο και μόνο επειδή έχει το ίδιο όνομα. Η εντολή type ενός πραγματικού shell λέει επίσης αν ένα όνομα είναι ενσωματωμένο, ψευδώνυμο, ή αρχείο. Αυτό το εργαστήριο δεν υλοποιεί την type. Χρησιμοποίησε which για τη διαδρομή, και θυμήσου ότι η cd είναι ενσωματωμένη, γι' αυτό η which cd σε πραγματικό μηχάνημα είναι η λάθος ερώτηση.",
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
        instruction: { en: "Run volatility --help", el: "Εκτέλεσε volatility --help" },
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
        explain: { en: "In this lab, locate walks the virtual tree now. A real locate uses a daily index.", el: "Εδώ το locate περπατά τώρα το εικονικό δέντρο. Ένα πραγματικό locate χρησιμοποιεί ημερήσιο ευρετήριο." },
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
    title: { en: "grep & find", el: "grep & find" },
    subtitle: { en: "Filter output and hunt files", el: "Φίλτραρε έξοδο και κυνήγα αρχεία" },
    badge: { en: "Needle Finder", el: "Ευρετής" },
    theory: [
      {
        heading: { en: "grep a file", el: "grep σε αρχείο" },
        body: {
          en: "grep reads text and prints only the lines that match a pattern. The name comes from an old editor command: globally search a regular expression and print. From /root, grep -i \"echo\" simple_bash.sh finds the echo lines in the lab script. Lowercase -i makes the match ignore capitals. Without it, Echo and echo are different. -n prefixes each hit with its line number. The lab also accepts the older task line with a capital I. On a real system that capital I means something else, so prefer -i when you want case-insensitive search.\n\ngrep does not say which file a line came from unless you ask, and it does not change the file. It only prints.",
          el: "Η grep διαβάζει κείμενο και τυπώνει μόνο τις γραμμές που ταιριάζουν σε ένα μοτίβο. Το όνομα έρχεται από μια παλιά εντολή επεξεργαστή: ψάξε καθολικά μια κανονική έκφραση και τύπωσε. Από το /root, το grep -i \"echo\" simple_bash.sh βρίσκει τις γραμμές echo στο script του εργαστηρίου. Το πεζό -i κάνει το ταίριασμα να αγνοεί τα κεφαλαία. Χωρίς αυτό, τα Echo και echo είναι διαφορετικά. Το -n βάζει μπροστά από κάθε εύρημα τον αριθμό γραμμής. Το εργαστήριο δέχεται και την παλαιότερη γραμμή άσκησης με κεφαλαίο I. Σε πραγματικό σύστημα εκείνο το κεφαλαίο I σημαίνει κάτι άλλο, οπότε προτίμησε -i όταν θέλεις αναζήτηση χωρίς διάκριση πεζών-κεφαλαίων.\n\nΗ grep δεν λέει από ποιο αρχείο ήρθε μια γραμμή αν δεν το ζητήσεις, και δεν αλλάζει το αρχείο. Μόνο τυπώνει.",
        },
        shots: [shot('grep -i "echo" simple_bash.sh', ['echo "GameHack scanner starting"', 'echo "Sudo_Run lab — simulated only"', "# echo is here so grep can find it"])],
      },
      {
        heading: { en: "Piping into grep", el: "Pipe στο grep" },
        body: {
          en: "The usual use of grep is not to open a file at all. It filters the output of another command. ifconfig | grep inet keeps the address lines and drops the packet counters. In this lab those lines show the fictional address 10.10.10.2, a link-local IPv6 address, and 127.0.0.1, the loopback address every machine uses to talk to itself.\n\nThe vertical bar is a pipe. The program on the left writes to standard output. The program on the right reads that as standard input. They run together, and nothing is saved in between. grep -v inet does the opposite: it prints every line that does not contain the word. On a modern system, ip a is the preferred replacement for ifconfig. The filter idea is the same.",
          el: "Η συνηθισμένη χρήση της grep δεν είναι να ανοίγει αρχείο. Φιλτράρει την έξοδο μιας άλλης εντολής. Το ifconfig | grep inet κρατά τις γραμμές διευθύνσεων και πετά τους μετρητές πακέτων. Σε αυτό το εργαστήριο εκείνες οι γραμμές δείχνουν την εικονική διεύθυνση 10.10.10.2, μια link-local διεύθυνση IPv6, και το 127.0.0.1, τη διεύθυνση loopback που κάθε μηχάνημα χρησιμοποιεί για να μιλήσει στον εαυτό του.\n\nΗ κάθετη γραμμή είναι pipe. Το πρόγραμμα αριστερά γράφει στην τυπική έξοδο. Το πρόγραμμα δεξιά τη διαβάζει ως τυπική είσοδο. Τρέχουν μαζί, και τίποτα δεν αποθηκεύεται ενδιάμεσα. Το grep -v inet κάνει το αντίθετο: τυπώνει κάθε γραμμή που δεν περιέχει τη λέξη. Σε σύγχρονο σύστημα, το ip a είναι η προτιμώμενη αντικατάσταση του ifconfig. Η ιδέα του φίλτρου είναι η ίδια.",
        },
        shots: [shot("ifconfig | grep inet", ["        inet 10.10.10.2  netmask 255.255.255.0  broadcast 10.10.10.255", "        inet6 fe80::a00:27ff:fe12:3456  prefixlen 64", "        inet 127.0.0.1  netmask 255.0.0.0"])],
      },
      {
        heading: { en: "find — the flexible hunter", el: "find — κυνηγός" },
        body: {
          en: "find walks the tree live, which is why it can filter on more than a name. The shape is find <where to start> <what to keep>. find / -type f -name gamehack starts at the root of the tree and keeps regular files whose name is gamehack. In this lab that marker is /opt/labs/gamehack. -type d would keep directories instead. A real find also understands owner, size, and how recently a file changed. This lab honours the name and the starting path.\n\nOn a real system, a search of / as a normal user prints two kinds of lines on two channels. Matches go to standard output. Permission denied goes to standard error. 2>/dev/null throws the errors away. 2>&1 | grep -v \"Permission denied\" merges the errors into the normal output and then filters them. The first is cleaner, because it does not depend on the wording of the error. This lab's find does not emit those permission lines, because the exercise tree is readable. The challenge still asks you to type the redirection so you can read it before you need it.\n\nfind can also be told to run another command on each match. Do not do that until you have printed the list and checked every path. This lab stops at printing.",
          el: "Η find περπατά το δέντρο ζωντανά, γι' αυτό μπορεί να φιλτράρει σε περισσότερα από ένα όνομα. Το σχήμα είναι find <από πού> <τι να κρατήσει>. Το find / -type f -name gamehack ξεκινά από τη ρίζα του δέντρου και κρατά κανονικά αρχεία που το όνομά τους είναι gamehack. Σε αυτό το εργαστήριο ο δείκτης είναι το /opt/labs/gamehack. Το -type d θα κρατούσε φακέλους. Μια πραγματική find καταλαβαίνει επίσης ιδιοκτήτη, μέγεθος, και πόσο πρόσφατα άλλαξε ένα αρχείο. Αυτό το εργαστήριο τιμά το όνομα και τη διαδρομή εκκίνησης.\n\nΣε πραγματικό σύστημα, μια αναζήτηση του / ως απλός χρήστης τυπώνει δύο είδη γραμμών σε δύο κανάλια. Τα ευρήματα πάνε στην τυπική έξοδο. Το Permission denied πάει στο τυπικό σφάλμα. Το 2>/dev/null πετά τα σφάλματα. Το 2>&1 | grep -v \"Permission denied\" ενώνει τα σφάλματα με την κανονική έξοδο και μετά τα φιλτράρει. Το πρώτο είναι καθαρότερο, γιατί δεν εξαρτάται από τη διατύπωση του σφάλματος. Η find αυτού του εργαστηρίου δεν βγάζει εκείνες τις γραμμές άρνησης, γιατί το δέντρο της άσκησης είναι αναγνώσιμο. Η πρόκληση σου ζητά και πάλι να πληκτρολογήσεις την ανακατεύθυνση, ώστε να την διαβάσεις πριν τη χρειαστείς.\n\nΗ find μπορεί επίσης να της ζητηθεί να τρέξει άλλη εντολή σε κάθε εύρημα. Μην το κάνεις πριν τυπώσεις τη λίστα και ελέγξεις κάθε διαδρομή. Αυτό το εργαστήριο σταματά στην εκτύπωση.",
        },
        shots: [
          shot("find / -type f -name gamehack", ["/opt/labs/gamehack"]),
          shot('find / -type f -name gamehack 2>&1 | grep -v "Permission Denied"', ["/opt/labs/gamehack"]),
        ],
      },
    ],
    cheats: [
      { cmd: 'grep -i "echo" simple_bash.sh', desc: { en: "search a file, ignoring case", el: "αναζήτηση αρχείου, χωρίς διάκριση πεζών" } },
      { cmd: "ifconfig | grep inet", desc: { en: "filter command output", el: "φίλτρο εξόδου" } },
      { cmd: "find / -type f -name gamehack", desc: { en: "hunt by name", el: "κυνήγι ονόματος" } },
    ],
    tasks: [
      {
        id: "grep-file",
        instruction: { en: 'grep -i "echo" simple_bash.sh', el: 'grep -i "echo" simple_bash.sh' },
        hint: { en: 'grep -i "echo" simple_bash.sh', el: 'grep -i "echo" simple_bash.sh' },
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
        instruction: { en: "find / -type f -name gamehack", el: "find / -type f -name gamehack" },
        hint: { en: "find / -type f -name gamehack", el: "find / -type f -name gamehack" },
        explain: { en: "/ is the tree root. -type f means regular file.", el: "Το / είναι η ρίζα. Το -type f επιλέγει κανονικά αρχεία." },
        check: (t) => t.flags.has("find-gamehack") || t.flags.has("find") || usedCmd(t, /find\s+\/.*gamehack/),
      },
    ],
    challenges: [
      {
        title: { en: "Silence permission denied", el: "Σίγαση permission denied" },
        brief: { en: 'find / -type f -name gamehack 2>&1 | grep -v "Permission Denied"', el: "find … 2>&1 | grep -v" },
        success: { en: "You redirected stderr and filtered it.", el: "Ανακατεύθυνες το stderr." },
        check: (t) => usedCmd(t, /2>&1/) || t.flags.has("find-gamehack"),
      },
      {
        title: { en: "Read the marker", el: "Διάβασε τον δείκτη" },
        brief: { en: "cat /opt/labs/gamehack", el: "cat /opt/labs/gamehack" },
        success: { en: "find led you to a GameHack flag.", el: "Η εντολή find σε οδήγησε στο flag." },
        check: (t) => t.filesRead.some((p) => p.includes("/opt/labs/gamehack")),
      },
    ],
  },
  {
    id: "sr-files",
    order: 4,
    icon: "folder",
    color: "from-cyan-400 to-sky-800",
    difficulty: 2,
    scenario: lab,
    title: { en: "Files & directories", el: "Αρχεία & φάκελοι" },
    subtitle: { en: "cat, touch, mkdir, cp, mv, rm, rmdir", el: "cat, touch, mkdir, cp, mv, rm, rmdir" },
    badge: { en: "File Clerk", el: "Αρχειοθέτης" },
    theory: [
      {
        heading: { en: "cat", el: "cat" },
        body: {
          en: "cat prints a file exactly as it is stored. The name is short for concatenate, because several files are printed one after another. The everyday use is one file: cat gamehack.txt from /root. It does not number lines, page them, or change the file. That rawness is why it is useful, and why it is the wrong tool for a long log. For more than a screen, use less in the next lesson. cat -n numbers lines on a real system. This lab's cat prints the bytes and leaves numbering to nl.",
          el: "Η cat τυπώνει ένα αρχείο ακριβώς όπως είναι αποθηκευμένο. Το όνομα είναι σύντμηση του concatenate, γιατί πολλά αρχεία τυπώνονται το ένα μετά το άλλο. Η καθημερινή χρήση είναι ένα αρχείο: cat gamehack.txt από το /root. Δεν αριθμεί γραμμές, δεν τις σελιδοποιεί, και δεν αλλάζει το αρχείο. Αυτή η ωμότητα είναι ο λόγος που είναι χρήσιμη, και ο λόγος που είναι το λάθος εργαλείο για ένα μακρύ αρχείο καταγραφής. Για περισσότερα από μία οθόνη, χρησιμοποίησε less στο επόμενο μάθημα. Το cat -n αριθμεί γραμμές σε πραγματικό σύστημα. Η cat αυτού του εργαστηρίου τυπώνει τα bytes και αφήνει την αρίθμηση στην nl.",
        },
        shots: [shot("cat gamehack.txt", ["Welcome to GameHack — Linux for Beginners (Sudo_Run).", "Keep notes here. Practice every command in the lab, not on the internet."])],
      },
      {
        heading: { en: "touch — create a file", el: "touch — νέο αρχείο" },
        body: {
          en: "touch gamehack-2.txt creates an empty file when the name does not exist. The lab answers Created virtual file: gamehack-2.txt. On a real system the same command is silent, and its original job is to update the timestamp of a file that already exists. Build tools such as make decide whether to rebuild by comparing those timestamps, so touching a source file can force a rebuild. If the name is missing, the system creates it. That side effect is why beginners meet touch as a way to make an empty file.\n\nThe new file's mode, usually -rw-r--r--, was not something you typed. The system applied the umask, which you will meet in the permissions lesson. Several names can be given at once. Brace expansion such as {1..5} is done by the shell before touch sees the line, which is why the same trick works with other commands. This lab creates the names you type. It does not expand braces.",
          el: "Το touch gamehack-2.txt δημιουργεί κενό αρχείο όταν το όνομα δεν υπάρχει. Το εργαστήριο απαντά Created virtual file: gamehack-2.txt. Σε πραγματικό σύστημα η ίδια εντολή είναι σιωπηλή, και η αρχική της δουλειά είναι να ενημερώνει τη χρονοσήμανση ενός αρχείου που ήδη υπάρχει. Εργαλεία χτισίματος όπως το make αποφασίζουν αν θα ξαναχτίσουν συγκρίνοντας εκείνες τις χρονοσημάνσεις, οπότε ένα άγγιγμα σε αρχείο πηγής μπορεί να αναγκάσει ξαναχτίσιμο. Αν το όνομα λείπει, το σύστημα το δημιουργεί. Αυτή η παρενέργεια είναι ο λόγος που οι αρχάριοι συναντούν την touch ως τρόπο να φτιάξουν κενό αρχείο.\n\nΗ λειτουργία του νέου αρχείου, συνήθως -rw-r--r--, δεν είναι κάτι που πληκτρολόγησες. Το σύστημα εφάρμοσε το umask, που θα συναντήσεις στο μάθημα δικαιωμάτων. Μπορούν να δοθούν πολλά ονόματα μαζί. Η επέκταση αγκυλών όπως {1..5} γίνεται από το shell πριν δει τη γραμμή η touch, γι' αυτό το ίδιο κόλπο δουλεύει και με άλλες εντολές. Αυτό το εργαστήριο δημιουργεί τα ονόματα που πληκτρολογείς. Δεν επεκτείνει αγκύλες.",
        },
        shots: [shot("touch gamehack-2.txt", ["Created virtual file: gamehack-2.txt"])],
      },
      {
        heading: { en: "mkdir", el: "mkdir" },
        body: {
          en: "mkdir Documents/ignite creates one directory when the parent already exists and the name is free. The lab prints Created virtual directory: Documents/ignite. A real mkdir stays silent, and silence means success. In ls -l a directory starts with d. Its size is the bookkeeping record, not the total of the files inside it.\n\nmkdir -p builds missing parents and does not fail if the directory is already there. That is the form you want in a script. This lab prints Created directory tree: … for that form. Without -p, a missing parent is an error, not a hint to invent the path.",
          el: "Το mkdir Documents/ignite δημιουργεί έναν φάκελο όταν ο γονέας υπάρχει ήδη και το όνομα είναι ελεύθερο. Το εργαστήριο τυπώνει Created virtual directory: Documents/ignite. Μια πραγματική mkdir μένει σιωπηλή, και η σιωπή σημαίνει επιτυχία. Στην ls -l ένας φάκελος αρχίζει με d. Το μέγεθός του είναι η εγγραφή λογιστικής, όχι το άθροισμα των αρχείων μέσα του.\n\nΤο mkdir -p χτίζει τους γονείς που λείπουν και δεν αποτυγχάνει αν ο φάκελος υπάρχει ήδη. Αυτή είναι η μορφή που θέλεις σε ένα script. Αυτό το εργαστήριο τυπώνει Created directory tree: … για εκείνη τη μορφή. Χωρίς -p, ένας γονέας που λείπει είναι σφάλμα, όχι υπόδειξη να επινοήσεις τη διαδρομή.",
        },
        shots: [shot("mkdir Documents/ignite", ["Created virtual directory: Documents/ignite"])],
      },
      {
        heading: { en: "cp, mv, rm, rmdir", el: "cp, mv, rm, rmdir" },
        body: {
          en: "cp source destination copies. The source comes first. A trailing slash, or a destination that is already a directory, places the file inside it. cp gamehack-2.txt Documents/ignite leaves the original in place. This lab confirms the copy in a sentence. A real cp is silent, and it overwrites an existing destination without asking. -i asks first. -r is required to copy a directory, because a directory is a tree, not one file.\n\nmv uses the same source-then-destination order. On the same filesystem a move does not copy the bytes. It changes the name by which the file is reached. mv lab-notes.txt linux-notes.txt is therefore a rename, not a second file. This lab prints Moved … . A real mv is silent and will also overwrite without asking.\n\nrm removes a name. There is no recycle bin. Once the last name is gone, the space can be reused. The shell expands * before rm sees the line, so know your directory before you use a wildcard. rmdir removes a directory only when it is empty, and says so if it is not. rm -r is the recursive form, and it deletes the directory and everything inside it. Print a destructive line with echo in front of it first, read the expanded arguments, and only then remove the echo. Never aim a recursive delete at /.",
          el: "Η cp πηγή προορισμός αντιγράφει. Η πηγή έρχεται πρώτη. Μια τελική κάθετος, ή ένας προορισμός που είναι ήδη φάκελος, βάζει το αρχείο μέσα του. Το cp gamehack-2.txt Documents/ignite αφήνει το πρωτότυπο στη θέση του. Αυτό το εργαστήριο επιβεβαιώνει την αντιγραφή με μια πρόταση. Μια πραγματική cp είναι σιωπηλή, και αντικαθιστά υπάρχοντα προορισμό χωρίς να ρωτήσει. Το -i ρωτά πρώτα. Το -r χρειάζεται για να αντιγράψεις φάκελο, γιατί ένας φάκελος είναι δέντρο, όχι ένα αρχείο.\n\nΗ mv χρησιμοποιεί την ίδια σειρά πηγή-μετά-προορισμός. Στο ίδιο σύστημα αρχείων μια μετακίνηση δεν αντιγράφει τα bytes. Αλλάζει το όνομα με το οποίο φτάνεις το αρχείο. Το mv lab-notes.txt linux-notes.txt είναι λοιπόν μετονομασία, όχι δεύτερο αρχείο. Αυτό το εργαστήριο τυπώνει Moved … . Μια πραγματική mv είναι σιωπηλή και επίσης αντικαθιστά χωρίς να ρωτήσει.\n\nΗ rm αφαιρεί ένα όνομα. Δεν υπάρχει κάδος ανακύκλωσης. Μόλις φύγει το τελευταίο όνομα, ο χώρος μπορεί να ξαναχρησιμοποιηθεί. Το shell επεκτείνει το * πριν δει τη γραμμή η rm, οπότε να ξέρεις τον φάκελό σου πριν χρησιμοποιήσεις μπαλαντέρ. Η rmdir αφαιρεί φάκελο μόνο όταν είναι άδειος, και το λέει αν δεν είναι. Η rm -r είναι η αναδρομική μορφή, και σβήνει τον φάκελο και ό,τι υπάρχει μέσα του. Τύπωσε πρώτα μια καταστροφική γραμμή με echo μπροστά, διάβασε τα επεκταμένα ορίσματα, και μόνο τότε βγάλε το echo. Ποτέ μην στοχεύσεις μια αναδρομική διαγραφή στο /.",
        },
        shots: [
          shot("cp gamehack-2.txt Documents/ignite", ["Copied gamehack-2.txt to Documents/ignite in the virtual filesystem."]),
          shot("rmdir ignite_screenshots/", ["Removed empty virtual directory: ignite_screenshots/"]),
        ],
        tip: { en: "The lab prints a confirmation. A real cp, mv or rm often prints nothing. Silence there means success, not safety.", el: "Το εργαστήριο τυπώνει επιβεβαίωση. Μια πραγματική cp, mv ή rm συχνά δεν τυπώνει τίποτα. Η σιωπή εκεί σημαίνει επιτυχία, όχι ασφάλεια." },
      },
    ],
    cheats: [
      { cmd: "cat gamehack.txt", desc: { en: "print file", el: "εμφάνιση αρχείου" } },
      { cmd: "touch gamehack-2.txt", desc: { en: "create empty file", el: "κενό αρχείο" } },
      { cmd: "mkdir Documents/ignite", desc: { en: "make directory", el: "φάκελος" } },
      { cmd: "cp FILE DIR", desc: { en: "copy", el: "αντιγραφή" } },
      { cmd: "mv SRC DEST", desc: { en: "move/rename", el: "μετακίνηση" } },
      { cmd: "rm FILE", desc: { en: "delete file", el: "διαγραφή" } },
      { cmd: "rmdir DIR", desc: { en: "delete empty dir", el: "διαγραφή κενού φακέλου" } },
    ],
    tasks: [
      {
        id: "cat",
        instruction: { en: "cat gamehack.txt", el: "cat gamehack.txt" },
        hint: { en: "cat /root/gamehack.txt", el: "cat /root/gamehack.txt" },
        explain: { en: "cat concatenates to stdout.", el: "cat στην έξοδο." },
        check: (t) => t.flags.has("cat-gamehack") || usedCmd(t, /cat\s+.*gamehack\.txt/),
      },
      {
        id: "touch",
        instruction: { en: "touch gamehack-2.txt", el: "touch gamehack-2.txt" },
        hint: { en: "touch gamehack-2.txt", el: "touch gamehack-2.txt" },
        explain: { en: "Creates an empty file in the current directory.", el: "Κενό αρχείο εδώ." },
        check: (t) => t.flags.has("touch-gamehack2") || usedCmd(t, /touch\s+.*gamehack-2/),
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
        instruction: { en: "cp gamehack-2.txt Documents/ignite", el: "cp gamehack-2.txt Documents/ignite" },
        hint: { en: "cp gamehack-2.txt Documents/ignite", el: "cp …" },
        explain: { en: "cp <file> <destination>", el: "cp αρχείο προορισμός" },
        check: (t) => t.flags.has("cp") || usedCmd(t, /^\s*cp\b/),
      },
      {
        id: "mv",
        instruction: { en: "Move the copy with mv into /root/Documents/ (from the ignite folder or by path).", el: "Μετακίνησε το αντίγραφο στο /root/Documents/ με mv" },
        hint: { en: "mv Documents/ignite/gamehack-2.txt /root/Documents/", el: "mv … /root/Documents/" },
        explain: { en: "mv moves or renames.", el: "Το mv μετακινεί ή μετονομάζει." },
        check: (t) => t.flags.has("mv") || usedCmd(t, /^\s*mv\b/),
      },
      {
        id: "rm",
        instruction: { en: "rm the leftover gamehack-2.txt (in Documents or home).", el: "rm το gamehack-2.txt" },
        hint: { en: "rm Documents/gamehack-2.txt", el: "rm …" },
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
        title: { en: "Rebuild ignite", el: "Δημιούργησε ξανά το ignite" },
        brief: { en: "If you removed Documents/ignite, mkdir it again. ls Documents to prove it.", el: "Δημιούργησε ξανά τον φάκελο με mkdir και επιβεβαίωσε με ls Documents" },
        success: { en: "You can create on demand.", el: "Δημιουργείς κατ' απαίτηση." },
        check: (t) => t.flags.has("mkdir-ignite") || usedCmd(t, /ls\s+.*Documents/),
      },
      {
        title: { en: "Recursive reminder", el: "Υπενθύμιση -r" },
        brief: { en: "Read the tip: run ls ignite_screenshots or confirm rmdir already succeeded.", el: "Επιβεβαίωσε ότι το rmdir πέτυχε." },
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
    title: { en: "Text manipulation", el: "Χειρισμός κειμένου" },
    subtitle: { en: "head, tail, nl, sed, more, less", el: "head, tail, nl, sed, more, less" },
    badge: { en: "Text Analyst", el: "Αναλυτής κειμένου" },
    theory: [
      {
        heading: { en: "Almost everything is a file", el: "Σχεδόν όλα είναι αρχεία" },
        body: {
          en: "On Linux, configuration, logs, and the tables that name users and hosts are plain text. Learning to read and slice text is how you manage the system. This lesson uses /etc/ettercap/etter.dns, a text fixture already in the sandbox. The same path with a capital E also exists, because Linux paths are case-sensitive and installs disagree. Read it as a file format. Do not use it to misdirect traffic. Doing that on a network you do not administer is illegal, and this lab does not perform it.\n\nA real shell can create a small text file with a here-document: everything between <<'EOF' and a line that says EOF becomes the file. The quotes stop the shell from expanding what is inside. You do not need that here. The fixture is already written, so the commands below have something realistic to slice.",
          el: "Στο Linux, οι ρυθμίσεις, τα αρχεία καταγραφής, και οι πίνακες που ονομάζουν χρήστες και μηχανήματα είναι απλό κείμενο. Το να μάθεις να διαβάζεις και να κόβεις κείμενο είναι ο τρόπος που διαχειρίζεσαι το σύστημα. Αυτό το μάθημα χρησιμοποιεί το /etc/ettercap/etter.dns, ένα έτοιμο αρχείο κειμένου στο sandbox. Η ίδια διαδρομή με κεφαλαίο E υπάρχει επίσης, γιατί οι διαδρομές στο Linux ξεχωρίζουν πεζά και κεφαλαία και οι εγκαταστάσεις διαφωνούν. Διάβασέ το ως μορφή αρχείου. Μην το χρησιμοποιήσεις για να παραπλανήσεις κίνηση. Αυτό σε δίκτυο που δεν διαχειρίζεσαι είναι παράνομο, και αυτό το εργαστήριο δεν το εκτελεί.\n\nΈνα πραγματικό shell μπορεί να δημιουργήσει μικρό αρχείο κειμένου με here-document: ό,τι βρίσκεται ανάμεσα σε <<'EOF' και σε μια γραμμή που λέει EOF γίνεται το αρχείο. Τα εισαγωγικά σταματούν το shell από το να επεκτείνει ό,τι είναι μέσα. Δεν το χρειάζεσαι εδώ. Το αρχείο είναι ήδη γραμμένο, οπότε οι εντολές από κάτω έχουν κάτι ρεαλιστικό να κόψουν.",
        },
      },
      {
        heading: { en: "head & tail", el: "head & tail" },
        body: {
          en: "head FILE shows the first ten lines. That default is useful because a configuration file often starts with a comment that explains the format. tail FILE shows the last ten, which is where a log usually puts the newest event. head -n 3 FILE, or the older head -3 FILE, asks for a different count. This lab honours both forms, up to one hundred lines. The same file lives at /etc/ettercap/etter.dns and /etc/Ettercap/etter.dns.",
          el: "Η head FILE δείχνει τις πρώτες δέκα γραμμές. Εκείνη η προεπιλογή είναι χρήσιμη γιατί ένα αρχείο ρυθμίσεων συχνά αρχίζει με σχόλιο που εξηγεί τη μορφή. Η tail FILE δείχνει τις τελευταίες δέκα, εκεί που ένα αρχείο καταγραφής συνήθως βάζει το νεότερο γεγονός. Το head -n 3 FILE, ή το παλαιότερο head -3 FILE, ζητά διαφορετικό πλήθος. Αυτό το εργαστήριο τιμά και τις δύο μορφές, μέχρι εκατό γραμμές. Το ίδιο αρχείο ζει στο /etc/ettercap/etter.dns και στο /etc/Ettercap/etter.dns.",
        },
        shots: [
          shot("head /etc/ettercap/etter.dns", ["# etter.dns — GameHack lab copy of a DNS spoof config (educational)", "# This file is a TEXT example. Never use spoofing outside a lab you own.", "microsoft.com A 10.10.10.8"]),
          shot("tail /etc/ettercap/etter.dns", ["# operator workstation", "192.168.1.13 ptr kali.gamehack.lab"]),
        ],
      },
      {
        heading: { en: "nl — number lines", el: "nl — αρίθμηση" },
        body: {
          en: "nl FILE prints the file with a line number in front of each line. That is how you turn a vague 'near the top' into a place another person can find. cat -n does a similar job on a real system. In this lab, use nl. wc -l FILE counts the lines instead of printing them, and this lab implements it, so wc -l /etc/ettercap/etter.dns answers with a single number.",
          el: "Η nl FILE τυπώνει το αρχείο με έναν αριθμό γραμμής μπροστά από κάθε γραμμή. Έτσι ένα αόριστο «κοντά στην αρχή» γίνεται σημείο που μπορεί να βρει και άλλος. Το cat -n κάνει παρόμοια δουλειά σε πραγματικό σύστημα. Σε αυτό το εργαστήριο, χρησιμοποίησε nl. Το wc -l FILE μετρά τις γραμμές αντί να τις τυπώνει και αυτό το εργαστήριο το υλοποιεί, οπότε το wc -l /etc/ettercap/etter.dns απαντά με έναν μόνο αριθμό.",
        },
        shots: [shot("nl /etc/ettercap/etter.dns", ["     1  # etter.dns — GameHack lab copy of a DNS spoof config (educational)"])],
      },
      {
        heading: { en: "sed — find & replace", el: "sed — εύρεση & αντικατάσταση" },
        body: {
          en: "sed reads a stream and can substitute text as it prints. s/WWW/www/g means: find WWW, write www, and do it for every match on the line because of g. sed s/WWW/www/g gamehack.in prints the changed lines. It does not edit the file. A real sed changes the file only if you add an in-place option or redirect the output onto a new name. Check the printed result before you ever do that. A substitution that looks right on one line can rewrite a comment you meant to keep.",
          el: "Η sed διαβάζει μια ροή και μπορεί να αντικαταστήσει κείμενο καθώς το τυπώνει. Το s/WWW/www/g σημαίνει: βρες WWW, γράψε www, και κάν' το για κάθε ταίριασμα στη γραμμή λόγω του g. Το sed s/WWW/www/g gamehack.in τυπώνει τις αλλαγμένες γραμμές. Δεν επεξεργάζεται το αρχείο. Μια πραγματική sed αλλάζει το αρχείο μόνο αν προσθέσεις επιλογή επιτόπιας αλλαγής ή ανακατευθύνεις την έξοδο σε νέο όνομα. Έλεγξε το τυπωμένο αποτέλεσμα πριν το κάνεις ποτέ. Μια αντικατάσταση που φαίνεται σωστή σε μία γραμμή μπορεί να ξαναγράψει ένα σχόλιο που ήθελες να κρατήσεις.",
        },
        shots: [shot("sed s/WWW/www/g gamehack.in", ["Visit www.gamehack.lab for the lab portal.", "www banners should be rewritten to www with sed.", "Linux training portal (simulated)."])],
      },
      {
        heading: { en: "more and less", el: "more και less" },
        body: {
          en: "more FILE and less FILE are pagers. On a real terminal they show one screen and wait. Enter or space moves forward. In less, /keyword searches and q quits. less is the one to learn, because you can move backward as well as forward. This lab has no pager keystrokes. Both commands print the file and return to the prompt, so you can practise the names. When a real page is longer than the window, prefer less over cat.",
          el: "Τα more FILE και less FILE είναι σελιδοποιητές. Σε πραγματικό τερματικό δείχνουν μία οθόνη και περιμένουν. Το Enter ή το space προχωρά. Στην less, το /keyword ψάχνει και το q βγαίνει. Η less είναι αυτή που αξίζει να μάθεις, γιατί μπορείς να κινηθείς και προς τα πίσω. Αυτό το εργαστήριο δεν έχει πλήκτρα σελιδοποιητή. Και οι δύο εντολές τυπώνουν το αρχείο και γυρίζουν στο prompt, ώστε να εξασκηθείς στα ονόματα. Όταν μια πραγματική σελίδα είναι μακρύτερη από το παράθυρο, προτίμησε την less από την cat.",
        },
        shots: [shot("more /etc/ettercap/etter.dns", ["# etter.dns — GameHack lab copy …", "(page 1 — Enter would continue on a TTY)"])],
      },
      {
        heading: { en: "wc, sort, uniq and tee", el: "wc, sort, uniq και tee" },
        body: {
          en: "Three more commands complete the basic set. wc counts lines, words, and characters, and wc -l FILE answers the question every operator asks first: how many entries does this list hold. sort orders lines alphabetically or numerically, and uniq collapses adjacent duplicates, which turns a raw stream into a short report. uniq only compares neighbours, so the useful order is almost always sort first and uniq second.\n\nThe chain cut -d' ' -f1 FILE | grep -v '^#' | sort is the characteristic way of working on Linux: cut isolates the first field of every line using the space as the delimiter, grep -v '^#' throws away the comment lines, and sort puts the remaining names in order. Instead of one monolithic program with dozens of options, small tools each do one job well and are connected by pipes. tee belongs to the same family: it shows the output on screen and stores it in a file at the same time, so ifconfig | tee /tmp/net.txt | grep inet keeps the full capture and prints only the address lines.",
          el: "Τρεις επιπλέον εντολές συμπληρώνουν το βασικό σύνολο. Η wc μετρά γραμμές, λέξεις και χαρακτήρες, και το wc -l FILE απαντά στην ερώτηση που κάνει πρώτα κάθε χειριστής: πόσες εγγραφές περιέχει αυτή η λίστα. Η sort ταξινομεί γραμμές αλφαβητικά ή αριθμητικά και η uniq συμπτύσσει συνεχόμενα διπλότυπα, μετατρέποντας μια ακατέργαστη ροή σε σύντομη αναφορά. Η uniq συγκρίνει μόνο γειτονικές γραμμές, οπότε η χρήσιμη σειρά είναι σχεδόν πάντα πρώτα sort και μετά uniq.\n\nΗ αλυσίδα cut -d' ' -f1 FILE | grep -v '^#' | sort είναι ο χαρακτηριστικός τρόπος εργασίας στο Linux: το cut απομονώνει το πρώτο πεδίο κάθε γραμμής με διαχωριστικό το κενό, το grep -v '^#' απορρίπτει τις γραμμές σχολίων και το sort βάζει τα υπόλοιπα ονόματα σε σειρά. Αντί για ένα μονολιθικό πρόγραμμα με δεκάδες επιλογές, μικρά εργαλεία εκτελούν από μία δουλειά άρτια και συνδέονται με σωληνώσεις. Η tee ανήκει στην ίδια οικογένεια: εμφανίζει την έξοδο στην οθόνη και ταυτόχρονα την αποθηκεύει σε αρχείο, οπότε το ifconfig | tee /tmp/net.txt | grep inet κρατά την πλήρη καταγραφή και τυπώνει μόνο τις γραμμές με τις διευθύνσεις.",
        },
        shots: [
          shot("wc -l /etc/ettercap/etter.dns", ["15 /etc/ettercap/etter.dns"]),
          shot("cut -d' ' -f1 /etc/ettercap/etter.dns | grep -v '^#' | sort", ["*.gamehack.lab", "*.microsoft.com", "192.168.1.13", "gamehack.lab", "mail.gamehack.lab", "microsoft.com", "operator"]),
        ],
      },
    ],
    cheats: [
      { cmd: "head FILE", desc: { en: "first 10 lines", el: "πρώτες 10" } },
      { cmd: "tail FILE", desc: { en: "last 10 lines", el: "τελευταίες 10" } },
      { cmd: "nl FILE", desc: { en: "number lines", el: "αρίθμηση" } },
      { cmd: "sed s/A/B/g FILE", desc: { en: "replace A with B", el: "αντικατάσταση" } },
      { cmd: "more FILE", desc: { en: "page through", el: "σελίδες" } },
      { cmd: "less FILE", desc: { en: "page + search", el: "σελίδες + αναζήτηση" } },
      { cmd: "wc -l FILE", desc: { en: "count lines", el: "μέτρηση γραμμών" } },
      { cmd: "sort FILE", desc: { en: "order lines", el: "ταξινόμηση" } },
      { cmd: "sort FILE | uniq", desc: { en: "collapse duplicates", el: "διπλότυπα" } },
      { cmd: "cut -d' ' -f1 FILE | sort", desc: { en: "first field, ordered", el: "πρώτο πεδίο, ταξινομημένο" } },
      { cmd: "CMD | tee FILE", desc: { en: "show and save at once", el: "προβολή και αποθήκευση" } },
    ],
    tasks: [
      {
        id: "head",
        instruction: { en: "head /etc/ettercap/etter.dns", el: "head /etc/ettercap/etter.dns" },
        hint: { en: "head /etc/ettercap/etter.dns", el: "head …" },
        explain: { en: "First ten lines.", el: "Εμφανίζει τις πρώτες δέκα γραμμές." },
        check: (t) => usedCmd(t, /^\s*head\b/) || t.flags.has("etter"),
      },
      {
        id: "tail",
        instruction: { en: "tail /etc/ettercap/etter.dns", el: "tail /etc/ettercap/etter.dns" },
        hint: { en: "tail /etc/ettercap/etter.dns", el: "tail …" },
        explain: { en: "Last ten lines.", el: "Εμφανίζει τις τελευταίες δέκα γραμμές." },
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
        instruction: { en: "sed s/WWW/www/g gamehack.in", el: "sed s/WWW/www/g gamehack.in" },
        hint: { en: "sed s/WWW/www/g /root/gamehack.in", el: "sed s/WWW/www/g /root/gamehack.in" },
        explain: { en: "/g = replace every occurrence.", el: "Το /g εφαρμόζει την αντικατάσταση σε όλες τις εμφανίσεις." },
        check: (t) => t.flags.has("sed-www") || usedCmd(t, /sed\s+s\/WWW\/www/),
      },
      {
        id: "more",
        instruction: { en: "more /etc/ettercap/etter.dns", el: "more /etc/ettercap/etter.dns" },
        hint: { en: "more /etc/ettercap/etter.dns", el: "more …" },
        explain: { en: "Pager.", el: "Σελιδοποιητής (pager)." },
        check: (t) => usedCmd(t, /^\s*more\b/),
      },
      {
        id: "wc-count",
        instruction: { en: "Count the entries in the fixture: wc -l /etc/ettercap/etter.dns", el: "Μέτρα τις εγγραφές του fixture: wc -l /etc/ettercap/etter.dns" },
        hint: { en: "wc -l /etc/ettercap/etter.dns", el: "wc -l /etc/ettercap/etter.dns" },
        explain: { en: "A single number answers 'how big is this list' faster than reading it.", el: "Ένας αριθμός απαντά στο «πόσο μεγάλη είναι η λίστα» πιο γρήγορα από την ανάγνωση." },
        check: (t) => usedCmd(t, /wc\s+-l/),
      },
      {
        id: "sort-uniq",
        instruction: { en: "Order the local host table and collapse duplicates: sort /etc/hosts | uniq", el: "Ταξινόμησε τον τοπικό πίνακα host και σύμπτυξε τα διπλότυπα: sort /etc/hosts | uniq" },
        hint: { en: "sort /etc/hosts | uniq", el: "sort /etc/hosts | uniq" },
        explain: { en: "uniq only compares neighbours, so sorting first is what makes it useful.", el: "Η uniq συγκρίνει μόνο γειτονικές γραμμές, γι' αυτό η ταξινόμηση πρώτα είναι αυτή που την κάνει χρήσιμη." },
        check: (t) => usedCmd(t, /sort\s+\/etc\/hosts/) && usedCmd(t, /uniq/),
      },
      {
        id: "cut-sort-chain",
        instruction: { en: "Keep only the first field of the fixture, drop the comments, and order the names.", el: "Κράτα μόνο το πρώτο πεδίο του fixture, απόρριψε τα σχόλια και ταξινόμησε τα ονόματα." },
        hint: { en: "cut -d' ' -f1 /etc/ettercap/etter.dns | grep -v '^#' | sort", el: "cut -d' ' -f1 /etc/ettercap/etter.dns | grep -v '^#' | sort" },
        explain: { en: "One job per tool, connected by pipes: field, filter, order.", el: "Μία δουλειά ανά εργαλείο, συνδεδεμένες με σωληνώσεις: πεδίο, φίλτρο, σειρά." },
        check: (t) => usedCmd(t, /cut\s+-d/) && usedCmd(t, /grep\s+-v/) && usedCmd(t, /sort/),
      },
      {
        id: "tee-capture",
        instruction: { en: "Keep the interface capture and print only the address lines: ifconfig | tee /tmp/net.txt | grep inet", el: "Κράτα την καταγραφή διεπαφών και τύπωσε μόνο τις γραμμές διευθύνσεων: ifconfig | tee /tmp/net.txt | grep inet" },
        hint: { en: "ifconfig | tee /tmp/net.txt | grep inet", el: "ifconfig | tee /tmp/net.txt | grep inet" },
        explain: { en: "tee writes the whole stream to a file while the rest of the pipeline filters what you see.", el: "Η tee γράφει ολόκληρη τη ροή σε αρχείο ενώ το υπόλοιπο pipeline φιλτράρει ό,τι βλέπεις." },
        check: (t) => usedCmd(t, /tee\s+\/tmp\/net\.txt/),
      },
      {
        id: "less",
        instruction: { en: "less /etc/ettercap/etter.dns", el: "less /etc/ettercap/etter.dns" },
        hint: { en: "less /etc/ettercap/etter.dns", el: "less …" },
        explain: { en: "less can search with / in a real TTY.", el: "Σε πραγματικό τερματικό (TTY), η less αναζητά με /." },
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
        brief: { en: "Re-run sed so WWW becomes www on gamehack.in", el: "Ξανά sed στο gamehack.in" },
        success: { en: "Substitution is non-destructive unless you redirect.", el: "Χωρίς redirect δεν αλλάζει το αρχείο." },
        check: (t) => t.flags.has("sed"),
      },
    ],
  },
];

export const SUDO_RUN_ALL: Module[] = [...SUDO_RUN_MODULES, ...SUDO_RUN_MODULES_B, ...SUDO_RUN_MODULES_C];
