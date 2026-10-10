import type { Bi, Module } from "./lessons";
import { parseArgs, splitPipes, type Terminal, type TermLine } from "../lib/terminal";
import type { Lang } from "../i18n";

export type CommandLesson = {
  key: string;
  aliases: string[];
  title: Bi;
  purpose: Bi;
  mechanics: Bi;
  output: Bi;
  syntax: string;
  example: string;
  caution?: Bi;
};

export type CommandExplanation = {
  command: string;
  lesson: CommandLesson;
  reading: string;
  output: TermLine[];
  exitCode: number;
};

const both = (en: string, el: string): Bi => ({ en, el });

export const COMMAND_GUIDE: CommandLesson[] = [
  {
    key: "help", aliases: ["help"], title: both("Command help", "Βοήθεια εντολών"),
    purpose: both("Discover what this shell can do.", "Μάθε ποιες εντολές υποστηρίζει αυτό το shell."),
    mechanics: both("The lab prints its available command names and short usage guidance. Options such as --help are commonly provided by individual programs.", "Το lab εμφανίζει διαθέσιμες εντολές και οδηγίες. Τα προγράμματα συχνά έχουν δικό τους --help."),
    output: both("The list is a reference for this safe simulator, not a promise that every real Linux distribution has identical tools.", "Η λίστα αφορά τον ασφαλή προσομοιωτή, όχι κάθε διανομή Linux."),
    syntax: "help", example: "help",
  },
  {
    key: "pipeline", aliases: [], title: both("Connect commands with a pipe", "Σύνδεση εντολών με pipe"),
    purpose: both("Combine small tools so one command's output becomes the next command's input.", "Συνδύασε μικρά εργαλεία ώστε η έξοδος μιας εντολής να γίνει είσοδος της επόμενης."),
    mechanics: both("The | operator connects standard output to standard input. The left side produces data; the right side filters, transforms, or displays it.", "Ο τελεστής | συνδέει standard output με standard input. Η αριστερή εντολή παράγει δεδομένα, η δεξιά φιλτράρει, μετασχηματίζει ή εμφανίζει."),
    output: both("You see the final stage's output. Earlier stages may have produced more data that later stages intentionally removed.", "Βλέπεις την έξοδο του τελευταίου σταδίου. Τα προηγούμενα μπορεί να παρήγαγαν περισσότερα δεδομένα που φιλτραρίστηκαν."),
    syntax: "COMMAND | COMMAND", example: "ifconfig | grep inet",
  },
  {
    key: "tab", aliases: ["tab"], title: both("Tab completion", "Συμπλήρωση με Tab"),
    purpose: both("Complete a command or path and reduce typing mistakes.", "Συμπλήρωσε εντολή ή διαδρομή και μείωσε τα λάθη πληκτρολόγησης."),
    mechanics: both("Type part of a command or filename and press Tab. One match fills in; multiple matches are listed so you can narrow the choice.", "Γράψε μέρος εντολής ή ονόματος και πάτησε Tab. Ένα αποτέλεσμα συμπληρώνεται, πολλά εμφανίζονται για να περιορίσεις την επιλογή."),
    output: both("A completion changes the current input or lists candidates. It does not run the command until you press Enter.", "Η συμπλήρωση αλλάζει την τρέχουσα είσοδο ή εμφανίζει υποψήφια. Δεν εκτελείται μέχρι να πατήσεις Enter."),
    syntax: "TYPE PREFIX, THEN PRESS TAB", example: "ls ",
  },
  {
    key: "pwd", aliases: ["pwd"], title: both("Print working directory", "Εμφάνιση τρέχοντος φακέλου"),
    purpose: both("Orient yourself in the filesystem.", "Προσανατολίσου στο σύστημα αρχείων."),
    mechanics: both("pwd means print working directory. It reads the shell's current location; it does not change files.", "Το όνομα pwd προέρχεται από το «print working directory». Η εντολή pwd, όταν εκτελείται, εμφανίζει τον φάκελο στον οποίο βρισκόμαστε αυτή τη στιγμή, χωρίς να αλλάζει αρχεία."),
    output: both("The printed absolute path is where relative paths such as notes.txt will be resolved.", "Η απόλυτη διαδρομή που εμφανίζεται δείχνει από ποιο σημείο θα ερμηνευθούν σχετικές διαδρομές, όπως το notes.txt."),
    syntax: "pwd", example: "pwd",
  },
  {
    key: "whoami", aliases: ["whoami"], title: both("Current identity", "Τρέχουσα ταυτότητα"),
    purpose: both("Check which account will own the next action.", "Έλεγξε ποιος λογαριασμός θα εκτελέσει την επόμενη ενέργεια."),
    mechanics: both("whoami prints the effective username. A root result means administrator-level access inside this simulation.", "Η εντολή whoami εμφανίζει το ενεργό όνομα χρήστη. Το αποτέλεσμα root δηλώνει δικαιώματα διαχειριστή μέσα στην προσομοίωση."),
    output: both("Use the identity together with the prompt and file permissions; the username alone does not prove access to a remote machine.", "Συνδύασε την ταυτότητα με το prompt και τα δικαιώματα αρχείων. Το όνομα χρήστη από μόνο του δεν αποδεικνύει πρόσβαση σε απομακρυσμένο σύστημα."),
    syntax: "whoami", example: "whoami", caution: both("Root can make broad changes. Practice only in the isolated lab.", "Ο root μπορεί να κάνει μεγάλες αλλαγές. Εξασκήσου μόνο στο απομονωμένο lab."),
  },
  {
    key: "id", aliases: ["id"], title: both("User and group IDs", "Αναγνωριστικά χρήστη και ομάδων"),
    purpose: both("Inspect numeric identity and group membership.", "Έλεγξε την αριθμητική ταυτότητα και τις ομάδες."),
    mechanics: both("id reports UID, primary GID, and supplementary groups. Group membership often explains why a user can access a resource.", "Το id εμφανίζει UID, κύριο GID και πρόσθετες ομάδες. Οι ομάδες εξηγούν συχνά την πρόσβαση σε πόρους."),
    output: both("uid=0 means root. Other numeric IDs map to accounts and groups in the local system.", "Το uid=0 αντιστοιχεί στον χρήστη root. Τα υπόλοιπα αριθμητικά αναγνωριστικά αντιστοιχούν σε τοπικούς χρήστες και ομάδες."),
    syntax: "id", example: "id",
  },
  {
    key: "hostname", aliases: ["hostname"], title: both("Machine name", "Όνομα μηχανήματος"),
    purpose: both("Identify the current simulated host.", "Αναγνώρισε τον τρέχοντα προσομοιωμένο host."),
    mechanics: both("hostname prints the local system name. It is not a DNS lookup and does not identify the user.", "Το hostname εμφανίζει το τοπικό όνομα συστήματος. Δεν κάνει DNS lookup και δεν είναι όνομα χρήστη."),
    output: both("A short name such as kali labels the machine whose shell prompt you are using.", "Ένα σύντομο όνομα, όπως το kali, χαρακτηρίζει το μηχάνημα του οποίου το prompt χρησιμοποιείς."),
    syntax: "hostname", example: "hostname",
  },
  {
    key: "uname", aliases: ["uname"], title: both("Kernel and system information", "Πληροφορίες kernel και συστήματος"),
    purpose: both("Learn the operating-system and kernel details.", "Μάθε πληροφορίες λειτουργικού και kernel."),
    mechanics: both("uname reports kernel metadata. The -a option requests the full system summary on a real Linux host.", "Το uname εμφανίζει μεταδεδομένα kernel. Η επιλογή -a ζητά πλήρη σύνοψη σε πραγματικό Linux."),
    output: both("The output is inventory information, not evidence that a vulnerability exists.", "Η έξοδος είναι πληροφορία απογραφής του συστήματος, όχι απόδειξη ευπάθειας."),
    syntax: "uname -a", example: "uname -a",
  },
  {
    key: "ls", aliases: ["ls"], title: both("List directory entries", "Λίστα περιεχομένων φακέλου"),
    purpose: both("See files and subdirectories before acting.", "Δες αρχεία και υποφακέλους πριν ενεργήσεις."),
    mechanics: both("ls reads a directory. -a includes dotfiles, -l shows permissions/owner/size, and -h makes long-list sizes easier to read.", "Το ls διαβάζει έναν φάκελο. Το -a δείχνει dotfiles, το -l δικαιώματα/ιδιοκτήτη/μέγεθος και το -h ευανάγνωστα μεγέθη."),
    output: both("Names are entries in the current directory unless a path was supplied. No output can mean the directory is empty.", "Τα ονόματα ανήκουν στον τρέχοντα φάκελο, αν δεν δόθηκε άλλη διαδρομή. Η κενή έξοδος συνήθως δηλώνει ότι ο φάκελος είναι άδειος."),
    syntax: "ls [-a] [-l] [PATH]", example: "ls -la /root",
  },
  {
    key: "cd", aliases: ["cd"], title: both("Change directory", "Αλλαγή φακέλου"),
    purpose: both("Move the shell's working location.", "Μετακίνησε την τρέχουσα θέση του shell."),
    mechanics: both("cd changes the current working directory. ~ means home, .. means parent, and an absolute path begins at /.", "Η εντολή cd αλλάζει τον φάκελο εργασίας. Το ~ αντιστοιχεί στον προσωπικό φάκελο (home), το .. στον γονικό φάκελο, ενώ η απόλυτη διαδρομή ξεκινά από το /."),
    output: both("A successful cd is normally silent. Read the updated prompt or run pwd to confirm the new location.", "Το επιτυχημένο cd συνήθως δεν εμφανίζει κάποιο μήνυμα. Έλεγξε το prompt ή εκτέλεσε pwd για επιβεβαίωση."),
    syntax: "cd PATH", example: "cd ~/Documents",
  },
  {
    key: "cat", aliases: ["cat"], title: both("Read a text file", "Ανάγνωση αρχείου κειμένου"),
    purpose: both("Print a file's contents to the terminal.", "Εμφάνισε τα περιεχόμενα αρχείου στο τερματικό."),
    mechanics: both("cat reads the named file and writes its bytes to standard output. It is useful for short text files, not huge logs.", "Το cat διαβάζει το αρχείο και στέλνει το περιεχόμενο στο standard output. Ταιριάζει σε μικρά αρχεία, όχι τεράστια logs."),
    output: both("The printed lines are the file contents, not commands to run. A permission or path error means nothing was read.", "Οι γραμμές αυτές είναι περιεχόμενο του αρχείου, όχι εντολές προς εκτέλεση. Αν εμφανιστεί σφάλμα δικαιωμάτων ή διαδρομής, το αρχείο δεν διαβάστηκε."),
    syntax: "cat FILE", example: "cat /etc/hosts", caution: both("Treat files as data; never run unknown scripts just because you can read them.", "Αντιμετώπιζε τα αρχεία ως δεδομένα, μην εκτελείς άγνωστα scripts επειδή απλώς τα διάβασες."),
  },
  {
    key: "head", aliases: ["head"], title: both("Read the start of a file", "Ανάγνωση αρχής αρχείου"),
    purpose: both("Preview the first lines of a text file.", "Προεπισκόπηση πρώτων γραμμών αρχείου."),
    mechanics: both("head shows the first ten lines by default. -n COUNT chooses a positive number; GNU head also accepts a negative count such as -n -1 to print every line except the last. GameHack implements both forms for files and pipelines.", "Το head δείχνει τις πρώτες δέκα γραμμές από προεπιλογή. Το -n COUNT ορίζει θετικό πλήθος, το GNU head δέχεται και αρνητικό πλήθος, όπως -n -1, για να εμφανίσει όλες τις γραμμές εκτός από την τελευταία. Το GameHack προσομοιώνει και τις δύο μορφές σε αρχεία και pipelines."),
    output: both("A positive count returns a prefix; a negative count trims that many lines from the end. Use the latter only when dropping the trailing row is intentional.", "Θετικό πλήθος επιστρέφει αρχικές γραμμές, αρνητικό αφαιρεί τόσες γραμμές από το τέλος. Χρησιμοποίησε αρνητικό πλήθος μόνο όταν θέλεις σκόπιμα να παραλείψεις τις τελευταίες γραμμές."),
    syntax: "head [-n COUNT] [FILE...]", example: "head -n -1 /root/linux-beginners-3/head-fixture.txt",
  },
  {
    key: "tail", aliases: ["tail"], title: both("Read the end of a file", "Ανάγνωση τέλους αρχείου"),
    purpose: both("Inspect recent lines in a log or text file.", "Έλεγξε πρόσφατες γραμμές log ή κειμένου."),
    mechanics: both("tail shows the last ten lines by default. Real tail supports -f to follow a growing log.", "Το tail δείχνει τις τελευταίες δέκα γραμμές. Σε πραγματικό Linux το -f παρακολουθεί log που μεγαλώνει."),
    output: both("The result is a suffix of the file, often where recent events appear.", "Η έξοδος είναι το τέλος του αρχείου, όπου βρίσκονται συχνά πρόσφατα συμβάντα."),
    syntax: "tail [-n COUNT] FILE", example: "tail -n 5 /var/log/auth.log",
  },
  {
    key: "grep", aliases: ["grep"], title: both("Filter matching lines", "Φιλτράρισμα γραμμών"),
    purpose: both("Find text patterns in a file or command output.", "Βρες μοτίβα κειμένου σε αρχείο ή έξοδο εντολής."),
    mechanics: both("grep tests each input line against a pattern. With a pipe it reads the previous command's output; -i ignores case and -v inverts the match.", "Το grep ελέγχει κάθε γραμμή με μοτίβο. Με pipe διαβάζει την προηγούμενη έξοδο, το -i αγνοεί πεζά/κεφαλαία και το -v αντιστρέφει το ταίριασμα."),
    output: both("Printed rows are the matches. No rows usually means no match; it is not necessarily an error.", "Οι γραμμές που εμφανίζονται είναι εκείνες που ταιριάζουν με το μοτίβο. Αν δεν εμφανιστεί καμία γραμμή, συνήθως δεν βρέθηκε ταίριασμα, αυτό δεν είναι απαραίτητα σφάλμα."),
    syntax: "grep [OPTIONS] PATTERN FILE", example: "grep -i ssh /etc/hosts",
  },
  {
    key: "find", aliases: ["find"], title: both("Search the filesystem", "Αναζήτηση στο σύστημα αρχείων"),
    purpose: both("Locate files using their path, name, type, owner, or other properties.", "Εντόπισε αρχεία με βάση διαδρομή, όνομα, τύπο, ιδιοκτήτη ή άλλα γνωρίσματα."),
    mechanics: both("find starts at a path and walks the directory tree. -type f selects regular files; -name applies a filename pattern.", "Το find ξεκινά από μια διαδρομή και διασχίζει τους φακέλους. Το -type f επιλέγει αρχεία και το -name μοτίβο ονόματος."),
    output: both("Each printed path is a match. Permission errors mean parts of the tree were not readable by this account.", "Κάθε διαδρομή που εμφανίζεται είναι ένα αποτέλεσμα. Τα σφάλματα δικαιωμάτων δηλώνουν ότι ο λογαριασμός δεν είχε πρόσβαση σε όλο το δέντρο φακέλων."),
    syntax: "find START -type f -name PATTERN", example: "find /root -type f -name '*.txt'",
  },
  {
    key: "locate", aliases: ["locate"], title: both("Search the filename index", "Αναζήτηση ευρετηρίου ονομάτων"),
    purpose: both("Find paths quickly by name keyword.", "Βρες διαδρομές γρήγορα με λέξη στο όνομα."),
    mechanics: both("locate searches an index rather than walking the live tree. Its results depend on when the index was last updated.", "Το locate ψάχνει ευρετήριο, όχι το ζωντανό δέντρο. Τα αποτελέσματα εξαρτώνται από την τελευταία ενημέρωση."),
    output: both("Each row is an indexed path. A very new file may not appear yet; find searches the live filesystem.", "Κάθε γραμμή είναι ευρετηριασμένη διαδρομή. Ένα νέο αρχείο μπορεί να λείπει, το find ψάχνει το ζωντανό σύστημα."),
    syntax: "locate KEYWORD", example: "locate CTF | more",
  },
  {
    key: "whereis", aliases: ["whereis"], title: both("Locate binary and manual", "Εντοπισμός binary και manual"),
    purpose: both("Look up common locations for a program and its documentation.", "Βρες συνήθεις θέσεις προγράμματος και τεκμηρίωσης."),
    mechanics: both("whereis searches standard binary, source, and manual locations; it does not search every file on disk.", "Το whereis ψάχνει συνηθισμένες θέσεις binary, source και manual, όχι κάθε αρχείο του δίσκου."),
    output: both("A binary path and a man-page path may be printed on one line.", "Μπορεί να εμφανιστεί διαδρομή binary και man page στην ίδια γραμμή."),
    syntax: "whereis PROGRAM", example: "whereis git",
  },
  {
    key: "which", aliases: ["which"], title: both("Find an executable on PATH", "Εντοπισμός εκτελέσιμου στο PATH"),
    purpose: both("See which executable a shell would launch for a name.", "Δες ποιο εκτελέσιμο θα ξεκινήσει το shell για ένα όνομα."),
    mechanics: both("which searches the directories listed in PATH, in order. It is narrower than whereis.", "Το which ψάχνει τους φακέλους του PATH με τη σειρά. Είναι πιο περιορισμένο από το whereis."),
    output: both("The printed path is the matching executable found on PATH; no path means it was not found there.", "Η διαδρομή που εμφανίζεται είναι το εκτελέσιμο που βρέθηκε στο PATH, αν δεν εμφανιστεί διαδρομή, δεν βρέθηκε εκεί."),
    syntax: "which PROGRAM", example: "which git",
  },
  {
    key: "echo", aliases: ["echo"], title: both("Print or redirect text", "Εμφάνιση ή ανακατεύθυνση κειμένου"),
    purpose: both("Write text to the terminal or send it into a file.", "Γράψε κείμενο στο τερματικό ή κατεύθυνέ το σε αρχείο."),
    mechanics: both("echo expands variables such as $HOME in this lab. > replaces a file; >> appends. A redirect changes a file rather than printing the text to the terminal.", "Η εντολή echo αναπτύσσει μεταβλητές (expansion), όπως το $HOME. Το > αντικαθιστά το αρχείο, ενώ το >> προσθέτει περιεχόμενο. Με ανακατεύθυνση, η εντολή αλλάζει το αρχείο αντί να εμφανίσει το κείμενο."),
    output: both("Without redirection, the expanded text appears. With redirection, no terminal output is expected; inspect the target file to verify.", "Χωρίς redirect εμφανίζεται το κείμενο. Με redirect δεν αναμένεται έξοδος, έλεγξε το αρχείο-στόχο."),
    syntax: "echo TEXT [> FILE | >> FILE]", example: 'echo "hello" > note.txt', caution: both("A single > overwrites the destination. Check the path before using it.", "Το μονό > αντικαθιστά τον προορισμό. Έλεγξε τη διαδρομή."),
  },
  {
    key: "read", aliases: ["read"], title: both("Read simulated input into a variable", "Αποθήκευση εικονικής εισόδου σε μεταβλητή"),
    purpose: both("Capture a value for a later command in a shell script.", "Κατάγραψε μια τιμή για επόμενη εντολή σε shell script."),
    mechanics: both("In Bash, read name waits for a line of input and assigns it to the shell variable name. A later double-quoted string such as echo \"Welcome, $name\" expands the stored value; single quotes would keep $name literal. GameHack supplies a safe fixture value instead of opening a real interactive shell.", "Στο Bash, το read name περιμένει μια γραμμή εισόδου και την αποθηκεύει στη μεταβλητή name. Μια επόμενη φράση σε διπλά εισαγωγικά, όπως echo \"Welcome, $name\", αντικαθιστά το $name με την τιμή, οι μονές αποστρόφοι θα το κρατούσαν κυριολεκτικό. Το GameHack χρησιμοποιεί ασφαλή εικονική τιμή αντί να ανοίξει διαδραστικό shell."),
    output: both("Real read is normally quiet and the assigned value is used by later script lines. The simulator prints the fixed value it supplied so learners can see what was stored.", "Η πραγματική read συνήθως δεν εμφανίζει έξοδο και η τιμή χρησιμοποιείται από επόμενες γραμμές του script. Ο προσομοιωτής εμφανίζει τη σταθερή τιμή που έδωσε, ώστε να φαίνεται τι αποθηκεύτηκε."),
    syntax: "read VARIABLE", example: "read name",
  },
  {
    key: "touch", aliases: ["touch"], title: both("Create or timestamp a file", "Δημιουργία ή ενημέρωση χρόνου αρχείου"),
    purpose: both("Create an empty file when it does not exist.", "Δημιούργησε κενό αρχείο αν δεν υπάρχει."),
    mechanics: both("touch updates modification time; in this beginner lab it also creates a missing file.", "Το touch ενημερώνει χρόνο τροποποίησης, στο beginner lab δημιουργεί και νέο αρχείο."),
    output: both("Success is normally silent. Use ls -l or cat to verify the new file.", "Η επιτυχημένη εκτέλεση συνήθως δεν εμφανίζει κάποιο μήνυμα. Χρησιμοποίησε ls -l ή cat για έλεγχο."),
    syntax: "touch FILE", example: "touch practice.txt",
  },
  {
    key: "mkdir", aliases: ["mkdir"], title: both("Create a directory", "Δημιουργία φακέλου"),
    purpose: both("Make a new folder for organizing files.", "Φτιάξε φάκελο για οργάνωση αρχείων."),
    mechanics: both("mkdir creates the named directory. Its parent must already exist unless -p is supported.", "Το mkdir δημιουργεί τον φάκελο. Ο γονικός φάκελος πρέπει να υπάρχει, εκτός αν χρησιμοποιηθεί -p."),
    output: both("No output usually means success. ls shows the new directory.", "Αν δεν εμφανιστεί έξοδος, η δημιουργία συνήθως πέτυχε. Η εντολή ls εμφανίζει τον νέο φάκελο."),
    syntax: "mkdir DIRECTORY", example: "mkdir Documents/practice",
  },
  {
    key: "cp", aliases: ["cp"], title: both("Copy a file", "Αντιγραφή αρχείου"),
    purpose: both("Create a second copy at a destination.", "Δημιούργησε δεύτερο αντίγραφο σε προορισμό."),
    mechanics: both("cp reads the source and writes a copy at the destination. Copying into an existing directory keeps the source filename.", "Το cp διαβάζει την πηγή και γράφει αντίγραφο στον προορισμό. Αν ο προορισμός είναι φάκελος, διατηρείται το όνομα."),
    output: both("Success is usually silent. List the destination to confirm the copy.", "Η επιτυχημένη εκτέλεση συνήθως δεν εμφανίζει μήνυμα. Εκτέλεσε ls στον προορισμό για επιβεβαίωση."),
    syntax: "cp SOURCE DESTINATION", example: "cp notes.txt Documents/",
  },
  {
    key: "mv", aliases: ["mv"], title: both("Move or rename", "Μετακίνηση ή μετονομασία"),
    purpose: both("Move an entry to another path or rename it.", "Μετακίνησε αρχείο σε άλλη διαδρομή ή μετονόμασέ το."),
    mechanics: both("mv removes the old directory entry after placing the entry at the destination.", "Το mv αφαιρεί την παλιά εγγραφή αφού τοποθετήσει το αρχείο στον νέο προορισμό."),
    output: both("Success is normally silent. Check both source and destination paths with ls.", "Η επιτυχημένη εκτέλεση συνήθως δεν εμφανίζει μήνυμα. Έλεγξε την πηγή και τον προορισμό με ls."),
    syntax: "mv SOURCE DESTINATION", example: "mv draft.txt final.txt",
  },
  {
    key: "rm", aliases: ["rm"], title: both("Remove a file", "Αφαίρεση αρχείου"),
    purpose: both("Delete an entry from the filesystem.", "Διέγραψε μια εγγραφή από το σύστημα αρχείων."),
    mechanics: both("rm removes the named file. Recursive options can remove directory trees, so verify every path before using them.", "Το rm αφαιρεί το αρχείο. Οι recursive επιλογές αφαιρούν ολόκληρα δέντρα φακέλων, έλεγχε πάντα τη διαδρομή."),
    output: both("A silent result usually means removal succeeded; check with ls. Deleted data is not moved to a recycle bin.", "Η απουσία εξόδου συνήθως δηλώνει επιτυχημένη διαγραφή, επιβεβαίωσε με ls. Τα διαγραμμένα δεδομένα δεν μεταφέρονται σε κάδο ανακύκλωσης."),
    syntax: "rm FILE", example: "rm practice-copy.txt", caution: both("Destructive operation. The sandbox is resettable; real files may not be.", "Καταστροφική ενέργεια. Το sandbox επαναφέρεται, τα πραγματικά αρχεία ίσως όχι."),
  },
  {
    key: "rmdir", aliases: ["rmdir"], title: both("Remove an empty directory", "Αφαίρεση κενού φακέλου"),
    purpose: both("Remove a directory only when it contains no files.", "Αφαίρεσε φάκελο μόνο όταν είναι άδειος."),
    mechanics: both("rmdir refuses non-empty directories. That guard helps prevent accidental recursive deletion.", "Το rmdir αρνείται μη άδειους φακέλους. Έτσι αποφεύγεται τυχαία recursive διαγραφή."),
    output: both("No output means the empty directory was removed. If it contains entries, the command reports that it is not empty.", "Αν δεν εμφανιστεί έξοδος, ο κενός φάκελος αφαιρέθηκε. Αν ο φάκελος έχει περιεχόμενο, η εντολή αναφέρει ότι δεν είναι άδειος."),
    syntax: "rmdir DIRECTORY", example: "rmdir empty-folder",
  },
  {
    key: "nl", aliases: ["nl"], title: both("Number lines", "Αρίθμηση γραμμών"),
    purpose: both("Display text with line numbers for reference.", "Εμφάνισε κείμενο με αριθμούς γραμμών."),
    mechanics: both("nl prefixes each input line with a line number. It is a view operation and does not edit the file.", "Το nl βάζει αριθμό πριν από κάθε γραμμή. Δεν τροποποιεί το αρχείο."),
    output: both("The numbers help identify a particular line when discussing configuration or code.", "Οι αριθμοί βοηθούν να εντοπιστεί συγκεκριμένη γραμμή σε ρυθμίσεις ή κώδικα."),
    syntax: "nl FILE", example: "nl /etc/hosts",
  },
  {
    key: "sed", aliases: ["sed"], title: both("Transform text with sed", "Μετασχηματισμός κειμένου με sed"),
    purpose: both("Search and transform text streams.", "Αναζήτησε και μετασχημάτισε ροές κειμένου."),
    mechanics: both("The s/OLD/NEW/g expression substitutes OLD with NEW; g means every occurrence on a line. Unless redirected, sed prints transformed output and leaves the source file unchanged.", "Η έκφραση s/OLD/NEW/g αντικαθιστά το OLD με NEW, το g δηλώνει όλες τις εμφανίσεις μέσα στη γραμμή. Χωρίς ανακατεύθυνση, το αρχικό αρχείο δεν αλλάζει."),
    output: both("The displayed text is the transformed stream. Redirect to a new file if you need to save a copy.", "Το κείμενο που εμφανίζεται είναι η μετασχηματισμένη ροή. Κατεύθυνε την έξοδο σε νέο αρχείο (redirect) για αποθήκευση."),
    syntax: "sed 's/OLD/NEW/g' FILE", example: "sed 's/WWW/www/g' gamehack.in",
  },
  {
    key: "more", aliases: ["more"], title: both("Page through a file", "Σελιδοποίηση αρχείου"),
    purpose: both("Read a long file a page at a time.", "Διάβασε μεγάλο αρχείο σε σελίδες."),
    mechanics: both("more is a pager. On a real terminal, Enter advances and q exits. This simulator prints a text preview.", "Το more είναι pager. Σε πραγματικό terminal το Enter προχωρά και το q βγαίνει. Ο προσομοιωτής εμφανίζει preview."),
    output: both("The lines come from the requested file; they are not a status report.", "Οι γραμμές προέρχονται από το αρχείο, όχι από αναφορά κατάστασης."),
    syntax: "more FILE", example: "more /etc/ettercap/etter.dns",
  },
  {
    key: "less", aliases: ["less"], title: both("Browse and search text", "Περιήγηση και αναζήτηση κειμένου"),
    purpose: both("Navigate through text and search within it.", "Περιηγήσου σε κείμενο και αναζήτησέ το."),
    mechanics: both("less is an interactive pager. In a real terminal, /word searches and q exits. This simulator prints a preview instead of opening an interactive TTY.", "Το less είναι διαδραστικό pager. Σε πραγματικό terminal το /λέξη ψάχνει και το q βγαίνει. Ο προσομοιωτής δείχνει preview."),
    output: both("The shown text is the file preview; search controls are described here but not attached to a live TTY.", "Το κείμενο είναι preview αρχείου, τα πλήκτρα αναζήτησης δεν συνδέονται με πραγματικό TTY."),
    syntax: "less FILE", example: "less /etc/ettercap/etter.dns",
  },
  {
    key: "chmod", aliases: ["chmod"], title: both("Change permission bits", "Αλλαγή bits δικαιωμάτων"),
    purpose: both("Grant or remove read, write, and execute permission.", "Δώσε ή αφαίρεσε δικαιώματα ανάγνωσης, εγγραφής και εκτέλεσης."),
    mechanics: both("Numeric digits encode owner/group/other: read=4, write=2, execute=1. +x adds execute. A leading 4 sets SUID; a leading 2 sets SGID.", "Τα αριθμητικά ψηφία κωδικοποιούν owner/group/other: read=4, write=2, execute=1. Το +x προσθέτει εκτέλεση. Αρχικό 4 θέτει SUID, αρχικό 2 SGID."),
    output: both("chmod is normally silent. Verify the resulting mode with ls -l. Avoid 777: it grants everyone every permission.", "Η εντολή chmod συνήθως δεν εμφανίζει κάποιο μήνυμα. Έλεγξε τη νέα λειτουργία (mode) με ls -l. Απόφυγε το 777: παραχωρεί όλα τα δικαιώματα σε όλους."),
    syntax: "chmod MODE FILE", example: "chmod 640 notes.txt", caution: both("Overly broad or special permissions can expose data or create privilege risks.", "Υπερβολικά ανοιχτά ή special permissions εκθέτουν δεδομένα και αυξάνουν τον κίνδυνο προνομίων."),
  },
  {
    key: "chown", aliases: ["chown"], title: both("Change file owner", "Αλλαγή ιδιοκτήτη αρχείου"),
    purpose: both("Transfer ownership to a user account.", "Μετέφερε την ιδιοκτησία σε λογαριασμό χρήστη."),
    mechanics: both("chown updates the owner metadata on the named file. On real systems it usually requires root or equivalent authorization.", "Το chown αλλάζει τα μεταδεδομένα ιδιοκτήτη. Σε πραγματικά συστήματα συνήθως απαιτεί root ή αντίστοιχη εξουσιοδότηση."),
    output: both("Success is usually silent. Run ls -l to inspect the owner column.", "Η επιτυχημένη εκτέλεση συνήθως δεν εμφανίζει μήνυμα. Εκτέλεσε ls -l για να ελέγξεις τη στήλη του ιδιοκτήτη."),
    syntax: "chown USER FILE", example: "chown Raj gamehack.txt",
  },
  {
    key: "chgrp", aliases: ["chgrp"], title: both("Change file group", "Αλλαγή ομάδας αρχείου"),
    purpose: both("Assign a file to a group for shared access control.", "Ανάθεσε αρχείο σε ομάδα για κοινό έλεγχο πρόσβασης."),
    mechanics: both("chgrp changes the group metadata; it does not change the file's content.", "Το chgrp αλλάζει τα μεταδεδομένα ομάδας, όχι το περιεχόμενο."),
    output: both("Success is normally silent. Use ls -l to confirm the group column.", "Η επιτυχημένη εκτέλεση συνήθως δεν εμφανίζει μήνυμα. Επιβεβαίωσε τη στήλη της ομάδας με ls -l."),
    syntax: "chgrp GROUP FILE", example: "chgrp ignite gamehack.txt",
  },
  {
    key: "apt-cache", aliases: ["apt-cache"], title: both("Search package metadata", "Αναζήτηση μεταδεδομένων πακέτων"),
    purpose: both("Check the configured package index before installing software.", "Έλεγξε το ευρετήριο πακέτων πριν εγκαταστήσεις λογισμικό."),
    mechanics: both("apt-cache search matches package names and descriptions in the local package index and lists one candidate row per match, each with a short description.", "Το apt-cache search ταιριάζει ονόματα και περιγραφές στο τοπικό ευρετήριο και εμφανίζει μία γραμμή ανά ταίριασμα, με σύντομη περιγραφή."),
    output: both("Each result is a package candidate and short description; availability depends on configured repositories.", "Κάθε αποτέλεσμα είναι υποψήφιο πακέτο με σύντομη περιγραφή, η διαθεσιμότητα εξαρτάται από τα repositories."),
    syntax: "apt-cache search KEYWORD", example: "apt-cache search git",
  },
  {
    key: "apt-get", aliases: ["apt-get", "apt"], title: both("Manage Debian packages", "Διαχείριση Debian πακέτων"),
    purpose: both("Install, remove, or refresh package information in Debian-based systems.", "Εγκατέστησε, αφαίρεσε ή ανανέωσε πακέτα σε Debian-based συστήματα."),
    mechanics: both("update refreshes package indexes; upgrade applies available updates; install adds a package; remove uninstalls it; purge also removes package configuration. This lab aborts removals safely.", "Το update ανανεώνει indexes, το upgrade εφαρμόζει ενημερώσεις, το install προσθέτει πακέτο, το remove το αφαιρεί και το purge καθαρίζει ρυθμίσεις. Το lab ακυρώνει με ασφάλεια τις αφαιρέσεις."),
    output: both("Read the package names and summary before confirming. In this simulator, installation and update results are illustrative and do not contact a repository.", "Διάβασε τα ονόματα πακέτων και τη σύνοψη πριν επιβεβαιώσεις. Ο προσομοιωτής δεν επικοινωνεί με repository."),
    syntax: "apt-get ACTION [PACKAGE]", example: "apt-get install git", caution: both("Package installs can alter a real system. This implementation is simulation-only.", "Η εγκατάσταση πακέτων αλλάζει πραγματικό σύστημα. Αυτή η υλοποίηση είναι μόνο προσομοίωση."),
  },
  {
    key: "ifconfig", aliases: ["ifconfig"], title: both("Inspect network interfaces", "Έλεγχος διεπαφών δικτύου"),
    purpose: both("Review local IP, netmask, broadcast, MAC, and link state.", "Έλεγξε τοπική IP, netmask, broadcast, MAC και κατάσταση σύνδεσης."),
    mechanics: both("ifconfig reports interface configuration. In this lab, eth0 and loopback are simulated.", "Το ifconfig εμφανίζει ρυθμίσεις διεπαφών. Εδώ τα eth0 και loopback είναι προσομοιωμένα."),
    output: both("inet is an IPv4 address, netmask defines the subnet, broadcast is the subnet broadcast, and ether is a MAC address.", "Το inet είναι διεύθυνση IPv4, το netmask ορίζει το υποδίκτυο, το broadcast είναι η διεύθυνση εκπομπής του υποδικτύου και το ether είναι η διεύθυνση MAC."),
    syntax: "ifconfig [INTERFACE]", example: "ifconfig",
  },
  {
    key: "iwconfig", aliases: ["iwconfig"], title: both("Inspect wireless interfaces", "Έλεγχος ασύρματων διεπαφών"),
    purpose: both("View wireless adapter mode and association details.", "Δες λειτουργία και σύνδεση ασύρματου adapter."),
    mechanics: both("iwconfig shows wireless settings such as ESSID and mode. Wired interfaces report that they have no wireless extensions.", "Η εντολή iwconfig εμφανίζει το ESSID και τη λειτουργία (mode). Οι ενσύρματες διεπαφές αναφέρουν ότι δεν διαθέτουν ασύρματες επεκτάσεις."),
    output: both("No wireless extensions is an informative result: that interface is not a wireless adapter.", "Το no wireless extensions είναι πληροφορία: η διεπαφή δεν είναι ασύρματος adapter."),
    syntax: "iwconfig", example: "iwconfig",
  },
  {
    key: "dhclient", aliases: ["dhclient"], title: both("Request a DHCP lease", "Αίτημα DHCP lease"),
    purpose: both("Request an automatically assigned network address.", "Ζήτησε αυτόματα εκχωρημένη διεύθυνση δικτύου."),
    mechanics: both("dhclient sends a DHCP request for an interface. Here the DHCP exchange is mocked and updates only the virtual interface.", "Το dhclient στέλνει αίτημα DHCP για διεπαφή. Εδώ η ανταλλαγή είναι εικονική και αλλάζει μόνο τη virtual interface."),
    output: both("DHCPREQUEST is the request; bound to ... means the simulator assigned a lease address.", "Το DHCPREQUEST είναι το αίτημα, το μήνυμα bound to ... δηλώνει ότι ο προσομοιωτής απέδωσε μια διεύθυνση lease."),
    syntax: "dhclient INTERFACE", example: "dhclient eth0", caution: both("The simulated lease cannot change your real network settings.", "Το εικονικό lease δεν αλλάζει ρυθμίσεις πραγματικού δικτύου."),
  },
  {
    key: "dig", aliases: ["dig"], title: both("Query DNS records", "Ερώτημα εγγραφών DNS"),
    purpose: both("Ask DNS for a name's address or mail/name-server records.", "Ρώτησε DNS για διεύθυνση ή εγγραφές mail/name-server."),
    mechanics: both("A is the address record; MX identifies mail exchangers; NS identifies authoritative name servers. GameHack resolves only lab names.", "Η εγγραφή A δηλώνει διεύθυνση, η MX τους διακομιστές αλληλογραφίας (mail exchangers) και η NS τους διακομιστές ονομάτων. Το GameHack επιλύει μόνο ονόματα του εργαστηρίου."),
    output: both("The ANSWER SECTION shows the returned record and value. A record maps a name to an IP address.", "Η ενότητα ANSWER SECTION εμφανίζει την εγγραφή και την τιμή της. Η εγγραφή A αντιστοιχίζει ένα όνομα σε διεύθυνση IP."),
    syntax: "dig NAME [A|MX|NS]", example: "dig gamehack.lab mx",
  },
  {
    key: "ip", aliases: ["ip"], title: both("Inspect network configuration", "Έλεγχος ρυθμίσεων δικτύου"),
    purpose: both("Inspect interfaces and addresses with the modern ip utility.", "Έλεγξε διεπαφές και διευθύνσεις με το σύγχρονο ip."),
    mechanics: both("ip addr is the modern counterpart for interface/address inspection. This simulation prints the lab's virtual interface summary.", "Το ip addr είναι σύγχρονος τρόπος ελέγχου διεπαφών/διευθύνσεων. Η προσομοίωση εμφανίζει την εικονική διεπαφή."),
    output: both("Look for interface names and inet address lines to identify local addressing.", "Αναζήτησε ονόματα διεπαφών και γραμμές inet για τοπικές διευθύνσεις."),
    syntax: "ip addr", example: "ip addr",
  },
  {
    key: "ping", aliases: ["ping"], title: both("Test basic reachability", "Έλεγχος βασικής προσβασιμότητας"),
    purpose: both("Send simulated ICMP echo requests to an authorized lab host.", "Στείλε προσομοιωμένα αιτήματα ICMP echo σε εξουσιοδοτημένο σύστημα του εργαστηρίου."),
    mechanics: both("ping sends ICMP echo requests. A real host may block ICMP while still being online; this lab always returns a safe simulated response.", "Η εντολή ping στέλνει αιτήματα ICMP echo. Ένα πραγματικό σύστημα μπορεί να αποκλείει το ICMP ενώ είναι σε λειτουργία, εδώ η απάντηση είναι εικονική."),
    output: both("Replies indicate the simulator considers the host reachable; packet loss summarizes unanswered requests.", "Οι απαντήσεις δηλώνουν ότι ο προσομοιωτής θεωρεί τον host προσβάσιμο, το packet loss συνοψίζει αναπάντητα αιτήματα."),
    syntax: "ping HOST", example: "ping 10.10.10.5", caution: both("Only probe systems within written authorization. The lab target is simulated.", "Έλεγχε μόνο συστήματα με γραπτή άδεια. Ο στόχος lab είναι εικονικός."),
  },
  {
    key: "nmap", aliases: ["nmap"], title: both("Inventory authorized lab hosts", "Απογραφή εξουσιοδοτημένων hosts"),
    purpose: both("Learn how to read a host or service report before you change anything.", "Μάθε να διαβάζεις αναφορά host ή υπηρεσίας πριν αλλάξεις οτιδήποτε."),
    mechanics: both("GameHack returns a canned report for lab addresses only. A single address lists that host's fictional ports. A /24 asks which of the four lab hosts answer. -sV adds the version column. --script ssh-auth-methods answers only for 10.10.10.12 and prints publickey and password as the weak starting policy.", "Το GameHack επιστρέφει έτοιμη αναφορά μόνο για διευθύνσεις του εργαστηρίου. Μια μοναδική διεύθυνση εμφανίζει τις φανταστικές θύρες εκείνου του host. Ένα /24 ρωτά ποιοι από τους τέσσερις hosts απαντούν. Το -sV προσθέτει τη στήλη έκδοσης. Το --script ssh-auth-methods απαντά μόνο για το 10.10.10.12 και τυπώνει publickey και password ως την αδύναμη αρχική πολιτική."),
    output: both("Host is up means the simulator answered. PORT, STATE, and SERVICE describe the fictional services. A version string is a clue to look up in an advisory list, not a licence to attack. The report is not a live internet finding.", "Το Host is up σημαίνει ότι απάντησε ο προσομοιωτής. Τα PORT, STATE και SERVICE περιγράφουν τις φανταστικές υπηρεσίες. Μια συμβολοσειρά έκδοσης είναι ένδειξη για αναζήτηση σε λίστα συμβουλών, όχι άδεια επίθεσης. Η αναφορά δεν είναι εύρημα ζωντανού διαδικτύου."),
    syntax: "nmap [OPTIONS] TARGET", example: "nmap -sV 10.10.10.5", caution: both("Scanning without permission can be illegal and disruptive. This command never sends packets outside the sandbox.", "Η σάρωση χωρίς άδεια μπορεί να είναι παράνομη και να προκαλέσει προβλήματα. Η εντολή δεν στέλνει πακέτα εκτός sandbox."),
  },
  {
    key: "curl", aliases: ["curl", "wget"], title: both("Fetch a URL", "Λήψη URL"),
    purpose: both("Request a web resource and inspect its response.", "Ζήτησε web πόρο και έλεγξε την απόκριση."),
    mechanics: both("curl makes an HTTP request. This simulator returns canned pages for local lab hosts and localhost only.", "Η εντολή curl πραγματοποιεί ένα αίτημα HTTP. Ο προσομοιωτής επιστρέφει προκαθορισμένες σελίδες μόνο για το localhost και τα συστήματα του εργαστηρίου."),
    output: both("HTML/text is the response body. Headers and status codes are omitted in this beginner simulation.", "HTML/κείμενο είναι το σώμα απόκρισης. Headers και status codes παραλείπονται στην beginner προσομοίωση."),
    syntax: "curl URL", example: "curl http://localhost", caution: both("Use only the sandbox URLs provided by the lab.", "Χρησιμοποίησε μόνο URL sandbox που δίνει το lab."),
  },
  {
    key: "ps", aliases: ["ps"], title: both("List running processes", "Λίστα διεργασιών"),
    purpose: both("Inspect currently running programs and their process IDs.", "Έλεγξε προγράμματα που εκτελούνται και τα process IDs."),
    mechanics: both("ps shows a process snapshot. ps aux includes processes from all users and columns such as PID, CPU, memory, and command.", "Το ps εμφανίζει στιγμιότυπο διεργασιών. Το ps aux περιλαμβάνει όλους τους χρήστες και στήλες PID, CPU, μνήμη και εντολή."),
    output: both("Each row is one running process. PID identifies it for tools such as renice and kill.", "Κάθε γραμμή αντιστοιχεί σε μία διεργασία. Το PID την προσδιορίζει για εργαλεία όπως τα renice και kill."),
    syntax: "ps [aux]", example: "ps aux | grep cron",
  },
  {
    key: "top", aliases: ["top"], title: both("Monitor process resources", "Παρακολούθηση πόρων διεργασιών"),
    purpose: both("Find processes consuming the most CPU or memory.", "Βρες διεργασίες που καταναλώνουν CPU ή μνήμη."),
    mechanics: both("top normally refreshes continuously; the simulator prints one snapshot ordered by CPU use.", "Η εντολή top συνήθως ανανεώνεται συνεχώς, ο προσομοιωτής εμφανίζει ένα στιγμιότυπο ταξινομημένο κατά CPU."),
    output: both("Compare %CPU and %MEM columns to spot unusual resource use; high usage alone is not proof of malicious activity.", "Σύγκρινε %CPU και %MEM για ασυνήθιστη χρήση, υψηλή χρήση μόνη της δεν αποδεικνύει κακόβουλη δραστηριότητα."),
    syntax: "top", example: "top",
  },
  {
    key: "nice", aliases: ["nice"], title: both("Start with a scheduling priority", "Εκκίνηση με προτεραιότητα scheduler"),
    purpose: both("Adjust a new process's niceness to share CPU fairly.", "Ρύθμισε niceness νέας διεργασίας για δίκαιη χρήση CPU."),
    mechanics: both("nice launches a command with a scheduling niceness value. Linux niceness ranges from -20 (higher priority) to 19 (lower priority).", "Το nice ξεκινά εντολή με τιμή niceness. Στο Linux η κλίμακα είναι -20 (υψηλή προτεραιότητα) έως 19 (χαμηλή)."),
    output: both("The lab confirms a simulated launch; it does not start a real background process.", "Το lab επιβεβαιώνει εικονική εκκίνηση, δεν ξεκινά πραγματική διεργασία."),
    syntax: "nice -n VALUE COMMAND", example: "nice -n 10 sleep 10",
  },
  {
    key: "renice", aliases: ["renice"], title: both("Change a process priority", "Αλλαγή προτεραιότητας διεργασίας"),
    purpose: both("Adjust the niceness of an existing process by PID.", "Άλλαξε niceness υπάρχουσας διεργασίας με PID."),
    mechanics: both("renice sets a niceness value on a process ID. Linux values range from -20 (highest scheduling priority) to 19 (lowest); a more positive value means lower priority. Setting negative values may require privileges.", "Η renice ορίζει τιμή niceness για ένα PID. Στο Linux οι τιμές κυμαίνονται από -20 (υψηλότερη προτεραιότητα scheduler) έως 19 (χαμηλότερη), όσο πιο θετική είναι η τιμή, τόσο χαμηλότερη η προτεραιότητα. Οι αρνητικές τιμές μπορεί να απαιτούν δικαιώματα."),
    output: both("The old and new priority show the scheduler setting that changed.", "Η παλιά και νέα προτεραιότητα δείχνουν τη ρύθμιση που άλλαξε."),
    syntax: "renice VALUE PID", example: "renice 10 6242",
  },
  {
    key: "kill", aliases: ["kill"], title: both("Signal a process", "Αποστολή σήματος σε διεργασία"),
    purpose: both("Ask a process to stop or send a stronger termination signal.", "Ζήτησε από διεργασία να σταματήσει ή στείλε ισχυρότερο σήμα."),
    mechanics: both("kill sends a signal to a PID. SIGTERM (15) requests a normal shutdown; SIGHUP (1) reports a hangup and some programs use it to reload configuration, so it is not a universal gentle-stop signal. SIGKILL (9) forces termination without cleanup.", "Η kill στέλνει σήμα σε PID. Το SIGTERM (15) ζητά κανονικό τερματισμό, το SIGHUP (1) δηλώνει απώλεια σύνδεσης και ορισμένα προγράμματα το χρησιμοποιούν για επαναφόρτωση ρυθμίσεων, άρα δεν είναι καθολικό ήπιο σήμα. Το SIGKILL (9) επιβάλλει τερματισμό χωρίς καθαρισμό."),
    output: both("The simulator records SIGHUP and may leave the process running; SIGTERM and SIGKILL stop a selected fictional process. Verify a PID before signalling a real process.", "Ο προσομοιωτής καταγράφει το SIGHUP και μπορεί να αφήσει τη διεργασία ενεργή, τα SIGTERM και SIGKILL σταματούν την επιλεγμένη εικονική διεργασία. Επιβεβαίωσε το PID πριν στείλεις σήμα σε πραγματική διεργασία."),
    syntax: "kill [-SIGNAL] PID", example: "kill -1 6242", caution: both("Killing the wrong PID can interrupt important work. This lab uses fake processes.", "Ένα λανθασμένο PID μπορεί να διακόψει σημαντική εργασία. Το εργαστήριο χρησιμοποιεί εικονικές διεργασίες."),
  },
  {
    key: "jobs", aliases: ["jobs"], title: both("List shell background jobs", "Λίστα jobs παρασκηνίου"),
    purpose: both("See commands started in the background by this shell.", "Δες εντολές που ξεκίνησαν στο παρασκήνιο από αυτό το shell."),
    mechanics: both("Appending & to a command backgrounds it. jobs lists those shell-managed jobs.", "Το & στο τέλος βάζει εντολή στο παρασκήνιο. Το jobs εμφανίζει τα shell jobs."),
    output: both("A job number and state identify each listed command. An empty list means no shell jobs are recorded.", "Ο αριθμός εργασίας και η κατάστασή της χαρακτηρίζουν κάθε εντολή. Η κενή λίστα δηλώνει ότι δεν έχουν καταγραφεί εργασίες παρασκηνίου."),
    syntax: "jobs", example: "jobs",
  },
  {
    key: "fg", aliases: ["fg"], title: both("Bring a job to the foreground", "Μεταφορά job στο προσκήνιο"),
    purpose: both("Resume interacting with a shell job in the foreground.", "Συνέχισε την αλληλεπίδραση με shell job στο προσκήνιο."),
    mechanics: both("fg brings the current background job, or a selected job, back to the terminal foreground.", "Το fg επαναφέρει το τρέχον background job στο terminal foreground."),
    output: both("The job's command is shown in this simulation. A real shell would attach your terminal to the running job.", "Ο προσομοιωτής δείχνει την εντολή job. Πραγματικό shell συνδέει το terminal στη διεργασία."),
    syntax: "fg [JOB]", example: "fg",
  },
  {
    key: "at", aliases: ["at"], title: both("Schedule a one-time job", "Προγραμματισμός εφάπαξ εργασίας"),
    purpose: both("Queue a command to run once at a future time.", "Προγραμμάτισε μια εντολή ώστε να εκτελεστεί μία φορά στο μέλλον."),
    mechanics: both("A real interactive at prompt accepts a time first and then reads commands until Ctrl-D. In this lab you can queue one command on the same line, as in at 21:30 /root/scanning_script.sh, or enter at 21:30 and type one command on the next line. Both forms only record a per-player job; repeating schedules are normally handled by cron.", "Σε πραγματικό διαδραστικό prompt, η at δέχεται πρώτα ώρα και μετά διαβάζει εντολές μέχρι το Ctrl-D. Εδώ μπορείς να καταχωρίσεις μία εντολή στην ίδια γραμμή, όπως στο at 21:30 /root/scanning_script.sh, ή να γράψεις at 21:30 και την εντολή στην επόμενη γραμμή. Και οι δύο μορφές αποθηκεύουν μόνο εικονική εργασία του παίκτη, οι επαναλαμβανόμενες εργασίες συνήθως ανήκουν στο cron."),
    output: both("The simulator stores a per-player queue entry as a VFS-backed training record. It never runs the command later or schedules work on the host.", "Ο προσομοιωτής αποθηκεύει εγγραφή στην προσωπική εικονική ουρά εκπαίδευσης. Δεν εκτελεί αργότερα την εντολή ούτε προγραμματίζει εργασία στο σύστημα υποδοχής."),
    syntax: "at TIME COMMAND", example: "at 21:30 /root/scanning_script.sh",
  },
  {
    key: "env", aliases: ["env", "set", "histsize="], title: both("Inspect shell variables", "Έλεγχος μεταβλητών shell"),
    purpose: both("Inspect environment or shell variables available to the current session.", "Έλεγξε μεταβλητές περιβάλλοντος ή shell της τρέχουσας συνεδρίας."),
    mechanics: both("env lists exported environment variables. set in Bash also shows shell variables (and, in a real shell, functions). Pipe the output to grep to narrow the list.", "Η env εμφανίζει exported μεταβλητές περιβάλλοντος. Η set στο Bash δείχνει και μεταβλητές του shell (και συναρτήσεις σε πραγματικό shell). Με pipe προς grep περιορίζεις τη λίστα."),
    output: both("env shows exported KEY=value rows; set also shows shell-only values. A shell variable is not inherited by child commands until exported.", "Η εντολή env εμφανίζει εξαγμένες (exported) γραμμές KEY=value, η set εμφανίζει και τιμές που υπάρχουν μόνο στο shell. Μια μεταβλητή του shell δεν κληρονομείται από τις εντολές-παιδιά αν δεν γίνει export."),
    syntax: "env | grep NAME", example: "set | grep HISTSIZE",
  },
  {
    key: "export", aliases: ["export"], title: both("Export a variable", "Export μεταβλητής"),
    purpose: both("Make a shell variable available to child processes.", "Κάνε μια μεταβλητή του shell διαθέσιμη στις διεργασίες-παιδιά (child processes)."),
    mechanics: both("An assignment such as NAME=value creates a shell variable. export NAME marks it for inheritance by child commands in this session.", "Η ανάθεση NAME=value δημιουργεί μια μεταβλητή του shell. Η εντολή export NAME επιτρέπει την κληρονομικότητά της από τις εντολές-παιδιά σε αυτή τη συνεδρία."),
    output: both("The simulator confirms the value it exported for this virtual shell. Export affects this shell and its child commands; it is not a system-wide or permanent setting.", "Ο προσομοιωτής επιβεβαιώνει την τιμή που εξήχθη (export) στο εικονικό shell. Το export ισχύει για αυτό το shell και τις εντολές-παιδιά του, δεν είναι καθολική ή μόνιμη ρύθμιση."),
    syntax: "export NAME", example: "export HISTSIZE",
  },
  {
    key: "unset", aliases: ["unset"], title: both("Remove a shell variable", "Αφαίρεση shell variable"),
    purpose: both("Delete a named variable from the current shell environment.", "Διέγραψε μεταβλητή από το τρέχον shell."),
    mechanics: both("unset removes the variable binding. It does not delete a file with the same name.", "Το unset αφαιρεί τη μεταβλητή. Δεν διαγράφει αρχείο με ίδιο όνομα."),
    output: both("The simulator confirms removal; echo $NAME afterwards expands to an empty value. unset removes the variable, not a file.", "Ο προσομοιωτής επιβεβαιώνει την αφαίρεση, μετά το unset, το echo $NAME εμφανίζει κενή τιμή. Η unset αφαιρεί τη μεταβλητή, όχι κάποιο αρχείο."),
    syntax: "unset NAME", example: "unset url_variable",
  },
  {
    key: "service", aliases: ["service"], title: both("Manage a service", "Διαχείριση υπηρεσίας"),
    purpose: both("Inspect or change the state of a background service.", "Έλεγξε ή άλλαξε κατάσταση υπηρεσίας παρασκηνίου."),
    mechanics: both("Common actions are status, start, stop, and restart. GameHack updates only an in-memory service state.", "Συνήθεις ενέργειες: status, start, stop, restart. Το GameHack αλλάζει μόνο εικονική κατάσταση υπηρεσίας."),
    output: both("status reports active/running or stopped/inactive. start/stop messages confirm a simulated transition.", "Η ενέργεια status αναφέρει running ή stopped. Τα μηνύματα start/stop επιβεβαιώνουν μια εικονική μετάβαση κατάστασης."),
    syntax: "service NAME status|start|stop|restart", example: "service apache2 status", caution: both("The service commands in GameHack do not start daemons on your computer.", "Οι service εντολές του GameHack δεν ξεκινούν daemon στον υπολογιστή σου."),
  },
  {
    key: "crontab", aliases: ["crontab"], title: both("Edit or list scheduled jobs", "Επεξεργασία προγραμματισμένων εργασιών"),
    purpose: both("Manage recurring commands for the current account.", "Διαχειρίσου επαναλαμβανόμενες εντολές του λογαριασμού."),
    mechanics: both("crontab -e opens a simulated editor choice (enter 1 for nano) and crontab -l lists the current user's table. In this line-based lab, echo a line into crontab - to record it without editor keystrokes. A per-user entry has five schedule fields—minute, hour, day-of-month, month, day-of-week—then the command; /etc/crontab adds a sixth username column before the command.", "Το crontab -e εμφανίζει εικονική επιλογή editor (γράψε 1 για nano) και το crontab -l εμφανίζει τον πίνακα του χρήστη. Σε αυτό το εργαστήριο, στείλε μια γραμμή με echo και pipe στο crontab - για να την καταχωρίσεις χωρίς πλήκτρα editor. Μια προσωπική εγγραφή έχει πέντε πεδία χρόνου—λεπτό, ώρα, ημέρα μήνα, μήνα, ημέρα εβδομάδας—και μετά την εντολή, το /etc/crontab προσθέτει έκτη στήλη χρήστη πριν από την εντολή."),
    output: both("The simulator updates only the per-player virtual crontab and prints its entry when listed. It never launches the scheduled command; inspect scripts in the VFS before recording them.", "Ο προσομοιωτής αλλάζει μόνο το προσωπικό εικονικό crontab και εμφανίζει την εγγραφή όταν τη ζητήσεις. Δεν εκκινεί την προγραμματισμένη εντολή, έλεγξε τα scripts στο VFS πριν τα καταγράψεις."),
    syntax: "crontab -e | crontab -l | echo ENTRY | crontab -", example: 'echo "55 23 * * * /root/scanner" | crontab -',
  },
  {
    key: "update-rc.d", aliases: ["update-rc.d"], title: both("Configure boot services", "Ρύθμιση υπηρεσιών εκκίνησης"),
    purpose: both("Learn how a service can be enabled to start at boot.", "Μάθε πώς μια υπηρεσία ενεργοποιείται στην εκκίνηση."),
    mechanics: both("update-rc.d configures legacy SysV init links. defaults and enable create start links for the default multi-user runlevels; disable records that the service must not autostart; remove deletes the links without uninstalling the service. GameHack stores those links in the player's virtual /etc/rcN.d folders and changes no host boot configuration.", "Η update-rc.d ρυθμίζει παλιούς συνδέσμους SysV init. Τα defaults και enable δημιουργούν start links για τα προεπιλεγμένα multi-user runlevels, το disable δηλώνει ότι η υπηρεσία δεν πρέπει να ξεκινά αυτόματα και το remove διαγράφει τους links χωρίς απεγκατάσταση. Το GameHack αποθηκεύει τους συνδέσμους στους εικονικούς φακέλους /etc/rcN.d του παίκτη και δεν αλλάζει την εκκίνηση του host."),
    output: both("The confirmation names the virtual service action. A simulated reboot applies enabled/disabled settings only to the player's service state.", "Η επιβεβαίωση αναφέρει την ενέργεια στην εικονική υπηρεσία. Το προσομοιωμένο reboot εφαρμόζει τη ρύθμιση μόνο στην κατάσταση του παίκτη."),
    syntax: "update-rc.d SERVICE defaults|enable|disable|remove", example: "update-rc.d mysql defaults",
  },
  {
    key: "reboot", aliases: ["reboot"], title: both("Simulate a boot cycle", "Προσομοίωση κύκλου εκκίνησης"),
    purpose: both("See which virtual services were marked to start at boot.", "Δες ποιες εικονικές υπηρεσίες έχουν δηλωθεί για εκκίνηση."),
    mechanics: both("On a real system reboot restarts the operating system and can interrupt work. In GameHack it only applies the player's saved update-rc.d settings and refreshes virtual service/process state.", "Σε πραγματικό σύστημα το reboot επανεκκινεί το λειτουργικό και μπορεί να διακόψει εργασίες. Στο GameHack εφαρμόζει μόνο τις αποθηκευμένες ρυθμίσεις update-rc.d και ενημερώνει εικονική κατάσταση υπηρεσιών/διεργασιών."),
    output: both("A summary lists the virtual services brought up. The VFS syslog gets a simulated note; the host OS, host processes, and real files are untouched.", "Η σύνοψη εμφανίζει τις εικονικές υπηρεσίες που ξεκίνησαν. Το VFS syslog λαμβάνει εικονική εγγραφή, λειτουργικό, διεργασίες και αρχεία του host μένουν ανέπαφα."),
    syntax: "reboot", example: "reboot", caution: both("Do not test reboot commands on a system you do not administer. This one is a sandbox-only state transition.", "Μην δοκιμάζεις reboot σε σύστημα που δεν διαχειρίζεσαι. Αυτή η εντολή είναι μόνο εικονική μετάβαση στο sandbox."),
  },
  {
    key: "bash", aliases: ["bash", "sh", "script"], title: both("Run a shell script", "Εκτέλεση shell script"),
    purpose: both("Execute a sequence of shell instructions from a script file.", "Εκτέλεσε ακολουθία οδηγιών shell από script."),
    mechanics: both("A shebang such as #!/bin/bash selects the interpreter. ./script runs a file from the current directory and typically requires execute permission; bash script invokes bash directly.", "Shebang όπως #!/bin/bash επιλέγει interpreter. Το ./script συνήθως απαιτεί execute permission, το bash script καλεί bash απευθείας."),
    output: both("Lines printed by echo in the script appear in the terminal. This lab uses canned, safe script behavior.", "Οι γραμμές echo του script εμφανίζονται στο terminal. Το lab χρησιμοποιεί προκαθορισμένη ασφαλή συμπεριφορά."),
    syntax: "bash SCRIPT | ./SCRIPT", example: "./first_script", caution: both("Read a script before executing it, especially outside a sandbox.", "Διάβασε script πριν το εκτελέσεις, ιδίως εκτός sandbox."),
  },
  {
    key: "nano", aliases: ["nano", "vim", "vi"], title: both("Edit a text file", "Επεξεργασία αρχείου κειμένου"),
    purpose: both("Open or create a text file in a terminal editor.", "Άνοιξε ή δημιούργησε αρχείο σε terminal editor."),
    mechanics: both("nano and vim are interactive editors on a real terminal. This simulator shows a preview or creates a virtual file; keyboard editing is not implemented.", "Τα nano και vim είναι διαδραστικοί editors σε πραγματικό terminal. Εδώ εμφανίζεται preview ή δημιουργείται virtual αρχείο, η επεξεργασία πλήκτρων δεν υλοποιείται."),
    output: both("An opened-file message is a simulator notice, not proof that editor keystrokes were saved.", "Το μήνυμα ανοίγματος είναι ειδοποίηση προσομοιωτή, όχι απόδειξη αποθήκευσης πληκτρολογήσεων."),
    syntax: "nano FILE", example: "nano /etc/hosts",
  },
  {
    key: "ssh", aliases: ["ssh"], title: both("Open a secure shell session", "Άνοιγμα ασφαλούς shell"),
    purpose: both("Connect to a remote shell using the SSH protocol.", "Συνδέσου σε απομακρυσμένο shell με SSH."),
    mechanics: both("SSH encrypts the connection. The lab recognizes its named fake hosts and changes the simulated session only; for the ubuntu fixture, start the virtual ssh service first. The exit builtin restores the saved local prompt.", "Το SSH κρυπτογραφεί τη σύνδεση. Το lab αναγνωρίζει φανταστικούς hosts και αλλάζει μόνο την εικονική συνεδρία, για το ubuntu fixture ξεκίνα πρώτα την εικονική υπηρεσία ssh. Το exit επαναφέρει το αποθηκευμένο τοπικό prompt."),
    output: both("A welcome banner means the simulator accepted the lab route. Connection errors mean the host or route is not configured in the VFS.", "Το μήνυμα υποδοχής δηλώνει ότι ο προσομοιωτής αποδέχθηκε τη διαδρομή του εργαστηρίου. Το σφάλμα σύνδεσης δηλώνει ότι ο υπολογιστής ή η διαδρομή δεν υπάρχει στο εικονικό σύστημα αρχείων."),
    syntax: "ssh [OPTIONS] USER@HOST", example: "ssh labuser@10.10.10.12", caution: both("Use SSH only for systems where you have authorization. All GameHack hosts are fictional.", "Χρησιμοποίησε SSH μόνο σε συστήματα με άδεια. Όλοι οι hosts του GameHack είναι φανταστικοί."),
  },
  {
    key: "ssh-keygen", aliases: ["ssh-keygen"], title: both("Record a simulated key pair", "Καταγραφή εικονικού ζεύγους κλειδιών"),
    purpose: both("See how an administrator creates a key pair, without producing a usable private key.", "Δες πώς ένας διαχειριστής δημιουργεί ζεύγος κλειδιών, χωρίς να παραχθεί χρησιμοποιήσιμο ιδιωτικό κλειδί."),
    mechanics: both("ssh-keygen -t ed25519 asks for the key type this lab uses. The simulator records the request and prints a lab fingerprint. It does not write a key file outside the sandbox, and it does not install the public key on a server.", "Η ssh-keygen -t ed25519 ζητά τον τύπο κλειδιού που χρησιμοποιεί το εργαστήριο. Ο προσομοιωτής καταγράφει το αίτημα και τυπώνει αποτύπωμα του lab. Δεν γράφει αρχείο κλειδιού έξω από το sandbox και δεν εγκαθιστά το δημόσιο κλειδί σε server."),
    output: both("The fingerprint line is a marker that the command was accepted. It is not a credential. On a machine you administer, you would still set mode 600 and a long random passphrase before trusting the key.", "Η γραμμή αποτυπώματος είναι δείκτης ότι η εντολή έγινε δεκτή. Δεν είναι διαπιστευτήριο. Σε μηχάνημα που διαχειρίζεσαι, θα έβαζες ακόμη κατάσταση 600 και μακριά τυχαία συνθηματική φράση πριν εμπιστευτείς το κλειδί."),
    syntax: "ssh-keygen -t ed25519", example: "ssh-keygen -t ed25519", caution: both("A copied private key is enough for access if it has no passphrase. This lab does not create one you can copy out.", "Ένα αντιγραμμένο ιδιωτικό κλειδί αρκεί για πρόσβαση αν δεν έχει συνθηματική φράση. Αυτό το εργαστήριο δεν δημιουργεί κλειδί που μπορείς να αντιγράψεις έξω."),
  },
  {
    key: "printenv", aliases: ["printenv"], title: both("Print environment values", "Εμφάνιση τιμών περιβάλλοντος"),
    purpose: both("Show exported environment variables, or one named value.", "Δείξε τις εξαγμένες μεταβλητές περιβάλλοντος, ή μία ονομασμένη τιμή."),
    mechanics: both("printenv with no arguments lists exported variables. printenv NAME prints that one value. A shell variable that has not been exported does not appear.", "Το printenv χωρίς ορίσματα εμφανίζει τις εξαγμένες μεταβλητές. Το printenv NAME τυπώνει μόνο εκείνη την τιμή. Μια μεταβλητή του shell που δεν έχει γίνει export δεν εμφανίζεται."),
    output: both("A blank result for one name means the variable is unset or not exported. The list is the current simulated session, not the host operating system.", "Κενό αποτέλεσμα για ένα όνομα σημαίνει ότι η μεταβλητή δεν έχει οριστεί ή δεν έχει εξαχθεί. Η λίστα είναι η τρέχουσα εικονική συνεδρία, όχι το λειτουργικό του host."),
    syntax: "printenv [NAME]", example: "printenv HOME",
  },
  {
    key: "sandbox-report", aliases: ["sandbox-report"], title: both("Read an isolated behavior report", "Ανάγνωση αναφοράς απομονωμένης συμπεριφοράς"),
    purpose: both("Review a prepared behavior summary without executing a sample.", "Διάβασε έτοιμη σύνοψη συμπεριφοράς χωρίς να εκτελέσεις δείγμα."),
    mechanics: both("The command names a fictional evidence path. GameHack prints the stored training report for that fixture. It does not launch the file.", "Η εντολή ονομάζει μια φανταστική διαδρομή τεκμηρίου. Το GameHack τυπώνει την αποθηκευμένη αναφορά εκπαίδευσης για εκείνο το fixture. Δεν εκκινεί το αρχείο."),
    output: both("Treat each line as an observation from a controlled snapshot. A behavior note is a clue, not proof of intent or of what the file would do on another machine.", "Αντιμετώπισε κάθε γραμμή ως παρατήρηση από ελεγχόμενο στιγμιότυπο. Μια σημείωση συμπεριφοράς είναι ένδειξη, όχι απόδειξη πρόθεσης ούτε του τι θα έκανε το αρχείο σε άλλο μηχάνημα."),
    syntax: "sandbox-report PATH", example: "sandbox-report 07-malware/sample.bin", caution: both("Do not run an unknown sample to confirm a report. The lab command is read-only.", "Μην εκτελείς άγνωστο δείγμα για να επιβεβαιώσεις μια αναφορά. Η εντολή του εργαστηρίου είναι μόνο ανάγνωση."),
  },
  {
    key: "exit", aliases: ["exit"], title: both("Return from the simulated remote shell", "Επιστροφή από το εικονικό απομακρυσμένο shell"),
    purpose: both("Close the SSH training session and return to the saved local prompt.", "Κλείσε την εκπαιδευτική συνεδρία SSH και επέστρεψε στο αποθηκευμένο τοπικό prompt."),
    mechanics: both("In this lab, exit restores the user's local name, host, working directory, and scenario after the fictional ubuntu connection. It does not close the GameHack terminal or an operating-system shell on the server.", "Στο lab, το exit επαναφέρει το τοπικό όνομα χρήστη, host, φάκελο εργασίας και σενάριο μετά τη σύνδεση με το φανταστικό ubuntu. Δεν κλείνει το GameHack terminal ούτε shell του server."),
    output: both("The terminal confirms that the local prompt is active again. If no simulated remote session is open, the command returns a short notice instead.", "Το τερματικό επιβεβαιώνει ότι το τοπικό prompt είναι ξανά ενεργό. Αν δεν υπάρχει εικονική απομακρυσμένη συνεδρία, εμφανίζεται σύντομη ενημέρωση."),
    syntax: "exit", example: "exit",
  },
  {
    key: "telnet", aliases: ["telnet"], title: both("Recognize an insecure plaintext protocol", "Αναγνώριση μη ασφαλούς πρωτοκόλλου απλού κειμένου"),
    purpose: both("Understand why SSH replaced telnet for remote terminal sessions.", "Κατανόησε γιατί το SSH αντικατέστησε το telnet για απομακρυσμένα τερματικά."),
    mechanics: both("Telnet sends session data without encryption, so credentials and commands can be exposed to observers. GameHack blocks the command before connecting and prints only a safety explanation.", "Το telnet στέλνει δεδομένα χωρίς κρυπτογράφηση, οπότε credentials και εντολές μπορεί να εκτεθούν σε τρίτους. Το GameHack μπλοκάρει την εντολή πριν από σύνδεση και εμφανίζει μόνο προειδοποίηση ασφαλείας."),
    output: both("The warning is not a connection result: no socket, remote process, or network request is created.", "Η προειδοποίηση δεν είναι αποτέλεσμα σύνδεσης: δεν δημιουργείται socket, απομακρυσμένη διεργασία ή δικτυακό αίτημα."),
    syntax: "telnet HOST PORT", example: "telnet ignite@192.168.0.11 23", caution: both("Do not send credentials over plaintext telnet. Use SSH on systems you are authorized to access.", "Μην στέλνεις credentials με plaintext telnet. Χρησιμοποίησε SSH σε συστήματα όπου έχεις άδεια."),
  },
  {
    key: "ftp", aliases: ["ftp"], title: both("Transfer files with FTP", "Μεταφορά αρχείων με FTP"),
    purpose: both("Practice listing and downloading files from a simulated FTP server.", "Εξασκήσου σε λίστα και λήψη αρχείων από προσομοιωμένο FTP server."),
    mechanics: both("The only accepted host is the fictional ftp.gamehack.lab fixture; public names are blocked. Enter anonymous at both prompts, use ls and cd to navigate its /ubuntu/release tree, get FILE to copy a VFS fixture locally, and bye to close the session.", "Ο μόνος αποδεκτός host είναι το φανταστικό ftp.gamehack.lab, δημόσια ονόματα μπλοκάρονται. Γράψε anonymous και στα δύο prompts, χρησιμοποίησε ls και cd για πλοήγηση στο /ubuntu/release, get FILE για αντιγραφή fixture στο VFS και bye για κλείσιμο."),
    output: both("220/230 are greeting/login status codes, 226 indicates a completed transfer, and 221 means the session ended. The local ls after bye reads your own VFS directory.", "Τα 220/230 είναι κωδικοί υποδοχής/login, το 226 δηλώνει ολοκληρωμένη μεταφορά και το 221 κλείσιμο συνεδρίας. Η τοπική ls μετά το bye διαβάζει τον δικό σου φάκελο VFS."),
    syntax: "ftp HOST → anonymous → ls/cd → get FILE → bye", example: "ftp ftp.gamehack.lab", caution: both("FTP does not encrypt credentials. The exercise is a fake local service, not a public server.", "Το FTP δεν κρυπτογραφεί credentials. Η άσκηση είναι τοπική προσομοίωση, όχι δημόσιος server."),
  },
  {
    key: "sudo", aliases: ["sudo"], title: both("Run a command with elevated privileges", "Εκτέλεση εντολής με αυξημένα δικαιώματα"),
    purpose: both("Understand delegated administrative access and why it must be limited.", "Κατανόησε delegated πρόσβαση διαχειριστή και γιατί πρέπει να περιορίζεται."),
    mechanics: both("sudo -l lists configured grants. In this simulator, privilege demonstrations are mocked.", "Το sudo -l εμφανίζει grants. Στον προσομοιωτή οι επιδείξεις προνομίων είναι εικονικές."),
    output: both("A grant describes which command and user context are allowed. No grant or an error means the requested action was not authorized.", "Κάθε παραχώρηση περιγράφει ποια εντολή και σε ποιο πλαίσιο χρήστη επιτρέπεται. Αν δεν εμφανιστεί παραχώρηση ή προκύψει σφάλμα, η ενέργεια δεν εγκρίθηκε."),
    syntax: "sudo -l | sudo COMMAND", example: "sudo -l", caution: both("Never use privilege escalation on systems without written permission. These outcomes are simulated.", "Μην κάνεις privilege escalation σε συστήματα χωρίς γραπτή άδεια. Αυτά τα αποτελέσματα είναι εικονικά."),
  },
  {
    key: "hydra", aliases: ["hydra"], title: both("Credential testing (simulated)", "Έλεγχος διαπιστευτηρίων (προσομοίωση)"),
    purpose: both("See what a weak lab password looks like when a small training list is checked against one fictional account.", "Δες πώς φαίνεται ένας αδύναμος κωδικός του εργαστηρίου όταν ένα μικρό λεξικό εκπαίδευσης ελέγχεται σε έναν φανταστικό λογαριασμό."),
    mechanics: both("-l names one account and -P names tools/wordlist.txt. The ssh:// target must be ssh.lab or raven.lab. Any other target is rejected. The terminal prints a stored answer. It does not send authentication attempts, and it does not accept a wordlist you supply from outside the sandbox.", "Το -l ονομάζει έναν λογαριασμό και το -P το tools/wordlist.txt. Ο στόχος ssh:// πρέπει να είναι το ssh.lab ή το raven.lab. Κάθε άλλος στόχος απορρίπτεται. Το τερματικό τυπώνει αποθηκευμένη απάντηση. Δεν στέλνει απόπειρες ταυτοποίησης και δεν δέχεται λεξικό που φέρνεις από έξω από το sandbox."),
    output: both("A password row is a finding about that simulated account. It is not a technique to reuse. Close password authentication after keys work, add lockout, and alert on repeated failures.", "Μια γραμμή κωδικού είναι εύρημα για εκείνον τον εικονικό λογαριασμό. Δεν είναι τεχνική για αλλού. Κλείσε την ταυτοποίηση με κωδικό αφού δουλέψουν τα κλειδιά, βάλε κλείδωμα, και ειδοποιήσου για επανειλημμένες αποτυχίες."),
    syntax: "hydra ... (fictional lab target only)", example: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12", caution: both("Credential attacks against real accounts require explicit authorization. This implementation is a sandbox mock only.", "Οι επιθέσεις διαπιστευτηρίων σε πραγματικούς λογαριασμούς απαιτούν ρητή άδεια. Αυτή η υλοποίηση είναι μόνο προσομοίωση (sandbox)."),
  },
  {
    key: "sqlmap", aliases: ["sqlmap"], title: both("SQL injection detection (simulated)", "Ανίχνευση SQL injection (προσομοίωση)"),
    purpose: both("Show how automated testing can identify an unsafe lab parameter.", "Δείξε πώς αυτοματοποιημένος έλεγχος εντοπίζει μη ασφαλή lab parameter."),
    mechanics: both("The simulator returns a canned finding for a designated fake URL. No HTTP requests leave the browser.", "Ο προσομοιωτής επιστρέφει προκαθορισμένο εύρημα για ψεύτικο URL. Δεν φεύγει HTTP request από τον browser."),
    output: both("An injection point names a parameter; database/table rows are illustrative fake data. The defense is parameterized queries and least privilege.", "Το σημείο εισαγωγής (injection point) κατονομάζει μια παράμετρο, οι πίνακες και τα δεδομένα είναι φανταστικά. Άμυνα: παραμετροποιημένα ερωτήματα (parameterized queries) και ελάχιστα προνόμια."),
    syntax: "sqlmap -u LAB_URL", example: "sqlmap -u http://10.10.10.8/login.php?id=1", caution: both("Only test owned or explicitly authorized apps. This command is a local simulator response.", "Έλεγχε μόνο δικές σου ή ρητά εξουσιοδοτημένες εφαρμογές. Εδώ είναι τοπική προσομοίωση."),
  },
  {
    key: "submit", aliases: ["submit"], title: both("Submit a lab flag", "Υποβολή lab flag"),
    purpose: both("Record that you found a training flag.", "Κατέγραψε ότι βρήκες εκπαιδευτικό flag."),
    mechanics: both("submit validates the FLAG{...} format and records it in the virtual lab state; flags are fictional and local.", "Το submit ελέγχει τη μορφή FLAG{...} και το αποθηκεύει στην εικονική κατάσταση lab, τα flags είναι φανταστικά."),
    output: both("Flag accepted means the virtual submission was accepted. It does not submit data anywhere online.", "Το μήνυμα Flag accepted δηλώνει αποδοχή στην εικονική άσκηση, δεν στάλθηκαν δεδομένα στο διαδίκτυο."),
    syntax: "submit FLAG{...}", example: "submit FLAG{sudo_run_complete}",
  },
  {
    key: "volatility", aliases: ["volatility"], title: both("Read a tool's built-in help", "Βοήθεια ενσωματωμένου εργαλείου"),
    purpose: both("Practice discovering options before using a specialist program.", "Εξασκήσου στην εύρεση επιλογών πριν χρησιμοποιήσεις ειδικό πρόγραμμα."),
    mechanics: both("--help prints usage and option information. This lab returns a small stub, not a memory-forensics engine.", "Το --help εμφανίζει χρήση και επιλογές. Το lab επιστρέφει μικρό stub, όχι memory-forensics engine."),
    output: both("The option list describes what a real program accepts; the named plugins are placeholders in this sandbox.", "Η λίστα επιλογών περιγράφει τι δέχεται πραγματικό πρόγραμμα, τα plugins είναι placeholders στο sandbox."),
    syntax: "PROGRAM --help", example: "volatility --help",
  },
  {
    key: "clear", aliases: ["clear"], title: both("Clear the visible terminal", "Καθαρισμός ορατού terminal"),
    purpose: both("Remove old output from the screen so current work is easier to read.", "Αφαίρεσε παλιά έξοδο από την οθόνη για να διαβάζεται ευκολότερα η τρέχουσα εργασία."),
    mechanics: both("clear changes only the visible terminal buffer. It does not delete files, undo commands, or erase shell history.", "Το clear αλλάζει μόνο το ορατό buffer. Δεν σβήνει αρχεία, δεν αναιρεί εντολές και δεν διαγράφει ιστορικό."),
    output: both("There is intentionally no output: the screen itself is cleared.", "Δεν υπάρχει έξοδος επίτηδες: καθαρίζεται η ίδια η οθόνη."),
    syntax: "clear", example: "clear",
  },
  {
    key: "history", aliases: ["history"], title: both("Review command history", "Έλεγχος ιστορικού εντολών"),
    purpose: both("Recall commands entered earlier in this shell session.", "Θυμήσου εντολές που έγραψες νωρίτερα στη συνεδρία."),
    mechanics: both("history lists previously entered command lines with sequence numbers. Up/down arrows recall individual entries in this terminal.", "Το history εμφανίζει προηγούμενες γραμμές με αριθμούς. Τα βελάκια πάνω/κάτω ανακαλούν εντολές στο terminal."),
    output: both("Each row is a prior command, not a new execution. Treat history as potentially sensitive because it can contain typed arguments.", "Κάθε γραμμή είναι προηγούμενη εντολή, όχι νέα εκτέλεση. Το ιστορικό μπορεί να περιέχει ευαίσθητα ορίσματα."),
    syntax: "history", example: "history",
  },
  {
    key: "man", aliases: ["man"], title: both("Open a manual page", "Άνοιγμα manual page"),
    purpose: both("Read detailed usage and options for a command.", "Διάβασε αναλυτική χρήση και επιλογές μιας εντολής."),
    mechanics: both("man PROGRAM opens that program's manual page. Manuals are organized by sections; command help is a useful quick alternative.", "Το man PROGRAM ανοίγει το εγχειρίδιο. Τα manuals οργανώνονται σε sections, το help είναι γρήγορη εναλλακτική."),
    output: both("The headings describe the program name, usage, and options. This simulator renders a small excerpt instead of a full pager.", "Οι επικεφαλίδες περιγράφουν όνομα, χρήση και επιλογές. Ο προσομοιωτής εμφανίζει μικρό απόσπασμα αντί για πλήρες pager."),
    syntax: "man COMMAND", example: "man ls",
  },
  {
    key: "date", aliases: ["date"], title: both("Show date and time", "Εμφάνιση ημερομηνίας και ώρας"),
    purpose: both("Read the current system clock as seen by the shell.", "Δες το ρολόι συστήματος όπως το βλέπει το shell."),
    mechanics: both("date formats the machine's current date and time. It does not change the clock unless a separate privileged setting is used.", "Το date μορφοποιεί ημερομηνία και ώρα. Δεν αλλάζει το ρολόι."),
    output: both("The printed timestamp is the value returned by the simulator's local clock.", "Η χρονική σήμανση προέρχεται από το τοπικό ρολόι του προσομοιωτή."),
    syntax: "date", example: "date",
  },
  {
    key: "cut", aliases: ["cut"], title: both("Select fields from lines", "Επιλογή πεδίων από γραμμές"),
    purpose: both("Extract a chosen delimiter-separated field from text.", "Εξήγαγε πεδίο κειμένου που χωρίζεται με delimiter."),
    mechanics: both("cut -d sets the delimiter and -f selects a one-based field number. It is commonly used after a pipe.", "Το cut -d ορίζει delimiter και το -f επιλέγει αριθμημένο πεδίο. Χρησιμοποιείται συχνά μετά από pipe."),
    output: both("Each output line contains only the selected field. If the delimiter or field index is wrong, the result may be blank.", "Κάθε γραμμή εξόδου έχει μόνο το επιλεγμένο πεδίο. Λάθος delimiter/αριθμός μπορεί να δώσει κενό αποτέλεσμα."),
    syntax: "cut -d DELIMITER -f FIELD", example: 'echo "alpha,beta" | cut -d , -f 2',
  },
  {
    key: "python", aliases: ["python", "python3"], title: both("Python runtime", "Εκτέλεση Python"),
    purpose: both("Identify the Python interpreter available in the simulated lab.", "Αναγνώρισε τον Python interpreter στο προσομοιωμένο lab."),
    mechanics: both("The training terminal prints a fixed version response; it does not open an unrestricted programming runtime.", "Το εκπαιδευτικό terminal εμφανίζει σταθερή έκδοση, δεν ανοίγει απεριόριστο runtime."),
    output: both("The version banner confirms the simulator's declared Python version.", "Το banner έκδοσης επιβεβαιώνει την Python που δηλώνει ο προσομοιωτής."),
    syntax: "python3", example: "python3",
  },
  {
    key: "scp", aliases: ["scp"], title: both("Secure copy (simulated)", "Ασφαλής αντιγραφή (προσομοίωση)"),
    purpose: both("See that an authenticated SSH session can move a file as well as open a shell.", "Δες ότι μια ταυτοποιημένη συνεδρία SSH μπορεί να μετακινήσει αρχείο, όχι μόνο να ανοίξει shell."),
    mechanics: both("The source path comes first. user@host:path is the fictional destination. GameHack reports a canned transfer and never contacts a remote host. The lab copy is a note, not a system account file.", "Η διαδρομή πηγής μπαίνει πρώτη. Το user@host:path είναι ο φανταστικός προορισμός. Το GameHack δηλώνει εικονική μεταφορά και δεν επικοινωνεί με απομακρυσμένο host. Η αντιγραφή του εργαστηρίου είναι μια σημείωση, όχι αρχείο λογαριασμού συστήματος."),
    output: both("Transfer complete means the sandbox accepted the training command. It does not mean a file left your computer.", "Το Transfer complete σημαίνει ότι το sandbox δέχθηκε την εκπαιδευτική εντολή. Δεν σημαίνει ότι ένα αρχείο έφυγε από τον υπολογιστή σου."),
    syntax: "scp SOURCE USER@HOST:PATH", example: "scp report.txt operator@lab:/tmp/",
  },
  {
    key: "file", aliases: ["file"], title: both("Identify a file by content", "Αναγνώριση αρχείου από περιεχόμενο"),
    purpose: both("Determine a likely file format from its bytes/signature rather than trusting its extension.", "Εκτίμησε format από bytes/signature, όχι μόνο από κατάληξη."),
    mechanics: both("file compares known format signatures and metadata. In the DFIR track the output is a fictional evidence-fixture description.", "Το file συγκρίνει γνωστά signatures και metadata. Στο DFIR εμφανίζει περιγραφή φανταστικού evidence fixture."),
    output: both("The text after the colon is the detected or suspected type. A damaged signature should be reported as a limitation, not silently repaired in the original.", "Το κείμενο μετά την άνω κάτω τελεία είναι ο εντοπισμένος/ύποπτος τύπος. Damaged signature καταγράφεται ως περιορισμός."),
    syntax: "file PATH", example: "file /cases/IR-2404/evidence/01-intake/challenge-corrupt.png",
  },
  {
    key: "strings", aliases: ["strings"], title: both("Extract printable strings", "Εξαγωγή εκτυπώσιμων strings"),
    purpose: both("Recover readable fragments from a file for initial triage.", "Ανάκτησε αναγνώσιμα fragments για αρχική διαλογή."),
    mechanics: both("strings scans bytes for printable sequences. It does not preserve program context, prove execution, or prove that a fragment is malicious.", "Το strings ψάχνει printable ακολουθίες. Δεν διατηρεί πλαίσιο προγράμματος και δεν αποδεικνύει εκτέλεση ή κακοβουλία."),
    output: both("Each output line is a candidate text fragment. Correlate domains, API names, and paths with other artifacts.", "Κάθε γραμμή είναι υποψήφιο text fragment. Συσχέτισε domains, API names και paths με άλλα artifacts."),
    syntax: "strings PATH", example: "strings /cases/IR-2404/evidence/07-malware/sample.bin",
  },
  {
    key: "md5sum", aliases: ["md5sum"], title: both("Calculate an MD5 digest", "Υπολογισμός MD5 digest"),
    purpose: both("Record a legacy digest for file comparison or lookup.", "Κατέγραψε legacy digest για σύγκριση ή αναζήτηση."),
    mechanics: both("MD5 maps file bytes to a 128-bit digest. It is useful for legacy identification but not collision-resistant and must not be used for modern integrity guarantees or password storage.", "Το MD5 χαρτογραφεί bytes σε digest 128-bit. Χρήσιμο για legacy αναγνώριση, αλλά όχι collision-resistant ή σύγχρονη προστασία."),
    output: both("The first field is the digest; the final field is the filename. A matching digest supports identical bytes, not authenticity by itself.", "Το πρώτο πεδίο είναι digest και το τελευταίο filename. Ίδιο digest υποστηρίζει ίδια bytes, όχι αυθεντικότητα από μόνο του."),
    syntax: "md5sum FILE", example: "md5sum /cases/IR-2404/evidence/01-intake/hash_sample.txt",
  },
  {
    key: "sha1sum", aliases: ["sha1sum"], title: both("Calculate a SHA-1 digest", "Υπολογισμός SHA-1 digest"),
    purpose: both("Create a digest used by older workflows and sample databases.", "Δημιούργησε digest για legacy workflows και sample databases."),
    mechanics: both("SHA-1 outputs 160 bits. It remains useful for some legacy references but is no longer collision-resistant enough for security-sensitive integrity claims.", "Το SHA-1 παράγει 160 bits. Χρήσιμο σε legacy references, αλλά όχι αρκετά collision-resistant για σύγχρονους security ισχυρισμούς."),
    output: both("Compare the full digest and filename with an independently recorded manifest value.", "Σύγκρινε ολόκληρο digest και filename με ανεξάρτητη manifest τιμή."),
    syntax: "sha1sum FILE", example: "sha1sum /cases/IR-2404/evidence/01-intake/hash_sample.txt",
  },
  {
    key: "sha256sum", aliases: ["sha256sum"], title: both("Calculate a SHA-256 digest", "Υπολογισμός SHA-256 digest"),
    purpose: both("Record a modern cryptographic digest for the evidence bytes.", "Κατέγραψε σύγχρονο cryptographic digest των bytes τεκμηρίου."),
    mechanics: both("SHA-256 returns a 256-bit digest. A digest match is a strong byte-integrity check when acquisition values are recorded independently.", "Το SHA-256 δίνει digest 256-bit. Ίδιο digest είναι ισχυρός έλεγχος ακεραιότητας bytes όταν έχει καταγραφεί ανεξάρτητα."),
    output: both("The long hexadecimal field is the digest and the trailing field identifies the file. GameHack computes the exact known test vector; other fixture digests are explicitly labeled.", "Το μεγάλο hexadecimal πεδίο είναι digest και το τελευταίο filename. Το GameHack υπολογίζει ακριβώς το γνωστό test vector, άλλα fixture digests επισημαίνονται."),
    syntax: "sha256sum FILE", example: "sha256sum /cases/IR-2404/evidence/01-intake/hash_sample.txt",
  },
  {
    key: "xxd", aliases: ["xxd", "hexdump"], title: both("Inspect hexadecimal bytes", "Έλεγχος bytes σε hexadecimal"),
    purpose: both("View raw bytes and recognize file-format magic signatures.", "Δες raw bytes και αναγνώρισε magic signatures."),
    mechanics: both("xxd prints byte offsets, hexadecimal values, and an ASCII preview. It is a read operation; it does not repair or modify the file.", "Η εντολή xxd εμφανίζει offsets, δεκαεξαδικές τιμές και προεπισκόπηση ASCII. Πρόκειται για ανάγνωση, δεν αλλάζει το αρχείο."),
    output: both("For PNG, the initial bytes normally start 89 50 4e 47 0d 0a 1a 0a. Confirm format with file and compare a trusted reference.", "Το PNG ξεκινά συνήθως 89 50 4e 47 0d 0a 1a 0a. Επιβεβαίωσε με file και trusted reference."),
    syntax: "xxd FILE", example: "xxd /cases/IR-2404/evidence/01-intake/challenge-corrupt.png",
  },
  {
    key: "hexedit", aliases: ["hexedit"], title: both("Inspect a virtual hex editor", "Έλεγχος virtual hex editor"),
    purpose: both("Demonstrate a byte-level repair on a disposable derived image copy.", "Δείξε byte-level επισκευή σε αναλώσιμο παράγωγο αντίγραφο."),
    mechanics: both("Real hexedit changes the opened file. GameHack accepts this command only for its virtual damaged-image fixture and writes a simulated derived copy state.", "Πραγματικό hexedit αλλάζει αρχείο. Το GameHack το δέχεται μόνο για virtual damaged-image fixture."),
    output: both("The repaired signature is evidence about the derived lab copy only. Preserve and report the original acquisition separately.", "Η επισκευασμένη signature αφορά μόνο παράγωγο lab αντίγραφο. Διατήρησε και ανέφερε ξεχωριστά την αρχική απόκτηση."),
    syntax: "hexedit DERIVED_COPY", example: "hexedit /cases/IR-2404/evidence/01-intake/challenge-corrupt.png",
    caution: both("Do not edit original evidence. The lab restricts this operation to a fictional virtual copy.", "Μην επεξεργάζεσαι πρωτότυπο evidence. Το lab περιορίζει την ενέργεια σε φανταστικό virtual αντίγραφο."),
  },
  {
    key: "exiftool", aliases: ["exiftool"], title: both("Inspect media metadata", "Έλεγχος metadata πολυμέσων"),
    purpose: both("Read image and document metadata that may inform provenance or timeline work.", "Διάβασε image/document metadata για provenance και timeline."),
    mechanics: both("Metadata can contain author, timestamps, dimensions, software, or location fields. Values can be missing or altered, so corroborate them.", "Metadata μπορεί να περιέχει δημιουργό, χρόνους, διαστάσεις, λογισμικό ή τοποθεσία. Μπορεί να λείπουν ή να έχουν αλλοιωθεί."),
    output: both("Field/value rows describe embedded metadata in the artifact fixture; they do not authenticate the content.", "Οι γραμμές field/value περιγράφουν embedded metadata fixture, όχι αυθεντικότητα περιεχομένου."),
    syntax: "exiftool FILE", example: "exiftool /cases/IR-2404/evidence/03-documents/starry_night.png",
  },
  {
    key: "oleid", aliases: ["oleid"], title: both("Identify Office document indicators", "Αναγνώριση Office indicators"),
    purpose: both("Triage document format, encryption, macros, and external relationships.", "Κάνε triage format, encryption, macros και external relationships."),
    mechanics: both("oleid reports structural indicators. A macro-present result is a reason for static inspection, not a reason to execute the document.", "Η εντολή oleid αναφέρει δομικές ενδείξεις. Το αποτέλεσμα macro-present παραπέμπει σε στατική εξέταση, όχι σε εκτέλεση του εγγράφου."),
    output: both("Read the file/container type, encryption, macro indicator, and relationship count, then corroborate with extracted streams.", "Διάβασε type, encryption, macro indicator και relationship count, επιβεβαίωσε με extracted streams."),
    syntax: "oleid DOCUMENT", example: "oleid /cases/IR-2404/evidence/03-documents/QuarterlyForecast.docm",
  },
  {
    key: "olevba", aliases: ["olevba"], title: both("Extract VBA for static review", "Εξαγωγή VBA για static review"),
    purpose: both("Inspect macro text without opening or running an Office document.", "Έλεγξε macro text χωρίς άνοιγμα ή εκτέλεση Office εγγράφου."),
    mechanics: both("olevba extracts VBA streams and searches for suspicious patterns. GameHack returns harmless, fictional, defanged indicator text only.", "Το olevba εξάγει VBA streams και ψάχνει patterns. Το GameHack επιστρέφει ακίνδυνο, φανταστικό defanged κείμενο."),
    output: both("Procedure names, API references, and defanged URLs are leads for correlation; static strings do not prove execution.", "Procedure names, API references και defanged URLs είναι leads, static strings δεν αποδεικνύουν εκτέλεση."),
    syntax: "olevba DOCUMENT", example: "olevba /cases/IR-2404/evidence/03-documents/QuarterlyForecast.docm",
    caution: both("Never enable macros in untrusted documents on a production workstation.", "Μην ενεργοποιείς macros σε μη έμπιστα έγγραφα production workstation."),
  },
  {
    key: "rot13", aliases: ["rot13"], title: both("Transform text with ROT13", "Μετασχηματισμός κειμένου με ROT13"),
    purpose: both("Decode an inert training marker by rotating each Latin letter by thirteen places.", "Αποκωδικοποίησε ένα αδρανές training marker μετακινώντας κάθε λατινικό γράμμα κατά δεκατρείς θέσεις."),
    mechanics: both("ROT13 maps A to N, B to O, and so on, wrapping at the end of the alphabet. Applying it a second time restores the original text; it is an encoding, not encryption.", "Το ROT13 αντιστοιχίζει A σε N, B σε O κ.ο.κ., συνεχίζοντας από την αρχή του αλφαβήτου. Δεύτερη εφαρμογή επαναφέρει το αρχικό κείμενο, είναι κωδικοποίηση, όχι κρυπτογράφηση."),
    output: both("The decoded string is a clue in this static-analysis exercise. It is harmless text and must not be treated as executable code.", "Το αποκωδικοποιημένο κείμενο είναι ένδειξη στην άσκηση static analysis. Είναι ακίνδυνο κείμενο, όχι κώδικας προς εκτέλεση."),
    syntax: "rot13 TEXT", example: "rot13 Synt{fgngvp_nanlyfvf}",
    caution: both("ROT13 provides no confidentiality or integrity; anyone can reverse it immediately.", "Το ROT13 δεν προσφέρει εμπιστευτικότητα ή ακεραιότητα, αντιστρέφεται αμέσως."),
  },
  {
    key: "zsteg", aliases: ["zsteg", "steghide"], title: both("Triage possible steganography", "Triage πιθανής steganography"),
    purpose: both("Check a supplied image fixture for a known training marker.", "Έλεγξε image fixture για γνωστό training marker."),
    mechanics: both("Steganography tools inspect format-specific channels such as PNG least-significant bits. A suspicious extraction should be preserved and validated independently.", "Εργαλεία steganography ελέγχουν format-specific κανάλια όπως PNG LSB. Ύποπτη εξαγωγή διατηρείται και επικυρώνεται."),
    output: both("The marker printed in this lab is synthetic text, not a hidden executable or external payload.", "Το marker του lab είναι συνθετικό κείμενο, όχι κρυφό executable ή εξωτερικό payload."),
    syntax: "zsteg IMAGE", example: "zsteg /cases/IR-2404/evidence/03-documents/starry_night.png",
  },
  {
    key: "audio-analyze", aliases: ["audio-analyze", "sonic-visualiser", "sonic-visualizer"], title: both("Inspect a spectrogram summary", "Έλεγχος σύνοψης spectrogram"),
    purpose: both("Learn how a narrow-band spectral feature can become an investigative clue.", "Μάθε πώς ένα στενό spectral feature γίνεται investigative clue."),
    mechanics: both("Spectrograms visualize signal energy over time and frequency. The GameHack exercise displays a deterministic synthetic plot and text note instead of playing an audio payload.", "Τα spectrograms δείχνουν ενέργεια σήματος σε χρόνο/συχνότητα. Η άσκηση δείχνει συνθετικό διάγραμμα αντί να παίξει payload."),
    output: both("A frequency marker is only a lead; preserve the source audio, analysis settings, and extracted interpretation.", "Frequency marker είναι lead, διατήρησε audio, ρυθμίσεις και ερμηνεία."),
    syntax: "audio-analyze AUDIO", example: "audio-analyze /cases/IR-2404/evidence/03-documents/super_secret_audio.wav",
  },
  {
    key: "tshark", aliases: ["tshark", "tcpdump", "wireshark"], title: both("Analyze an authorized packet capture", "Ανάλυση εξουσιοδοτημένου packet capture"),
    purpose: both("Summarize, filter, and inspect the fictional GH-2404 network capture.", "Σύνοψε και έλεγξε το φανταστικό capture GH-2404."),
    mechanics: both("Wireshark/tshark inspect saved PCAP data. Display filters such as http narrow the view but do not alter the capture. Follow-stream reconstructs a conversation; object export creates a derivative file.", "Wireshark/tshark εξετάζουν αποθηκευμένο PCAP. Display filter περιορίζει προβολή, όχι capture. Follow-stream ανασυνθέτει συνομιλία, export δημιουργεί παράγωγο."),
    output: both("Protocol counts, packet fields, stream content, and exported objects each answer different questions. Record frame numbers and source capture.", "Protocol counts, packet fields, stream και exported objects απαντούν διαφορετικά ερωτήματα. Κατέγραψε frame numbers και capture."),
    syntax: "tshark -r CAPTURE -Y FILTER", example: "tshark -r /cases/IR-2404/evidence/05-network/capture.pcapng -Y http",
    caution: both("Capture only networks for which you have authority. This simulator reads a local fictional fixture.", "Κατέγραψε μόνο δίκτυα με άδεια. Ο προσομοιωτής διαβάζει τοπικό φανταστικό fixture."),
  },
  {
    key: "ewfacquire", aliases: ["ewfacquire", "ftkimager"], title: both("Acquire a forensic image", "Απόκτηση forensic image"),
    purpose: both("Practice a read-only acquisition workflow and documentation.", "Εξασκήσου σε read-only απόκτηση και τεκμηρίωση."),
    mechanics: both("Imagers create a sector-level copy and can record metadata and verification digests. This command only emits a sandbox receipt.", "Imager δημιουργεί sector-level αντίγραφο και metadata/digests. Η εντολή εμφανίζει sandbox receipt."),
    output: both("The receipt identifies a derived copy, verification state, and evidence ID. A real workflow also records source media identifiers and write-blocker state.", "Το receipt δείχνει αντίγραφο, verification και evidence ID. Πραγματική ροή καταγράφει source identifiers και write-blocker."),
    syntax: "ewfacquire SOURCE", example: "ewfacquire /cases/IR-2404/evidence/06-disk/usb.dd",
  },
  {
    key: "fls", aliases: ["fls", "mmls", "mftecmd"], title: both("Enumerate disk filesystem structures", "Απαρίθμηση filesystem δομών δίσκου"),
    purpose: both("Inspect partitions, file entries, and NTFS metadata records.", "Έλεγξε partitions, file entries και NTFS metadata records."),
    mechanics: both("mmls summarizes partitions; fls lists filesystem entries and may show deleted entries; MFTECmd parses MFT metadata into tabular timelines. These lab outputs are safe text fixtures.", "Το mmls συνοψίζει partitions, το fls entries/deleted entries και το MFTECmd κάνει parse MFT metadata σε timeline. Οι έξοδοι είναι text fixtures."),
    output: both("Record filesystem offset, record number, parent, timestamps, and deletion state. Metadata alone may not recover file content.", "Κατέγραψε offset, record number, parent, χρόνους και deletion state. Metadata μόνη της δεν ανακτά περιεχόμενο."),
    syntax: "fls -r IMAGE | mftecmd MFT.csv", example: "mftecmd /cases/IR-2404/evidence/06-disk/$MFT.csv",
  },
  {
    key: "icat", aliases: ["icat"], title: both("Read a file by filesystem record", "Ανάγνωση αρχείου μέσω filesystem record"),
    purpose: both("Demonstrate targeted extraction from an evidence image.", "Επίδειξη στοχευμένης εξαγωγής από evidence image."),
    mechanics: both("icat writes content for a filesystem metadata address to standard output. The lab maps a known record to a harmless note fixture.", "Η εντολή icat εμφανίζει το περιεχόμενο μιας διεύθυνσης μεταδεδομένων. Το εργαστήριο αντιστοιχίζει ένα γνωστό record σε ακίνδυνο σημείωμα (fixture)."),
    output: both("Treat output as a derived file view and record image, record ID, and extraction tool in the case notes.", "Αντιμετώπισε την έξοδο ως παράγωγη προβολή και κατέγραψε image, record ID και εργαλείο."),
    syntax: "icat IMAGE RECORD", example: "icat /cases/IR-2404/evidence/06-disk/usb.dd 42",
  },
  {
    key: "volatility", aliases: ["volatility", "vol.py", "vol"], title: both("Query a memory image", "Ερώτημα σε memory image"),
    purpose: both("Inspect process, socket, environment, and volatile user artifacts in a saved dump.", "Έλεγξε processes, sockets, environment και volatile artifacts σε saved dump."),
    mechanics: both("Volatility plugins parse a memory image using an OS/profile model. imageinfo suggests a profile; pslist/pstree inspect process structures; netscan inspects sockets; envars/clipboard/cmdline inspect volatile context. GameHack returns fixture output only.", "Plugins Volatility κάνουν parse memory image με OS/profile. imageinfo προτείνει profile, pslist/pstree processes, netscan sockets, envars/clipboard/cmdline volatile context. Το GameHack δίνει fixture output."),
    output: both("Treat plugins as different views into one capture. Correlate process IDs, timestamps, owners, and connections with endpoint and network records.", "Τα plugins είναι διαφορετικές όψεις ενός capture. Συσχέτισε IDs, χρόνους, owners και connections με endpoint/network records."),
    syntax: "volatility -f DUMP PLUGIN", example: "volatility -f /cases/IR-2404/evidence/08-memory/workstation.raw pstree",
    caution: both("A memory image can contain sensitive data. Handle only with authority and restrict report disclosure.", "Memory image μπορεί να περιέχει ευαίσθητα δεδομένα, τήρησε άδεια και περιορισμένη κοινοποίηση."),
  },
  {
    key: "docker", aliases: ["docker"], title: both("Inspect a container as evidence", "Έλεγχος container ως τεκμήριο"),
    purpose: both("Review configuration, runtime changes, logs, and image-layer history.", "Έλεγξε config, runtime changes, logs και image layers."),
    mechanics: both("inspect returns configuration/state; diff shows added/deleted/changed paths; logs show recorded output; history shows image layers; export simulates a filesystem snapshot. No Docker daemon is connected in this lab.", "inspect δείχνει config/state, diff αλλαγές paths, logs output, history layers και export snapshot. Δεν υπάρχει σύνδεση με Docker daemon."),
    output: both("Compare the writable-container diff with the image history. Removed files can remain in earlier immutable layers.", "Σύγκρινε writable diff με image history. Διαγραμμένα αρχεία μπορεί να παραμένουν σε παλιότερα immutable layers."),
    syntax: "docker inspect|diff|logs|history CONTAINER", example: "docker diff GH-2404",
  },
  {
    key: "hash-identifier", aliases: ["hash-identifier"], title: both("Classify a hash candidate", "Ταξινόμηση hash candidate"),
    purpose: both("Generate possible hash-family leads from a digest's format.", "Παρήγαγε πιθανούς hash-family leads από τη μορφή digest."),
    mechanics: both("Length, alphabet, separators, and prefixes can suggest candidate formats. Multiple algorithms share formats; use application context and metadata to confirm.", "Μήκος, alphabet, separators και prefixes προτείνουν formats. Πολλοί αλγόριθμοι έχουν ίδια μορφή, επιβεβαίωσε από context."),
    output: both("Possible formats are hypotheses, not identification certainty. A digest is not encrypted text that can simply be reversed.", "Πιθανά formats είναι υποθέσεις, όχι βεβαιότητα. Digest δεν είναι κρυπτογραφημένο κείμενο που αντιστρέφεται."),
    syntax: "hash-identifier DIGEST", example: "hash-identifier 098f6bcd4621d373cade4e832627b4f6",
  },
  {
    key: "john", aliases: ["john"], title: both("Authorized wordlist audit (simulated)", "Εξουσιοδοτημένος έλεγχος wordlist (προσομοίωση)"),
    purpose: both("Demonstrate candidate/hash comparison on fictional classroom hashes.", "Επίδειξη σύγκρισης candidates/hashes σε φανταστικά classroom hashes."),
    mechanics: both("John the Ripper hashes candidate words and compares digests. The GameHack output is canned; it does not read arbitrary hashes or test external accounts.", "Το John κάνει hash candidates και συγκρίνει digests. Η έξοδος GameHack είναι προκαθορισμένη, δεν διαβάζει αυθαίρετα hashes ούτε ελέγχει λογαριασμούς."),
    output: both("A candidate match means that candidate produces the displayed training digest. It does not establish who set or used the password.", "Η αντιστοίχιση υποψηφίου δηλώνει ότι ο συγκεκριμένος υποψήφιος παράγει το εμφανιζόμενο εκπαιδευτικό digest, δεν αποδεικνύει ποιος όρισε ή χρησιμοποίησε τον κωδικό."),
    syntax: "john --wordlist=LIST HASHFILE", example: "john --wordlist=wordlist.txt hashes.txt",
    caution: both("Only audit hashes you are explicitly authorized to handle. Use password cracking for defensive assessment, not account access.", "Έλεγχε μόνο hashes με ρητή άδεια. Password cracking για αμυντικό assessment, όχι πρόσβαση."),
  },
  {
    key: "hashcat", aliases: ["hashcat"], title: both("Bounded hash candidate test (simulated)", "Bounded hash test (προσομοίωση)"),
    purpose: both("Explain how hash mode and a constrained candidate mask work in a classroom example.", "Εξήγησε hash mode και περιορισμένο mask σε classroom παράδειγμα."),
    mechanics: both("Hashcat uses -m for hash mode and -a for attack mode. The GameHack fixture reports only a predefined toy result; it does not calculate candidates or access hardware.", "Το Hashcat χρησιμοποιεί -m για hash mode και -a για attack mode. Το GameHack εμφανίζει μόνο προκαθορισμένο toy result."),
    output: both("A cracked status applies only to the toy vector in this lesson. Modern password storage should use salted, adaptive KDFs such as Argon2id.", "Το cracked status αφορά μόνο toy vector. Σύγχρονη αποθήκευση: salted adaptive KDF όπως Argon2id."),
    syntax: "hashcat -m MODE -a MODE HASH MASK", example: "hashcat -m 0 -a 3 098f6bcd4621d373cade4e832627b4f6 ?l?l?l?l",
    caution: both("Do not test third-party credentials. This UI returns fictional training output only.", "Μην ελέγχεις credentials τρίτων. Το UI επιστρέφει μόνο φανταστική εκπαιδευτική έξοδο."),
  },
  {
    key: "netstat", aliases: ["netstat", "ss"], title: both("Inspect network sockets", "Έλεγχος network sockets"),
    purpose: both("Review a point-in-time list of local and remote connections.", "Έλεγξε στιγμιότυπο τοπικών και απομακρυσμένων συνδέσεων."),
    mechanics: both("netstat/ss can display protocol, local and foreign endpoints, state, and process owner. The DFIR response is a fixed case fixture.", "netstat/ss εμφανίζουν protocol, endpoints, state και process owner. Η έξοδος DFIR είναι σταθερό case fixture."),
    output: both("Match PID and owner to process evidence, then compare timestamps with network capture records.", "Συσχέτισε PID/owner με processes και χρόνο με network capture."),
    syntax: "netstat -antp", example: "netstat -antp",
  },
  {
    key: "reg", aliases: ["reg"], title: both("Query a registry-hive export", "Ερώτημα σε registry-hive export"),
    purpose: both("Read selected registry values from a simulated, acquired user hive.", "Διάβασε registry values από προσομοιωμένο acquired user hive."),
    mechanics: both("The lab's reg query command searches its text-export fixture for common user settings, typed paths, and Run-key values. It never edits the hive.", "Το reg query ψάχνει text-export fixture για user settings, typed paths και Run key. Δεν αλλάζει hive."),
    output: both("Key/value rows identify stored configuration; verify the hive identity and correlate values with execution evidence.", "Οι γραμμές key/value δείχνουν ρυθμίσεις, επιβεβαίωσε hive identity και συσχέτισε με execution evidence."),
    syntax: "reg query HIVE_FILE", example: "reg query /cases/IR-2404/evidence/02-windows/NTUSER.DAT",
  },
  {
    key: "lecmd", aliases: ["lecmd"], title: both("Parse Windows shortcut metadata", "Ανάλυση Windows shortcut metadata"),
    purpose: both("Recover a shortcut's target path and time metadata.", "Ανάκτησε target path και time metadata shortcut."),
    mechanics: both("LECmd parses .lnk structures. This fixture exposes target and timestamps as a short text summary.", "Το LECmd αναλύει δομές .lnk. Το fixture εμφανίζει target και timestamps."),
    output: both("Compare the shortcut's file times with the target's times; they describe distinct objects/events.", "Σύγκρινε χρόνους shortcut και target, αφορούν διαφορετικά objects/events."),
    syntax: "LECmd -f SHORTCUT.lnk", example: "LECmd -f /cases/IR-2404/evidence/02-windows/Recent/QuarterlyForecast.lnk",
  },
  {
    key: "sqlitebrowser", aliases: ["sqlitebrowser", "sqlite3"], title: both("Inspect a browser SQLite database", "Έλεγχος browser SQLite database"),
    purpose: both("Review fictional browser-history rows without extracting credentials.", "Έλεγξε browser-history rows χωρίς εξαγωγή credentials."),
    mechanics: both("Firefox and Chrome commonly keep history in SQLite databases. The sandbox stores readable table exports, not live databases.", "Firefox/Chrome αποθηκεύουν history σε SQLite. Το sandbox περιέχει readable table exports."),
    output: both("Rows can include URL, title, visit count, and timestamps. Correlate with shortcuts and logs.", "Rows περιέχουν URL, τίτλο, visits και timestamps. Συσχέτισε με shortcuts και logs."),
    syntax: "sqlitebrowser DATABASE", example: "sqlitebrowser /cases/IR-2404/evidence/02-windows/Firefox/places.sqlite",
  },
  {
    key: "evtx", aliases: ["evtx", "wevtutil", "get-winevent"], title: both("Review Windows event records", "Έλεγχος Windows event records"),
    purpose: both("Filter simulated Windows Security or PowerShell event logs.", "Φίλτραρε προσομοιωμένα Windows Security ή PowerShell event logs."),
    mechanics: both("Security IDs such as 4624, 4625, 1102, and 4720 describe event classes. PowerShell 4104 records script-block logging in this fixture.", "Security IDs 4624, 4625, 1102, 4720 περιγράφουν event classes. PowerShell 4104 καταγράφει script-block events."),
    output: both("An event ID is a pivot, not a verdict. Validate account, source, host, time zone, and nearby events.", "Event ID είναι pivot, όχι verdict. Επικύρωσε account, source, host, timezone και γειτονικά events."),
    syntax: "evtx FILE [event ID]", example: "wevtutil qe Security.evtx /q:4625",
  },
  {
    key: "oleobj", aliases: ["oleobj"], title: both("Inventory embedded Office objects", "Απογραφή embedded Office objects"),
    purpose: both("Inspect simulated external and embedded relationships in an Office container.", "Έλεγξε προσομοιωμένες external/embedded relationships σε Office container."),
    mechanics: both("OOXML relationships can point to embedded media or external templates. The GameHack summary does not fetch referenced content.", "OOXML relationships δείχνουν embedded media ή external templates. Η σύνοψη δεν κατεβάζει referenced content."),
    output: both("A relationship is a pivot to review and defang; it is not proof the remote item was retrieved.", "Relationship είναι pivot προς έλεγχο/defang, δεν αποδεικνύει retrieval."),
    syntax: "oleobj DOCUMENT", example: "oleobj /cases/IR-2404/evidence/03-documents/Presentation.pptx",
  },
  {
    key: "tshark", aliases: ["tshark", "tcpdump", "wireshark"], title: both("Analyze an authorized packet capture", "Ανάλυση εξουσιοδοτημένου packet capture"),
    purpose: both("Summarize, filter, and inspect the fictional GH-2404 network capture.", "Σύνοψε και έλεγξε το φανταστικό capture GH-2404."),
    mechanics: both("Protocol hierarchy gives the overview; display filters narrow a view; packet/frame detail shows one packet; Follow TCP Stream reconstructs one conversation; object export creates derived evidence.", "Protocol hierarchy δίνει επισκόπηση, filters περιορίζουν θέαση, packet detail δείχνει frame, Follow TCP Stream ανασυνθέτει συνομιλία, export δημιουργεί derived evidence."),
    output: both("The simulated capture reports TCP/HTTP/DNS/FTP. Cite frame/stream and retain the original capture hash.", "Το capture αναφέρει TCP/HTTP/DNS/FTP. Ανέφερε frame/stream και διατήρησε hash του original."),
    syntax: "tshark -r CAPTURE -Y FILTER", example: "tshark -r /cases/IR-2404/evidence/05-network/capture.pcapng -Y http",
    caution: both("Capture only traffic you are authorized to inspect; this sample is local fictional evidence.", "Κατέγραψε μόνο κίνηση που έχεις άδεια να εξετάσεις, αυτό το δείγμα είναι τοπικό και φανταστικό."),
  },
  {
    key: "packet", aliases: ["packet", "frame"], title: both("Inspect packet fields and bytes", "Έλεγχος packet fields και bytes"),
    purpose: both("Read one frame's protocol layers, endpoints, and payload preview.", "Διάβασε protocol layers, endpoints και payload preview ενός frame."),
    mechanics: both("Packet details decode headers layer by layer; the byte pane shows hex and ASCII. The simulator renders a selected synthetic frame.", "Packet details αποκωδικοποιούν headers ανά layer, το byte pane δείχνει hex/ASCII. Ο προσομοιωτής εμφανίζει synthetic frame."),
    output: both("A decoded field is evidence about the captured packet; it does not by itself prove application impact.", "Decoded field είναι evidence του packet, δεν αποδεικνύει μόνο του impact."),
    syntax: "packet FRAME_NUMBER", example: "packet 13",
  },
  {
    key: "fls", aliases: ["fls", "mmls", "mftecmd"], title: both("Enumerate disk structures", "Απαρίθμηση δομών δίσκου"),
    purpose: both("Inspect partitions, filesystem entries, and NTFS metadata records.", "Έλεγξε partitions, filesystem entries και NTFS metadata records."),
    mechanics: both("mmls summarizes partitions, fls lists entries and deleted records, and MFTECmd converts MFT metadata into a timeline-like table.", "Το mmls συνοψίζει partitions, το fls entries/deleted records και το MFTECmd μετατρέπει MFT metadata σε timeline."),
    output: both("Record partition offsets, record IDs, parent relationships, timestamps, and deletion state. A metadata record is not always a recoverable file.", "Κατέγραψε τα offsets, τα αναγνωριστικά εγγραφών, τη γονική σχέση, τις χρονικές σημάνσεις και την κατάσταση διαγραφής. Μια εγγραφή μεταδεδομένων δεν αντιστοιχεί πάντα σε ανακτήσιμο αρχείο."),
    syntax: "mmls IMAGE | fls -r IMAGE | mftecmd MFT", example: "mftecmd /cases/IR-2404/evidence/06-disk/$MFT.csv",
  },
  {
    key: "icat", aliases: ["icat"], title: both("Extract a file by record ID", "Εξαγωγή αρχείου με record ID"),
    purpose: both("Read a selected file's content from a filesystem image record.", "Διάβασε περιεχόμενο επιλεγμένου filesystem record."),
    mechanics: both("icat uses an image and metadata address/record ID to write the recovered view to standard output. This lab maps a record ID to a safe note fixture.", "Το icat χρησιμοποιεί image και record ID για να εμφανίσει recovered view. Το lab αντιστοιχίζει ID σε ασφαλές note fixture."),
    output: both("Record the image and record number as provenance for any exported content.", "Κατέγραψε image και record number ως provenance του exported content."),
    syntax: "icat IMAGE RECORD", example: "icat /cases/IR-2404/evidence/06-disk/usb.dd 42",
  },
  {
    key: "timeline", aliases: ["timeline"], title: both("Correlate timestamps", "Συσχέτιση timestamps"),
    purpose: both("Arrange events from multiple evidence sources into a shared chronology.", "Οργάνωσε συμβάντα από πολλές πηγές σε κοινή χρονολογική σειρά."),
    mechanics: both("A timeline view aligns timestamps but does not automatically resolve timezone differences or clock drift. Preserve source timestamps and normalize carefully.", "Timeline ευθυγραμμίζει timestamps αλλά δεν διορθώνει αυτόματα timezone/clock drift. Διατήρησε αρχικές τιμές και κανονικοποίησε προσεκτικά."),
    output: both("The ordered rows are a chronology of reported evidence. Confidence depends on source reliability and timestamp context.", "Οι ταξινομημένες γραμμές είναι χρονολογία evidence. Confidence εξαρτάται από πηγή και timezone."),
    syntax: "timeline web|disk|memory", example: "timeline web",
  },
  {
    key: "volatility", aliases: ["volatility", "vol.py", "vol"], title: both("Query a memory image", "Ερώτημα σε memory image"),
    purpose: both("Inspect process, socket, environment, browser, and volatile user artifacts.", "Έλεγξε processes, sockets, environment, browser και volatile artifacts."),
    mechanics: both("imageinfo suggests OS/profile; pslist and pstree inspect processes; netscan examines sockets; envars/cmdline/cmdscan/consoles recover process context; clipboard, chromehistory, and MSPaint plugins can expose volatile artifacts. GameHack returns fixture output only.", "imageinfo προτείνει OS/profile, pslist/pstree processes, netscan sockets, envars/cmdline/cmdscan/consoles process context, clipboard/browser/MSPaint volatile artifacts. Το GameHack δίνει μόνο fixtures."),
    output: both("Treat plugins as views into one capture. Correlate PIDs, timestamps, owner, and network endpoints with disk and event evidence.", "Τα plugins είναι όψεις ενός capture. Συσχέτισε PIDs, χρόνους, owner και endpoints με disk/events."),
    syntax: "volatility -f DUMP PLUGIN", example: "volatility -f /cases/IR-2404/evidence/08-memory/workstation.raw pstree",
    caution: both("Memory images can contain sensitive data. Only acquire and disclose them under proper authority.", "Memory images περιέχουν ευαίσθητα δεδομένα, απόκτησε/κοινοποίησε μόνο με άδεια."),
  },
  {
    key: "gcore", aliases: ["gcore"], title: both("Acquire a process core (simulated)", "Απόκτηση process core (προσομοίωση)"),
    purpose: both("Explain how a process memory snapshot can support volatile analysis.", "Εξήγησε πώς process memory snapshot βοηθά volatile analysis."),
    mechanics: both("gcore creates a core dump for a selected PID on a real system. GameHack writes a harmless text fixture and never reads host process memory.", "Το gcore δημιουργεί core dump PID σε πραγματικό σύστημα. Το GameHack γράφει ακίνδυνο text fixture και δεν διαβάζει host memory."),
    output: both("The reported path is a derived sandbox artifact; document target PID, acquisition time, and authority.", "Η διαδρομή είναι derived sandbox artifact, κατέγραψε PID, χρόνο και εξουσιοδότηση."),
    syntax: "gcore PID", example: "gcore 2112",
  },
  {
    key: "memory-acquire", aliases: ["memory-acquire"], title: both("Acquire volatile memory (simulated)", "Απόκτηση volatile μνήμης (προσομοίωση)"),
    purpose: both("Understand why a live memory capture must be authorized, time-stamped, and verified.", "Κατανόησε γιατί live memory capture θέλει άδεια, timestamp και verification."),
    mechanics: both("DumpIt, FTK Imager, and Redline are examples of acquisition tools. GameHack prints a receipt and creates no host memory image.", "DumpIt, FTK Imager και Redline είναι εργαλεία acquisition. Το GameHack εμφανίζει receipt χωρίς host memory image."),
    output: both("The receipt describes a virtual copy and verification note; it does not capture the browser's or computer's real RAM.", "Το receipt περιγράφει virtual copy, δεν συλλαμβάνει πραγματική RAM."),
    syntax: "memory-acquire SOURCE", example: "memory-acquire /cases/IR-2404/evidence/08-memory/workstation.raw",
  },
  {
    key: "static-report", aliases: ["static-report", "cutter-report"], title: both("Review static sample analysis", "Έλεγχος static sample analysis"),
    purpose: both("Review safe metadata, readable strings, and synthetic disassembly notes without executing a sample.", "Έλεγξε ασφαλή metadata, strings και synthetic disassembly χωρίς εκτέλεση."),
    mechanics: both("Static analysis includes file identification, hashes, strings, and reverse-engineering views. The case sample is text-only and non-executable.", "Static analysis περιλαμβάνει file, hashes, strings και reverse engineering. Το case sample είναι text-only και μη εκτελέσιμο."),
    output: both("Treat APIs, URLs, and decoded markers as indicators that require corroboration.", "Αντιμετώπισε APIs, URLs και markers ως indicators προς συσχέτιση."),
    syntax: "static-report SAMPLE | cutter-report", example: "cutter-report",
    caution: both("Do not execute untrusted samples on a production workstation.", "Μην εκτελείς άγνωστα samples σε production workstation."),
  },
  {
    key: "trace-report", aliases: ["strace-report", "ltrace-report"], title: both("Review simulated call traces", "Έλεγχος simulated call traces"),
    purpose: both("Learn how system-call and library-call traces help describe program behavior.", "Μάθε πώς system-call και library-call traces περιγράφουν συμπεριφορά."),
    mechanics: both("strace observes system calls; ltrace observes library calls. These GameHack commands show a synthetic report and never attach to a process.", "Το strace παρατηρεί system calls, το ltrace library calls. Αυτές οι εντολές δείχνουν synthetic report και δεν συνδέονται σε process."),
    output: both("Use a call as an investigation lead and corroborate it with endpoint, file, or network evidence.", "Χρησιμοποίησε call ως lead και επιβεβαίωσέ το με endpoint, file ή network evidence."),
    syntax: "strace PROGRAM | ltrace PROGRAM", example: "strace-report",
  },
  {
    key: "vt-report", aliases: ["vt-report"], title: both("Review a reputation lookup", "Έλεγχος reputation lookup"),
    purpose: both("Understand the context and limitations of public malware-reputation services.", "Κατανόησε πλαίσιο και περιορισμούς public malware reputation services."),
    mechanics: both("A multi-engine result is one signal at one time. A zero-detection report does not prove a file is benign; public upload may disclose sensitive evidence.", "Multi-engine result είναι μία ένδειξη σε μία στιγμή. Μηδέν detections δεν αποδεικνύουν καλοήθεια, public upload μπορεί να εκθέσει evidence."),
    output: both("Record lookup date and privacy approval. This command displays an offline fictional report.", "Κατέγραψε χρόνο lookup και privacy approval. Η εντολή εμφανίζει offline φανταστική αναφορά."),
    syntax: "vt-report", example: "vt-report",
  },
  {
    key: "reg", aliases: ["reg"], title: both("Query a registry-hive export", "Ερώτημα σε registry-hive export"),
    purpose: both("Read selected registry values from a simulated, acquired user hive.", "Διάβασε registry values από προσομοιωμένο acquired user hive."),
    mechanics: both("The lab's reg query searches its text-export fixture for user settings, typed paths, and Run-key values; it never edits the hive.", "Το reg query ψάχνει text-export fixture για user settings, typed paths και Run key, δεν αλλάζει hive."),
    output: both("Key/value rows identify stored configuration. Verify the hive identity and correlate values with execution evidence.", "Οι γραμμές key/value δείχνουν ρυθμίσεις. Επιβεβαίωσε hive identity και συσχέτισε με execution evidence."),
    syntax: "reg query HIVE_FILE", example: "reg query /cases/IR-2404/evidence/02-windows/NTUSER.DAT",
  },
  {
    key: "lecmd", aliases: ["lecmd"], title: both("Parse Windows shortcut metadata", "Ανάλυση Windows shortcut metadata"),
    purpose: both("Recover a shortcut target, source timestamps, and volume information.", "Ανάκτησε shortcut target, source timestamps και volume information."),
    mechanics: both("LECmd parses .lnk structures. The fixture exposes a text summary rather than opening a Windows shortcut.", "Το LECmd αναλύει .lnk. Το fixture εμφανίζει text summary χωρίς άνοιγμα Windows shortcut."),
    output: both("Compare shortcut metadata to the target and other timeline sources; their timestamps may describe distinct events.", "Σύγκρινε metadata με target και timeline, timestamps μπορεί να αφορούν διαφορετικά events."),
    syntax: "LECmd -f SHORTCUT.lnk", example: "LECmd -f /cases/IR-2404/evidence/02-windows/Recent/QuarterlyForecast.lnk",
  },
  {
    key: "sqlitebrowser", aliases: ["sqlitebrowser", "sqlite3"], title: both("Inspect a browser SQLite database", "Έλεγχος browser SQLite database"),
    purpose: both("Review fictional browser-history rows without exposing credentials.", "Έλεγξε browser-history rows χωρίς έκθεση credentials."),
    mechanics: both("Browser profiles commonly store history and related artifacts in SQLite. The sandbox keeps readable table exports instead of a live database.", "Browser profiles αποθηκεύουν history σε SQLite. Το sandbox χρησιμοποιεί readable table export."),
    output: both("Rows can include URL, title, visit count, and timestamp; correlate with shortcut and event-log evidence.", "Rows περιέχουν URL, τίτλο, visits και timestamp, συσχέτισε με shortcut και event logs."),
    syntax: "sqlitebrowser DATABASE", example: "sqlitebrowser /cases/IR-2404/evidence/02-windows/Firefox/places.sqlite",
  },
  {
    key: "evtx", aliases: ["evtx", "wevtutil", "get-winevent"], title: both("Review Windows event records", "Έλεγχος Windows event records"),
    purpose: both("Filter simulated Windows Security or PowerShell event logs.", "Φίλτραρε προσομοιωμένα Windows Security ή PowerShell event logs."),
    mechanics: both("Event IDs such as 4624, 4625, 1102, 4720, and PowerShell 4104 describe event classes. Query the supplied case fixture and keep the original context.", "Event IDs όπως 4624, 4625, 1102, 4720 και PowerShell 4104 περιγράφουν event classes. Έλεγξε το case fixture με πλαίσιο."),
    output: both("An ID is an investigation pivot, not a verdict. Validate account, source, host, time zone, and adjacent events.", "ID είναι pivot, όχι verdict. Επικύρωσε account, source, host, timezone και γειτονικά events."),
    syntax: "evtx FILE | wevtutil qe FILE /q:EVENT_ID", example: "wevtutil qe Security.evtx /q:4625",
  },
  {
    key: "oleobj", aliases: ["oleobj"], title: both("Inventory embedded Office objects", "Απογραφή embedded Office objects"),
    purpose: both("Inspect embedded and external relationships in an Office container.", "Έλεγξε embedded και external relationships σε Office container."),
    mechanics: both("OOXML relationships can refer to embedded media or external templates. The simulator inventories a fictional reference and does not fetch it.", "OOXML relationships αναφέρονται σε media ή templates. Ο προσομοιωτής καταγράφει φανταστική αναφορά χωρίς fetch."),
    output: both("An external relationship is a lead to review and defang, not proof that the remote object was retrieved.", "External relationship είναι lead προς έλεγχο/defang, όχι απόδειξη retrieval."),
    syntax: "oleobj DOCUMENT", example: "oleobj /cases/IR-2404/evidence/03-documents/Presentation.pptx",
  },
  {
    key: "mmls", aliases: ["mmls", "fls", "mftecmd"], title: both("Enumerate disk structures", "Απαρίθμηση δομών δίσκου"),
    purpose: both("Inspect partition boundaries, directory entries, and NTFS metadata records.", "Έλεγξε partition boundaries, directory entries και NTFS metadata records."),
    mechanics: both("mmls summarizes partitions; fls lists filesystem entries and can show deleted records; MFTECmd parses MFT metadata into timelines. GameHack uses text fixtures.", "Το mmls συνοψίζει partitions, το fls εμφανίζει entries/deleted records, το MFTECmd αναλύει MFT σε timelines. Το GameHack χρησιμοποιεί text fixtures."),
    output: both("Record partition offsets and file record/parent IDs. Metadata does not guarantee file-content recovery.", "Κατέγραψε offsets και record/parent IDs. Metadata δεν εγγυάται ανάκτηση περιεχομένου."),
    syntax: "mmls IMAGE | fls -r IMAGE | mftecmd MFT.csv", example: "mftecmd /cases/IR-2404/evidence/06-disk/$MFT.csv",
  },
  {
    key: "icat", aliases: ["icat"], title: both("Extract a file by filesystem record", "Εξαγωγή αρχείου με filesystem record"),
    purpose: both("Read a selected file's content from an evidence-image record.", "Διάβασε περιεχόμενο από evidence-image record."),
    mechanics: both("icat uses an image and metadata address/record number to emit a derived content view. The lab maps known IDs to harmless fixtures.", "Το icat χρησιμοποιεί image και record number για derived view. Το lab αντιστοιχίζει γνωστά IDs σε ακίνδυνα fixtures."),
    output: both("Record source image, record ID, and extraction method with every derived output.", "Κατέγραψε source image, record ID και extraction method για κάθε παράγωγο."),
    syntax: "icat IMAGE RECORD", example: "icat /cases/IR-2404/evidence/06-disk/usb.dd 42",
  },
  {
    key: "timeline", aliases: ["timeline"], title: both("Correlate evidence timestamps", "Συσχέτιση timestamps τεκμηρίων"),
    purpose: both("Arrange events from multiple evidence sources into one chronology.", "Οργάνωσε events από πολλές πηγές σε κοινή χρονολογία."),
    mechanics: both("Timeline views align recorded timestamps but cannot automatically resolve timezone differences, clock drift, or source reliability.", "Timeline ευθυγραμμίζει timestamps αλλά δεν διορθώνει αυτόματα timezone, clock drift ή αξιοπιστία πηγής."),
    output: both("Treat the sorted list as a working chronology. Preserve original time values and document normalization decisions.", "Αντιμετώπισε τη λίστα ως working chronology. Διατήρησε αρχικούς χρόνους και τεκμηρίωσε normalization."),
    syntax: "timeline web|disk|memory", example: "timeline web",
  },
  {
    key: "volatility", aliases: ["volatility", "vol.py", "vol"], title: both("Query a memory image", "Ερώτημα σε memory image"),
    purpose: both("Inspect process, socket, environment, browser, command-line, and volatile-user artifacts.", "Έλεγξε process, socket, environment, browser, command-line και volatile-user artifacts."),
    mechanics: both("imageinfo suggests OS/profile; pslist/pstree inspect processes; netscan inspects sockets; envars/cmdline/cmdscan/consoles inspect context; clipboard, browser-history, and MSPaint plugins may recover volatile clues. GameHack returns fixtures only.", "imageinfo προτείνει OS/profile, pslist/pstree processes, netscan sockets, envars/cmdline/cmdscan/consoles context, clipboard/browser/MSPaint volatile clues. Το GameHack δίνει fixtures."),
    output: both("Treat plugins as views into one capture. Correlate PID, owner, time, and endpoint with disk, event, and packet evidence.", "Τα plugins είναι όψεις ενός capture. Συσχέτισε PID, owner, χρόνο και endpoint με disk/event/packet evidence."),
    syntax: "volatility -f DUMP PLUGIN", example: "volatility -f /cases/IR-2404/evidence/08-memory/workstation.raw pstree",
    caution: both("Memory can contain sensitive data. Acquire, analyze, and report it only under proper authority.", "Η μνήμη μπορεί να περιέχει ευαίσθητα δεδομένα, απαιτείται εξουσιοδότηση."),
  },
  {
    key: "memory-acquire", aliases: ["memory-acquire"], title: both("Acquire volatile memory (simulated)", "Απόκτηση volatile μνήμης (προσομοίωση)"),
    purpose: both("Understand why live-memory acquisition must be authorized, timestamped, and verified.", "Κατανόησε γιατί live-memory acquisition θέλει άδεια, timestamp και verification."),
    mechanics: both("DumpIt, FTK Imager, and Redline are acquisition-tool examples. GameHack prints a receipt and creates no host-memory image.", "DumpIt, FTK Imager και Redline είναι εργαλεία acquisition. Το GameHack εμφανίζει receipt και δεν συλλέγει host memory."),
    output: both("The receipt describes a virtual training copy; it does not capture the browser or computer's real RAM.", "Το receipt περιγράφει virtual training copy, δεν συλλαμβάνει πραγματική RAM."),
    syntax: "memory-acquire SOURCE", example: "memory-acquire /cases/IR-2404/evidence/08-memory/workstation.raw",
  },
  {
    key: "gcore", aliases: ["gcore"], title: both("Acquire a process core (simulated)", "Απόκτηση process core (προσομοίωση)"),
    purpose: both("Understand how a process-memory snapshot can support volatile analysis.", "Κατανόησε πώς process-memory snapshot βοηθά volatile analysis."),
    mechanics: both("gcore creates a core dump for a selected PID on real systems. GameHack writes a harmless text fixture and never reads host process memory.", "Το gcore δημιουργεί core dump PID σε πραγματικά συστήματα. Το GameHack γράφει ακίνδυνο text fixture."),
    output: both("The reported path is a derived sandbox artifact; document target PID, acquisition time, and authority.", "Η διαδρομή είναι derived sandbox artifact, κατέγραψε PID, χρόνο και εξουσιοδότηση."),
    syntax: "gcore PID", example: "gcore 2112",
  },
  {
    key: "docker", aliases: ["docker"], title: both("Inspect a container as evidence", "Έλεγχος container ως τεκμήριο"),
    purpose: both("Review configuration, runtime changes, logs, image layers, exports, and memory context.", "Έλεγξε config, runtime changes, logs, image layers, exports και memory."),
    mechanics: both("inspect shows config/state; diff reports A/D/C paths; logs show output; history lists image layers; export is a filesystem snapshot without layer history. No Docker daemon is connected.", "inspect δείχνει config/state, diff A/D/C paths, logs output, history layers, export snapshot χωρίς layer history. Δεν υπάρχει Docker daemon."),
    output: both("Compare the writable-container diff with image history. A later deletion does not erase a secret in an earlier immutable layer.", "Σύγκρινε writable diff με image history. Μεταγενέστερη διαγραφή δεν αφαιρεί secret από παλιότερο immutable layer."),
    syntax: "docker inspect|diff|logs|history|export CONTAINER", example: "docker diff GH-2404",
  },
  {
    key: "rainbow-demo", aliases: ["rainbow-demo"], title: both("Rainbow-table concept (simulated)", "Έννοια rainbow-table (προσομοίωση)"),
    purpose: both("Compare precomputed lookup with salted password storage.", "Σύγκρινε precomputed lookup με salted αποθήκευση κωδικών."),
    mechanics: both("Rainbow tables trade storage for faster lookup against unsalted hashes. Unique salts and slow adaptive KDFs make table reuse impractical.", "Rainbow tables ανταλλάσσουν χώρο για γρήγορο lookup unsalted hashes. Μοναδικά salts και αργά KDFs εμποδίζουν reuse."),
    output: both("The lab returns a canned classroom result, not a computed crack. A salted variant has no match in the toy unsalted table.", "Το lab επιστρέφει canned αποτέλεσμα, όχι crack. Salted variant δεν ταιριάζει σε toy unsalted table."),
    syntax: "rainbow-demo HASH", example: "rainbow-demo 098f6bcd4621d373cade4e832627b4f6",
  },
  {
    key: "docker", aliases: ["docker"], title: both("Inspect a container as evidence", "Έλεγχος container ως τεκμήριο"),
    purpose: both("Review configuration, runtime changes, logs, image layers, export, and memory context.", "Έλεγξε config, runtime changes, logs, image layers, export και memory."),
    mechanics: both("inspect shows config/state; diff reports A/D/C paths; logs show recorded output; history lists build layers; export is a filesystem snapshot and omits image-layer history. No Docker daemon is connected.", "inspect δείχνει config/state, diff A/D/C paths, logs output, history layers, export snapshot χωρίς image history. Δεν υπάρχει Docker daemon."),
    output: both("Compare a container's writable layer with its image history. A later deletion does not erase a secret stored in an earlier immutable layer.", "Σύγκρινε writable layer με image history. Μεταγενέστερη διαγραφή δεν αφαιρεί secret από παλιό immutable layer."),
    syntax: "docker inspect|diff|logs|history|export CONTAINER", example: "docker diff GH-2404",
  },
  {
    key: "rainbow-demo", aliases: ["rainbow-demo"], title: both("Rainbow-table concept (simulated)", "Έννοια rainbow-table (προσομοίωση)"),
    purpose: both("Compare precomputed lookup with salted password storage.", "Σύγκρινε precomputed lookup με salted αποθήκευση κωδικών."),
    mechanics: both("Rainbow tables trade storage for faster lookup against unsalted hashes. Unique salts and slow adaptive password KDFs make table reuse impractical.", "Rainbow tables ανταλλάσσουν χώρο για γρήγορο lookup unsalted hashes. Μοναδικά salts και αργά KDFs εμποδίζουν reuse."),
    output: both("The lab returns a canned classroom result, not a computed crack. A salted variant correctly has no match in the toy unsalted table.", "Το lab επιστρέφει canned αποτέλεσμα, όχι crack υπολογισμένο. Salted variant δεν ταιριάζει σε toy unsalted table."),
    syntax: "rainbow-demo HASH", example: "rainbow-demo 098f6bcd4621d373cade4e832627b4f6",
  },
  {
    key: "pgrep", aliases: ["pgrep"], title: both("Find processes by name", "Εντοπισμός διεργασιών με όνομα"),
    purpose: both("List the PIDs of running processes whose name matches a pattern, before you signal any of them.", "Εμφάνισε τα PID των διεργασιών που ταιριάζουν σε ένα όνομα, πριν στείλεις σήμα σε οποιαδήποτε."),
    mechanics: both("pgrep matches the process name and prints one PID per line. -l adds the name, -a the full command line, -u USER filters by owner, and -f matches the whole command line instead of only the name. The professional habit is to run pgrep first with exactly the pattern you intend to give pkill, so a too-broad match is visible before anything is stopped.", "Η pgrep ταιριάζει το όνομα διεργασίας και εμφανίζει ένα PID ανά γραμμή. Το -l προσθέτει το όνομα, το -a ολόκληρη τη γραμμή εντολής, το -u ΧΡΗΣΤΗΣ φιλτράρει ανά ιδιοκτήτη και το -f ταιριάζει ολόκληρη τη γραμμή εντολής αντί μόνο για το όνομα. Η επαγγελματική συνήθεια είναι να τρέχεις πρώτα pgrep με ακριβώς το μοτίβο που θα δώσεις στην pkill, ώστε ένα πολύ ευρύ ταίριασμα να φαίνεται πριν σταματήσει οτιδήποτε."),
    output: both("The lab reads the simulated per-player process table, so the PIDs you see are training fixtures rather than host processes.", "Το εργαστήριο διαβάζει τον εικονικό πίνακα διεργασιών του παίκτη, οπότε τα PID που βλέπεις είναι fixture εκπαίδευσης και όχι διεργασίες του υπολογιστή."),
    syntax: "pgrep [-l|-a|-f|-u USER] NAME", example: "pgrep -a training",
    caution: both("A substring also matches unrelated programs that contain the same letters; read the list before you act on it.", "Ένα υπόστριγμα ταιριάζει και σε άσχετα προγράμματα που περιέχουν τα ίδια γράμματα, διάβασε τη λίστα πριν ενεργήσεις."),
  },
  {
    key: "pkill", aliases: ["pkill"], title: both("Signal processes by name", "Αποστολή σήματος σε διεργασίες με όνομα"),
    purpose: both("Send a signal to every process whose name matches, without collecting PIDs by hand.", "Στείλε σήμα σε κάθε διεργασία που ταιριάζει στο όνομα, χωρίς να μαζεύεις PID με το χέρι."),
    mechanics: both("pkill uses the same matching rules as pgrep and sends SIGTERM by default; -f matches the full command line and a leading dash selects the signal, as in pkill -9. Because the pattern is a substring match, one careless word can stop several unrelated programs, which is why pgrep comes first.", "Η pkill χρησιμοποιεί τους ίδιους κανόνες ταυτοποίησης με την pgrep και στέλνει SIGTERM από προεπιλογή, το -f ταιριάζει ολόκληρη τη γραμμή εντολής και μια παύλα στην αρχή επιλέγει το σήμα, όπως στο pkill -9. Επειδή το μοτίβο είναι ταίριασμα υποστρίγματος, μία απρόσεκτη λέξη μπορεί να σταματήσει αρκετά άσχετα προγράμματα, γι’ αυτό προηγείται η pgrep."),
    output: both("In this sandbox the matching simulated processes are marked stopped and the action is recorded per player; no host process is signalled.", "Σε αυτό το sandbox οι αντίστοιχες εικονικές διεργασίες σημειώνονται ως σταματημένες και η ενέργεια καταγράφεται ανά παίκτη, καμία διεργασία του υπολογιστή δεν λαμβάνει σήμα."),
    syntax: "pkill [-f] [-SIGNAL] NAME", example: "pkill -f training-worker",
  },
  {
    key: "killall", aliases: ["killall"], title: both("Signal every process with one name", "Σήμα σε όλες τις διεργασίες με ένα όνομα"),
    purpose: both("Terminate all processes that carry exactly one program name.", "Τερμάτισε όλες τις διεργασίες που φέρουν ακριβώς ένα όνομα προγράμματος."),
    mechanics: both("killall matches the exact program name rather than a pattern, which makes it narrower than pkill, and -SIGNAL chooses the signal. It is the right tool when several copies of the same daemon are running and you want all of them gone.", "Η killall ταιριάζει το ακριβές όνομα προγράμματος και όχι μοτίβο, που την κάνει πιο στενή από την pkill, ενώ το -SIGNAL επιλέγει το σήμα. Είναι το κατάλληλο εργαλείο όταν τρέχουν πολλά αντίγραφα του ίδιου δαίμονα και θέλεις να φύγουν όλα."),
    output: both("The simulated processes with that exact name stop; anything else keeps running.", "Οι εικονικές διεργασίες με αυτό ακριβώς το όνομα σταματούν, οτιδήποτε άλλο συνεχίζει."),
    syntax: "killall [-SIGNAL] NAME", example: "killall training-cleanup",
  },
  {
    key: "nohup", aliases: ["nohup"], title: both("Keep running after the shell closes", "Συνέχιση λειτουργίας μετά το κλείσιμο του shell"),
    purpose: both("Let a long command survive the terminal that started it.", "Άσε μια χρονοβόρα εντολή να επιζήσει του τερματικού που την ξεκίνησε."),
    mechanics: both("nohup makes the command ignore SIGHUP, the signal a shell sends to its jobs when it exits, and if you do not redirect output the text is appended to nohup.out in the current directory. Combine it with & to send the job to the background at once. For long interactive work a terminal multiplexer such as tmux or screen is the better tool, because you can reattach and see the output live.", "Η nohup κάνει την εντολή να αγνοεί το SIGHUP, το σήμα που στέλνει ένα shell στις εργασίες του όταν τερματίζει, και αν δεν ανακατευθύνεις την έξοδο το κείμενο προστίθεται στο αρχείο nohup.out στον τρέχοντα κατάλογο. Συνδύασέ την με & για να στείλεις την εργασία στο παρασκήνιο αμέσως. Για πολύωρη διαδραστική δουλειά καλύτερο εργαλείο είναι ένας πολυπλέκτης τερματικού όπως το tmux ή το screen, επειδή μπορείς να ξανασυνδεθείς και να δεις την έξοδο ζωντανά."),
    output: both("The lab records the background job in the player's job table and writes the redirected file inside the virtual filesystem.", "Το εργαστήριο καταγράφει την εργασία παρασκηνίου στον πίνακα εργασιών του παίκτη και γράφει το αρχείο ανακατεύθυνσης μέσα στο εικονικό σύστημα αρχείων."),
    syntax: "nohup COMMAND [> FILE 2>&1] &", example: "nohup /root/scanner > scan.log 2>&1 &",
    caution: both("nohup protects against a closing shell only; a reboot or an explicit kill still ends the command.", "Η nohup προστατεύει μόνο από το κλείσιμο του shell, μια επανεκκίνηση ή ένα ρητό kill τερματίζουν την εντολή."),
  },
  {
    key: "bg", aliases: ["bg"], title: both("Resume a stopped job in the background", "Συνέχιση σταματημένης εργασίας στο παρασκήνιο"),
    purpose: both("Return a job you suspended with Ctrl-Z to the background instead of the foreground.", "Επάναφερε στο παρασκήνιο μια εργασία που διέκοψες με Ctrl-Z, αντί για το προσκήνιο."),
    mechanics: both("Ctrl-Z stops the foreground job, jobs -l lists the jobs with their numbers and PIDs, bg %1 resumes job 1 without giving it the terminal, and fg %1 brings it back to the foreground. The percent sign and the job number are how the shell identifies a job rather than a process.", "Το Ctrl-Z σταματά την εργασία προσκηνίου, το jobs -l εμφανίζει τις εργασίες με τους αριθμούς και τα PID τους, το bg %1 συνεχίζει την εργασία 1 χωρίς να της δώσει το τερματικό και το fg %1 την επαναφέρει στο προσκήνιο. Το ποσοστό και ο αριθμός εργασίας είναι ο τρόπος που το shell αναγνωρίζει μια εργασία και όχι μια διεργασία."),
    output: both("The lab reports the job number, the state change and the command line of the resumed job.", "Το εργαστήριο αναφέρει τον αριθμό της εργασίας, την αλλαγή κατάστασης και τη γραμμή εντολής της εργασίας που συνεχίστηκε."),
    syntax: "bg [%JOB]", example: "bg %1",
  },
  {
    key: "disown", aliases: ["disown"], title: both("Detach a job from the shell", "Αποσύνδεση εργασίας από το shell"),
    purpose: both("Remove a job from the shell's job table so a closing shell does not signal it.", "Αφαίρεσε μια εργασία από τον πίνακα εργασιών του shell ώστε το κλείσιμό του να μην της στείλει σήμα."),
    mechanics: both("disown %1 drops job 1 from the job table, so the shell no longer sends it SIGHUP when it exits. It is the after-the-fact equivalent of starting a command with nohup, and it is what you reach for when you forgot the nohup and the command is already running.", "Το disown %1 αφαιρεί την εργασία 1 από τον πίνακα εργασιών, οπότε το shell δεν της στέλνει πια SIGHUP όταν τερματίζει. Είναι το εκ των υστέρων ισοδύναμο του να ξεκινήσεις μια εντολή με nohup και είναι αυτό που χρησιμοποιείς όταν ξέχασες το nohup και η εντολή τρέχει ήδη."),
    output: both("The job disappears from jobs output while the simulated process keeps running in the background table.", "Η εργασία εξαφανίζεται από την έξοδο της jobs ενώ η εικονική διεργασία συνεχίζει να τρέχει στον πίνακα παρασκηνίου."),
    syntax: "disown [%JOB]", example: "disown %1",
  },
  {
    key: "atq", aliases: ["atq"], title: both("List queued one-time jobs", "Εμφάνιση ουράς εφάπαξ εργασιών"),
    purpose: both("See which one-time jobs are waiting and who queued them.", "Δες ποιες εφάπαξ εργασίες περιμένουν και ποιος τις καταχώρισε."),
    mechanics: both("atq prints one line per queued job with its id, date, time, queue letter and owner. at -c ID prints the full script the daemon would run, which is how you inspect a job before deciding anything about it, and atrm ID cancels it.", "Η atq εμφανίζει μία γραμμή ανά εργασία στην ουρά με το id, την ημερομηνία, την ώρα, το γράμμα ουράς και τον ιδιοκτήτη. Η at -c ID εμφανίζει ολόκληρο το σενάριο που θα εκτελούσε ο δαίμονας, που είναι ο τρόπος να επιθεωρήσεις μια εργασία πριν αποφασίσεις οτιδήποτε, και η atrm ID την ακυρώνει."),
    output: both("The lab lists the per-player simulated queue; it never executes a queued command.", "Το εργαστήριο εμφανίζει την εικονική ουρά του παίκτη και δεν εκτελεί ποτέ καταχωρισμένη εντολή."),
    syntax: "atq", example: "atq",
    caution: both("On a real host an entry nobody on the team scheduled is a persistence clue worth investigating before you delete it.", "Σε πραγματικό host μια εγγραφή που κανείς στην ομάδα δεν προγραμμάτισε είναι ένδειξη εμμονής που αξίζει να ερευνηθεί πριν τη διαγράψεις."),
  },
  {
    key: "atrm", aliases: ["atrm"], title: both("Cancel a queued one-time job", "Ακύρωση εφάπαξ εργασίας στην ουρά"),
    purpose: both("Remove a scheduled job from the queue without running it.", "Αφαίρεσε μια προγραμματισμένη εργασία από την ουρά χωρίς να εκτελεστεί."),
    mechanics: both("atrm takes the numeric id that atq printed and deletes that entry. Inspect first with at -c ID, because on a production host the entry may be a scheduled rollback or a maintenance window somebody else arranged.", "Η atrm δέχεται το αριθμητικό id που εμφάνισε η atq και διαγράφει την εγγραφή. Επιθεώρησε πρώτα με at -c ID, επειδή σε production host η εγγραφή μπορεί να είναι προγραμματισμένη επαναφορά ή παράθυρο συντήρησης που κανόνισε κάποιος άλλος."),
    output: both("The entry leaves the simulated queue; nothing else changes.", "Η εγγραφή φεύγει από την εικονική ουρά και τίποτα άλλο δεν αλλάζει."),
    syntax: "atrm JOB_ID", example: "atrm 1",
  },
  {
    key: "getent", aliases: ["getent"], title: both("Query the resolver the way programs do", "Ερώτημα στον resolver όπως το κάνουν τα προγράμματα"),
    purpose: both("Resolve a name through the same order your programs use, hosts file included.", "Ανάλυσε ένα όνομα με την ίδια σειρά που χρησιμοποιούν τα προγράμματά σου, συμπεριλαμβανομένου του αρχείου hosts."),
    mechanics: both("getent hosts NAME follows the resolver order defined in /etc/nsswitch.conf, which normally reads /etc/hosts before asking a name server. dig and nslookup go straight to a name server and skip the file, so the two can disagree, and when they do the file wins for every program that uses the resolver. That disagreement is the lesson, not an error.", "Η getent hosts NAME ακολουθεί τη σειρά του resolver που ορίζεται στο /etc/nsswitch.conf, η οποία κανονικά διαβάζει το /etc/hosts πριν ρωτήσει name server. Η dig και η nslookup πάνε κατευθείαν σε name server και παρακάμπτουν το αρχείο, οπότε οι δύο μπορεί να διαφωνούν, και όταν διαφωνούν το αρχείο υπερισχύει για κάθε πρόγραμμα που χρησιμοποιεί τον resolver. Αυτή η διαφωνία είναι το μάθημα και όχι σφάλμα."),
    output: both("The address and the names as the resolver sees them, which is what a program will actually connect to.", "Η διεύθυνση και τα ονόματα όπως τα βλέπει ο resolver, που είναι και αυτά στα οποία θα συνδεθεί πραγματικά ένα πρόγραμμα."),
    syntax: "getent hosts NAME", example: "getent hosts gamehack.lab",
  },
  {
    key: "ss", aliases: ["ss"], title: both("Inspect listening sockets", "Έλεγχος υποδοχών ακρόασης"),
    purpose: both("See which ports are open, on which interface, and which process owns them.", "Δες ποιες θύρες είναι ανοιχτές, σε ποια διεπαφή και ποια διεργασία τις κατέχει."),
    mechanics: both("ss is the modern replacement for netstat. -t selects TCP, -u UDP, -l listening sockets, -n numeric output and -p the owning process. Read the local address as a security statement: 0.0.0.0 means every interface, while 127.0.0.1 means only the local machine can connect.", "Η ss είναι ο σύγχρονος αντικαταστάτης της netstat. Το -t επιλέγει TCP, το -u UDP, το -l τις υποδοχές ακρόασης, το -n την αριθμητική έξοδο και το -p τη διεργασία ιδιοκτήτη. Διάβασε την τοπική διεύθυνση ως δήλωση ασφάλειας: το 0.0.0.0 σημαίνει κάθε διεπαφή, ενώ το 127.0.0.1 σημαίνει ότι μόνο το τοπικό μηχάνημα μπορεί να συνδεθεί."),
    output: both("The lab lists the listeners of its simulated services; when none is running it says so instead of inventing a socket.", "Το εργαστήριο εμφανίζει τις υποδοχές ακρόασης των εικονικών υπηρεσιών του, και όταν δεν τρέχει καμία το λέει αντί να επινοήσει socket."),
    syntax: "ss [-tulpna] [FILTER]", example: "ss -tlnp",
  },
  {
    key: "systemctl", aliases: ["systemctl"], title: both("Control and inspect systemd units", "Έλεγχος μονάδων systemd"),
    purpose: both("Start, stop, enable and interrogate services, and list scheduled timers.", "Ξεκίνα, σταμάτα, ενεργοποίησε και εξέτασε υπηρεσίες, και εμφάνισε τα προγραμματισμένα χρονόμετρα."),
    mechanics: both("systemctl start, stop, restart and reload act now; enable and disable change what happens at boot. status prints the unit file and both states at once, is-active answers the running question in one word and is-enabled answers the boot question, and list-timers shows scheduled timer units. Debian names the scheduler cron while the Red Hat family names it crond.", "Οι systemctl start, stop, restart και reload δρουν τώρα, οι enable και disable αλλάζουν το τι συμβαίνει στην εκκίνηση. Η status εμφανίζει το unit file και τις δύο καταστάσεις μαζί, η is-active απαντά με μία λέξη στο ερώτημα της λειτουργίας και η is-enabled στο ερώτημα της εκκίνησης, ενώ η list-timers εμφανίζει τις προγραμματισμένες μονάδες χρονομέτρων. Στο Debian ο scheduler ονομάζεται cron ενώ στην οικογένεια Red Hat ονομάζεται crond."),
    output: both("Loaded tells you whether the unit starts at boot and Active whether it runs now; a unit can be enabled and inactive at the same time.", "Το Loaded λέει αν η μονάδα εκκινεί στο boot και το Active αν εκτελείται τώρα, μια μονάδα μπορεί να είναι ταυτόχρονα enabled και inactive."),
    syntax: "systemctl ACTION [UNIT]", example: "systemctl is-active cron",
  },
  {
    key: "journalctl", aliases: ["journalctl"], title: both("Read the systemd journal", "Ανάγνωση του systemd journal"),
    purpose: both("Review recorded service and authentication activity over a time window.", "Εξέτασε την καταγεγραμμένη δραστηριότητα υπηρεσιών και ταυτοποίησης σε χρονικό παράθυρο."),
    mechanics: both("journalctl reads the systemd journal. -u UNIT filters by unit, --since and --until set the window, -f follows new entries and -n limits the number of lines. For SSH the useful unit is ssh on Debian and sshd on the Red Hat family.", "Η journalctl διαβάζει το systemd journal. Το -u UNIT φιλτράρει ανά μονάδα, τα --since και --until ορίζουν το παράθυρο, το -f ακολουθεί τις νέες εγγραφές και το -n περιορίζει τον αριθμό γραμμών. Για το SSH η χρήσιμη μονάδα είναι ssh στο Debian και sshd στην οικογένεια Red Hat."),
    output: both("Timestamped journal lines for the unit, which is where a burst of failed logins becomes visible.", "Χρονοσημασμένες γραμμές journal για τη μονάδα, που είναι το σημείο όπου μια έκρηξη αποτυχημένων συνδέσεων γίνεται ορατή."),
    syntax: "journalctl [-u UNIT] [--since TIME] [-f] [-n LINES]", example: "journalctl -u ssh",
  },
  {
    key: "apache2ctl", aliases: ["apache2ctl"], title: both("Test and control the web service", "Δοκιμή και έλεγχος της web υπηρεσίας"),
    purpose: both("Validate an Apache configuration before reloading it, and show the virtual-host layout.", "Επικύρωσε τις ρυθμίσεις του Apache πριν τις επαναφορτώσεις και εμφάνισε τη διάταξη των virtual hosts."),
    mechanics: both("apache2ctl configtest parses every configuration file and answers Syntax OK without opening a port, apache2ctl -S prints the virtual-host layout, and start, stop, restart or graceful control the daemon. On systemd machines the same verbs are written systemctl start apache2; service is a thin wrapper over it.", "Η apache2ctl configtest διαβάζει όλα τα αρχεία ρυθμίσεων και απαντά Syntax OK χωρίς να ανοίξει θύρα, η apache2ctl -S εμφανίζει τη διάταξη των virtual hosts και οι start, stop, restart ή graceful ελέγχουν τον δαίμονα. Σε μηχανήματα με systemd τα ίδια ρήματα γράφονται systemctl start apache2, ενώ η service είναι απλό wrapper από πάνω."),
    output: both("Syntax OK means the configuration parses; it does not mean the site serves the content you expect.", "Το Syntax OK σημαίνει ότι οι ρυθμίσεις διαβάζονται, δεν σημαίνει ότι ο ιστότοπος εξυπηρετεί το περιεχόμενο που περιμένεις."),
    syntax: "apache2ctl configtest|-S|start|stop|restart|graceful", example: "apache2ctl configtest",
  },
  {
    key: "sshd", aliases: ["sshd"], title: both("Check the SSH daemon configuration", "Έλεγχος ρύθμισης του δαίμονα SSH"),
    purpose: both("Validate the daemon configuration and print the settings it will actually enforce.", "Επικύρωσε τις ρυθμίσεις του δαίμονα και εμφάνισε αυτές που θα εφαρμόσει πραγματικά."),
    mechanics: both("sshd -t parses the configuration and exits quietly when it is valid, which is the check to run before every reload. sshd -T prints the effective configuration after every Include has been merged, and it is the only reliable way to see what the daemon will enforce, because a commented line is a default and not a decision.", "Η sshd -t διαβάζει τις ρυθμίσεις και τερματίζει σιωπηλά όταν είναι έγκυρες, που είναι ο έλεγχος πριν από κάθε επαναφόρτωση. Η sshd -T εμφανίζει την ενεργή ρύθμιση αφού συγχωνευτούν όλα τα Include και είναι ο μόνος αξιόπιστος τρόπος να δεις τι θα εφαρμόσει ο δαίμονας, επειδή μια σχολιασμένη γραμμή είναι προεπιλογή και όχι απόφαση."),
    output: both("A quiet exit means valid syntax; the -T listing shows directive names in lower case with their effective values.", "Η σιωπηλή έξοδος σημαίνει έγκυρη σύνταξη, η λίστα της -T εμφανίζει τα ονόματα των οδηγιών με πεζά και τις ενεργές τιμές τους."),
    syntax: "sshd -t | sshd -T", example: "sshd -T",
  },
  {
    key: "ssh-copy-id", aliases: ["ssh-copy-id"], title: both("Install your public key on a server", "Εγκατάσταση του δημόσιου κλειδιού σου σε server"),
    purpose: both("Authorise an existing key pair on a server you administer, without editing files by hand.", "Εξουσιοδότησε ένα υπάρχον ζεύγος κλειδιών σε server που διαχειρίζεσαι, χωρίς να επεξεργάζεσαι αρχεία με το χέρι."),
    mechanics: both("ssh-copy-id USER@HOST appends your public key to that account's ~/.ssh/authorized_keys and sets the permissions OpenSSH requires. It copies only the public half; the private key never leaves the client. Test the key login before you disable password authentication, or you can lock yourself out.", "Η ssh-copy-id ΧΡΗΣΤΗΣ@HOST προσθέτει το δημόσιο κλειδί σου στο ~/.ssh/authorized_keys εκείνου του λογαριασμού και ορίζει τα δικαιώματα που απαιτεί το OpenSSH. Αντιγράφει μόνο το δημόσιο μισό, το ιδιωτικό κλειδί δεν φεύγει ποτέ από τον client. Δοκίμασε τη σύνδεση με κλειδί πριν απενεργοποιήσεις την ταυτοποίηση με κωδικό, αλλιώς μπορεί να κλειδωθείς έξω."),
    output: both("The lab records the simulated public key in the fictional account and leaves the real filesystem untouched.", "Το εργαστήριο καταγράφει το εικονικό δημόσιο κλειδί στον φανταστικό λογαριασμό και δεν αγγίζει το πραγματικό σύστημα αρχείων."),
    syntax: "ssh-copy-id [-i KEY.pub] USER@HOST", example: "ssh-copy-id labuser@10.10.10.12",
  },
  {
    key: "sort", aliases: ["sort"], title: both("Put lines in order", "Ταξινόμηση γραμμών"),
    purpose: both("Bring order to output so patterns and duplicates become visible.", "Βάλε τάξη στην έξοδο ώστε να φανούν μοτίβα και διπλοεγγραφές."),
    mechanics: both("sort reads lines and writes them back in order: alphabetical by default, numeric with -n, reverse with -r, and by a chosen field with -k. Pipe it after grep or cut when the interesting column is not the first one. Combined with uniq it collapses repeats, but uniq only removes neighbours, so sort first.", "Η sort διαβάζει γραμμές και τις επιστρέφει ταξινομημένες: αλφαβητικά από προεπιλογή, αριθμητικά με -n, ανάποδα με -r και με επιλεγμένο πεδίο με -k. Βάλε την σε pipe μετά από grep ή cut όταν το ενδιαφέρον πεδίο δεν είναι το πρώτο. Μαζί με την uniq διώχνει τις επαναλήψεις, όμως η uniq αφαιρεί μόνο γειτονικές, οπότε ταξινόμησε πρώτα."),
    output: both("The same lines you fed in, reordered. A count that changes after uniq tells you how many duplicates the original held.", "Οι ίδιες γραμμές που έδωσες, αναδιαταγμένες. Ένα πλήθος που αλλάζει μετά την uniq δείχνει πόσες διπλοεγγραφές υπήρχαν."),
    syntax: "sort [-n] [-r] [-k FIELD] [FILE]", example: "sort -n /root/linux-beginners-2/network/interfaces.txt",
  },
  {
    key: "wc", aliases: ["wc"], title: both("Count lines, words and bytes", "Μέτρηση γραμμών, λέξεων και bytes"),
    purpose: both("Turn a file or a stream into a number you can compare against something else.", "Κάνε ένα αρχείο ή μια ροή έναν αριθμό που μπορείς να συγκρίνεις."),
    mechanics: both("wc prints newlines, words and bytes in that order. -l keeps only the line count, which is the one you usually want. Because it reads standard input, it belongs at the end of a pipe: command | wc -l counts what survived the filtering, not what the file holds.", "Η wc εμφανίζει νέες γραμμές, λέξεις και bytes με αυτή τη σειρά. Η -l κρατά μόνο το πλήθος γραμμών, που συνήθως είναι αυτό που θέλεις. Επειδή διαβάζει standard input, μπαίνει στο τέλος ενός pipe: command | wc -l μετρά ό,τι επέζησε από το φιλτράρισμα, όχι ό,τι περιέχει το αρχείο."),
    output: both("Three numbers, or one with -l. A log with more lines than expected is a lead, not an answer; read a sample before you conclude anything.", "Τρεις αριθμοί, ή ένας με -l. Ένα αρχείο καταγραφής με περισσότερες γραμμές από το αναμενόμενο είναι ένδειξη, όχι απάντηση· διάβασε ένα δείγμα πριν καταλήξεις."),
    syntax: "wc [-l] [-w] [-c] [FILE]", example: "wc -l /var/log/auth.log",
  },
  {
    key: "who", aliases: ["who"], title: both("List the sessions on this host", "Λίστα συνεδριών στον host"),
    purpose: both("See which accounts are signed in right now, and from where.", "Δες ποιοι λογαριασμοί είναι συνδεδεμένοι τώρα και από πού."),
    mechanics: both("who reads the utmp record of live sessions and prints user, terminal, and login time. who am i narrows it to your own session, which is the quick way to learn the account and source address your current privileges belong to.", "Η who διαβάζει την εγγραφή utmp με τις ζωντανές συνεδρίες και εμφανίζει χρήστη, τερματικό και ώρα σύνδεσης. Η who am i την περιορίζει στη δική σου συνεδρία, που είναι ο γρήγορος τρόπος να μάθεις τον λογαριασμό και τη διεύθυνση προέλευσης στην οποία ανήκουν τα τρέχοντα δικαιώματά σου."),
    output: both("One line per session. On a lab host an empty list simply means nobody else is signed in, not that the command failed.", "Μία γραμμή ανά συνεδρία. Σε έναν εργαστηριακό host μια κενή λίστα σημαίνει απλώς ότι δεν είναι συνδεδεμένος κανείς άλλος, όχι ότι η εντολή απέτυχε."),
    syntax: "who | who am i", example: "who am i",
  },
  {
    key: "testparm", aliases: ["testparm"], title: both("Check a Samba configuration", "Έλεγχος ρυθμίσεων Samba"),
    purpose: both("Confirm Samba can parse its own configuration before you judge what it exposes.", "Επιβεβαίωσε ότι η Samba διαβάζει τις ρυθμίσεις της πριν κρίνεις τι εκθέτει."),
    mechanics: both("testparm reads smb.conf, reports syntax errors, and prints the settings Samba actually applies. -s skips the interactive pause and writes the effective configuration to standard output, which is the version worth reading: it shows defaults you never wrote in the file.", "Η testparm διαβάζει το smb.conf, αναφέρει συντακτικά λάθη και εμφανίζει τις ρυθμίσεις που εφαρμόζει πραγματικά η Samba. Η -s παραλείπει την παύση και γράφει την ενεργή διαμόρφωση στην standard output, που είναι η εκδοχή που αξίζει να διαβάσεις: δείχνει προεπιλογές που δεν έγραψες ποτέ στο αρχείο."),
    output: both("Load smb config files up to the version line, then each share in brackets with its parameters. guest ok = yes on a share is the setting that lets an unauthenticated user in.", "Φόρτωση του smb config μέχρι τη γραμμή έκδοσης και μετά κάθε share σε αγκύλες με τις παραμέτρους του. Το guest ok = yes σε ένα share είναι η ρύθμιση που επιτρέπει την είσοδο χωρίς ταυτοποίηση."),
    syntax: "testparm [-s] [smb.conf]", example: "testparm -s",
  },
  {
    key: "smbclient", aliases: ["smbclient"], title: both("Browse a share like an FTP session", "Περιήγηση σε share σαν συνεδρία FTP"),
    purpose: both("List and pull files from an SMB share from the command line.", "Εμφάνισε και κατέβασε αρχεία από ένα SMB share μέσω γραμμής εντολών."),
    mechanics: both("-L asks a host for its share list, and //HOST/SHARE opens one as an interactive session with ls, cd, get and bye. -N means no password, which is exactly the test for a guest-accessible share: if the listing arrives, the share did not ask who you are.", "Η -L ζητά από έναν host τη λίστα των share του και η //HOST/SHARE ανοίγει ένα ως διαδραστική συνεδρία με ls, cd, get και bye. Η -N σημαίνει χωρίς κωδικό, που είναι ακριβώς ο έλεγχος για share προσβάσιμο από guest: αν έρθει η λίστα, το share δεν ρώτησε ποιος είσαι."),
    output: both("Share names with their type and comment, then a directory listing inside the session. A Domain and OS line describes the server, not your access level.", "Ονόματα share με τύπο και σχόλιο και μετά η λίστα καταλόγου μέσα στη συνεδρία. Μια γραμμή Domain και OS περιγράφει τον server, όχι το επίπεδο πρόσβασής σου."),
    syntax: "smbclient -N -L //HOST | smbclient //HOST/SHARE -N", example: "smbclient -N -L //192.168.1.9",
    caution: both("Only run this against lab hosts you are authorised to test. An open share on someone else's network is a finding to report, not a place to look around.", "Τρέξε την μόνο σε εργαστηριακούς host που έχεις άδεια να ελέγξεις. Ένα ανοιχτό share σε δίκτυο άλλου είναι εύρημα προς αναφορά, όχι μέρος για εξερεύνηση."),
  },
  {
    key: "nxc", aliases: ["nxc", "netexec"], title: both("Enumerate shares across a protocol", "Απαρίθμηση share σε ένα πρωτόκολλο"),
    purpose: both("Ask a service what it publishes, in one pass instead of one connection at a time.", "Ρώτησε μια υπηρεσία τι δημοσιεύει, σε ένα πέρασμα αντί για μία σύνδεση τη φορά."),
    mechanics: both("nxc PROTOCOL TARGET speaks SMB or NFS and reports what it finds. --shares lists shares, --ls walks a path, and --get-file copies one file. Supplying -u guest -p '' is not a shortcut, it is the question: does this service answer an account with no password?", "Η nxc ΠΡΩΤΟΚΟΛΛΟ ΣΤΟΧΟΣ μιλάει SMB ή NFS και αναφέρει ό,τι βρίσκει. Η --shares εμφανίζει τα share, η --ls διασχίζει μια διαδρομή και η --get-file αντιγράφει ένα αρχείο. Το -u guest -p '' δεν είναι συντόμευση, είναι η ερώτηση: απαντά αυτή η υπηρεσία σε λογαριασμό χωρίς κωδικό;"),
    output: both("One line per share or file with a status marker. Read it as a claim about the target and confirm anything important with a second tool.", "Μία γραμμή ανά share ή αρχείο με δείκτη κατάστασης. Διάβασέ την ως ισχυρισμό για τον στόχο και επιβεβαίωσε ό,τι σημαντικό με δεύτερο εργαλείο."),
    syntax: "nxc smb|nfs TARGET [--shares | --ls PATH | --get-file F] [-u USER -p PASS]", example: "nxc smb 192.168.1.9 --shares -u 'guest' -p ''",
    caution: both("This is an assessment tool. Use it only on lab targets you own or are contracted to test.", "Αυτό είναι εργαλείο αξιολόγησης. Χρησιμοποίησέ το μόνο σε εργαστηριακούς στόχους που σου ανήκουν ή έχεις σύμβαση να ελέγξεις."),
  },
  {
    key: "exportfs", aliases: ["exportfs"], title: both("Show what NFS is publishing", "Εμφάνιση όσων δημοσιεύει το NFS"),
    purpose: both("Read the server side of an NFS share without re-reading the file that configured it.", "Διάβασε την πλευρά του server σε ένα NFS share χωρίς να ξαναδιαβάσεις το αρχείο που το ρύθμισε."),
    mechanics: both("exportfs prints the exports the NFS server is currently offering, with the option list it applied. -v adds the resolved options per host, which is where no_root_squash and insecure become visible; -a re-exports everything from /etc/exports.", "Η exportfs εμφανίζει τα exports που προσφέρει αυτή τη στιγμή ο NFS server μαζί με τη λίστα επιλογών που εφάρμοσε. Η -v προσθέτει τις επιλυμένες επιλογές ανά host, όπου γίνονται ορατά τα no_root_squash και insecure· η -a republικά όλα τα exports από το /etc/exports."),
    output: both("One line per export with its path and options. no_root_squash means a client root stays root on your files, which is the setting that turns a share into a takeover.", "Μία γραμμή ανά export με διαδρομή και επιλογές. Το no_root_squash σημαίνει ότι ο root του client μένει root στα αρχεία σου, που είναι η ρύθμιση η οποία μετατρέπει ένα share σε ανάληψη ελέγχου."),
    syntax: "exportfs [-v] [-a]", example: "exportfs -v",
  },
  {
    key: "showmount", aliases: ["showmount"], title: both("Ask a host what it exports", "Ερώτηση σε host για τα exports του"),
    purpose: both("Enumerate NFS exports from the client side, the way an outsider would.", "Απαρίθμησε NFS exports από την πλευρά του client, όπως θα το έκανε ένας έξω."),
    mechanics: both("showmount -e HOST queries the target's mount daemon and lists what it exports, optionally with the hosts allowed to mount each one. It needs no credentials, which is precisely why an unfiltered exports list is a disclosure.", "Η showmount -e HOST ρωτά τον mount daemon του στόχου και εμφανίζει ό,τι εξάγει, προαιρετικά με τους host που επιτρέπεται να το προσαρτήσουν. Δεν χρειάζεται credentials, που είναι ακριβώς ο λόγος γιατί μια αφιλτράριστη λίστα exports αποτελεί αποκάλυψη."),
    output: both("An Export list for the host, one path per line. Compare it with exportfs -v on the server: the two views describe the same configuration from opposite ends.", "Μια Export list για τον host, μία διαδρομή ανά γραμμή. Σύγκρινέ την με την exportfs -v στον server: οι δύο όψεις περιγράφουν την ίδια διαμόρφωση από αντίθετες πλευρές."),
    syntax: "showmount -e HOST", example: "showmount -e 192.168.1.9",
  },
  {
    key: "rpcinfo", aliases: ["rpcinfo"], title: both("List the RPC services on a host", "Λίστα υπηρεσιών RPC σε έναν host"),
    purpose: both("Find out which RPC programs a host answers, and on which ports.", "Μάθε σε ποια προγράμματα RPC απαντά ένας host και σε ποιες θύρες."),
    mechanics: both("rpcinfo -p HOST asks the portmapper for its registration table. NFS and its mount daemon register there, so the program and version numbers tell you which NFS family the host runs before you try to mount anything.", "Η rpcinfo -p HOST ζητά από τον portmapper τον πίνακα εγγραφών του. Το NFS και ο mount daemon του εγγράφονται εκεί, οπότε οι αριθμοί προγράμματος και έκδοσης σου λένε ποια οικογένεια NFS τρέχει ο host πριν δοκιμάσεις να προσαρτήσεις οτιδήποτε."),
    output: both("Columns of program, version, protocol and port. 100003 is NFS and 100005 is the mount daemon; a host showing both is offering file shares over RPC.", "Στήλες με πρόγραμμα, έκδοση, πρωτόκολλο και θύρα. Το 100003 είναι το NFS και το 100005 ο mount daemon· ένας host που δείχνει και τα δύο προσφέρει κοινά αρχεία μέσω RPC."),
    syntax: "rpcinfo -p HOST", example: "rpcinfo -p 192.168.1.9",
  },
  {
    key: "mount", aliases: ["mount"], title: both("Attach a filesystem to a directory", "Προσάρτηση συστήματος αρχείων σε κατάλογο"),
    purpose: both("Make a remote or local filesystem readable at a path you choose.", "Κάνε ένα απομακρυσμένο ή τοπικό σύστημα αρχείων αναγνώσιμο σε μια διαδρομή που επιλέγεις."),
    mechanics: both("mount -t TYPE SOURCE TARGET attaches SOURCE at TARGET, creating the directory first if needed. For NFS the source is written HOST:/exported/path. The mount only inherits the permissions the server granted, so what you can read afterwards is decided on the other end, not by this command.", "Η mount -t ΤΥΠΟΣ ΠΗΓΗ ΣΤΟΧΟΣ προσαρτά την ΠΗΓΗ στον ΣΤΟΧΟ, δημιουργώντας πρώτα τον κατάλογο αν χρειάζεται. Για NFS η πηγή γράφεται HOST:/exported/path. Η προσάρτηση κληρονομεί μόνο τα δικαιώματα που παραχώρησε ο server, οπότε τι διαβάζεις μετά το αποφασίζει η άλλη πλευρά, όχι αυτή η εντολή."),
    output: both("Silence on success, an error naming the reason on failure. Plain mount with no arguments lists what is currently attached and with which options.", "Σιωπή στην επιτυχία και σφάλμα που κατονομάζει τον λόγο στην αποτυχία. Η απλή mount χωρίς ορίσματα εμφανίζει ό,τι είναι προσαρτημένο τώρα και με ποιες επιλογές."),
    syntax: "mount [-t TYPE] SOURCE TARGET", example: "mount -t nfs 192.168.1.9:/srv/nfs/public /tmp/nfs",
  },
  {
    key: "umount", aliases: ["umount"], title: both("Detach a mounted filesystem", "Αποπροσάρτηση συστήματος αρχείων"),
    purpose: both("Leave the lab the way you found it, and release what you attached.", "Άσε το εργαστήριο όπως το βρήκες και απελευθέρωσε ό,τι προσάρτησες."),
    mechanics: both("umount TARGET detaches the filesystem mounted at TARGET. It refuses while a shell is still inside the mount point or a file there is open, so step out first. Note the spelling: no n after the u.", "Η umount ΣΤΟΧΟΣ αποπροσαρτά το σύστημα αρχείων που είναι προσαρτημένο στον ΣΤΟΧΟ. Αρνείται όσο ένα shell βρίσκεται ακόμα μέσα στο σημείο προσάρτησης ή κάποιο αρχείο εκεί είναι ανοιχτό, οπότε βγες πρώτα έξω. Πρόσεξε την ορθογραφία: χωρίς n μετά το u."),
    output: both("Nothing on success. A target is busy message means something still holds it open, and the fix is to leave the directory rather than force the unmount.", "Τίποτα στην επιτυχία. Το μήνυμα target is busy σημαίνει ότι κάτι ακόμα το κρατά ανοιχτό και η λύση είναι να βγεις από τον κατάλογο, όχι να επιβάλεις την αποπροσάρτηση."),
    syntax: "umount TARGET", example: "umount /tmp/nfs",
  },
  {
    key: "tee", aliases: ["tee"], title: both("See the output and keep a copy", "Δες την έξοδο και κράτα αντίγραφο"),
    purpose: both("Watch a pipeline result on screen while the same bytes land in a file you can quote later.", "Παρακολούθησε το αποτέλεσμα μιας διαδοχής στην οθόνη ενώ τα ίδια bytes πέφτουν σε αρχείο που μπορείς να παραθέσεις αργότερα."),
    mechanics: both("tee sits in the middle of a pipe: it reads standard input, writes it to every file you name, and passes the same text on to the next command. -a appends instead of overwriting. Because it forwards what it received, the stage after tee still filters the full stream rather than the file.", "Η tee κάθεται στη μέση μιας διαδοχής: διαβάζει την standard input, τη γράφει σε κάθε αρχείο που ονομάζεις και προωθεί το ίδιο κείμενο στην επόμενη εντολή. Η -a προσθέτει αντί να αντικαθιστά. Επειδή προωθεί ό,τι παρέλαβε, το στάδιο μετά την tee φιλτράρει ακόμα την πλήρη ροή και όχι το αρχείο."),
    output: both("The same text again on screen, plus a file that now holds it. That file is your evidence: it records what the command printed, not what you remember it printing.", "Το ίδιο κείμενο ξανά στην οθόνη, συν ένα αρχείο που τώρα το περιέχει. Αυτό το αρχείο είναι το τεκμήριό σου: καταγράφει τι τύπωσε η εντολή, όχι τι θυμάσαι ότι τύπωσε."),
    syntax: "tee [-a] FILE...", example: "ifconfig | tee /tmp/net.txt | grep inet",
    caution: both("Every file you name is created or truncated, so a typo in the path costs you the previous contents.", "Κάθε αρχείο που ονομάζεις δημιουργείται ή μηδενίζεται, οπότε ένα τυπογραφικό στη διαδρομή σου κοστίζει τα προηγούμενα περιεχόμενα."),
  },
  {
    key: "tree", aliases: ["tree"], title: both("Draw the directory shape", "Σχεδίαση της δομής καταλόγων"),
    purpose: both("See the layout of a directory tree at a glance instead of paging through repeated ls calls.", "Δες τη διάταξη ενός δέντρου καταλόγων με μία ματιά αντί να ξεφυλλίζεις επαναλαμβανόμενες ls."),
    mechanics: both("tree walks a directory recursively and prints it indented, one line per entry, with directory and file totals at the end. -L N stops the walk N levels down, which is what keeps the output readable on a real system. With no path it starts at the current directory.", "Η tree διασχίζει έναν κατάλογο αναδρομικά και τον εμφανίζει με εσοχή, μία γραμμή ανά στοιχείο, με τα σύνολα καταλόγων και αρχείων στο τέλος. Η -L N σταματά τη διαδρομή N επίπεδα κάτω, που είναι αυτό που κρατά την έξοδο αναγνώσιμη σε ένα πραγματικό σύστημα. Χωρίς διαδρομή ξεκινά από τον τρέχοντα κατάλογο."),
    output: both("The tree, then a closing line such as 3 directories, 12 files. Compare that shape against what the service is supposed to hold; an unexpected branch is a lead worth opening.", "Το δέντρο και μετά μια καταληκτική γραμμή όπως 3 directories, 12 files. Σύγκρινε αυτό το σχήμα με ό,τι υποτίθεται ότι κρατά η υπηρεσία· ένας απρόσμενος κλάδος είναι ένδειξη που αξίζει να ανοίξεις."),
    syntax: "tree [-L LEVEL] [DIR]", example: "tree -L 2 /etc",
  },
  {
    key: "type", aliases: ["type"], title: both("Ask the shell what a name really is", "Ρώτα το shell τι είναι πραγματικά ένα όνομα"),
    purpose: both("Learn whether a name resolves to a real executable, a shell builtin, an alias or a function before you trust how it behaves.", "Μάθε αν ένα όνομα αντιστοιχεί σε πραγματικό εκτελέσιμο, σε ενσωματωμένη εντολή του shell, σε ψευδώνυμο ή σε συνάρτηση, πριν εμπιστευτείς πώς συμπεριφέρεται."),
    mechanics: both("type asks the shell itself, so it reports what the shell will actually run, including builtins and aliases that which and whereis cannot see. That difference matters: which searches $PATH, while type reports the resolution order the shell really uses.", "Η type ρωτά το ίδιο το shell, οπότε αναφέρει τι θα εκτελέσει πραγματικά, συμπεριλαμβανομένων ενσωματωμένων εντολών και ψευδωνύμων που η which και η whereis δεν βλέπουν. Αυτή η διαφορά μετράει: η which ψάχνει στο $PATH, ενώ η type αναφέρει τη σειρά επίλυσης που χρησιμοποιεί πραγματικά το shell."),
    output: both("One line naming the kind and, for a real file, its path. is /usr/bin/ls means a file on disk; is a shell builtin means there is no file to inspect.", "Μία γραμμή που ονομάζει το είδος και, για πραγματικό αρχείο, τη διαδρομή του. Το is /usr/bin/ls σημαίνει αρχείο στον δίσκο· το is a shell builtin σημαίνει ότι δεν υπάρχει αρχείο να επιθεωρήσεις."),
    syntax: "type NAME...", example: "type ls",
  },
  {
    key: "umask", aliases: ["umask"], title: both("The mask behind new-file permissions", "Η μάσκα πίσω από τα δικαιώματα των νέων αρχείων"),
    purpose: both("Understand why a file you just created came out 644, and change that default before you create something sensitive.", "Κατάλαβε γιατί ένα αρχείο που μόλις δημιούργησες βγήκε 644 και άλλαξε αυτή την προεπιλογή πριν δημιουργήσεις κάτι ευαίσθητο."),
    mechanics: both("The kernel starts from a base of 666 for files and 777 for directories and removes the bits set in your umask. With the usual 022 that yields 644 and 755, which is exactly why touch produced -rw-r--r--. umask alone prints the current value; umask 077 makes everything you create from then on private to you.", "Ο πυρήνας ξεκινά από βάση 666 για αρχεία και 777 για καταλόγους και αφαιρεί τα bits που είναι ενεργά στη umask σου. Με τη συνηθισμένη 022 αυτό δίνει 644 και 755, που είναι ακριβώς ο λόγος που η touch παρήγαγε -rw-r--r--. Η umask μόνη της εμφανίζει την τρέχουσα τιμή· η umask 077 κάνει ό,τι δημιουργήσεις από εδώ και πέρα ιδιωτικό σε εσένα."),
    output: both("A four-digit octal value such as 0022. Read it as what is removed, not as what is granted.", "Μια τετραψήφια οκταδική τιμή όπως 0022. Διάβασέ την ως αυτό που αφαιρείται, όχι ως αυτό που χορηγείται."),
    syntax: "umask [NNN]", example: "umask 077",
    caution: both("The mask only affects files created after you set it; files that already exist keep the permissions they have.", "Η μάσκα επηρεάζει μόνο αρχεία που δημιουργούνται μετά τον ορισμό της· τα αρχεία που ήδη υπάρχουν κρατούν τα δικαιώματα που έχουν."),
  },
];

