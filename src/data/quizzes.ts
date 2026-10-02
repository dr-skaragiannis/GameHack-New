import type { Bi } from "./lessons";

// A short educational popup shown each time a task's command succeeds:
// an "output explained" note plus a 3-question quiz (distinct from challenges).

export type QuizQ = { q: Bi; options: Bi[]; answer: number };
export type QuizEntry = { info: Bi; questions: QuizQ[] };

const b = (en: string, el: string): Bi => ({ en, el });
const q = (en: string, el: string, opts: [string, string][], answer: number): QuizQ => ({
  q: b(en, el),
  options: opts.map(([e, l]) => b(e, l)),
  answer,
});

// Quizzes are keyed by command concept so several tasks can share one.
const CONCEPTS: Record<string, QuizEntry> = {
  help: {
    info: b(
      "'help' listed every command available in this lab, grouped by category. On a real Linux system you'd use 'man COMMAND' for a full manual.",
      "Το 'help' εμφάνισε κάθε διαθέσιμη εντολή του εργαστηρίου, ανά κατηγορία. Σε πραγματικό Linux θα χρησιμοποιούσες 'man ΕΝΤΟΛΗ' για πλήρες εγχειρίδιο."
    ),
    questions: [
      q("What does 'help' show you?", "Τι σου δείχνει το 'help';", [["A list of available commands", "Λίστα διαθέσιμων εντολών"], ["Your IP address", "Τη διεύθυνση IP σου"], ["The password file", "Το αρχείο κωδικών"]], 0),
      q("On real Linux, how do you read a command's manual?", "Σε πραγματικό Linux, πώς διαβάζεις το εγχειρίδιο μιας εντολής;", [["man COMMAND", "man ΕΝΤΟΛΗ"], ["help COMMAND", "help ΕΝΤΟΛΗ"], ["list COMMAND", "list ΕΝΤΟΛΗ"]], 0),
      q("Why check help first on an unfamiliar system?", "Γιατί να δεις πρώτα το help σε άγνωστο σύστημα;", [["To learn what actions are possible", "Για να μάθεις τι ενέργειες γίνονται"], ["To delete logs", "Για να σβήσεις logs"], ["To gain root", "Για να πάρεις root"]], 0),
    ],
  },
  whoami: {
    info: b(
      "'whoami' printed your current username. Your identity decides what you can read, write and execute on the system.",
      "Το 'whoami' τύπωσε το τρέχον όνομα χρήστη σου. Η ταυτότητά σου καθορίζει τι μπορείς να διαβάσεις, να γράψεις και να εκτελέσεις."
    ),
    questions: [
      q("What does whoami output?", "Τι εμφανίζει το whoami;", [["Your current username", "Το τρέχον όνομα χρήστη"], ["Your hostname", "Το hostname"], ["The time", "Την ώρα"]], 0),
      q("Why does your username matter in security?", "Γιατί μετράει το όνομα χρήστη στην ασφάλεια;", [["It determines your permissions", "Καθορίζει τα δικαιώματά σου"], ["It sets the screen color", "Ορίζει το χρώμα οθόνης"], ["It does nothing", "Δεν κάνει τίποτα"]], 0),
      q("Which prompt symbol means you are root?", "Ποιο σύμβολο prompt σημαίνει root;", [["#", "#"], ["$", "$"], ["~", "~"]], 0),
    ],
  },
  clear: {
    info: b(
      "'clear' wiped the screen but deleted nothing — your command history is intact (press ↑ to recall).",
      "Το 'clear' καθάρισε την οθόνη αλλά δεν διέγραψε τίποτα — το ιστορικό εντολών παραμένει (πάτα ↑)."
    ),
    questions: [
      q("Does 'clear' delete your files?", "Το 'clear' διαγράφει αρχεία;", [["No, it only clears the view", "Όχι, καθαρίζει μόνο την προβολή"], ["Yes, all files", "Ναι, όλα"], ["Only hidden files", "Μόνο τα κρυφά"]], 0),
      q("Keyboard shortcut for clear?", "Συντόμευση για clear;", [["Ctrl+L", "Ctrl+L"], ["Ctrl+C", "Ctrl+C"], ["Ctrl+Z", "Ctrl+Z"]], 0),
      q("How do you recall a previous command?", "Πώς ανακαλείς προηγούμενη εντολή;", [["Press ↑ (up arrow)", "Πάτα ↑ (πάνω βέλος)"], ["Retype everything", "Ξαναγράψε τα όλα"], ["It is gone forever", "Χάθηκε για πάντα"]], 0),
    ],
  },
  pwd: {
    info: b(
      "'pwd' printed your absolute path from the root '/'. Knowing where you are prevents mistakes with relative paths.",
      "Το 'pwd' τύπωσε την απόλυτη διαδρομή από τη ρίζα '/'. Το να ξέρεις πού είσαι αποτρέπει λάθη με σχετικές διαδρομές."
    ),
    questions: [
      q("What does pwd stand for?", "Τι σημαίνει pwd;", [["Print working directory", "Print working directory"], ["Password", "Κωδικός"], ["Print web domain", "Print web domain"]], 0),
      q("Every absolute path starts with?", "Κάθε απόλυτη διαδρομή ξεκινά με;", [["/ (root)", "/ (ρίζα)"], ["~", "~"], [".", "."]], 0),
      q("'~' is a shortcut for?", "Το '~' είναι συντόμευση για;", [["Your home directory", "Τον αρχικό σου φάκελο"], ["The root dir", "Τη ρίζα"], ["The current dir", "Τον τρέχοντα φάκελο"]], 0),
    ],
  },
  ls: {
    info: b(
      "'ls' listed the directory's contents. Flags expand it: -l for details, -a for hidden files.",
      "Το 'ls' εμφάνισε τα περιεχόμενα του φακέλου. Flags το επεκτείνουν: -l για λεπτομέρειες, -a για κρυφά."
    ),
    questions: [
      q("What does ls do?", "Τι κάνει το ls;", [["Lists directory contents", "Εμφανίζει περιεχόμενα φακέλου"], ["Logs you in", "Σε συνδέει"], ["Lists services", "Εμφανίζει υπηρεσίες"]], 0),
      q("Which flag gives a detailed listing?", "Ποιο flag δίνει αναλυτική λίστα;", [["-l", "-l"], ["-a", "-a"], ["-r", "-r"]], 0),
      q("ls with no argument lists?", "Το ls χωρίς όρισμα εμφανίζει;", [["The current directory", "Τον τρέχοντα φάκελο"], ["The root dir", "Τη ρίζα"], ["Your home only", "Μόνο το home"]], 0),
    ],
  },
  lsa: {
    info: b(
      "'ls -a' revealed hidden files whose names start with a dot — a favourite spot for secrets and configs.",
      "Το 'ls -a' αποκάλυψε κρυφά αρχεία που ξεκινούν με τελεία — αγαπημένο σημείο για μυστικά και ρυθμίσεις."
    ),
    questions: [
      q("Hidden file names begin with?", "Τα κρυφά αρχεία ξεκινούν με;", [["A dot (.)", "Τελεία (.)"], ["A dash (-)", "Παύλα (-)"], ["A slash (/)", "Κάθετο (/)"]], 0),
      q("Which flag reveals them?", "Ποιο flag τα αποκαλύπτει;", [["-a", "-a"], ["-l", "-l"], ["-h", "-h"]], 0),
      q("Why do attackers check hidden files?", "Γιατί οι επιτιθέμενοι ελέγχουν κρυφά αρχεία;", [["They often hide secrets/config", "Συχνά κρύβουν μυστικά/ρυθμίσεις"], ["They load faster", "Φορτώνουν πιο γρήγορα"], ["They are bigger", "Είναι μεγαλύτερα"]], 0),
    ],
  },
  cat: {
    info: b(
      "'cat' printed the file's contents to the screen. For long files, 'less' lets you scroll.",
      "Το 'cat' τύπωσε το περιεχόμενο του αρχείου. Για μεγάλα αρχεία, το 'less' επιτρέπει κύλιση."
    ),
    questions: [
      q("What does cat do?", "Τι κάνει το cat;", [["Prints file contents", "Τυπώνει περιεχόμενο αρχείου"], ["Deletes a file", "Διαγράφει αρχείο"], ["Creates a folder", "Φτιάχνει φάκελο"]], 0),
      q("Best tool for a very long file?", "Καλύτερο εργαλείο για μεγάλο αρχείο;", [["less", "less"], ["cat", "cat"], ["touch", "touch"]], 0),
      q("Can cat show several files at once?", "Μπορεί το cat να δείξει πολλά αρχεία μαζί;", [["Yes: cat a b", "Ναι: cat a b"], ["No", "Όχι"], ["Only with sudo", "Μόνο με sudo"]], 0),
    ],
  },
  cd: {
    info: b(
      "'cd' moved you into a directory. 'cd ..' goes up, 'cd ~' returns home, 'cd /' goes to root.",
      "Το 'cd' σε μετακίνησε σε φάκελο. 'cd ..' ανεβαίνει, 'cd ~' επιστρέφει στο home, 'cd /' στη ρίζα."
    ),
    questions: [
      q("'cd ..' does what?", "Τι κάνει το 'cd ..';", [["Moves up one level", "Ανεβαίνει ένα επίπεδο"], ["Deletes the dir", "Διαγράφει τον φάκελο"], ["Clears the screen", "Καθαρίζει την οθόνη"]], 0),
      q("'cd ~' takes you to?", "Το 'cd ~' σε πάει;", [["Your home directory", "Στον αρχικό σου φάκελο"], ["The root", "Στη ρίζα"], ["The previous dir", "Στον προηγούμενο"]], 0),
      q("After cd, which command shows contents?", "Μετά το cd, ποια εντολή δείχνει τα περιεχόμενα;", [["ls", "ls"], ["pwd", "pwd"], ["id", "id"]], 0),
    ],
  },
  mkdir: {
    info: b(
      "'mkdir' created a new directory. 'mkdir -p a/b/c' builds nested folders in one go.",
      "Το 'mkdir' δημιούργησε νέο φάκελο. Το 'mkdir -p a/b/c' φτιάχνει εμφωλευμένους φακέλους μαζί."
    ),
    questions: [
      q("mkdir does?", "Τι κάνει το mkdir;", [["Creates a directory", "Δημιουργεί φάκελο"], ["Removes a directory", "Διαγράφει φάκελο"], ["Moves files", "Μετακινεί αρχεία"]], 0),
      q("Flag to create nested paths?", "Flag για εμφωλευμένες διαδρομές;", [["-p", "-p"], ["-r", "-r"], ["-a", "-a"]], 0),
      q("Why organise a pentest in folders?", "Γιατί να οργανώσεις ένα pentest σε φακέλους;", [["Keep scans/loot/notes separate", "Ξεχωριστά scans/ευρήματα/σημειώσεις"], ["To slow down", "Για καθυστέρηση"], ["No reason", "Χωρίς λόγο"]], 0),
    ],
  },
  touch: {
    info: b(
      "'touch' created an empty file (or updated its timestamp). Handy for notes, placeholders and wordlists.",
      "Το 'touch' δημιούργησε κενό αρχείο (ή ενημέρωσε την ημερομηνία). Χρήσιμο για σημειώσεις, placeholders, wordlists."
    ),
    questions: [
      q("touch on a new name does?", "Το touch σε νέο όνομα κάνει;", [["Creates an empty file", "Δημιουργεί κενό αρχείο"], ["Deletes it", "Το διαγράφει"], ["Runs it", "Το εκτελεί"]], 0),
      q("touch on an existing file?", "Το touch σε υπάρχον αρχείο;", [["Updates its timestamp", "Ενημερώνει την ημερομηνία"], ["Erases contents", "Σβήνει το περιεχόμενο"], ["Nothing at all", "Τίποτα"]], 0),
      q("An empty file is useful to?", "Ένα κενό αρχείο χρησιμεύει για;", [["Store findings later", "Αποθήκευση ευρημάτων αργότερα"], ["Crash the shell", "Κρασάρισμα shell"], ["Gain root", "Απόκτηση root"]], 0),
    ],
  },
  find: {
    info: b(
      "'find' searched the directory tree for files matching your pattern — far faster than browsing manually.",
      "Το 'find' έψαξε το δέντρο φακέλων για αρχεία που ταιριάζουν στο μοτίβο — πολύ πιο γρήγορα από χειροκίνητη περιήγηση."
    ),
    questions: [
      q("find is used to?", "Το find χρησιμοποιείται για;", [["Search for files by criteria", "Αναζήτηση αρχείων με κριτήρια"], ["Edit files", "Επεξεργασία αρχείων"], ["Log in", "Σύνδεση"]], 0),
      q("Which option matches by name?", "Ποια επιλογή ταιριάζει με όνομα;", [["-name", "-name"], ["-grep", "-grep"], ["-f", "-f"]], 0),
      q("'*' in a pattern means?", "Το '*' σε μοτίβο σημαίνει;", [["Any characters (wildcard)", "Οποιοιδήποτε χαρακτήρες (μπαλαντέρ)"], ["Exactly one char", "Ακριβώς ένας χαρακτήρας"], ["Root", "Ρίζα"]], 0),
    ],
  },
  grep: {
    info: b(
      "'grep' searched inside files for text — the fast way to spot passwords, IPs or keywords in logs and configs.",
      "Το 'grep' έψαξε κείμενο μέσα σε αρχεία — ο γρήγορος τρόπος να εντοπίσεις κωδικούς, IP ή λέξεις-κλειδιά σε logs και ρυθμίσεις."
    ),
    questions: [
      q("grep searches for?", "Το grep ψάχνει;", [["Text inside files", "Κείμενο μέσα σε αρχεία"], ["Open ports", "Ανοιχτές θύρες"], ["Users", "Χρήστες"]], 0),
      q("Flag to ignore case?", "Flag για αγνόηση πεζών/κεφαλαίων;", [["-i", "-i"], ["-r", "-r"], ["-v", "-v"]], 0),
      q("Flag to search a whole folder?", "Flag για αναζήτηση σε όλο τον φάκελο;", [["-r (recursive)", "-r (αναδρομικά)"], ["-i", "-i"], ["-l", "-l"]], 0),
    ],
  },
  lsl: {
    info: b(
      "'ls -l' showed permissions like -rwxr-xr-x: the type, then rights for owner / group / others, plus the owner name.",
      "Το 'ls -l' έδειξε δικαιώματα όπως -rwxr-xr-x: τύπος, μετά δικαιώματα για ιδιοκτήτη / ομάδα / άλλους, και το όνομα ιδιοκτήτη."
    ),
    questions: [
      q("In -rwxr-xr-x the three groups are?", "Στο -rwxr-xr-x οι τρεις ομάδες είναι;", [["owner, group, others", "ιδιοκτήτης, ομάδα, άλλοι"], ["read, write, run", "ανάγνωση, εγγραφή, εκτέλεση"], ["past, present, future", "παρελθόν, παρόν, μέλλον"]], 0),
      q("'r' means?", "Το 'r' σημαίνει;", [["read", "ανάγνωση"], ["run", "εκτέλεση"], ["root", "root"]], 0),
      q("Reading permissions helps with?", "Η ανάγνωση δικαιωμάτων βοηθά σε;", [["Defense and privilege escalation", "Άμυνα και ανύψωση προνομίων"], ["Only speed", "Μόνο ταχύτητα"], ["Nothing", "Τίποτα"]], 0),
    ],
  },
  id: {
    info: b(
      "'id' showed your uid, gid and group memberships. Being in a group like 'sudo' can grant powerful rights.",
      "Το 'id' έδειξε uid, gid και ομάδες. Η συμμετοχή σε ομάδα όπως 'sudo' μπορεί να δίνει ισχυρά δικαιώματα."
    ),
    questions: [
      q("id shows?", "Το id δείχνει;", [["uid, gid and groups", "uid, gid και ομάδες"], ["Only the username", "Μόνο το όνομα χρήστη"], ["Your IP", "Την IP σου"]], 0),
      q("Being in the 'sudo' group lets you?", "Η ομάδα 'sudo' σου επιτρέπει;", [["Run commands as root", "Εκτέλεση εντολών ως root"], ["Change colors", "Αλλαγή χρωμάτων"], ["Nothing", "Τίποτα"]], 0),
      q("uid 0 belongs to?", "Το uid 0 ανήκει στον;", [["root", "root"], ["the first user", "πρώτο χρήστη"], ["nobody", "nobody"]], 0),
    ],
  },
  chmodx: {
    info: b(
      "'chmod +x' added the execute bit so the script can be run. That is how you make a downloaded tool runnable.",
      "Το 'chmod +x' πρόσθεσε το bit εκτέλεσης ώστε το script να τρέχει. Έτσι κάνεις ένα κατεβασμένο εργαλείο εκτελέσιμο."
    ),
    questions: [
      q("The 'x' permission allows?", "Το δικαίωμα 'x' επιτρέπει;", [["Executing the file", "Εκτέλεση του αρχείου"], ["Reading only", "Μόνο ανάγνωση"], ["Writing only", "Μόνο εγγραφή"]], 0),
      q("'chmod +x script.sh' makes it?", "Το 'chmod +x script.sh' το κάνει;", [["Runnable", "Εκτελέσιμο"], ["Hidden", "Κρυφό"], ["Read-only", "Μόνο ανάγνωση"]], 0),
      q("'chmod u+x' affects?", "Το 'chmod u+x' επηρεάζει;", [["Only the owner", "Μόνο τον ιδιοκτήτη"], ["Everyone", "Όλους"], ["The group only", "Μόνο την ομάδα"]], 0),
    ],
  },
  chmodnum: {
    info: b(
      "Octal chmod uses r=4, w=2, x=1. '600' = owner read+write, group/others nothing — perfect for secrets.",
      "Το οκταδικό chmod: r=4, w=2, x=1. Το '600' = ιδιοκτήτης ανάγνωση+εγγραφή, ομάδα/άλλοι τίποτα — ιδανικό για μυστικά."
    ),
    questions: [
      q("In octal, r + w =", "Στο οκταδικό, r + w =", [["6", "6"], ["5", "5"], ["7", "7"]], 0),
      q("'600' gives others?", "Το '600' δίνει στους άλλους;", [["No access", "Καμία πρόσβαση"], ["Read", "Ανάγνωση"], ["Full access", "Πλήρη"]], 0),
      q("'755' gives the owner?", "Το '755' δίνει στον ιδιοκτήτη;", [["rwx", "rwx"], ["r--", "r--"], ["r-x", "r-x"]], 0),
    ],
  },
  sudo: {
    info: b(
      "'sudo' ran one command as root. Misconfigured sudo rules are the #1 privilege-escalation path.",
      "Το 'sudo' εκτέλεσε μία εντολή ως root. Λανθασμένοι κανόνες sudo είναι ο #1 δρόμος ανύψωσης προνομίων."
    ),
    questions: [
      q("sudo lets you?", "Το sudo σου επιτρέπει;", [["Run a command as root", "Εκτέλεση εντολής ως root"], ["Clear the screen", "Καθαρισμό οθόνης"], ["List files", "Λίστα αρχείων"]], 0),
      q("Why are sudo rules a risk?", "Γιατί οι κανόνες sudo είναι κίνδυνος;", [["Misconfig can grant root", "Λάθος ρύθμιση δίνει root"], ["They slow boot", "Καθυστερούν την εκκίνηση"], ["No risk", "Κανένας κίνδυνος"]], 0),
      q("'sudo -l' shows?", "Το 'sudo -l' δείχνει;", [["What you may run as root", "Τι μπορείς να τρέξεις ως root"], ["Your files", "Τα αρχεία σου"], ["Logins", "Συνδέσεις"]], 0),
    ],
  },
  ipaddr: {
    info: b(
      "'ip a' showed your interfaces and IP (e.g. 10.x/24). You must know your network to know what you can reach.",
      "Το 'ip a' έδειξε τις διεπαφές και την IP σου (π.χ. 10.x/24). Πρέπει να ξέρεις το δίκτυό σου για να ξέρεις τι φτάνεις."
    ),
    questions: [
      q("'ip a' shows?", "Το 'ip a' δείχνει;", [["Your IP addresses/interfaces", "Διευθύνσεις IP/διεπαφές"], ["Open ports", "Ανοιχτές θύρες"], ["Users", "Χρήστες"]], 0),
      q("'/24' describes the?", "Το '/24' περιγράφει;", [["Subnet size", "Μέγεθος subnet"], ["Port", "Θύρα"], ["Protocol", "Πρωτόκολλο"]], 0),
      q("Typical wired interface name?", "Τυπικό όνομα ενσύρματης διεπαφής;", [["eth0", "eth0"], ["lo", "lo"], ["wan", "wan"]], 0),
    ],
  },
  iproute: {
    info: b(
      "'ip route' revealed the default gateway — the router linking your subnet to everything else, and a key pivot point.",
      "Το 'ip route' αποκάλυψε το προεπιλεγμένο gateway — τον router που συνδέει το subnet σου με τα υπόλοιπα, σημαντικό σημείο pivot."
    ),
    questions: [
      q("The default gateway is?", "Το προεπιλεγμένο gateway είναι;", [["The router to other networks", "Ο router προς άλλα δίκτυα"], ["Your own PC", "Ο υπολογιστής σου"], ["A website", "Μια ιστοσελίδα"]], 0),
      q("Which line names it?", "Ποια γραμμή το ονομάζει;", [["default via X", "default via X"], ["inet X", "inet X"], ["link/ether", "link/ether"]], 0),
      q("Gateways matter because they are?", "Τα gateways μετράνε γιατί είναι;", [["Pivot points", "Σημεία pivot"], ["Pretty", "Όμορφα"], ["Random", "Τυχαία"]], 0),
    ],
  },
  ping: {
    info: b(
      "'ping' sent ICMP echo packets; the replies prove the host is up and show the round-trip latency.",
      "Το 'ping' έστειλε πακέτα ICMP echo· οι απαντήσεις αποδεικνύουν ότι ο host είναι ζωντανός και δείχνουν την καθυστέρηση."
    ),
    questions: [
      q("ping tests?", "Το ping ελέγχει;", [["Reachability of a host", "Προσβασιμότητα ενός host"], ["Open ports", "Ανοιχτές θύρες"], ["Passwords", "Κωδικούς"]], 0),
      q("Replies mean the host is?", "Οι απαντήσεις σημαίνουν ότι ο host είναι;", [["Up", "Ζωντανός"], ["Down", "Εκτός"], ["Encrypted", "Κρυπτογραφημένος"]], 0),
      q("Flag to send a fixed count?", "Flag για συγκεκριμένο αριθμό πακέτων;", [["-c", "-c"], ["-p", "-p"], ["-n", "-n"]], 0),
    ],
  },
  netstat: {
    info: b(
      "'netstat' / 'ss' listed listening ports — open doors into the machine and the software waiting behind them.",
      "Το 'netstat' / 'ss' εμφάνισαν θύρες που ακούν — ανοιχτές πόρτες στο μηχάνημα και το λογισμικό πίσω τους."
    ),
    questions: [
      q("A listening port is?", "Μια θύρα που ακούει είναι;", [["A service accepting connections", "Υπηρεσία που δέχεται συνδέσεις"], ["A closed door", "Κλειστή πόρτα"], ["A file", "Αρχείο"]], 0),
      q("Modern replacement for netstat?", "Σύγχρονη αντικατάσταση του netstat;", [["ss", "ss"], ["nc", "nc"], ["nmap", "nmap"]], 0),
      q("Why enumerate local ports?", "Γιατί να απαριθμήσεις τοπικές θύρες;", [["Reveal attack surface", "Αποκάλυψη επιφάνειας επίθεσης"], ["Speed up disk", "Επιτάχυνση δίσκου"], ["Nothing", "Τίποτα"]], 0),
    ],
  },
  dns: {
    info: b(
      "DNS tools (nslookup / dig / host) turned a hostname into an IP address — you attack IPs, not names.",
      "Τα εργαλεία DNS (nslookup / dig / host) μετέτρεψαν ένα hostname σε IP — επιτίθεσαι σε IP, όχι σε ονόματα."
    ),
    questions: [
      q("DNS maps?", "Το DNS αντιστοιχίζει;", [["Names to IP addresses", "Ονόματα σε διευθύνσεις IP"], ["Ports to services", "Θύρες σε υπηρεσίες"], ["Users to groups", "Χρήστες σε ομάδες"]], 0),
      q("Which tool is the pro's choice?", "Ποιο εργαλείο προτιμούν οι επαγγελματίες;", [["dig", "dig"], ["ping", "ping"], ["echo", "echo"]], 0),
      q("Resolving a name gives you?", "Η ανάλυση ονόματος σου δίνει;", [["The target IP", "Την IP στόχου"], ["The password", "Τον κωδικό"], ["The OS", "Το λειτουργικό"]], 0),
    ],
  },
  whois: {
    info: b(
      "'whois' returned registration data (registrar, dates, name servers) without touching the target — passive, stealthy recon.",
      "Το 'whois' επέστρεψε στοιχεία καταχώρησης (registrar, ημερομηνίες, name servers) χωρίς επαφή με τον στόχο — παθητική, διακριτική αναγνώριση."
    ),
    questions: [
      q("whois returns?", "Το whois επιστρέφει;", [["Domain registration info", "Στοιχεία καταχώρησης domain"], ["Open ports", "Ανοιχτές θύρες"], ["File contents", "Περιεχόμενα αρχείων"]], 0),
      q("whois is which kind of recon?", "Το whois είναι τι είδους αναγνώριση;", [["Passive", "Παθητική"], ["Active", "Ενεργητική"], ["Destructive", "Καταστροφική"]], 0),
      q("It can reveal?", "Μπορεί να αποκαλύψει;", [["Registrar / name servers", "Registrar / name servers"], ["The root password", "Τον κωδικό root"], ["The flags", "Τα flags"]], 0),
    ],
  },
  nmapsubnet: {
    info: b(
      "A subnet scan (e.g. 10.10.10.0/24) swept every address to list the live hosts — this is host discovery.",
      "Μια σάρωση subnet (π.χ. 10.10.10.0/24) σάρωσε κάθε διεύθυνση για να βρει τους ζωντανούς hosts — αυτό είναι host discovery."
    ),
    questions: [
      q("'/24' scans how many addresses?", "Το '/24' σαρώνει πόσες διευθύνσεις;", [["256", "256"], ["24", "24"], ["1", "1"]], 0),
      q("Subnet scanning is for?", "Η σάρωση subnet είναι για;", [["Finding live hosts", "Εύρεση ζωντανών hosts"], ["Cracking passwords", "Σπάσιμο κωδικών"], ["Reading files", "Ανάγνωση αρχείων"]], 0),
      q("After discovery you then?", "Μετά την ανακάλυψη, τι κάνεις;", [["Scan a host's ports", "Σαρώνεις τις θύρες ενός host"], ["Reboot", "Επανεκκίνηση"], ["Stop", "Σταματάς"]], 0),
    ],
  },
  nmap: {
    info: b(
      "'nmap' listed the open ports and services on the host. Each open port is a potential way in.",
      "Το 'nmap' εμφάνισε τις ανοιχτές θύρες και υπηρεσίες του host. Κάθε ανοιχτή θύρα είναι πιθανή είσοδος."
    ),
    questions: [
      q("nmap maps?", "Το nmap χαρτογραφεί;", [["Open ports and services", "Ανοιχτές θύρες και υπηρεσίες"], ["Users", "Χρήστες"], ["Files", "Αρχεία"]], 0),
      q("Port 22 usually runs?", "Η θύρα 22 συνήθως τρέχει;", [["SSH", "SSH"], ["HTTP", "HTTP"], ["MySQL", "MySQL"]], 0),
      q("Port 80 usually runs?", "Η θύρα 80 συνήθως τρέχει;", [["HTTP", "HTTP"], ["SSH", "SSH"], ["DNS", "DNS"]], 0),
    ],
  },
  nmapver: {
    info: b(
      "'nmap -sV' detected service versions. An exact version (e.g. Apache 2.4.52) points you to known exploits.",
      "Το 'nmap -sV' ανίχνευσε εκδόσεις υπηρεσιών. Μια ακριβής έκδοση (π.χ. Apache 2.4.52) σε οδηγεί σε γνωστά exploits."
    ),
    questions: [
      q("'-sV' adds?", "Το '-sV' προσθέτει;", [["Version detection", "Ανίχνευση έκδοσης"], ["A faster scan", "Ταχύτερη σάρωση"], ["Stealth", "Αθόρυβη λειτουργία"]], 0),
      q("Why do versions matter?", "Γιατί μετράνε οι εκδόσεις;", [["They map to known vulns", "Αντιστοιχούν σε γνωστά ευπάθειες"], ["They look nice", "Φαίνονται ωραία"], ["They don't", "Δεν μετράνε"]], 0),
      q("'-A' is?", "Το '-A' είναι;", [["Aggressive scan incl. versions", "Επιθετική σάρωση με εκδόσεις"], ["A port range", "Εύρος θυρών"], ["A ping", "Ένα ping"]], 0),
    ],
  },
  nmapports: {
    info: b(
      "'-p' scanned only the ports you chose — faster and quieter than a full sweep.",
      "Το '-p' σάρωσε μόνο τις θύρες που επέλεξες — πιο γρήγορα και αθόρυβα από πλήρη σάρωση."
    ),
    questions: [
      q("'-p 22,80' scans?", "Το '-p 22,80' σαρώνει;", [["Only ports 22 and 80", "Μόνο τις θύρες 22 και 80"], ["All ports", "Όλες τις θύρες"], ["Random ports", "Τυχαίες θύρες"]], 0),
      q("'-p-' scans?", "Το '-p-' σαρώνει;", [["All 65535 ports", "Και τις 65535 θύρες"], ["Just port 1", "Μόνο τη θύρα 1"], ["Nothing", "Τίποτα"]], 0),
      q("Narrow scans are?", "Οι στενές σαρώσεις είναι;", [["Faster and stealthier", "Ταχύτερες και πιο αθόρυβες"], ["Slower", "Πιο αργές"], ["Louder", "Πιο θορυβώδεις"]], 0),
    ],
  },
  hydra: {
    info: b(
      "'hydra' brute-forced the login against a wordlist. With no account lockout, you get unlimited guesses.",
      "Το 'hydra' έκανε brute-force στο login με μια wordlist. Χωρίς κλείδωμα λογαριασμού, έχεις απεριόριστες δοκιμές."
    ),
    questions: [
      q("hydra performs?", "Το hydra κάνει;", [["Password brute-forcing", "Brute-force κωδικών"], ["Port scanning", "Σάρωση θυρών"], ["DNS lookup", "Αναζήτηση DNS"]], 0),
      q("'-P' specifies?", "Το '-P' ορίζει;", [["A password list", "Μια λίστα κωδικών"], ["One password", "Έναν κωδικό"], ["A port", "Μια θύρα"]], 0),
      q("What makes brute force easy here?", "Τι κάνει εύκολο το brute force εδώ;", [["No account lockout", "Χωρίς κλείδωμα λογαριασμού"], ["Strong passwords", "Ισχυροί κωδικοί"], ["MFA", "MFA"]], 0),
    ],
  },
  ssh: {
    info: b(
      "'ssh' opened an interactive shell on the remote machine using the cracked credentials — your foothold.",
      "Το 'ssh' άνοιξε διαδραστικό shell στο απομακρυσμένο μηχάνημα με τα σπασμένα διαπιστευτήρια — το πάτημά σου."
    ),
    questions: [
      q("ssh gives you?", "Το ssh σου δίνει;", [["A remote shell", "Απομακρυσμένο shell"], ["A web page", "Μια ιστοσελίδα"], ["A file", "Ένα αρχείο"]], 0),
      q("Correct syntax to connect?", "Σωστή σύνταξη για σύνδεση;", [["ssh user@host", "ssh user@host"], ["ssh host:user", "ssh host:user"], ["ssh -host", "ssh -host"]], 0),
      q("The credentials came from?", "Τα διαπιστευτήρια ήρθαν από;", [["The brute-force result", "Το αποτέλεσμα του brute-force"], ["Guessing blindly", "Τυφλή μαντεψιά"], ["The browser", "Τον browser"]], 0),
    ],
  },
  curl: {
    info: b(
      "'curl' fetched the web page and headers from the command line — the starting point of any web attack.",
      "Το 'curl' κατέβασε τη σελίδα και τα headers από τη γραμμή εντολών — το σημείο εκκίνησης κάθε web επίθεσης."
    ),
    questions: [
      q("curl is used to?", "Το curl χρησιμοποιείται για;", [["Fetch web content from CLI", "Λήψη web περιεχομένου από CLI"], ["Scan ports", "Σάρωση θυρών"], ["Crack hashes", "Σπάσιμο hashes"]], 0),
      q("Flag to show response headers?", "Flag για εμφάνιση headers;", [["-i", "-i"], ["-x", "-x"], ["-p", "-p"]], 0),
      q("curl is useful to?", "Το curl είναι χρήσιμο για;", [["Inspect HTML/APIs quickly", "Γρήγορη εξέταση HTML/APIs"], ["Replace a browser fully", "Πλήρη αντικατάσταση browser"], ["Crack SSH", "Σπάσιμο SSH"]], 0),
    ],
  },
  "sqli-bypass": {
    info: b(
      "The payload ' OR '1'='1 made the login's WHERE clause always true, logging you in with no valid password — authentication bypass.",
      "Το payload ' OR '1'='1 έκανε τη συνθήκη WHERE του login πάντα αληθή, συνδέοντάς σε χωρίς έγκυρο κωδικό — παράκαμψη ταυτοποίησης."
    ),
    questions: [
      q("' OR '1'='1 works because?", "Το ' OR '1'='1 δουλεύει γιατί;", [["The condition is always true", "Η συνθήκη είναι πάντα αληθής"], ["It guesses the password", "Μαντεύει τον κωδικό"], ["It deletes users", "Διαγράφει χρήστες"]], 0),
      q("Root cause of SQL injection?", "Βασική αιτία του SQL injection;", [["Unsanitised input in queries", "Μη καθαρισμένη είσοδος σε queries"], ["Weak passwords", "Αδύναμοι κωδικοί"], ["Open ports", "Ανοιχτές θύρες"]], 0),
      q("The main defence is?", "Η κύρια άμυνα είναι;", [["Parameterised queries", "Parameterised queries"], ["Longer passwords", "Μεγαλύτεροι κωδικοί"], ["Hiding the form", "Απόκρυψη της φόρμας"]], 0),
    ],
  },
  idpriv: {
    info: b(
      "Checking 'id' began privilege escalation: you confirm exactly what you can do now before finding a path upward.",
      "Ο έλεγχος με 'id' ξεκίνησε την ανύψωση προνομίων: επιβεβαιώνεις τι μπορείς να κάνεις τώρα πριν βρεις δρόμο προς τα πάνω."
    ),
    questions: [
      q("Privilege escalation starts with?", "Η ανύψωση προνομίων ξεκινά με;", [["Enumeration (id, sudo -l)", "Απαρίθμηση (id, sudo -l)"], ["Rebooting", "Επανεκκίνηση"], ["Logging out", "Αποσύνδεση"]], 0),
      q("'id' helps because it shows?", "Το 'id' βοηθά γιατί δείχνει;", [["Your groups and uid", "Τις ομάδες και το uid σου"], ["The root password", "Τον κωδικό root"], ["Open ports", "Ανοιχτές θύρες"]], 0),
      q("A good next check is?", "Μια καλή επόμενη ενέργεια;", [["sudo -l", "sudo -l"], ["clear", "clear"], ["ping", "ping"]], 0),
    ],
  },
  privesc: {
    info: b(
      "You escalated to root and read the protected flag. As root (uid 0) you control the whole machine.",
      "Ανέβηκες σε root και διάβασες το προστατευμένο flag. Ως root (uid 0) ελέγχεις όλο το μηχάνημα."
    ),
    questions: [
      q("Root (uid 0) can?", "Ο root (uid 0) μπορεί;", [["Read/modify anything", "Να διαβάσει/αλλάξει τα πάντα"], ["Only its own files", "Μόνο τα δικά του αρχεία"], ["Nothing", "Τίποτα"]], 0),
      q("A common escalation is?", "Μια κοινή ανύψωση είναι;", [["Abusing sudo rights", "Εκμετάλλευση δικαιωμάτων sudo"], ["Pinging the gateway", "Ping στο gateway"], ["Viewing source", "Προβολή πηγαίου"]], 0),
      q("After rooting, you document findings for?", "Μετά το root, τεκμηριώνεις ευρήματα για;", [["The client report", "Την αναφορά πελάτη"], ["Nobody", "Κανέναν"], ["Bragging only", "Μόνο για καύχημα"]], 0),
    ],
  },
  netdiscover: {
    info: b(
      "'netdiscover' used ARP to list live hosts on the LAN — the fastest way to find an unknown target's IP.",
      "Το 'netdiscover' χρησιμοποίησε ARP για να βρει ζωντανούς hosts στο LAN — ο ταχύτερος τρόπος να βρεις την IP ενός άγνωστου στόχου."
    ),
    questions: [
      q("netdiscover finds?", "Το netdiscover βρίσκει;", [["Live hosts on the network", "Ζωντανούς hosts στο δίκτυο"], ["Open ports", "Ανοιχτές θύρες"], ["Passwords", "Κωδικούς"]], 0),
      q("Which protocol does it use?", "Ποιο πρωτόκολλο χρησιμοποιεί;", [["ARP", "ARP"], ["HTTP", "HTTP"], ["DNS", "DNS"]], 0),
      q("Which address do you ignore?", "Ποια διεύθυνση αγνοείς;", [["The gateway", "Το gateway"], ["The target", "Τον στόχο"], ["All of them", "Όλες"]], 0),
    ],
  },
  browse: {
    info: b(
      "Browsing the site like a visitor shows its structure and content. The web server (port 80) is one of two ways into Raven.",
      "Η περιήγηση στο site σαν επισκέπτης δείχνει δομή και περιεχόμενο. Ο web server (θύρα 80) είναι ένας από τους δύο δρόμους στο Raven."
    ),
    questions: [
      q("Why click through every page?", "Γιατί να δεις κάθε σελίδα;", [["To find the one that's different", "Για να βρεις αυτή που ξεχωρίζει"], ["To buy something", "Για να αγοράσεις κάτι"], ["To waste time", "Για να χάσεις χρόνο"]], 0),
      q("The web server runs on which port?", "Σε ποια θύρα τρέχει ο web server;", [["80", "80"], ["22", "22"], ["3306", "3306"]], 0),
      q("Web + SSH open means?", "Ανοιχτά Web + SSH σημαίνει;", [["Two attack paths", "Δύο μονοπάτια επίθεσης"], ["One path", "Ένα μονοπάτι"], ["No path", "Κανένα μονοπάτι"]], 0),
    ],
  },
  viewsource: {
    info: b(
      "Viewing the page source revealed a flag hidden in an HTML comment — invisible on the rendered page itself.",
      "Η προβολή του πηγαίου αποκάλυψε ένα flag κρυμμένο σε σχόλιο HTML — αόρατο στην ίδια τη σελίδα."
    ),
    questions: [
      q("HTML comments look like?", "Τα σχόλια HTML μοιάζουν με;", [["<!-- ... -->", "<!-- ... -->"], ["// ...", "// ..."], ["/* ... */", "/* ... */"]], 0),
      q("Why view page source?", "Γιατί να δεις τον πηγαίο;", [["Secrets hide in comments/fields", "Μυστικά κρύβονται σε σχόλια/πεδία"], ["It loads faster", "Φορτώνει ταχύτερα"], ["It is required to load", "Απαιτείται για φόρτωση"]], 0),
      q("The flag was visible?", "Το flag ήταν ορατό;", [["Only in the source", "Μόνο στον πηγαίο"], ["On the page", "Στη σελίδα"], ["In the URL", "Στο URL"]], 0),
    ],
  },
  dirb: {
    info: b(
      "'dirb' brute-forced directory names and uncovered hidden paths like /wordpress that aren't shown in the menus.",
      "Το 'dirb' έκανε brute-force σε ονόματα φακέλων και αποκάλυψε κρυφές διαδρομές όπως /wordpress που δεν φαίνονται στα μενού."
    ),
    questions: [
      q("dirb discovers?", "Το dirb ανακαλύπτει;", [["Hidden web directories", "Κρυφούς web φακέλους"], ["Open ports", "Ανοιχτές θύρες"], ["Users", "Χρήστες"]], 0),
      q("Which key path did it find?", "Ποια σημαντική διαδρομή βρήκε;", [["/wordpress", "/wordpress"], ["/root", "/root"], ["/etc", "/etc"]], 0),
      q("Website menus show?", "Τα μενού ιστοσελίδας δείχνουν;", [["Only what the owner wants", "Μόνο ό,τι θέλει ο ιδιοκτήτης"], ["Everything", "Τα πάντα"], ["Nothing", "Τίποτα"]], 0),
    ],
  },
  wpscan: {
    info: b(
      "'wpscan' fingerprinted WordPress and enumerated usernames (michael, steven) — each is half of a login.",
      "Το 'wpscan' ταυτοποίησε το WordPress και απαρίθμησε ονόματα χρηστών (michael, steven) — καθένα είναι το μισό login."
    ),
    questions: [
      q("wpscan targets?", "Το wpscan στοχεύει;", [["WordPress sites", "Sites WordPress"], ["SSH", "SSH"], ["Databases", "Βάσεις δεδομένων"]], 0),
      q("'--enumerate u' lists?", "Το '--enumerate u' εμφανίζει;", [["Usernames", "Ονόματα χρηστών"], ["Plugins only", "Μόνο plugins"], ["Posts", "Posts"]], 0),
      q("Usernames + no lockout equals?", "Ονόματα χρηστών + χωρίς κλείδωμα ίσον;", [["A brute-force target", "Στόχος brute-force"], ["A dead end", "Αδιέξοδο"], ["Encryption", "Κρυπτογράφηση"]], 0),
    ],
  },
  loot: {
    info: b(
      "After getting a foothold you enumerated the filesystem and found a planted flag in the web root. This is post-exploitation.",
      "Αφού απέκτησες πάτημα, απαρίθμησες το σύστημα αρχείων και βρήκες ένα flag στο web root. Αυτό είναι post-exploitation."
    ),
    questions: [
      q("A classic place for planted files?", "Κλασικό σημείο για αρχεία-στόχους;", [["/var/www (web root)", "/var/www (web root)"], ["/tmp only", "Μόνο /tmp"], ["Nowhere", "Πουθενά"]], 0),
      q("Command to hunt flags anywhere?", "Εντολή για αναζήτηση flags παντού;", [["find / -name 'flag*'", "find / -name 'flag*'"], ["ls", "ls"], ["pwd", "pwd"]], 0),
      q("Post-exploitation means?", "Το post-exploitation σημαίνει;", [["Exploring after you have access", "Εξερεύνηση αφού έχεις πρόσβαση"], ["Before scanning", "Πριν τη σάρωση"], ["Logging out", "Αποσύνδεση"]], 0),
    ],
  },
  config: {
    info: b(
      "wp-config.php stored the database username and password in plain text — a classic credential-reuse opportunity.",
      "Το wp-config.php αποθήκευε το όνομα χρήστη και τον κωδικό της βάσης σε καθαρό κείμενο — κλασική ευκαιρία επαναχρήσης διαπιστευτηρίων."
    ),
    questions: [
      q("wp-config.php contains?", "Το wp-config.php περιέχει;", [["DB credentials in plain text", "Creds βάσης σε καθαρό κείμενο"], ["The flags", "Τα flags"], ["Nothing useful", "Τίποτα χρήσιμο"]], 0),
      q("Config files are?", "Τα αρχεία config είναι;", [["A goldmine for credentials", "Χρυσωρυχείο διαπιστευτηρίων"], ["Always encrypted", "Πάντα κρυπτογραφημένα"], ["Useless", "Άχρηστα"]], 0),
      q("The found credentials were for?", "Τα creds που βρέθηκαν ήταν για;", [["MySQL", "MySQL"], ["SSH only", "Μόνο SSH"], ["The browser", "Τον browser"]], 0),
    ],
  },
  mysql: {
    info: b(
      "You logged into MySQL with the stolen password, gaining direct access to every secret the database stores.",
      "Συνδέθηκες στη MySQL με τον κλεμμένο κωδικό, αποκτώντας άμεση πρόσβαση σε κάθε μυστικό της βάσης."
    ),
    questions: [
      q("'mysql -u root -p' prompts for?", "Το 'mysql -u root -p' ζητά;", [["The password", "Τον κωδικό"], ["A port", "Μια θύρα"], ["A file", "Ένα αρχείο"]], 0),
      q("Direct DB access exposes?", "Η άμεση πρόσβαση στη βάση εκθέτει;", [["Posts, options, user hashes", "Posts, options, hashes χρηστών"], ["Only the time", "Μόνο την ώρα"], ["Nothing", "Τίποτα"]], 0),
      q("SQL statements end with?", "Οι εντολές SQL τελειώνουν με;", [[";", ";"], [".", "."], [":", ":"]], 0),
    ],
  },
  dbdump: {
    info: b(
      "Dumping wp_posts revealed flags hidden as draft posts — a genuine misconfiguration in the challenge.",
      "Το άδειασμα του wp_posts αποκάλυψε flags κρυμμένα ως προσχέδια — πραγματική λανθασμένη ρύθμιση."
    ),
    questions: [
      q("'use wordpress;' does?", "Τι κάνει το 'use wordpress;';", [["Selects that database", "Επιλέγει αυτή τη βάση"], ["Deletes it", "Τη διαγράφει"], ["Exports it", "Την εξάγει"]], 0),
      q("The flags hid in which table?", "Σε ποιον πίνακα κρύφτηκαν τα flags;", [["wp_posts", "wp_posts"], ["wp_options", "wp_options"], ["wp_terms", "wp_terms"]], 0),
      q("'show tables;' lists?", "Το 'show tables;' εμφανίζει;", [["Tables in the current DB", "Πίνακες της τρέχουσας βάσης"], ["Databases", "Βάσεις δεδομένων"], ["Users", "Χρήστες"]], 0),
    ],
  },
  crack: {
    info: b(
      "A cracker (john / hashcat) turned steven's stolen hash into the password 'pink84'. Reused passwords often work elsewhere.",
      "Ένας cracker (john / hashcat) μετέτρεψε το κλεμμένο hash του steven στον κωδικό 'pink84'. Οι επαναχρησιμοποιημένοι κωδικοί συχνά δουλεύουν αλλού."
    ),
    questions: [
      q("A stolen hash is useful once you?", "Ένα κλεμμένο hash χρησιμεύει όταν το;", [["Crack it offline", "Σπάσεις offline"], ["Encrypt it", "Κρυπτογραφήσεις"], ["Delete it", "Διαγράψεις"]], 0),
      q("Tools for cracking hashes?", "Εργαλεία για σπάσιμο hashes;", [["john or hashcat", "john ή hashcat"], ["nmap", "nmap"], ["curl", "curl"]], 0),
      q("Reused passwords mean the DB password often?", "Οι επαναχρησιμοποιημένοι κωδικοί σημαίνουν ότι ο κωδικός βάσης συχνά;", [["Works as a login too", "Δουλεύει και ως login"], ["Never works", "Δεν δουλεύει ποτέ"], ["Is random", "Είναι τυχαίος"]], 0),
    ],
  },
  su: {
    info: b(
      "'su steven' switched to his account using the cracked password — pivoting to a more privileged user.",
      "Το 'su steven' άλλαξε στον λογαριασμό του με τον σπασμένο κωδικό — pivot σε έναν πιο προνομιούχο χρήστη."
    ),
    questions: [
      q("su is used to?", "Το su χρησιμοποιείται για;", [["Switch user", "Αλλαγή χρήστη"], ["Scan ports", "Σάρωση θυρών"], ["Search files", "Αναζήτηση αρχείων"]], 0),
      q("You pivot to steven because?", "Κάνεις pivot στον steven γιατί;", [["He has a powerful sudo right", "Έχει ισχυρό δικαίωμα sudo"], ["He is nicer", "Είναι πιο ευγενικός"], ["Random choice", "Τυχαία επιλογή"]], 0),
      q("After su, confirm with?", "Μετά το su, επιβεβαιώνεις με;", [["whoami", "whoami"], ["ls", "ls"], ["pwd", "pwd"]], 0),
    ],
  },
  sudol: {
    info: b(
      "'sudo -l' revealed steven may run python as root with NOPASSWD — exactly the escalation path to root.",
      "Το 'sudo -l' αποκάλυψε ότι ο steven μπορεί να τρέξει python ως root με NOPASSWD — ακριβώς το μονοπάτι ανύψωσης σε root."
    ),
    questions: [
      q("'sudo -l' lists?", "Το 'sudo -l' εμφανίζει;", [["Commands you may run as root", "Εντολές που τρέχεις ως root"], ["Your files", "Τα αρχεία σου"], ["Open ports", "Ανοιχτές θύρες"]], 0),
      q("NOPASSWD means?", "Το NOPASSWD σημαίνει;", [["No password needed to sudo it", "Δεν χρειάζεται κωδικός για sudo"], ["No access", "Καμία πρόσβαση"], ["No password set", "Δεν έχει οριστεί κωδικός"]], 0),
      q("A root-runnable interpreter (python) means?", "Ένας interpreter εκτελέσιμος ως root (python) σημαίνει;", [["Instant root shell", "Άμεσο root shell"], ["Nothing", "Τίποτα"], ["Slower system", "Πιο αργό σύστημα"]], 0),
    ],
  },
};

