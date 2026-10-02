import type { Module } from "./lessons";
import { buildSudoRunFS } from "../lib/sudorun";

// Match a normalized command line that was typed into the lab terminal.
const cmd = (t: any, re: RegExp) => t.ran.some((r: string) => re.test(r));

// ============================================================================
// Sudo_Run — Linux for Beginners (modules 1-5)
// All lesson text is original HackForge teaching material.
// ============================================================================

export const SUDO_MODULES_A: Module[] = [
  // ================================================= MODULE 1 — BOOT CAMP
  {
    id: "sr-boot",
    order: 1,
    icon: "🚀",
    color: "from-emerald-500 to-teal-700",
    title: { en: "Boot Camp: First Steps", el: "Boot Camp: Πρώτα Βήματα" },
    subtitle: {
      en: "Why Linux rules pentesting — and your very first commands.",
      el: "Γιατί το Linux κυριαρχεί στο pentesting — και οι πρώτες σου εντολές.",
    },
    difficulty: 1,
    badge: { en: "First Boot", el: "Πρώτη Μπουτάρισμα" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "Why do ethical hackers use Linux?", el: "Γιατί οι ethical hackers χρησιμοποιούν Linux;" },
        body: {
          en: "Linux is the natural habitat of the security professional. It is open-source, so nothing is hidden from you: every process, every socket, every byte on disk can be inspected. It gives you full control over the kernel, the network stack and the hardware — the same control you will later channel into offensive tools. Kali Linux, ParrotOS and BlackArch ship hundreds of security tools pre-installed, but the real power is underneath: the bash shell. Whoever masters the terminal stops depending on graphical tools.",
          el: "Το Linux είναι το φυσικό περιβάλλον του επαγγελματία ασφάλειας. Είναι ανοιχτού κώδικα, οπότε τίποτα δεν κρύβεται: κάθε διεργασία, κάθε υποδοχή, κάθε byte στον δίσκο μπορεί να ελεγχθεί. Σου δίνει πλήρη έλεγχο του πυρήνα, του δικτύου και του υλικού — τον ίδιο έλεγχο που αργότερα θα κατευθύνεις στα επιθετικά εργαλεία. Kali Linux, ParrotOS και BlackArch φέρνουν εκατοντάδες εργαλεία ασφάλειας προεγκατεστημένα, αλλά η αληθινή δύναμη είναι από κάτω: το bash shell. Όποιος κατακτήσει το τερματικό, παύει να εξαρτάται από γραφικά εργαλεία.",
        },
        tip: {
          en: "Every major hacking tool (Nmap, Metasploit, Wireshark, Burp, aircrack) was built Linux-first.",
          el: "Κάθε σημαντικό εργαλείο (Nmap, Metasploit, Wireshark, Burp, aircrack) γράφτηκε πρώτα για Linux.",
        },
      },
      {
        heading: { en: "Getting started as a beginner", el: "Πώς ξεκινάει ένας αρχάριος" },
        body: {
          en: "Pick a security distro from official sources only (kali.org, parrotsec.org), write it to a USB or run it as a VM in VirtualBox/VMware, and treat it as your laboratory. Inside this campaign the whole box is already prepared for you: a Kali machine with a home folder, training files and a realistic /etc directory. Your only job is to explore it fearlessly — everything is simulated, nothing can break.",
          el: "Πάρε μια διανομή ασφάλειας μόνο από επίσημες πηγές (kali.org, parrotsec.org), γράψε την σε USB ή τρέξε την σαν VM σε VirtualBox/VMware και αντιμετώπισέ την σαν εργαστήριο. Εδώ, σε αυτή την εκστρατεία, το μηχάνημα είναι ήδη έτοιμο: ένα Kali με home φάκελο, εκπαιδευτικά αρχεία και ρεαλιστικό /etc. Το μόνο σου καθήκον είναι να το εξερευνήσεις αφοβικά — όλα είναι προσομοιωμένα, τίποτα δεν σπάει.",
        },
      },
      {
        heading: { en: "The commands of the few", el: "Οι εντολές των λίγων" },
        body: {
          en: "Roughly 30 commands cover 90% of everything you will ever do in a terminal. You start with orientation: `pwd` answers 'where am I?' by printing the absolute path of your current directory. `whoami` answers 'as whom am I acting?' — critical when you juggle users and sudo. `cd` moves you around the tree: `cd folder` dives in, `cd ..` climbs one level, `cd /` jumps to the root, `cd` alone (or `cd ~`) carries you home. These three are the legs you will stand on for everything else.",
          el: "Περίπου 30 εντολές καλύπτουν το 90% όσων θα κάνεις ποτέ σε τερματικό. Ξεκινάς με τον προσανατολισμό: το `pwd` απαντά στο «πού είμαι;» τυπώνοντας την απόλυτη διαδρομή του τρέχοντος φακέλου. Το `whoami` απαντά στο «ως ποιον ενεργώ;» — κρίσιμο όταν αλλάζεις χρήστες και sudo. Το `cd` σε μετακινεί στο δέντρο: το `cd folder` σε βυθίζει, το `cd ..` ανεβαίνει ένα επίπεδο, το `cd /` σε πάει στη ρίζα, το σκέτο `cd` (ή `cd ~`) σε γυρίζει σπίτι. Αυτές οι τρεις είναι τα πόδια πάνω στα οποία θα σταθούν όλα τα υπόλοιπα.",
        },
      },
      {
        heading: { en: "ls — see what is around you", el: "ls — δες τι υπάρχει γύρω σου" },
        body: {
          en: "`ls` lists the contents of a directory. Plain `ls` shows names; `ls -l` shows the long format — permissions, owner, group, size, date, name — you will read this line format thousands of times; `ls -a` reveals hidden files, whose names start with a dot (`.` and `..` are the current and parent directory themselves). Combine flags freely: `ls -la`. In security work, hidden files are where secrets, configs and leftovers live.",
          el: "Το `ls` δείχνει τα περιεχόμενα ενός φακέλου. Το σκέτο `ls` δείχνει ονόματα· το `ls -l` δείχνει την αναλυτική μορφή — δικαιώματα, ιδιοκτήτη, ομάδα, μέγεθος, ημερομηνία, όνομα — αυτή τη γραμμή θα τη διαβάσεις χιλιάδες φορές· το `ls -a` αποκαλύπτει τα κρυφά αρχεία, των οποίων το όνομα ξεκινά με τελεία (το `.` και το `..` είναι ο τρέχων και ο γονικός φάκελος). Συνδύασε flags ελεύθερα: `ls -la`. Στην ασφάλεια, τα κρυφά αρχεία είναι εκεί που μένουν μυστικά, ρυθμίσεις και υπολείμματα.",
        },
      },
    ],
    cheats: [
      { cmd: "pwd", desc: { en: "Print your current directory (absolute)", el: "Τυπώνει τον τρέχοντα φάκελο (απόλυτη διαδρομή)" } },
      { cmd: "whoami", desc: { en: "Which user am I logged in as", el: "Ως ποιος χρήστης είμαι συνδεδεμένος" } },
      { cmd: "ls", desc: { en: "List directory contents", el: "Λίστα περιεχομένων φακέλου" } },
      { cmd: "ls -l", desc: { en: "Long format: perms, owner, size, date", el: "Αναλυτικά: δικαιώματα, ιδιοκτήτης, μέγεθος, ημέρα" } },
      { cmd: "ls -a", desc: { en: "Also show hidden dot-files", el: "Δείχνει και τα κρυφά dot-αρχεία" } },
      { cmd: "cd folder .. / ~", desc: { en: "Move into a folder, up, to root, home", el: "Μέσα σε φάκελο, πάνω, στη ρίζα, στο σπίτι" } },
    ],
    tasks: [
      {
        id: "sr-boot-pwd",
        instruction: {
          en: "You just landed on a fresh Kali box. Find out exactly where you are: run pwd and find your absolute path.",
          el: "Μόλις προσγειώθηκες σε καινούργιο Kali. Μάθε ακριβώς πού βρίσκεσαι: τρέξε pwd και βρες την απόλυτη διαδρομή.",
        },
        hint: { en: "Type pwd and hit Enter.", el: "Πληκτρολόγησε pwd και πάτα Enter." },
        explain: {
          en: "pwd (print working directory) shows your exact position in the filesystem tree — like GPS coordinates before any operation. Run it after every big move until the tree lives in your head.",
          el: "Το pwd (print working directory) δείχνει την ακριβή θέση σου στο δέντρο αρχείων — σαν συντεταγμένες GPS πριν από κάθε ενέργεια. Τρέχε το μετά από κάθε μεγάλη μετακίνηση μέχρι το δέντρο να μείνει στο κεφάλι σου.",
        },
        check: (t) => t.ranPwd,
      },
      {
        id: "sr-boot-whoami",
        instruction: {
          en: "Find out which user account the kernel thinks you are, with whoami.",
          el: "Μάθε ποιος χρήστης είσαι σύμφωνα με τον πυρήνα, με το whoami.",
        },
        hint: { en: "whoami", el: "whoami" },
        explain: {
          en: "You are 'operator' here. On real engagements you constantly pivot users — operator → www-data → root — and whoami is the sanity check before every dangerous command. Try id too: it shows your uid, gid and group memberships.",
          el: "Εδώ είσαι ο «operator». Σε πραγματικές αποστολές αλλάζεις συνεχώς χρήστες — operator → www-data → root — και το whoami είναι ο έλεγχος νηφαλιότητας πριν από κάθε επικίνδυνη εντολή. Δοκίμασε και το id: δείχνει uid, gid και ομάδες.",
        },
        check: (t) => t.ranWhoami,
      },
      {
        id: "sr-boot-ls",
        instruction: {
          en: "List everything your home directory contains with plain ls.",
          el: "Δες ό,τι περιέχει ο home φάκελός σου με απλό ls.",
        },
        hint: { en: "ls", el: "ls" },
        explain: {
          en: "You should see Desktop, Documents and several training files (hackforge.txt, hackforge.in, simple_bash.sh, first_script.sh, greet.sh, scanner.sh). Folders and files — your workspace for the whole campaign.",
          el: "Θα δεις Desktop, Documents και αρκετά εκπαιδευτικά αρχεία (hackforge.txt, hackforge.in, simple_bash.sh, first_script.sh, greet.sh, scanner.sh). Φάκελοι και αρχεία — το εργαστήριό σου σε όλη την εκστρατεία.",
        },
        check: (t) => t.listedDirs.has("/home/operator"),
      },
      {
        id: "sr-boot-lsl",
        instruction: {
          en: "Now run ls -l and read the long listing: permissions block, owner, group, size for each item.",
          el: "Τρέξε τώρα ls -l και διάβασε τον αναλυτικό κατάλογο: μπλοκ δικαιωμάτων, ιδιοκτήτη, ομάδα, μέγεθος για κάθε αντικείμενο.",
        },
        hint: { en: "ls -l", el: "ls -l" },
        explain: {
          en: "The first column is the one operators stare at: a leading 'd' marks directories, then nine characters of rwx tell who may read/write/execute. Files sized in bytes, folders 4096. Which of your training files is already executable?",
          el: "Η πρώτη στήλη είναι αυτή που κοιτάξουν όλοι: το αρχικό 'd' δείχνει φακέλους, και εννέα χαρακτήρες rwx λένε ποιος μπορεί να διαβάσει/γράψει/εκτελέσει. Αρχεία σε bytes, φάκελοι 4096. Ποιο από τα εκπαιδευτικά σου αρχεία είναι ήδη εκτελέσιμο;",
        },
        check: (t) => t.listedLong,
      },
      {
        id: "sr-boot-lsa",
        instruction: {
          en: "Reveal what most users never see: run ls -a to show hidden dot-files.",
          el: "Αποκάλυψε ό,τι οι περισσότεροι δεν βλέπουν: τρέξε ls -a για να εμφανιστούν τα κρυφά dot-αρχεία.",
        },
        hint: { en: "ls -a", el: "ls -a" },
        explain: {
          en: "Every Linux directory contains at least two hidden entries: '.' (itself) and '..' (its parent). User configs like .bashrc and .profile also hide here on real systems — and so do attacker implants, scheduled backdoors and forgotten credentials. ls -a is reflex number one during any investigation.",
          el: "Κάθε Linux φάκελος έχει τουλάχιστον δύο κρυφό καταχωρήσεις: το '.' (εαυτός) και το '..' (γονέας). Ρυθμίσεις χρήστη όπως .bashrc και .profile κρύβονται κι εδώ — μαζί και implants επιτιθέμενων, backdoors και ξεχασμένα credentials. Το ls -a είναι το αντανακλαστικό νούμερο ένα σε κάθε έρευνα.",
        },
        check: (t) => t.listedHidden,
      },
      {
        id: "sr-boot-cd-docs",
        instruction: {
          en: "Navigate into Documents (cd Documents) and confirm the move with pwd.",
          el: "Μπες στο Documents (cd Documents) και επιβεβαίωσε τη μετακίνηση με pwd.",
        },
        hint: { en: "cd Documents  then  pwd", el: "cd Documents  και μετά  pwd" },
        explain: {
          en: "Relative paths are resolved against where you stand: cd Documents from /home/operator lands in /home/operator/Documents. Your prompt shortens — but pwd always tells the full truth.",
          el: "Οι σχετικές διαδρομές επιλύονται ως προς εκεί που στέκεσαι: το cd Documents από το /home/operator σε πάει στο /home/operator/Documents. Το prompt κονταίνει — αλλά το pwd λέει πάντα την πλήρη αλήθεια.",
        },
        check: (t) => t.cwd.join("/") === "home/operator/Documents",
      },
      {
        id: "sr-boot-cd-up",
        instruction: {
          en: "Climb back one level with cd .. — then verify with pwd that you are home again.",
          el: "Ανέβα ένα επίπεδο με cd .. — και επιβεβαίωσε με pwd ότι γύρισες σπίτι.",
        },
        hint: { en: "cd ..  then  pwd", el: "cd ..  και μετά  pwd" },
        explain: {
          en: "'..' always means 'the parent directory'. Chained it climbs fast: cd ../.. jumps two levels at once. Two dots are also how attackers escape directories in path-traversal bugs — remember these dots, they come back in web hacking.",
          el: "Το '..' σημαίνει πάντα «γονικός φάκελος». Αλυσιδωτό ανεβαίνει γρήγορα: το cd ../.. πηδά δύο επίπεδα. Οι δύο τελείες είναι και ο τρόπος που οι επιτιθέμενοι ξεφεύγουν από φακέλους σε path-traversal bugs — κράτησε αυτές τις τελείες, επιστρέφουν στο web hacking.",
        },
        check: (t) => t.cwd.join("/") === "home/operator" && t.history.some((h: string) => h.trim().startsWith("cd Documents")),
      },
      {
        id: "sr-boot-cd-root",
        instruction: {
          en: "Jump to the very top of the tree (cd /), look around with ls, then come straight home with cd /home/operator.",
          el: "Πήγαινε στην κορυφή του δέντρου (cd /), κοίταξε γύρω με ls, και γύρισε αμέσως σπίτι με cd /home/operator.",
        },
        hint: { en: "cd / , ls , then cd /home/operator", el: "cd / , ls , και μετά cd /home/operator" },
        explain: {
          en: "/ is the root of everything: /etc holds configs, /var holds logs and the web root, /home holds user homes, /root belongs to root alone. Absolute paths (starting with /) work from anywhere — relative ones depend on your position.",
          el: "Το / είναι η ρίζα των πάντων: το /etc κρατά ρυθμίσεις, το /var logs και web root, το /home τα σπίτια χρηστών, το /root ανήκει μόνο στον root. Οι απόλυτες διαδρομές (που ξεκινούν με /) δουλεύουν παντού — οι σχετικές εξαρτώνται από τη θέση σου.",
        },
        check: (t) => t.history.some((h: string) => h.trim() === "cd /") && t.cwd.join("/") === "home/operator",
      },
    ],
    challenges: [
      {
        title: { en: "Silent Navigator", el: "Σιωπηλός Πλοηγός" },
        brief: {
          en: "Without asking for hints: dive into Documents/ignite, read the note that lives there (notes.txt), and return to your home directory. The task completes when you are back home having read the note.",
          el: "Χωρίς βοήθεια: κατέβα στο Documents/ignite, διάβασε το σημείωμα (notes.txt) που υπάρχει εκεί, και γύρισε στο home σου. Ολοκληρώνεται όταν είσαι πίσω σπίτι έχοντας διαβάσει το σημείωμα.",
        },
        success: { en: "Note read, route retraced. You move like an operator already.", el: "Σημείωμα διαβάστηκε, διαδρομή ανάποδα. Κινείσαι ήδη σαν operator." },
        check: (t) => t.readFiles.has("/home/operator/Documents/ignite/notes.txt") && t.cwd.join("/") === "home/operator",
      },
      {
        title: { en: "Know Thyself", el: "Γνώθι Σεαυτόν" },
        brief: {
          en: "Interrogate the machine: ask the kernel for its hostname, your full identity card (id), and the date. All three must be answered.",
          el: "Ανάκρινε το μηχάνημα: ζήτα από τον πυρήνα το hostname, την πλήρη ταυτότητά σου (id) και την ημερομηνία. Και τα τρία πρέπει να απαντηθούν.",
        },
        success: { en: "hostname, id and date all answered — the box has no secrets left for this module.", el: "hostname, id και date απαντήθηκαν — το μηχάνημα δεν έχει άλλα μυστικά σε αυτή την ενότητα." },
        check: (t) => t.ranId && cmd(t, /^hostname\b/) && cmd(t, /^date\b/),
      },
    ],
  },

  // ================================================= MODULE 2 — SEARCH PARTY
  {
    id: "sr-search",
    order: 2,
    icon: "🔎",
    color: "from-sky-500 to-indigo-700",
    title: { en: "Search Party", el: "Ομάδα Αναζήτησης" },
    subtitle: {
      en: "Help yourself: --help, man, locate, whereis, which, find, grep.",
      el: "Βοήθησε τον εαυτό σου: --help, man, locate, whereis, which, find, grep.",
    },
    difficulty: 1,
    badge: { en: "Finder", el: "Ευρέτης" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "The two built-in teachers: --help and man", el: "Οι δύο ενσωματωμένοι δάσκαλοι: --help και man" },
        body: {
          en: "Before asking the internet, ask the shell. Almost every Linux command answers `command --help` with a compact usage summary, and `man command` opens the full manual page: every flag, every option, with examples. `man --help` shows you the help of the manual itself, and manual pages of big tools (nmap, hydra, msfconsole) are small books. Operators who read man pages never wait for a blog post to catch up.",
          el: "Πριν ρωτήσεις το internet, ρώτα το shell. Σχεδόν κάθε Linux εντολή απαντά στο `command --help` με μια συνοπτική χρήση, και το `man command` ανοίγει τη σελίδα εγχειριδίου: κάθε flag, κάθε επιλογή, με παραδείγματα. Το `man --help` δείχνει τη βοήθεια του ίδιου του εγχειριδίου, και οι man σελίδες των μεγάλων εργαλείων (nmap, hydra, msfconsole) είναι μικρά βιβλία. Όσοι διαβάζουν man pages δεν περιμένουν κανένα blog να προλάβει.",
        },
        tip: {
          en: "Inside a real man page: /pattern searches, q quits.",
          el: "Μέσα σε πραγματικό man page: το /pattern αναζητά, το q βγάζει.",
        },
      },
      {
        heading: { en: "Instant answers: locate, whereis, which", el: "Άμεσες απαντήσεις: locate, whereis, which" },
        body: {
          en: "Three little detectives answer three different questions. `locate pattern` searches a pre-built index of the entire disk and returns every matching path in a blink — great when you half-remember a filename. `whereis tool` tells you where the binary, source and manual page live (`/usr/bin/...  /usr/share/man/...`). `which tool` answers the sharpest question: 'what gets executed when I type this name?' — the exact binary your shell would run. When a tool behaves weird, `which` confirms you are running the one you think.",
          el: "Τρεις μικροί ντετέκτιβ απαντούν σε τρεις διαφορετικές ερωτήσεις. Το `locate pattern` ψάχνει έναν προ-χτισμένο κατάλογο όλου του δίσκου και γυρνά κάθε διαδρομή σε στιγμή — τέλειο όταν θυμάσαι μισό όνομα αρχείου. Το `whereis tool` δείχνει πού ζουν το binary, ο πηγαίος κώδικας και το manual (`/usr/bin/...  /usr/share/man/...`). Το `which tool` απαντά στην πιο αιχμηρή ερώτηση: «τι θα εκτελεστεί όταν πληκτρολογήσω αυτό το όνομα;» — το ακριβές binary που θα τρέξει το shell σου. Όταν ένα εργαλείο συμπεριφέρεται παράξενα, το `which` επιβεβαιώνει ποιο τρέχεις.",
        },
      },
      {
        heading: { en: "find — walk the whole tree", el: "find — περπάτα όλο το δέντρο" },
        body: {
          en: "find is the slow, thorough bloodhound: `find / -name simple_bash.sh` walks every directory from the root downward, matching filename patterns. Two practical notes. First, searching the entire system floods your screen with 'Permission denied' errors from folders you may not enter — silence that noise by filtering stderr: `find / -name '*.sh' 2>&1 | grep -v \"Permission denied\"`. Second, instead of a name you can match any glob: `find / -name '*.txt'`. On an assessment, find is how you locate config files, backups and credentials the admin forgot about.",
          el: "Το find είναι ο αργός, επιμελής ιχνηλάτης: το `find / -name simple_bash.sh` περπατά κάθε φάκελο από τη ρίζα και κάτω, ταιριάζοντας patterns ονομάτων. Δύο πρακτικά σημεία. Πρώτον, η αναζήτηση σε όλο το σύστημα γεμίζει την οθόνη με σφάλματα 'Permission denied' από φακέλους που δεν επιτρέπεται να μπεις — σκότωσε τον θόρυβο φιλτράροντας το stderr: `find / -name '*.sh' 2>&1 | grep -v \"Permission denied\"`. Δεύτερον, αντί για όνομα μπορείς να ταιριάξεις οποιοδήποτε glob: `find / -name '*.txt'`. Σε ένα assessment, το find είναι ο τρόπος να βρεις config αρχεία, backups και credentials που ο admin ξέχασε.",
        },
      },
      {
        heading: { en: "grep — the pattern scalpel", el: "grep — το νυστέρι των patterns" },
        body: {
          en: "grep prints only the lines of a file that contain a pattern: `grep password config.txt`, `grep 10.10.10 /var/log/auth.log`. Three flags to memorize today: `-i` ignores case ('WWW' becomes equal to 'www'), `-v` inverts the match (prints everything that does NOT match), and `-r` recurses through whole directory trees. You will chain grep with pipes for the rest of your career: `history | grep nmap`, `ps aux | grep apache`, `cat log | grep -i error`. It is the single most-used command in security operations.",
          el: "Το grep τυπώνει μόνο τις γραμμές ενός αρχείου που περιέχουν ένα pattern: `grep password config.txt`, `grep 10.10.10 /var/log/auth.log`. Τρία flags να αποστηθίσεις σήμερα: το `-i` αγνοεί πεζά/κεφαλαία (το 'WWW' ισούται με 'www'), το `-v` αντιστρέφει (τυπώνει ό,τι ΔΕΝ ταιριάζει), και το `-r` μπαίνει αναδρομικά σε δέντρα φακέλων. Θα αλυσοδένεις το grep με pipes για όλη σου την καριέρα: `history | grep nmap`, `ps aux | grep apache`, `cat log | grep -i error`. Είναι η πιο χρησιμοποιούμενη εντολή στις επιχειρήσεις ασφάλειας.",
        },
      },
    ],
    cheats: [
      { cmd: "tool --help", desc: { en: "Quick usage of any command", el: "Γρήγορη χρήση οποιασδήποτε εντολής" } },
      { cmd: "man tool", desc: { en: "Open the full manual page", el: "Άνοιγμα πλήρους σελίδας manual" } },
      { cmd: "locate name", desc: { en: "Find paths by name from the index", el: "Εύρεση διαδρομών από τον κατάλογο" } },
      { cmd: "whereis tool", desc: { en: "Where binary/source/man live", el: "Πού ζουν binary/source/man" } },
      { cmd: "which tool", desc: { en: "Exact binary your shell would run", el: "Ποιο ακριβώς binary θα τρέξει" } },
      { cmd: "find / -name x", desc: { en: "Walk the tree matching a filename", el: "Περπάτημα δέντρου με όνομα αρχείου" } },
      { cmd: "grep [-i] [-v] pat file", desc: { en: "Keep (or invert) matching lines", el: "Κράτα (ή ανέστρεψε) γραμμές που ταιριάζουν" } },
    ],
    tasks: [
      {
        id: "sr-search-help",
        instruction: {
          en: "Start like a professional: ask ls to explain itself with ls --help.",
          el: "Ξεκίνα σαν επαγγελματίας: ζήτα από το ls να εξηγήσει τον εαυτό του με ls --help.",
        },
        hint: { en: "ls --help", el: "ls --help" },
        explain: {
          en: "The --help output is the ten-second refresher you use a hundred times a week: flags, argument shapes and short examples, right where you work. (In this sandbox --help maps to the same summary as help.)",
          el: "Το --help είναι ο δεκάλεπτος υπενθυμιστής που χρησιμοποιείς εκατό φορές τη βδομάδα: flags, σχήμα ορισμάτων και σύντομα παραδείγματα, εκεί ακριβώς που δουλεύεις. (Στο sandbox το --help αντιστοιχεί στην ίδια σύνοψη με το help.)",
        },
        check: (t) => cmd(t, /--help\b/),
      },
      {
        id: "sr-search-man",
        instruction: {
          en: "Open the manual for ls with man ls — then try man find as well to see a bigger manual.",
          el: "Άνοιξε το manual του ls με man ls — και μετά δοκίμασε man find για να δεις μεγαλύτερο manual.",
        },
        hint: { en: "man ls  then  man find", el: "man ls  και μετά  man find" },
        explain: {
          en: "Manual pages are the permanent, offline documentation every system carries with it. During engagements with no internet, man is your teacher. Memorize: man 1 pages are user commands, man 5 describes file formats.",
          el: "Οι manual pages είναι η μόνιμη, offline τεκμηρίωση που κουβαλά κάθε σύστημα μαζί του. Σε αποστολές χωρίς internet, το man είναι ο δάσκαλός σου. Θυμήσου: οι man 1 σελίδες είναι εντολές χρήστη, οι man 5 περιγράφουν μορφές αρχείων.",
        },
        check: (t) => t.manViewed.has("ls"),
      },
      {
        id: "sr-search-locate",
        instruction: {
          en: "A fellow trainee mentioned a file with 'hackforge' in the name. Pull every matching path instantly: locate hackforge",
          el: "Συνάδελφος ανέφερε αρχείο με «hackforge» στο όνομα. Φέρε αμέσως κάθε διαδρομή που ταιριάζει: locate hackforge",
        },
        hint: { en: "locate hackforge", el: "locate hackforge" },
        explain: {
          en: "locate is instant because it queries an index (updated by updatedb) instead of touching the disk. Trade-off: files created minutes ago may not appear yet — when in doubt, switch to find.",
          el: "Το locate είναι ακαριαίο γιατί ρωτάει κατάλογο (που ενημερώνει το updatedb) αντί να πειράξει τον δίσκο. Τίμημα: αρχεία που δημιουργήθηκαν πριν λίγα λεπτά μπορεί να μην εμφανίζονται ακόμα — σε αμφιβολία, πήγαινε στο find.",
        },
        check: (t) => t.locateRan && cmd(t, /^locate\s+\S+/),
      },
      {
        id: "sr-search-whereis",
        instruction: {
          en: "Find where the sed text-editing tool lives — binary and manual: whereis sed",
          el: "Βρες πού ζει το εργαλείο κειμένου sed — binary και manual: whereis sed",
        },
        hint: { en: "whereis sed", el: "whereis sed" },
        explain: {
          en: "whereis answers 'what does this thing consist of on disk?' — /usr/bin/sed is the program, the man page sits under /usr/share/man. Validating that a tool exists before relying on it in a script is a reflex.",
          el: "Το whereis απαντά «από τι αποτελείται αυτό το πράγμα στον δίσκο;» — το /usr/bin/sed είναι το πρόγραμμα, το man page κάτω από /usr/share/man. Το να επαληθεύεις ότι ένα εργαλείο υπάρχει πριν το βασιστείς σε script είναι αντανακλαστικό.",
        },
        check: (t) => t.whereisRan && cmd(t, /^whereis\s+sed\b/),
      },
      {
        id: "sr-search-which",
        instruction: {
          en: "Someone typed simply 'nmap'. Which exact binary would run? Ask: which nmap",
          el: "Κάποιος πληκτρολόγησε σκέτο «nmap». Ποιο ακριβώς binary θα έτρεχε; Ρώτα: which nmap",
        },
        hint: { en: "which nmap", el: "which nmap" },
        explain: {
          en: "which resolves your shell's PATH — the list of directories searched, in order, whenever you type a bare command name. When two versions of a tool exist, which tells you which one wins. Missing output means: not on PATH.",
          el: "Το which επιλύει το PATH του shell σου — τη λίστα φακέλων που ψάχνονται, με σειρά, όταν πληκτρολογείς σκέτο όνομα. Όταν υπάρχουν δύο εκδόσεις ενός εργαλείου, το which λέει ποια κερδίζει. Άδεια έξοδος σημαίνει: εκτός PATH.",
        },
        check: (t) => t.whichFound === "nmap",
      },
      {
        id: "sr-search-find",
        instruction: {
          en: "Hunt the filesystem for the script simple_bash.sh — search from the root: find / -name simple_bash.sh",
          el: "Κυνήγησε το αρχείο simple_bash.sh σε όλο το σύστημα — ξεκίνα από τη ρίζα: find / -name simple_bash.sh",
        },
        hint: { en: "find / -name simple_bash.sh", el: "find / -name simple_bash.sh" },
        explain: {
          en: "Notice the noise: 'Permission denied' lines appear for /root and /etc/shadow — places you may not look as a normal user. Real output is exactly this messy, which is why the next skill matters.",
          el: "Πρόσεξε τον θόρυβο: γραμμές 'Permission denied' εμφανίζονται για το /root και το /etc/shadow — μέρη όπου δεν μπορείς να κοιτάξεις ως απλός χρήστης. Η πραγματική έξοδος είναι ακριβώς τόσο άτακτη, γι' αυτό μετράει η επόμενη ικανότητα.",
        },
        check: (t) => cmd(t, /^find\s+\/\s+-name\s+/),
      },
      {
        id: "sr-search-filter",
        instruction: {
          en: "Silence the error noise and keep only clean results: find / -name simple_bash.sh 2>&1 | grep -v \"Permission denied\"",
          el: "Σκότωσε τον θόρυβο σφαλμάτων και κράτα μόνο καθαρά αποτελέσματα: find / -name simple_bash.sh 2>&1 | grep -v \"Permission denied\"",
        },
        hint: { en: "find / -name simple_bash.sh 2>&1 | grep -v \"Permission denied\"", el: "find / -name simple_bash.sh 2>&1 | grep -v \"Permission denied\"" },
        explain: {
          en: "This little chain is three concepts in one: the pipe | feeds the left side's output into the right side's input, 2>&1 folds the error stream into the normal stream, and grep -v drops every line mentioning 'Permission denied'. You will reuse this idiom forever.",
          el: "Αυτή η αλυσίδα είναι τρεις έννοιες σε μια: το pipe | τροφοδοτεί την έξοδο του αριστερού στην είσοδο του δεξιού, το 2>&1 διπλώνει το ρεύμα σφαλμάτων στο κανονικό, και το grep -v πετά κάθε γραμμή που αναφέρει 'Permission denied'. Θα ξαναχρησιμοποιήσεις αυτό το ιδίωμα για πάντα.",
        },
        check: (t) => cmd(t, /2>&1\s*\|\s*grep\s+-v/),
      },
      {
        id: "sr-search-grep",
        instruction: {
          en: "Search the hosts file for anything mentioning hackforge: grep hackforge /etc/hosts",
          el: "Ψάξε το hosts file για οτιδήποτε αναφέρει hackforge: grep hackforge /etc/hosts",
        },
        hint: { en: "grep hackforge /etc/hosts", el: "grep hackforge /etc/hosts" },
        explain: {
          en: "The hosts file maps names to IPs before DNS is even asked — that is why it is prime real estate for attackers (redirecting a victim silently). grepping system files is standard reconnaissance.",
          el: "Το hosts file αντιστοιχίζει ονόματα σε IP πριν καν ρωτηθεί το DNS — γι' αυτό είναι χρυσή περιοχή για επιτιθέμενους (σιωπηλή ανακατεύθυνση θύματος). Το grepping αρχείων συστήματος είναι τυπική αναγνώριση.",
        },
        check: (t) => t.grepped.has("/etc/hosts"),
      },
      {
        id: "sr-search-grepi",
        instruction: {
          en: "The file hackforge.in mixes uppercase WWW and lowercase www. Find ALL of them case-insensitively: grep -i www hackforge.in",
          el: "Το αρχείο hackforge.in αναμειγνύει κεφαλαία WWW και πεζά www. Βρες ΟΛΑ αγνοώντας πεζά/κεφαλαία: grep -i www hackforge.in",
        },
        hint: { en: "grep -i www hackforge.in", el: "grep -i www hackforge.in" },
        explain: {
          en: "Case sensitivity is a silent killer of searches: 'Error', 'ERROR' and 'error' are three different words to a case-sensitive grep. -i makes them one. In the next module you will actually rewrite all of them with sed.",
          el: "Η διάκριση πεζών/κεφαλαίων σκοτώνει σιωπηλά τις αναζητήσεις: 'Error', 'ERROR' και 'error' είναι τρεις διαφορετικές λέξεις για case-sensitive grep. Το -i τις κάνει μια. Στην επόμενη ενότητα θα τις ξαναγράψεις όλες με sed.",
        },
        check: (t) => cmd(t, /^grep\s+-i\s+www\s+.*hackforge\.in/) && t.grepped.has("/home/operator/hackforge.in"),
      },
    ],
    challenges: [
      {
        title: { en: "Needle in the Haystack", el: "Βελόνα στον Σωρό" },
        brief: {
          en: "From the root of the filesystem, find EVERY file whose name ends in .sh with ONE find command (patterns with * are your friend). Clean, complete, one line.",
          el: "Από τη ρίζα, βρες ΚΑΘΕ αρχείο του οποίου το όνομα τελειώνει σε .sh με ΜΙΑ εντολή find (τα patterns με * είναι φίλοι σου). Καθαρά, πλήρως, μία γραμμή.",
        },
        success: { en: "Every .sh on the box — located with a single sweep.", el: "Κάθε .sh στο μηχάνημα — εντοπίστηκε με μία σάρωση." },
        check: (t) => cmd(t, /^find\s+\/\s+-name\s+.+sh/),
      },
      {
        title: { en: "Noise Killer", el: "Δολοφόνος Θορύβου" },
        brief: {
          en: "Search the whole disk for any file with 'hosts' in its name, but your output must contain NO error lines at all — pipe stderr away like a pro.",
          el: "Ψάξε όλο τον δίσκο για αρχείο με «hosts» στο όνομα, αλλά η έξοδός σου δεν πρέπει να έχει ΚΑΜΙΑ γραμμή σφάλματος — στείλε το stderr στη σωλήνα σαν επαγγελματίας.",
        },
        success: { en: "Clean signal, zero noise. Pipes mastered.", el: "Καθαρό σήμα, μηδέν θόρυβος. Κατακτημένα pipes." },
        check: (t) => cmd(t, /find\s+\/.+-name.+hosts/) && cmd(t, /2>&1\s*\|/) ,
      },
    ],
  },

  // ================================================= MODULE 3 — FILE FORGE
  {
    id: "sr-files",
    order: 3,
    icon: "📁",
    color: "from-amber-500 to-orange-700",
    title: { en: "File Forge", el: "Σφυρηλάτηση Αρχείων" },
    subtitle: {
      en: "Create, copy, move, destroy: cat, touch, mkdir, cp, mv, rm, rmdir.",
      el: "Δημιούργησε, αντίγραψε, μετακίνησε, κατέστρεψε: cat, touch, mkdir, cp, mv, rm, rmdir.",
    },
    difficulty: 1,
    badge: { en: "Blacksmith", el: "Σιδεράς" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "Reading files: cat", el: "Ανάγνωση αρχείων: cat" },
        body: {
          en: "cat dumps a file's contents straight to the screen: `cat hackforge.txt`. It concatenates any number of files, so on long files the top scrolls past — that is why similar readers exist (more, less, head, tail — next module). Recon habit: whenever you land on a server, first cat the obvious files: /etc/passwd for accounts, /etc/hosts for name mappings, configuration files for leaking defaults.",
          el: "Το cat ξερνά το περιεχόμενο ενός αρχείου στην οθόνη: `cat hackforge.txt`. Ενώνει όσα αρχεία του δώσεις, οπότε σε μακριά αρχεία η κορυφή χάνεται — γι' αυτό υπάρχουν παρόμοιοι αναγνώστες (more, less, head, tail — επόμενη ενότητα). Συνήθεια αναγνώρισης: όταν προσγειώνεσαι σε server, πρώτα κάνε cat τα προφανή αρχεία: /etc/passwd για λογαριασμούς, /etc/hosts για αντιστοιχίσεις ονομάτων, config αρχεία για προεπιλογές που διαρρέουν.",
        },
      },
      {
        heading: { en: "touch and mkdir — creating from nothing", el: "touch και mkdir — δημιουργία από το τίποτα" },
        body: {
          en: "touch creates an empty file (or refreshes a timestamp): `touch notes.txt`. mkdir builds directories: `mkdir work`, and nested structures in one go. Directories are just special files that list other files — you will make dozens of them per engagement to organize wordlists, loot, scripts and evidence. Disciplined operators keep one project folder per client; chaotic ones lose flags.",
          el: "Το touch δημιουργεί κενό αρχείο (ή ανανεώνει timestamp): `touch notes.txt`. Το mkdir χτίζει φακέλους: `mkdir work`, και φωλιασμένες δομές με μία κίνηση. Οι φάκελοι είναι απλά ειδικά αρχεία που καταγράφουν άλλα αρχεία — θα φτιάχνεις δεκάδες ανά αποστολή για να οργανώνεις wordlists, λάφυρα, scripts και στοιχεία. Οι πειθαρχημένοι operators κρατούν έναν φάκελο per πελάτη· οι άτακτοι χάνουν flags.",
        },
        tip: {
          en: "Promote any throwaway experiment into the ForgeLab/ tree you build in this module.",
          el: "Κάθε πέτα-και-ξέχνα πείραμα βάλτο μέσα στο δέντρο ForgeLab/ που χτίζεις σε αυτή την ενότητα.",
        },
      },
      {
        heading: { en: "cp and mv — copy vs teleport", el: "cp και mv — αντίγραφο εναντίον τηλεμεταφοράς" },
        body: {
          en: "cp duplicates: `cp source.txt backup/source.txt` — the original survives. mv relocates and ALSO renames: `mv old.txt new.txt` renames in place; `mv new.txt folder/` parks it inside a folder keeping the name. There is no 'rename' command in Linux — renaming IS moving. Cyber-relevance: evidence is copied (never altered), payloads are moved (never duplicated in the open). Remember the difference between copying a file and moving it under time pressure.",
          el: "Το cp διπλασιάζει: `cp source.txt backup/source.txt` — το πρωτότυπο επιβιώνει. Το mv μετατοπίζει και ΕΠΙΣΗΣ μετονομάζει: το `mv old.txt new.txt` μετονομάζει επί τόπου· το `mv new.txt folder/` το παρκάρει σε φάκελο κρατώντας το όνομα. Δεν υπάρχει εντολή «rename» στο Linux — η μετονομασία ΕΙΝΑΙ μετακίνηση. Στον κυβερνοχώρο: τα αποδεικτικά αντιγράφονται (ποτέ δεν αλλοιώνονται), τα payloads μετακινούνται (ποτέ δεν διπλασιάζονται στη φόρα). Θυμήσου τη διαφορά αντίγραφου/μετακίνησης υπό πίεση χρόνου.",
        },
      },
      {
        heading: { en: "rm and rmdir — there is no recycle bin", el: "rm και rmdir — δεν υπάρχει κάδος ανακύκλωσης" },
        body: {
          en: "rm deletes files permanently: `rm junk.txt`. rmdir removes ONLY empty directories: `rmdir empty_folder`. For directories with contents, rm needs the recursive flag: `rm -r folder` — this walks down and deletes everything, and it never asks twice. One mistyped path as root has ended more careers than any zero-day. Rule of the lab: before hitting Enter on any rm -r, read the command out loud. (In this sandbox worst case you re-open the module — cherish that safety net while you learn.)",
          el: "Το rm σβήνει αρχεία οριστικά: `rm junk.txt`. Το rmdir αφαιρεί ΜΟΝΟ άδειους φακέλους: `rmdir empty_folder`. Για φακέλους με περιεχόμενο, το rm θέλει το αναδρομικό flag: `rm -r folder` — κατεβαίνει και σβήνει τα πάντα, και δεν ρωτά δεύτερη φορά. Μία διαδρομή που γράφτηκε λάθος ως root έχει τελειώσει περισσότερες καριέρες από κάθε zero-day. Κανόνας του εργαστηρίου: πριν πατήσεις Enter σε οποιοδήποτε rm -r, διάβασε την εντολή δυνατά. (Στο sandbox το χειρότερο είναι να ξανανοίξεις την ενότητα — εκτίμησε αυτό το δίχτυ ασφαλείας όσο μαθαίνεις.)",
        },
      },
    ],
    cheats: [
      { cmd: "cat f", desc: { en: "Print a file to the screen", el: "Εκτύπωση αρχείου στην οθόνη" } },
      { cmd: "touch f", desc: { en: "Create an empty file", el: "Δημιουργία κενού αρχείου" } },
      { cmd: "mkdir d", desc: { en: "Create a directory", el: "Δημιουργία φακέλου" } },
      { cmd: "cp src dst", desc: { en: "Copy a file (keeps the original)", el: "Αντίγραφο αρχείου (το πρωτότυπο μένει)" } },
      { cmd: "mv old new", desc: { en: "Move OR rename in place", el: "Μετακίνηση Ή μετονομασία" } },
      { cmd: "rm f", desc: { en: "Delete a file — permanent!", el: "Διαγραφή αρχείου — οριστική!" } },
      { cmd: "rmdir d / rm -r d", desc: { en: "Remove empty dir / whole tree", el: "Διαγραφή άδειου φακέλου / όλου του δέντρου" } },
    ],
    tasks: [
      {
        id: "sr-files-cat",
        instruction: {
          en: "Read the platform manifesto: cat hackforge.txt",
          el: "Διάβασε το μανιφέστο της πλατφόρμας: cat hackforge.txt",
        },
        hint: { en: "cat hackforge.txt", el: "cat hackforge.txt" },
        explain: {
          en: "cat prints files entirely. Another useful variant: cat -n adds line numbers. On victim systems, cat'ing dotfiles and configs is step one of looting.",
          el: "Το cat τυπώνει αρχεία ολόκληρα. Χρήσιμη παραλλαγή: το cat -n βάζει αρίθμηση γραμμών. Σε θύματα, το cat dotfiles και configs είναι το βήμα ένα της λεηλασίας.",
        },
        check: (t) => t.readFiles.has("/home/operator/hackforge.txt"),
      },
      {
        id: "sr-files-touch",
        instruction: {
          en: "Create an empty working note file: touch forge.txt — then prove it exists with ls.",
          el: "Δημιούργησε ένα κενό σημειωματάριο: touch forge.txt — και μετά απόδειξέ το με ls.",
        },
        hint: { en: "touch forge.txt  then  ls", el: "touch forge.txt  και μετά  ls" },
        explain: {
          en: "touch is the fastest way to stake a claim on a filename. Scripts also use it to create lock-files and markers. ls afterwards confirms the file now exists in your home.",
          el: "Το touch είναι ο γρηγορότερος τρόπος να «πιάσεις» ένα όνομα αρχείου. Τα scripts το χρησιμοποιούν και για lock-files και markers. Το ls μετά επιβεβαιώνει ότι το αρχείο υπάρχει πια στο home σου.",
        },
        check: (t) => t.exists("/home/operator/forge.txt"),
      },
      {
        id: "sr-files-mkdir",
        instruction: {
          en: "Build your working area: mkdir ForgeLab — and check it appeared (ls).",
          el: "Χτίσε τον χώρο δουλειάς σου: mkdir ForgeLab — και έλεγξε ότι εμφανίστηκε (ls).",
        },
        hint: { en: "mkdir ForgeLab", el: "mkdir ForgeLab" },
        explain: {
          en: "One folder per mission — ForgeLab will hold every experiment from this module. Organization is an offensive skill: on a two-day red-team operation, the folder tree is the difference between 'report delivered' and 'where did I put that hash?'.",
          el: "Ένας φάκελος ανά αποστολή — το ForgeLab θα κρατήσει κάθε πείραμα της ενότητας. Η οργάνωση είναι επιθετική δεξιότητα: σε διήμερη red-team επιχείρηση, το δέντρο φακέλων είναι η διαφορά μεταξύ «παραδόθηκε αναφορά» και «πού έβαλα εκείνο το hash;».",
        },
        check: (t) => t.exists("/home/operator/ForgeLab"),
      },
      {
        id: "sr-files-mkdir2",
        instruction: {
          en: "Grow the tree one level deeper in one command: mkdir ForgeLab/lab1 then mkdir ForgeLab/lab2 (paths can point inside folders).",
          el: "Μεγάλωσε το δέντρο ένα επίπεδο βαθύτερα: mkdir ForgeLab/lab1 και mkdir ForgeLab/lab2 (οι διαδρομές δείχνουν σε φακέλους).",
        },
        hint: { en: "mkdir ForgeLab/lab1  and  mkdir ForgeLab/lab2", el: "mkdir ForgeLab/lab1  και  mkdir ForgeLab/lab2" },
        explain: {
          en: "You never need to cd into a place to build inside it — relative paths do the job. ls ForgeLab should now show lab1 and lab2 side by side.",
          el: "Δεν χρειάζεται ποτέ να μπεις με cd κάπου για να χτίσεις εκεί — οι σχετικές διαδρομές το κάνουν. Το ls ForgeLab θα δείχνει τώρα lab1 και lab2 δίπλα-δίπλα.",
        },
        check: (t) => t.exists("/home/operator/ForgeLab/lab1") && t.exists("/home/operator/ForgeLab/lab2"),
      },
      {
        id: "sr-files-cp",
        instruction: {
          en: "Back up the manifesto into your lab: cp hackforge.txt ForgeLab/ — verify with ls ForgeLab.",
          el: "Πάρε αντίγραφο του μανιφέστου στο εργαστήριό σου: cp hackforge.txt ForgeLab/ — έλεγξε με ls ForgeLab.",
        },
        hint: { en: "cp hackforge.txt ForgeLab/", el: "cp hackforge.txt ForgeLab/" },
        explain: {
          en: "cp into a directory keeps the original filename. Now two copies exist: the one at home and the lab copy. Editing one leaves the other intact — that is exactly what 'backup' means.",
          el: "Το cp σε φάκελο κρατά το αρχικό όνομα. Τώρα υπάρχουν δύο αντίγραφα: αυτό στο home και το αντίγραφο του lab. Το να πειράξεις το ένα αφήνει το άλλο άθικτο — αυτό ακριβώς σημαίνει «backup».",
        },
        check: (t) => t.fileContent("/home/operator/ForgeLab/hackforge.txt") !== null,
      },
      {
        id: "sr-files-mv",
        instruction: {
          en: "Move your empty note into the lab under a new name: mv forge.txt ForgeLab/moved.txt — confirm forge.txt is gone from home.",
          el: "Μετακίνησε το κενό σημείωμα στο lab με νέο όνομα: mv forge.txt ForgeLab/moved.txt — επιβεβαίωσε ότι το forge.txt έφυγε από το home.",
        },
        hint: { en: "mv forge.txt ForgeLab/moved.txt  then  ls", el: "mv forge.txt ForgeLab/moved.txt  και μετά  ls" },
        explain: {
          en: "One mv did three things: renamed + relocated + removed the original entry. mv NEVER leaves the source behind. Run ls at home: forge.txt has vanished; ls ForgeLab shows moved.txt instead.",
          el: "Ένα mv έκανε τρία πράγματα: μετονόμασε + μετέφερε + αφαίρεσε την αρχική καταχώρηση. Το mv ΠΟΤΕ δεν αφήνει πίσω την πηγή. Τρέξε ls στο home: το forge.txt εξαφανίστηκε· το ls ForgeLab δείχνει moved.txt στη θέση του.",
        },
        check: (t) => t.exists("/home/operator/ForgeLab/moved.txt") && !t.exists("/home/operator/forge.txt"),
      },
      {
        id: "sr-files-rm",
        instruction: {
          en: "Practice safe destruction: touch delete_me.txt to create a sacrificial file, then rm delete_me.txt to erase it. Verify with ls.",
          el: "Εξάσκηση στην ασφαλή καταστροφή: touch delete_me.txt για θυσιαστήριο αρχείο, και rm delete_me.txt για σβήσιμο. Έλεγξε με ls.",
        },
        hint: { en: "touch delete_me.txt  then  rm delete_me.txt", el: "touch delete_me.txt  και μετά  rm delete_me.txt" },
        explain: {
          en: "rm in Linux bypasses any trash can: deleted means deleted. That is why professionals rehearse deletion with sacrificial files first, exactly like you just did.",
          el: "Το rm στο Linux παρακάμπτει κάθε κάδο: σβησμένο σημαίνει σβησμένο. Γι' αυτό οι επαγγελματίες κάνουν πρόβα διαγραφής με θυσιαστήρια αρχεία πρώτα, ακριβώς όπως έκανες τώρα.",
        },
        check: (t) => cmd(t, /^rm\s+delete_me\.txt\b/) && !t.exists("/home/operator/delete_me.txt"),
      },
      {
        id: "sr-files-rmdir",
        instruction: {
          en: "lab2 is still empty — remove it the polite way: rmdir ForgeLab/lab2",
          el: "Το lab2 είναι ακόμα άδειο — αφαίρεσέ το ευγενικά: rmdir ForgeLab/lab2",
        },
        hint: { en: "rmdir ForgeLab/lab2", el: "rmdir ForgeLab/lab2" },
        explain: {
          en: "rmdir refuses to delete a directory that still holds anything — a built-in safety lock. On a real box you will love that refusal; it has saved countless researchers from one rushed Enter.",
          el: "Το rmdir αρνείται να σβήσει φάκελο που κρατά ακόμα κάτι — ενσωματωμένη ασφάλεια. Σε πραγματικό μηχάνημα θα λατρέψεις αυτή την άρνηση· έχει σώσει αμέτρητους ερευνητές από ένα βιαστικό Enter.",
        },
        check: (t) => !t.exists("/home/operator/ForgeLab/lab2") && cmd(t, /^rmdir\s/),
      },
      {
        id: "sr-files-rmr",
        instruction: {
          en: "Final cleanup: tear down the whole lab tree (lab1 and all files inside it) with rm -r ForgeLab — then ls to prove the slate is clean.",
          el: "Τελικός καθαρισμός: γκρέμισε όλο το δέντρο του lab (το lab1 και όλα τα αρχεία μέσα) με rm -r ForgeLab — και ls για απόδειξη.",
        },
        hint: { en: "rm -r ForgeLab  then  ls", el: "rm -r ForgeLab  και μετά  ls" },
        explain: {
          en: "The -r flag makes rm recursive: directories, subdirectories and files, all gone in one shot. This is the single most destructive flag combination in daily Linux use. Total respect for rm -r from day one.",
          el: "Το flag -r κάνει το rm αναδρομικό: φάκελοι, υποφάκελοι και αρχεία, όλα φεύγουν μονομιάς. Είναι ο πιο καταστροφικός συνδυασμός flag στην καθημερινή χρήση του Linux. Απόλυτος σεβασμός στο rm -r από την πρώτη μέρα.",
        },
        check: (t) => cmd(t, /^rm\s+-[a-z]*r/) && !t.exists("/home/operator/ForgeLab"),
      },
    ],
    challenges: [
      {
        title: { en: "Evidence Locker", el: "Θυρίδα Αποδεικτικών" },
        brief: {
          en: "Create a folder Documents/reports, copy the trainee note (Documents/ignite/notes.txt) into it WITHOUT changing its name, then read the copy. Chain it correctly: directory first, copy second, read last.",
          el: "Φτιάξε φάκελο Documents/reports, αντίγραψε μέσα το σημείωμα του εκπαιδευόμενου (Documents/ignite/notes.txt) ΧΩΡΙΣ να αλλάξει όνομα, και διάβασε το αντίγραφο. Σωστή σειρά: φάκελος, αντίγραφο, ανάγνωση.",
        },
        success: { en: "Evidence copied intact and read from its new home.", el: "Απόδειξη αντιγραμμένη άθικτη και αναγνωσμένη στο νέο της σπίτι." },
        check: (t) => t.fileContent("/home/operator/Documents/reports/notes.txt") !== null && t.readFiles.has("/home/operator/Documents/reports/notes.txt"),
      },
      {
        title: { en: "Recycle Flow", el: "Ροή Ανακύκλωσης" },
        brief: {
          en: "In your home directory, run this lifecycle: touch a.log, rename it to swap.log (mv), copy swap.log to keep.log (cp), then delete swap.log (rm). Success = keep.log exists while swap.log does not.",
          el: "Στο home σου, τρέξε τον κύκλο: touch a.log, μετονόμασέ το σε swap.log (mv), αντίγραψε το swap.log σε keep.log (cp), και σβήσε το swap.log (rm). Επιτυχία = το keep.log υπάρχει ενώ το swap.log όχι.",
        },
        success: { en: "Full create-rename-copy-delete cycle, clean state. The forge is yours.", el: "Πλήρης κύκλος δημιουργία-μετονομασία-αντιγραφή-διαγραφή, καθαρή κατάσταση. Η σφυρηλατησία σου ανήκει." },
        check: (t) => t.exists("/home/operator/keep.log") && !t.exists("/home/operator/swap.log") && cmd(t, /^cp\s+swap\.log\s+keep\.log/),
      },
    ],
  },

  // ================================================= MODULE 4 — TEXT SMITH
  {
    id: "sr-text",
    order: 4,
    icon: "📝",
    color: "from-teal-500 to-cyan-700",
    title: { en: "Text Smith", el: "Σιδεράς Κειμένων" },
    subtitle: {
      en: "Slice, number and rewrite text: head, tail, nl, sed, more, less.",
      el: "Κόψε, αρίθμησε και ξαναγράψε κείμενο: head, tail, nl, sed, more, less.",
    },
    difficulty: 2,
    badge: { en: "Wordsmith", el: "Λογοτεχνίας Μάστορας" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "head and tail — the ends matter most", el: "head και tail — τα άκρα έχουν σημασία" },
        body: {
          en: "Long configuration files and logs are rarely interesting in the middle. head prints the FIRST ten lines of a file (`head /etc/ettercap/etter.dns` — our training target, over thirty lines of DNS mappings), tail prints the LAST ten. Add a number to size the window: `head -3`, `tail -3`. Security usage: head reveals who wrote a config and when; tail on a live log shows the most recent events — and `tail -f` on real systems follows the log as it grows, the standard way to watch attacks arrive in real time.",
          el: "Τα μακριά config αρχεία και logs σπάνια ενδιαφέρουν στη μέση. Το head τυπώνει τις ΠΡΩΤΕΣ δέκα γραμμές (`head /etc/ettercap/etter.dns` — ο εκπαιδευτικός μας στόχος, πάνω από τριάντα γραμμές DNS αντιστοιχίσεων), το tail τυπώνει τις ΤΕΛΕΥΤΑΙΕΣ δέκα. Βάλε αριθμό για το παράθυρο: `head -3`, `tail -3`. Χρήση ασφάλειας: το head δείχνει ποιος έγραψε ένα config και πότε· το tail σε ζωντανό log δείχνει τα πιο πρόσφατα γεγονότα — και το `tail -f` ακολουθεί το log καθώς μεγαλώνει, ο τυπικός τρόπος να βλέπεις επιθέσεις να φτάνουν σε πραγματικό χρόνο.",
        },
      },
      {
        heading: { en: "nl — number every line", el: "nl — αρίθμησε κάθε γραμμή" },
        body: {
          en: "When a teammate says 'check line nineteen', guessing is over: `nl /etc/ettercap/etter.dns` prints the file with line numbers. Two reasons this matters in our world. First, exploit documentation and error messages point at line positions constantly. Second, in a DNS-spoof configuration like etter.dns (the file used to redirect victims' browsers), the exact placement of each malicious mapping is the whole attack — one line of numbers is the difference between a working redirect and a dead one.",
          el: "Όταν συνάδελφος λέει «κοίταξε τη γραμμή δεκαεννέα», το μαντάτεψμα τελείωσε: το `nl /etc/ettercap/etter.dns` τυπώνει το αρχείο με αρίθμηση. Δύο λόγοι που μετράει. Πρώτον, η τεκμηρίωση exploits και τα μηνύματα σφαλμάτων δείχνουν συνέχεια θέσεις γραμμών. Δεύτερον, σε ρύθμιση DNS-spoof όπως το etter.dns (το αρχείο που ανακατευθύνει browsers θυμάτων), η ακριβής θέση κάθε κακόβουλης αντιστοίχισης ΕΙΝΑΙ η επίθεση — μια γραμμή αριθμών είναι η διαφορά μεταξύ δουλεύοντας redirect και νεκρού.",
        },
      },
      {
        heading: { en: "sed — rewrite without an editor", el: "sed — ξαναγράφω χωρίς editor" },
        body: {
          en: "sed is a surgery robot for text. The formula `sed s/old/new/g file` replaces every 'old' with 'new' on every line and prints the result WITHOUT touching the file. Add `-i` to actually edit in place: `sed -i 's/WWW/www/g' hackforge.in` permanently rewrites the file. Deconstructing the spell: s means substitute, the first /.../ is the target, the second /.../ is the replacement, and the trailing g means 'every occurrence per line, not just the first'. Operators use sed to normalize wordlists, strip junk from dumps, and patch config files on machines where no editor exists.",
          el: "Το sed είναι χειρουργικό ρομπότ για κείμενο. Ο τύπος `sed s/old/new/g file` αντικαθιστά κάθε 'old' με 'new' σε κάθε γραμμή και τυπώνει το αποτέλεσμα ΧΩΡΙΣ να αγγίξει το αρχείο. Με `-i` επεξεργάζεται επιτόπου: το `sed -i 's/WWW/www/g' hackforge.in` ξαναγράφει οριστικά το αρχείο. Αποσυναρμολογώντας το ξόρκι: το s σημαίνει substitute, το πρώτο /.../ είναι ο στόχος, το δεύτερο /.../ η αντικατάσταση, και το τελικό g σημαίνει «κάθε εμφάνιση ανά γραμμή, όχι μόνο η πρώτη». Οι operators χρησιμοποιούν sed για να ομαλοποιούν wordlists, να καθαρίζουν dumps, και να κλειστοπατσώνουν configs σε μηχανήματα χωρίς editor.",
        },
        tip: {
          en: "Always run the NON-destructive version first (no -i), inspect the output, then add -i with confidence.",
          el: "Πρώτα τρέχε τη ΜΗ καταστροφική έκδοση (χωρίς -i), κοίταξε την έξοδο, και μετά βάλε -i με σιγουριά.",
        },
      },
      {
        heading: { en: "more and less — paging through walls of text", el: "more και less — σελιδοποίηση τοίχων κειμένου" },
        body: {
          en: "When a file is longer than your screen, cat becomes a blur. more shows one screen at a time (space advances, it exits at the end); less is the grown-up version — scroll up and down, search with /, quit with q ('less is more', hackers joke, because less can do everything more can — and more). Choose your pager and bind it to muscle memory, because most of your future reading — logs, dumps, source — flows through one.",
          el: "Όταν ένα αρχείο είναι μακρύτερο από την οθόνη, το cat γίνεται θόλωση. Το more δείχνει μια οθόνη κάθε φορά (το space προχωρά, βγαίνει στο τέλος)· το less είναι η ενήλικη εκδοχή — scroll πάνω-κάτω, αναζήτηση με /, έξοδος με q («less is more», αστειεύονται οι hackers, γιατί το less κάνει ό,τι το more — και περισσότερα). Διάλεξε τον pager σου και δέσε τον στο μυϊκό σου μνήμη, γιατί το μεγαλύτερο μέρος της μελλοντικής σου ανάγνωσης — logs, dumps, source — περνά από έναν.",
        },
      },
    ],
    cheats: [
      { cmd: "head file", desc: { en: "First 10 lines of a file", el: "Πρώτες 10 γραμμές αρχείου" } },
      { cmd: "tail file / tail -3 f", desc: { en: "Last lines (sized window)", el: "Τελευταίες γραμμές (ρυθμιζόμενο)" } },
      { cmd: "nl file", desc: { en: "Print with line numbers", el: "Εκτύπωση με αρίθμηση γραμμών" } },
      { cmd: "sed s/a/b/g file", desc: { en: "Show substitutions (read-only)", el: "Εμφάνιση αντικαταστάσεων (χωρίς αλλαγή)" } },
      { cmd: "sed -i 's/a/b/g' file", desc: { en: "Actually rewrite the file", el: "Πραγματική επανεγγραφή αρχείου" } },
      { cmd: "more file", desc: { en: "Page forward through a file", el: "Σελίδες προς τα εμπρός" } },
      { cmd: "less file", desc: { en: "Page both ways, search with /", el: "Σελίδες αμφίδρομα, αναζήτηση με /" } },
    ],
    tasks: [
      {
        id: "sr-text-head",
        instruction: {
          en: "Peek at the top of the DNS-spoof config: head /etc/ettercap/etter.dns",
          el: "Κοίταξε την κορυφή του DNS-spoof config: head /etc/ettercap/etter.dns",
        },
        hint: { en: "head /etc/ettercap/etter.dns", el: "head /etc/ettercap/etter.dns" },
        explain: {
          en: "The first lines of etter.dns are comments explaining the format (hostname / record type / IP). Getting the layout of a config before touching it is rule zero of responsible poking.",
          el: "Οι πρώτες γραμμές του etter.dns είναι σχόλια που εξηγούν τη μορφή (hostname / τύπος εγγραφής / IP). Το να μαθαίνεις τη δομή ενός config πριν το αγγίξεις είναι ο κανόνας μηδέν του υπεύθυνου ψαξίματος.",
        },
        check: (t) => cmd(t, /^head\s+.*etter\.dns/),
      },
      {
        id: "sr-text-tail",
        instruction: {
          en: "Now inspect the bottom of the same file — configs love surprises at the end: tail /etc/ettercap/etter.dns",
          el: "Κοίταξε τώρα το κάτω μέρος του ίδιου αρχείου — τα configs λατρεύουν τις εκπλήξεις στο τέλος: tail /etc/ettercap/etter.dns",
        },
        hint: { en: "tail /etc/ettercap/etter.dns", el: "tail /etc/ettercap/etter.dns" },
        explain: {
          en: "The tail is where scripts append new entries and where attackers hide their extra lines. A file you only ever head is a file half-read.",
          el: "Στο tail προσθέτουν τα scripts νέες καταχωρήσεις και εκεί κρύβουν οι επιτιθέμενοι τις έξτρα γραμμές τους. Αρχείο που βλέπεις μόνο με head είναι μισοδιαβασμένο αρχείο.",
        },
        check: (t) => cmd(t, /^tail\s+.*etter\.dns/),
      },
      {
        id: "sr-text-nl",
        instruction: {
          en: "Map the whole file with line numbers: nl /etc/ettercap/etter.dns — how many entries does it have?",
          el: "Χαρτογράφησε όλο το αρχείο με αρίθμηση: nl /etc/ettercap/etter.dns — πόσες καταχωρήσεις έχει;",
        },
        hint: { en: "nl /etc/ettercap/etter.dns", el: "nl /etc/ettercap/etter.dns" },
        explain: {
          en: "Over thirty lines — comment header plus two dozen mappings. Line numbers turn 'somewhere in the middle' into precise coordinates you can discuss, document and patch.",
          el: "Πάνω από τριάντα γραμμές — κεφαλίδα σχολίων και δύο καρολυμβολές αντιστοιχίσεις. Η αρίθμηση μετατρέπει το «κάπου στη μέση» σε ακριβείς συντεταγμένες για συζήτηση, τεκμηρίωση και patch.",
        },
        check: (t) => t.nlRan && cmd(t, /^nl\s+.*etter\.dns/),
      },
      {
        id: "sr-text-more",
        instruction: {
          en: "Page through the file screen by screen with: more /etc/ettercap/etter.dns",
          el: "Γύρνα το αρχείο οθόνη-οθόνη με: more /etc/ettercap/etter.dns",
        },
        hint: { en: "more /etc/ettercap/etter.dns", el: "more /etc/ettercap/etter.dns" },
        explain: {
          en: "more = forward-only pager. On real systems you advance with space and it quits at the end. Pagers exist because log review is 90% of the security analyst's life.",
          el: "more = pager μόνο προς τα εμπρός. Σε πραγματικά συστήματα προχωράς με space και τερματίζει στο τέλος. Οι pagers υπάρχουν γιατί η ανάγνωση logs είναι το 90% της ζωής του analyst ασφάλειας.",
        },
        check: (t) => cmd(t, /^more\s+.*etter\.dns/),
      },
      {
        id: "sr-text-less",
        instruction: {
          en: "Now with the full-power pager: less /etc/ettercap/etter.dns (less can move in both directions)",
          el: "Τώρα με τον πλήρη pager: less /etc/ettercap/etter.dns (το less κινείται προς τις δύο κατευθύνσεις)",
        },
        hint: { en: "less /etc/ettercap/etter.dns", el: "less /etc/ettercap/etter.dns" },
        explain: {
          en: "'less is more' — the classic hacker pun. One rule of thumb: boring grep results? Pipe them into less and read calmly: grep -i error logfile.txt | less.",
          el: "«less is more» — το κλασικό λογοπαίγνιο των hackers. Ένας κανόνας: βαρετά αποτελέσματα grep; Πέρνα τα από less και διάβασε ήρεμα: grep -i error logfile.txt | less.",
        },
        check: (t) => cmd(t, /^less\s+.*etter\.dns/),
      },
      {
        id: "sr-text-sed",
        instruction: {
          en: "Dry-run a mass fix: show what would happen if every uppercase WWW became lowercase: sed s/WWW/www/g hackforge.in — notice the file itself is NOT changed yet.",
          el: "Δοκιμαστική μαζική διόρθωση: δες τι θα γινόταν αν κάθε κεφαλαίο WWW γινόταν πεζό: sed s/WWW/www/g hackforge.in — πρόσεξε ότι το αρχείο ΔΕΝ άλλαξε ακόμα.",
        },
        hint: { en: "sed s/WWW/www/g hackforge.in", el: "sed s/WWW/www/g hackforge.in" },
        explain: {
          en: "Without -i, sed prints the result to the screen only. This dry-run habit — look first, then commit — is how you avoid waking up the whole on-call team with a wrecked config.",
          el: "Χωρίς -i, το sed τυπώνει το αποτέλεσμα μόνο στην οθόνη. Αυτή η συνήθεια dry-run — κοίτα πρώτα, δέσμευσου μετά — σε γλιτώνει από ξυπνημένους on-call με κατεστραμμένο config.",
        },
        check: (t) => t.sedRan && cmd(t, /^sed\s+s\/WWW\/www\/g/),
      },
      {
        id: "sr-text-sedi",
        instruction: {
          en: "Commit the change for real: sed -i 's/WWW/www/g' hackforge.in — then prove the file is clean: grep -i www hackforge.in (every line lowercase now).",
          el: "Εφάρμοσε την αλλαγή οριστικά: sed -i 's/WWW/www/g' hackforge.in — και μετά απόδειξε ότι είναι καθαρό: grep -i www hackforge.in (όλες οι γραμμές πλέον πεζές).",
        },
        hint: { en: "sed -i 's/WWW/www/g' hackforge.in  then  grep -i www hackforge.in", el: "sed -i 's/WWW/www/g' hackforge.in  και μετά  grep -i www hackforge.in" },
        explain: {
          en: "The -i flag edits in place: no output, file rewritten. cat or grep afterwards ALWAYS completes the loop — verify what you mutated. That loop (change → verify) is the entire discipline of configuration management in miniature.",
          el: "Το flag -i επεξεργάζεται επιτόπου: καμία έξοδος, το αρχείο ξαναγράφτηκε. Το cat ή grep μετά ΚΛΕΙΝΕΙ πάντα τον βρόχο — επαλήθευσε ό,τι μετέβαλες. Αυτός ο βρόχος (αλλαγή → επαλήθευση) είναι όλη η πειθαρχία του configuration management σε μικρογραφία.",
        },
        check: (t) => {
          const c = t.fileContent("/home/operator/hackforge.in") || "";
          return c.length > 0 && !c.includes("WWW") && t.grepped.has("/home/operator/hackforge.in");
        },
      },
    ],
    challenges: [
      {
        title: { en: "Undo the Undo", el: "Αναίρεση της Αναίρεσης" },
        brief: {
          en: "The training file must shout again: rewrite hackforge.in so every lowercase 'www' becomes uppercase 'WWW' — permanently, with sed -i. Verify by cat'ing the file.",
          el: "Το εκπαιδευτικό αρχείο πρέπει πάλι να φωνάζει: ξαναγράψε το hackforge.in ώστε κάθε πεζό 'www' να γίνει κεφαλαίο 'WWW' — οριστικά, με sed -i. Επαλήθευσε με cat.",
        },
        success: { en: "sed round-tripped the file in both directions. True text smithery.", el: "Το sed γύρισε το αρχείο και προς τις δύο κατευθύνσεις. Αληθινή σιδηρουργεία κειμένου." },
        check: (t) => {
          const c = t.fileContent("/home/operator/hackforge.in") || "";
          return c.includes("WWW") && t.readFiles.has("/home/operator/hackforge.in");
        },
      },
      {
        title: { en: "Host Trap", el: "Παγίδα Ονομάτων" },
        brief: {
          en: "Plant a mapping in /etc/hosts: append the line '192.168.4.66 trap.hackforge.lab' using echo with the append operator (>>)... then show only the LAST line of the file with tail to admire your work. (Two commands, zero editors.)",
          el: "Φύτεψε αντιστοίχιση στο /etc/hosts: πρόσθεσε τη γραμμή '192.168.4.66 trap.hackforge.lab' με echo και τον τελεστή προσάρτησης (>>)... και μετά δείξε μόνο την ΤΕΛΕΥΤΑΙΑ γραμμή του αρχείου με tail για τον θαυμασμό σου. (Δύο εντολές, μηδέν editors.)",
        },
        success: { en: "A hosts entry appended and confirmed — redirection learned for life.", el: "Καταχώρηση hosts προστέθηκε και επιβεβαιώθηκε — η ανακατεύθυνση μαθεύτηκε για πάντα." },
        check: (t) => (t.fileContent("/etc/hosts") || "").includes("trap.hackforge.lab") && cmd(t, /^tail\s+.*hosts/),
      },
    ],
  },

  // ================================================= MODULE 5 — PACKAGE OPS
  {
    id: "sr-apt",
    order: 5,
    icon: "📦",
    color: "from-violet-500 to-purple-700",
    title: { en: "Package Ops", el: "Επιχειρήσεις Πακέτων" },
    subtitle: {
      en: "Install, remove, purge, update like Kali does: apt-cache & apt-get.",
      el: "Εγκατάσταση, αφαίρεση, εκκαθάριση, ενημέρωση όπως στο Kali: apt-cache & apt-get.",
    },
    difficulty: 2,
    badge: { en: "Quartermaster", el: "Οικονόμος" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "Where software comes from", el: "Από πού έρχεται το λογισμικό" },
        body: {
          en: "Debian-family distros (Kali, Ubuntu, Parrot) manage software as packages fetched from repositories. The list of repositories lives in one plain file: /etc/apt/sources.list. Every install, upgrade and security fix flows through it. In security exercises, a tampered sources.list is its own attack story — a system pulling updates from an attacker-controlled mirror eats poison daily. cat that file whenever you audit a machine.",
          el: "Οι διανομές οικογένειας Debian (Kali, Ubuntu, Parrot) διαχειρίζονται λογισμικό ως πακέτα από repositories. Η λίστα τους ζει σε ένα απλό αρχείο: /etc/apt/sources.list. Κάθε εγκατάσταση, αναβάθμιση και διόρθωση ασφάλειας περνά από αυτό. Στις ασκήσεις ασφάλειας, ένα παραβιασμένο sources.list είναι μια ολόκληρη ιστορία επίθεσης — σύστημα που τραβά ενημερώσεις από mirror επιτιθέμενου τρώει δηλητήριο καθημερινά. Κάνε cat εκείνο το αρχείο σε κάθε audit.",
        },
      },
      {
        heading: { en: "apt-cache search — look before you leap", el: "apt-cache search — κοίτα πρίν πηδήξεις" },
        body: {
          en: "Unsure of the exact package name? Query the cache first: `apt-cache search hydra` lists every package matching the term with a one-line description. No permissions needed, nothing changes on the system — it is pure reconnaissance. Drill: search first, capture the exact package name, then install precisely that. Blind `apt-get install whatever-spelled-close` is how people end up with something unexpected on their box.",
          el: "Δεν είσαι σίγουρος για το ακριβές όνομα πακέτου; Ρώτα πρώτα την cache: το `apt-cache search hydra` δείχνει κάθε πακέτο που ταιριάζει με μια μικρή περιγραφή. Δεν χρειάζονται δικαιώματα, τίποτα δεν αλλάζει στο σύστημα — είναι καθαρή αναγνώριση. Άσκηση: αναζήτησε πρώτα, κράτα το ακριβές όνομα, μετά εγκατάστησε ακριβώς αυτό. Τυφλό `apt-get install κάτι-περίπου-έτσι` είναι ο τρόπος να καταλήξεις με απρόσμενο πράγμα στο μηχάνημά σου.",
        },
      },
      {
        heading: { en: "install, remove, purge — three depths of surgery", el: "install, remove, purge — τρία βάθη χειρουργείου" },
        body: {
          en: "`apt-get install git` downloads and sets up a package. `apt-get remove git` uninstalls the program but LEAVES its configuration files behind — handy if you plan to reinstall. `apt-get purge git` cuts everything: program AND configs, like it never existed. The professional habit: install a tool for a job, purge it after the engagement, leave the box exactly as the client handed it to you.",
          el: "Το `apt-get install git` κατεβάζει και στήνει πακέτο. Το `apt-get remove git` απεγκαθιστά το πρόγραμμα αλλά ΑΦΗΝΕΙ τα configuration αρχεία πίσω — χρήσιμο αν σκοπεύεις να ξαναεγκαταστήσεις. Το `apt-get purge git` κόβει τα πάντα: πρόγραμμα ΚΑΙ configs, σαν να μην υπήρξε ποτέ. Η επαγγελματική συνήθεια: εγκατέστησε εργαλείο για μια δουλειά, κάνε το purge μετά την αποστολή, άφησε το box ακριβώς όπως σου το παρέδωσε ο πελάτης.",
        },
        tip: {
          en: "Verify installs instantly with which <tool>: if the shell can find the binary, the install worked.",
          el: "Επαλήθευε εγκαταστάσεις στιγμιαία με which <tool>: αν το shell βρίσκει το binary, η εγκατάσταση πέτυχε.",
        },
      },
      {
        heading: { en: "update and upgrade — keeping the knife sharp", el: "update και upgrade — κρατώντας το μαχαίρι ακονισμένο" },
        body: {
          en: "Two commands everyone confuses. `apt-get update` downloads the latest package LISTS from the repositories — nothing on your machine changes, you just learn what exists now. `apt-get upgrade` then installs the actually newer versions. The golden order is update FIRST, upgrade SECOND — upgrading with stale lists is how version conflicts happen. On Kali, run the pair at least weekly; on client engagements, never upgrade a production box without permission (a surprising number of assessments have sunk applications that way).",
          el: "Δύο εντολές που όλοι μπερδεύουν. Το `apt-get update` κατεβάζει τις τελευταίες ΛΙΣΤΕΣ πακέτων από τα repositories — τίποτα στο μηχάνημά σου δεν αλλάζει, απλά μαθαίνεις τι υπάρχει πλέον. Το `apt-get upgrade` μετά εγκαθιστά τις όντως νεότερες εκδόσεις. Η χρυσή σειρά είναι update ΠΡΩΤΑ, upgrade ΔΕΥΤΕΡΑ — αναβάθμιση με σάπιες λίστες γεννά συγκρούσεις εκδόσεων. Σε Kali, τρέχε το ζεύγος τουλάχιστον εβδομαδιαίως· σε πελάτες, μην κάνεις ποτέ upgrade production box χωρίς άδεια (παραδόξως πολλά assessments έχουν βυθίσει applications έτσι).",
        },
      },
    ],
    cheats: [
      { cmd: "apt-cache search x", desc: { en: "Search the package cache", el: "Αναζήτηση στην cache πακέτων" } },
      { cmd: "apt-get install x", desc: { en: "Download + set up package", el: "Λήψη + εγκατάσταση πακέτου" } },
      { cmd: "apt-get remove x", desc: { en: "Uninstall, KEEP configs", el: "Απεγκατάσταση, ΚΡΑΤΑ configs" } },
      { cmd: "apt-get purge x", desc: { en: "Uninstall EVERYTHING incl. configs", el: "Απεγκατάσταση ΟΛΩΝ με configs" } },
      { cmd: "apt-get update", desc: { en: "Refresh package lists from repos", el: "Ανανέωση λιστών από repos" } },
      { cmd: "apt-get upgrade", desc: { en: "Apply newer versions (after update!)", el: "Εγκατάσταση νεότερων (μετά το update!)" } },
      { cmd: "/etc/apt/sources.list", desc: { en: "Where repositories are defined", el: "Πού ορίζονται τα repositories" } },
    ],
    tasks: [
      {
        id: "sr-apt-search",
        instruction: {
          en: "Your next module needs a password cracker. Search the cache for it before installing anything: apt-cache search hydra",
          el: "Η επόμενη ενότητά σου χρειάζεται password cracker. Ψάξε την cache πριν εγκαταστήσεις τίποτα: apt-cache search hydra",
        },
        hint: { en: "apt-cache search hydra", el: "apt-cache search hydra" },
        explain: {
          en: "Two entries appear: the command-line tool 'hydra' and a 'hydra-gtk' graphical frontend. Choosing the plain tool vs the GUI is a deliberate professional decision — servers have no monitors.",
          el: "Εμφανίζονται δύο καταχωρήσεις: το εργαλείο γραμμής εντολών «hydra» και ένα γραφικό «hydra-gtk». Η επιλογή σκέτου εργαλείου εναντίον GUI είναι συνειδητή επαγγελματική απόφαση — οι servers δεν έχουν οθόνες.",
        },
        check: (t) => t.aptSearched && cmd(t, /^apt-cache\s+search\s+\S+/),
      },
      {
        id: "sr-apt-sources",
        instruction: {
          en: "Before trusting the package system, audit its faith: cat /etc/apt/sources.list",
          el: "Πριν εμπιστευτείς το σύστημα πακέτων, έλεγξε την πηγή του: cat /etc/apt/sources.list",
        },
        hint: { en: "cat /etc/apt/sources.list", el: "cat /etc/apt/sources.list" },
        explain: {
          en: "One repository line: kali.hackforge.lab, matching the sandbox. On real Kali you would see http://http.kali.org/kali kali-rolling. Anything else would be a red flag worth investigating.",
          el: "Μια γραμμή repository: kali.hackforge.lab, που ταιριάζει στο sandbox. Σε πραγματικό Kali θα έβλεπες http://http.kali.org/kali kali-rolling. Οτιδήποτε άλλο θα ήταν κόκκινη σημαία για έρευνα.",
        },
        check: (t) => t.readFiles.has("/etc/apt/sources.list"),
      },
      {
        id: "sr-apt-whichbefore",
        instruction: {
          en: "Check the starting state — prove that git is NOT installed yet: which git (expect: not found)",
          el: "Έλεγξε την αρχική κατάσταση — απόδειξε ότι το git ΔΕΝ είναι εγκατεστημένο ακόμα: which git (αναμένεται: δεν βρέθηκε)",
        },
        hint: { en: "which git", el: "which git" },
        explain: {
          en: "'git not found' is exactly what which should answer when the binary is missing from PATH. You have just built the 'before' picture of your experiment — real verification culture starts here.",
          el: "Το «git not found» είναι ακριβώς ό,τι πρέπει να απαντά το which όταν το binary λείπει από το PATH. Μόλις έχτισες την «πριν» εικόνα του πειράματός σου — ο πολιτισμός επαλήθευσης ξεκινά εδώ.",
        },
        check: (t) => t.whichRan && !t.hasPkg("git"),
      },
      {
        id: "sr-apt-install",
        instruction: {
          en: "Install the version control titan: apt-get install git",
          el: "Εγκατάστησε τον τιτάνα ελέγχου εκδόσεων: apt-get install git",
        },
        hint: { en: "apt-get install git", el: "apt-get install git" },
        explain: {
          en: "On a real system this pulls git and every dependency, asks confirmation, then writes files under /usr/bin, /usr/lib and friends. (In the sim it settles instantly — the important part is the ritual, and yes, on real boxes you'd run it with sudo as root.)",
          el: "Σε πραγματικό σύστημα αυτό τραβά το git και κάθε εξάρτηση, ζητά επιβεβαίωση, και γράφει αρχεία σε /usr/bin, /usr/lib και λοιπά. (Στο sim γίνεται άμεσα — το σημαντικό είναι η τελετή, και ναι, σε πραγματικά boxes θα το έτρεχες με sudo ως root.)",
        },
        check: (t) => t.hasPkg("git"),
      },
      {
        id: "sr-apt-whichafter",
        instruction: {
          en: "Close the before/after loop: which git — where did the binary land?",
          el: "Κλείσε τον βρόχο πριν/μετά: which git — πού προσγειώθηκε το binary;",
        },
        hint: { en: "which git", el: "which git" },
        explain: {
          en: "Now /usr/bin/git — the package system materialized a binary on PATH. Same interrogation three tasks earlier returned 'not found'. Compare, conclude, move on: that loop is how grown-ups operate.",
          el: "Τώρα /usr/bin/git — το σύστημα πακέτων υλοποίησε binary στο PATH. Η ίδια ανάκριση τρία tasks νωρίτερα γύρισε «δεν βρέθηκε». Σύγκρινε, συμπέρανε, προχώρα: αυτός ο βρόχος δουλεύει έτσι στους ενήλικες.",
        },
        check: (t) => t.whichFound === "git" && t.hasPkg("git"),
      },
      {
        id: "sr-apt-remove",
        instruction: {
          en: "Simulate the end of an engagement: apt-get remove git — the program goes, configs stay behind.",
          el: "Προσομοίωσε το τέλος αποστολής: apt-get remove git — το πρόγραμμα φεύγει, τα configs μένουν.",
        },
        hint: { en: "apt-get remove git", el: "apt-get remove git" },
        explain: {
          en: "After remove, which git fails once more — but leftover configuration files and package records survive on disk. That distinction (program vs configs) decides how clean a machine really gets.",
          el: "Μετά το remove, το which git ξανα-αποτυγχάνει — αλλά τα περιττά configuration αρχεία και οι εγγραφές πακέτων επιβιώνουν στον δίσκο. Αυτή η διάκριση (πρόγραμμα εναντίον configs) αποφασίζει πόσο καθαρά πραγματικά μένει ένα μηχάνημα.",
        },
        check: (t) => t.removedPkgs.has("git"),
      },
      {
        id: "sr-apt-purge",
        instruction: {
          en: "Go the full scorched-earth route: reinstall briefly (apt-get install git), then obliterate it completely with apt-get purge git.",
          el: "Πήγαινε στο τέρμα: ξαναεγκατάστησε σύντομα (apt-get install git), και μετά εξαφάνισέ το εντελώς με apt-get purge git.",
        },
        hint: { en: "apt-get install git  then  apt-get purge git", el: "apt-get install git  και μετά  apt-get purge git" },
        explain: {
          en: "purge = remove + wipe configuration. Forensics teams hunt the crumbs remove leaves behind; rigorous operators purge. On exam questions, purge is often the 'correct-er' answer for full uninstall.",
          el: "purge = remove + σκούπισμα configuration. Οι ομάδες forensics κυνηγούν τα ψίχουλα που αφήνει το remove· οι αυστηροί operators κάνουν purge. Στις εξετάσεις, το purge είναι συχνά η «πιο σωστή» απάντηση για πλήρη απεγκατάσταση.",
        },
        check: (t) => t.purgedPkgs.has("git") && cmd(t, /^apt-get\s+install\s+git/),
      },
      {
        id: "sr-apt-update",
        instruction: {
          en: "Refresh the system's knowledge of the world: apt-get update",
          el: "Ανανέωσε τη γνώση του συστήματος για τον κόσμο: apt-get update",
        },
        hint: { en: "apt-get update", el: "apt-get update" },
        explain: {
          en: "Flying by: package lists downloaded, sizes, 'Reading package lists... Done'. Nothing was installed or changed — 'update' updates only the catalogs. Watch for FAILED lines in real life: broken or dead repositories report here first.",
          el: "Πετάει: λίστες πακέτων σε λήψη, μεγέθη, 'Reading package lists... Done'. Τίποτα δεν εγκαταστάθηκε ή άλλαξε — το «update» ενημερώνει μόνο τους καταλόγους. Πρόσεχε γραμμές FAILED στη ζωή: σπασμένα ή νεκρά repositories αναφέρουν εδώ πρώτα.",
        },
        check: (t) => t.aptUpdated,
      },
      {
        id: "sr-apt-upgrade",
        instruction: {
          en: "Now — and only now that lists are fresh — apply upgrades: apt-get upgrade",
          el: "Τώρα — και μόνο τώρα που οι λίστες είναι φρέσκες — εφάρμοσε αναβαθμίσεις: apt-get upgrade",
        },
        hint: { en: "apt-get upgrade", el: "apt-get upgrade" },
        explain: {
          en: "'0 upgraded, 0 newly installed...' happens when the system was already current. Note the 'kept back' line: packages listed there need a full-upgrade/dist-upgrade decision — another day, another lesson.",
          el: "Το «0 upgraded, 0 newly installed...» συμβαίνει όταν το σύστημα ήταν ήδη ενημερωμένο. Σημείωσε τη γραμμή «kept back»: τα πακέτα εκεί θέλουν απόφαση full-upgrade/dist-upgrade — άλλη μέρα, άλλο μάθημα.",
        },
        check: (t) => t.aptUpgraded && t.aptUpdated,
      },
    ],
    challenges: [
      {
        title: { en: "Arm and Verify", el: "Οπλίσου και Επαλήθευσε" },
        brief: {
          en: "Equip yourself with the hydra cracker through apt (one command), then PROVE where it landed on disk with whereis hydra (and notice its man page got installed too).",
          el: "Οπλίσου με τον cracker hydra μέσω apt (μία εντολή), και μετά ΑΠΟΔΕΙΞΕ πού προσγειώθηκε στον δίσκο με whereis hydra (και πρόσεξε ότι το man page εγκαταστάθηκε επίσης).",
        },
        success: { en: "hydra installed AND located — install-verify loop closed like a pro.", el: "hydra εγκαταστάθηκε ΚΑΙ εντοπίστηκε — βρόχος εγκατάστασης-επαλήθευσης κλειστός σαν επαγγελματίας." },
        check: (t) => t.hasPkg("hydra") && cmd(t, /^whereis\s+hydra\b/),
      },
      {
        title: { en: "Scorched Earth", el: "Καμμένη Γη" },
        brief: {
          en: "Mission over: purge hydra off the box completely (one command), then demonstrate the machine is clean — which hydra must come back empty-handed.",
          el: "Τέλος αποστολής: εκκαθάρισε το hydra ολοκληρωτικά (μία εντολή), και μετά απόδειξε ότι το μηχάνημα είναι καθαρό — το which hydra πρέπει να γυρίσει άδειο.",
        },
        success: { en: "Purged, verified, spotless. The quartermaster reports the box restored.", el: "Εκκαθαρισμένο, επαληθευμένο, ασήμαντο. Ο οικονόμος αναφέρει το box αποκατεστημένο." },
        check: (t) => t.purgedPkgs.has("hydra") && cmd(t, /^which\s+hydra\b/) && !t.hasPkg("hydra"),
      },
    ],
  },
];