export function commandLessonForName(name: string): CommandLesson | undefined {
  const normalized = name.toLowerCase();
  const matches = COMMAND_GUIDE.filter((lesson) => lesson.key === normalized || lesson.aliases.some((alias) => alias === normalized));
  return matches[matches.length - 1];
}

function fallbackLesson(command: string): CommandLesson {
  return {
    key: "fallback",
    aliases: [],
    title: both(`Result from ${command || "shell"}`, `Αποτέλεσμα από ${command || "shell"}`),
    purpose: both("See how the shell or lab tool responded to this input.", "Δες πώς απάντησε το shell ή το εργαλείο του lab σε αυτή την είσοδο."),
    mechanics: both("This command does not have a dedicated entry in the command library yet. Use its help/manual page and compare the syntax with the lab output.", "Αυτή η εντολή δεν έχει ακόμη ξεχωριστή εγγραφή στη βιβλιοθήκη. Χρησιμοποίησε help/manual και σύγκρινε σύνταξη με έξοδο."),
    output: both("Use the terminal output and exit status below as the source of truth. Errors usually point to spelling, arguments, path, or permissions.", "Χρησιμοποίησε την έξοδο και το exit status παρακάτω. Τα σφάλματα συνήθως δείχνουν ορθογραφία, ορίσματα, διαδρομή ή δικαιώματα."),
    syntax: command || "COMMAND",
    example: command || "help",
  };
}

