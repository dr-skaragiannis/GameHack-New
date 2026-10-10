import type { Bi } from "./lessons";
import type { CommandLesson } from "./commandGuide";
import { findLinuxCommand } from "../lib/linuxCommandCatalog";

const both = (en: string, el: string): Bi => ({ en, el });

export type TheoryBlock = { labelKey: "commandPurpose" | "commandMechanics" | "commandReading" | "commandOutput" | "commandBoundary"; text: Bi };

function firstName(command: string): string {
  const token = command.trim().split(/\s+/)[0] || "";
  if (token.startsWith("./")) return "bash";
  return token.split("/").pop()?.toLowerCase() || token.toLowerCase();
}

function forms(command: string): string[] {
  const parts = command.split(/\s+\/\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return [command.trim()];
  const names = new Set(parts.map(firstName));
  return names.size === 1 ? parts : [command.trim()];
}

function readOne(command: string): Bi {
  const name = firstName(command);
  const tokens = command.trim().split(/\s+/).filter(Boolean);
  const flags = tokens.filter((token) => token.startsWith("-"));
  const args = tokens.filter((token, index) => index > 0 && !token.startsWith("-") && token !== "|");

  if (name === "nmap") {
    const target = args.find((token) => /\d|lab/i.test(token)) || "the fictional lab address named in this module";
    const version = flags.some((flag) => flag.includes("sV") || flag === "-A");
    const discovery = flags.some((flag) => flag === "-sn" || flag === "-sP" || flag === "-sp");
    const script = /ssh-auth-methods/.test(command);
    const subnet = /\/24|\.0\b/.test(target);
    return both(
      `The program is nmap, and the target in this line is ${target}. ${subnet ? "A /24 address asks which fictional hosts in the lab subnet answer. It is not a scan of your physical LAN. " : "A single address asks about one fictional host. "}${version ? "-sV adds a version column by requesting the service banner. " : discovery ? "-sn or -sP asks only whether the host answers, without listing ports. " : "Without a version flag, the report shows port, state, and service name. "}${script ? "--script ssh-auth-methods prints the canned method list for ssh.lab only: publickey and password. " : ""}GameHack never sends this scan to a network interface on your computer.`,
      `Το πρόγραμμα είναι nmap και ο στόχος σε αυτή τη γραμμή είναι ${target}. ${subnet ? "Μια διεύθυνση /24 ρωτά ποιοι φανταστικοί hosts του υποδικτύου απαντούν. Δεν είναι σάρωση του φυσικού σου LAN. " : "Μια μοναδική διεύθυνση αφορά έναν φανταστικό host. "}${version ? "Το -sV προσθέτει στήλη έκδοσης ζητώντας το banner. " : discovery ? "Τα -sn ή -sP ρωτούν μόνο αν ο host απαντά, χωρίς λίστα θυρών. " : "Χωρίς σημαία έκδοσης, η αναφορά δείχνει θύρα, κατάσταση και όνομα υπηρεσίας. "}${script ? "Το --script ssh-auth-methods τυπώνει την έτοιμη λίστα μόνο για το ssh.lab: publickey και password. " : ""}Το GameHack δεν στέλνει αυτή τη σάρωση σε διεπαφή δικτύου του υπολογιστή σου.`,
    );
  }

  if (name === "hydra") {
    return both(
      "This is the lab's canned credential check, not a tool you point at an address of your own. -l names one account. -P names the small training wordlist already in the sandbox. The ssh:// target must be a fictional GameHack host, ssh.lab or raven.lab. A row that prints a password is a finding about that simulated account. The fix is keys, lockout, and an alert, not a longer wordlist.",
      "Αυτός είναι ο έτοιμος έλεγχος διαπιστευτηρίων του εργαστηρίου, όχι εργαλείο που στρέφεις σε δική σου διεύθυνση. Το -l ονομάζει έναν λογαριασμό. Το -P ονομάζει το μικρό λεξικό εκπαίδευσης που υπάρχει ήδη στο sandbox. Ο στόχος ssh:// πρέπει να είναι φανταστικός host του GameHack, το ssh.lab ή το raven.lab. Μια γραμμή που τυπώνει κωδικό είναι εύρημα για εκείνον τον εικονικό λογαριασμό. Η διόρθωση είναι κλειδιά, κλείδωμα και ειδοποίηση, όχι μεγαλύτερο λεξικό.",
    );
  }

  if (name === "ssh") {
    const jump = flags.some((flag) => flag === "-J");
    const forward = flags.some((flag) => flag === "-L");
    const key = flags.some((flag) => flag === "-i");
    return both(
      `ssh opens a simulated session to a fictional host. ${jump ? "-J names the bastion the lab uses for ProxyJump; the second address is the internal host, still inside the fictional map. " : ""}${forward ? "-L records a local-forward request and then stops. This sandbox does not open a socket or reach an internal site. " : ""}${key ? "-i selects a key file that exists only in the simulation. " : ""}A name such as jump or db-int is a Host alias from the lab config. A welcome banner means the route was accepted. It does not mean a real machine was contacted.`,
      `Το ssh ανοίγει εικονική συνεδρία σε φανταστικό host. ${jump ? "Το -J ονομάζει το bastion που χρησιμοποιεί το εργαστήριο για ProxyJump. Η δεύτερη διεύθυνση είναι εσωτερικός host, ακόμη μέσα στον φανταστικό χάρτη. " : ""}${forward ? "Το -L καταγράφει αίτημα τοπικής προώθησης και σταματά. Αυτό το sandbox δεν ανοίγει socket ούτε φτάνει εσωτερική σελίδα. " : ""}${key ? "Το -i διαλέγει αρχείο κλειδιού που υπάρχει μόνο στην προσομοίωση. " : ""}Ένα όνομα όπως jump ή db-int είναι alias Host από τη ρύθμιση του εργαστηρίου. Μήνυμα υποδοχής σημαίνει ότι η διαδρομή έγινε δεκτή. Δεν σημαίνει ότι έγινε επαφή με πραγματικό μηχάνημα.`,
    );
  }

  if (name === "ssh-keygen") {
    return both(
      "ssh-keygen records a key pair inside this sandbox. -t ed25519 asks for the modern key type this lab uses. The printed fingerprint is a lab marker, not a usable private key, and nothing is written outside the simulation. On a machine you administer, the same idea belongs in the user's ~/.ssh directory, with mode 600 and a long random passphrase.",
      "Η ssh-keygen καταγράφει ζεύγος κλειδιών μέσα σε αυτό το sandbox. Το -t ed25519 ζητά τον σύγχρονο τύπο κλειδιού που χρησιμοποιεί το εργαστήριο. Το αποτύπωμα που τυπώνεται είναι δείκτης του lab, όχι χρησιμοποιήσιμο ιδιωτικό κλειδί, και τίποτα δεν γράφεται έξω από την προσομοίωση. Σε μηχάνημα που διαχειρίζεσαι, η ίδια ιδέα ανήκει στον κατάλογο ~/.ssh του χρήστη, με κατάσταση 600 και μακριά τυχαία συνθηματική φράση.",
    );
  }

  if (name === "scp") {
    return both(
      "scp is the shape of a file copy over an authenticated SSH channel. The source is the local path, and user@host:path is the fictional destination. In GameHack the transfer is a stub: it reports completion and never contacts a remote host. The lesson is that a valid session can move files, so do not practise by copying system account files.",
      "Το scp είναι η μορφή αντιγραφής αρχείου πάνω από ταυτοποιημένο κανάλι SSH. Η πηγή είναι η τοπική διαδρομή και το user@host:path ο φανταστικός προορισμός. Στο GameHack η μεταφορά είναι εικονική: δηλώνει ολοκλήρωση και δεν επικοινωνεί με απομακρυσμένο host. Το μάθημα είναι ότι μια έγκυρη συνεδρία μεταφέρει αρχεία, οπότε μην εξασκείσαι αντιγράφοντας αρχεία λογαριασμών συστήματος.",
    );
  }

  if (name === "john" || name === "hashcat") {
    return both(
      "This is the classroom fixture already stored in the lab, not a cracker you point at a password database. john --wordlist names the toy list and the training hash file. hashcat -m selects the hash mode and -a selects the candidate mode for the one known sample on the card. The simulator returns that stored result. It does not test an account, and it does not accept a hash you bring from outside the case folder.",
      "Αυτό είναι το έτοιμο παράδειγμα που υπάρχει ήδη στο εργαστήριο, όχι εργαλείο που στρέφεις σε βάση κωδικών. Το john --wordlist ονομάζει τη δοκιμαστική λίστα και το αρχείο εκπαιδευτικών hashes. Το hashcat -m διαλέγει τον τύπο hash και το -a τον τρόπο υποψηφίων για το ένα γνωστό δείγμα της κάρτας. Ο προσομοιωτής επιστρέφει εκείνο το αποθηκευμένο αποτέλεσμα. Δεν ελέγχει λογαριασμό και δεν δέχεται hash που φέρνεις έξω από τον φάκελο της υπόθεσης.",
    );
  }

  if (name === "sqlmap") {
    return both(
      "sqlmap -u names one URL. In this lab that URL must be the fictional login on web.lab. The simulator returns a canned finding and does not send an HTTP request. Read the result as a demonstration that an unsafe parameter can be recognized, then remember the defence: parameterised queries and a database account with only the rights it needs.",
      "Το sqlmap -u ονομάζει ένα URL. Σε αυτό το εργαστήριο το URL πρέπει να είναι η φανταστική σελίδα σύνδεσης στο web.lab. Ο προσομοιωτής επιστρέφει έτοιμο εύρημα και δεν στέλνει αίτημα HTTP. Διάβασε το αποτέλεσμα ως επίδειξη ότι μια μη ασφαλής παράμετρος μπορεί να αναγνωριστεί, και μετά θυμήσου την άμυνα: παραμετροποιημένα ερωτήματα και λογαριασμός βάσης μόνο με τα δικαιώματα που χρειάζεται.",
    );
  }

  if (name === "curl" || name === "wget") {
    return both(
      "curl requests a URL and prints the body. In GameHack the only meaningful answers are the canned pages for localhost and the fictional lab hosts. A connection error means the simulated service is stopped or the address is not a lab fixture. Treat the HTML as evidence of what the page claims, not as instructions to run.",
      "Το curl ζητά ένα URL και τυπώνει το σώμα. Στο GameHack οι μόνες ουσιαστικές απαντήσεις είναι οι έτοιμες σελίδες για το localhost και τους φανταστικούς hosts του εργαστηρίου. Σφάλμα σύνδεσης σημαίνει ότι η εικονική υπηρεσία είναι σταματημένη ή ότι η διεύθυνση δεν είναι fixture του lab. Αντιμετώπισε το HTML ως τεκμήριο του τι δηλώνει η σελίδα, όχι ως οδηγίες προς εκτέλεση.",
    );
  }

  if (name === "sudo") {
    const list = flags.includes("-l");
    return both(
      list
        ? "sudo -l lists the simulated grants for this account. Read the command and the user it may run as. A grant is a finding to remove if the command can change files or start another program. It is not a licence to try the same grant on a system you do not administer."
        : "The word after sudo is the command the lab will run with a simulated grant. Read that command before you press Enter. This sandbox does not change privileges on your computer. A grant that lets an ordinary account run a powerful program as root is a configuration mistake: remove the grant.",
      list
        ? "Το sudo -l εμφανίζει τις εικονικές παραχωρήσεις αυτού του λογαριασμού. Διάβασε την εντολή και τον χρήστη ως τον οποίο επιτρέπεται να τρέξει. Μια παραχώρηση είναι εύρημα προς αφαίρεση αν η εντολή μπορεί να αλλάξει αρχεία ή να ξεκινήσει άλλο πρόγραμμα. Δεν είναι άδεια να δοκιμάσεις την ίδια παραχώρηση σε σύστημα που δεν διαχειρίζεσαι."
        : "Η λέξη μετά το sudo είναι η εντολή που θα τρέξει το εργαστήριο με εικονική παραχώρηση. Διάβασέ την πριν πατήσεις Enter. Αυτό το sandbox δεν αλλάζει προνόμια στον υπολογιστή σου. Παραχώρηση που αφήνει απλό λογαριασμό να τρέξει ισχυρό πρόγραμμα ως root είναι λάθος ρύθμισης: αφαίρεσε την παραχώρηση.",
    );
  }

  if (name === "ls") {
    const all = flags.some((flag) => flag.includes("a"));
    const long = flags.some((flag) => flag.includes("l"));
    return both(
      `ls reads a directory. ${all ? "-a includes names that start with a dot, which is where SSH keys and config often live. " : ""}${long ? "-l adds type, mode, owner, group, size, and time. Read the mode before you change a file. " : ""}${args.length ? `The path ${args.join(" ")} selects the directory; without a path, ls uses the working directory.` : "Without a path, ls uses the working directory. Confirm that location with pwd if the names surprise you."}`,
      `Το ls διαβάζει έναν φάκελο. ${all ? "Το -a περιλαμβάνει ονόματα που αρχίζουν με τελεία, εκεί που συχνά ζουν κλειδιά SSH και ρυθμίσεις. " : ""}${long ? "Το -l προσθέτει τύπο, mode, ιδιοκτήτη, ομάδα, μέγεθος και χρόνο. Διάβασε το mode πριν αλλάξεις αρχείο. " : ""}${args.length ? `Η διαδρομή ${args.join(" ")} διαλέγει τον φάκελο. Χωρίς διαδρομή, το ls χρησιμοποιεί τον φάκελο εργασίας.` : "Χωρίς διαδρομή, το ls χρησιμοποιεί τον φάκελο εργασίας. Επιβεβαίωσε τη θέση με pwd αν τα ονόματα σε ξαφνιάζουν."}`,
    );
  }

  if (name === "find") {
    return both(
      "find walks a directory tree. The first path is where the walk starts. -name matches a filename, and quotes around *.txt stop the shell from expanding the star before find sees it. -type f keeps regular files and -type d keeps directories. The printed paths are candidates. Open one with cat only when you know it is a lab file.",
      "Το find διασχίζει ένα δέντρο φακέλων. Η πρώτη διαδρομή είναι η αφετηρία. Το -name ταιριάζει όνομα αρχείου, και τα εισαγωγικά γύρω από *.txt εμποδίζουν το shell να αναπτύξει το αστεράκι πριν το δει το find. Το -type f κρατά κανονικά αρχεία και το -type d φακέλους. Οι διαδρομές που τυπώνονται είναι υποψήφιες. Άνοιξε μία με cat μόνο όταν ξέρεις ότι είναι αρχείο του εργαστηρίου.",
    );
  }

  if (name === "grep") {
    return both(
      "grep keeps lines that match a pattern. The pattern comes before the file. If the line contains a pipe, grep is filtering the previous command's output instead of a file. -n adds line numbers, -i ignores case, and -v keeps the lines that do not match. The source file is not changed.",
      "Το grep κρατά γραμμές που ταιριάζουν σε μοτίβο. Το μοτίβο μπαίνει πριν από το αρχείο. Αν η γραμμή έχει pipe, το grep φιλτράρει την έξοδο της προηγούμενης εντολής και όχι ένα αρχείο. Το -n προσθέτει αριθμούς γραμμής, το -i αγνοεί πεζά και κεφαλαία, και το -v κρατά τις γραμμές που δεν ταιριάζουν. Το αρχείο πηγής δεν αλλάζει.",
    );
  }

  if (name === "cat" || name === "head" || name === "tail") {
    return both(
      `${name} prints text from ${args[0] || "the named file"}. cat shows the whole file, head the beginning, and tail the end. The lines are data. They are not commands to type back into the shell. A permission error means the account cannot read that path.`,
      `Η εντολή ${name} τυπώνει κείμενο από ${args[0] || "το ονομασμένο αρχείο"}. Το cat δείχνει όλο το αρχείο, το head την αρχή και το tail το τέλος. Οι γραμμές είναι δεδομένα. Δεν είναι εντολές για να τις ξαναγράψεις στο shell. Σφάλμα δικαιώματος σημαίνει ότι ο λογαριασμός δεν μπορεί να διαβάσει αυτή τη διαδρομή.`,
    );
  }

  if (name === "ping") {
    return both(
      `ping sends a simulated ICMP echo to ${args[0] || "a lab host"}. Replies mean the simulator considers that fictional host reachable. A real network can block ICMP and still be online, so a missing reply is not proof that a host is down. This lab does not probe addresses outside its fictional map.`,
      `Το ping στέλνει εικονικό ICMP echo προς ${args[0] || "έναν host του εργαστηρίου"}. Οι απαντήσεις σημαίνουν ότι ο προσομοιωτής θεωρεί προσβάσιμο εκείνον τον φανταστικό host. Ένα πραγματικό δίκτυο μπορεί να μπλοκάρει το ICMP και να είναι ακόμη σε λειτουργία, οπότε μια απούσα απάντηση δεν αποδεικνύει ότι ο host είναι κάτω. Αυτό το εργαστήριο δεν εξετάζει διευθύνσεις έξω από τον φανταστικό χάρτη.`,
    );
  }

  if (name === "ip" || name === "ifconfig") {
    return both(
      "This command prints the simulator's virtual interfaces. inet is an IPv4 address, the prefix or netmask describes the subnet, and ether is the hardware address of the virtual adapter. Nothing here changes a real network card.",
      "Αυτή η εντολή τυπώνει τις εικονικές διεπαφές του προσομοιωτή. Το inet είναι διεύθυνση IPv4, το πρόθεμα ή το netmask περιγράφει το υποδίκτυο, και το ether είναι η διεύθυνση υλικού του εικονικού προσαρμογέα. Τίποτα εδώ δεν αλλάζει πραγματική κάρτα δικτύου.",
    );
  }

  if (name === "ps") {
    return both(
      flags.includes("aux") || command.includes("aux")
        ? "ps aux lists processes for every simulated user. PID identifies a process, %CPU and %MEM are a snapshot, and the last column is the command name. A pipe to grep keeps only rows with that name. A name in the list is not proof of what the program is doing."
        : "ps lists processes attached to this terminal. PID is the identifier, TTY is the terminal, TIME is CPU time already consumed, and CMD is the program name. Compare it with ps aux when you need processes that are not attached to your session.",
      flags.includes("aux") || command.includes("aux")
        ? "Το ps aux εμφανίζει διεργασίες για κάθε εικονικό χρήστη. Το PID προσδιορίζει τη διεργασία, τα %CPU και %MEM είναι στιγμιότυπο, και η τελευταία στήλη είναι το όνομα εντολής. Ένα pipe προς grep κρατά μόνο γραμμές με εκείνο το όνομα. Ένα όνομα στη λίστα δεν αποδεικνύει τι κάνει το πρόγραμμα."
        : "Το ps εμφανίζει διεργασίες συνδεδεμένες με αυτό το τερματικό. Το PID είναι το αναγνωριστικό, το TTY το τερματικό, το TIME ο χρόνος CPU που έχει ήδη καταναλωθεί, και το CMD το όνομα προγράμματος. Σύγκρινέ το με ps aux όταν χρειάζεσαι διεργασίες που δεν είναι συνδεδεμένες με τη συνεδρία σου.",
    );
  }

  if (name === "chmod" || name === "chown" || name === "chgrp") {
    return both(
      `${name} changes metadata on a virtual file. The mode or owner comes before the path. chmod 600 means the owner can read and write, and nobody else can. A successful run is often silent. Check the result with ls -l. This does not change files on your computer.`,
      `Η εντολή ${name} αλλάζει μεταδεδομένα σε εικονικό αρχείο. Το mode ή ο ιδιοκτήτης μπαίνει πριν από τη διαδρομή. Το chmod 600 σημαίνει ότι ο ιδιοκτήτης μπορεί να διαβάσει και να γράψει, και κανείς άλλος δεν μπορεί. Μια επιτυχημένη εκτέλεση είναι συχνά σιωπηλή. Έλεγξε το αποτέλεσμα με ls -l. Αυτό δεν αλλάζει αρχεία στον υπολογιστή σου.`,
    );
  }

  if (name === "apt" || name === "apt-get" || name === "apt-cache") {
    return both(
      "The first argument after the program is the action: search reads the simulated package index, install records a simulated install, and remove or purge stop for confirmation so you can practise the syntax without deleting a package. A package name in a search is a lookup. It does not run that package.",
      "Το πρώτο όρισμα μετά το πρόγραμμα είναι η ενέργεια: το search διαβάζει το εικονικό ευρετήριο πακέτων, το install καταγράφει εικονική εγκατάσταση, και τα remove ή purge σταματούν για επιβεβαίωση ώστε να εξασκηθείς στη σύνταξη χωρίς να διαγράψεις πακέτο. Ένα όνομα πακέτου σε αναζήτηση είναι αναζήτηση. Δεν εκτελεί το πακέτο.",
    );
  }

  if (flags.length || args.length) {
    return both(
      `${name} is the program. ${flags.length ? `The options are ${flags.join(", ")}. ` : ""}${args.length ? `The remaining words, ${args.join(", ")}, are paths, names, or fictional lab targets. ` : ""}Read the option letters before you press Enter. If a word is an address, it belongs to the GameHack map unless the module explicitly tells you to use an isolated virtual machine you administer.`,
      `Το ${name} είναι το πρόγραμμα. ${flags.length ? `Οι επιλογές είναι ${flags.join(", ")}. ` : ""}${args.length ? `Οι υπόλοιπες λέξεις, ${args.join(", ")}, είναι διαδρομές, ονόματα ή φανταστικοί στόχοι του εργαστηρίου. ` : ""}Διάβασε τα γράμματα των επιλογών πριν πατήσεις Enter. Αν μια λέξη είναι διεύθυνση, ανήκει στον χάρτη του GameHack, εκτός αν το μάθημα λέει ρητά να χρησιμοποιήσεις απομονωμένη εικονική μηχανή που διαχειρίζεσαι.`,
    );
  }

  return both(
    `${name} takes no extra arguments in this form. Pressing Enter runs it against the current simulated session. It does not contact a machine outside the lab.`,
    `Η εντολή ${name} δεν παίρνει επιπλέον ορίσματα σε αυτή τη μορφή. Το Enter την εκτελεί στην τρέχουσα εικονική συνεδρία. Δεν επικοινωνεί με μηχάνημα έξω από το εργαστήριο.`,
  );
}

function readInvocation(command: string): Bi {
  const pieces = forms(command);
  if (pieces.length === 1) return readOne(pieces[0]);
  const explained = pieces.map(readOne);
  return both(
    `This card shows ${pieces.length} forms. ${explained.map((item) => item.en).join(" ")}`,
    `Αυτή η κάρτα δείχνει ${pieces.length} μορφές. ${explained.map((item) => item.el).join(" ")}`,
  );
}

function catalogPurpose(command: string): Bi {
  const info = findLinuxCommand(firstName(command));
  if (!info) {
    return both(
      "This line is a lab shortcut. Read the words before you run it, and compare the terminal answer with the objective.",
      "Αυτή η γραμμή είναι συντόμευση του εργαστηρίου. Διάβασε τις λέξεις πριν την τρέξεις και σύγκρινε την απάντηση του τερματικού με τον στόχο.",
    );
  }
  return both(info.summary, `${info.name}: ${info.summary}`);
}

export function theoryBlocksForCommand(command: string, lesson?: CommandLesson): TheoryBlock[] {
  const blocks: TheoryBlock[] = [
    { labelKey: "commandPurpose", text: lesson?.purpose ?? catalogPurpose(command) },
  ];
  if (lesson?.mechanics) blocks.push({ labelKey: "commandMechanics", text: lesson.mechanics });
  blocks.push({ labelKey: "commandReading", text: readInvocation(command) });
  blocks.push({
    labelKey: "commandOutput",
    text: lesson?.output ?? both(
      "Read the terminal lines as the direct answer. An error usually names a missing argument, a wrong path, or an action this sandbox does not perform. No live system was contacted.",
      "Διάβασε τις γραμμές του τερματικού ως την άμεση απάντηση. Ένα σφάλμα συνήθως ονομάζει ελλιπές όρισμα, λάθος διαδρομή ή ενέργεια που αυτό το sandbox δεν εκτελεί. Δεν έγινε επαφή με ζωντανό σύστημα.",
    ),
  });
  if (lesson?.caution) blocks.push({ labelKey: "commandBoundary", text: lesson.caution });
  return blocks;
}
