import type { Module } from "./lessons";
import { buildSudoRunFS } from "../lib/sudorun";

// Match a normalized command line that was typed into the lab terminal.
const cmd = (t: any, re: RegExp) => t.ran.some((r: string) => re.test(r));

// ============================================================================
// Sudo_Run — Linux for Beginners (modules 6-9)
// Permissions · Networks · Processes · Environment variables
// All lesson text is original HackForge teaching material.
// ============================================================================

export const SUDO_MODULES_B: Module[] = [
  // ============================================== MODULE 6 — PERMISSION FORGE
  {
    id: "sr-perms",
    order: 6,
    icon: "🔐",
    color: "from-rose-500 to-red-700",
    title: { en: "Permission Forge", el: "Σφυρηλάτηση Δικαιωμάτων" },
    subtitle: {
      en: "Users, groups, rwx, chmod, chown — and the SUID/SGID trick.",
      el: "Χρήστες, ομάδες, rwx, chmod, chown — και το κόλπο SUID/SGID.",
    },
    difficulty: 2,
    badge: { en: "Keymaster", el: "Κλειδούχος" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "Root, users and groups", el: "Root, χρήστες και ομάδες" },
        body: {
          en: "In Linux the root user is all-powerful: root can do anything on the system. Every other account is limited, and those accounts are usually collected into GROUPS that share a function — a group for the developers, one for deployment, one for administrators. Groups are how an admin hands out levels of access without editing every file for every person. You saw both sides of this already: `whoami` told you who you are, `id` listed every group you belong to.",
          el: "Στο Linux ο root είναι παντοδύναμος: μπορεί να κάνει οτιδήποτε στο σύστημα. Κάθε άλλος λογαριασμός είναι περιορισμένος και αυτοί οι λογαριασμοί μαζεύονται σε ΟΜΑΔΕΣ που μοιράζονται λειτουργία — ομάδα για τους developers, μία για το deployment, μία για τους administrators. Οι ομάδες είναι ο τρόπος να μοιράζει ένας admin επίπεδα πρόσβασης χωρίς να πειράζει κάθε αρχείο για κάθε άτομο. Έχεις ήδη δει και τις δύο πλευρές: το `whoami` σου είπε ποιος είσαι, το `id` εμφάνιζε κάθε ομάδα στην οποία ανήκεις.",
        },
        tip: {
          en: "Almost every privilege-escalation story starts with one sentence: 'this user is in a group that owns something dangerous'.",
          el: "Σχεδόν κάθε ιστορία privilege-escalation ξεκινά με μία πρόταση: «αυτός ο χρήστης είναι σε ομάδα που κατέχει κάτι επικίνδυνο».",
        },
      },
      {
        heading: { en: "The three permissions: r, w, x", el: "Τα τρία δικαιώματα: r, w, x" },
        body: {
          en: "Every file and directory in Linux carries three levels of permission. `r` (read) lets a user open and view a file. `w` (write) lets a user edit it. `x` (execute) lets a user RUN it — without necessarily reading or editing it. Each of those three letters appears three times in a row, once per audience: owner, group, everyone else. So `-rwxr-xr--` means: the owner does everything, the group reads and executes, the world only reads.",
          el: "Κάθε αρχείο και φάκελος στο Linux κουβαλά τρία επίπεδα δικαιωμάτων. Το `r` (read) επιτρέπει στον χρήστη να ανοίξει και να δει ένα αρχείο. Το `w` (write) να το επεξεργαστεί. Το `x` (execute) να το ΤΡΕΞΕΙ — χωρίς απαραίτητα να το διαβάζει ή να το αλλάζει. Κάθε ένα από αυτά τα τρία γράμματα εμφανίζεται τρεις φορές στη σειρά, μία για κάθε κοινό: ιδιοκτήτης, ομάδα, όλοι οι υπόλοιποι. Άρα το `-rwxr-xr--` σημαίνει: ο ιδιοκτήτης κάνει τα πάντα, η ομάδα διαβάζει και εκτελεί, ο κόσμος μόνο διαβάζει.",
        },
      },
      {
        heading: { en: "Reading a long listing, column by column", el: "Διάβασμα αναλυτικής λίστας, στήλη προς στήλη" },
        body: {
          en: "`ls -l` is the single most-read command in Linux, and its line has a fixed anatomy: (1) the file type — `-` for a file, `d` for a directory, `l` for a link; (2) the nine permission characters, in three triplets for owner / group / others; (3) the number of hard links; (4) the owner; (5) the group; (6) the size in bytes; (7) the date of the last modification; (8) the name. Learn to scan that line in under a second: on an engagement it tells you who you would have to be to touch a file.",
          el: "Το `ls -l` είναι η πιο διαβασμένη εντολή στο Linux και η γραμμή του έχει σταθερή ανατομία: (1) ο τύπος αρχείου — `-` για αρχείο, `d` για φάκελο, `l` για σύνδεσμο· (2) οι εννέα χαρακτήρες δικαιωμάτων, σε τρεις τριάδες για ιδιοκτήτη / ομάδα / άλλους· (3) ο αριθμός των hard links· (4) ο ιδιοκτήτης· (5) η ομάδα· (6) το μέγεθος σε bytes· (7) η ημερομηνία τελευταίας τροποποίησης· (8) το όνομα. Μάθε να διαβάζεις αυτή τη γραμμή σε λιγότερο από ένα δευτερόλεπτο: σε μια αποστολή σου λέει ποιον θα έπρεπε να υποδύεσαι για να αγγίξεις ένα αρχείο.",
        },
      },
      {
        heading: { en: "chmod — numbers and symbols", el: "chmod — αριθμοί και σύμβολα" },
        body: {
          en: "chmod changes permissions in two dialects. The numeric dialect gives one digit per audience, built from r=4, w=2, x=1: so 7=rwx, 6=rw-, 5=r-x, 4=r--, 3=-wx, 2=-w-, 1=--x, 0=---. `chmod 777 file` hands out everything to everybody (a classic security mistake), `chmod 644 file` is the polite default for a document, `chmod 600 file` keeps a secret for its owner alone. The symbolic dialect reads like a sentence: `chmod +x file` adds execute for everyone, `chmod u+w file` gives the owner write, `chmod go-rwx file` shuts everybody else out.",
          el: "Το chmod αλλάζει δικαιώματα σε δύο διαλέκτους. Η αριθμητική δίνει ένα ψηφίο ανά κοινό, φτιαγμένο από r=4, w=2, x=1: άρα 7=rwx, 6=rw-, 5=r-x, 4=r--, 3=-wx, 2=-w-, 1=--x, 0=---. Το `chmod 777 file` τα δίνει όλα σε όλους (κλασικό λάθος ασφαλείας), το `chmod 644 file` είναι η ευγενική προεπιλογή για έγγραφο, το `chmod 600 file` κρατά ένα μυστικό μόνο για τον ιδιοκτήτη του. Η συμβολική διάλεκτος διαβάζεται σαν πρόταση: το `chmod +x file` προσθέτει execute σε όλους, το `chmod u+w file` δίνει write στον ιδιοκτήτη, το `chmod go-rwx file` κλειδώνει όλους τους άλλους έξω.",
        },
      },
      {
        heading: { en: "chown, chgrp and the special bits (SUID / SGID)", el: "chown, chgrp και τα ειδικά bits (SUID / SGID)" },
        body: {
          en: "`chown user file` hands a file to a new owner; `chgrp group file` hands it to a new group. Only root may give files away, which is why you will run those two with sudo. Above the nine letters sit two special bits. The SUID bit says: whoever executes this file, executes it with the permissions of its OWNER — so a SUID-root binary runs as root for anybody. You set it by writing a 4 in front of the normal mode: 644 becomes 4644, and ls -l shows an `s` where the owner's `x` was. The SGID bit does the same for the owner's GROUP and is set with a leading 2: 466 becomes 2466. Both bits are legitimate conveniences (think /usr/bin/passwd) and both are favourite stepping stones in privilege escalation — which is exactly why every pentester memorises how to spot them.",
          el: "Το `chown user file` δίνει το αρχείο σε νέο ιδιοκτήτη· το `chgrp group file` το δίνει σε νέα ομάδα. Μόνο ο root μπορεί να χαρίζει αρχεία, γι' αυτό θα τρέξεις αυτά τα δύο με sudo. Πάνω από τα εννέα γράμματα κάθονται δύο ειδικά bits. Το SUID bit λέει: όποιος εκτελέσει αυτό το αρχείο, το εκτελεί με τα δικαιώματα του ΙΔΙΟΚΤΗΤΗ του — άρα ένα SUID-root binary τρέχει ως root για τον οποιονδήποτε. Το βάζεις γράφοντας ένα 4 μπροστά από το κανονικό mode: το 644 γίνεται 4644 και το ls -l δείχνει ένα `s` εκεί που ήταν το `x` του ιδιοκτήτη. Το SGID bit κάνει το ίδιο για την ΟΜΑΔΑ του ιδιοκτήτη και μπαίνει με 2 μπροστά: το 466 γίνεται 2466. Και τα δύο είναι νόμιμες διευκολύνσεις (σκέψου το /usr/bin/passwd) και τα δύο είναι αγαπημένα πατήματα σε privilege escalation — γι' αυτό ακριβώς κάθε pentester αποστηθίζει πώς να τα αναγνωρίζει.",
        },
        tip: {
          en: "On real boxes, `find / -perm -4000 2>/dev/null` lists every SUID binary — a mandatory first look during privesc.",
          el: "Σε πραγματικά boxes, το `find / -perm -4000 2>/dev/null` εμφανίζει κάθε SUID binary — υποχρεωτική πρώτη ματιά στο privesc.",
        },
      },
    ],
    cheats: [
      { cmd: "ls -l", desc: { en: "Type · perms · links · owner · group · size · date · name", el: "Τύπος · δικαιώματα · links · ιδιοκτήτης · ομάδα · μέγεθος · ημέρα · όνομα" } },
      { cmd: "chmod 777 / 644 / 600 f", desc: { en: "Numeric: r=4 w=2 x=1 per audience", el: "Αριθμητικά: r=4 w=2 x=1 ανά κοινό" } },
      { cmd: "chmod +x / u+w / go-rwx f", desc: { en: "Symbolic: who, operator, bits", el: "Συμβολικά: ποιος, τελεστής, bits" } },
      { cmd: "chmod 4644 f", desc: { en: "Set SUID (run as the owner)", el: "Βάλε SUID (τρέχει ως ιδιοκτήτης)" } },
      { cmd: "chmod 2466 f", desc: { en: "Set SGID (run as the group)", el: "Βάλε SGID (τρέχει ως ομάδα)" } },
      { cmd: "chown user f", desc: { en: "Change the owner (needs root)", el: "Άλλαξε ιδιοκτήτη (θέλει root)" } },
      { cmd: "chgrp group f", desc: { en: "Change the group", el: "Άλλαξε ομάδα" } },
    ],
    tasks: [
      {
        id: "sr-perms-lsl",
        instruction: {
          en: "Read the anatomy of your home directory: ls -l — identify type, the nine permission characters, owner, group and size on every line.",
          el: "Διάβασε την ανατομία του home φακέλου σου: ls -l — αναγνώρισε τύπο, τους εννέα χαρακτήρες δικαιωμάτων, ιδιοκτήτη, ομάδα και μέγεθος σε κάθε γραμμή.",
        },
        hint: { en: "ls -l", el: "ls -l" },
        explain: {
          en: "Directories start with 'd' and are almost always 4096 bytes. Files show their true byte size. simple_bash.sh is the only entry with an 'x' — it is the one you can run. That single letter is the difference between a text file and a program.",
          el: "Οι φάκελοι ξεκινούν με 'd' και είναι σχεδόν πάντα 4096 bytes. Τα αρχεία δείχνουν το αληθινό τους μέγεθος. Το simple_bash.sh είναι η μόνη καταχώρηση με 'x' — είναι αυτό που μπορείς να τρέξεις. Αυτό το ένα γράμμα είναι η διαφορά ανάμεσα σε αρχείο κειμένου και πρόγραμμα.",
        },
        check: (t) => t.listedLong,
      },
      {
        id: "sr-perms-denied",
        instruction: {
          en: "Try to read the password hashes as a normal user: cat /etc/shadow — and study the refusal.",
          el: "Προσπάθησε να διαβάσεις τα hashes των κωδικών ως απλός χρήστης: cat /etc/shadow — και μελέτησε την άρνηση.",
        },
        hint: { en: "cat /etc/shadow", el: "cat /etc/shadow" },
        explain: {
          en: "'Permission denied' is the kernel enforcing rw------- root root: only root reads shadow. This is the wall every attacker tries to climb, and the reason password hashes live in a different file from /etc/passwd (which IS world-readable, because the system needs usernames constantly). Later campaigns in HackForge walk through the climb.",
          el: "Το 'Permission denied' είναι ο πυρήνας να εφαρμόζει το rw------- root root: μόνο ο root διαβάζει το shadow. Αυτό είναι το τείχος που κάθε επιτιθέμενος προσπαθεί να σκαρφαλώσει, και ο λόγος που τα hashes ζουν σε άλλο αρχείο από το /etc/passwd (που ΕΙΝΑΙ αναγνώσιμο από όλους, γιατί το σύστημα χρειάζεται τα usernames συνεχώς). Επόμενες καμπάνιες στο HackForge κάνουν τη σκαρφάλωση.",
        },
        check: (t) => cmd(t, /^cat\s+\/etc\/shadow\b/),
      },
      {
        id: "sr-perms-chown",
        instruction: {
          en: "Give hackforge.txt away to the fellow trainee account: sudo chown ignite hackforge.txt",
          el: "Χάρισε το hackforge.txt στον συνάδελφο: sudo chown ignite hackforge.txt",
        },
        hint: { en: "sudo chown ignite hackforge.txt", el: "sudo chown ignite hackforge.txt" },
        explain: {
          en: "Without sudo the kernel answers 'Operation not permitted' — only root transfers ownership, because handing out files is power. chown also accepts user:group in one shot: `chown ignite:ignite file`. New owner, new control over the permission bits.",
          el: "Χωρίς sudo ο πυρήνας απαντά 'Operation not permitted' — μόνο ο root μεταβιβάζει ιδιοκτησία, γιατί το να χαρίζεις αρχεία είναι δύναμη. Το chown δέχεται και user:group με τη μία: `chown ignite:ignite file`. Νέος ιδιοκτήτης, νέος έλεγχος των bits.",
        },
        check: (t) => t.ownerOf("/home/operator/hackforge.txt") === "ignite",
      },
      {
        id: "sr-perms-chgrp",
        instruction: {
          en: "Move the same file to the ignite team's group: chgrp ignite hackforge.txt",
          el: "Μετακίνησε το ίδιο αρχείο στην ομάδα της ignite: chgrp ignite hackforge.txt",
        },
        hint: { en: "chgrp ignite hackforge.txt", el: "chgrp ignite hackforge.txt" },
        explain: {
          en: "Group ownership is how a team shares one file without opening it to the whole world: set the group to the team, then give the group exactly the bits it needs. In the real world this is the difference between a shared deployment folder and a leak.",
          el: "Η ομαδική ιδιοκτησία είναι ο τρόπος να μοιράζεται μια ομάδα ένα αρχείο χωρίς να το ανοίξει σε όλον τον κόσμο: βάλε την ομάδα της ομάδας και μετά δώσε στην ομάδα ακριβώς τα bits που χρειάζεται. Στην πράξη, αυτή είναι η διαφορά ανάμεσα σε έναν κοινό φάκελο deployment και σε μια διαρροή.",
        },
        check: (t) => t.groupOf("/home/operator/hackforge.txt") === "ignite",
      },
      {
        id: "sr-perms-verify",
        instruction: {
          en: "Prove both changes landed in one listing: ls -l hackforge.txt",
          el: "Απόδειξε ότι και οι δύο αλλαγές έγιναν με μία λίστα: ls -l hackforge.txt",
        },
        hint: { en: "ls -l hackforge.txt", el: "ls -l hackforge.txt" },
        explain: {
          en: "Columns four and five now read ignite and ignite. Change → verify: the same loop you practised with sed. An unverified permission change is an assumption, and assumptions are how boxes get owned.",
          el: "Οι στήλες τέσσερα και πέντε τώρα λένε ignite και ignite. Αλλαγή → επαλήθευση: ο ίδιος βρόχος που εξάσκησες με το sed. Μια ανεπαλήθευτη αλλαγή δικαιωμάτων είναι υπόθεση, και οι υποθέσεις είναι ο τρόπος που τα boxes γίνονται owned.",
        },
        check: (t) => t.listedLong && t.ownerOf("/home/operator/hackforge.txt") === "ignite",
      },
      {
        id: "sr-perms-chmodx",
        instruction: {
          en: "Make the training file runnable with the symbolic dialect: chmod +x hackforge.txt",
          el: "Κάνε το εκπαιδευτικό αρχείο εκτελέσιμο με τη συμβολική διάλεκτο: chmod +x hackforge.txt",
        },
        hint: { en: "chmod +x hackforge.txt", el: "chmod +x hackforge.txt" },
        explain: {
          en: "On a real terminal the name turns green — the shell's own way of saying 'this is executable now'. +x without a who-part means 'everyone'. Compare with `chmod u+x` (owner only) and `chmod a+x` (explicitly everyone).",
          el: "Σε πραγματικό τερματικό το όνομα γίνεται πράσινο — ο τρόπος του shell να πει «είναι εκτελέσιμο τώρα». Το +x χωρίς μέρος who σημαίνει «όλοι». Σύγκρινε με `chmod u+x` (μόνο ιδιοκτήτης) και `chmod a+x` (ρητά όλοι).",
        },
        check: (t) => t.chmodX.has("/home/operator/hackforge.txt"),
      },
      {
        id: "sr-perms-chmodnum",
        instruction: {
          en: "Now speak numeric: set the file to the polite document mode with chmod 644 hackforge.txt and check the letters changed.",
          el: "Τώρα μίλα αριθμητικά: βάλε το αρχείο στο ευγενικό mode εγγράφου με chmod 644 hackforge.txt και δες τα γράμματα να αλλάζουν.",
        },
        hint: { en: "chmod 644 hackforge.txt", el: "chmod 644 hackforge.txt" },
        explain: {
          en: "644 = rw- for the owner, r-- for the group, r-- for the world. It also CLEARED the execute bit you just added, because a numeric mode describes the final state completely. That is the difference between the two dialects: symbolic adds or removes, numeric declares.",
          el: "644 = rw- για τον ιδιοκτήτη, r-- για την ομάδα, r-- για τον κόσμο. Επίσης ΚΑΘΑΡΙΣΕ το execute bit που μόλις πρόσθεσες, γιατί ένα αριθμητικό mode περιγράφει πλήρως την τελική κατάσταση. Αυτή είναι η διαφορά των δύο διαλέκτων: η συμβολική προσθέτει ή αφαιρεί, η αριθμητική δηλώνει.",
        },
        check: (t) => t.permsOf("/home/operator/hackforge.txt") === "rw-r--r--",
      },
      {
        id: "sr-perms-suid",
        instruction: {
          en: "Set the SUID bit: chmod 4644 hackforge.txt — then look with ls -l for the little 's'.",
          el: "Βάλε το SUID bit: chmod 4644 hackforge.txt — και μετά κοίτα με ls -l για το μικρό 's'.",
        },
        hint: { en: "chmod 4644 hackforge.txt", el: "chmod 4644 hackforge.txt" },
        explain: {
          en: "The leading 4 is the SUID bit: this file now executes with the permissions of its owner, for anybody who runs it. ls -l renders it as 's' in the owner's execute slot (capital 'S' if there was no x). Real examples: /usr/bin/passwd, /usr/bin/sudo. Real risk: a SUID-root shell or cp is an instant root account for any local user.",
          el: "Το 4 μπροστά είναι το SUID bit: αυτό το αρχείο πλέον εκτελείται με τα δικαιώματα του ιδιοκτήτη του, για οποιονδήποτε το τρέξει. Το ls -l το ζωγραφίζει ως 's' στη θέση execute του ιδιοκτήτη (κεφαλαίο 'S' αν δεν υπήρχε x). Πραγματικά παραδείγματα: /usr/bin/passwd, /usr/bin/sudo. Πραγματικός κίνδυνος: ένα SUID-root shell ή cp είναι άμεσος λογαριασμός root για κάθε τοπικό χρήστη.",
        },
        check: (t) => (t.specialPerms("/home/operator/hackforge.txt") || {}).suid === true,
      },
      {
        id: "sr-perms-sgid",
        instruction: {
          en: "Swap the trick to the group side: chmod 2466 hackforge.txt sets SGID. Verify with ls -l.",
          el: "Μεταφορά του κόλπου στην πλευρά της ομάδας: chmod 2466 hackforge.txt βάζει SGID. Επαλήθευσε με ls -l.",
        },
        hint: { en: "chmod 2466 hackforge.txt", el: "chmod 2466 hackforge.txt" },
        explain: {
          en: "The leading 2 is SGID: the file runs with the owner's GROUP permissions. On directories SGID is genuinely useful — new files inherit the directory's group, which is how shared team folders keep working. Note this command also replaced SUID, because the special digit describes both bits at once (7 = SUID+SGID+sticky).",
          el: "Το 2 μπροστά είναι το SGID: το αρχείο τρέχει με τα δικαιώματα της ΟΜΑΔΑΣ του ιδιοκτήτη. Σε φακέλους το SGID είναι πραγματικά χρήσιμο — τα νέα αρχεία κληρονομούν την ομάδα του φακέλου, έτσι οι κοινοί φάκελοι ομάδας συνεχίζουν να δουλεύουν. Πρόσεξε ότι αυτή η εντολή αντικατέστησε το SUID, γιατί το ειδικό ψηφίο περιγράφει και τα δύο bits μαζί (7 = SUID+SGID+sticky).",
        },
        check: (t) => (t.specialPerms("/home/operator/hackforge.txt") || {}).setgid === true,
      },
    ],
    challenges: [
      {
        title: { en: "The Locked Drawer", el: "Το Κλειδωμένο Συρτάρι" },
        brief: {
          en: "Create a file called secret.txt in your home, write the line 'flag{permissions_keep_secrets}' into it with echo and a redirect, then lock it so ONLY you can read it. ls -l must show -rw-------.",
          el: "Δημιούργησε ένα αρχείο secret.txt στο home σου, γράψε μέσα τη γραμμή 'flag{permissions_keep_secrets}' με echo και ανακατεύθυνση, και μετά κλείδωσέ το ώστε ΜΟΝΟ εσύ να το διαβάζεις. Το ls -l πρέπει να δείχνει -rw-------.",
        },
        success: { en: "600 applied — the drawer is yours alone.", el: "600 εφαρμόστηκε — το συρτάρι είναι δικό σου μόνο." },
        check: (t) =>
          t.permsOf("/home/operator/secret.txt") === "rw-------" &&
          (t.fileContent("/home/operator/secret.txt") || "").includes("flag{permissions_keep_secrets}"),
      },
      {
        title: { en: "Borrowed Power", el: "Δανεική Δύναμη" },
        brief: {
          en: "Make scanner.sh executable for its owner AND give it the SUID bit in one numeric chmod command, then display the long listing so the 's' is visible on screen.",
          el: "Κάνε το scanner.sh εκτελέσιμο για τον ιδιοκτήτη του ΚΑΙ δώσε του το SUID bit με μία αριθμητική εντολή chmod, και μετά δείξε την αναλυτική λίστα ώστε να φαίνεται το 's' στην οθόνη.",
        },
        success: { en: "4755 understood from the inside — you can now spot SUID at a glance.", el: "4755 κατανοημένο από μέσα — τώρα αναγνωρίζεις το SUID με μια ματιά." },
        check: (t) => {
          const sp = t.specialPerms("/home/operator/scanner.sh") || {};
          return sp.suid === true && (t.permsOf("/home/operator/scanner.sh") || "").includes("x") && t.listedLong;
        },
      },
    ],
  },

  // ================================================== MODULE 7 — NETWORK CONTROL
  {
    id: "sr-net",
    order: 7,
    icon: "📡",
    color: "from-cyan-500 to-blue-700",
    title: { en: "Network Control", el: "Έλεγχος Δικτύου" },
    subtitle: {
      en: "ifconfig, iwconfig, IP & MAC changes, dhclient, dig, resolv.conf, hosts.",
      el: "ifconfig, iwconfig, αλλαγές IP & MAC, dhclient, dig, resolv.conf, hosts.",
    },
    difficulty: 2,
    badge: { en: "Signal Rider", el: "Καβαλάρης Σήματος" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "Why networking belongs in a Linux course", el: "Γιατί το δίκτυο ανήκει σε μάθημα Linux" },
        body: {
          en: "Networking is a crucial topic for any aspiring penetration tester: most of the time you will be asked to test a network or something reachable through it. That means knowing how to connect to, inspect and reshape your own network devices before you touch anybody else's. Linux gives you the tools to do all of it from one terminal window — no control panels, no wizards.",
          el: "Το δίκτυο είναι κρίσιμο θέμα για κάθε υποψήφιο penetration tester: τις περισσότερες φορές θα σου ζητηθεί να ελέγξεις ένα δίκτυο ή κάτι προσβάσιμο μέσα από αυτό. Αυτό σημαίνει ότι πρέπει να ξέρεις να συνδέεσαι, να επιθεωρείς και να ανασχηματίζεις τις δικές σου συσκευές δικτύου πριν αγγίξεις των άλλων. Το Linux σου δίνει τα εργαλεία για όλα αυτά από ένα παράθυρο τερματικού — χωρίς control panels, χωρίς wizards.",
        },
      },
      {
        heading: { en: "ifconfig — reading your interfaces", el: "ifconfig — διάβασε τις διεπαφές σου" },
        body: {
          en: "`ifconfig` is the most basic tool for interacting with active network interfaces. Run it and you see one block per interface: `eth0` is the wired ethernet, `lo` is loopback and is always mapped to 127.0.0.1 (the address your machine uses to talk to itself). Inside each block you read the IP address, the netmask (which part of the address is 'network' and which is 'host'), the broadcast address of the segment, and the MAC address — the hardware identity of the card, which no DHCP server hands out and which never changes by itself.",
          el: "Το `ifconfig` είναι το πιο βασικό εργαλείο αλληλεπίδρασης με ενεργές διεπαφές δικτύου. Τρέξε το και βλέπεις ένα μπλοκ ανά διεπαφή: το `eth0` είναι το ενσύρματο ethernet, το `lo` είναι το loopback και πάντα αντιστοιχίζεται στο 127.0.0.1 (η διεύθυνση με την οποία το μηχάνημα μιλά στον εαυτό του). Μέσα σε κάθε μπλοκ διαβάζεις τη διεύθυνση IP, τη netmask (ποιο μέρος της διεύθυνσης είναι «δίκτυο» και ποιο «υπολογιστής»), τη διεύθυνση broadcast του τμήματος, και τη διεύθυνση MAC — την ταυτότητα υλικού της κάρτας, που κανένα DHCP server δεν μοιράζει και που δεν αλλάζει ποτέ από μόνη της.",
        },
        tip: {
          en: "Modern systems also ship `ip a` / `ip addr` — same information, newer syntax. Learn both; exams and old boxes use them interchangeably.",
          el: "Τα σύγχρονα συστήματα έχουν και το `ip a` / `ip addr` — ίδια πληροφορία, νεότερη σύνταξη. Μάθε και τα δύο· εξετάσεις και παλιά boxes τα χρησιμοποιούν εναλλακτικά.",
        },
      },
      {
        heading: { en: "iwconfig — the wireless view", el: "iwconfig — η ασύρματη όψη" },
        body: {
          en: "If the machine has a wireless adapter, `iwconfig` gathers the crucial radio information: the ESSID it is joined to, the operating mode (Managed for a normal client, Monitor when you are capturing), the bit rate, the transmit power and the signal quality. On a box with no wireless card at all, every interface simply answers 'no wireless extensions'. Either answer is useful reconnaissance: it tells you whether this machine can even be used for Wi-Fi work.",
          el: "Αν το μηχάνημα έχει ασύρματο προσαρμογέα, το `iwconfig` μαζεύει τις κρίσιμες ραδιοπληροφορίες: το ESSID στο οποίο είναι συνδεδεμένο, τη λειτουργία (Managed για κανονικό πελάτη, Monitor όταν καταγράφεις), τον ρυθμό, την ισχύ εκπομπής και την ποιότητα σήματος. Σε μηχάνημα χωρίς ασύρματη κάρτα, κάθε διεπαφή απλά απαντά 'no wireless extensions'. Και οι δύο απαντήσεις είναι χρήσιμη αναγνώριση: σου λένε αν αυτό το μηχάνημα κάνει καν για Wi-Fi δουλειά.",
        },
      },
      {
        heading: { en: "Changing the IP and spoofing the MAC", el: "Αλλαγή IP και πλαστογράφηση MAC" },
        body: {
          en: "To assign an address yourself: `ifconfig eth0 192.168.1.13`. To change the hardware identity you must take the interface down first, because a live card refuses a new MAC: `ifconfig eth0 down`, then `ifconfig eth0 hw ether 00:11:22:33:44:55`, then `ifconfig eth0 up`. Why bother? A MAC address is globally unique and is often used as a security control — to keep unknown devices out of a network, or to trace which card was seen where. Spoofing it neutralises those controls and buys anonymity. It is also how you demonstrate the weakness to a client, which is precisely why you must only ever do it on networks you are authorised to test.",
          el: "Για να αναθέσεις διεύθυνση μόνος σου: `ifconfig eth0 192.168.1.13`. Για να αλλάξεις την ταυτότητα υλικού πρέπει πρώτα να κατεβάσεις τη διεπαφή, γιατί μια ζωντανή κάρτα αρνείται νέο MAC: `ifconfig eth0 down`, μετά `ifconfig eth0 hw ether 00:11:22:33:44:55`, και μετά `ifconfig eth0 up`. Γιατί να μπει κανείς στον κόπο; Μια διεύθυνση MAC είναι μοναδική παγκοσμίως και συχνά χρησιμοποιείται ως έλεγχος ασφαλείας — για να μένουν έξω άγνωστες συσκευές, ή για να ανιχνεύεται ποια κάρτα εμφανίστηκε πού. Η πλαστογράφησή της εξουδετερώνει αυτούς τους ελέγχους και αγοράζει ανωνυμία. Είναι επίσης ο τρόπος να επιδείξεις την αδυναμία σε έναν πελάτη, γι' αυτό ακριβώς πρέπει να το κάνεις μόνο σε δίκτυα που έχεις εξουσιοδότηση να ελέγξεις.",
        },
      },
      {
        heading: { en: "dhclient — asking DHCP politely", el: "dhclient — ρώτα το DHCP ευγενικά" },
        body: {
          en: "Linux runs a DHCP client daemon that talks to the network's DHCP server — the background process that assigns IP addresses to every system on the subnet and keeps logs of what it handed out. `dhclient eth0` sends the discovery broadcast, receives an offer, and binds whatever lease the server gives you, replacing any address you had set by hand. Watch the four lines: DISCOVER, OFFER, REQUEST, ACK — that handshake is the first thing to check when a machine 'has no network'.",
          el: "Το Linux τρέχει έναν DHCP client daemon που μιλά στον DHCP server του δικτύου — τη διεργασία παρασκηνίου που αναθέτει IP σε κάθε σύστημα του υποδικτύου και κρατά logs για το τι μοίρασε. Το `dhclient eth0` στέλνει το discovery broadcast, δέχεται προσφορά, και δένεται με όποιο lease του δώσει ο server, αντικαθιστώντας όποια διεύθυνση είχες βάλει χειροκίνητα. Κοίτα τις τέσσερις γραμμές: DISCOVER, OFFER, REQUEST, ACK — αυτή η χειραψία είναι το πρώτο πράγμα που ελέγχεις όταν ένα μηχάνημα «δεν έχει δίκτυο».",
        },
      },
      {
        heading: { en: "DNS with dig: A, MX, NS", el: "DNS με dig: A, MX, NS" },
        body: {
          en: "DNS is the service that translates a domain name like hackforge.in into the IP address that actually routes. `dig hackforge.in` returns the A record — the address. Add a record type and you learn more about the organisation: `dig hackforge.in mx` lists the MAIL servers (where email for that domain lands), `dig hackforge.in ns` lists the NAME servers (who is authoritative for the zone). For a pentester this is free reconnaissance: mail servers reveal the provider, name servers reveal where the whole domain could be attacked or hijacked.",
          el: "Το DNS είναι η υπηρεσία που μεταφράζει ένα όνομα όπως το hackforge.in στη διεύθυνση IP που πραγματικά δρομολογεί. Το `dig hackforge.in` γυρνά την εγγραφή A — τη διεύθυνση. Πρόσθεσε τύπο εγγραφής και μαθαίνεις περισσότερα για τον οργανισμό: το `dig hackforge.in mx` εμφανίζει τους servers ηλεκτρονικού ταχυδρομείου (πού καταλήγει το email του domain), το `dig hackforge.in ns` εμφανίζει τους NAME servers (ποιος είναι authoritative για τη ζώνη). Για έναν pentester αυτό είναι δωρεάν αναγνώριση: οι mail servers αποκαλύπτουν τον πάροχο, οι name servers αποκαλύπτουν πού θα μπορούσε να χτυπηθεί ή να γίνει hijack ολόκληρο το domain.",
        },
      },
      {
        heading: { en: "Two files that decide where names go", el: "Δύο αρχεία που αποφασίζουν πού πάνε τα ονόματα" },
        body: {
          en: "`/etc/resolv.conf` tells the system WHICH DNS server to ask; editing it changes your resolver — `echo \"nameserver 1.1.1.1\" > /etc/resolv.conf` switches you to Cloudflare's public resolver (Google's is 8.8.8.8). `/etc/hosts` is consulted even earlier: it maps names to addresses locally, before any DNS query leaves the machine. That ordering is a weapon. An attacker who can write to /etc/hosts (or run a dnspoof on the wire) sends victims to an IP of their choosing — for example their own apache server hosting a convincing fake page — and the victim's browser shows the correct, trusted name the whole time.",
          el: "Το `/etc/resolv.conf` λέει στο σύστημα ΠΟΙΟΝ DNS server να ρωτήσει· η επεξεργασία του αλλάζει τον resolver σου — το `echo \"nameserver 1.1.1.1\" > /etc/resolv.conf` σε πάει στον δημόσιο resolver της Cloudflare (της Google είναι το 8.8.8.8). Το `/etc/hosts` συμβουλεύεται ακόμα νωρίτερα: αντιστοιχίζει ονόματα σε διευθύνσεις τοπικά, πριν φύγει οποιοδήποτε DNS ερώτημα από το μηχάνημα. Αυτή η σειρά είναι όπλο. Ένας επιτιθέμενος που μπορεί να γράψει στο /etc/hosts (ή να τρέξει dnspoof στο καλώδιο) στέλνει τα θύματα σε IP της επιλογής του — για παράδειγμα στον δικό του apache με μια πειστική ψεύτικη σελίδα — και το πρόγραμμα περιήγησης του θύματος δείχνει το σωστό, αξιόπιστο όνομα όλη την ώρα.",
        },
        tip: {
          en: "Defence: audit /etc/hosts and /etc/resolv.conf on every machine you harden. Both are one-line changes for an attacker with root.",
          el: "Άμυνα: έλεγξε το /etc/hosts και το /etc/resolv.conf σε κάθε μηχάνημα που θωρακίζεις. Και τα δύο είναι αλλαγές μίας γραμμής για επιτιθέμενο με root.",
        },
      },
    ],
    cheats: [
      { cmd: "ifconfig", desc: { en: "Interfaces, IP, netmask, broadcast, MAC", el: "Διεπαφές, IP, netmask, broadcast, MAC" } },
      { cmd: "iwconfig", desc: { en: "Wireless adapters: ESSID, mode, rate", el: "Ασύρματοι προσαρμογείς: ESSID, mode, ρυθμός" } },
      { cmd: "ifconfig eth0 IP", desc: { en: "Assign an address by hand", el: "Ανάθεση διεύθυνσης με το χέρι" } },
      { cmd: "ifconfig eth0 down/up", desc: { en: "Take the interface down / bring it up", el: "Κατέβασμα / ανέβασμα διεπαφής" } },
      { cmd: "ifconfig eth0 hw ether MAC", desc: { en: "Spoof the hardware address", el: "Πλαστογράφηση διεύθυνσης υλικού" } },
      { cmd: "dhclient eth0", desc: { en: "Request a lease from DHCP", el: "Αίτηση lease από DHCP" } },
      { cmd: "dig dom [mx|ns]", desc: { en: "A record / mail servers / name servers", el: "Εγγραφή A / mail servers / name servers" } },
      { cmd: "/etc/resolv.conf · /etc/hosts", desc: { en: "Resolver · local name mapping", el: "Resolver · τοπική αντιστοίχιση ονομάτων" } },
    ],
    tasks: [
      {
        id: "sr-net-ifconfig",
        instruction: {
          en: "Inventory your own connectivity: run ifconfig and read eth0's IP, netmask, broadcast and MAC — plus the loopback interface.",
          el: "Απογραφή της συνδεσιμότητάς σου: τρέξε ifconfig και διάβασε IP, netmask, broadcast και MAC του eth0 — μαζί με τη loopback διεπαφή.",
        },
        hint: { en: "ifconfig", el: "ifconfig" },
        explain: {
          en: "Two interfaces: eth0 on 10.10.10.13/24 (the lab network) and lo on 127.0.0.1. Your box's MAC starts with 08:00:27 — a VirtualBox prefix, a small reminder that fingerprints leak everywhere. Note the broadcast .255: every host on the segment hears broadcasts, which is exactly why ARP attacks work.",
          el: "Δύο διεπαφές: eth0 στο 10.10.10.13/24 (το δίκτυο του εργαστηρίου) και lo στο 127.0.0.1. Η MAC του box σου ξεκινά με 08:00:27 — πρόθεμα VirtualBox, μικρή υπενθύμιση ότι τα δακτυλικά αποτυπώματα διαρρέουν παντού. Πρόσεξε το broadcast .255: κάθε host στο τμήμα ακούει τα broadcasts, γι' αυτό ακριβώς δουλεύουν οι επιθέσεις ARP.",
        },
        check: (t) => t.ranIfconfig && t.eth0.up,
      },
      {
        id: "sr-net-iwconfig",
        instruction: {
          en: "Check the radio side of the box: iwconfig — is there a wireless adapter, and what is it doing?",
          el: "Έλεγξε τη ραδιοπλευρά του box: iwconfig — υπάρχει ασύρματος προσαρμογέας και τι κάνει;",
        },
        hint: { en: "iwconfig", el: "iwconfig" },
        explain: {
          en: "Here you get eth0 and lo answering 'no wireless extensions' plus a wlan0 joined to HackForge-5G in Managed mode. Managed = ordinary client. Wi-Fi assessments start by flipping that card into Monitor mode so it can capture every frame in the air instead of only frames addressed to it.",
          el: "Εδώ παίρνεις eth0 και lo να απαντούν 'no wireless extensions' μαζί με ένα wlan0 συνδεδεμένο στο HackForge-5G σε Managed mode. Managed = απλός πελάτης. Τα Wi-Fi assessments ξεκινούν γυρνώντας αυτή την κάρτα σε Monitor mode ώστε να πιάνει κάθε frame στον αέρα και όχι μόνο όσα απευθύνονται σε αυτήν.",
        },
        check: (t) => t.iwconfigRan,
      },
      {
        id: "sr-net-setip",
        instruction: {
          en: "Take manual control of the address: ifconfig eth0 192.168.1.13",
          el: "Πάρε χειροκίνητο έλεγχο της διεύθυνσης: ifconfig eth0 192.168.1.13",
        },
        hint: { en: "ifconfig eth0 192.168.1.13", el: "ifconfig eth0 192.168.1.13" },
        explain: {
          en: "The interface now carries an address from a different subnet than the lab. On real hardware that usually means 'no internet until you also fix the route' — a static IP is only half the configuration. Confirm with ifconfig.",
          el: "Η διεπαφή τώρα κουβαλά διεύθυνση από διαφορετικό υποδίκτυο από το εργαστήριο. Σε πραγματικό υλικό αυτό συνήθως σημαίνει «χωρίς internet μέχρι να φτιάξεις και το route» — μια στατική IP είναι μόνο η μισή ρύθμιση. Επιβεβαίωσε με ifconfig.",
        },
        check: (t) => t.eth0.ip === "192.168.1.13" && t.ipChanged,
      },
      {
        id: "sr-net-verifyip",
        instruction: {
          en: "Prove the change is live: run plain ifconfig again and find 192.168.1.13 in the output.",
          el: "Απόδειξε ότι η αλλαγή είναι ζωντανή: τρέξε σκέτο ifconfig ξανά και βρες το 192.168.1.13 στην έξοδο.",
        },
        hint: { en: "ifconfig", el: "ifconfig" },
        explain: {
          en: "Same command, different truth. Reading your own configuration back is the cheapest verification habit in Linux — it costs one keystroke and it catches every silent failure.",
          el: "Ίδια εντολή, διαφορετική αλήθεια. Το να διαβάζεις πίσω τη ρύθμισή σου είναι η φθηνότερη συνήθεια επαλήθευσης στο Linux — κοστίζει ένα πλήκτρο και πιάνει κάθε σιωπηλή αποτυχία.",
        },
        check: (t) => t.eth0.ip === "192.168.1.13" && cmd(t, /^ifconfig\s*$/),
      },
      {
        id: "sr-net-spoofmac",
        instruction: {
          en: "Change hardware identity the right way, in three steps: ifconfig eth0 down, then ifconfig eth0 hw ether 00:11:22:33:44:55, then ifconfig eth0 up.",
          el: "Άλλαξε ταυτότητα υλικού με τον σωστό τρόπο, σε τρία βήματα: ifconfig eth0 down, μετά ifconfig eth0 hw ether 00:11:22:33:44:55, μετά ifconfig eth0 up.",
        },
        hint: {
          en: "ifconfig eth0 down  →  ifconfig eth0 hw ether 00:11:22:33:44:55  →  ifconfig eth0 up",
          el: "ifconfig eth0 down  →  ifconfig eth0 hw ether 00:11:22:33:44:55  →  ifconfig eth0 up",
        },
        explain: {
          en: "Down → change → up. Skipping the 'down' is the classic beginner failure: a live interface refuses the new MAC. The address 00:11:22:33:44:55 is the textbook example because its pattern is obviously artificial — real spoofing picks a plausible vendor prefix instead of announcing itself.",
          el: "Κάτω → αλλαγή → πάνω. Το να παραλείψεις το 'down' είναι η κλασική αποτυχία αρχαρίων: μια ζωντανή διεπαφή αρνείται το νέο MAC. Η διεύθυνση 00:11:22:33:44:55 είναι το σχολικό παράδειγμα γιατί το μοτίβο της είναι προφανώς τεχνητό — η πραγματική πλαστογράφηση διαλέγει πιστευτό πρόθεμα κατασκευαστή αντί να διαφημίζει τον εαυτό της.",
        },
        check: (t) => t.macSpoofed && t.eth0.up,
      },
      {
        id: "sr-net-dhcp",
        instruction: {
          en: "Give control back to the network: dhclient eth0 — and watch which address the DHCP server hands out.",
          el: "Επίστρεψε τον έλεγχο στο δίκτυο: dhclient eth0 — και δες ποια διεύθυνση μοιράζει ο DHCP server.",
        },
        hint: { en: "dhclient eth0", el: "dhclient eth0" },
        explain: {
          en: "DISCOVER → OFFER → REQUEST → ACK, and the lease binds you back to 10.10.10.13 with a renewal timer. Your manual address is gone — DHCP wins. Two lessons: leases expire, and anyone who can answer a DISCOVER on the segment can hand out addresses (that is the rogue-DHCP attack).",
          el: "DISCOVER → OFFER → REQUEST → ACK, και το lease σε ξαναδένει στο 10.10.10.13 με χρονοδιακόπτη ανανέωσης. Η χειροκίνητη διεύθυνσή σου χάθηκε — το DHCP κερδίζει. Δύο μαθήματα: τα leases λήγουν, και όποιος μπορεί να απαντήσει σε DISCOVER στο τμήμα μπορεί να μοιράζει διευθύνσεις (αυτή είναι η επίθεση rogue-DHCP).",
        },
        check: (t) => t.dhcpDone && t.eth0.ip === "10.10.10.13",
      },
      {
        id: "sr-net-dig",
        instruction: {
          en: "Resolve the HackForge training domain: dig hackforge.in",
          el: "Επίλυσε το εκπαιδευτικό domain του HackForge: dig hackforge.in",
        },
        hint: { en: "dig hackforge.in", el: "dig hackforge.in" },
        explain: {
          en: "The ANSWER SECTION carries the A record: the IP that packets will actually be sent to. dig is the professional's DNS tool because it prints the whole conversation — query, flags, timing — instead of a bare answer. When a name 'does not work', dig tells you whether DNS or something else is at fault.",
          el: "Το ANSWER SECTION κουβαλά την εγγραφή A: την IP στην οποία πραγματικά θα σταλούν τα πακέτα. Το dig είναι το επαγγελματικό εργαλείο DNS γιατί τυπώνει ολόκληρη τη συνομιλία — ερώτημα, flags, χρονισμό — αντί για μια σκέτη απάντηση. Όταν ένα όνομα «δεν δουλεύει», το dig σου λέει αν φταίει το DNS ή κάτι άλλο.",
        },
        check: (t) => t.resolved.has("hackforge.in"),
      },
      {
        id: "sr-net-digmx",
        instruction: {
          en: "Find where the domain's email lands: dig hackforge.in mx",
          el: "Βρες πού καταλήγει το email του domain: dig hackforge.in mx",
        },
        hint: { en: "dig hackforge.in mx", el: "dig hackforge.in mx" },
        explain: {
          en: "MX records list mail servers with a priority number (lower = preferred). Two records here: mail and mail2. In a real assessment, MX records are how you discover which provider handles an organisation's mail — and therefore where its phishing defences live.",
          el: "Οι εγγραφές MX εμφανίζουν servers αλληλογραφίας με αριθμό προτεραιότητας (χαμηλότερο = προτιμότερο). Δύο εγγραφές εδώ: mail και mail2. Σε πραγματικό assessment, οι MX είναι ο τρόπος να ανακαλύψεις ποιον πάροχο χρησιμοποιεί ένας οργανισμός για το mail του — και άρα πού κατοικούν οι άμυνές του κατά του phishing.",
        },
        check: (t) => t.digMx,
      },
      {
        id: "sr-net-digns",
        instruction: {
          en: "Ask who is authoritative for the zone: dig hackforge.in ns",
          el: "Ρώτα ποιος είναι authoritative για τη ζώνη: dig hackforge.in ns",
        },
        hint: { en: "dig hackforge.in ns", el: "dig hackforge.in ns" },
        explain: {
          en: "NS records point at ns1/ns2 of the lab. Whoever controls those servers controls every answer the domain gives — which makes name servers a strategic target and DNSSEC, registrar locks and two-factor on the registrar account the strategic defences.",
          el: "Οι εγγραφές NS δείχνουν στα ns1/ns2 του εργαστηρίου. Όποιος ελέγχει αυτούς τους servers ελέγχει κάθε απάντηση που δίνει το domain — κάτι που κάνει τους name servers στρατηγικό στόχο και τα DNSSEC, registrar locks και two-factor στον λογαριασμό του registrar τις στρατηγικές άμυνες.",
        },
        check: (t) => t.digNs,
      },
      {
        id: "sr-net-resolv",
        instruction: {
          en: "Switch your resolver to Cloudflare in one line: echo \"nameserver 1.1.1.1\" > /etc/resolv.conf — then read the file back with cat.",
          el: "Άλλαξε τον resolver σου σε Cloudflare με μία γραμμή: echo \"nameserver 1.1.1.1\" > /etc/resolv.conf — και μετά διάβασε το αρχείο με cat.",
        },
        hint: { en: "echo \"nameserver 1.1.1.1\" > /etc/resolv.conf  then  cat /etc/resolv.conf", el: "echo \"nameserver 1.1.1.1\" > /etc/resolv.conf  και μετά  cat /etc/resolv.conf" },
        explain: {
          en: "The single > overwrote the whole file — no editor needed, and no undo. That is the sharp edge of redirection: use >> to append, > only when you truly mean 'replace everything'. Google's public resolver is 8.8.8.8; a resolver you control is also a privacy decision, not just a performance one.",
          el: "Το μονό > αντικατέστησε ολόκληρο το αρχείο — χωρίς editor και χωρίς αναίρεση. Αυτή είναι η κοφτερή πλευρά της ανακατεύθυνσης: χρησιμοποίησε >> για προσθήκη, > μόνο όταν πραγματικά εννοείς «αντικατάσταση όλων». Ο δημόσιος resolver της Google είναι το 8.8.8.8· ένας resolver που ελέγχεις είναι και απόφαση ιδιωτικότητας, όχι μόνο απόδοση.",
        },
        check: (t) => (t.fileContent("/etc/resolv.conf") || "").includes("nameserver 1.1.1.1"),
      },
      {
        id: "sr-net-nanohosts",
        instruction: {
          en: "Open the local name-mapping file in an editor: nano /etc/hosts — see how localhost and the lab hosts are pinned to addresses.",
          el: "Άνοιξε το αρχείο τοπικής αντιστοίχισης ονομάτων σε editor: nano /etc/hosts — δες πώς το localhost και τα host του εργαστηρίου είναι καρφιτσωμένα σε διευθύνσεις.",
        },
        hint: { en: "nano /etc/hosts", el: "nano /etc/hosts" },
        explain: {
          en: "The resolver order is: /etc/hosts first, then DNS. So one line in this file beats any DNS server on the internet. Administrators use it to pin a service during a migration; attackers use it to send a victim to a fake server while the address bar still shows a trusted name.",
          el: "Η σειρά επίλυσης είναι: πρώτα /etc/hosts, μετά DNS. Άρα μία γραμμή σε αυτό το αρχείο νικά οποιονδήποτε DNS server στο internet. Οι administrators το χρησιμοποιούν για να καρφιτσώσουν μια υπηρεσία κατά τη διάρκεια migration· οι επιτιθέμενοι για να στείλουν ένα θύμα σε ψεύτικο server ενώ η μπάρα διεύθυνσης δείχνει ακόμα αξιόπιστο όνομα.",
        },
        check: (t) => t.nanoOpened.has("/etc/hosts"),
      },
      {
        id: "sr-net-grepinet",
        instruction: {
          en: "Filter interface noise down to just addresses: ifconfig | grep inet",
          el: "Φίλτραρε τον θόρυβο διεπαφών μόνο στις διευθύνσεις: ifconfig | grep inet",
        },
        hint: { en: "ifconfig | grep inet", el: "ifconfig | grep inet" },
        explain: {
          en: "This is the pipe idiom you will use forever: a verbose command on the left, grep on the right, and only the lines you care about survive. In scripts people extend it with awk or cut to grab the bare address. Note that 'inet6' lines also match — use `grep \"inet \"` with a trailing space to exclude them.",
          el: "Αυτό είναι το ιδίωμα pipe που θα χρησιμοποιείς για πάντα: πολύλογη εντολή αριστερά, grep δεξιά, και επιβιώνουν μόνο οι γραμμές που σε νοιάζουν. Σε scripts το επεκτείνουν με awk ή cut για να πάρουν τη σκέτη διεύθυνση. Πρόσεξε ότι ταιριάζουν και οι γραμμές 'inet6' — χρησιμοποίησε `grep \"inet \"` με κενό στο τέλος για να τις αποκλείσεις.",
        },
        check: (t) => cmd(t, /^ifconfig\s*\|\s*grep\s+inet/),
      },
    ],
    challenges: [
      {
        title: { en: "Ghost on the Wire", el: "Φάντασμα στο Καλώδιο" },
        brief: {
          en: "Make this machine unrecognisable at layer two: bring eth0 down, give it the MAC aa:bb:cc:dd:ee:ff, bring it back up, then run ifconfig and confirm the spoofed address is what the interface reports.",
          el: "Κάνε αυτό το μηχάνημα μη αναγνωρίσιμο στο layer two: κατέβασε το eth0, δώσε του το MAC aa:bb:cc:dd:ee:ff, ανέβασέ το ξανά, και μετά τρέξε ifconfig και επιβεβαίωσε ότι η πλαστογραφημένη διεύθυνση είναι αυτή που αναφέρει η διεπαφή.",
        },
        success: { en: "New hardware identity, interface live, change verified.", el: "Νέα ταυτότητα υλικού, διεπαφή ζωντανή, αλλαγή επαληθευμένη." },
        check: (t) => t.eth0.mac === "aa:bb:cc:dd:ee:ff" && t.eth0.up && cmd(t, /^ifconfig\s*$/),
      },
      {
        title: { en: "Silent Redirect", el: "Σιωπηλή Ανακατεύθυνση" },
        brief: {
          en: "Poison your own name resolution like an attacker would: append the line '10.10.10.99 www.hackforge.in' to /etc/hosts with echo and >>, then prove the entry is in place with grep.",
          el: "Δηλητηρίασε την επίλυση ονομάτων του εαυτού σου όπως θα έκανε ένας επιτιθέμενος: πρόσθεσε τη γραμμή '10.10.10.99 www.hackforge.in' στο /etc/hosts με echo και >>, και μετά απόδειξε ότι η καταχώρηση είναι στη θέση της με grep.",
        },
        success: { en: "Hosts poisoned and verified — you now understand the dnspoof primitive.", el: "Hosts δηλητηριάστηκαν και επαληθεύτηκαν — τώρα καταλαβαίνεις το πρωτόγονο dnspoof." },
        check: (t) =>
          (t.fileContent("/etc/hosts") || "").includes("10.10.10.99 www.hackforge.in") &&
          t.grepped.has("/etc/hosts"),
      },
    ],
  },

  // ================================================== MODULE 8 — PROCESS COMMAND
  {
    id: "sr-proc",
    order: 8,
    icon: "⚙️",
    color: "from-lime-500 to-emerald-700",
    title: { en: "Process Command", el: "Διοίκηση Διεργασιών" },
    subtitle: {
      en: "ps, top, nice, renice, kill, background jobs and the at scheduler.",
      el: "ps, top, nice, renice, kill, εργασίες παρασκηνίου και ο at scheduler.",
    },
    difficulty: 2,
    badge: { en: "Process Wrangler", el: "Δαμαστής Διεργασιών" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "What a process is — and why you kill them", el: "Τι είναι η διεργασία — και γιατί τις σκοτώνεις" },
        body: {
          en: "A process is simply a program that is running on your system and consuming resources: CPU time, memory, open files, sockets. Every process gets a PID (process ID), unique while it lives. You will need to manage them for two very different reasons. The honest one: a process misbehaves, hangs or eats memory, and has to be stopped or restarted. The offensive one: as a pentester you may need to stop an anti-virus agent or a firewall that is in your way, and you must be able to find it first. Both start with the same skill — seeing what is running.",
          el: "Μια διεργασία είναι απλά ένα πρόγραμμα που τρέχει στο σύστημά σου και καταναλώνει πόρους: χρόνο CPU, μνήμη, ανοιχτά αρχεία, sockets. Κάθε διεργασία παίρνει ένα PID (process ID), μοναδικό όσο ζει. Θα χρειαστεί να τις διαχειριστείς για δύο πολύ διαφορετικούς λόγους. Ο τίμιος: μια διεργασία συμπεριφέρεται άσχημα, κολλάει ή τρώει μνήμη και πρέπει να σταματήσει ή να επανεκκινηθεί. Ο επιθετικός: ως pentester ίσως χρειαστεί να σταματήσεις έναν αντι-ιό ή ένα firewall που σε εμποδίζει, και πρέπει πρώτα να το βρεις. Και τα δύο ξεκινούν από την ίδια ικανότητα — να βλέπεις τι τρέχει.",
        },
      },
      {
        heading: { en: "ps — and what ps aux actually prints", el: "ps — και τι πραγματικά τυπώνει το ps aux" },
        body: {
          en: "Typing `ps` in a bash shell lists the processes attached to your current terminal. That is a tiny slice of the system, which is why everybody uses `ps aux`: a = every user's processes, u = user-oriented format, x = processes without a terminal. The columns you must be able to read: USER (who started it), PID, %CPU, %MEM, VSZ (virtual memory) and RSS (resident memory in KB), TTY, STAT (S sleeping, R running, Z zombie), START, TIME, and COMMAND. Then pipe it: `ps aux | grep msfconsole` finds one specific tool in a wall of text — the single most-used process command in security work.",
          el: "Πληκτρολογώντας `ps` σε ένα bash shell βλέπεις τις διεργασίες που ανήκουν στο τρέχον τερματικό σου. Αυτό είναι ένα ελάχιστο κομμάτι του συστήματος, γι' αυτό όλοι χρησιμοποιούν το `ps aux`: a = διεργασίες κάθε χρήστη, u = μορφή προσανατολισμένη στον χρήστη, x = διεργασίες χωρίς τερματικό. Οι στήλες που πρέπει να διαβάζεις: USER (ποιος την ξεκίνησε), PID, %CPU, %MEM, VSZ (εικονική μνήμη) και RSS (κατοικημένη μνήμη σε KB), TTY, STAT (S sleeping, R running, Z zombie), START, TIME, και COMMAND. Μετά πέρνα το από σωλήνα: το `ps aux | grep msfconsole` βρίσκει ένα συγκεκριμένο εργαλείο μέσα σε τοίχο κειμένου — η πιο χρησιμοποιούμενη εντολή διεργασιών στη δουλειά ασφαλείας.",
        },
        tip: {
          en: "A process in state Z (zombie) is already dead but not yet reaped by its parent — it holds a PID and nothing else. Seeing many of them points at a broken parent program.",
          el: "Μια διεργασία σε κατάσταση Z (zombie) είναι ήδη νεκρή αλλά δεν την έχει ακόμα μαζέψει ο γονέας της — κρατά ένα PID και τίποτα άλλο. Πολλά τέτοια δείχνουν σπασμένο γονικό πρόγραμμα.",
        },
      },
      {
        heading: { en: "top — who is being greedy", el: "top — ποιος είναι άπληστος" },
        body: {
          en: "`ps` gives you a snapshot; `top` gives you a live monitor that keeps refreshing (every few seconds, unlike ps which prints once and exits). Processes are ordered by resource use, so the greediest one sits at the top of the list. The header lines are just as useful as the table: load average over 1/5/15 minutes, total tasks, and the CPU breakdown (us user, sy system, id idle). When a machine 'feels slow', top answers in two seconds — and it tells you whether the culprit is a process, a memory shortage or simply everybody's expectations.",
          el: "Το `ps` δίνει στιγμιότυπο· το `top` δίνει ζωντανή παρακολούθηση που ανανεώνεται συνεχώς (κάθε λίγα δευτερόλεπτα, σε αντίθεση με το ps που τυπώνει μία φορά και βγαίνει). Οι διεργασίες ταξινομούνται κατά χρήση πόρων, άρα η πιο άπληστη κάθεται στην κορυφή της λίστας. Οι γραμμές κεφαλίδας είναι εξίσου χρήσιμες με τον πίνακα: load average για 1/5/15 λεπτά, σύνολο εργασιών, και η ανάλυση CPU (us χρήστης, sy σύστημα, id αδρανές). Όταν ένα μηχάνημα «νιώθει αργό», το top απαντά σε δύο δευτερόλεπτα — και σου λέει αν φταίει μια διεργασία, έλλειψη μνήμης ή απλά οι προσδοκίες όλων.",
        },
      },
      {
        heading: { en: "nice and renice — the priority dial", el: "nice και renice — το ροδάκινο προτεραιότητας" },
        body: {
          en: "Linux schedules processes by priority, expressed as 'niceness' from -20 (highest priority, least nice to everyone else) to 19 (lowest). You set it at launch with `nice -n -10 /usr/bin/ssh-agent` — start this command ten steps more important than default. For a process already running you use `renice`, which takes an absolute value plus the PID: `renice 20 6242` rewrites the priority of PID 6242. Practical uses: keeping a backup or a long scan from starving the interactive session, or pushing a critical service above noisy neighbours. Note that raising priority (negative niceness) needs root.",
          el: "Το Linux δρομολογεί τις διεργασίες κατά προτεραιότητα, εκφρασμένη ως «niceness» από -20 (υψηλότερη προτεραιότητα, λιγότερο ευγενικό προς όλους τους άλλους) έως 19 (χαμηλότερη). Την ορίζεις στην εκκίνηση με `nice -n -10 /usr/bin/ssh-agent` — ξεκίνα αυτή την εντολή δέκα σκαλιά πιο σημαντική από την προεπιλογή. Για διεργασία που ήδη τρέχει χρησιμοποιείς το `renice`, που παίρνει απόλυτη τιμή μαζί με το PID: το `renice 20 6242` ξαναγράφει την προτεραιότητα του PID 6242. Πρακτικές χρήσεις: να μην πνίγει ένα backup ή ένα μακρύ scan το διαδραστικό session, ή να ανεβάσεις μια κρίσιμη υπηρεσία πάνω από θορυβώδεις γείτονες. Πρόσεξε ότι το ανέβασμα προτεραιότητας (αρνητικό niceness) θέλει root.",
        },
      },
      {
        heading: { en: "kill — 64 ways to say stop", el: "kill — 64 τρόποι να πεις στοπ" },
        body: {
          en: "When a process misbehaves you send it a SIGNAL with `kill`. There are 64 signals, each meaning something slightly different, and two you will use constantly: `kill -1 PID` is SIGHUP (hangup — politely asks a process to reload or stop) and `kill -9 PID` is SIGKILL (the absolute kill: the kernel terminates it immediately, no cleanup, no chance to save state). The default, with no number, is SIGTERM (15) — a request the program can catch and handle gracefully. Professional habit: try the polite signal first, escalate to -9 only when the process ignores you, because -9 is how databases get corrupted.",
          el: "Όταν μια διεργασία συμπεριφέρεται άσχημα της στέλνεις ΣΗΜΑ με το `kill`. Υπάρχουν 64 σήματα, το καθένα με ελαφρώς διαφορετικό νόημα, και δύο που θα χρησιμοποιείς συνεχώς: το `kill -1 PID` είναι SIGHUP (hangup — ζητά ευγενικά από τη διεργασία να ξαναφορτώσει ή να σταματήσει) και το `kill -9 PID` είναι SIGKILL (η απόλυτη εκτέλεση: ο πυρήνας την τερματίζει αμέσως, χωρίς καθαρισμό, χωρίς ευκαιρία να αποθηκεύσει κατάσταση). Η προεπιλογή, χωρίς αριθμό, είναι SIGTERM (15) — ένα αίτημα που το πρόγραμμα μπορεί να πιάσει και να χειριστεί κομψά. Επαγγελματική συνήθεια: δοκίμασε πρώτα το ευγενικό σήμα, κλίμακωσε στο -9 μόνο όταν η διεργασία σε αγνοεί, γιατί το -9 είναι ο τρόπος που καταστρέφονται οι βάσεις δεδομένων.",
        },
      },
      {
        heading: { en: "Background, jobs, fg — and the at scheduler", el: "Παρασκήνιο, jobs, fg — και ο at scheduler" },
        body: {
          en: "Add `&` to the end of any command and it runs in the background while you keep typing: `nano hackforge.txt &` prints a job number and a PID. `jobs` lists the background jobs of your shell, and `fg %1` (or `fg PID`) drags one back to the foreground. For work that should happen later, without you, there are two daemons: `at` runs a job ONCE at a given time (`at 9:00pm`, then you type the command at its at> prompt), while `crond` handles anything that repeats — every day, every week — through the crontab you will master in a later module.",
          el: "Πρόσθεσε `&` στο τέλος οποιασδήποτε εντολής και τρέχει στο παρασκήνιο ενώ εσύ συνεχίζεις να γράφεις: το `nano hackforge.txt &` τυπώνει αριθμό εργασίας και ένα PID. Το `jobs` εμφανίζει τις εργασίες παρασκηνίου του shell σου, και το `fg %1` (ή `fg PID`) τραβά μία πίσω στο προσκήνιο. Για δουλειά που πρέπει να γίνει αργότερα, χωρίς εσένα, υπάρχουν δύο daemons: το `at` τρέχει μια εργασία ΜΙΑ φορά σε δεδομένη ώρα (`at 9:00pm`, και μετά γράφεις την εντολή στο prompt at>), ενώ το `crond` χειρίζεται ό,τι επαναλαμβάνεται — κάθε μέρα, κάθε βδομάδα — μέσω του crontab που θα κατακτήσεις σε επόμενη ενότητα.",
        },
        tip: {
          en: "Background a long scan and keep working: `nmap -sP 10.10.10.0/24 &`. On a real box, `nohup ... &` keeps it alive after you log out.",
          el: "Στείλε ένα μακρύ scan στο παρασκήνιο και συνέχισε: `nmap -sP 10.10.10.0/24 &`. Σε πραγματικό box, το `nohup ... &` το κρατά ζωντανό και μετά το logout.",
        },
      },
    ],
    cheats: [
      { cmd: "ps / ps aux", desc: { en: "Your terminal's processes / everything", el: "Διεργασίες τερματικού σου / όλες" } },
      { cmd: "ps aux | grep name", desc: { en: "Find one process in the noise", el: "Βρες μία διεργασία στον θόρυβο" } },
      { cmd: "top", desc: { en: "Live monitor, sorted by usage", el: "Ζωντανή παρακολούθηση, ταξινόμηση κατά χρήση" } },
      { cmd: "nice -n N cmd", desc: { en: "Launch with modified priority", el: "Εκκίνηση με τροποποιημένη προτεραιότητα" } },
      { cmd: "renice N PID", desc: { en: "Re-prioritise a running process", el: "Επαναπροτεραιοποίηση διεργασίας που τρέχει" } },
      { cmd: "kill -1 / -9 PID", desc: { en: "Hangup signal / absolute kill", el: "Σήμα hangup / απόλυτη εκτέλεση" } },
      { cmd: "cmd & · jobs · fg", desc: { en: "Background, list, foreground", el: "Παρασκήνιο, λίστα, προσκήνιο" } },
      { cmd: "at TIME", desc: { en: "Run a job once, later", el: "Τρέξε εργασία μία φορά, αργότερα" } },
    ],
    tasks: [
      {
        id: "sr-proc-ps",
        instruction: {
          en: "Look at what your own terminal is running right now: ps",
          el: "Κοίταξε τι τρέχει αυτή τη στιγμή το δικό σου τερματικό: ps",
        },
        hint: { en: "ps", el: "ps" },
        explain: {
          en: "Two lines: your bash shell and the ps command itself. That is the honest answer — plain ps only sees processes with your terminal attached. The rest of the system is invisible here, which is why the next task matters.",
          el: "Δύο γραμμές: το bash shell σου και η ίδια η εντολή ps. Αυτή είναι η τίμια απάντηση — το σκέτο ps βλέπει μόνο διεργασίες συνδεδεμένες με το τερματικό σου. Η υπόλοιπη ζωή του συστήματος είναι αόρατη εδώ, γι' αυτό μετράει η επόμενη εργασία.",
        },
        check: (t) => t.psRan,
      },
      {
        id: "sr-proc-psaux",
        instruction: {
          en: "Now see everything, for every user, with resource numbers: ps aux",
          el: "Τώρα δες τα πάντα, για κάθε χρήστη, με αριθμούς πόρων: ps aux",
        },
        hint: { en: "ps aux", el: "ps aux" },
        explain: {
          en: "Read down the STAT column while you are here: most are S (sleeping, waiting for work), one is R (running), and PID 4378 bluetoothd is Z — a zombie. Keep that PID in mind; it becomes a target later in this module.",
          el: "Διάβασε τη στήλη STAT όσο είσαι εδώ: οι περισσότερες είναι S (κοιμισμένες, περιμένουν δουλειά), μία είναι R (τρέχει), και το PID 4378 bluetoothd είναι Z — zombie. Κράτα αυτό το PID· γίνεται στόχος αργότερα σε αυτή την ενότητα.",
        },
        check: (t) => t.psAux,
      },
      {
        id: "sr-proc-grep",
        instruction: {
          en: "Find the Metasploit console in that wall of text: ps aux | grep msfconsole",
          el: "Βρες την κονσόλα Metasploit μέσα σε αυτόν τον τοίχο κειμένου: ps aux | grep msfconsole",
        },
        hint: { en: "ps aux | grep msfconsole", el: "ps aux | grep msfconsole" },
        explain: {
          en: "PID 5123, running as root, chewing 6.1% of memory. This exact command is how you confirm a tool is alive during a long engagement, how you find an attacker's implant on a compromised box, and how you locate the anti-virus process you may need to stop. It is the highest-value one-liner in this module.",
          el: "PID 5123, τρέχει ως root, τρώει 6.1% της μνήμης. Αυτή ακριβώς η εντολή είναι ο τρόπος να επιβεβαιώσεις ότι ένα εργαλείο ζει κατά τη διάρκεια μιας μακράς αποστολής, ο τρόπος να βρεις το implant ενός επιτιθέμενου σε παραβιασμένο box, και ο τρόπος να εντοπίσεις τη διεργασία του αντι-ιού που ίσως χρειαστεί να σταματήσεις. Είναι το πιο πολύτιμο one-liner αυτής της ενότητας.",
        },
        check: (t) => cmd(t, /^ps\s+aux\s*\|\s*grep\s+msfconsole/),
      },
      {
        id: "sr-proc-top",
        instruction: {
          en: "Open the live resource monitor: top — find the greediest process and read the load average line.",
          el: "Άνοιξε τη ζωντανή παρακολούθηση πόρων: top — βρες την πιο άπληστη διεργασία και διάβασε τη γραμμή load average.",
        },
        hint: { en: "top", el: "top" },
        explain: {
          en: "Load average 0.13 / 0.28 / 0.62 means the machine was mostly idle over the last 1, 5 and 15 minutes; a load above the number of CPU cores means work is queuing. In this sandbox top is static — on a real box it repaints every few seconds and you quit with q.",
          el: "Το load average 0.13 / 0.28 / 0.62 σημαίνει ότι το μηχάνημα ήταν κυρίως αδρανές τα τελευταία 1, 5 και 15 λεπτά· φορτίο πάνω από τον αριθμό των πυρήνων σημαίνει ότι η δουλειά ουροποιείται. Σε αυτό το sandbox το top είναι στατικό — σε πραγματικό box ξαναζωγραφίζεται κάθε λίγα δευτερόλεπτα και βγαίνεις με q.",
        },
        check: (t) => t.topRan,
      },
      {
        id: "sr-proc-nice",
        instruction: {
          en: "Launch something with boosted importance: nice -n -10 /usr/bin/ssh-agent",
          el: "Ξεκίνα κάτι με ενισχυμένη σημασία: nice -n -10 /usr/bin/ssh-agent",
        },
        hint: { en: "nice -n -10 /usr/bin/ssh-agent", el: "nice -n -10 /usr/bin/ssh-agent" },
        explain: {
          en: "The value after -n is the niceness: -10 means 'ten steps less nice', i.e. more priority. Because the number itself starts with a minus, the -n flag is required — without it the shell cannot tell a negative value from an option. Only root may go below 0.",
          el: "Η τιμή μετά το -n είναι το niceness: το -10 σημαίνει «δέκα σκαλιά λιγότερο ευγενικό», δηλαδή περισσότερη προτεραιότητα. Επειδή ο ίδιος ο αριθμός ξεκινά με πλην, το flag -n είναι υποχρεωτικό — χωρίς αυτό το shell δεν ξεχωρίζει αρνητική τιμή από επιλογή. Μόνο ο root μπορεί να πάει κάτω από το 0.",
        },
        check: (t) => t.niceRan && t.niceValue === "-10",
      },
      {
        id: "sr-proc-renice",
        instruction: {
          en: "Re-prioritise a process that is already alive: renice 20 6242",
          el: "Επαναπροτεραιοποίησε διεργασία που ήδη ζει: renice 20 6242",
        },
        hint: { en: "renice 20 6242", el: "renice 20 6242" },
        explain: {
          en: "PID 6242 is ssh-agent, and it now sits at the bottom of the priority scale — the scheduler will only run it when nothing else wants the CPU. renice takes an ABSOLUTE value between -20 and 19, not an increment: this is a common exam trap.",
          el: "Το PID 6242 είναι το ssh-agent και τώρα κάθεται στο κάτω μέρος της κλίμακας προτεραιότητας — ο δρομολογητής θα το τρέξει μόνο όταν τίποτα άλλο δεν θέλει τον CPU. Το renice παίρνει ΑΠΟΛΥΤΗ τιμή μεταξύ -20 και 19, όχι προσαύξηση: αυτό είναι κλασική παγίδα εξετάσεων.",
        },
        check: (t) => t.reniceRan && t.renicedPid === "6242",
      },
      {
        id: "sr-proc-kill1",
        instruction: {
          en: "Politely ask a process to go away: kill -1 6242",
          el: "Ζήτα ευγενικά από μια διεργασία να φύγει: kill -1 6242",
        },
        hint: { en: "kill -1 6242", el: "kill -1 6242" },
        explain: {
          en: "Signal 1 is SIGHUP. Historically it meant 'your terminal hung up'; today most daemons treat it as 'reload your configuration', which makes it the gentlest way to nudge a service. The process can ignore it — politeness is optional for the receiver.",
          el: "Το σήμα 1 είναι SIGHUP. Ιστορικά σήμαινε «το τερματικό σου κρέμασε»· σήμερα τα περισσότερα daemons το εκλαμβάνουν ως «ξαναφόρτωσε τις ρυθμίσεις σου», κάτι που το κάνει τον πιο ήπιο τρόπο να σκουντήξεις μια υπηρεσία. Η διεργασία μπορεί να το αγνοήσει — η ευγένεια είναι προαιρετική για τον παραλήπτη.",
        },
        check: (t) => t.killed.has("1:6242"),
      },
      {
        id: "sr-proc-kill9",
        instruction: {
          en: "Now take the zombie out with the absolute kill: kill -9 4378",
          el: "Τώρα βγάλε το zombie με την απόλυτη εκτέλεση: kill -9 4378",
        },
        hint: { en: "kill -9 4378", el: "kill -9 4378" },
        explain: {
          en: "SIGKILL cannot be caught, blocked or ignored — the kernel simply removes the process, which is why nothing gets a chance to flush buffers or release locks. Run ps aux afterwards: PID 4378 is gone from the list. Power and danger in one flag.",
          el: "Το SIGKILL δεν πιάνεται, δεν μπλοκάρεται, δεν αγνοείται — ο πυρήνας απλά αφαιρεί τη διεργασία, γι' αυτό τίποτα δεν προλαβαίνει να αδειάσει buffers ή να ελευθερώσει κλειδώματα. Τρέξε ps aux μετά: το PID 4378 έφυγε από τη λίστα. Δύναμη και κίνδυνος σε ένα flag.",
        },
        check: (t) => t.killed.has("9:4378"),
      },
      {
        id: "sr-proc-bg",
        instruction: {
          en: "Send a task to the background and keep working: nano hackforge.txt &",
          el: "Στείλε μια εργασία στο παρασκήνιο και συνέχισε να δουλεύεις: nano hackforge.txt &",
        },
        hint: { en: "nano hackforge.txt &", el: "nano hackforge.txt &" },
        explain: {
          en: "The shell answered with a job number and a PID — your receipt. The & is what turns a blocking command into a background one; it is the difference between a scan that freezes your session for an hour and a scan you simply forget about until you need the results.",
          el: "Το shell απάντησε με αριθμό εργασίας και ένα PID — η απόδειξή σου. Το & είναι αυτό που μετατρέπει μια εντολή που μπλοκάρει σε εντολή παρασκηνίου· είναι η διαφορά ανάμεσα σε ένα scan που παγώνει το session σου για μία ώρα και σε ένα scan που απλά ξεχνάς μέχρι να χρειαστείς τα αποτελέσματα.",
        },
        check: (t) => cmd(t, /&\s*$/),
      },
      {
        id: "sr-proc-jobs",
        instruction: {
          en: "List what is running behind your shell: jobs",
          el: "Δες τι τρέχει πίσω από το shell σου: jobs",
        },
        hint: { en: "jobs", el: "jobs" },
        explain: {
          en: "Each line shows the job number, its state and the command. Job numbers are per-shell (short and reused), PIDs are system-wide — that is why fg accepts either. If jobs answers 'no active jobs', you either never backgrounded anything or you opened a new shell.",
          el: "Κάθε γραμμή δείχνει τον αριθμό εργασίας, την κατάστασή της και την εντολή. Οι αριθμοί εργασιών είναι ανά shell (κοντοί και επαναχρησιμοποιούμενοι), τα PID είναι συστημικά — γι' αυτό το fg δέχεται και τα δύο. Αν το jobs απαντήσει 'no active jobs', είτε δεν έστειλες ποτέ τίποτα στο παρασκήνιο είτε άνοιξες νέο shell.",
        },
        check: (t) => cmd(t, /^jobs\b/),
      },
      {
        id: "sr-proc-fg",
        instruction: {
          en: "Bring that background job back to the front: fg 1",
          el: "Φέρε αυτή την εργασία παρασκηνίου μπροστά: fg 1",
        },
        hint: { en: "fg 1", el: "fg 1" },
        explain: {
          en: "fg re-attaches the job to your terminal so it can receive keyboard input again — essential for editors and interactive tools you backgrounded by mistake. The mirror command is bg, which resumes a stopped job in the background, and Ctrl+Z is what stops one in the first place.",
          el: "Το fg ξανασυνδέει την εργασία στο τερματικό σου ώστε να δέχεται πάλι είσοδο από το πληκτρολόγιο — απαραίτητο για editors και διαδραστικά εργαλεία που έστειλες κατά λάθος στο παρασκήνιο. Η κατοπτρική εντολή είναι το bg, που συνεχίζει μια σταματημένη εργασία στο παρασκήνιο, και το Ctrl+Z είναι αυτό που την σταματά εξαρχής.",
        },
        check: (t) => t.fgUsed,
      },
      {
        id: "sr-proc-at",
        instruction: {
          en: "Schedule a one-off job: type at 9:00pm and press Enter, then on the at> prompt type the script path /home/operator/simple_bash.sh",
          el: "Προγραμμάτισε μια εφάπαξ εργασία: γράψε at 9:00pm και πάτα Enter, και μετά στο prompt at> γράψε τη διαδρομή του script /home/operator/simple_bash.sh",
        },
        hint: { en: "at 9:00pm   then   /home/operator/simple_bash.sh", el: "at 9:00pm   και μετά   /home/operator/simple_bash.sh" },
        explain: {
          en: "at is a daemon for jobs that run ONCE: it prints a job number and waits for your command line (on a real box Ctrl+D closes the entry). Anything recurring belongs to cron instead — next module. Attackers love both, which is why 'what is scheduled on this box?' is a standard post-exploitation question.",
          el: "Το at είναι daemon για εργασίες που τρέχουν ΜΙΑ φορά: τυπώνει αριθμό εργασίας και περιμένει την εντολή σου (σε πραγματικό box το Ctrl+D κλείνει την καταχώρηση). Οτιδήποτε επαναλαμβανόμενο ανήκει στο cron — επόμενη ενότητα. Οι επιτιθέμενοι αγαπούν και τα δύο, γι' αυτό το «τι είναι προγραμματισμένο σε αυτό το box;» είναι τυπική ερώτηση post-exploitation.",
        },
        check: (t) => t.atScheduled,
      },
    ],
    challenges: [
      {
        title: { en: "Zombie Hunter", el: "Κυνηγός Zombie" },
        brief: {
          en: "A zombie is holding a PID slot on this box. Find it in the full process list, force-kill it, then run ps aux again and prove it no longer appears.",
          el: "Ένα zombie κρατά θέση PID σε αυτό το box. Βρες το στην πλήρη λίστα διεργασιών, εκτέλεσέ το αναγκαστικά, και μετά τρέξε πάλι ps aux και απόδειξε ότι δεν εμφανίζεται πια.",
        },
        success: { en: "PID 4378 reaped. The process table is clean.", el: "Το PID 4378 μαζεύτηκε. Ο πίνακας διεργασιών είναι καθαρός." },
        check: (t) => t.killedPids.has(4378) && t.psAux && cmd(t, /^ps\s+aux\b/),
      },
      {
        title: { en: "Night Shift", el: "Νυχτερινή Βάρδια" },
        brief: {
          en: "Hand the network scanner to the at daemon so it runs by itself at 11:30pm: start at 11:30pm, then give it the path /home/operator/scanner.sh at the at> prompt.",
          el: "Παράδωσε τον scanner δικτύου στον at daemon ώστε να τρέξει μόνος του στις 11:30pm: ξεκίνα at 11:30pm και μετά δώσε του τη διαδρομή /home/operator/scanner.sh στο prompt at>.",
        },
        success: { en: "Job scheduled and logged — your first piece of unattended automation.", el: "Η εργασία προγραμματίστηκε και καταγράφηκε — το πρώτο σου κομμάτι αυτοματοποίησης χωρίς επίβλεψη." },
        check: (t) => t.atScheduled && t.atJobs.some((j: any) => /scanner\.sh/.test(j.cmd)),
      },
    ],
  },

  // ============================================= MODULE 9 — ENVIRONMENT SHAPER
  {
    id: "sr-env",
    order: 9,
    icon: "🌐",
    color: "from-fuchsia-500 to-pink-700",
    title: { en: "Environment Shaper", el: "Διαμορφωτής Περιβάλλοντος" },
    subtitle: {
      en: "env, set, HISTSIZE, export, your own variables and unset.",
      el: "env, set, HISTSIZE, export, δικές σου μεταβλητές και unset.",
    },
    difficulty: 2,
    badge: { en: "Env Shaper", el: "Διαμορφωτής Env" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "Variables are the system's memory of your preferences", el: "Οι μεταβλητές είναι η μνήμη του συστήματος για τις προτιμήσεις σου" },
        body: {
          en: "Understanding environment variables is essential if you want to get the most out of Linux: they are how the system remembers configuration that every program can read. A variable is nothing more than a key-value pair of strings — HISTSIZE=1000, USER=operator, PATH=/usr/bin:/bin. Programs read them at startup and change their behaviour accordingly, which is why a wrong variable can break a tool that is perfectly installed.",
          el: "Η κατανόηση των μεταβλητών περιβάλλοντος είναι απαραίτητη αν θες να πάρεις τα μέγιστα από το Linux: είναι ο τρόπος που το σύστημα θυμάται ρυθμίσεις που κάθε πρόγραμμα μπορεί να διαβάσει. Μια μεταβλητή δεν είναι τίποτα περισσότερο από ένα ζεύγος κλειδί-τιμή από strings — HISTSIZE=1000, USER=operator, PATH=/usr/bin:/bin. Τα προγράμματα τις διαβάζουν στην εκκίνηση και αλλάζουν συμπεριφορά ανάλογα, γι' αυτό μια λάθος μεταβλητή μπορεί να σπάσει ένα εργαλείο που είναι τέλεια εγκατεστημένο.",
        },
      },
      {
        heading: { en: "Shell variables vs environment variables", el: "Shell μεταβλητές vs μεταβλητές περιβάλλοντος" },
        body: {
          en: "There are two kinds. A SHELL variable exists only inside the session that created it: open a second terminal window and it is not there. An ENVIRONMENT variable is exported to every child process, so tools you launch inherit it. In practice: assign with `NAME=value` to get a shell variable, add `export NAME` to promote it to the environment. `set` (or `env`) prints what you have; `env` shows the environment proper, `set` shows environment plus shell variables and functions.",
          el: "Υπάρχουν δύο είδη. Μια SHELL μεταβλητή υπάρχει μόνο μέσα στο session που τη δημιούργησε: άνοιξε δεύτερο παράθυρο τερματικού και δεν υπάρχει. Μια μεταβλητή ΠΕΡΙΒΑΛΛΟΝΤΟΣ εξάγεται σε κάθε παιδί-διεργασία, άρα τα εργαλεία που ξεκινάς την κληρονομούν. Στην πράξη: ανάθεσε με `NAME=value` για shell μεταβλητή, πρόσθεσε `export NAME` για να την προάγεις στο περιβάλλον. Το `set` (ή `env`) τυπώνει ό,τι έχεις· το `env` δείχνει το περιβάλλον καθαυτό, το `set` δείχνει περιβάλλον συν shell μεταβλητές και συναρτήσεις.",
        },
      },
      {
        heading: { en: "Reading and filtering them", el: "Διάβασμα και φιλτράρισμα" },
        body: {
          en: "A fresh shell carries dozens of variables, so you pipe the dump instead of scrolling: `set | more` pages through everything, and `set | grep HISTSIZE` answers one precise question — in this lab the history size is 1000 commands. HISTSIZE is a lovely teaching example because its effect is immediately visible: set it to 0 and the up-arrow stops recalling commands, because the shell is no longer keeping a history at all.",
          el: "Ένα φρέσκο shell κουβαλά δεκάδες μεταβλητές, οπότε περνάς το dump από σωλήνα αντί να σκρολάρεις: το `set | more` γυρνά σελίδες σε όλα, και το `set | grep HISTSIZE` απαντά σε μία ακριβή ερώτηση — σε αυτό το εργαστήριο το μέγεθος ιστορικού είναι 1000 εντολές. Το HISTSIZE είναι υπέροχο διδακτικό παράδειγμα γιατί η επίδρασή του φαίνεται αμέσως: βάλε το 0 και το πάνω βέλος σταματά να ανακαλεί εντολές, γιατί το shell δεν κρατά πια καθόλου ιστορικό.",
        },
      },
      {
        heading: { en: "Changing values: temporary, then permanent", el: "Αλλαγή τιμών: προσωρινή, μετά μόνιμη" },
        body: {
          en: "`HISTSIZE=0` changes the value for this session only; a new terminal goes back to the default. Before you touch a value, professional habit is to save the old one — `echo $HISTSIZE > ~/valueofHISTSIZE.txt` writes it into a file in your home, so you can always undo. Then change it, and if the change should survive, run `export HISTSIZE` to make it part of the environment. Truly permanent changes belong in a startup file such as ~/.bashrc, which every new shell reads — same idea, longer memory.",
          el: "Το `HISTSIZE=0` αλλάζει την τιμή μόνο για αυτό το session· ένα νέο τερματικό γυρίζει στην προεπιλογή. Πριν πειράξεις μια τιμή, επαγγελματική συνήθεια είναι να σώζεις την παλιά — το `echo $HISTSIZE > ~/valueofHISTSIZE.txt` τη γράφει σε αρχείο στο home σου, ώστε να μπορείς πάντα να την αναιρέσεις. Μετά άλλαξέ την, και αν η αλλαγή πρέπει να επιβιώσει, τρέξε `export HISTSIZE` για να γίνει μέρος του περιβάλλοντος. Οι πραγματικά μόνιμες αλλαγές ανήκουν σε αρχείο εκκίνησης όπως το ~/.bashrc, που το διαβάζει κάθε νέο shell — ίδια ιδέα, μεγαλύτερη μνήμη.",
        },
      },
      {
        heading: { en: "Your own variables — and deleting them", el: "Δικές σου μεταβλητές — και διαγραφή τους" },
        body: {
          en: "Nothing stops you inventing variables: `url_variable=\"hackforge.in/\"` creates one, and `echo $url_variable` reads it back (the $ is what turns a name into its value). Scripts live on this mechanism — that is how the scanner in a later module passes your typed network into nmap. When a variable has served its purpose, `unset url_variable` deletes it, and echoing it afterwards prints an empty line: gone, not blank.",
          el: "Τίποτα δεν σε εμποδίζει να επινοήσεις μεταβλητές: το `url_variable=\"hackforge.in/\"` δημιουργεί μία, και το `echo $url_variable` τη διαβάζει πίσω (το $ είναι αυτό που μετατρέπει ένα όνομα στην τιμή του). Τα scripts ζουν από αυτόν τον μηχανισμό — έτσι ο scanner σε επόμενη ενότητα περνά το δίκτυο που πληκτρολόγησες μέσα στο nmap. Όταν μια μεταβλητή τελείωσε τη δουλειά της, το `unset url_variable` τη διαγράφει, και το echo μετά τυπώνει κενή γραμμή: χάθηκε, δεν είναι κενή.",
        },
        tip: {
          en: "Security note: environment variables leak into every child process — never put passwords in one. `env | grep -i pass` on a compromised box is a real technique.",
          el: "Σημείωση ασφαλείας: οι μεταβλητές περιβάλλοντος διαρρέουν σε κάθε παιδί-διεργασία — μην βάζεις ποτέ κωδικούς σε μία. Το `env | grep -i pass` σε παραβιασμένο box είναι πραγματική τεχνική.",
        },
      },
    ],
    cheats: [
      { cmd: "env / set", desc: { en: "Print environment / environment + shell vars", el: "Τύπωσε περιβάλλον / περιβάλλον + shell vars" } },
      { cmd: "set | grep NAME", desc: { en: "Answer one precise question", el: "Απάντα σε μία ακριβή ερώτηση" } },
      { cmd: "NAME=value", desc: { en: "Create/change a shell variable", el: "Δημιούργησε/άλλαξε shell μεταβλητή" } },
      { cmd: "echo $NAME", desc: { en: "Read the value back", el: "Διάβασε την τιμή πίσω" } },
      { cmd: "export NAME", desc: { en: "Promote it to the environment", el: "Προήγαγέ την στο περιβάλλον" } },
      { cmd: "unset NAME", desc: { en: "Delete a variable", el: "Διάγραψε μια μεταβλητή" } },
    ],
    tasks: [
      {
        id: "sr-env-set",
        instruction: {
          en: "Dump everything the shell knows about you: set",
          el: "Τύπωσε ό,τι ξέρει το shell για σένα: set",
        },
        hint: { en: "set", el: "set" },
        explain: {
          en: "USER, HOME, SHELL, PATH, LANG, HOSTNAME, HISTSIZE — the identity card of your session. PATH deserves a second look: it is the ordered list of directories the shell searches when you type a bare command name, and the reason `which` from module 2 could answer so precisely.",
          el: "USER, HOME, SHELL, PATH, LANG, HOSTNAME, HISTSIZE — η ταυτότητα του session σου. Το PATH αξίζει δεύτερη ματιά: είναι η ταξινομημένη λίστα φακέλων που ψάχνει το shell όταν πληκτρολογείς σκέτο όνομα εντολής, και ο λόγος που το `which` της ενότητας 2 μπορούσε να απαντήσει τόσο ακριβώς.",
        },
        check: (t) => t.envViewed,
      },
      {
        id: "sr-env-setmore",
        instruction: {
          en: "Same dump, but readable: set | more",
          el: "Ίδιο dump, αλλά αναγνώσιμο: set | more",
        },
        hint: { en: "set | more", el: "set | more" },
        explain: {
          en: "Piping a long dump into a pager is the standard move whenever output is taller than your screen — logs, process lists, manual pages. more moves forward with space and quits at the end; less can also move backwards.",
          el: "Το να περνάς ένα μακρύ dump από pager είναι η τυπική κίνηση όταν η έξοδος είναι πιο ψηλή από την οθόνη σου — logs, λίστες διεργασιών, manual pages. Το more πηγαίνει μπροστά με space και τερματίζει στο τέλος· το less μπορεί και προς τα πίσω.",
        },
        check: (t) => cmd(t, /^set\s*\|\s*more\b/),
      },
      {
        id: "sr-env-grepvar",
        instruction: {
          en: "Ask one precise question: set | grep HISTSIZE — what is the history size on this box?",
          el: "Κάνε μία ακριβή ερώτηση: set | grep HISTSIZE — ποιο είναι το μέγεθος ιστορικού σε αυτό το box;",
        },
        hint: { en: "set | grep HISTSIZE", el: "set | grep HISTSIZE" },
        explain: {
          en: "HISTSIZE=1000. That is how many previous commands the up-arrow can recall. Attackers care about this variable too — the first thing many do after landing on a box is set HISTSIZE=0 or HISTFILE=/dev/null so their footprints are not recorded.",
          el: "HISTSIZE=1000. Τόσες προηγούμενες εντολές μπορεί να ανακαλέσει το πάνω βέλος. Και οι επιτιθέμενοι νοιάζονται για αυτή τη μεταβλητή — το πρώτο που κάνουν πολλοί μετά την προσγείωση σε ένα box είναι HISTSIZE=0 ή HISTFILE=/dev/null ώστε να μην καταγράφονται τα ίχνη τους.",
        },
        check: (t) => cmd(t, /^set\s*\|\s*grep\s+HISTSIZE/),
      },
      {
        id: "sr-env-backup",
        instruction: {
          en: "Before touching anything, save the default: echo $HISTSIZE > ~/valueofHISTSIZE.txt — then cat the file to confirm.",
          el: "Πριν πειράξεις οτιδήποτε, σώσε την προεπιλογή: echo $HISTSIZE > ~/valueofHISTSIZE.txt — και μετά κάνε cat το αρχείο για επιβεβαίωση.",
        },
        hint: { en: "echo $HISTSIZE > ~/valueofHISTSIZE.txt  then  cat ~/valueofHISTSIZE.txt", el: "echo $HISTSIZE > ~/valueofHISTSIZE.txt  και μετά  cat ~/valueofHISTSIZE.txt" },
        explain: {
          en: "The $ expanded to 1000 before echo ever ran, so the file now contains the number — your rollback point. This tiny habit (backup the default, then experiment) is configuration management in its purest form, and it is the difference between a lab mistake and an incident.",
          el: "Το $ επεκτάθηκε σε 1000 πριν καν τρέξει το echo, άρα το αρχείο τώρα περιέχει τον αριθμό — το σημείο επαναφοράς σου. Αυτή η μικρή συνήθεια (αντίγραφο της προεπιλογής, μετά πείραμα) είναι το configuration management στην καθαρότερή του μορφή, και είναι η διαφορά ανάμεσα σε εργαστηριακό λάθος και σε περιστατικό.",
        },
        check: (t) => (t.fileContent("/home/operator/valueofHISTSIZE.txt") || "").trim() === "1000",
      },
      {
        id: "sr-env-change",
        instruction: {
          en: "Change the value for this session: HISTSIZE=0",
          el: "Άλλαξε την τιμή για αυτό το session: HISTSIZE=0",
        },
        hint: { en: "HISTSIZE=0", el: "HISTSIZE=0" },
        explain: {
          en: "No spaces around the '=' — that matters: `HISTSIZE = 0` would be parsed as a command named HISTSIZE with two arguments and fail. From now on this shell keeps no history; open a new terminal and it is back to 1000, because the change never left this session.",
          el: "Χωρίς κενά γύρω από το '=' — αυτό μετράει: το `HISTSIZE = 0` θα διαβαζόταν ως εντολή με όνομα HISTSIZE και δύο ορίσματα και θα αποτύγχανε. Από εδώ και πέρα αυτό το shell δεν κρατά ιστορικό· άνοιξε νέο τερματικό και είναι πάλι 1000, γιατί η αλλαγή δεν βγήκε ποτέ από αυτό το session.",
        },
        check: (t) => t.getVar("HISTSIZE") === "0",
      },
      {
        id: "sr-env-export",
        instruction: {
          en: "Make the change part of the environment so child processes see it: export HISTSIZE",
          el: "Κάνε την αλλαγή μέρος του περιβάλλοντος ώστε να τη βλέπουν οι παιδί-διεργασίες: export HISTSIZE",
        },
        hint: { en: "export HISTSIZE", el: "export HISTSIZE" },
        explain: {
          en: "export does not print anything — silence means success, which is normal for Linux configuration commands. Verify with `set | grep HISTSIZE`. Remember the distinction: without export, a variable stays private to your shell and every tool you launch is blind to it.",
          el: "Το export δεν τυπώνει τίποτα — η σιωπή σημαίνει επιτυχία, που είναι φυσιολογικό για εντολές ρύθμισης στο Linux. Επαλήθευσε με `set | grep HISTSIZE`. Θυμήσου τη διάκριση: χωρίς export, μια μεταβλητή μένει ιδιωτική στο shell σου και κάθε εργαλείο που ξεκινάς είναι τυφλό σε αυτήν.",
        },
        check: (t) => t.exported.has("HISTSIZE"),
      },
      {
        id: "sr-env-custom",
        instruction: {
          en: "Invent your own variable: url_variable=\"hackforge.in/\"",
          el: "Επινόησε δική σου μεταβλητή: url_variable=\"hackforge.in/\"",
        },
        hint: { en: "url_variable=\"hackforge.in/\"", el: "url_variable=\"hackforge.in/\"" },
        explain: {
          en: "Any name you like, no declaration needed. Quotes around the value protect spaces and special characters from the shell — always quote values that might contain them, it costs nothing and saves hours.",
          el: "Όποιο όνομα θες, χωρίς δήλωση. Τα εισαγωγικά γύρω από την τιμή προστατεύουν κενά και ειδικούς χαρακτήρες από το shell — πάντα να βάζεις εισαγωγικά σε τιμές που μπορεί να τα περιέχουν, δεν κοστίζει τίποτα και γλιτώνει ώρες.",
        },
        check: (t) => t.getVar("url_variable") === "hackforge.in/",
      },
      {
        id: "sr-env-echo",
        instruction: {
          en: "Read your variable back: echo $url_variable",
          el: "Διάβασε τη μεταβλητή σου πίσω: echo $url_variable",
        },
        hint: { en: "echo $url_variable", el: "echo $url_variable" },
        explain: {
          en: "The $ is the dereference operator: without it, echo would print the literal text 'url_variable'. Scripts use this constantly — `nmap -sP $ip` inside the scanner module is exactly this mechanism at work.",
          el: "Το $ είναι ο τελεστής αποαναφοράς: χωρίς αυτό, το echo θα τύπωνε το κυριολεκτικό κείμενο 'url_variable'. Τα scripts το χρησιμοποιούν συνεχώς — το `nmap -sP $ip` μέσα στην ενότητα του scanner είναι ακριβώς αυτός ο μηχανισμός εν δράσει.",
        },
        check: (t) => cmd(t, /^echo\s+\$url_variable\b/),
      },
      {
        id: "sr-env-unset",
        instruction: {
          en: "Retire it: unset url_variable — then echo $url_variable again and enjoy the empty line.",
          el: "Αποσύρ' την: unset url_variable — και μετά κάνε πάλι echo $url_variable και απόλαυσε την κενή γραμμή.",
        },
        hint: { en: "unset url_variable  then  echo $url_variable", el: "unset url_variable  και μετά  echo $url_variable" },
        explain: {
          en: "An unset variable expands to nothing at all — not 'null', not zero, just absence. That silent emptiness is the source of a whole family of real-world bugs: a script that does `rm -rf $BACKUP_DIR/` with BACKUP_DIR unset deletes the wrong thing. Always check your variables before using them destructively.",
          el: "Μια unset μεταβλητή επεκτείνεται σε τίποτα απολύτως — όχι 'null', όχι μηδέν, απλά απουσία. Αυτή η σιωπηλή κενότητα είναι η πηγή ολόκληρης οικογένειας πραγματικών bugs: ένα script που κάνει `rm -rf $BACKUP_DIR/` με unset BACKUP_DIR διαγράφει λάθος πράγμα. Πάντα να ελέγχεις τις μεταβλητές σου πριν τις χρησιμοποιήσεις καταστροφικά.",
        },
        check: (t) => t.unsetVars.has("url_variable") && t.getVar("url_variable") === undefined,
      },
      {
        id: "sr-env-path",
        instruction: {
          en: "Inspect the most powerful variable of all: echo $PATH",
          el: "Επιθεώρησε την πιο δυνατή μεταβλητή από όλες: echo $PATH",
        },
        hint: { en: "echo $PATH", el: "echo $PATH" },
        explain: {
          en: "A colon-separated list of directories, searched left to right. This one variable decides which program runs when you type a bare name — and that makes it an attack surface: prepend a directory you control to PATH and your fake `ls` gets executed instead of the real one. That technique (PATH hijacking) appears in every privilege-escalation syllabus.",
          el: "Μια λίστα φακέλων χωρισμένη με άνω-κάτω τελεία, που ψάχνεται από αριστερά προς τα δεξιά. Αυτή η μία μεταβλητή αποφασίζει ποιο πρόγραμμα τρέχει όταν γράφεις σκέτο όνομα — και αυτό την κάνει επιφάνεια επίθεσης: βάλε μπροστά έναν φάκελο που ελέγχεις στο PATH και το ψεύτικο `ls` σου εκτελείται αντί για το πραγματικό. Αυτή η τεχνική (PATH hijacking) εμφανίζεται σε κάθε ύλη privilege-escalation.",
        },
        check: (t) => cmd(t, /^echo\s+\$PATH\b/),
      },
    ],
    challenges: [
      {
        title: { en: "Restore the Default", el: "Επανέφερε την Προεπιλογή" },
        brief: {
          en: "You zeroed the history earlier. Read your backup file, put HISTSIZE back to 1000 with the value you find in it, and export the repaired value.",
          el: "Μηδένισες το ιστορικό νωρίτερα. Διάβασε το αρχείο αντιγράφου, επανάφερε το HISTSIZE στο 1000 με την τιμή που θα βρεις μέσα του, και κάνε export την επισκευασμένη τιμή.",
        },
        success: { en: "Backup used, value restored, environment repaired. That is the whole discipline.", el: "Αντίγραφο χρησιμοποιήθηκε, τιμή αποκαταστάθηκε, περιβάλλον επισκευάστηκε. Αυτή είναι όλη η πειθαρχία." },
        check: (t) =>
          t.getVar("HISTSIZE") === "1000" &&
          t.exported.has("HISTSIZE") &&
          t.readFiles.has("/home/operator/valueofHISTSIZE.txt"),
      },
      {
        title: { en: "Portable Kit", el: "Φορητό Κιτ" },
        brief: {
          en: "Build a variable of your own for the rest of the campaign: OPSKIT holding /home/operator/Documents, exported to the environment, and proved with a filtered env dump.",
          el: "Φτιάξε δική σου μεταβλητή για την υπόλοιπη καμπάνια: OPSKIT με τιμή /home/operator/Documents, exported στο περιβάλλον, και αποδειγμένη με φιλτραρισμένο env dump.",
        },
        success: { en: "OPSKIT lives in the environment — child processes inherit it from now on.", el: "Το OPSKIT ζει στο περιβάλλον — οι παιδί-διεργασίες το κληρονομούν από τώρα." },
        check: (t) =>
          t.getVar("OPSKIT") === "/home/operator/Documents" &&
          t.exported.has("OPSKIT") &&
          cmd(t, /^(env|set)\s*\|\s*grep\s+OPSKIT/),
      },
    ],
  },
];