export function commandLessonForLabel(label: string): CommandLesson | undefined {
  const text = label.toLowerCase();
  if (text.includes("|")) return commandLessonForName("pipeline");
  if (/\bsudo\b/.test(text)) return commandLessonForName("sudo");
  if (/^\s*\d+\s+\d+\s+\*/.test(text)) return commandLessonForName("crontab");
  if (/\b(get|bye|anonymous)\b/.test(text)) return commandLessonForName("ftp");
  if (/&/.test(text) && /cmd|command|background|nano/.test(text)) return commandLessonForName("jobs");
  if (/^[a-z_][a-z0-9_]*\s*=/.test(text.trim())) return commandLessonForName("env");
  if (/^\s*histsize\s*=/.test(text)) return commandLessonForName("env");
  if (/^\s*(\.\/|\.\.\/|\/[A-Za-z0-9_.])/.test(text)) return commandLessonForName("bash");
  if (/rot13|decode/.test(text)) return commandLessonForName("rot13");
  if (/tab/.test(text)) return commandLessonForName("tab");
  if (/↑|↓|history/.test(text)) return commandLessonForName("history");
  const candidates = COMMAND_GUIDE
    .flatMap((lesson) => lesson.aliases.map((alias) => ({ lesson, alias })) )
    .sort((a, b) => b.alias.length - a.alias.length);
  return candidates.reverse().find(({ alias }) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[\\s/])${escaped}(?=$|[\\s/])`, "i").test(text);
  })?.lesson;
}

function commandNames(raw: string, terminal?: Terminal, respectSessionState = true) {
  if (respectSessionState && terminal?.ftp && !/^ftp\b/i.test(raw.trim())) return ["ftp"];
  return splitPipes(raw.replace(/\s+>>?\s+\S+\s*$/, "")).map((part) => {
    const args = parseArgs(part.replace(/^\s*/, ""));
    const first = args[0] || "";
    if (first === "sudo") return "sudo";
    if (first.startsWith("./") || first.startsWith("/")) return "bash";
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(first)) return "export";
    return first.toLowerCase();
  });
}

function referenceCommandNames(reference: string) {
  const expanded = reference.split(/\s+\/\s+(?=[A-Za-z0-9_.])/);
  return expanded.flatMap((entry) => commandNames(entry, undefined, false));
}

export function relevantCommandFamiliesForModule(module: Module, raw: string, terminal: Terminal): string[] {
  const executedNames = commandNames(raw, terminal);
  if (executedNames.length === 0) return [];

  const references = [
    ...module.cheats.map((item) => item.cmd),
    ...module.tasks.flatMap((task) => [task.hint.en, task.hint.el]),
    ...module.theory.flatMap((section) => section.shots?.flatMap((shot) => shot.cmd ? [shot.cmd] : []) || []),
  ];
  const covered = new Set<string>();
  for (const reference of references) {
    for (const name of referenceCommandNames(reference)) {
      const lesson = commandLessonForName(name);
      if (lesson) covered.add(lesson.key);
    }
  }

  const families = executedNames.map((name) => commandLessonForName(name)?.key);
  if (families.some((family) => !family) || families.some((family) => !covered.has(family!))) return [];
  return [...new Set(families as string[])];
}

function resultReading(
  raw: string,
  names: string[],
  lines: TermLine[],
  terminal: Terminal,
  lang: Lang
) {
  const output = lines.filter((line) => line.kind !== "in");
  const text = output.map((line) => line.text).join("\n");
  const first = names[0] || "";
  const error = output.some((line) => line.kind === "err") || terminal.lastExit !== 0;

  if (first === "clear") {
    return lang === "en"
      ? "The screen was cleared. The terminal state and your history remain; only visible lines were removed."
      : "Η οθόνη καθαρίστηκε. Η κατάσταση και το ιστορικό παραμένουν, αφαιρέθηκαν μόνο οι ορατές γραμμές.";
  }
  if (error) {
    if (text.includes("Permission denied")) {
      return lang === "en"
        ? "The account does not have permission for this path or action. Check the path and the owner/group/other bits with ls -l; do not assume that adding privileges is the right fix."
        : "Ο λογαριασμός δεν έχει δικαίωμα σε αυτή τη διαδρομή ή ενέργεια. Έλεγξε διαδρομή και owner/group/other με ls -l, μην υποθέτεις ότι η λύση είναι περισσότερα προνόμια.";
    }
    if (/No such file|cannot access|not found/i.test(text)) {
      return lang === "en"
        ? "The requested command, file, or directory was not found. Confirm spelling, capitalization (Linux paths are case-sensitive), and the current directory with pwd/ls."
        : "Δεν βρέθηκε η εντολή, το αρχείο ή ο φάκελος. Έλεγξε ορθογραφία, κεφαλαία (οι Linux διαδρομές είναι case-sensitive) και θέση με pwd/ls.";
    }
    if (terminal.lastExit === 127) {
      return lang === "en"
        ? "Exit code 127 means the shell could not find this command. Check its spelling, use help to see this lab's commands, or use which for a known program."
        : "Ο κωδικός εξόδου 127 δηλώνει ότι το κέλυφος δεν βρήκε την εντολή. Έλεγξε την ορθογραφία, διάβασε το help ή χρησιμοποίησε το which για γνωστό πρόγραμμα.";
    }
    return lang === "en"
      ? "The terminal reported an error. Read the error line first; it normally identifies a missing argument, inaccessible path, or unsupported action. No live system was contacted."
      : "Το terminal ανέφερε σφάλμα. Διάβασε πρώτα τη γραμμή σφάλματος, συνήθως δείχνει ελλιπές όρισμα, απρόσιτη διαδρομή ή μη υποστηριζόμενη ενέργεια. Δεν έγινε επαφή με live σύστημα.";
  }

  if (/\s>>?\s*\S+/.test(raw)) {
    const target = raw.match(/>>?\s*(\S+)\s*$/)?.[1] || "the target file";
    return lang === "en"
      ? `The redirection wrote output to ${target}, so the terminal can be silent. A single > replaces the file; >> appends. Read the file to verify the change.`
      : `Η ανακατεύθυνση έγραψε την έξοδο στο ${target}, γι' αυτό το terminal μπορεί να μείνει σιωπηλό. Το > αντικαθιστά, το >> προσθέτει. Διάβασε το αρχείο για επιβεβαίωση.`;
  }

  if (first === "cd") {
    return lang === "en"
      ? `The shell moved to ${terminal.cwd}. cd is normally silent; the changed prompt and pwd confirm your new working directory.`
      : `Το shell μετακινήθηκε στο ${terminal.cwd}. Η εντολή cd συνήθως δεν εμφανίζει κάποιο μήνυμα, το prompt και η εντολή pwd επιβεβαιώνουν τη νέα θέση.`;
  }
  if (["touch", "mkdir", "cp", "mv", "rm", "rmdir", "chmod", "chown", "chgrp"].includes(first) && output.length === 0) {
    const verify = first === "chmod" || first === "chown" || first === "chgrp" ? "ls -l" : first === "rm" || first === "rmdir" ? "ls" : "ls -la";
    return lang === "en"
      ? `This file operation succeeded without printing text. That is normal for Unix commands. Verify the changed filesystem with ${verify}.`
      : `Η λειτουργία αρχείου πέτυχε χωρίς κείμενο εξόδου. Αυτό είναι φυσιολογικό στο Unix. Επιβεβαίωσε το σύστημα αρχείων με ${verify}.`;
  }
  if ((first === "apt-get" || first === "apt") && /Abort\./.test(text)) {
    return lang === "en"
      ? "The simulated package confirmation was answered with n, so the removal was aborted. No package was removed; this is the safe version of the guide's exercise."
      : "Η εικονική επιβεβαίωση πακέτου απαντήθηκε με n, άρα η αφαίρεση ακυρώθηκε. Δεν αφαιρέθηκε πακέτο, αυτή είναι η ασφαλής εκδοχή της άσκησης.";
  }
  if (first === "ps" && names.includes("grep")) {
    return lang === "en"
      ? "The pipe passed the process list to grep, which kept only rows matching the requested process name. PID identifies a process; %CPU and %MEM are resource snapshots."
      : "Το pipe έδωσε τη λίστα διεργασιών στο grep, που κράτησε γραμμές με το όνομα που ζήτησες. Το PID είναι αναγνωριστικό διεργασίας, %CPU και %MEM είναι στιγμιότυπα πόρων.";
  }
  if (names.length > 1) {
    const last = names[names.length - 1];
    if (last === "grep") {
      const parts = splitPipes(raw);
      const pattern = parseArgs(parts[parts.length - 1] || "").slice(1).find((arg) => !arg.startsWith("-")) || "the requested pattern";
      return lang === "en"
        ? `The pipeline passed output to grep, which kept rows matching ${pattern}. The displayed lines are a filtered view; the original output and files were not changed.`
        : `Το pipeline έδωσε την έξοδο στο grep, που κράτησε γραμμές οι οποίες ταιριάζουν στο ${pattern}. Οι γραμμές είναι φιλτραρισμένη προβολή, η πηγή δεν άλλαξε.`;
    }
    return lang === "en"
      ? `This pipeline connects ${names.join(" → ")}. Each | passes the previous command's standard output into the next command's input; the displayed lines are the final result.`
      : `Αυτό το pipeline συνδέει ${names.join(" → ")}. Κάθε | στέλνει το standard output της προηγούμενης εντολής ως είσοδο στην επόμενη, οι γραμμές είναι το τελικό αποτέλεσμα.`;
  }
  if (first === "grep" && output.length === 0) {
    return lang === "en"
      ? "No lines matched the pattern. grep normally prints nothing for zero matches; refine the pattern or inspect the source with cat."
      : "Καμία γραμμή δεν ταίριαξε στο μοτίβο. Η εντολή grep συνήθως δεν εμφανίζει τίποτα όταν δεν υπάρχουν αποτελέσματα, άλλαξε το μοτίβο ή διάβασε την πηγή με cat.";
  }
  if (first === "grep") {
    const args = parseArgs(raw);
    const pattern = args.find((arg, index) => index > 0 && !arg.startsWith("-")) || "the requested pattern";
    const inverted = args.includes("-v") || args.some((arg) => arg.includes("v") && arg.startsWith("-"));
    return lang === "en"
      ? `${inverted ? "The -v option kept lines that do not match" : "grep kept lines that match"} ${pattern}. The output is a filtered view; the source file or earlier pipeline output was not changed.`
      : `${inverted ? "Η επιλογή -v κράτησε γραμμές που δεν ταιριάζουν στο" : "Το grep κράτησε γραμμές που ταιριάζουν στο"} ${pattern}. Η έξοδος είναι φιλτραρισμένη προβολή, η πηγή δεν άλλαξε.`;
  }
  if (first === "find" || first === "locate") {
    const count = output.filter((line) => line.text.startsWith("/")).length;
    return lang === "en"
      ? `${count} matching path${count === 1 ? "" : "s"} ${count === 1 ? "was" : "were"} printed. Each path is a candidate location; find walks the live virtual tree while locate searches its name index.`
      : `Εμφανίστηκαν ${count} διαδρομ${count === 1 ? "ή" : "ές"}. Κάθε διαδρομή είναι υποψήφια τοποθεσία, το find διασχίζει το virtual tree, ενώ το locate ψάχνει το ευρετήριο ονομάτων.`;
  }
  if (first === "whereis" || first === "which") {
    return lang === "en"
      ? "The path identifies the simulated executable location. which checks PATH; whereis may also show a manual-page location."
      : "Η διαδρομή δείχνει την εικονική θέση εκτελέσιμου. Το which ελέγχει PATH, το whereis μπορεί να εμφανίσει και man page.";
  }
  if (first === "man") {
    return lang === "en"
      ? "The manual excerpt describes command usage and options. Read the option names before trying them; the terminal provides a short simulated page."
      : "Το απόσπασμα manual περιγράφει χρήση και επιλογές. Διάβασε τις επιλογές πριν τις δοκιμάσεις, το terminal δίνει σύντομη προσομοιωμένη σελίδα.";
  }
  if (first === "apt-cache") {
    return lang === "en"
      ? "Each row is a package candidate plus a short description. Read the name, description, and repository of each row before choosing a package to install."
      : "Κάθε γραμμή είναι υποψήφιο πακέτο με περιγραφή. Διάβασε το όνομα, την περιγραφή και το repository κάθε γραμμής πριν επιλέξεις πακέτο για εγκατάσταση.";
  }
  if (first === "apt-get" || first === "apt") {
    return lang === "en"
      ? "The package-manager summary describes the requested simulated action. Read the package list and confirmation carefully to verify the requested action."
      : "Η σύνοψη διαχειριστή πακέτων περιγράφει την εικονική ενέργεια. Διάβασε λίστα και επιβεβαίωση για να επαληθεύσεις την ενέργεια που ζητήθηκε.";
  }
  if (first === "date") {
    return lang === "en"
      ? "The line is the simulator's current local date and time. Read it as the current clock value; displaying it does not change the clock."
      : "Η γραμμή είναι τοπική ημερομηνία και ώρα του προσομοιωτή. Διάβασέ την ως ένδειξη της τρέχουσας ώρας, η εμφάνιση από μόνη της δεν αλλάζει το ρολόι.";
  }
  if (first === "history") {
    return lang === "en"
      ? "Each numbered row is a previously entered command in this shell session. The history list is for review, not a replay unless you explicitly run a command again."
      : "Κάθε αριθμημένη γραμμή είναι προηγούμενη εντολή της συνεδρίας. Το history είναι για έλεγχο, όχι επανεκτέλεση.";
  }
  if (first === "echo") {
    return lang === "en"
      ? "The printed text is the expanded argument. A $NAME expression is replaced with the current value of that shell variable."
      : "Το κείμενο είναι το expanded όρισμα. Η έκφραση $NAME αντικαθίσταται από την τρέχουσα τιμή της shell variable.";
  }
  if (output.length === 0) {
    return lang === "en"
      ? "The command completed without text output. Many Linux commands are intentionally silent on success; use the state shown in the prompt or inspect the affected file/service to confirm."
      : "Η εντολή ολοκληρώθηκε χωρίς κείμενο εξόδου. Πολλές Linux εντολές είναι σιωπηλές στην επιτυχία, έλεγξε το prompt ή το αρχείο/υπηρεσία που επηρεάστηκε.";
  }
  if (first === "pwd") {
    return lang === "en"
      ? `The path ${text.trim()} is your current working directory. Relative paths are resolved from here.`
      : `Η διαδρομή ${text.trim()} είναι ο φάκελος στον οποίο βρίσκεσαι αυτή τη στιγμή. Οι σχετικές διαδρομές ερμηνεύονται με αφετηρία αυτόν τον φάκελο.`;
  }
  if (first === "whoami") {
    return lang === "en"
      ? `The effective account is ${text.trim()}. Commands and file access are evaluated using this identity.`
      : `Ο ενεργός λογαριασμός είναι ${text.trim()}. Οι εντολές και η πρόσβαση σε αρχεία ελέγχονται με αυτή την ταυτότητα.`;
  }
  if (first === "ls") {
    return lang === "en"
      ? "The names shown are entries in the requested directory. With -a, dotfiles are included; with -l, read the mode and owner/group columns before changing anything."
      : "Τα ονόματα είναι εγγραφές του ζητημένου φακέλου. Με -a εμφανίζονται dotfiles, με -l έλεγξε mode και owner/group πριν αλλάξεις κάτι.";
  }
  if (["cat", "head", "tail", "nl", "more", "less"].includes(first)) {
    return lang === "en"
      ? "The output is file data. cat prints the whole file, head its beginning, tail its end, nl adds line numbers, and more/less are pagers in a real terminal. Treat the text as data, not as instructions to execute."
      : "Η έξοδος είναι δεδομένα αρχείου. Η εντολή cat εμφανίζει όλο το αρχείο, η head την αρχή, η tail το τέλος, η nl προσθέτει αριθμούς γραμμών, ενώ τα more/less λειτουργούν ως σελιδοποιητές (pagers) σε πραγματικό τερματικό. Αντιμετώπισε το κείμενο ως δεδομένα, όχι ως εντολές.";
  }
  if (first === "dig") {
    return lang === "en"
      ? "Read the ANSWER SECTION: A maps a name to an address, MX lists mail exchangers, and NS lists name servers. These are fictional GameHack records."
      : "Διάβασε το ANSWER SECTION: A αντιστοιχίζει όνομα σε διεύθυνση, MX εμφανίζει mail exchangers και NS name servers. Είναι φανταστικές εγγραφές GameHack.";
  }
  if (first === "ifconfig" || first === "ip" || first === "iwconfig") {
    return lang === "en"
      ? "The output describes the simulator's virtual network interfaces. inet is an IPv4 address, netmask describes the subnet, broadcast is the subnet broadcast, and ether is the MAC address. No real adapter was changed."
      : "Η έξοδος περιγράφει εικονικές διεπαφές δικτύου. inet είναι IPv4, netmask το subnet, broadcast η διεύθυνση broadcast και ether η MAC. Δεν άλλαξε πραγματικός adapter.";
  }
  if (first === "service") {
    return lang === "en"
      ? "The service message reports a simulated state change. status tells you whether the named daemon is running."
      : "Το μήνυμα υπηρεσίας αναφέρει εικονική αλλαγή κατάστασης. Το status δείχνει αν το daemon θεωρείται ενεργό.";
  }
  if (first === "ssh" || first === "ftp") {
    return lang === "en"
      ? "This response comes from a fictional GameHack host inside the local virtual filesystem. A welcome/status banner means the simulator accepted the training step."
      : "Η απόκριση προέρχεται από φανταστικό σύστημα GameHack μέσα στο εικονικό σύστημα αρχείων. Το μήνυμα υποδοχής ή κατάστασης δηλώνει αποδοχή του βήματος.";
  }
  if (first === "echo") {
    return lang === "en"
      ? "The printed text is the expanded argument. A $NAME expression is replaced with the current value of that shell variable."
      : "Το κείμενο είναι το expanded όρισμα. Η έκφραση $NAME αντικαθίσταται από την τρέχουσα τιμή της shell variable.";
  }
  if (first === "bash") {
    return lang === "en"
      ? "These lines were printed by the simulated script. A script can run several commands in sequence; inspect its contents first and check its shebang and execute permission before running it on a real system."
      : "Αυτές οι γραμμές εμφανίστηκαν από το προσομοιωμένο script. Ένα script εκτελεί διαδοχικές εντολές, διάβασε το περιεχόμενο, το shebang και τα δικαιώματα πριν το εκτελέσεις σε πραγματικό σύστημα.";
  }
  if (first === "nmap" || first === "hydra" || first === "sqlmap" || first === "sudo") {
    return lang === "en"
      ? "This is a canned educational result for the isolated GameHack sandbox. It does not scan, authenticate to, or exploit a real system. Read each row as simulated lab data."
      : "Αυτό είναι προκαθορισμένο εκπαιδευτικό αποτέλεσμα του απομονωμένου GameHack sandbox. Δεν σαρώθηκε, δεν έγινε login ούτε exploit σε πραγματικό σύστημα. Διάβασε κάθε γραμμή ως εικονικά δεδομένα.";
  }
  return lang === "en"
    ? `The terminal returned ${output.length} output line${output.length === 1 ? "" : "s"}. Read the output panel above as the command's direct response; compare it with the command's purpose and the current lab state.`
    : `Το τερματικό επέστρεψε ${output.length} γραμμή${output.length === 1 ? "" : "ές"}. Διάβασε τον πίνακα εξόδου ως άμεση απόκριση και σύγκρινέ τον με τον σκοπό της εντολής και την κατάσταση του εργαστηρίου.`;
}

export function explainCommandResult(raw: string, lines: TermLine[], terminal: Terminal, lang: Lang): CommandExplanation {
  const names = commandNames(raw, terminal);
  const first = names[0] || "";
  const lesson = raw.includes("|")
    ? commandLessonForName("pipeline")!
    : commandLessonForName(first) || fallbackLesson(first);
  const output = lines.filter((line) => line.kind !== "in").slice(0, 80);
  return {
    command: raw.trim(),
    lesson,
    reading: resultReading(raw, names, output, terminal, lang),
    output,
    exitCode: terminal.lastExit,
  };
}

export function studyItemsForModule(module: Module) {
  return module.cheats.map((cheat) => ({
    ...cheat,
    guide: commandLessonForLabel(cheat.cmd),
  }));
}