// Map each task id to a quiz concept. Shared ids across campaigns reuse one quiz.
const TASK_CONCEPT: Record<string, string> = {
  // intro — linux basics
  help: "help", whoami: "whoami", clear: "clear", pwd: "pwd", ls: "ls",
  hidden: "lsa", "cat-secret": "cat", "cd-docs": "cd",
  // intro — files
  mkdir: "mkdir", touch: "touch", find: "find", grep: "grep",
  // intro — permissions
  "ls-l": "lsl", id: "id", "chmod-x": "chmodx", "chmod-600": "chmodnum", sudo: "sudo",
  // intro — networking
  "ip-a": "ipaddr", route: "iproute", "ping-gw": "ping", "ping-target": "ping", netstat: "netstat",
  // intro — recon
  nslookup: "dns", dig: "dns", whois: "whois", subnet: "nmapsubnet",
  // intro — scanning
  scan: "nmap", versions: "nmapver", specific: "nmapports",
  // intro — bruteforce / sqli / privesc
  hydra: "hydra", ssh: "ssh", curl: "curl", bypass: "sqli-bypass",
  enum: "idpriv", root: "privesc", confirm: "whoami",
  // raven
  netdiscover: "netdiscover", nmap: "nmap",
  visit: "browse", services: "browse", "source-flag1": "viewsource",
  dirb: "dirb", wpscan: "wpscan",
  flag2: "loot", config: "config", mysql: "mysql", dump: "dbdump",
  crack: "crack", su: "su", "sudo-l": "sudol",
};

export function getQuiz(taskId: string): QuizEntry | null {
  const concept = TASK_CONCEPT[taskId];
  return concept ? CONCEPTS[concept] : null;
}
