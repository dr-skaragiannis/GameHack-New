import type { Module } from "./lessons";
import { getNode, sawOutput, usedCmd } from "../lib/terminal";
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
        explain: { en: "Why: every relative path you type resolves against this one directory, so acting before you know where you are is how files end up in the wrong place. How: pwd asks the kernel for the current working directory of your shell process and prints it as an absolute path. That string is the base the shell prepends to anything you type without a leading slash.", el: "Γιατί: κάθε σχετική διαδρομή που πληκτρολογείς επιλύεται ως προς αυτόν τον κατάλογο, οπότε το να ενεργείς πριν ξέρεις πού βρίσκεσαι είναι ο τρόπος που αρχεία καταλήγουν σε λάθος θέση. Πώς: η pwd ζητά από τον πυρήνα τον τρέχοντα κατάλογο εργασίας της διεργασίας του shell σου και τον εμφανίζει ως απόλυτη διαδρομή. Αυτή η συμβολοσειρά είναι η βάση που το shell προθέτει σε ό,τι γράφεις χωρίς αρχική κάθετο." },
        material: { en: "Practice: run pwd, cd into /etc, run pwd again, then cd - to return. The shell remembers the previous directory in $OLDPWD.", el: "Εξάσκηση: τρέξε pwd, μπες στο /etc, ξανατρέξε pwd και μετά cd - για να γυρίσεις πίσω. Το shell θυμάται τον προηγούμενο κατάλογο στη μεταβλητή $OLDPWD." },
        check: (t) => t.flags.has("pwd") || usedCmd(t, /^\s*pwd\b/),
      },
      {
        id: "whoami",
        instruction: { en: "Run whoami and confirm you are root.", el: "Εκτέλεσε whoami και επιβεβαίωσε ότι είσαι root." },
        hint: { en: "whoami", el: "whoami" },
        explain: { en: "Why: the account you are running as decides the blast radius of every mistake, so identity comes before action. How: whoami prints the effective user name behind your current shell. If it answers root, every command you run next is unrestricted and irreversible; the # at the end of the prompt is the same warning in symbolic form.", el: "Γιατί: ο λογαριασμός με τον οποίο εκτελείς καθορίζει την έκταση της ζημιάς κάθε λάθους, οπότε η ταυτότητα προηγείται της ενέργειας. Πώς: η whoami εμφανίζει το ενεργό όνομα χρήστη πίσω από το τρέχον shell σου. Αν απαντήσει root, κάθε εντολή που θα τρέξεις στη συνέχεια είναι απεριόριστη και μη αναστρέψιμη· το # στο τέλος του prompt είναι η ίδια προειδοποίηση σε συμβολική μορφή." },
        material: { en: "Compare whoami with id -u: the first gives a name, the second the numeric UID, and a UID of 0 always means root.", el: "Σύγκρινε την whoami με την id -u: η πρώτη δίνει όνομα, η δεύτερη το αριθμητικό UID, και το UID 0 σημαίνει πάντα root." },
        check: (t) => t.flags.has("whoami"),
      },
      {
        id: "cd",
        instruction: { en: "cd into Desktop.", el: "Μετακινήσου στο Desktop με cd." },
        hint: { en: "cd Desktop", el: "cd Desktop" },
        explain: { en: "Why: navigation is how you narrow the scope of everything that follows, and a relative move depends entirely on where you already stand. How: cd changes the working directory of the current shell without starting a new process. A bare name moves relative to where you are, a leading slash starts from the root, and cd with no argument returns you to your home directory.", el: "Γιατί: η πλοήγηση είναι ο τρόπος να στενεύεις το πεδίο όσων ακολουθούν, και μια σχετική μετακίνηση εξαρτάται απόλυτα από το πού στέκεσαι ήδη. Πώς: η cd αλλάζει τον κατάλογο εργασίας του τρέχοντος shell χωρίς να ξεκινά νέα διεργασία. Ένα σκέτο όνομα κινείται σχετικά ως προς τη θέση σου, μια αρχική κάθετος ξεκινά από τη ρίζα, και η cd χωρίς όρισμα σε επιστρέφει στον προσωπικό σου κατάλογο." },
        material: { en: "Three shortcuts worth memorising: cd - returns to the previous directory, plain cd goes home, and . and .. mean here and one level up.", el: "Τρεις συντομεύσεις που αξίζει να απομνημονεύσεις: η cd - επιστρέφει στον προηγούμενο κατάλογο, η σκέτη cd πάει στον προσωπικό κατάλογο, και τα . και .. σημαίνουν εδώ και ένα επίπεδο πάνω." },
        check: (t) => t.flags.has("cd-desktop") || usedCmd(t, /^\s*cd\s+Desktop/),
      },
      {
        id: "ls",
        instruction: { en: "List the Desktop with ls.", el: "Εμφάνισε τα περιεχόμενα του Desktop με ls." },
        hint: { en: "ls", el: "ls" },
        explain: { en: "Why: you cannot reason about a system you cannot see, and listing is the cheapest way to turn an assumption into an observation. How: ls reads a directory and prints the names it holds. The -l form adds permissions, owner, group, size and timestamp on one line per entry, and -a includes the dot-prefixed entries where configuration files hide.", el: "Γιατί: δεν μπορείς να συλλογιστείς για ένα σύστημα που δεν βλέπεις, και η παράθεση είναι ο φθηνότερος τρόπος να μετατρέψεις μια υπόθεση σε παρατήρηση. Πώς: η ls διαβάζει έναν κατάλογο και εμφανίζει τα ονόματα που κρατά. Η μορφή -l προσθέτει δικαιώματα, ιδιοκτήτη, ομάδα, μέγεθος και χρονική σήμανση σε μία γραμμή ανά στοιχείο, και η -a συμπεριλαμβάνει τις εγγραφές με αρχική τελεία όπου κρύβονται αρχεία ρυθμίσεων." },
        material: { en: "Combine flags instead of choosing between them: ls -la sorts, shows hidden entries and prints one per line, the form most reports expect.", el: "Συνδύασε παραμέτρους αντί να διαλέγεις ανάμεσά τους: η ls -la ταξινομεί, εμφανίζει κρυφές εγγραφές και τυπώνει μία ανά γραμμή, τη μορφή που περιμένουν οι περισσότερες αναφορές." },
        check: (t) => t.flags.has("ls"),
      },
    ],
    challenges: [
      {
        title: { en: "Home again", el: "Πίσω στο home" },
        brief: { en: "Move back to the administrative home with cd ~ or cd /root, then run pwd and read the path it prints. The habit is the point: after every move, confirm where you actually landed instead of assuming it.", el: "Γύρνα πίσω στον διαχειριστικό προσωπικό κατάλογο με cd ~ ή cd /root και μετά τρέξε pwd και διάβασε τη διαδρομή που τυπώνει. Η συνήθεια είναι το ζητούμενο: μετά από κάθε μετακίνηση, επιβεβαίωσε πού πραγματικά βρέθηκες αντί να το υποθέσεις." },
        success: { en: "You can move and know where you landed.", el: "Γνωρίζεις πλέον πού βρίσκεσαι." },
        check: (t) => usedCmd(t, /^\s*cd\s+(\/root|~)\s*$/) || t.cwd === "/root",
      },
      {
        title: { en: "Read the desktop CTF note", el: "Διάβασε το CTF note" },
        brief: { en: "Open the note left on the simulated desktop: cat Desktop/CTF-notes.txt from /root, or cat CTF-notes.txt if you already moved into Desktop. Read it before you continue, because this is the kind of file that decides what a lab expects from you.", el: "Άνοιξε τη σημείωση που αφήθηκε στην εικονική επιφάνεια εργασίας: cat Desktop/CTF-notes.txt από το /root, ή cat CTF-notes.txt αν έχεις ήδη μπει στο Desktop. Διάβασέ την πριν συνεχίσεις, γιατί είναι το είδος αρχείου που καθορίζει τι περιμένει από εσένα ένα εργαστήριο." },
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
          en: "man COMMAND is the command you type. On a real terminal, q leaves the page and /word searches inside it. This lab prints the page and returns to the prompt, so there is no pager to quit. The useful habit is the same: read NAME and SYNOPSIS before you invent flags. A synopsis in square brackets is optional. Words in capitals are placeholders you replace. A flag you did not see in the synopsis is a guess, and guesses on a destructive command are how people delete the wrong tree.\n\nA manual page has a fixed shape, and learning it saves time on every command you meet. NAME says what the tool is in one line. SYNOPSIS is the grammar: brackets mean optional, capitals mean you substitute your own value, and three dots mean repeatable. DESCRIPTION explains behaviour, OPTIONS lists every flag, and EXAMPLES, when it exists, is the fastest way in. Reading SYNOPSIS first tells you whether the command can even do what you intend before you experiment on real data.",
          el: "Το man COMMAND είναι η εντολή που πληκτρολογείς. Σε πραγματικό τερματικό, το q φεύγει από τη σελίδα και το /word ψάχνει μέσα της. Αυτό το εργαστήριο τυπώνει τη σελίδα και γυρίζει στο prompt, οπότε δεν υπάρχει pager για να κλείσεις. Η χρήσιμη συνήθεια είναι η ίδια: διάβασε NAME και SYNOPSIS πριν επινοήσεις επιλογές. Μια σύνοψη σε αγκύλες είναι προαιρετική. Οι λέξεις με κεφαλαία είναι θέσεις που αντικαθιστάς. Μια επιλογή που δεν είδες στη σύνοψη είναι εικασία, και οι εικασίες σε καταστροφική εντολή είναι ο τρόπος που σβήνει κανείς λάθος δέντρο.\n\nΜια σελίδα εγχειριδίου έχει σταθερή δομή, και μαθαίνοντάς την κερδίζεις χρόνο σε κάθε εντολή που συναντάς. Το NAME λέει τι είναι το εργαλείο σε μία γραμμή. Το SYNOPSIS είναι η γραμματική: οι αγκύλες σημαίνουν προαιρετικό, τα κεφαλαία σημαίνουν ότι αντικαθιστάς με δική σου τιμή, και οι τρεις τελείες σημαίνουν επανάληψη. Το DESCRIPTION εξηγεί τη συμπεριφορά, το OPTIONS παραθέτει κάθε flag, και το EXAMPLES, όταν υπάρχει, είναι ο γρηγορότερος δρόμος. Διαβάζοντας πρώτα το SYNOPSIS μαθαίνεις αν η εντολή μπορεί καν να κάνει αυτό που θέλεις, πριν πειραματιστείς σε πραγματικά δεδομένα.",
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
      { cmd: "type ls", desc: { en: "builtin, alias or real file?", el: "ενσωματωμένη, ψευδώνυμο ή αρχείο;" } },
    ],
    tasks: [
      {
        id: "vol",
        instruction: { en: "Run volatility --help", el: "Εκτέλεσε volatility --help" },
        hint: { en: "volatility --help", el: "volatility --help" },
        explain: { en: "Why: nobody memorises every flag of every tool, so knowing how a tool documents itself is a skill that pays immediately. How: appending --help makes almost any tool print its own short usage summary to standard output and exit. It needs no manual database and no network, which is what makes it the fastest check available before you guess at a flag.", el: "Γιατί: κανείς δεν απομνημονεύει κάθε παράμετρο κάθε εργαλείου, οπότε το να ξέρεις πώς ένα εργαλείο αυτοτεκμηριώνεται είναι δεξιότητα που αποδίδει αμέσως. Πώς: προσθέτοντας --help σχεδόν κάθε εργαλείο εμφανίζει τη δική του σύντομη σύνοψη χρήσης στην standard output και τερματίζει. Δεν χρειάζεται βάση εγχειριδίων ούτε δίκτυο, που είναι αυτό που την κάνει τον γρηγορότερο διαθέσιμο έλεγχο πριν μαντέψεις μια παράμετρο." },
        material: { en: "Not every tool honours --help; some use -h and a few print usage only when given no arguments. Try all three before giving up.", el: "Δεν τηρεί κάθε εργαλείο την --help· κάποια χρησιμοποιούν -h και μερικά εμφανίζουν χρήση μόνο όταν δεν τους δώσεις όρισμα. Δοκίμασε και τα τρία πριν τα παρατήσεις." },
        check: (t) => sawOutput(t, /^\s*volatility\b/, /Volatility Framework|-h, --help/),
      },
      {
        id: "man",
        instruction: { en: "Open the manual for ls: man ls", el: "man ls" },
        hint: { en: "man ls", el: "man ls" },
        explain: { en: "Why: --help tells you a flag exists; the manual tells you what it actually changes, which is the difference between guessing and deciding. How: man renders the tool manual page through a pager. Sections are numbered, so man 5 passwd reads the file-format page while man 1 passwd reads the command page; the same name can point at two different documents.", el: "Γιατί: η --help σου λέει ότι μια παράμετρος υπάρχει· το εγχειρίδιο σου λέει τι ακριβώς αλλάζει, που είναι η διαφορά μεταξύ του να μαντεύεις και του να αποφασίζεις. Πώς: η man στοιχειοθετεί τη σελίδα εγχειριδίου του εργαλείου μέσα από σελιδοποιητή. Οι ενότητες είναι αριθμημένες, οπότε η man 5 passwd διαβάζει τη σελίδα μορφής αρχείου ενώ η man 1 passwd τη σελίδα εντολής· το ίδιο όνομα μπορεί να δείχνει σε δύο διαφορετικά έγγραφα." },
        material: { en: "Sections: 1 commands, 5 file formats, 8 system administration. man -k KEYWORD searches descriptions across all of them, like a local search engine.", el: "Ενότητες: 1 εντολές, 5 μορφές αρχείων, 8 διαχείριση συστήματος. Η man -k ΛΕΞΗ ψάχνει τις περιγραφές σε όλες τους, σαν τοπική μηχανή αναζήτησης." },
        check: (t) => t.flags.has("man-ls") || usedCmd(t, /man\s+ls/),
      },
      {
        id: "locate",
        instruction: { en: "locate CTF (optionally | more)", el: "locate CTF" },
        hint: { en: "locate CTF | more", el: "locate CTF | more" },
        explain: { en: "Why: searching a whole filesystem by name with find is slow, and often a name is all you have to go on. How: locate matches your keyword against a prebuilt filename index and prints every path containing it. On a real host that index refreshes daily, so a file created minutes ago may be missing; here the lab walks the virtual tree directly.", el: "Γιατί: η αναζήτηση σε ολόκληρο το σύστημα αρχείων με όνομα μέσω find είναι αργή, και συχνά ένα όνομα είναι το μόνο που έχεις για να προχωρήσεις. Πώς: η locate ταιριάζει τη λέξη-κλειδί σου απέναντι σε ένα προκατασκευασμένο ευρετήριο ονομάτων και εμφανίζει κάθε διαδρομή που την περιέχει. Σε πραγματικό host το ευρετήριο ανανεώνεται καθημερινά, οπότε ένα αρχείο που δημιουργήθηκε πριν λίγα λεπτά μπορεί να λείπει· εδώ το εργαστήριο διασχίζει απευθείας το εικονικό δέντρο." },
        material: { en: "When locate returns nothing for a file you just created, run updatedb to rebuild the index, or fall back to find, which walks the live tree.", el: "Όταν η locate δεν επιστρέφει τίποτα για ένα αρχείο που μόλις δημιούργησες, τρέξε updatedb για να ξαναχτίσεις το ευρετήριο, ή χρησιμοποίησε την find που διασχίζει το ζωντανό δέντρο." },
        check: (t) => t.flags.has("locate-ctf") || sawOutput(t, /locate\s+CTF/, /CTF/),
      },
      {
        id: "whereis",
        instruction: { en: "whereis git", el: "whereis git" },
        hint: { en: "whereis git", el: "whereis git" },
        explain: { en: "Why: a tool you can invoke and a tool you can read about are two different facts, and troubleshooting starts by knowing which one is missing. How: whereis reports the binary path, the source path when present, and the manual page for a name in one line. An empty manual field means the package installed without documentation, which is common on minimal installs.", el: "Γιατί: ένα εργαλείο που μπορείς να καλέσεις και ένα εργαλείο για το οποίο μπορείς να διαβάσεις είναι δύο διαφορετικά γεγονότα, και η αντιμετώπιση προβλημάτων αρχίζει γνωρίζοντας ποιο από τα δύο λείπει. Πώς: η whereis αναφέρει σε μία γραμμή τη διαδρομή του binary, τη διαδρομή του πηγαίου κώδικα όταν υπάρχει, και τη σελίδα εγχειριδίου για ένα όνομα. Ένα κενό πεδίο εγχειριδίου σημαίνει ότι το πακέτο εγκαταστάθηκε χωρίς τεκμηρίωση, κάτι συνηθισμένο σε λιτές εγκαταστάσεις." },
        material: { en: "whereis answers which parts of a tool exist on this machine, which is the right question when a command works but its documentation does not.", el: "Η whereis απαντά στο ποια μέρη ενός εργαλείου υπάρχουν σε αυτό το μηχάνημα, που είναι η σωστή ερώτηση όταν μια εντολή δουλεύει αλλά η τεκμηρίωσή της όχι." },
        check: (t) => t.flags.has("whereis-git") || usedCmd(t, /whereis\s+git/),
      },
      {
        id: "which",
        instruction: { en: "which git", el: "which git" },
        hint: { en: "which git", el: "which git" },
        explain: { en: "Why: when two copies of a tool exist, the one that runs is decided by search order, not by the one you meant. How: which walks $PATH from left to right and prints the first executable matching the name. That answer is exactly what your shell will run, so a surprising path here explains a surprising version there.", el: "Γιατί: όταν υπάρχουν δύο αντίγραφα ενός εργαλείου, αυτό που εκτελείται κρίνεται από τη σειρά αναζήτησης και όχι από αυτό που εννοούσες. Πώς: η which διασχίζει το $PATH από αριστερά προς τα δεξιά και εμφανίζει το πρώτο εκτελέσιμο που ταιριάζει στο όνομα. Αυτή η απάντηση είναι ακριβώς ό,τι θα εκτελέσει το shell σου, οπότε μια απροσδόκητη διαδρομή εδώ εξηγεί μια απροσδόκητη έκδοση εκεί." },
        material: { en: "which searches $PATH while type asks the shell directly and also reports builtins and aliases. When a version surprises you, run both.", el: "Η which ψάχνει στο $PATH ενώ η type ρωτά απευθείας το shell και αναφέρει επίσης ενσωματωμένες εντολές και ψευδώνυμα. Όταν μια έκδοση σε ξαφνιάζει, τρέξε και τις δύο." },
        check: (t) => t.flags.has("which-git") || usedCmd(t, /which\s+git/),
      },
      {
        id: "type",
        instruction: { en: "Ask the shell itself how it resolves a name: type ls", el: "Ρώτα το ίδιο το shell πώς επιλύει ένα όνομα: type ls" },
        hint: { en: "type ls", el: "type ls" },
        explain: { en: "Why: which only searches $PATH, so it cannot tell you that a name is really a shell builtin or an alias, and that distinction decides what actually runs. How: type asks the shell to report its own resolution for a name, so it answers for builtins, aliases and functions as well as for real files on disk. Reach for it when a command behaves unlike the binary you just inspected.", el: "Γιατί: η which ψάχνει μόνο στο $PATH, οπότε δεν μπορεί να σου πει ότι ένα όνομα είναι στην πραγματικότητα ενσωματωμένη εντολή του shell ή ψευδώνυμο, και αυτή η διάκριση κρίνει τι εκτελείται πραγματικά. Πώς: η type ζητά από το shell να αναφέρει τη δική του επίλυση για ένα όνομα, οπότε απαντά και για ενσωματωμένες εντολές, ψευδώνυμα και συναρτήσεις εκτός από πραγματικά αρχεία στον δίσκο. Χρησιμοποίησέ την όταν μια εντολή συμπεριφέρεται διαφορετικά από το binary που μόλις επιθεώρησες." },
        material: { en: "Compare the three side by side: which git, whereis git and type git. They disagree precisely when a name is a builtin or an alias rather than a file.", el: "Σύγκρινε τις τρεις δίπλα-δίπλα: which git, whereis git και type git. Διαφωνούν ακριβώς όταν ένα όνομα είναι ενσωματωμένη εντολή ή ψευδώνυμο και όχι αρχείο." },
        check: (t) => usedCmd(t, /^\s*type\s+\w+/),
      },
    ],
    challenges: [
      {
        title: { en: "Page the locate dump", el: "Σελιδοποίησε το locate" },
        brief: { en: "Pipe a keyword search into a pager so a long result stops scrolling past you: locate CTF | more. Watch the output wait for you instead of vanishing, and notice that the pipe is what joins the two tools.", el: "Σωλήνωσε μια αναζήτηση λέξης-κλειδιού σε σελιδοποιητή ώστε ένα μεγάλο αποτέλεσμα να σταματήσει να κυλά από μπροστά σου: locate CTF | more. Δες την έξοδο να σε περιμένει αντί να χάνεται, και πρόσεξε ότι η σωλήνωση είναι αυτή που ενώνει τα δύο εργαλεία." },
        success: { en: "You combined locate with a pager.", el: "Συνδύασες locate με pager." },
        check: (t) => usedCmd(t, /locate.*\|/) || t.flags.has("pipe"),
      },
      {
        title: { en: "Read git's man file path", el: "Δες το man του git" },
        brief: { en: "whereis told you where the manual page lives on disk; now read that file directly with cat /usr/share/man/man1/git.1. Comparing the rendered page with the raw file shows what a manual page actually is underneath.", el: "Το whereis σου είπε πού βρίσκεται η σελίδα εγχειριδίου στον δίσκο· τώρα διάβασε το ίδιο το αρχείο με cat /usr/share/man/man1/git.1. Συγκρίνοντας τη στοιχειοθετημένη σελίδα με το ακατέργαστο αρχείο βλέπεις τι είναι πραγματικά μια σελίδα εγχειριδίου από κάτω." },
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
      { cmd: 'grep -n "Accepted" /var/log/auth.log', desc: { en: "line numbers make a finding citable", el: "οι αριθμοί γραμμής κάνουν ένα εύρημα παραπέμψιμο" } },
      { cmd: 'grep -c "Accepted" /var/log/auth.log', desc: { en: "count matches instead of eyeballing them", el: "μέτρα τα ευρήματα αντί να τα εκτιμάς με το μάτι" } },
      { cmd: 'grep -v "sshd" /var/log/auth.log', desc: { en: "invert: keep everything except these lines", el: "αντιστροφή: κράτα τα πάντα εκτός από αυτές τις γραμμές" } },
      { cmd: 'grep -nE "[0-9]{2}:[0-9]{2}" /var/log/auth.log', desc: { en: "regular expression: find the timestamps", el: "κανονική έκφραση: βρες τις χρονοσημάνσεις" } },
      { cmd: "ifconfig | grep inet", desc: { en: "filter command output", el: "φίλτρο εξόδου" } },
      { cmd: "find / -type f -name gamehack", desc: { en: "hunt by name", el: "κυνήγι ονόματος" } },
      { cmd: 'find /root -type f -name "*.txt"', desc: { en: "a whole family of files by pattern", el: "ολόκληρη οικογένεια αρχείων με μοτίβο" } },
      { cmd: "find / -type d -name Documents", desc: { en: "directories only", el: "μόνο κατάλογοι" } },
      { cmd: "find /home/operator -perm 600", desc: { en: "hunt by permission instead of name", el: "κυνήγι με δικαιώματα αντί για όνομα" } },
    ],
    tasks: [
      {
        id: "grep-file",
        instruction: { en: 'grep -i "echo" simple_bash.sh', el: 'grep -i "echo" simple_bash.sh' },
        hint: { en: 'grep -i "echo" simple_bash.sh', el: 'grep -i "echo" simple_bash.sh' },
        explain: { en: "Why: a configuration file is mostly noise, and the line that decides behaviour is usually one line long. How: grep PATTERN FILE prints every line of that file matching the pattern and leaves the file untouched. It reads and never writes, which is why it is safe to run against anything, including files you are forbidden to modify.", el: "Γιατί: ένα αρχείο ρυθμίσεων είναι ως επί το πλείστον θόρυβος, και η γραμμή που κρίνει τη συμπεριφορά είναι συνήθως μία και μόνη γραμμή. Πώς: η grep ΜΟΤΙΒΟ ΑΡΧΕΙΟ εμφανίζει κάθε γραμμή του αρχείου που ταιριάζει στο μοτίβο και αφήνει το αρχείο ανέπαφο. Διαβάζει και ποτέ δεν γράφει, γι' αυτό είναι ασφαλές να τρέχει οπουδήποτε, ακόμα και σε αρχεία που απαγορεύεται να τροποποιήσεις." },
        material: { en: "Useful grep flags: -i ignores case, -n prints line numbers, -v inverts the match, -r recurses and -c counts instead of printing.", el: "Χρήσιμες παράμετροι της grep: η -i αγνοεί τα κεφαλαία, η -n εμφανίζει αριθμούς γραμμών, η -v αντιστρέφει το ταίριασμα, η -r αναζητά αναδρομικά και η -c μετρά αντί να εμφανίζει." },
        check: (t) => t.flags.has("grep-echo") || usedCmd(t, /grep.*echo/),
      },
      {
        id: "grep-pipe",
        instruction: { en: "ifconfig | grep inet", el: "ifconfig | grep inet" },
        hint: { en: "ifconfig | grep inet", el: "ifconfig | grep inet" },
        explain: { en: "Why: the output you care about is usually a small part of a much larger stream, and reading all of it hides the signal. How: placing grep at the end of a pipe makes it filter standard input instead of a file, so command | grep PATTERN keeps only the matching lines of whatever the previous stage produced. The earlier command still runs in full.", el: "Γιατί: η έξοδος που σε ενδιαφέρει είναι συνήθως μικρό μέρος μιας πολύ μεγαλύτερης ροής, και η ανάγνωση ολόκληρης κρύβει το σήμα. Πώς: τοποθετώντας την grep στο τέλος μιας διαδοχής την κάνεις να φιλτράρει την standard input αντί για αρχείο, οπότε η εντολή | grep ΜΟΤΙΒΟ κρατά μόνο τις γραμμές που ταιριάζουν από ό,τι παρήγαγε το προηγούμενο στάδιο. Η προηγούμενη εντολή εκτελείται κανονικά στο σύνολό της." },
        material: { en: "A pipeline is not a loop: every stage runs at the same time and streams, which is why grep can start filtering before the producer finishes.", el: "Μια διαδοχή δεν είναι βρόχος: κάθε στάδιο τρέχει ταυτόχρονα και ρέει, γι' αυτό η grep μπορεί να αρχίσει το φιλτράρισμα πριν ο παραγωγός ολοκληρώσει." },
        check: (t) => t.flags.has("grep-inet") || usedCmd(t, /ifconfig\s*\|\s*grep/),
      },
      {
        id: "find",
        instruction: { en: "find / -type f -name gamehack", el: "find / -type f -name gamehack" },
        hint: { en: "find / -type f -name gamehack", el: "find / -type f -name gamehack" },
        explain: { en: "Why: you often know what you are looking for but not where it is, and guessing paths wastes the session. How: find walks a directory tree from the path you give it and tests each entry, so find / -type f -name PATTERN searches the whole filesystem for regular files matching that name. The starting path decides the scope, and it is the first thing worth narrowing.", el: "Γιατί: συχνά ξέρεις τι ψάχνεις αλλά όχι πού βρίσκεται, και το να μαντεύεις διαδρομές σπαταλά τη συνεδρία. Πώς: η find διασχίζει ένα δέντρο καταλόγων από τη διαδρομή που της δίνεις και ελέγχει κάθε στοιχείο, οπότε η find / -type f -name ΜΟΤΙΒΟ ψάχνει σε ολόκληρο το σύστημα αρχείων για κανονικά αρχεία που ταιριάζουν στο όνομα. Η αρχική διαδρομή καθορίζει το πεδίο και είναι το πρώτο πράγμα που αξίζει να στενέψεις." },
        material: { en: "Common tests: -name PATTERN, -type f or d, -size +10M, -newer FILE and -perm MODE. Combine them with -exec to act on every match.", el: "Συνηθισμένοι έλεγχοι: -name ΜΟΤΙΒΟ, -type f ή d, -size +10M, -newer ΑΡΧΕΙΟ και -perm ΚΑΤΑΣΤΑΣΗ. Συνδύασέ τους με -exec για να δράσεις σε κάθε ταίριασμα." },
        check: (t) =>
          t.flags.has("find-gamehack") ||
          sawOutput(t, /find\s+\S+\s+-type\s+f\s+-name\s+\S*gamehack/, /gamehack/),
      },
    ],
    challenges: [
      {
        title: { en: "Silence permission denied", el: "Σίγαση permission denied" },
        brief: { en: "Search the whole filesystem for the marker and keep the error stream out of your results: find / -type f -name gamehack 2>&1 | grep -v \"Permission Denied\". Redirecting and then filtering is what turns a noisy sweep into a readable answer.", el: "Ψάξε σε όλο το σύστημα αρχείων για τον δείκτη και κράτα τη ροή σφαλμάτων έξω από τα αποτελέσματά σου: find / -type f -name gamehack 2>&1 | grep -v \"Permission Denied\". Η ανακατεύθυνση και μετά το φιλτράρισμα είναι αυτό που μετατρέπει έναν θορυβώδη έλεγχο σε αναγνώσιμη απάντηση." },
        success: { en: "You redirected stderr and filtered it.", el: "Ανακατεύθυνες το stderr." },
        check: (t) => usedCmd(t, /2>&1/) || t.flags.has("find-gamehack"),
      },
      {
        title: { en: "Read the marker", el: "Διάβασε τον δείκτη" },
        brief: { en: "The search returned a path; now prove it exists by reading it. Run cat /opt/labs/gamehack and check the contents match what you expected, because a filename in a list is a claim and the file itself is the evidence.", el: "Η αναζήτηση επέστρεψε μια διαδρομή· τώρα απόδειξε ότι υπάρχει διαβάζοντάς την. Τρέξε cat /opt/labs/gamehack και έλεγξε αν τα περιεχόμενα ταιριάζουν με ό,τι περίμενες, γιατί ένα όνομα αρχείου σε μια λίστα είναι ισχυρισμός ενώ το ίδιο το αρχείο είναι το στοιχείο." },
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
          en: "cat prints a file exactly as it is stored. The name is short for concatenate, because several files are printed one after another. The everyday use is one file: cat gamehack.txt from /root. It does not number lines, page them, or change the file. That rawness is why it is useful, and why it is the wrong tool for a long log. For more than a screen, use less in the next lesson. cat -n numbers lines on a real system. This lab's cat prints the bytes and leaves numbering to nl.\n\nThere are two moments when cat is the wrong tool. The first is length: a file longer than a screen scrolls past and you lose the top, so a pager is the better choice. The second is content you cannot read: printing a binary dumps unreadable bytes into your terminal and can even confuse its state. The safety habit matters just as much as the mechanics — a file you can read is data, not instructions, and nothing about cat makes the text inside it trustworthy.",
          el: "Η cat τυπώνει ένα αρχείο ακριβώς όπως είναι αποθηκευμένο. Το όνομα είναι σύντμηση του concatenate, γιατί πολλά αρχεία τυπώνονται το ένα μετά το άλλο. Η καθημερινή χρήση είναι ένα αρχείο: cat gamehack.txt από το /root. Δεν αριθμεί γραμμές, δεν τις σελιδοποιεί, και δεν αλλάζει το αρχείο. Αυτή η ωμότητα είναι ο λόγος που είναι χρήσιμη, και ο λόγος που είναι το λάθος εργαλείο για ένα μακρύ αρχείο καταγραφής. Για περισσότερα από μία οθόνη, χρησιμοποίησε less στο επόμενο μάθημα. Το cat -n αριθμεί γραμμές σε πραγματικό σύστημα. Η cat αυτού του εργαστηρίου τυπώνει τα bytes και αφήνει την αρίθμηση στην nl.\n\nΥπάρχουν δύο στιγμές που η cat είναι λάθος εργαλείο. Η πρώτη είναι το μήκος: ένα αρχείο μεγαλύτερο από μία οθόνη κυλά και χάνεις την αρχή, οπότε ένας σελιδοποιητής είναι καλύτερη επιλογή. Η δεύτερη είναι περιεχόμενο που δεν διαβάζεται: τυπώνοντας ένα δυαδικό αρχείο ρίχνεις ακατανόητα bytes στο τερματικό σου και μπορεί ακόμα να μπερδέψεις την κατάστασή του. Η συνήθεια ασφαλείας μετρά όσο και η μηχανική — ένα αρχείο που μπορείς να διαβάσεις είναι δεδομένα και όχι οδηγίες, και τίποτα στην cat δεν κάνει το κείμενο μέσα του αξιόπιστο.",
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
      { cmd: "tree -L 2 /etc", desc: { en: "directory shape, two levels", el: "δομή καταλόγων, δύο επίπεδα" } },
    ],
    tasks: [
      {
        id: "cat",
        instruction: { en: "cat gamehack.txt", el: "cat gamehack.txt" },
        hint: { en: "cat /root/gamehack.txt", el: "cat /root/gamehack.txt" },
        explain: { en: "Why: nearly every setting on Linux lives in a plain-text file, so reading one is the basic act of inspection. How: cat concatenates the files you name and writes them to standard output in order. It changes nothing, which makes it the safe first command; with no argument it simply copies your keyboard input back to the screen.", el: "Γιατί: σχεδόν κάθε ρύθμιση στο Linux βρίσκεται σε αρχείο απλού κειμένου, οπότε η ανάγνωση ενός τέτοιου αρχείου είναι η βασική πράξη επιθεώρησης. Πώς: η cat συνενώνει τα αρχεία που ονομάζεις και τα γράφει στην standard output με τη σειρά. Δεν αλλάζει τίποτα, κάτι που την κάνει την ασφαλή πρώτη εντολή· χωρίς όρισμα απλώς αντιγράφει ό,τι πληκτρολογείς πίσω στην οθόνη." },
        material: { en: "cat with several arguments concatenates them in order, which is a quick way to join small files into one.", el: "Η cat με πολλά ορίσματα τα συνενώνει με τη σειρά, που είναι γρήγορος τρόπος να ενώσεις μικρά αρχεία σε ένα." },
        check: (t) => t.flags.has("cat-gamehack") || usedCmd(t, /cat\s+.*gamehack\.txt/),
      },
      {
        id: "touch",
        instruction: { en: "touch gamehack-2.txt", el: "touch gamehack-2.txt" },
        hint: { en: "touch gamehack-2.txt", el: "touch gamehack-2.txt" },
        explain: { en: "Why: you need an empty file to exist before you can write into it, redirect into it, or hand it to another tool. How: touch creates each named file that does not exist and updates the timestamp of one that does. The new file arrives with the permissions your umask allows, normally -rw-r--r--, which is worth reading before you put anything sensitive inside.", el: "Γιατί: χρειάζεται ένα κενό αρχείο να υπάρχει πριν μπορέσεις να γράψεις μέσα του, να ανακατευθύνεις σε αυτό ή να το δώσεις σε άλλο εργαλείο. Πώς: η touch δημιουργεί κάθε αρχείο που ονομάζεις και δεν υπάρχει, και ενημερώνει τη χρονική σήμανση ενός που υπάρχει. Το νέο αρχείο έρχεται με τα δικαιώματα που επιτρέπει η umask σου, κανονικά -rw-r--r--, που αξίζει να διαβάσεις πριν βάλεις μέσα κάτι ευαίσθητο." },
        material: { en: "touch never truncates an existing file; it only updates timestamps, which makes it safe to run on a file you did not mean to create.", el: "Η touch ποτέ δεν μηδενίζει υπάρχον αρχείο· ενημερώνει μόνο τις χρονικές σημάνσεις, που την κάνει ασφαλή ακόμα και σε αρχείο που δεν σκόπευες να δημιουργήσεις." },
        check: (t) => t.flags.has("touch-gamehack2") || usedCmd(t, /touch\s+.*gamehack-2/),
      },
      {
        id: "mkdir",
        instruction: { en: "mkdir Documents/ignite", el: "mkdir Documents/ignite" },
        hint: { en: "mkdir Documents/ignite", el: "mkdir Documents/ignite" },
        explain: { en: "Why: structure is what keeps evidence, notes and tool output from colliding in one flat directory. How: mkdir creates the named directory inside the current one, or at the path you give. It refuses to overwrite anything that already exists, so an error here is information rather than damage; -p builds missing parents and stays silent when the directory is already there.", el: "Γιατί: η δομή είναι αυτή που εμποδίζει τεκμήρια, σημειώσεις και έξοδο εργαλείων να συγκρουστούν μέσα σε έναν επίπεδο κατάλογο. Πώς: η mkdir δημιουργεί τον κατάλογο που ονομάζεις μέσα στον τρέχοντα ή στη διαδρομή που δίνεις. Αρνείται να αντικαταστήσει οτιδήποτε υπάρχει ήδη, οπότε ένα σφάλμα εδώ είναι πληροφορία και όχι ζημιά· η -p χτίζει τους γονείς που λείπουν και παραμένει σιωπηλή όταν ο κατάλογος υπάρχει ήδη." },
        material: { en: "mkdir -p a/b/c builds the whole chain and stays silent when it already exists, which is what makes it safe inside scripts.", el: "Η mkdir -p a/b/c χτίζει ολόκληρη την αλυσίδα και παραμένει σιωπηλή όταν υπάρχει ήδη, που είναι αυτό που την κάνει ασφαλή μέσα σε scripts." },
        check: (t) => t.flags.has("mkdir-ignite") || usedCmd(t, /mkdir\s+.*ignite/),
      },
      {
        id: "cp",
        instruction: { en: "cp gamehack-2.txt Documents/ignite", el: "cp gamehack-2.txt Documents/ignite" },
        hint: { en: "cp gamehack-2.txt Documents/ignite", el: "cp gamehack-2.txt Documents/ignite" },
        explain: { en: "Why: the original is often the only copy of something you are not allowed to lose, so the work happens on a duplicate. How: cp SOURCE DESTINATION reads the source and writes a new file at the destination, leaving the source byte for byte intact. If the destination names an existing file it is overwritten silently, which is why that argument deserves a second look.", el: "Γιατί: το πρωτότυπο είναι συχνά το μοναδικό αντίγραφο κάτι που δεν επιτρέπεται να χάσεις, οπότε η δουλειά γίνεται σε αντίγραφο. Πώς: η cp ΠΗΓΗ ΠΡΟΟΡΙΣΜΟΣ διαβάζει την πηγή και γράφει νέο αρχείο στον προορισμό, αφήνοντας την πηγή ανέπαφη byte προς byte. Αν ο προορισμός ονομάζει υπάρχον αρχείο, αυτό αντικαθίσταται σιωπηλά, γι' αυτό το όρισμα του προορισμού αξίζει μια δεύτερη ματιά." },
        material: { en: "cp -r copies directories recursively and cp -p preserves ownership, mode and timestamps, which matters when you are staging evidence.", el: "Η cp -r αντιγράφει καταλόγους αναδρομικά και η cp -p διατηρεί ιδιοκτησία, δικαιώματα και χρονικές σημάνσεις, που έχει σημασία όταν προετοιμάζεις τεκμήρια." },
        check: (t) => usedCmd(t, /^\s*cp\s+\S+\s+\S+/) && !!getNode(t.fs, "/root/Documents/ignite/gamehack-2.txt"),
      },
      {
        id: "mv",
        instruction: { en: "Move the copy with mv into /root/Documents/ (from the ignite folder or by path).", el: "Μετακίνησε το αντίγραφο στο /root/Documents/ με mv" },
        hint: { en: "mv Documents/ignite/gamehack-2.txt /root/Documents/", el: "mv Documents/ignite/gamehack-2.txt /root/Documents/" },
        explain: { en: "Why: renaming and moving are the same operation on Linux, and confusing the two is how a file disappears. How: mv SOURCE DESTINATION changes the directory entry that points at the data; when the destination is an existing file it replaces that file at once and without warning. There is no undo and no recycle bin, so a stray space in the arguments is permanent.", el: "Γιατί: η μετονομασία και η μετακίνηση είναι η ίδια λειτουργία στο Linux, και η σύγχυση των δύο είναι ο τρόπος που ένα αρχείο εξαφανίζεται. Πώς: η mv ΠΗΓΗ ΠΡΟΟΡΙΣΜΟΣ αλλάζει την εγγραφή καταλόγου που δείχνει στα δεδομένα· όταν ο προορισμός είναι υπάρχον αρχείο, το αντικαθιστά αμέσως και χωρίς προειδοποίηση. Δεν υπάρχει αναίρεση ούτε κάδος ανακύκλωσης, οπότε ένα τυχαίο κενό στα ορίσματα είναι μόνιμο." },
        material: { en: "Renaming and moving are the same operation. When the destination may already exist, mv -i asks before overwriting.", el: "Η μετονομασία και η μετακίνηση είναι η ίδια λειτουργία. Όταν ο προορισμός μπορεί να υπάρχει ήδη, η mv -i ρωτά πριν αντικαταστήσει." },
        check: (t) => usedCmd(t, /^\s*mv\s+\S+\s+\S+/) && !!getNode(t.fs, "/root/Documents/gamehack-2.txt"),
      },
      {
        id: "rm",
        instruction: { en: "rm the leftover gamehack-2.txt (in Documents or home).", el: "rm το gamehack-2.txt" },
        hint: { en: "rm Documents/gamehack-2.txt", el: "rm Documents/gamehack-2.txt" },
        explain: { en: "Why: deletion on the command line is final, so the habit of confirming the target first is what stands between a typo and lost data. How: rm removes the directory entry and releases the data, with no recycle bin and no prompt by default. The shell expands wildcards before rm ever runs, so echo rm -r ./dir shows you exactly what the shell intends to hand over.", el: "Γιατί: η διαγραφή στη γραμμή εντολών είναι οριστική, οπότε η συνήθεια να επιβεβαιώνεις πρώτα τον στόχο είναι αυτό που στέκεται ανάμεσα σε ένα τυπογραφικό και σε χαμένα δεδομένα. Πώς: η rm αφαιρεί την εγγραφή καταλόγου και απελευθερώνει τα δεδομένα, χωρίς κάδο ανακύκλωσης και χωρίς ερώτηση από προεπιλογή. Το shell αναπτύσσει τους μπαλαντέρ πριν καν τρέξει η rm, οπότε η echo rm -r ./dir σου δείχνει ακριβώς τι σκοπεύει να παραδώσει." },
        material: { en: "There is no trash bin. rm -i prompts for every file, and putting echo in front of the command shows what the wildcards will expand into.", el: "Δεν υπάρχει κάδος ανακύκλωσης. Η rm -i ρωτά για κάθε αρχείο, και βάζοντας echo μπροστά από την εντολή βλέπεις σε τι θα αναπτυχθούν οι μπαλαντέρ." },
        check: (t) => usedCmd(t, /^\s*rm\s+\S*gamehack-2\.txt/) && !getNode(t.fs, "/root/Documents/gamehack-2.txt"),
      },
      {
        id: "rmdir",
        instruction: { en: "rmdir ignite_screenshots/", el: "rmdir ignite_screenshots/" },
        hint: { en: "rmdir ignite_screenshots", el: "rmdir ignite_screenshots" },
        explain: { en: "Why: refusing to delete a non-empty directory is a safety property rather than a limitation, and it makes this the one deletion you can run without checking twice. How: rmdir removes a directory only if it holds nothing. When the directory has contents it errors out and changes nothing, which is why a recursive rm is a deliberate decision rather than a convenience.", el: "Γιατί: η άρνηση διαγραφής ενός μη κενού καταλόγου είναι ιδιότητα ασφαλείας και όχι περιορισμός, και κάνει αυτή τη διαγραφή τη μία που μπορείς να τρέξεις χωρίς δεύτερο έλεγχο. Πώς: η rmdir αφαιρεί έναν κατάλογο μόνο αν δεν περιέχει τίποτα. Όταν ο κατάλογος έχει περιεχόμενο, εμφανίζει σφάλμα και δεν αλλάζει τίποτα, γι' αυτό μια αναδρομική rm είναι σκόπιμη απόφαση και όχι ευκολία." },
        material: { en: "rmdir -p removes a chain of empty directories and stops at the first one that still has contents.", el: "Η rmdir -p αφαιρεί μια αλυσίδα κενών καταλόγων και σταματά στον πρώτο που έχει ακόμα περιεχόμενο." },
        check: (t) => usedCmd(t, /^\s*rmdir\s+\S+/) && !getNode(t.fs, "/root/ignite_screenshots"),
      },
      {
        id: "tree",
        instruction: { en: "See the whole shape of /etc at once, two levels deep: tree -L 2 /etc", el: "Δες ολόκληρη τη δομή του /etc με μία ματιά, δύο επίπεδα βαθιά: tree -L 2 /etc" },
        hint: { en: "tree -L 2 /etc", el: "tree -L 2 /etc" },
        explain: { en: "Why: repeated ls calls show you one directory at a time, so the shape of a tree stays in your head, and that is exactly where it gets lost. How: tree walks a directory recursively and prints every entry indented under its parent, stopping N levels down when you pass -L N. The closing directory and file counts are a fast sanity check against what you expected to be there.", el: "Γιατί: οι επαναλαμβανόμενες ls σου δείχνουν έναν κατάλογο κάθε φορά, οπότε το σχήμα ενός δέντρου μένει στο μυαλό σου, και εκεί ακριβώς χάνεται. Πώς: η tree διασχίζει έναν κατάλογο αναδρομικά και εμφανίζει κάθε στοιχείο με εσοχή κάτω από τον γονέα του, σταματώντας N επίπεδα κάτω όταν περάσεις -L N. Τα καταληκτικά σύνολα καταλόγων και αρχείων είναι γρήγορος έλεγχος ορθότητας απέναντι σε ό,τι περίμενες να υπάρχει εκεί." },
        material: { en: "Without -L, tree prints the entire subtree, which on a real host can be thousands of lines. Depth-limit first, widen later.", el: "Χωρίς -L, η tree εμφανίζει ολόκληρο το υποδέντρο, που σε πραγματικό host μπορεί να είναι χιλιάδες γραμμές. Περιόρισε πρώτα το βάθος και διεύρυνε μετά." },
        check: (t) => usedCmd(t, /tree\s+-L/),
      },
    ],
    challenges: [
      {
        title: { en: "Rebuild ignite", el: "Δημιούργησε ξανά το ignite" },
        brief: { en: "If your earlier cleanup removed Documents/ignite, create it again with mkdir and then list Documents to prove the directory is back. Recreating what you deleted is the cheapest way to learn what a removal actually took away.", el: "Αν ο προηγούμενος καθαρισμός σου αφαίρεσε το Documents/ignite, ξαναφτιάξ’ το με mkdir και μετά παρέθεσε το Documents για να αποδείξεις ότι ο κατάλογος επέστρεψε. Η αναδημιουργία όσων διέγραψες είναι ο φθηνότερος τρόπος να μάθεις τι πήρε πραγματικά μια αφαίρεση." },
        success: { en: "You can create on demand.", el: "Δημιουργείς κατ' απαίτηση." },
        check: (t) => t.flags.has("mkdir-ignite") || usedCmd(t, /ls\s+.*Documents/),
      },
      {
        title: { en: "Recursive reminder", el: "Υπενθύμιση -r" },
        brief: { en: "Empty directories come out with rmdir; anything holding files needs the recursive form. Try one now and watch what the tool refuses to do — the refusal is the lesson, because it is the same guard that stops a careless recursive delete.", el: "Οι άδειοι κατάλογοι βγαίνουν με rmdir· ό,τι κρατά αρχεία χρειάζεται την αναδρομική μορφή. Δοκίμασε ένα από τα δύο τώρα και δες τι αρνείται να κάνει το εργαλείο — η άρνηση είναι το μάθημα, γιατί είναι το ίδιο φρένο που σταματά μια απρόσεκτη αναδρομική διαγραφή." },
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
          en: "head FILE shows the first ten lines. That default is useful because a configuration file often starts with a comment that explains the format. tail FILE shows the last ten, which is where a log usually puts the newest event. head -n 3 FILE, or the older head -3 FILE, asks for a different count. This lab honours both forms, up to one hundred lines. The same file lives at /etc/ettercap/etter.dns and /etc/Ettercap/etter.dns.\n\nBoth take -n to change how many lines they show, and both accept a pipe, which is where they earn their keep: counting matches is useless until you can see the first few. tail -f keeps reading as the file grows, which is how you watch a log while you reproduce a problem instead of guessing afterwards. Remember that head and tail count lines, not matches — a file with one enormous line will not behave the way you expect.",
          el: "Η head FILE δείχνει τις πρώτες δέκα γραμμές. Εκείνη η προεπιλογή είναι χρήσιμη γιατί ένα αρχείο ρυθμίσεων συχνά αρχίζει με σχόλιο που εξηγεί τη μορφή. Η tail FILE δείχνει τις τελευταίες δέκα, εκεί που ένα αρχείο καταγραφής συνήθως βάζει το νεότερο γεγονός. Το head -n 3 FILE, ή το παλαιότερο head -3 FILE, ζητά διαφορετικό πλήθος. Αυτό το εργαστήριο τιμά και τις δύο μορφές, μέχρι εκατό γραμμές. Το ίδιο αρχείο ζει στο /etc/ettercap/etter.dns και στο /etc/Ettercap/etter.dns.\n\nΚαι οι δύο δέχονται -n για να αλλάξεις πόσες γραμμές δείχνουν, και οι δύο δέχονται σωλήνωση, και εκεί πιάνουν την αξία τους: η καταμέτρηση ευρημάτων είναι άχρηστη μέχρι να δεις τα πρώτα. Η tail -f συνεχίζει να διαβάζει όσο το αρχείο μεγαλώνει, και έτσι παρακολουθείς μια καταγραφή ενώ αναπαράγεις ένα πρόβλημα αντί να μαντεύεις εκ των υστέρων. Θυμήσου ότι η head και η tail μετρούν γραμμές και όχι ευρήματα — ένα αρχείο με μία τεράστια γραμμή δεν θα συμπεριφερθεί όπως περιμένεις.",
        },
        shots: [
          shot("head /etc/ettercap/etter.dns", ["# etter.dns — GameHack lab copy of a DNS spoof config (educational)", "# This file is a TEXT example. Never use spoofing outside a lab you own.", "microsoft.com A 10.10.10.8"]),
          shot("tail /etc/ettercap/etter.dns", ["# operator workstation", "192.168.1.13 ptr kali.gamehack.lab"]),
        ],
      },
      {
        heading: { en: "nl — number lines", el: "nl — αρίθμηση" },
        body: {
          en: "nl FILE prints the file with a line number in front of each line. That is how you turn a vague 'near the top' into a place another person can find. cat -n does a similar job on a real system. In this lab, use nl. wc -l FILE counts the lines instead of printing them, and this lab implements it, so wc -l /etc/ettercap/etter.dns answers with a single number.\n\nNumbering is not decoration. When you report a finding, a line number is what lets someone else open the same file and see the same thing you saw, and it is what lets you say whether a directive appears once or twice. Numbers also expose surprises: a gap in the sequence usually means a blank line or a comment you skipped while reading.",
          el: "Η nl FILE τυπώνει το αρχείο με έναν αριθμό γραμμής μπροστά από κάθε γραμμή. Έτσι ένα αόριστο «κοντά στην αρχή» γίνεται σημείο που μπορεί να βρει και άλλος. Το cat -n κάνει παρόμοια δουλειά σε πραγματικό σύστημα. Σε αυτό το εργαστήριο, χρησιμοποίησε nl. Το wc -l FILE μετρά τις γραμμές αντί να τις τυπώνει και αυτό το εργαστήριο το υλοποιεί, οπότε το wc -l /etc/ettercap/etter.dns απαντά με έναν μόνο αριθμό.\n\nΗ αρίθμηση δεν είναι διακόσμηση. Όταν αναφέρεις ένα εύρημα, ο αριθμός γραμμής είναι αυτό που επιτρέπει σε κάποιον άλλον να ανοίξει το ίδιο αρχείο και να δει το ίδιο πράγμα, και είναι αυτό που σε αφήνει να πεις αν μια οδηγία εμφανίζεται μία ή δύο φορές. Οι αριθμοί αποκαλύπτουν και εκπλήξεις: ένα κενό στην ακολουθία συνήθως σημαίνει κενή γραμμή ή σχόλιο που προσπέρασες διαβάζοντας.",
        },
        shots: [shot("nl /etc/ettercap/etter.dns", ["     1  # etter.dns — GameHack lab copy of a DNS spoof config (educational)"])],
      },
      {
        heading: { en: "sed — find & replace", el: "sed — εύρεση & αντικατάσταση" },
        body: {
          en: "sed reads a stream and can substitute text as it prints. s/WWW/www/g means: find WWW, write www, and do it for every match on the line because of g. sed s/WWW/www/g gamehack.in prints the changed lines. It does not edit the file. A real sed changes the file only if you add an in-place option or redirect the output onto a new name. Check the printed result before you ever do that. A substitution that looks right on one line can rewrite a comment you meant to keep.\n\nsed is a stream editor: it reads a copy, transforms it, and prints the result while the original stays untouched. That is the safe default, and you should keep it. Print the transformation first and read it, then decide whether you really want the in-place form. Editing a configuration file without a preview is how a working host stops answering, and the mistake is invisible until the next restart.",
          el: "Η sed διαβάζει μια ροή και μπορεί να αντικαταστήσει κείμενο καθώς το τυπώνει. Το s/WWW/www/g σημαίνει: βρες WWW, γράψε www, και κάν' το για κάθε ταίριασμα στη γραμμή λόγω του g. Το sed s/WWW/www/g gamehack.in τυπώνει τις αλλαγμένες γραμμές. Δεν επεξεργάζεται το αρχείο. Μια πραγματική sed αλλάζει το αρχείο μόνο αν προσθέσεις επιλογή επιτόπιας αλλαγής ή ανακατευθύνεις την έξοδο σε νέο όνομα. Έλεγξε το τυπωμένο αποτέλεσμα πριν το κάνεις ποτέ. Μια αντικατάσταση που φαίνεται σωστή σε μία γραμμή μπορεί να ξαναγράψει ένα σχόλιο που ήθελες να κρατήσεις.\n\nΗ sed είναι επεξεργαστής ροής: διαβάζει ένα αντίγραφο, το μετασχηματίζει και τυπώνει το αποτέλεσμα ενώ το πρωτότυπο μένει ανέπαφο. Αυτή είναι η ασφαλής προεπιλογή και πρέπει να την κρατήσεις. Τύπωσε πρώτα τον μετασχηματισμό και διάβασέ τον, και μετά αποφάσισε αν πραγματικά θέλεις τη μορφή επιτόπου επεξεργασίας. Η επεξεργασία ενός αρχείου ρυθμίσεων χωρίς προεπισκόπηση είναι ο τρόπος που ένας λειτουργικός host σταματά να απαντά, και το λάθος είναι αόρατο μέχρι την επόμενη επανεκκίνηση.",
        },
        shots: [shot("sed s/WWW/www/g gamehack.in", ["Visit www.gamehack.lab for the lab portal.", "www banners should be rewritten to www with sed.", "Linux training portal (simulated)."])],
      },
      {
        heading: { en: "more and less", el: "more και less" },
        body: {
          en: "more FILE and less FILE are pagers. On a real terminal they show one screen and wait. Enter or space moves forward. In less, /keyword searches and q quits. less is the one to learn, because you can move backward as well as forward. This lab has no pager keystrokes. Both commands print the file and return to the prompt, so you can practise the names. When a real page is longer than the window, prefer less over cat.\n\nA pager exists so that output you cannot fit on a screen stops being lost. Space moves a page, the arrow keys move a line, a slash searches forward, and q quits — four keys that make any long output readable. Reaching for a pager instead of scrolling is also a habit that transfers: on a real host, a hundred lines of log arriving at once is normal, and the person who can navigate it finds the answer while everyone else scrolls.",
          el: "Τα more FILE και less FILE είναι σελιδοποιητές. Σε πραγματικό τερματικό δείχνουν μία οθόνη και περιμένουν. Το Enter ή το space προχωρά. Στην less, το /keyword ψάχνει και το q βγαίνει. Η less είναι αυτή που αξίζει να μάθεις, γιατί μπορείς να κινηθείς και προς τα πίσω. Αυτό το εργαστήριο δεν έχει πλήκτρα σελιδοποιητή. Και οι δύο εντολές τυπώνουν το αρχείο και γυρίζουν στο prompt, ώστε να εξασκηθείς στα ονόματα. Όταν μια πραγματική σελίδα είναι μακρύτερη από το παράθυρο, προτίμησε την less από την cat.\n\nΈνας σελιδοποιητής υπάρχει ώστε η έξοδος που δεν χωρά στην οθόνη να μην χάνεται. Το κενό προχωρά μία σελίδα, τα βελάκια μία γραμμή, η κάθετος ψάχνει προς τα κάτω, και το q βγαίνει — τέσσερα πλήκτρα που κάνουν κάθε μεγάλη έξοδο αναγνώσιμη. Η επιλογή σελιδοποιητή αντί για κύλιση είναι και συνήθεια που μεταφέρεται: σε έναν πραγματικό host, εκατό γραμμές καταγραφής που φτάνουν μαζί είναι φυσιολογικό, και όποιος ξέρει να τις διασχίζει βρίσκει την απάντηση ενώ οι υπόλοιποι κυλούν.",
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
        hint: { en: "head /etc/ettercap/etter.dns", el: "head /etc/ettercap/etter.dns" },
        explain: { en: "Why: most configuration files state their decisive settings near the top, and reading all of a long file wastes attention. How: head prints the first ten lines of a file by default and -n N changes that count. Because it stops early it stays cheap on huge files, which makes it the right first look at a log you have never opened.", el: "Γιατί: τα περισσότερα αρχεία ρυθμίσεων δηλώνουν τις καθοριστικές τους ρυθμίσεις κοντά στην αρχή, και η ανάγνωση ολόκληρου ενός μεγάλου αρχείου σπαταλά την προσοχή. Πώς: η head εμφανίζει από προεπιλογή τις πρώτες δέκα γραμμές ενός αρχείου και η -n N αλλάζει αυτό το πλήθος. Επειδή σταματά νωρίς παραμένει φθηνή σε τεράστια αρχεία, που την κάνει τη σωστή πρώτη ματιά σε ένα αρχείο καταγραφής που δεν έχεις ξαναανοίξει." },
        material: { en: "head -c N counts bytes instead of lines, which is a quick way to grab a file signature without reading the whole file.", el: "Η head -c N μετρά byte αντί για γραμμές, που είναι γρήγορος τρόπος να πάρεις την υπογραφή ενός αρχείου χωρίς να το διαβάσεις ολόκληρο." },
        check: (t) => sawOutput(t, /^\s*head\b/, /etter\.dns/),
      },
      {
        id: "tail",
        instruction: { en: "tail /etc/ettercap/etter.dns", el: "tail /etc/ettercap/etter.dns" },
        hint: { en: "tail /etc/ettercap/etter.dns", el: "tail /etc/ettercap/etter.dns" },
        explain: { en: "Why: the newest events sit at the end of a log, and scrolling to the bottom by hand is slow when the file keeps growing. How: tail prints the last ten lines by default and -n N changes the count. On a real host tail -f keeps following the file as new lines arrive, which is the standard way to watch a service react to what you just did.", el: "Γιατί: τα νεότερα γεγονότα κάθονται στο τέλος ενός αρχείου καταγραφής, και η κύλιση μέχρι κάτω με το χέρι είναι αργή όταν το αρχείο συνεχώς μεγαλώνει. Πώς: η tail εμφανίζει από προεπιλογή τις τελευταίες δέκα γραμμές και η -n N αλλάζει το πλήθος. Σε πραγματικό host η tail -f συνεχίζει να ακολουθεί το αρχείο καθώς φτάνουν νέες γραμμές, που είναι ο τυπικός τρόπος να παρακολουθείς μια υπηρεσία να αντιδρά σε αυτό που μόλις έκανες." },
        material: { en: "tail -n +N starts printing at line N instead of the end, which is how you skip a known header block.", el: "Η tail -n +N αρχίζει την εμφάνιση από τη γραμμή N αντί από το τέλος, που είναι ο τρόπος να προσπεράσεις ένα γνωστό μπλοκ κεφαλίδας." },
        check: (t) => sawOutput(t, /^\s*tail\b/, /gamehack\.lab A 10\.10\.10\.8/),
      },
      {
        id: "nl",
        instruction: { en: "nl /etc/ettercap/etter.dns", el: "nl /etc/ettercap/etter.dns" },
        hint: { en: "nl /etc/ettercap/etter.dns", el: "nl /etc/ettercap/etter.dns" },
        explain: { en: "Why: citing a line by number is how you make a finding verifiable by someone else reading the same file. How: nl writes the file to standard output with a line number prefixed to each line, leaving the file itself unchanged. The numbers are display only, so a reference like line 14 points at content rather than at a stored field.", el: "Γιατί: η αναφορά μιας γραμμής με αριθμό είναι ο τρόπος να κάνεις ένα εύρημα επαληθεύσιμο από κάποιον άλλο που διαβάζει το ίδιο αρχείο. Πώς: η nl γράφει το αρχείο στην standard output με έναν αριθμό γραμμής προτεταγμένο σε κάθε γραμμή, αφήνοντας το ίδιο το αρχείο αμετάβλητο. Οι αριθμοί είναι μόνο οπτικοί, οπότε μια αναφορά όπως γραμμή 14 δείχνει σε περιεχόμενο και όχι σε αποθηκευμένο πεδίο." },
        material: { en: "nl numbers non-empty lines by default; nl -ba numbers every line including blanks, which is what you want when quoting exact positions.", el: "Η nl αριθμεί από προεπιλογή τις μη κενές γραμμές· η nl -ba αριθμεί κάθε γραμμή συμπεριλαμβανομένων των κενών, που είναι ό,τι χρειάζεσαι όταν παραθέτεις ακριβείς θέσεις." },
        check: (t) => sawOutput(t, /^\s*nl\b/, /etter\.dns/),
      },
      {
        id: "sed",
        instruction: { en: "sed s/WWW/www/g gamehack.in", el: "sed s/WWW/www/g gamehack.in" },
        hint: { en: "sed s/WWW/www/g /root/gamehack.in", el: "sed s/WWW/www/g /root/gamehack.in" },
        explain: { en: "Why: repeating one edit by hand across a file is slow and inconsistent, and inconsistency inside a configuration is a defect. How: sed with an s/OLD/NEW/g expression streams the file, substitutes on each line and writes the result to standard output without touching the original. The trailing g replaces every occurrence on a line; without it a second match survives.", el: "Γιατί: η επανάληψη μιας επεξεργασίας με το χέρι σε όλο ένα αρχείο είναι αργή και ασυνεπής, και η ασυνέπεια μέσα σε μια διαμόρφωση είναι ελάττωμα. Πώς: η sed με έκφραση s/ΠΑΛΙΟ/ΝΕΟ/g ρέει το αρχείο, αντικαθιστά σε κάθε γραμμή και γράφει το αποτέλεσμα στην standard output χωρίς να αγγίξει το πρωτότυπο. Το τελικό g αντικαθιστά κάθε εμφάνιση στη γραμμή· χωρίς αυτό μια δεύτερη εμφάνιση επιζεί." },
        material: { en: "The same s/// shape also deletes with d and prints with p, and -i edits in place, so test without -i first and redirect to a new file.", el: "Το ίδιο σχήμα s/// επίσης διαγράφει με d και εμφανίζει με p, και το -i επεξεργάζεται επί τόπου, οπότε δοκίμασε πρώτα χωρίς -i και ανακατεύθυνε σε νέο αρχείο." },
        check: (t) => t.flags.has("sed-www") || usedCmd(t, /sed\s+s\/WWW\/www/),
      },
      {
        id: "more",
        instruction: { en: "more /etc/ettercap/etter.dns", el: "more /etc/ettercap/etter.dns" },
        hint: { en: "more /etc/ettercap/etter.dns", el: "more /etc/ettercap/etter.dns" },
        explain: { en: "Why: a long file scrolled past in one burst cannot be read, and paging is what turns output into something you can actually study. How: more prints a file one screen at a time and waits for you to advance, so nothing disappears before you read it. It offers no search, which is exactly why less exists; here it prints the whole fixture because no real terminal is attached.", el: "Γιατί: ένα μεγάλο αρχείο που περνάει με μία ορμή δεν διαβάζεται, και η σελιδοποίηση είναι αυτή που μετατρέπει την έξοδο σε κάτι που μπορείς πραγματικά να μελετήσεις. Πώς: η more εμφανίζει ένα αρχείο μία οθόνη κάθε φορά και περιμένει να προχωρήσεις, οπότε τίποτα δεν χάνεται πριν το διαβάσεις. Δεν προσφέρει αναζήτηση, που είναι ακριβώς ο λόγος ύπαρξης της less· εδώ εμφανίζει ολόκληρο το αρχείο γιατί δεν υπάρχει συνδεδεμένο πραγματικό τερματικό." },
        material: { en: "Inside more, space advances a screen, Enter one line and q quits. It cannot scroll backwards, which is exactly why less replaced it.", el: "Μέσα στην more, το κενό προχωρά μία οθόνη, το Enter μία γραμμή και το q βγαίνει. Δεν μπορεί να κυλίσει προς τα πίσω, που είναι ακριβώς ο λόγος που την αντικατέστησε η less." },
        check: (t) => sawOutput(t, /^\s*more\b/, /etter\.dns/),
      },
      {
        id: "wc-count",
        instruction: { en: "Count the entries in the fixture: wc -l /etc/ettercap/etter.dns", el: "Μέτρα τις εγγραφές του fixture: wc -l /etc/ettercap/etter.dns" },
        hint: { en: "wc -l /etc/ettercap/etter.dns", el: "wc -l /etc/ettercap/etter.dns" },
        explain: { en: "Why: a count is comparable and a listing is not, and a report needs numbers someone else can reproduce. How: wc -l counts newline characters and prints one number, which is the size of whatever reached it. At the end of a pipe it counts what survived the filtering, so the same command answers two different questions depending on where it sits.", el: "Γιατί: ένα πλήθος είναι συγκρίσιμο ενώ μια λίστα όχι, και μια αναφορά χρειάζεται αριθμούς που κάποιος άλλος μπορεί να αναπαράγει. Πώς: η wc -l μετρά χαρακτήρες νέας γραμμής και εμφανίζει έναν αριθμό, που είναι το μέγεθος όσων την έφτασαν. Στο τέλος μιας διαδοχής μετρά ό,τι επέζησε από το φιλτράρισμα, οπότε η ίδια εντολή απαντά σε δύο διαφορετικά ερωτήματα ανάλογα με το πού κάθεται." },
        material: { en: "wc reports lines, words and bytes, and -l, -w or -c selects one of them. After a filter it measures what survived, not the original input.", el: "Η wc αναφέρει γραμμές, λέξεις και byte, και οι -l, -w ή -c επιλέγουν ένα από αυτά. Μετά από φίλτρο μετρά ό,τι επέζησε και όχι την αρχική είσοδο." },
        check: (t) => usedCmd(t, /wc\s+-l/),
      },
      {
        id: "sort-uniq",
        instruction: { en: "Order the local host table and collapse duplicates: sort /etc/hosts | uniq", el: "Ταξινόμησε τον τοπικό πίνακα host και σύμπτυξε τα διπλότυπα: sort /etc/hosts | uniq" },
        hint: { en: "sort /etc/hosts | uniq", el: "sort /etc/hosts | uniq" },
        explain: { en: "Why: raw output repeats itself, and a summary that removes the repetition is what a reviewer can actually act on. How: sort puts lines in order and uniq then collapses adjacent duplicates into one. The order matters: uniq only ever compares neighbours, so running it on unsorted input leaves duplicates that happen not to sit next to each other.", el: "Γιατί: η ακατέργαστη έξοδος επαναλαμβάνεται, και μια σύνοψη που αφαιρεί την επανάληψη είναι αυτή πάνω στην οποία μπορεί να δράσει ένας αξιολογητής. Πώς: η sort βάζει τις γραμμές σε σειρά και η uniq στη συνέχεια συμπτύσσει τις γειτονικές διπλότυπες σε μία. Η σειρά έχει σημασία: η uniq συγκρίνει πάντα μόνο γειτονικές γραμμές, οπότε η εκτέλεσή της σε μη ταξινομημένη είσοδο αφήνει διπλότυπα που τυχαίνει να μην είναι δίπλα-δίπλα." },
        material: { en: "sort -n sorts numerically and sort -u removes duplicates in one pass, which is often simpler than piping into uniq.", el: "Η sort -n ταξινομεί αριθμητικά και η sort -u αφαιρεί τα διπλότυπα σε ένα πέρασμα, που συχνά είναι απλούστερο από το να διοχετεύσεις σε uniq." },
        check: (t) => usedCmd(t, /sort\s+\/etc\/hosts/) && usedCmd(t, /uniq/),
      },
      {
        id: "cut-sort-chain",
        instruction: { en: "Keep only the first field of the fixture, drop the comments, and order the names.", el: "Κράτα μόνο το πρώτο πεδίο του fixture, απόρριψε τα σχόλια και ταξινόμησε τα ονόματα." },
        hint: { en: "cut -d' ' -f1 /etc/ettercap/etter.dns | grep -v '^#' | sort", el: "cut -d' ' -f1 /etc/ettercap/etter.dns | grep -v '^#' | sort" },
        explain: { en: "Why: the Linux way is small tools doing one job well and joined by pipes, rather than one tool carrying a hundred options. How: cut with -d and -f isolates one field of every line, grep -v drops the comment lines, and sort orders what remains. Each stage reads standard input and writes standard output, so the chain reads left to right like a sentence.", el: "Γιατί: ο τρόπος του Linux είναι μικρά εργαλεία που κάνουν μία δουλειά καλά και ενώνονται με διαδοχές, αντί για ένα εργαλείο που κουβαλά εκατό επιλογές. Πώς: η cut με -d και -f απομονώνει ένα πεδίο κάθε γραμμής, η grep -v απορρίπτει τις γραμμές σχολίων και η sort τακτοποιεί ό,τι απομένει. Κάθε στάδιο διαβάζει standard input και γράφει standard output, οπότε η αλυσίδα διαβάζεται από αριστερά προς τα δεξιά σαν πρόταση." },
        material: { en: "cut -d picks the delimiter and -f the field number, where -f2- means field two onward. Chain small tools instead of hunting for one with many options.", el: "Η cut -d επιλέγει τον διαχωριστή και η -f τον αριθμό πεδίου, όπου το -f2- σημαίνει από το πεδίο δύο και μετά. Αλυσίδωσε μικρά εργαλεία αντί να κυνηγάς ένα με πολλές επιλογές." },
        check: (t) => usedCmd(t, /cut\s+-d/) && usedCmd(t, /grep\s+-v/) && usedCmd(t, /sort/),
      },
      {
        id: "tee-capture",
        instruction: { en: "Keep the interface capture and print only the address lines: ifconfig | tee /tmp/net.txt | grep inet", el: "Κράτα την καταγραφή διεπαφών και τύπωσε μόνο τις γραμμές διευθύνσεων: ifconfig | tee /tmp/net.txt | grep inet" },
        hint: { en: "ifconfig | tee /tmp/net.txt | grep inet", el: "ifconfig | tee /tmp/net.txt | grep inet" },
        explain: { en: "Why: evidence is what the command printed, not what you remember it printing, so the full output has to be captured at the moment it happens. How: tee sits inside the pipe, writes everything it receives to the file you name, and forwards the same bytes to the next stage. So ifconfig | tee /tmp/net.txt | grep inet keeps the complete record while you look only at the addresses.", el: "Γιατί: τεκμήριο είναι ό,τι τύπωσε η εντολή και όχι ό,τι θυμάσαι ότι τύπωσε, οπότε η πλήρης έξοδος πρέπει να καταγραφεί τη στιγμή που συμβαίνει. Πώς: η tee κάθεται μέσα στη διαδοχή, γράφει ό,τι λαμβάνει στο αρχείο που ονομάζεις και προωθεί τα ίδια bytes στο επόμενο στάδιο. Έτσι η ifconfig | tee /tmp/net.txt | grep inet κρατά την πλήρη καταγραφή ενώ εσύ κοιτάζεις μόνο τις διευθύνσεις." },
        material: { en: "tee writes every file you name, so one command can keep an evidence copy while the pipeline continues to the next stage.", el: "Η tee γράφει σε κάθε αρχείο που ονομάζεις, οπότε μία εντολή μπορεί να κρατήσει αντίγραφο τεκμηρίου ενώ η διαδοχή συνεχίζει στο επόμενο στάδιο." },
        check: (t) => usedCmd(t, /tee\s+\/tmp\/net\.txt/),
      },
      {
        id: "less",
        instruction: { en: "less /etc/ettercap/etter.dns", el: "less /etc/ettercap/etter.dns" },
        hint: { en: "less /etc/ettercap/etter.dns", el: "less /etc/ettercap/etter.dns" },
        explain: { en: "Why: reading a long file means moving backwards as often as forwards, and a one-way pager cannot do that. How: less prints a file one screen at a time and lets you scroll in both directions and search with a leading slash. Unlike more it reads lazily, so it opens huge files instantly; q quits, which is the keystroke worth learning first.", el: "Γιατί: η ανάγνωση ενός μεγάλου αρχείου σημαίνει κίνηση προς τα πίσω εξίσου συχνά με προς τα μπρος, και ένας σελιδοποιητής μίας κατεύθυνσης δεν το κάνει. Πώς: η less εμφανίζει ένα αρχείο μία οθόνη κάθε φορά και σου επιτρέπει να κυλάς και προς τις δύο κατευθύνσεις και να αναζητάς με μια αρχική κάθετο. Σε αντίθεση με την more διαβάζει τεμπέλικα, οπότε ανοίγει τεράστια αρχεία ακαριαία· το q βγαίνει, που είναι το πλήκτρο που αξίζει να μάθεις πρώτο." },
        material: { en: "Inside less: /text searches forward, ?text backwards, n repeats, G jumps to the end and q quits. It reads lazily, so huge logs open instantly.", el: "Μέσα στην less: το /κείμενο ψάχνει προς τα εμπρός, το ?κείμενο προς τα πίσω, το n επαναλαμβάνει, το G πηγαίνει στο τέλος και το q βγαίνει. Διαβάζει τεμπέλικα, οπότε τεράστια αρχεία καταγραφής ανοίγουν ακαριαία." },
        check: (t) => sawOutput(t, /^\s*less\b/, /etter\.dns/),
      },
    ],
    challenges: [
      {
        title: { en: "Both etter paths", el: "Και τα δύο etter paths" },
        brief: { en: "Installations disagree about capitalisation, so read the path exactly as it is written: head /etc/Ettercap/etter.dns with a capital E. Treating a path as a guess instead of a fact is how you lose twenty minutes to a file that was always there.", el: "Οι εγκαταστάσεις διαφωνούν ως προς τα κεφαλαία, οπότε διάβασε τη διαδρομή ακριβώς όπως είναι γραμμένη: head /etc/Ettercap/etter.dns με κεφαλαίο E. Το να αντιμετωπίζεις μια διαδρομή ως υπόθεση και όχι ως γεγονός είναι ο τρόπος που χάνεις είκοσι λεπτά σε ένα αρχείο που ήταν πάντα εκεί." },
        success: { en: "Linux paths are case-sensitive. We aliased both.", el: "Τα paths είναι case-sensitive." },
        check: (t) => usedCmd(t, /Ettercap/) || t.flags.has("etter"),
      },
      {
        title: { en: "Prove sed", el: "Απόδειξε sed" },
        brief: { en: "Run the substitution again on gamehack.in so the uppercase WWW becomes lowercase www, and read the printed result before you accept it. A stream editor shows you the transformed copy while the original stays untouched, so check both.", el: "Ξανατρέξε την αντικατάσταση στο gamehack.in ώστε το κεφαλαίο WWW να γίνει πεζό www, και διάβασε το τυπωμένο αποτέλεσμα πριν το δεχτείς. Ένας επεξεργαστής ροής σου δείχνει το μετασχηματισμένο αντίγραφο ενώ το πρωτότυπο μένει ανέπαφο, οπότε έλεγξε και τα δύο." },
        success: { en: "Substitution is non-destructive unless you redirect.", el: "Χωρίς redirect δεν αλλάζει το αρχείο." },
        check: (t) => t.flags.has("sed"),
      },
    ],
  },
];

export const SUDO_RUN_ALL: Module[] = [...SUDO_RUN_MODULES, ...SUDO_RUN_MODULES_B, ...SUDO_RUN_MODULES_C];
