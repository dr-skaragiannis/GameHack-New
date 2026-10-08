import type { Module } from "./lessons";
import { usedCmd } from "../lib/terminal";

const lab = "sudorun" as const;
const shot = (cmd: string, lines: string[]) => ({ cmd, lines });

export const SUDO_RUN_MODULES_B: Module[] = [
  {
    id: "sr-apt",
    order: 6,
    icon: "download",
    color: "from-cyan-400 to-red-800",
    difficulty: 2,
    scenario: lab,
    title: { en: "Installing & removing software", el: "Εγκατάσταση & αφαίρεση λογισμικού" },
    subtitle: { en: "apt-cache, apt-get, sources.list", el: "apt-cache, apt-get, sources.list" },
    badge: { en: "Packager", el: "Συσκευαστής" },
    theory: [
      {
        heading: { en: "apt and repositories", el: "apt και αποθετήρια" },
        body: {
          en: "Debian-family systems, including Kali, install software with APT, the Advanced Packaging Tool. A repository is the catalogue: a signed list of package names, versions, and the other packages they need. You search that catalogue, install from it, and remove from it. You do not download random installers.\n\nThe lab catalogue is canned. apt-cache search hydra prints a few training rows so you can practise reading a package list. It does not install anything, and it does not run the package. On a system you administer, search before you install, and add a repository only when you trust who publishes it. One wrong line in the source list can make the next update fail, or can offer someone else's packages to the administrator account.",
          el: "Τα συστήματα οικογένειας Debian, μαζί και το Kali, εγκαθιστούν λογισμικό με το APT, το Advanced Packaging Tool. Ένα αποθετήριο είναι ο κατάλογος: μια υπογεγραμμένη λίστα ονομάτων πακέτων, εκδόσεων, και των άλλων πακέτων που χρειάζονται. Ψάχνεις εκείνον τον κατάλογο, εγκαθιστάς από αυτόν, και αφαιρείς από αυτόν. Δεν κατεβάζεις τυχαίους εγκαταστάτες.\n\nΟ κατάλογος του εργαστηρίου είναι έτοιμος. Το apt-cache search hydra τυπώνει λίγες εκπαιδευτικές γραμμές ώστε να εξασκηθείς στο διάβασμα μιας λίστας πακέτων. Δεν εγκαθιστά τίποτα, και δεν εκτελεί το πακέτο. Σε σύστημα που διαχειρίζεσαι, ψάξε πριν εγκαταστήσεις, και πρόσθεσε αποθετήριο μόνο όταν εμπιστεύεσαι ποιον το δημοσιεύει. Μία λάθος γραμμή στη λίστα πηγών μπορεί να κάνει την επόμενη ενημέρωση να αποτύχει, ή να προσφέρει τα πακέτα κάποιου άλλου στον λογαριασμό διαχειριστή.",
        },
      },
      {
        heading: { en: "Search", el: "Αναζήτηση" },
        body: {
          en: "apt-cache search hydra looks up a package name in the simulated index. search reads descriptions. It does not install the package and it does not run it. The rows you see are canned names from this lab, so you can practise reading a package list before you choose install.",
          el: "Η apt-cache search hydra αναζητά ένα όνομα πακέτου στο εικονικό ευρετήριο. Το search διαβάζει περιγραφές. Δεν εγκαθιστά το πακέτο και δεν το εκτελεί. Οι γραμμές που βλέπεις είναι έτοιμα ονόματα αυτού του εργαστηρίου, ώστε να εξασκηθείς στο διάβασμα μιας λίστας πακέτων πριν διαλέξεις install.",
        },
        shots: [shot("apt-cache search hydra", ["hydra - very fast network logon cracker", "libhydra - hydra library (lab)", "qhydra - qt frontend"])],
      },
      {
        heading: { en: "Install, remove, purge", el: "Install, remove, purge" },
        body: {
          en: "apt-get install git asks the catalogue for git and for the packages git itself needs. Those extra packages are dependencies. On a real machine, apt prints the plan first: what will be installed, how much will be downloaded, and how much disk it will use. It then asks Do you want to continue? [Y/n]. Enter accepts the capital default. Any other answer aborts. The lab skips the question and prints a short simulated install so you can read that shape.\n\nremove takes the named package away and leaves its configuration files, and often leaves the dependencies, because something else might still need them. purge removes the package and the configuration it left behind. A star next to the name in a real plan means the configuration is included. The lab stops both commands at Abort, the same as answering n. That is deliberate. You practise the words without changing the simulated package state.\n\nOn a real machine, autoremove later deletes dependencies that nothing still needs, and clean deletes downloaded package files from the cache. This lab does not implement those two. Do not run install, remove, or purge on a machine you do not administer.",
          el: "Το apt-get install git ζητά από τον κατάλογο το git και τα πακέτα που χρειάζεται το ίδιο το git. Εκείνα τα επιπλέον πακέτα είναι εξαρτήσεις. Σε πραγματικό μηχάνημα, το apt τυπώνει πρώτα το σχέδιο: τι θα εγκατασταθεί, πόσα θα κατεβούν, και πόσο δίσκο θα πιάσουν. Μετά ρωτά Do you want to continue? [Y/n]. Το Enter δέχεται την κεφαλαία προεπιλογή. Κάθε άλλη απάντηση ακυρώνει. Το εργαστήριο παραλείπει την ερώτηση και τυπώνει μια σύντομη προσομοιωμένη εγκατάσταση, ώστε να διαβάσεις εκείνο το σχήμα.\n\nΤο remove παίρνει το ονοματισμένο πακέτο και αφήνει τα αρχεία ρυθμίσεών του, και συχνά αφήνει τις εξαρτήσεις, γιατί κάτι άλλο μπορεί ακόμη να τις χρειάζεται. Το purge αφαιρεί το πακέτο και τις ρυθμίσεις που άφησε πίσω. Ένας αστερίσκος δίπλα στο όνομα σε πραγματικό σχέδιο σημαίνει ότι οι ρυθμίσεις περιλαμβάνονται. Το εργαστήριο σταματά και τις δύο εντολές στο Abort, το ίδιο με το να απαντήσεις n. Αυτό είναι σκόπιμο. Εξασκείς τις λέξεις χωρίς να αλλάζεις την προσομοιωμένη κατάσταση πακέτων.\n\nΣε πραγματικό μηχάνημα, το autoremove αργότερα σβήνει εξαρτήσεις που τίποτα δεν χρειάζεται πια, και το clean σβήνει κατεβασμένα αρχεία πακέτων από την προσωρινή μνήμη. Αυτό το εργαστήριο δεν υλοποιεί εκείνα τα δύο. Μην τρέξεις install, remove ή purge σε μηχάνημα που δεν διαχειρίζεσαι.",
        },
        shots: [
          shot("apt-get install git", ["The following NEW packages will be installed:", "  git", "Setting up git (lab) ..."]),
          shot("apt-get remove git", ["The following packages will be REMOVED:", "  git", "Do you want to continue? [Y/n] n", "Abort."]),
        ],
      },
      {
        heading: { en: "update vs upgrade", el: "update vs upgrade" },
        body: {
          en: "apt-get update does not install anything. It refreshes the local copy of the catalogue. Hit means a list was already current. Get means new catalogue data was fetched. Without that refresh, install can ask a mirror for a version that is no longer there.\n\napt-get upgrade then replaces installed packages with newer versions from that catalogue. It does not remove a package to make room, and it does not install a brand-new name. A real upgrade can take a long time, can restart a service, and can replace a configuration file you edited. Plan for it on a machine you administer. Do not start it on a system you do not own. The lab prints an empty plan, 0 upgraded, so you can see the difference between refreshing the list and applying it. A real one-liner uses && so the second command runs only if the first succeeded: update, then upgrade.",
          el: "Το apt-get update δεν εγκαθιστά τίποτα. Ανανεώνει το τοπικό αντίγραφο του καταλόγου. Το Hit σημαίνει ότι μια λίστα ήταν ήδη ενημερωμένη. Το Get σημαίνει ότι ήρθαν νέα δεδομένα καταλόγου. Χωρίς εκείνη την ανανέωση, το install μπορεί να ζητήσει από έναν καθρέφτη μια έκδοση που δεν υπάρχει πια.\n\nΤο apt-get upgrade μετά αντικαθιστά εγκατεστημένα πακέτα με νεότερες εκδόσεις από εκείνον τον κατάλογο. Δεν αφαιρεί πακέτο για να κάνει χώρο, και δεν εγκαθιστά ένα εντελώς νέο όνομα. Μια πραγματική αναβάθμιση μπορεί να πάρει πολλή ώρα, μπορεί να επανεκκινήσει μια υπηρεσία, και μπορεί να αντικαταστήσει ένα αρχείο ρυθμίσεων που επεξεργάστηκες. Σχεδίασέ την σε μηχάνημα που διαχειρίζεσαι. Μην την ξεκινήσεις σε σύστημα που δεν σου ανήκει. Το εργαστήριο τυπώνει άδειο σχέδιο, 0 upgraded, ώστε να δεις τη διαφορά ανάμεσα στο να ανανεώσεις τη λίστα και στο να την εφαρμόσεις. Μια πραγματική μονόγραμμη εντολή χρησιμοποιεί && ώστε η δεύτερη εντολή να τρέξει μόνο αν πέτυχε η πρώτη: update, και μετά upgrade.",
        },
        shots: [
          shot("apt-get update", ["Hit:1 http://http.kali.org/kali kali-rolling InRelease", "Reading package lists... Done"]),
          shot("apt-get upgrade", ["Calculating upgrade... Done", "0 upgraded, 0 newly installed, 0 to remove."]),
        ],
      },
      {
        heading: { en: "sources.list", el: "sources.list" },
        body: {
          en: "The catalogues a machine is allowed to use are listed in /etc/apt/sources.list, and on a modern system also in /etc/apt/sources.list.d/. Each line is an archive type, a mirror address, a distribution name, and components. deb means binary packages. deb-src means source packages. The lab file contains the kali-rolling line and a warning. nano /etc/apt/sources.list prints that file and returns to the prompt. It does not open a real editor, so the usual nano keys are not available here.\n\nOn a real nano, Ctrl+O saves, Ctrl+W searches, Ctrl+K cuts a line, Ctrl+U pastes it, and Ctrl+X leaves. After you change the file you must run update again, because the catalogue is built from those lines. Add only repositories you trust. This lab does not save edits.",
          el: "Οι κατάλογοι που επιτρέπεται να χρησιμοποιεί ένα μηχάνημα αναφέρονται στο /etc/apt/sources.list, και σε σύγχρονο σύστημα επίσης στο /etc/apt/sources.list.d/. Κάθε γραμμή είναι τύπος αρχείου, διεύθυνση καθρέφτη, όνομα διανομής, και συστατικά. Το deb σημαίνει δυαδικά πακέτα. Το deb-src σημαίνει πακέτα πηγαίου κώδικα. Το αρχείο του εργαστηρίου περιέχει τη γραμμή kali-rolling και μια προειδοποίηση. Το nano /etc/apt/sources.list τυπώνει εκείνο το αρχείο και γυρίζει στο prompt. Δεν ανοίγει πραγματικό επεξεργαστή, οπότε τα συνηθισμένα πλήκτρα του nano δεν είναι διαθέσιμα εδώ.\n\nΣε πραγματικό nano, το Ctrl+O αποθηκεύει, το Ctrl+W ψάχνει, το Ctrl+K κόβει γραμμή, το Ctrl+U την επικολλά, και το Ctrl+X βγαίνει. Αφού αλλάξεις το αρχείο πρέπει να τρέξεις ξανά update, γιατί ο κατάλογος χτίζεται από εκείνες τις γραμμές. Πρόσθεσε μόνο αποθετήρια που εμπιστεύεσαι. Αυτό το εργαστήριο δεν αποθηκεύει αλλαγές.",
        },
        shots: [shot("nano /etc/apt/sources.list", ["deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware", "# GameHack lab — do not add experimental repos."])],
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
      { id: "install", instruction: { en: "apt-get install git", el: "apt-get install git" }, hint: { en: "apt-get install git", el: "apt-get install git" }, explain: { en: "Install from the repo.", el: "Εγκαθιστά από το αποθετήριο." }, check: (t) => t.flags.has("apt-install") },
      { id: "remove", instruction: { en: "apt-get remove git  (sandbox aborts like pressing n)", el: "apt-get remove git" }, hint: { en: "apt-get remove git", el: "apt-get remove git" }, explain: { en: "The sandbox stops before removing the package.", el: "Η προσομοίωση (sandbox) σταματά πριν αφαιρέσει το πακέτο." }, check: (t) => t.flags.has("apt-remove") },
      { id: "purge", instruction: { en: "apt-get purge git", el: "apt-get purge git" }, hint: { en: "apt-get purge git", el: "apt-get purge git" }, explain: { en: "Purge leftover configs.", el: "Καθαρίζει και τις ρυθμίσεις (configs)." }, check: (t) => t.flags.has("apt-purge") },
      { id: "update", instruction: { en: "apt-get update", el: "apt-get update" }, hint: { en: "apt-get update", el: "apt-get update" }, explain: { en: "Refresh package lists.", el: "Ανανεώνει τις λίστες πακέτων." }, check: (t) => t.flags.has("apt-update") },
      { id: "upgrade", instruction: { en: "apt-get upgrade", el: "apt-get upgrade" }, hint: { en: "apt-get upgrade", el: "apt-get upgrade" }, explain: { en: "Apply the index from update.", el: "Εφαρμόζει το ευρετήριο του update." }, check: (t) => t.flags.has("apt-upgrade") },
      { id: "src", instruction: { en: "nano /etc/apt/sources.list", el: "nano /etc/apt/sources.list" }, hint: { en: "nano /etc/apt/sources.list", el: "nano /etc/apt/sources.list" }, explain: { en: "See which repo Kali uses.", el: "Δες το αποθετήριο που χρησιμοποιεί το Kali." }, check: (t) => t.flags.has("nano-sources") || t.flags.has("read-sources") || usedCmd(t, /sources\.list/) },
    ],
    challenges: [
      {
        title: { en: "Read sources without nano", el: "Διάβασε χωρίς nano" },
        brief: { en: "cat /etc/apt/sources.list", el: "cat /etc/apt/sources.list" },
        success: { en: "Same file, different tool.", el: "Το ίδιο αρχείο, με διαφορετικό εργαλείο." },
        check: (t) => t.filesRead.some((p) => p.includes("sources.list")) || t.flags.has("nano-sources"),
      },
      {
        title: { en: "Search then install", el: "Ψάξε μετά εγκατέστησε" },
        brief: { en: "You already searched hydra and installed git — that is the full loop.", el: "Αναζήτηση και εγκατάσταση: ο πλήρης κύκλος." },
        success: { en: "Repo workflow complete.", el: "Ο κύκλος του αποθετηρίου ολοκληρώθηκε." },
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
          en: "Every file has an owner and a group. The kernel asks who the process is, then checks three classes: the owner, the owning group, and everyone else. Root skips the ordinary checks. That is why the same file can be unreadable to a normal account and readable to you in this lab.\n\nr means read. On a file, that is open and view. On a directory, it is list the names inside. w means write. On a file, that is change the bytes. On a directory, it is create, rename, and delete the names inside. x means execute. On a file, that is run it. On a directory, it is traverse it, which is why you can sometimes list a directory and still be refused by cd. Execute does not imply read.\n\nls -l gamehack.txt shows the string. The first character is the type: - file, d directory, l link. The next nine characters are three groups of rwx, owner then group then others. After that come the link count, the owner, the group, the size in bytes, and the name. -rw-r--r-- means the owner can read and write, and everyone else can only read. A text note has no reason to be executable.",
          el: "Κάθε αρχείο έχει ιδιοκτήτη και ομάδα. Ο πυρήνας ρωτά ποια είναι η διεργασία, και μετά ελέγχει τρεις κλάσεις: τον ιδιοκτήτη, την ομάδα ιδιοκτησίας, και όλους τους άλλους. Ο root παρακάμπτει τους συνηθισμένους ελέγχους. Γι' αυτό το ίδιο αρχείο μπορεί να είναι αδιάβαστο για απλό λογαριασμό και αναγνώσιμο για σένα σε αυτό το εργαστήριο.\n\nΤο r σημαίνει ανάγνωση. Σε αρχείο, αυτό είναι άνοιγμα και προβολή. Σε φάκελο, είναι η λίστα των ονομάτων μέσα. Το w σημαίνει εγγραφή. Σε αρχείο, αυτό είναι αλλαγή των bytes. Σε φάκελο, είναι δημιουργία, μετονομασία, και διαγραφή των ονομάτων μέσα. Το x σημαίνει εκτέλεση. Σε αρχείο, αυτό είναι να το τρέξεις. Σε φάκελο, είναι να τον διασχίσεις, γι' αυτό μερικές φορές μπορείς να απαριθμήσεις έναν φάκελο και η cd να αρνηθεί. Η εκτέλεση δεν συνεπάγεται ανάγνωση.\n\nΗ ls -l gamehack.txt δείχνει τη συμβολοσειρά. Ο πρώτος χαρακτήρας είναι ο τύπος: - αρχείο, d φάκελος, l σύνδεσμος. Οι επόμενοι εννέα χαρακτήρες είναι τρεις ομάδες rwx, πρώτα ιδιοκτήτης, μετά ομάδα, μετά οι υπόλοιποι. Ακολουθούν ο αριθμός συνδέσμων, ο ιδιοκτήτης, η ομάδα, το μέγεθος σε bytes, και το όνομα. Το -rw-r--r-- σημαίνει ότι ο ιδιοκτήτης μπορεί να διαβάσει και να γράψει, και όλοι οι άλλοι μπορούν μόνο να διαβάσουν. Μια σημείωση κειμένου δεν έχει λόγο να είναι εκτελέσιμη.",
        },
        shots: [shot("ls -l gamehack.txt", ["-rw-r--r-- 1 root root  127 gamehack.txt"])],
      },
      {
        heading: { en: "chown and chgrp", el: "chown και chgrp" },
        body: {
          en: "chown USER FILE changes the owner. chown Raj gamehack.txt makes Raj the owner of the lab note. The lab prints Changed ownership of gamehack.txt to Raj. On a real system the command is silent, and only root may give a file to someone else. That restriction is deliberate: if anyone could hand a file away, the record of who is responsible would mean nothing. chown USER:GROUP FILE can set both at once. This lab accepts the colon form.\n\nchgrp GROUP FILE changes only the group. chgrp ignite gamehack.txt puts the note in the ignite team. The middle triad then describes what members of that group may do, without opening the file to every account. A normal user may change a group only to a group they belong to. Root is not limited that way. id and the groups command show your own memberships. This lab implements id.",
          el: "Το chown USER FILE αλλάζει τον ιδιοκτήτη. Το chown Raj gamehack.txt κάνει τον Raj ιδιοκτήτη της σημείωσης του εργαστηρίου. Το εργαστήριο τυπώνει Changed ownership of gamehack.txt to Raj. Σε πραγματικό σύστημα η εντολή είναι σιωπηλή, και μόνο ο root μπορεί να δώσει ένα αρχείο σε κάποιον άλλο. Ο περιορισμός είναι σκόπιμος: αν ο καθένας μπορούσε να χαρίσει ένα αρχείο, το αρχείο του ποιος είναι υπεύθυνος δεν θα σήμαινε τίποτα. Το chown USER:GROUP FILE μπορεί να ορίσει και τα δύο μαζί. Αυτό το εργαστήριο δέχεται τη μορφή με την άνω κάτω τελεία.\n\nΤο chgrp GROUP FILE αλλάζει μόνο την ομάδα. Το chgrp ignite gamehack.txt βάζει τη σημείωση στην ομάδα ignite. Η μεσαία τριάδα τότε περιγράφει τι μπορούν να κάνουν τα μέλη εκείνης της ομάδας, χωρίς να ανοίγει το αρχείο σε κάθε λογαριασμό. Ένας απλός χρήστης μπορεί να αλλάξει ομάδα μόνο σε ομάδα στην οποία ανήκει. Ο root δεν περιορίζεται έτσι. Η id και η εντολή groups δείχνουν τις δικές σου συμμετοχές. Αυτό το εργαστήριο υλοποιεί την id.",
        },
        shots: [
          shot("chown Raj gamehack.txt", ["Changed ownership of gamehack.txt to Raj."]),
          shot("chgrp ignite gamehack.txt", ["Changed group of gamehack.txt to ignite."]),
          shot("ls -l gamehack.txt", ["-rw-r--r-- 1 Raj ignite  127 gamehack.txt"]),
        ],
      },
      {
        heading: { en: "chmod numeric table", el: "Πίνακας chmod" },
        body: {
          en: "chmod changes the mode. Symbolic form names the class, the operation, and the right. u is the owner, g the group, o everyone else, a all three. + adds, - removes, = sets exactly. chmod g+w report.txt adds group write. chmod o-r secret.txt removes read from everyone outside the owner and group.\n\nNumeric form uses one digit per class. Read is 4, write is 2, execute is 1, and the digit is their sum. 0 is ---, 1 is --x, 2 is -w-, 3 is -wx, 4 is r--, 5 is r-x, 6 is rw-, 7 is rwx. Three digits mean owner, group, others. 644 is rw-r--r--, the usual text file. 755 is rwxr-xr-x, the usual program. 600 is rw-------, the right shape for a private note. 777 gives every right to every account, which is almost never what you want.\n\nOn a real system, chmod +x with no class letter adds execute for all three classes, and a listing may change colour to show that. This lab's +x sets the owner's execute bit only, and it prints Mode of gamehack.txt changed to … instead of staying silent.\n\nNew files do not appear as 644 because you asked. The kernel starts from a default and subtracts the umask. A typical umask of 022 is why touch creates rw-r--r-- and a new directory is often rwxr-xr-x. umask 077, on a machine you administer, makes new files private to you. This lab does not implement the umask command.",
          el: "Το chmod αλλάζει τη λειτουργία. Η συμβολική μορφή ονομάζει την κλάση, την πράξη, και το δικαίωμα. Το u είναι ο ιδιοκτήτης, το g η ομάδα, το o όλοι οι άλλοι, το a και οι τρεις. Το + προσθέτει, το - αφαιρεί, το = ορίζει ακριβώς. Το chmod g+w report.txt προσθέτει εγγραφή στην ομάδα. Το chmod o-r secret.txt αφαιρεί την ανάγνωση από όλους έξω από τον ιδιοκτήτη και την ομάδα.\n\nΗ αριθμητική μορφή χρησιμοποιεί ένα ψηφίο ανά κλάση. Η ανάγνωση είναι 4, η εγγραφή 2, η εκτέλεση 1, και το ψηφίο είναι το άθροισμά τους. Το 0 είναι ---, το 1 --x, το 2 -w-, το 3 -wx, το 4 r--, το 5 r-x, το 6 rw-, το 7 rwx. Τρία ψηφία σημαίνουν ιδιοκτήτης, ομάδα, υπόλοιποι. Το 644 είναι rw-r--r--, το συνηθισμένο αρχείο κειμένου. Το 755 είναι rwxr-xr-x, το συνηθισμένο πρόγραμμα. Το 600 είναι rw-------, το σωστό σχήμα για ιδιωτική σημείωση. Το 777 δίνει κάθε δικαίωμα σε κάθε λογαριασμό, που σχεδόν ποτέ δεν είναι αυτό που θέλεις.\n\nΣε πραγματικό σύστημα, το chmod +x χωρίς γράμμα κλάσης προσθέτει εκτέλεση και στις τρεις κλάσεις, και μια λίστα μπορεί να αλλάξει χρώμα για να το δείξει. Το +x αυτού του εργαστηρίου ορίζει μόνο το bit εκτέλεσης του ιδιοκτήτη, και τυπώνει Mode of gamehack.txt changed to … αντί να μείνει σιωπηλό.\n\nΤα νέα αρχεία δεν εμφανίζονται ως 644 επειδή το ζήτησες. Ο πυρήνας ξεκινά από μια προεπιλογή και αφαιρεί το umask. Ένα τυπικό umask 022 είναι ο λόγος που η touch δημιουργεί rw-r--r-- και ένας νέος φάκελος είναι συχνά rwxr-xr-x. Το umask 077, σε μηχάνημα που διαχειρίζεσαι, κάνει τα νέα αρχεία ιδιωτικά για σένα. Αυτό το εργαστήριο δεν υλοποιεί την εντολή umask.",
        },
        shots: [shot("chmod +x gamehack.txt", ["Mode of gamehack.txt changed to -rwxr--r--."])],
      },
      {
        heading: { en: "SUID and SGID", el: "SUID και SGID" },
        body: {
          en: "SUID, the set-user-id bit, is not another rwx letter. On a real executable it means the process runs with the file owner's rights for that one program, not that the person who started it becomes the owner. You write it as a 4 in front of the three digits, so chmod 4644 gamehack.txt is the lab exercise. The lab prints a mode with a lowercase s in the owner's execute slot.\n\nOn a real system the letter changes meaning. A lowercase s means the bit is set and execute is set. An uppercase S means the bit is set and execute is not, so the file still will not run. The kernel also ignores this bit on shell scripts. It honours it on compiled programs. Setting it on the lab text file teaches you to read the string. It does not grant extra rights, and this course does not ask you to search the tree for those programs.\n\nSGID is the same idea for the owning group, written as a 2 in front: chmod 2466 gamehack.txt. On a directory, the useful everyday meaning is different. New files created inside inherit the directory's group, so a team does not have to fix the group by hand after every save. On an executable, an unexpected SGID bit deserves the same question as an unexpected SUID bit: who put it there, and why.\n\nThere is a third special bit, the sticky bit, written as a 1 in front. On a directory it means people may delete only their own names, even if the directory is writable by everyone. /tmp is the usual example, and its listing ends in t. A world-writable directory without that bit is a problem on a shared machine. This lab does not implement that search.",
          el: "Το SUID, το bit set-user-id, δεν είναι άλλο ένα γράμμα rwx. Σε πραγματικό εκτελέσιμο σημαίνει ότι η διεργασία τρέχει με τα δικαιώματα του ιδιοκτήτη του αρχείου για εκείνο το ένα πρόγραμμα, όχι ότι το άτομο που το ξεκίνησε γίνεται ο ιδιοκτήτης. Το γράφεις ως 4 μπροστά από τα τρία ψηφία, οπότε το chmod 4644 gamehack.txt είναι η άσκηση του εργαστηρίου. Το εργαστήριο τυπώνει μια λειτουργία με πεζό s στη θέση εκτέλεσης του ιδιοκτήτη.\n\nΣε πραγματικό σύστημα το γράμμα αλλάζει νόημα. Ένα πεζό s σημαίνει ότι το bit είναι ορισμένο και η εκτέλεση είναι ορισμένη. Ένα κεφαλαίο S σημαίνει ότι το bit είναι ορισμένο και η εκτέλεση δεν είναι, οπότε το αρχείο και πάλι δεν τρέχει. Ο πυρήνας επίσης αγνοεί αυτό το bit σε scripts του shell. Το τιμά σε μεταγλωττισμένα προγράμματα. Το να το ορίσεις στο αρχείο κειμένου του εργαστηρίου σε μαθαίνει να διαβάζεις τη συμβολοσειρά. Δεν δίνει επιπλέον δικαιώματα, και αυτό το μάθημα δεν σου ζητά να ψάξεις το δέντρο για εκείνα τα προγράμματα.\n\nΤο SGID είναι η ίδια ιδέα για την ομάδα ιδιοκτησίας, γραμμένο ως 2 μπροστά: chmod 2466 gamehack.txt. Σε φάκελο, το χρήσιμο καθημερινό νόημα είναι διαφορετικό. Τα νέα αρχεία που δημιουργούνται μέσα κληρονομούν την ομάδα του φακέλου, οπότε μια ομάδα δεν χρειάζεται να διορθώνει την ομάδα στο χέρι μετά από κάθε αποθήκευση. Σε εκτελέσιμο, ένα απρόσμενο bit SGID αξίζει την ίδια ερώτηση με ένα απρόσμενο bit SUID: ποιος το έβαλε, και γιατί.\n\nΥπάρχει και τρίτο ειδικό bit, το sticky bit, γραμμένο ως 1 μπροστά. Σε φάκελο σημαίνει ότι οι άνθρωποι μπορούν να σβήσουν μόνο τα δικά τους ονόματα, ακόμη κι αν ο φάκελος είναι εγγράψιμος από όλους. Το /tmp είναι το συνηθισμένο παράδειγμα, και η λίστα του τελειώνει σε t. Ένας φάκελος εγγράψιμος από όλους χωρίς εκείνο το bit είναι πρόβλημα σε κοινό μηχάνημα. Αυτό το εργαστήριο δεν υλοποιεί εκείνη την αναζήτηση.",
        },
        shots: [
          shot("chmod 4644 gamehack.txt", ["Mode of gamehack.txt changed to -rwsr--r--."]),
          shot("chmod 2466 gamehack.txt", ["Mode of gamehack.txt changed to -r--rwsrw-."]),
        ],
      },
      {
        heading: { en: "The course sheet, and how to practise", el: "Το φύλλο του μαθήματος, και πώς εξασκείσαι" },
        body: {
          en: "Each lesson already has a short command strip under the theory. That strip is the cheat sheet for this course: orientation, lookup, files, text, packages, and permissions. The tasks under it are the exercises. Type them. Do not paste them. The point is to see the prompt, the command, and the answer as three different things.\n\nWhen a card and the terminal disagree, trust the terminal. This sandbox confirms some commands that a real shell leaves silent, and it omits a few real commands on purpose. The card says which is which. Stay inside the lab, or on a throwaway machine you administer. A command that is safe on a fictional file is not a suggestion to try it on a system you do not own.",
          el: "Κάθε μάθημα έχει ήδη μια σύντομη λωρίδα εντολών κάτω από τη θεωρία. Εκείνη η λωρίδα είναι το φύλλο σημειώσεων αυτού του μαθήματος: προσανατολισμός, αναζήτηση, αρχεία, κείμενο, πακέτα, και δικαιώματα. Οι εργασίες από κάτω είναι η εξάσκηση. Πληκτρολόγησέ τις. Μην τις επικολλήσεις. Το νόημα είναι να δεις το prompt, την εντολή, και την απάντηση ως τρία διαφορετικά πράγματα.\n\nΌταν μια κάρτα και το τερματικό διαφωνούν, εμπιστεύσου το τερματικό. Αυτό το sandbox επιβεβαιώνει μερικές εντολές που ένα πραγματικό shell αφήνει σιωπηλές, και παραλείπει σκόπιμα λίγες πραγματικές εντολές. Η κάρτα λέει ποιο είναι ποιο. Μείνε μέσα στο εργαστήριο, ή σε αναλώσιμο μηχάνημα που διαχειρίζεσαι. Μια εντολή που είναι ασφαλής σε εικονικό αρχείο δεν είναι πρόταση να τη δοκιμάσεις σε σύστημα που δεν σου ανήκει.",
        },
      },
    ],
    cheats: [
      { cmd: "ls -l FILE", desc: { en: "long listing", el: "αναλυτικά" } },
      { cmd: "chown Raj gamehack.txt", desc: { en: "change owner", el: "ιδιοκτήτης" } },
      { cmd: "chgrp ignite gamehack.txt", desc: { en: "change group", el: "ομάδα" } },
      { cmd: "chmod +x FILE", desc: { en: "add execute", el: "+x" } },
      { cmd: "chmod 4644 FILE", desc: { en: "SUID + 644", el: "SUID" } },
      { cmd: "chmod 2466 FILE", desc: { en: "SGID + 466", el: "SGID" } },
    ],
    tasks: [
      { id: "lsl", instruction: { en: "ls -l gamehack.txt", el: "ls -l gamehack.txt" }, hint: { en: "ls -l /root/gamehack.txt", el: "ls -l" }, explain: { en: "Read the owner/group columns.", el: "Δες τις στήλες ιδιοκτήτη και ομάδας." }, check: (t) => t.flags.has("ls-l") || usedCmd(t, /ls\s+-l/) },
      { id: "chown", instruction: { en: "chown Raj gamehack.txt", el: "chown Raj gamehack.txt" }, hint: { en: "chown Raj gamehack.txt", el: "chown Raj gamehack.txt" }, explain: { en: "Owner becomes Raj.", el: "Ο ιδιοκτήτης γίνεται ο Raj." }, check: (t) => t.flags.has("chown-raj") || usedCmd(t, /chown\s+Raj/) },
      { id: "chgrp", instruction: { en: "chgrp ignite gamehack.txt", el: "chgrp ignite gamehack.txt" }, hint: { en: "chgrp ignite gamehack.txt", el: "chgrp ignite gamehack.txt" }, explain: { en: "Group becomes ignite.", el: "Η ομάδα γίνεται η ignite." }, check: (t) => t.flags.has("chgrp-ignite") || usedCmd(t, /chgrp\s+ignite/) },
      { id: "plusx", instruction: { en: "chmod +x gamehack.txt", el: "chmod +x gamehack.txt" }, hint: { en: "chmod +x gamehack.txt", el: "chmod +x gamehack.txt" }, explain: { en: "Execute bit for the owner.", el: "Προσθέτει το bit εκτέλεσης." }, check: (t) => t.flags.has("chmod-x") || usedCmd(t, /chmod\s+\+x/) },
      { id: "suid", instruction: { en: "chmod 4644 gamehack.txt", el: "chmod 4644 gamehack.txt" }, hint: { en: "chmod 4644 gamehack.txt", el: "chmod 4644" }, explain: { en: "4 prefix = SUID.", el: "Το πρόθεμα 4 ορίζει SUID." }, check: (t) => t.flags.has("suid") || usedCmd(t, /chmod\s+4644/) },
      { id: "sgid", instruction: { en: "chmod 2466 gamehack.txt", el: "chmod 2466 gamehack.txt" }, hint: { en: "chmod 2466 gamehack.txt", el: "chmod 2466" }, explain: { en: "2 prefix = SGID.", el: "Το πρόθεμα 2 ορίζει SGID." }, check: (t) => t.flags.has("sgid") || usedCmd(t, /chmod\s+2466/) },
    ],
    challenges: [
      {
        title: { en: "Verify with ls -l", el: "Επιβεβαίωση ls -l" },
        brief: { en: "ls -l gamehack.txt after the chown/chmod chain.", el: "Εκτέλεσε ls -l μετά τις αλλαγές." },
        success: { en: "You can read the mode string.", el: "Διαβάζεις τη λειτουργία (mode)." },
        check: (t) => t.flags.has("ls-l"),
      },
      {
        title: { en: "Know the table", el: "Μάθε τον πίνακα" },
        brief: { en: "chmod 755 on any file you created (e.g. gamehack-2.txt if it still exists, or touch one).", el: "Εκτέλεσε chmod 755 σε ένα αρχείο." },
        success: { en: "755 = rwxr-xr-x — classic executable.", el: "Το 755 αντιστοιχεί σε rwxr-xr-x." },
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
          el: "Η εντολή ifconfig εμφανίζει τις διεπαφές eth0 και lo (127.0.0.1).",
        },
        shots: [shot("ifconfig", ["eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500", "        inet 10.10.10.2  netmask 255.255.255.0  broadcast 10.10.10.255", "        ether 08:00:27:12:34:56", "lo: flags=73<UP,LOOPBACK,RUNNING>", "        inet 127.0.0.1  netmask 255.0.0.0"])],
      },
      {
        heading: { en: "iwconfig", el: "iwconfig" },
        body: {
          en: "iwconfig talks to wireless adapters (SSID, mode, MAC…). No wifi in this lab? You still run it — output shows 'no wireless extensions' on eth0/lo.",
          el: "Η εντολή iwconfig αφορά ασύρματες διεπαφές. Εδώ εμφανίζεται no wireless extensions.",
        },
        shots: [shot("iwconfig", ["lo        no wireless extensions.", "eth0      no wireless extensions.", "wlan0     IEEE 802.11  ESSID:off/any"])],
      },
      {
        heading: { en: "Change IP", el: "Αλλαγή IP" },
        body: {
          en: "ifconfig eth0 10.10.10.13   assigns that address. Run ifconfig again to see it.",
          el: "Η εντολή ifconfig eth0 10.10.10.13 εκχωρεί αυτή τη διεύθυνση. Εκτέλεσε ξανά ifconfig για να τη δεις.",
        },
        shots: [shot("ifconfig eth0 10.10.10.13", ["eth0 inet 10.10.10.13"])],
      },
      {
        heading: { en: "Spoof MAC (lab only)", el: "Spoof MAC (μόνο στο εργαστήριο)" },
        body: {
          en: "A MAC address identifies an interface on its local link; it is not reliable proof of a person's identity. In an authorized lab, the locally administered test value 02:00:00:00:00:13 can be set with ifconfig eth0 down, ifconfig eth0 hw ether 02:00:00:00:00:13, then ifconfig eth0 up. This simulator changes only the fictional interface; never use a MAC change to bypass access controls.",
          el: "Η MAC χαρακτηρίζει διεπαφή στο τοπικό δίκτυο, δεν αποδεικνύει την ταυτότητα ανθρώπου. Σε εξουσιοδοτημένο εργαστήριο μπορείς να ορίσεις τη δοκιμαστική, τοπικά διαχειριζόμενη τιμή 02:00:00:00:00:13 με τη σειρά ifconfig eth0 down, ifconfig eth0 hw ether 02:00:00:00:00:13 και ifconfig eth0 up. Ο προσομοιωτής αλλάζει μόνο την εικονική διεπαφή, μην χρησιμοποιείς αλλαγή MAC για παράκαμψη ελέγχων πρόσβασης."
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
          el: "Η εντολή dhclient eth0 ζητά διεύθυνση IP από τον διακομιστή DHCP.",
        },
        shots: [shot("dhclient eth0", ["DHCPREQUEST of 10.10.10.42 on eth0", "DHCPACK of 10.10.10.42 from 10.10.10.1", "bound to 10.10.10.42 -- renewal in 1800 seconds."])],
      },
      {
        heading: { en: "dig — DNS", el: "dig — DNS" },
        body: {
          en: "DNS maps names to IPs. dig gamehack.lab   (A record). dig gamehack.lab mx   (mail). dig gamehack.lab ns   (nameservers). All answers for gamehack.lab are fictional fixtures served inside the sandbox; no public domain is queried.",
          el: "Οι εντολές dig gamehack.lab, dig gamehack.lab mx και dig gamehack.lab ns ζητούν εγγραφές A, MX και NS.",
        },
        shots: [
          shot("dig gamehack.lab", [";; ANSWER SECTION:", "gamehack.lab.    300 IN A 10.10.10.8"]),
          shot("dig gamehack.lab mx", [";; ANSWER SECTION:", "gamehack.lab.    300 IN MX 10 mail.gamehack.lab."]),
          shot("dig gamehack.lab ns", [";; ANSWER SECTION:", "gamehack.lab.    300 IN NS ns1.gamehack.lab."]),
        ],
      },
      {
        heading: { en: "resolv.conf and hosts", el: "resolv.conf και hosts" },
        body: {
          en: "The resolver reads DNS server addresses from /etc/resolv.conf. In this isolated lab, echo \"nameserver 10.10.10.53\" > /etc/resolv.conf writes the fictional lab resolver. /etc/hosts is a static name-to-address table for this machine only; it does not publish DNS or redirect another user's traffic. Use nano /etc/hosts to inspect the entries, and add only authorized local training names.",
          el: "Ο resolver διαβάζει διευθύνσεις DNS από το /etc/resolv.conf. Στο απομονωμένο εργαστήριο, η εντολή echo \"nameserver 10.10.10.53\" > /etc/resolv.conf γράφει τον εικονικό resolver. Το /etc/hosts είναι στατικός πίνακας ονομάτων για αυτόν τον υπολογιστή, δεν δημοσιεύει εγγραφή DNS ούτε αλλάζει την κίνηση άλλου χρήστη. Με το nano /etc/hosts ελέγχεις τις εγγραφές και προσθέτεις μόνο εξουσιοδοτημένα ονόματα εκπαίδευσης."
        },
        shots: [
          shot('echo "nameserver 10.10.10.53" > /etc/resolv.conf', [""]),
          shot("cat /etc/resolv.conf", ["nameserver 10.10.10.53"]),
          shot("nano /etc/hosts", ["127.0.0.1 localhost", "10.10.10.8 gamehack.lab www.gamehack.lab"]),
        ],
      },
    ],
    cheats: [
      { cmd: "ifconfig", desc: { en: "interfaces", el: "διεπαφές" } },
      { cmd: "iwconfig", desc: { en: "wifi info", el: "wifi" } },
      { cmd: "ifconfig eth0 10.10.10.13", desc: { en: "set IP", el: "ορισμός IP" } },
      { cmd: "ifconfig eth0 hw ether MAC", desc: { en: "set MAC (lab)", el: "MAC (lab)" } },
      { cmd: "dhclient eth0", desc: { en: "DHCP lease", el: "DHCP" } },
      { cmd: "dig gamehack.lab mx", desc: { en: "DNS MX", el: "DNS MX" } },
      { cmd: "echo nameserver 10.10.10.53 > /etc/resolv.conf", desc: { en: "set DNS", el: "DNS" } },
    ],
    tasks: [
      { id: "ifc", instruction: { en: "ifconfig", el: "ifconfig" }, hint: { en: "ifconfig", el: "ifconfig" }, explain: { en: "See eth0 and lo.", el: "Εμφανίζει τις διεπαφές eth0 και lo." }, check: (t) => t.flags.has("ip") || usedCmd(t, /^\s*ifconfig\b/) },
      { id: "iw", instruction: { en: "iwconfig", el: "iwconfig" }, hint: { en: "iwconfig", el: "iwconfig" }, explain: { en: "Wireless info.", el: "Ασύρματα." }, check: (t) => t.flags.has("iwconfig") },
      { id: "ipset", instruction: { en: "ifconfig eth0 10.10.10.13", el: "ifconfig eth0 10.10.10.13" }, hint: { en: "ifconfig eth0 10.10.10.13", el: "ifconfig eth0 10.10.10.13" }, explain: { en: "Static IP in the lab.", el: "Ορίζει στατική IP." }, check: (t) => t.flags.has("ip-set") || usedCmd(t, /ifconfig\s+eth0\s+10\.10\.10\.13/) },
      { id: "mac", instruction: { en: "ifconfig eth0 down ; ifconfig eth0 hw ether 02:00:00:00:00:13 ; ifconfig eth0 up  (one at a time is fine)", el: "Εκτέλεσε διαδοχικά down, hw ether και up" }, hint: { en: "ifconfig eth0 down\nifconfig eth0 hw ether 02:00:00:00:00:13\nifconfig eth0 up", el: "ifconfig eth0 down\nifconfig eth0 hw ether 02:00:00:00:00:13\nifconfig eth0 up" }, explain: { en: "Lab-only MAC change.", el: "Αλλαγή MAC μόνο στο εργαστήριο." }, check: (t) => t.flags.has("mac-spoof") || usedCmd(t, /hw\s+ether/) },
      { id: "dhcp", instruction: { en: "dhclient eth0", el: "dhclient eth0" }, hint: { en: "dhclient eth0", el: "dhclient eth0" }, explain: { en: "Ask DHCP for an address.", el: "Ζήτησε διεύθυνση από τον DHCP." }, check: (t) => t.flags.has("dhclient") },
      { id: "dig", instruction: { en: "dig gamehack.lab", el: "dig gamehack.lab" }, hint: { en: "dig gamehack.lab", el: "dig gamehack.lab" }, explain: { en: "A record.", el: "A record." }, check: (t) => t.flags.has("dig-a") || t.flags.has("dig") },
      { id: "digmx", instruction: { en: "dig gamehack.lab mx  AND  dig gamehack.lab ns", el: "dig mx και ns" }, hint: { en: "dig gamehack.lab mx", el: "dig gamehack.lab mx" }, explain: { en: "Mail and nameserver records.", el: "Εμφανίζει εγγραφές MX και NS." }, check: (t) => t.flags.has("dig-mx") || t.flags.has("dig-ns") || usedCmd(t, /dig\s+.*mx/) },
      { id: "dns", instruction: { en: 'echo "nameserver 10.10.10.53" > /etc/resolv.conf', el: "echo nameserver στο resolv.conf" }, hint: { en: 'echo "nameserver 10.10.10.53" > /etc/resolv.conf', el: "echo … > /etc/resolv.conf" }, explain: { en: "Overwrite resolver.", el: "Αντικαθιστά τον resolver." }, check: (t) => t.flags.has("dns-set") || usedCmd(t, /resolv\.conf/) },
      { id: "hosts", instruction: { en: "nano /etc/hosts  (or cat it)", el: "nano /etc/hosts" }, hint: { en: "nano /etc/hosts", el: "nano /etc/hosts" }, explain: { en: "Static names.", el: "Εμφανίζει στατικά ονόματα." }, check: (t) => t.flags.has("nano-hosts") || t.flags.has("read-hosts") || usedCmd(t, /\/etc\/hosts/) },
    ],
    challenges: [
      {
        title: { en: "Prove the new DNS", el: "Νέο DNS" },
        brief: { en: "cat /etc/resolv.conf after the echo redirect.", el: "cat /etc/resolv.conf" },
        success: { en: "10.10.10.53 is in the file.", el: "Η διεύθυνση 10.10.10.53 βρίσκεται στο αρχείο." },
        check: (t) => t.flags.has("dns-set") || t.filesRead.some((p) => p.includes("resolv")),
      },
      {
        title: { en: "ifconfig after DHCP", el: "ifconfig μετά το DHCP" },
        brief: { en: "ifconfig and notice the lease IP.", el: "ifconfig — δες τη νέα IP." },
        success: { en: "DHCP overwrote your static address.", el: "Το DHCP αντικατέστησε τη στατική διεύθυνση." },
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
          el: "Το ps εμφανίζει τις δικές σου διεργασίες. Το ps aux όλες. Το grep φιλτράρει τα αποτελέσματα.",
        },
        shots: [
          shot("ps", ["  PID TTY          TIME CMD", " 1 ?        00:00:00 /sbin/init"]),
          shot("ps aux | grep msfconsole", ["root       880  1.2  2.1   77419 12902 pts/0    S    09:00  0:01 msfconsole"]),
        ],
      },
      {
        heading: { en: "top", el: "top" },
        body: {
          en: "top sorts by resource use and refreshes (about every 10s on a real box). Use it to find the greediest process.",
          el: "Η εντολή top ταξινομεί τις διεργασίες κατά κατανάλωση πόρων.",
        },
        shots: [shot("top", ["PID USER      %CPU %MEM COMMAND", "4378 root  8.4  6.2  [zombie-lab]"])],
      },
      {
        heading: { en: "nice / renice", el: "nice / renice" },
        body: {
          en: "nice -n 10 /usr/bin/ssh-agent starts a command with lower scheduling priority. Linux niceness ranges from -20 (highest priority) to 19 (lowest); renice 19 6242 sets the absolute value for PID 6242.",
          el: "Η nice ορίζει τιμή κατά την εκκίνηση, η renice αλλάζει υπάρχον PID. Όσο πιο θετική είναι η τιμή, τόσο χαμηλότερη είναι η προτεραιότητα.",
        },
        shots: [
          shot("nice -n 10 /usr/bin/ssh-agent", ["would start /usr/bin/ssh-agent with nice 10 (simulated; positive values lower scheduling priority)"]),
          shot("renice 19 6242", ["6242 (process ID) old priority 0, new priority 19"]),
        ],
      },
      {
        heading: { en: "kill", el: "kill" },
        body: {
          en: "kill sends a signal to a PID. SIGTERM (15) requests a normal stop; SIGHUP (1) reports a hangup and some programs use it to reload configuration, so it is not a universal gentle-stop command. SIGKILL (9) forces termination without cleanup. Verify the PID first; every process here is fictional.",
          el: "Το SIGHUP μπορεί να προκαλέσει επαναφόρτωση ή τερματισμό, το SIGKILL επιβάλλει άμεσο τερματισμό. Έλεγξε το PID και μείνε στο lab.",
        },
        shots: [
          shot("kill -1 6242", ["sent SIGHUP to 6242; outcome depends on the process (simulated)."]),
          shot("kill -9 4378", ["sent SIGKILL to 4378; process stopped (simulated)."]),
        ],
      },
      {
        heading: { en: "Background, fg, jobs, at", el: "Background, fg, jobs, at" },
        body: {
          en: "Append & to run in the background: nano gamehack.txt &  (prints a PID). jobs lists background jobs. fg PID (or fg) brings one back. at 9:00pm  schedules a one-shot job (crond is for repeating). Example: at 9:00pm  then /root/simple_bash.sh",
          el: "Πρόσθεσε & για παρασκήνιο, έλεγξε με jobs, επανάφερε με fg και προγραμμάτισε με at 9:00pm",
        },
        shots: [
          shot("nano gamehack.txt &", ["[1] 7100"]),
          shot("jobs", ["[1]+ Running nano gamehack.txt &"]),
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
      { id: "ps", instruction: { en: "ps", el: "ps" }, hint: { en: "ps", el: "ps" }, explain: { en: "Your session's processes.", el: "Εμφανίζει τις δικές σου διεργασίες." }, check: (t) => t.flags.has("ps") },
      { id: "aux", instruction: { en: "ps aux", el: "ps aux" }, hint: { en: "ps aux", el: "ps aux" }, explain: { en: "Everyone's processes.", el: "Εμφανίζει τις διεργασίες όλων." }, check: (t) => t.flags.has("ps-aux") || usedCmd(t, /ps\s+aux/) },
      { id: "psg", instruction: { en: "ps aux | grep msfconsole", el: "ps aux | grep msfconsole" }, hint: { en: "ps aux | grep msfconsole", el: "ps aux | grep msfconsole" }, explain: { en: "Filter by name.", el: "Φιλτράρει με βάση το όνομα." }, check: (t) => t.flags.has("ps-grep") || usedCmd(t, /ps\s+aux\s*\|/) },
      { id: "top", instruction: { en: "top", el: "top" }, hint: { en: "top", el: "top" }, explain: { en: "Greediest first.", el: "Οι πιο απαιτητικές σε πόρους εμφανίζονται πρώτες." }, check: (t) => t.flags.has("top") },
      { id: "nice", instruction: { en: "nice -n 10 /usr/bin/ssh-agent", el: "nice -n 10 /usr/bin/ssh-agent" }, hint: { en: "nice -n 10 /usr/bin/ssh-agent", el: "nice -n 10 /usr/bin/ssh-agent" }, explain: { en: "Start with priority.", el: "Εκκίνηση με προτεραιότητα." }, check: (t) => t.flags.has("nice") || usedCmd(t, /^\s*nice\b/) },
      { id: "renice", instruction: { en: "renice 19 6242", el: "renice 19 6242" }, hint: { en: "renice 19 6242", el: "renice 19 6242" }, explain: { en: "Absolute nice value + PID.", el: "Ορίζει απόλυτη τιμή για το PID." }, check: (t) => t.flags.has("renice") || usedCmd(t, /renice/) },
      { id: "k1", instruction: { en: "kill -1 6242", el: "kill -1 6242" }, hint: { en: "kill -1 6242", el: "kill -1 6242" }, explain: { en: "SIGHUP.", el: "SIGHUP." }, check: (t) => t.flags.has("kill-1") || usedCmd(t, /kill\s+-1/) },
      { id: "k9", instruction: { en: "kill -9 4378", el: "kill -9 4378" }, hint: { en: "kill -9 4378", el: "kill -9 4378" }, explain: { en: "SIGKILL.", el: "SIGKILL." }, check: (t) => t.flags.has("kill-9") || usedCmd(t, /kill\s+-9/) },
      { id: "bg", instruction: { en: "nano gamehack.txt &", el: "nano gamehack.txt &" }, hint: { en: "nano gamehack.txt &", el: "nano gamehack.txt &" }, explain: { en: "& backgrounds.", el: "Το & στέλνει την εντολή στο παρασκήνιο." }, check: (t) => t.flags.has("bg") || usedCmd(t, /&\s*$/) },
      { id: "jobs", instruction: { en: "jobs   then   fg", el: "jobs και fg" }, hint: { en: "jobs", el: "jobs" }, explain: { en: "Job control.", el: "Διαχείριση εργασιών (job control)." }, check: (t) => t.flags.has("jobs") || t.flags.has("fg") || usedCmd(t, /^\s*jobs\b/) },
      { id: "at", instruction: { en: "at 9:00pm", el: "at 9:00pm" }, hint: { en: "at 9:00pm", el: "at 9:00pm" }, explain: { en: "One-shot schedule.", el: "Προγραμματίζει μία εκτέλεση." }, check: (t) => t.flags.has("at") },
    ],
    challenges: [
      {
        title: { en: "Confirm msf is a row", el: "Επιβεβαίωσε msf" },
        brief: { en: "ps aux | grep msfconsole should have shown PID 880.", el: "Εντόπισε το PID 880." },
        success: { en: "You can hunt processes by name.", el: "Εντοπίζεις διεργασίες με βάση το όνομα." },
        check: (t) => t.flags.has("ps-grep") || t.flags.has("ps-aux"),
      },
      {
        title: { en: "Schedule the bash stub", el: "Προγραμμάτισε το bash" },
        brief: { en: "You ran at 9:00pm — in a real shell you would then type /root/simple_bash.sh", el: "Χρησιμοποίησε at μαζί με το simple_bash.sh" },
        success: { en: "Daemon scheduling introduced.", el: "Γνώρισες την εντολή at." },
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
    badge: { en: "Shell Explorer", el: "Εξερευνητής shell" },
    theory: [
      {
        heading: { en: "env vs shell", el: "env vs shell" },
        body: {
          en: "Variables are key=value strings. Shell variables last for this session; environment variables are inherited. set | more  dumps them (set is bigger than env).",
          el: "Η εντολή set | more εμφανίζει όλες τις μεταβλητές.",
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
          el: "Η εντολή HISTSIZE=0 γράφεται χωρίς κενά.",
        },
        shots: [shot("HISTSIZE=0", [""])],
      },
      {
        heading: { en: "Save then export", el: "Αποθήκευσε και export" },
        body: {
          en: "Always stash the old value: echo $HISTSIZE > ~/valueofHISTSIZE.txt   then HISTSIZE=0  and  export HISTSIZE  to make it stick for child processes.",
          el: "Αποθήκευσε με echo $HISTSIZE > ~/valueofHISTSIZE.txt και εξήγαγε με export HISTSIZE",
        },
        shots: [
          shot("echo $HISTSIZE > ~/valueofHISTSIZE.txt", [""]),
          shot("export HISTSIZE", [""]),
        ],
      },
      {
        heading: { en: "User-defined + unset", el: "Δικές σου + unset" },
        body: {
          en: 'url_variable="gamehack.lab/"   creates a custom variable. echo $url_variable to read it. unset url_variable deletes it — echo then prints nothing.',
          el: "Όρισε τη url_variable=… και αφαίρεσέ την με unset url_variable",
        },
        shots: [
          shot('url_variable="gamehack.lab/"', [""]),
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
      { id: "set", instruction: { en: "set | more   (or just set)", el: "set | more" }, hint: { en: "set | more", el: "set | more" }, explain: { en: "Dump vars.", el: "Εμφανίζει τις μεταβλητές." }, check: (t) => t.flags.has("set") || usedCmd(t, /^\s*set\b/) },
      { id: "greph", instruction: { en: "set | grep HISTSIZE", el: "set | grep HISTSIZE" }, hint: { en: "set | grep HISTSIZE", el: "set | grep HISTSIZE" }, explain: { en: "Should show 1000 first.", el: "Αρχικά εμφανίζει 1000." }, check: (t) => t.flags.has("grep-hist") || usedCmd(t, /grep\s+HISTSIZE/) },
      { id: "zero", instruction: { en: "HISTSIZE=0", el: "HISTSIZE=0" }, hint: { en: "HISTSIZE=0", el: "HISTSIZE=0" }, explain: { en: "No spaces.", el: "Γράφεται χωρίς κενά." }, check: (t) => t.flags.has("histsize") || usedCmd(t, /HISTSIZE=0/) },
      { id: "save", instruction: { en: "echo $HISTSIZE > ~/valueofHISTSIZE.txt", el: "echo $HISTSIZE > ~/valueofHISTSIZE.txt" }, hint: { en: "echo $HISTSIZE > ~/valueofHISTSIZE.txt", el: "echo $HISTSIZE > ~/valueofHISTSIZE.txt" }, explain: { en: "Backup before you break history.", el: "Αντίγραφο ασφαλείας πριν αλλάξεις το ιστορικό." }, check: (t) => t.flags.has("hist-save") || usedCmd(t, /valueofHISTSIZE/) },
      { id: "export", instruction: { en: "export HISTSIZE", el: "export HISTSIZE" }, hint: { en: "export HISTSIZE", el: "export HISTSIZE" }, explain: { en: "Inherit in children.", el: "Κληρονομείται από τις διεργασίες-παιδιά." }, check: (t) => t.flags.has("export") || usedCmd(t, /export\s+HISTSIZE/) },
      { id: "url", instruction: { en: 'url_variable="gamehack.lab/"', el: "url_variable=gamehack.lab/" }, hint: { en: 'url_variable="gamehack.lab/"', el: "url_variable=…" }, explain: { en: "Custom variable.", el: "Ορίζει δική σου μεταβλητή." }, check: (t) => t.flags.has("url-var") || usedCmd(t, /url_variable=/) },
      { id: "unset", instruction: { en: "unset url_variable", el: "unset url_variable" }, hint: { en: "unset url_variable", el: "unset url_variable" }, explain: { en: "Delete it.", el: "Διαγράφει τη μεταβλητή." }, check: (t) => t.flags.has("unset") || usedCmd(t, /unset\s+url_variable/) },
    ],
    challenges: [
      {
        title: { en: "Read the backup", el: "Διάβασε το backup" },
        brief: { en: "cat ~/valueofHISTSIZE.txt", el: "cat ~/valueofHISTSIZE.txt" },
        success: { en: "You can undo because you saved.", el: "Μπορείς να επαναφέρεις, επειδή αποθήκευσες." },
        check: (t) => t.filesRead.some((p) => p.includes("valueofHISTSIZE")) || t.flags.has("hist-save"),
      },
      {
        title: { en: "echo the custom var before unset", el: "echo πριν το unset" },
        brief: { en: "If you already unset, recreate url_variable then echo $url_variable", el: "Δημιούργησέ την ξανά και εκτέλεσε echo" },
        success: { en: "$ expands variables.", el: "Το $ αναπτύσσει τη μεταβλητή (expansion)." },
        check: (t) => t.flags.has("url-var") || usedCmd(t, /echo\s+\$url/),
      },
    ],
  },
];
