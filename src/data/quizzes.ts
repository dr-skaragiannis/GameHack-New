import type { Bi } from "./lessons";

export type QuizQ = {
  q: Bi;
  choices: Bi[];
  answer: number;
  why: Bi;
};

export const QUIZZES: Record<string, QuizQ[]> = {
  "linux-basics": [
    {
      q: { en: "What does the $ at the end of a bash prompt mean?", el: "Τι δηλώνει το $ στο τέλος του prompt;" },
      choices: [
        { en: "You are root", el: "Είσαι root" },
        { en: "You are a normal user", el: "Είσαι απλός χρήστης" },
        { en: "The disk is full", el: "Ο δίσκος είναι γεμάτος" },
        { en: "SSH is connected", el: "Το SSH είναι συνδεδεμένο" },
      ],
      answer: 1,
      why: { en: "$ = unprivileged user. # = root.", el: "Το $ δηλώνει απλό χρήστη. Το # δηλώνει root." },
    },
    {
      q: { en: "Which command prints the current directory?", el: "Ποια εντολή εμφανίζει τον τρέχοντα φάκελο;" },
      choices: [
        { en: "whoami", el: "whoami" },
        { en: "ls", el: "ls" },
        { en: "pwd", el: "pwd" },
        { en: "cd", el: "cd" },
      ],
      answer: 2,
      why: { en: "pwd = print working directory.", el: "Η εντολή pwd εμφανίζει τον τρέχοντα φάκελο (print working directory)." },
    },
    {
      q: { en: "How do you list hidden files?", el: "Πώς εμφανίζεις κρυφά αρχεία;" },
      choices: [
        { en: "ls -h", el: "ls -h" },
        { en: "ls -a", el: "ls -a" },
        { en: "ls hidden", el: "ls hidden" },
        { en: "cat -a", el: "cat -a" },
      ],
      answer: 1,
      why: { en: "ls -a shows names that start with a dot.", el: "Το ls -a δείχνει ονόματα που ξεκινούν με τελεία." },
    },
  ],
  files: [
    {
      q: { en: "An absolute path always starts with…", el: "Μια απόλυτη διαδρομή ξεκινά πάντα με…" },
      choices: [
        { en: "~", el: "~" },
        { en: "/", el: "/" },
        { en: ".", el: "." },
        { en: "$HOME", el: "$HOME" },
      ],
      answer: 1,
      why: { en: "Absolute paths begin at the filesystem root /.", el: "Οι απόλυτες διαδρομές ξεκινούν από τη ρίζα /." },
    },
    {
      q: { en: "grep PATTERN file does what?", el: "Τι κάνει το grep PATTERN file;" },
      choices: [
        { en: "Deletes matching lines", el: "Διαγράφει γραμμές" },
        { en: "Searches file contents for PATTERN", el: "Ψάχνει το περιεχόμενο για PATTERN" },
        { en: "Renames the file", el: "Μετονομάζει το αρχείο" },
        { en: "Changes permissions", el: "Αλλάζει δικαιώματα" },
      ],
      answer: 1,
      why: { en: "grep filters lines that match a pattern.", el: "Το grep φιλτράρει γραμμές που ταιριάζουν." },
    },
    {
      q: { en: "Which file lists local user accounts?", el: "Ποιο αρχείο έχει τους τοπικούς λογαριασμούς;" },
      choices: [
        { en: "/etc/shadow", el: "/etc/shadow" },
        { en: "/etc/passwd", el: "/etc/passwd" },
        { en: "/etc/group", el: "/etc/group" },
        { en: "/home/users", el: "/home/users" },
      ],
      answer: 1,
      why: { en: "/etc/passwd is world-readable and lists users. /etc/shadow holds hashes and is root-only.", el: "Το /etc/passwd έχει χρήστες. Το /etc/shadow έχει hashes και είναι μόνο για root." },
    },
  ],
  permissions: [
    {
      q: { en: "In -rwxr-xr--, what can 'others' do?", el: "Στο -rwxr-xr--, τι μπορούν οι 'others';" },
      choices: [
        { en: "read, write, execute", el: "ανάγνωση, εγγραφή, εκτέλεση" },
        { en: "read only", el: "μόνο ανάγνωση" },
        { en: "nothing", el: "τίποτα" },
        { en: "execute only", el: "μόνο εκτέλεση" },
      ],
      answer: 1,
      why: { en: "The last triple is r-- : read only for others.", el: "Το τελευταίο triple είναι r-- : μόνο ανάγνωση." },
    },
    {
      q: { en: "sudo -l shows…", el: "Το sudo -l δείχνει…" },
      choices: [
        { en: "Last logins", el: "Τελευταίες συνδέσεις" },
        { en: "Commands you may run as root", el: "Εντολές που μπορείς ως root" },
        { en: "Listening ports", el: "Θύρες σε ακρόαση" },
        { en: "Kernel modules", el: "Κερνελ modules" },
      ],
      answer: 1,
      why: { en: "sudo -l lists your sudo privileges — a key privesc check.", el: "Το sudo -l είναι βασικός έλεγχος privesc." },
    },
    {
      q: { en: "Why is /etc/shadow not world-readable?", el: "Γιατί το /etc/shadow δεν διαβάζεται από όλους;" },
      choices: [
        { en: "It is empty", el: "Είναι άδειο" },
        { en: "It stores password hashes", el: "Αποθηκεύει hashes κωδικών" },
        { en: "It is a binary", el: "Είναι binary" },
        { en: "SELinux forbids it always", el: "Το SELinux το απαγορεύει πάντα" },
      ],
      answer: 1,
      why: { en: "Hashes can be cracked offline if leaked.", el: "Τα hashes σπάνε offline αν διαρρεύσουν." },
    },
  ],
  networking: [
    {
      q: { en: "What does ping test?", el: "Τι ελέγχει το ping;" },
      choices: [
        { en: "Open TCP ports", el: "Ανοιχτές TCP θύρες" },
        { en: "ICMP echo connectivity", el: "Συνδεσιμότητα ICMP echo" },
        { en: "DNSSEC", el: "DNSSEC" },
        { en: "TLS certificates", el: "Πιστοποιητικά TLS" },
      ],
      answer: 1,
      why: { en: "Ping sends ICMP echo requests. Hosts may block ICMP and still be up.", el: "Το ping στέλνει ICMP. Κάποιοι hosts το μπλοκάρουν." },
    },
    {
      q: { en: "10.10.10.0/24 contains how many addresses?", el: "Το 10.10.10.0/24 έχει πόσες διευθύνσεις;" },
      choices: [
        { en: "24", el: "24" },
        { en: "256", el: "256" },
        { en: "10", el: "10" },
        { en: "65536", el: "65536" },
      ],
      answer: 1,
      why: { en: "/24 means 8 host bits → 256 addresses (254 usable).", el: "Το /24 αφήνει 8 host bits → 256 διευθύνσεις." },
    },
    {
      q: { en: "Scanning a network you do not own is…", el: "Η σάρωση δικτύου που δεν σου ανήκει είναι…" },
      choices: [
        { en: "Always fine", el: "Πάντα εντάξει" },
        { en: "A crime without permission", el: "Έγκλημα χωρίς άδεια" },
        { en: "Required by ISO", el: "Υποχρεωτική από ISO" },
        { en: "Only illegal on port 22", el: "Παράνομη μόνο στη θύρα 22" },
      ],
      answer: 1,
      why: { en: "Get written permission. GameHack is a sandbox.", el: "Πάρε γραπτή άδεια. Το GameHack είναι sandbox." },
    },
  ],
  recon: [
    {
      q: { en: "Passive recon means…", el: "Η παθητική αναγνώριση (recon) είναι…" },
      choices: [
        { en: "Sending nmap SYN packets", el: "Αποστολή nmap SYN" },
        { en: "Using public data without touching the target", el: "Δημόσια δεδομένα χωρίς επαφή με τον στόχο" },
        { en: "DDoS", el: "DDoS" },
        { en: "Exploiting a CVE", el: "Εκμετάλλευση CVE" },
      ],
      answer: 1,
      why: { en: "Passive = OSINT, DNS, archives. Active = packets to the target.", el: "Παθητική = OSINT. Ενεργητική = πακέτα." },
    },
    {
      q: { en: "nmap 10.10.10.0/24 is primarily a…", el: "Το nmap 10.10.10.0/24 είναι κυρίως…" },
      choices: [
        { en: "Web exploit", el: "Web exploit" },
        { en: "Subnet host discovery", el: "Ανακάλυψη hosts στο subnet" },
        { en: "Password crack", el: "Σπάσιμο κωδικού" },
        { en: "Rootkit", el: "Rootkit" },
      ],
      answer: 1,
      why: { en: "A sweep finds live hosts before you port-scan one of them.", el: "Η σάρωση βρίσκει ζωντανούς hosts." },
    },
    {
      q: { en: "You should only scan…", el: "Πρέπει να σαρώνεις μόνο…" },
      choices: [
        { en: "Famous companies", el: "Διάσημες εταιρείες" },
        { en: "In-scope systems you are allowed to test", el: "Συστήματα εντός scope με άδεια" },
        { en: "Anything with port 80", el: "Οτιδήποτε με θύρα 80" },
        { en: "Random /8s", el: "Τυχαία /8" },
      ],
      answer: 1,
      why: { en: "Scope and permission are non-negotiable.", el: "Το scope και η άδεια δεν συζητιούνται." },
    },
  ],
  scanning: [
    {
      q: { en: "nmap -sV is used to…", el: "Το nmap -sV χρησιμεύει για…" },
      choices: [
        { en: "DDoS a host", el: "DDoS" },
        { en: "Detect service versions", el: "Ανίχνευση εκδόσεων υπηρεσιών" },
        { en: "Disable a firewall", el: "Απενεργοποίηση firewall" },
        { en: "Crack hashes", el: "Σπάσιμο hashes" },
      ],
      answer: 1,
      why: { en: "-sV probes banners so you know which software (and version) answers.", el: "Το -sV διαβάζει banners." },
    },
    {
      q: { en: "An open port 22 typically means…", el: "Η ανοιχτή θύρα 22 συνήθως δηλώνει…" },
      choices: [
        { en: "HTTP", el: "HTTP" },
        { en: "SSH", el: "SSH" },
        { en: "SMTP", el: "SMTP" },
        { en: "RDP", el: "RDP" },
      ],
      answer: 1,
      why: { en: "22/tcp is the IANA port for SSH.", el: "22/tcp = SSH." },
    },
    {
      q: { en: "Why grab HTTP with curl during scanning?", el: "Γιατί curl στο HTTP στη σάρωση;" },
      choices: [
        { en: "To mine bitcoin", el: "Για bitcoin" },
        { en: "To read banners, titles, tech stack clues", el: "Για banners, τίτλους, ενδείξεις stack" },
        { en: "To wipe logs", el: "Για να σβήσεις logs" },
        { en: "It is required by TCP", el: "Το απαιτεί το TCP" },
      ],
      answer: 1,
      why: { en: "A homepage often leaks CMS names and versions.", el: "Η αρχική συχνά αποκαλύπτει CMS." },
    },
  ],
  bruteforce: [
    {
      q: { en: "A dictionary attack tries…", el: "Μια επίθεση λεξικού δοκιμάζει…" },
      choices: [
        { en: "Every possible byte", el: "Κάθε δυνατό byte" },
        { en: "Passwords from a list of likely values", el: "Κωδικούς από λίστα πιθανών τιμών" },
        { en: "Only the empty password", el: "Μόνο κενό κωδικό" },
        { en: "TLS session keys", el: "Κλειδιά TLS" },
      ],
      answer: 1,
      why: { en: "Dictionaries are faster than true brute force because humans pick predictable passwords.", el: "Τα λεξικά είναι ταχύτερα γιατί οι άνθρωποι διαλέγουν προβλέψιμους κωδικούς." },
    },
    {
      q: { en: "Best defence against SSH password sprays?", el: "Καλύτερη άμυνα στα SSH sprays;" },
      choices: [
        { en: "A longer MOTD", el: "Μεγαλύτερο MOTD" },
        { en: "Disable passwords, use keys + MFA, rate-limit", el: "Κλειδιά + MFA, χωρίς passwords, rate-limit" },
        { en: "Open port 22 to the world", el: "Άνοιγμα 22 στον κόσμο" },
        { en: "Use telnet instead", el: "Telnet" },
      ],
      answer: 1,
      why: { en: "Key-only SSH plus monitoring makes hydra-style attacks fail loudly.", el: "SSH μόνο με κλειδιά και monitoring." },
    },
    {
      q: { en: "Running hydra against a random internet host is…", el: "Η εκτέλεση hydra εναντίον τυχαίου συστήματος στο διαδίκτυο είναι…" },
      choices: [
        { en: "Fine if you are curious", el: "ΟΚ αν είσαι περίεργος" },
        { en: "Illegal without authorisation", el: "Παράνομο χωρίς εξουσιοδότηση" },
        { en: "A NIST requirement", el: "Απαίτηση NIST" },
        { en: "Only rude", el: "Απλώς αγενές" },
      ],
      answer: 1,
      why: { en: "Credential attacks without permission are a crime. Lab only.", el: "Επιθέσεις διαπιστευτηρίων χωρίς άδεια είναι έγκλημα." },
    },
  ],
  sqli: [
    {
      q: { en: "SQL injection happens when…", el: "Το SQLi συμβαίνει όταν…" },
      choices: [
        { en: "TLS is too new", el: "Το TLS είναι νέο" },
        { en: "Untrusted input is concatenated into a query", el: "Μη έμπιστη είσοδος μπαίνει σε ερώτημα" },
        { en: "The DB is PostgreSQL", el: "Η βάση είναι PostgreSQL" },
        { en: "The server uses IPv6", el: "Ο server έχει IPv6" },
      ],
      answer: 1,
      why: { en: "Fix: parameterised queries / prepared statements, never string concat.", el: "Λύση: parameterized queries, ποτέ concat." },
    },
    {
      q: { en: "A single quote in an id= parameter is often used to…", el: "Το μονό εισαγωγικό σε id= συχνά…" },
      choices: [
        { en: "Beautify HTML", el: "Ομορφαίνει HTML" },
        { en: "Test if the query syntax breaks", el: "Ελέγχει αν σπάει η σύνταξη" },
        { en: "Enable HTTP/2", el: "Ενεργοποιεί HTTP/2" },
        { en: "Reset a password", el: "Κάνει reset κωδικού" },
      ],
      answer: 1,
      why: { en: "A syntax error (or odd response) is a detection signal — in a lab.", el: "Σφάλμα σύνταξης είναι σήμα ανίχνευσης — στο lab." },
    },
    {
      q: { en: "The defender's first control against SQLi is…", el: "Το πρώτο μέτρο του defender είναι…" },
      choices: [
        { en: "More RAM", el: "Περισσότερη RAM" },
        { en: "Parameterised queries and least-privilege DB users", el: "Parameterized queries και least-privilege" },
        { en: "Disabling HTTPS", el: "Απενεργοποίηση HTTPS" },
        { en: "Using FTP", el: "FTP" },
      ],
      answer: 1,
      why: { en: "ORMs + bound parameters + a DB account that cannot DROP TABLE.", el: "ORM + bound parameters + λογαριασμός χωρίς DROP." },
    },
  ],
  privesc: [
    {
      q: { en: "Privilege escalation is…", el: "Η ανύψωση προνομίων είναι…" },
      choices: [
        { en: "The first packet you send", el: "Το πρώτο πακέτο" },
        { en: "Moving from a low user to a more powerful one", el: "Από χαμηλό χρήστη σε ισχυρότερο" },
        { en: "Buying a bigger NIC", el: "Μεγαλύτερο NIC" },
        { en: "Changing DNS", el: "Αλλαγή DNS" },
      ],
      answer: 1,
      why: { en: "After a foothold, enumerate sudo, SUID, cron, kernel.", el: "Μετά το foothold: sudo, SUID, cron, kernel." },
    },
    {
      q: { en: "Why is `sudo find` dangerous?", el: "Γιατί είναι επικίνδυνο το sudo find;" },
      choices: [
        { en: "find is slow", el: "Το find είναι αργό" },
        { en: "It can execute commands as root (GTFOBins)", el: "Μπορεί να εκτελέσει εντολές ως root" },
        { en: "It deletes /", el: "Διαγράφει το /" },
        { en: "It disables SELinux", el: "Κλείνει SELinux" },
      ],
      answer: 1,
      why: { en: "Many Unix tools have breakout flags. Don't sudo them.", el: "Πολλά Unix tools έχουν breakout. Μην τα κάνεις sudo." },
    },
    {
      q: { en: "Least privilege means…", el: "Η αρχή του ελάχιστου προνομίου (least privilege) είναι…" },
      choices: [
        { en: "Everyone is root", el: "Όλοι είναι root" },
        { en: "Grant only the rights needed to do the job", el: "Δώσε μόνο τα απαραίτητα δικαιώματα" },
        { en: "Disable logging", el: "Κλείσε logging" },
        { en: "Share one password", el: "Ένας κοινός κωδικός" },
      ],
      answer: 1,
      why: { en: "The smaller the sudoers file, the smaller the blast radius.", el: "Μικρότερο sudoers = μικρότερη ακτίνα έκρηξης." },
    },
  ],
  "raven-recon": [
    {
      q: { en: "A boot2root box is designed to be…", el: "Ένα boot2root είναι σχεδιασμένο να είναι…" },
      choices: [
        { en: "A production bank", el: "Τράπεζα παραγωγής" },
        { en: "A legal playground from scan to root", el: "Νόμιμο πεδίο από σάρωση ως root" },
        { en: "A CDN", el: "CDN" },
        { en: "An ISP core", el: "Πυρήνας ISP" },
      ],
      answer: 1,
      why: { en: "CTF / lab machines exist so you never touch live systems.", el: "Τα CTF και τα εργαστήρια υπάρχουν για να μην αγγίζεις πραγματικά συστήματα." },
    },
    {
      q: { en: "Typical first step on a new box?", el: "Τυπικό πρώτο βήμα;" },
      choices: [
        { en: "Format the disk", el: "Format" },
        { en: "Recon / port scan", el: "Recon / σάρωση θυρών" },
        { en: "Email the CEO", el: "Email στον CEO" },
        { en: "Buy zero-days", el: "Αγορά 0-days" },
      ],
      answer: 1,
      why: { en: "Don't skip recon. You cannot exploit a service you have not found.", el: "Μην παραλείπεις recon." },
    },
    {
      q: { en: "Raven in this lab speaks which services?", el: "Ποιες υπηρεσίες προσφέρει ο Raven στο εργαστήριο;" },
      choices: [
        { en: "Only FTP", el: "Μόνο FTP" },
        { en: "SSH and HTTP", el: "SSH και HTTP" },
        { en: "Only RDP", el: "Μόνο RDP" },
        { en: "SIP", el: "SIP" },
      ],
      answer: 1,
      why: { en: "Your nmap -sV showed 22 and 80.", el: "Το nmap -sV έδειξε 22 και 80." },
    },
  ],
  "raven-foothold": [
    {
      q: { en: "A foothold is…", el: "Foothold είναι…" },
      choices: [
        { en: "Root on day one, always", el: "Root την πρώτη μέρα" },
        { en: "An initial working access (often a user shell)", el: "Αρχική πρόσβαση (συχνά user shell)" },
        { en: "A firewall rule", el: "Κανόνας firewall" },
        { en: "A SIEM alert", el: "Ειδοποίηση SIEM" },
      ],
      answer: 1,
      why: { en: "Then you enumerate locally for privesc.", el: "Μετά τοπική απαρίθμηση για privesc." },
    },
    {
      q: { en: "user.txt on a CTF box usually sits in…", el: "Το user.txt συνήθως είναι στο…" },
      choices: [
        { en: "/proc", el: "/proc" },
        { en: "The low-priv user's home", el: "Το home του χαμηλού χρήστη" },
        { en: "BIOS", el: "BIOS" },
        { en: "The NTP pool", el: "NTP pool" },
      ],
      answer: 1,
      why: { en: "Convention: /home/<user>/user.txt proves foothold.", el: "Σύμβαση: /home/<user>/user.txt." },
    },
    {
      q: { en: "Why do CTF passwords appear in wordlists?", el: "Γιατί οι κωδικοί CTF είναι σε wordlists;" },
      choices: [
        { en: "To train the dictionary-attack lesson", el: "Για το μάθημα dictionary-attack" },
        { en: "Because AES is broken", el: "Γιατί έσπασε το AES" },
        { en: "Random chance", el: "Τύχη" },
        { en: "IPv4 shortage", el: "Έλλειψη IPv4" },
      ],
      answer: 0,
      why: { en: "They teach a pattern. Real systems must not reuse those words.", el: "Διδάσκουν μοτίβο. Τα πραγματικά συστήματα δεν πρέπει να τα επαναχρησιμοποιούν." },
    },
  ],
  "raven-web": [
    {
      q: { en: "Why loot /var/www/html/config.php?", el: "Γιατί το config.php;" },
      choices: [
        { en: "It is pretty", el: "Είναι όμορφο" },
        { en: "App configs often store DB credentials", el: "Συχνά έχει διαπιστευτήρια βάσης" },
        { en: "PHP cannot run without being read", el: "Η PHP δεν τρέχει αλλιώς" },
        { en: "It disables ASLR", el: "Κλείνει ASLR" },
      ],
      answer: 1,
      why: { en: "Secrets in web roots are a classic finding.", el: "Μυστικά στο web root είναι κλασικό εύρημα." },
    },
    {
      q: { en: "SQL dumps in /var/backups are dangerous because…", el: "Τα SQL dumps στο /var/backups είναι επικίνδυνα γιατί…" },
      choices: [
        { en: "They slow cron", el: "Αργό cron" },
        { en: "They often contain users, hashes, PII", el: "Έχουν χρήστες, hashes, PII" },
        { en: "They use UTF-16", el: "UTF-16" },
        { en: "tar is illegal", el: "Το tar είναι παράνομο" },
      ],
      answer: 1,
      why: { en: "Encrypt backups and restrict who can read them.", el: "Κρυπτογράφηση backups και περιορισμένη ανάγνωση." },
    },
    {
      q: { en: "crontab running a user-writable script as root is…", el: "crontab με εγγράψιμο script ως root είναι…" },
      choices: [
        { en: "A hardening win", el: "Νίκη hardening" },
        { en: "A privilege-escalation footgun", el: "Όπλο privesc" },
        { en: "Required by PCI", el: "Απαίτηση PCI" },
        { en: "Unrelated to security", el: "Άσχετο" },
      ],
      answer: 1,
      why: { en: "If I can edit what root executes, I am root.", el: "Αν επεξεργάζομαι ό,τι εκτελεί ο root, είμαι root." },
    },
  ],
  "raven-root": [
    {
      q: { en: "World-writable + executed by root equals…", el: "World-writable + εκτέλεση από root =" },
      choices: [
        { en: "Secure by default", el: "Ασφαλές by default" },
        { en: "Game over for the box", el: "Game over για το κουτί" },
        { en: "Faster backups", el: "Ταχύτερα backups" },
        { en: "A SELinux success", el: "Επιτυχία SELinux" },
      ],
      answer: 1,
      why: { en: "Lock modes to 750/640 owned by root.", el: "Κλείδωσε modes 750/640 owned by root." },
    },
    {
      q: { en: "root.txt conventionally proves…", el: "Το root.txt αποδεικνύει…" },
      choices: [
        { en: "You rebooted", el: "Κάνεις reboot" },
        { en: "You achieved root on the box", el: "Πέτυχες root" },
        { en: "DNS works", el: "Δουλεύει το DNS" },
        { en: "IPv6 is on", el: "IPv6 on" },
      ],
      answer: 1,
      why: { en: "That's the boot2root finish line.", el: "Η γραμμή τερματισμού boot2root." },
    },
    {
      q: { en: "After rooting a lab, you should…", el: "Αφού αποκτήσεις root σε εργαστήριο, πρέπει…" },
      choices: [
        { en: "Attack the next random IP you know", el: "Χτυπήσεις την επόμενη τυχαία IP" },
        { en: "Write notes and stay inside authorised scope", el: "Σημειώσεις και παραμονή στο scope" },
        { en: "Post real customer data", el: "Δημοσιεύσεις δεδομένα πελατών" },
        { en: "Disable all logging everywhere", el: "Κλείσεις όλα τα logs" },
      ],
      answer: 1,
      why: { en: "The oath still holds when you are good at this.", el: "Ο όρκος ισχύει και όταν είσαι καλός." },
    },
  ],
  "ssh-keys": [
    {
      q: { en: "Private SSH keys should be mode…", el: "Τα ιδιωτικά κλειδιά SSH πρέπει να είναι…" },
      choices: [
        { en: "777", el: "777" },
        { en: "600 (owner read/write only)", el: "600 (μόνο ο ιδιοκτήτης)" },
        { en: "644", el: "644" },
        { en: "000", el: "000" },
      ],
      answer: 1,
      why: { en: "ssh refuses keys that are group/world-readable.", el: "Το ssh αρνείται κλειδιά αναγνώσιμα από άλλους." },
    },
    {
      q: { en: "~/.ssh/config Host stanzas let you…", el: "Τα Host στο config σου επιτρέπουν…" },
      choices: [
        { en: "Mine crypto", el: "Mining" },
        { en: "Alias hostnames, users, keys, ProxyJump", el: "Alias, users, keys, ProxyJump" },
        { en: "Bypass MFA always", el: "Παράκαμψη MFA" },
        { en: "Open SMTP", el: "SMTP" },
      ],
      answer: 1,
      why: { en: "Config turns ugly one-liners into ssh jump.", el: "Το config κάνει ssh jump αντί για one-liners." },
    },
    {
      q: { en: "ssh -i file specifies…", el: "Το ssh -i file ορίζει…" },
      choices: [
        { en: "An identity (private key) file", el: "Αρχείο ταυτότητας (ιδιωτικό κλειδί)" },
        { en: "An iptables rule", el: "Κανόνα iptables" },
        { en: "Idle timeout", el: "Idle timeout" },
        { en: "IPv6 only", el: "Μόνο IPv6" },
      ],
      answer: 0,
      why: { en: "-i identity_file.", el: "-i identity_file." },
    },
  ],
  "ssh-hop": [
    {
      q: { en: "ProxyJump (-J) is used to…", el: "Το ProxyJump (-J) χρησιμεύει για…" },
      choices: [
        { en: "Jump through a bastion to an internal host", el: "Πέρασμα από bastion σε εσωτερικό host" },
        { en: "Upgrade RAM", el: "Αναβάθμιση RAM" },
        { en: "Disable keys", el: "Απενεργοποίηση κλειδιών" },
        { en: "Scan /24s faster", el: "Ταχύτερη σάρωση /24" },
      ],
      answer: 0,
      why: { en: "ssh -J bastion user@internal", el: "ssh -J bastion user@internal" },
    },
    {
      q: { en: "Bastion hosts should have…", el: "Τα bastion πρέπει να έχουν…" },
      choices: [
        { en: "Wide outbound any/any", el: "Ελεύθερο outbound" },
        { en: "MFA, monitoring, tight egress", el: "MFA, monitoring, σφιχτό egress" },
        { en: "Telnet enabled", el: "Telnet" },
        { en: "Shared root passwords on sticky notes", el: "Κωδικό root σε χαρτάκι" },
      ],
      answer: 1,
      why: { en: "A bastion is a high-value choke point. Treat it like one.", el: "Το bastion είναι σημείο ελέγχου υψηλής αξίας." },
    },
    {
      q: { en: "Pivoting through SSH is relevant to defenders because…", el: "Το SSH pivot αφορά τους defenders γιατί…" },
      choices: [
        { en: "East-west SSH after a phish is a common path", el: "Το east-west SSH μετά από phish είναι κοινό" },
        { en: "SSH cannot be logged", el: "Το SSH δεν λογαριάζεται" },
        { en: "Firewalls ignore 22", el: "Τα firewall αγνοούν τη 22" },
        { en: "It is layer 8 only", el: "Είναι μόνο layer 8" },
      ],
      answer: 0,
      why: { en: "Watch unusual SSH graphs, not just the perimeter.", el: "Παρακολούθησε ασυνήθιστα γραφήματα SSH." },
    },
  ],
  "ssh-tunnel": [
    {
      q: { en: "Network segmentation means…", el: "Η τμηματοποίηση δικτύου (segmentation) είναι…" },
      choices: [
        { en: "One flat VLAN for all", el: "Ένα VLAN για όλους" },
        { en: "Not every host can reach every other host", el: "Δεν επικοινωνεί κάθε σύστημα με κάθε άλλο" },
        { en: "No logging", el: "Χωρίς logs" },
        { en: "Public IPs on printers", el: "Public IP σε εκτυπωτές" },
      ],
      answer: 1,
      why: { en: "db-int was invisible from kali — that's the point.", el: "Το db-int ήταν αόρατο από kali." },
    },
    {
      q: { en: "ssh -L is a…", el: "Το ssh -L είναι…" },
      choices: [
        { en: "Local port forward", el: "Τοπικό port forward" },
        { en: "Linux kernel module", el: "Κερνελ module" },
        { en: "LDAP bind", el: "LDAP bind" },
        { en: "Lost packet counter", el: "Μετρητής lost packets" },
      ],
      answer: 0,
      why: { en: "It maps localhost:port to a remote service through the SSH hop.", el: "Χαρτογραφεί localhost:port σε απομακρυσμένη υπηρεσία." },
    },
    {
      q: { en: "A dual-homed host is a pivot because…", el: "Ένα σύστημα με δύο συνδέσεις (dual-homed) λειτουργεί ως pivot γιατί…" },
      choices: [
        { en: "It sits on more than one network", el: "Κάθεται σε περισσότερα δίκτυα" },
        { en: "It has two keyboards", el: "Έχει δύο πληκτρολόγια" },
        { en: "It uses RAID 0", el: "RAID 0" },
        { en: "It is always root", el: "Είναι πάντα root" },
      ],
      answer: 0,
      why: { en: "Compromise it and you inherit its routes.", el: "Αν το παραβιάσεις, κληρονομείς τις διαδρομές του." },
    },
  ],
  "sr-intro": [
    { q: { en: "pwd prints…", el: "Η εντολή pwd εμφανίζει…" }, choices: [{ en: "Users", el: "Χρήστες" }, { en: "Working directory", el: "Τρέχοντα φάκελο" }, { en: "Processes", el: "Διεργασίες" }, { en: "IPs", el: "IP" }], answer: 1, why: { en: "print working directory", el: "Τον τρέχοντα φάκελο εργασίας." } },
    { q: { en: "whoami as root means…", el: "Το whoami ως root δηλώνει…" }, choices: [{ en: "Guest", el: "Guest" }, { en: "Full administrator on this box", el: "Πλήρης διαχειριστής" }, { en: "FTP only", el: "Μόνο FTP" }, { en: "No privileges", el: "Χωρίς προνόμια" }], answer: 1, why: { en: "root is the superuser.", el: "root = superuser." } },
    { q: { en: "ls is closest to Windows…", el: "Το ls μοιάζει με…" }, choices: [{ en: "dir", el: "dir" }, { en: "ipconfig", el: "ipconfig" }, { en: "taskmgr", el: "taskmgr" }, { en: "notepad", el: "notepad" }], answer: 0, why: { en: "ls lists directory contents.", el: "Το ls λιστάρει." } },
  ],
  "sr-help": [
    { q: { en: "type ls tells you…", el: "Το type ls σου λέει…" }, choices: [{ en: "How large ls is", el: "Πόσο μεγάλο είναι το ls" }, { en: "Whether ls is a real file, a builtin or an alias", el: "Αν το ls είναι πραγματικό αρχείο, ενσωματωμένη εντολή ή ψευδώνυμο" }, { en: "Who installed ls", el: "Ποιος εγκατέστησε το ls" }, { en: "The ls version", el: "Την έκδοση του ls" }], answer: 1, why: { en: "which only searches $PATH; type reports what the shell will actually run.", el: "Η which ψάχνει μόνο στο $PATH· η type αναφέρει τι θα εκτελέσει πραγματικά το shell." } },
    { q: { en: "which git returns…", el: "which git επιστρέφει…" }, choices: [{ en: "Every file named git", el: "Κάθε αρχείο git" }, { en: "The git binary on PATH", el: "Το binary στο PATH" }, { en: "GitHub", el: "GitHub" }, { en: "Nothing", el: "Τίποτα" }], answer: 1, why: { en: "which is PATH-only.", el: "which = μόνο PATH." } },
    { q: { en: "locate's database is typically updated…", el: "Η βάση locate ενημερώνεται…" }, choices: [{ en: "Every millisecond", el: "Κάθε ms" }, { en: "About once a day", el: "Περίπου μία φορά τη μέρα" }, { en: "Never", el: "Ποτέ" }, { en: "On SSH login only", el: "Μόνο στο SSH" }], answer: 1, why: { en: "New files can be missing until updatedb.", el: "Νέα αρχεία λείπουν μέχρι updatedb." } },
  ],
  "sr-search": [
    { q: { en: "ifconfig | grep inet keeps…", el: "ifconfig | grep inet κρατά…" }, choices: [{ en: "All lines", el: "Όλα" }, { en: "Lines containing inet", el: "Γραμμές με inet" }, { en: "Only errors", el: "Μόνο σφάλματα" }, { en: "PIDs", el: "PID" }], answer: 1, why: { en: "grep filters stdin.", el: "Το grep φιλτράρει stdin." } },
    { q: { en: "find / -type f -name gamehack starts at…", el: "Το find / ξεκινά από…" }, choices: [{ en: "Your home only", el: "Μόνο home" }, { en: "The filesystem root", el: "Τη ρίζα" }, { en: "RAM", el: "RAM" }, { en: "DNS", el: "DNS" }], answer: 1, why: { en: "/ is the tree root.", el: "/ = ρίζα." } },
    { q: { en: "2>&1 sends…", el: "Το 2>&1 στέλνει…" }, choices: [{ en: "stdout to a printer", el: "stdout σε εκτυπωτή" }, { en: "stderr to stdout", el: "stderr στο stdout" }, { en: "root mail", el: "mail root" }, { en: "Nothing", el: "Τίποτα" }], answer: 1, why: { en: "Merge streams so grep can filter errors.", el: "Ένωση ροών." } },
  ],
  "sr-files": [
    { q: { en: "tree -L 2 /etc shows…", el: "Το tree -L 2 /etc δείχνει…" }, choices: [{ en: "Only the files in /etc", el: "Μόνο τα αρχεία του /etc" }, { en: "Every file on the disk", el: "Κάθε αρχείο στον δίσκο" }, { en: "/etc two levels deep, subdirectories included", el: "Το /etc δύο επίπεδα βαθιά, με υποκαταλόγους" }, { en: "Only the hidden entries", el: "Μόνο τις κρυφές εγγραφές" }], answer: 2, why: { en: "-L caps how deep the walk goes; without it tree prints the whole subtree.", el: "Η -L περιορίζει το βάθος της διαδρομής· χωρίς αυτήν η tree εμφανίζει ολόκληρο το υποδέντρο." } },
    { q: { en: "mv can…", el: "Το mv μπορεί…" }, choices: [{ en: "Only delete", el: "Μόνο διαγραφή" }, { en: "Move or rename", el: "Μετακίνηση ή μετονομασία" }, { en: "Format disks", el: "Format" }, { en: "Crack wifi", el: "Crack wifi" }], answer: 1, why: { en: "mv SRC DEST", el: "mv SRC DEST" } },
    { q: { en: "rmdir fails when…", el: "Το rmdir αποτυγχάνει όταν…" }, choices: [{ en: "The dir has contents", el: "Ο φάκελος έχει περιεχόμενο" }, { en: "You are root", el: "Είσαι root" }, { en: "It is Monday", el: "Δευτέρα" }, { en: "IPv6 is on", el: "IPv6" }], answer: 0, why: { en: "Use rm -r for non-empty dirs.", el: "rm -r για μη άδειους." } },
  ],
  "sr-text": [
    { q: { en: "head shows…", el: "Το head δείχνει…" }, choices: [{ en: "Last 10 lines by default", el: "Τελευταίες 10" }, { en: "First 10 lines by default", el: "Πρώτες 10" }, { en: "PIDs", el: "PID" }, { en: "MAC", el: "MAC" }], answer: 1, why: { en: "tail is the opposite.", el: "Το tail είναι το αντίθετο." } },
    { q: { en: "sed s/WWW/www/g does…", el: "Το sed s/WWW/www/g…" }, choices: [{ en: "Deletes the file", el: "Σβήνει το αρχείο" }, { en: "Replaces WWW with www globally (on stdout)", el: "Αντικαθιστά WWW→www στην έξοδο" }, { en: "Starts apache", el: "Ανοίγει apache" }, { en: "Sets SUID", el: "SUID" }], answer: 1, why: { en: "/g = every occurrence. Redirect to write.", el: "/g = όλες. Redirect για εγγραφή." } },
    { q: { en: "less vs more: less can…", el: "less vs more: το less μπορεί…" }, choices: [{ en: "Format ext4", el: "ext4" }, { en: "Search with / in a real TTY", el: "Αναζήτηση με /" }, { en: "Assign IPs", el: "IP" }, { en: "Compile C", el: "C" }], answer: 1, why: { en: "less is the nicer pager.", el: "Το less είναι καλύτερο pager." } },
  ],
  "sr-apt": [
    { q: { en: "apt-get update…", el: "apt-get update…" }, choices: [{ en: "Installs every package", el: "Εγκαθιστά όλα" }, { en: "Refreshes package indexes", el: "Ανανεώνει ευρετήρια" }, { en: "Deletes /", el: "Σβήνει /" }, { en: "Starts FTP", el: "FTP" }], answer: 1, why: { en: "upgrade applies the updates.", el: "Το upgrade εφαρμόζει." } },
    { q: { en: "purge vs remove…", el: "purge vs remove…" }, choices: [{ en: "Same always", el: "Ίδια" }, { en: "purge also drops leftover configs", el: "Το purge καθαρίζει configs" }, { en: "purge installs more", el: "Εγκαθιστά περισσότερα" }, { en: "remove needs rootless", el: "χωρίς root" }], answer: 1, why: { en: "purge is the thorough uninstall.", el: "Το purge είναι πλήρες." } },
    { q: { en: "sources.list lists…", el: "Το sources.list έχει…" }, choices: [{ en: "Users", el: "Χρήστες" }, { en: "Package repositories", el: "Αποθετήρια πακέτων" }, { en: "Cron jobs", el: "Cron" }, { en: "SSH keys", el: "SSH keys" }], answer: 1, why: { en: "Don't add random experimental repos.", el: "Όχι τυχαία experimental repos." } },
  ],
  "sr-perms": [
    { q: { en: "chmod 7 means…", el: "Το chmod 7 δηλώνει…" }, choices: [{ en: "---", el: "---" }, { en: "rwx", el: "rwx" }, { en: "r--", el: "r--" }, { en: "x only", el: "μόνο x" }], answer: 1, why: { en: "4+2+1 = rwx.", el: "4+2+1 = rwx." } },
    { q: { en: "SUID is set with prefix…", el: "SUID με πρόθεμα…" }, choices: [{ en: "2", el: "2" }, { en: "4", el: "4" }, { en: "7", el: "7" }, { en: "0", el: "0" }], answer: 1, why: { en: "4644 = SUID + 644. 2xxx = SGID.", el: "4=SUID, 2=SGID." } },
    { q: { en: "A file you just created came out 644. What decided that?", el: "Ένα αρχείο που μόλις δημιούργησες βγήκε 644. Τι το καθόρισε;" }, choices: [{ en: "The kernel always grants 644", el: "Ο πυρήνας χορηγεί πάντα 644" }, { en: "A base of 666 with your umask bits removed", el: "Βάση 666 με τα bits της umask σου αφαιρεμένα" }, { en: "The group the file landed in", el: "Η ομάδα στην οποία κατέληξε το αρχείο" }, { en: "The filesystem it was written to", el: "Το σύστημα αρχείων όπου γράφτηκε" }], answer: 1, why: { en: "Files start at 666 and directories at 777, minus the umask; the usual 022 is what yields 644 and 755.", el: "Τα αρχεία ξεκινούν από 666 και οι κατάλογοι από 777, μείον την umask· η συνηθισμένη 022 είναι αυτή που δίνει 644 και 755." } },
  ],
  "sr-net": [
    { q: { en: "lo is always…", el: "Το lo είναι πάντα…" }, choices: [{ en: "8.8.8.8", el: "8.8.8.8" }, { en: "127.0.0.1", el: "127.0.0.1" }, { en: "0.0.0.0", el: "0.0.0.0" }, { en: "255.255.255.255", el: "255.255.255.255" }], answer: 1, why: { en: "Loopback.", el: "Loopback." } },
    { q: { en: "dhclient asks…", el: "Το dhclient ζητά…" }, choices: [{ en: "A TLS cert", el: "Πιστοποιητικό TLS" }, { en: "A DHCP lease / IP", el: "Μίσθωση DHCP / IP" }, { en: "A man page", el: "man" }, { en: "SUID", el: "SUID" }], answer: 1, why: { en: "Dynamic addressing.", el: "Δυναμική διευθυνσιοδότηση." } },
    { q: { en: "Changing MAC to bypass someone else's network control is…", el: "Αλλαγή MAC για παράκαμψη ξένου δικτύου είναι…" }, choices: [{ en: "Fine always", el: "Πάντα ΟΚ" }, { en: "Illegal without authorisation", el: "Παράνομο χωρίς άδεια" }, { en: "Required by HTTP", el: "Απαίτηση HTTP" }, { en: "A DNS standard", el: "Πρότυπο DNS" }], answer: 1, why: { en: "Lab only.", el: "Μόνο lab." } },
  ],
  "sr-proc": [
    { q: { en: "ps aux shows…", el: "ps aux δείχνει…" }, choices: [{ en: "Only cron", el: "Μόνο cron" }, { en: "All users' processes", el: "Διεργασίες όλων" }, { en: "DNS only", el: "Μόνο DNS" }, { en: "Disk partitions", el: "Διαμερίσματα" }], answer: 1, why: { en: "a,u,x flags widen the listing.", el: "a,u,x διευρύνουν." } },
    { q: { en: "kill -9 is…", el: "kill -9 είναι…" }, choices: [{ en: "A polite hangup", el: "Ευγενικό hangup" }, { en: "SIGKILL — force stop", el: "SIGKILL — βίαιο stop" }, { en: "Nice +9", el: "Nice +9" }, { en: "FTP restart", el: "FTP restart" }], answer: 1, why: { en: "-1 is SIGHUP.", el: "-1 = SIGHUP." } },
    { q: { en: "Appending & …", el: "Το & στο τέλος…" }, choices: [{ en: "Deletes the process", el: "Σβήνει τη διεργασία" }, { en: "Runs it in the background", el: "Τη βάζει στο παρασκήνιο" }, { en: "Formats /tmp", el: "Format /tmp" }, { en: "Opens man", el: "Ανοίγει man" }], answer: 1, why: { en: "jobs / fg manage those jobs.", el: "jobs / fg." } },
  ],
  "sr-env": [
    { q: { en: "HISTSIZE=0 must have…", el: "HISTSIZE=0 πρέπει…" }, choices: [{ en: "Spaces around =", el: "Κενά γύρω από =" }, { en: "No spaces around =", el: "Χωρίς κενά" }, { en: "A comma", el: "Κόμμα" }, { en: "sudo always", el: "πάντα sudo" }], answer: 1, why: { en: "VAR=value syntax.", el: "Σύνταξη VAR=value." } },
    { q: { en: "export makes a var…", el: "Με το export, η μεταβλητή γίνεται…" }, choices: [{ en: "Hidden from ps", el: "Κρυφή από το ps" }, { en: "Inherited by child processes", el: "Κληρονομήσιμη από τις διεργασίες-παιδιά" }, { en: "A firewall rule", el: "Κανόνα firewall" }, { en: "Immutable kernel", el: "Αμετάβλητο kernel" }], answer: 1, why: { en: "Environment vs shell scope.", el: "Περιβάλλον vs shell." } },
    { q: { en: "unset NAME…", el: "unset NAME…" }, choices: [{ en: "Creates NAME", el: "Δημιουργεί NAME" }, { en: "Deletes the variable", el: "Διαγράφει τη μεταβλητή" }, { en: "Installs apt", el: "Εγκαθιστά apt" }, { en: "Opens nano", el: "Ανοίγει nano" }], answer: 1, why: { en: "Gone until you set it again.", el: "Φεύγει μέχρι να την ξαναθέσεις." } },
  ],
  "sr-bash": [
    { q: { en: "#!/bin/bash is the…", el: "#!/bin/bash είναι…" }, choices: [{ en: "SUID bit", el: "SUID" }, { en: "Shebang — interpreter line", el: "Shebang — διερμηνέας" }, { en: "Cron field", el: "Πεδίο cron" }, { en: "MAC", el: "MAC" }], answer: 1, why: { en: "Tells the kernel to use bash.", el: "Λέει στο kernel να χρησιμοποιήσει bash." } },
    { q: { en: "./script means…", el: "Το ./script δηλώνει…" }, choices: [{ en: "Run from PATH only", el: "Μόνο PATH" }, { en: "Run the file in the current directory", el: "Εκτέλεση του αρχείου στον τρέχοντα φάκελο" }, { en: "Delete it", el: "Διαγραφή" }, { en: "Compile it", el: "Compile" }], answer: 1, why: { en: "Need +x too.", el: "Χρειάζεται και +x." } },
    { q: { en: "nmap -sn is a…", el: "nmap -sn είναι…" }, choices: [{ en: "OS exploit", el: "OS exploit" }, { en: "Ping / host-discovery sweep", el: "Ping / ανακάλυψη hosts" }, { en: "Hash crack", el: "Hash crack" }, { en: "TLS MITM", el: "TLS MITM" }], answer: 1, why: { en: "Formerly -sP. Lab networks only.", el: "Πρώην -sP. Μόνο lab." } },
  ],
  "sr-cron": [
    { q: { en: "Crontab field 1 is…", el: "Το 1ο πεδίο crontab είναι…" }, choices: [{ en: "Year", el: "Έτος" }, { en: "Minute 0–59", el: "Λεπτό 0–59" }, { en: "User always", el: "Πάντα χρήστης" }, { en: "Path", el: "Path" }], answer: 1, why: { en: "Then hour, dom, month, dow.", el: "Μετά ώρα, μέρα, μήνας, εβδομάδα." } },
    { q: { en: "55 23 * * * means…", el: "Το 55 23 * * * δηλώνει…" }, choices: [{ en: "05:23 once", el: "05:23 μία φορά" }, { en: "23:55 every day", el: "23:55 κάθε μέρα" }, { en: "Every 23 seconds", el: "Κάθε 23 δευτ." }, { en: "Never", el: "Ποτέ" }], answer: 1, why: { en: "minute 55, hour 23.", el: "λεπτό 55, ώρα 23." } },
    { q: { en: "Runlevel 0…", el: "Runlevel 0…" }, choices: [{ en: "Reboot", el: "Reboot" }, { en: "Halt the system", el: "Σβήσιμο συστήματος" }, { en: "GUI only", el: "Μόνο GUI" }, { en: "Single-user", el: "Single-user" }], answer: 1, why: { en: "6 is reboot, 1 is single-user.", el: "6=reboot, 1=single-user." } },
  ],
  "sr-svc": [
    { q: { en: "Apache's default page lives at…", el: "Η default σελίδα Apache είναι στο…" }, choices: [{ en: "/etc/passwd", el: "/etc/passwd" }, { en: "/var/www/html/index.html", el: "/var/www/html/index.html" }, { en: "/root/Desktop", el: "/root/Desktop" }, { en: "/proc", el: "/proc" }], answer: 1, why: { en: "Document root.", el: "Document root." } },
    { q: { en: "SSH vs telnet…", el: "SSH vs telnet…" }, choices: [{ en: "Same encryption", el: "Ίδια κρυπτογράφηση" }, { en: "SSH encrypts the channel", el: "Το SSH κρυπτογραφεί το κανάλι" }, { en: "Telnet is newer", el: "Το telnet είναι νεότερο" }, { en: "Neither uses TCP", el: "Κανένα TCP" }], answer: 1, why: { en: "Never telnet credentials.", el: "Ποτέ κωδικοί σε telnet." } },
    { q: { en: "Anonymous FTP login in this lab is…", el: "Anonymous FTP εδώ είναι…" }, choices: [{ en: "A live CESCA server", el: "Ζωντανός CESCA" }, { en: "A simulated GameHack server", el: "Προσομοίωση GameHack" }, { en: "Required on the internet", el: "Υποχρεωτικό στο internet" }, { en: "A kernel module", el: "Κερνελ module" }], answer: 1, why: { en: "ftp.gamehack.lab is fake. Stay in scope.", el: "Το ftp.gamehack.lab είναι ψεύτικο." } },
  ],
  "dfir-intake": [
    { q: { en: "A matching SHA-256 digest supports…", el: "Ίδιο SHA-256 υποστηρίζει…" }, choices: [{ en: "The file is harmless", el: "Το αρχείο είναι ακίνδυνο" }, { en: "The compared byte sequences match", el: "Τα bytes που συγκρίθηκαν είναι ίδια" }, { en: "The author is known", el: "Είναι γνωστός ο δημιουργός" }, { en: "The file is original", el: "Είναι πρωτότυπο" }], answer: 1, why: { en: "A digest supports byte identity, not safety or authorship.", el: "Το digest υποστηρίζει ταυτότητα bytes, όχι ασφάλεια ή δημιουργό." } },
    { q: { en: "What is chain of custody for?", el: "Σε τι χρησιμεύει chain of custody;" }, choices: [{ en: "Provenance and handling record", el: "Καταγραφή προέλευσης και χειρισμού" }, { en: "Running a suspicious file", el: "Εκτέλεση ύποπτου αρχείου" }, { en: "Changing timestamps", el: "Αλλαγή timestamps" }, { en: "Attribution from an IP", el: "Attribution από IP" }], answer: 0, why: { en: "It records who handled evidence, when, how, and why.", el: "Καταγράφει ποιος, πότε, πώς και γιατί χειρίστηκε τεκμήριο." } },
    { q: { en: "A file extension is…", el: "Η κατάληξη αρχείου είναι…" }, choices: [{ en: "Proof of file type", el: "Απόδειξη τύπου" }, { en: "A clue that should be checked against content", el: "Ένδειξη που ελέγχεται με το περιεχόμενο" }, { en: "A cryptographic hash", el: "Cryptographic hash" }, { en: "A chain-of-custody log", el: "Chain-of-custody log" }], answer: 1, why: { en: "Use file signatures and metadata to verify the actual format.", el: "Έλεγξε signatures και metadata για πραγματικό format." } },
  ],
  "dfir-windows": [
    { q: { en: "NTUSER.DAT primarily represents…", el: "Το NTUSER.DAT αντιπροσωπεύει κυρίως…" }, choices: [{ en: "A user registry hive", el: "Hive Registry χρήστη" }, { en: "A packet capture", el: "Packet capture" }, { en: "A disk image", el: "Disk image" }, { en: "A browser executable", el: "Εκτελέσιμο browser" }], answer: 0, why: { en: "Per-user settings are stored in the user's hive.", el: "Ρυθμίσεις χρήστη αποθηκεύονται στο user hive." } },
    { q: { en: "Windows Security event 4625 indicates…", el: "Το Windows Security event 4625 δείχνει…" }, choices: [{ en: "Successful login", el: "Επιτυχή σύνδεση" }, { en: "Failed login", el: "Αποτυχημένη σύνδεση" }, { en: "Audit log cleared", el: "Καθαρισμό audit log" }, { en: "Account created", el: "Δημιουργία account" }], answer: 1, why: { en: "Correlate event IDs with user, host, time, and nearby events.", el: "Συσχέτισε ID με χρήστη, host, χρόνο και γειτονικά events." } },
    { q: { en: "A browser history row is strongest when…", el: "Μια γραμμή browser history είναι ισχυρότερη όταν…" }, choices: [{ en: "Used alone for attribution", el: "Χρησιμοποιείται μόνη για attribution" }, { en: "Correlated with other artifacts and timestamps", el: "Συσχετίζεται με artifacts και timestamps" }, { en: "Passwords are disclosed", el: "Αποκαλύπτονται κωδικοί" }, { en: "The database is modified", el: "Τροποποιείται η βάση" }], answer: 1, why: { en: "Independent artifacts provide stronger context.", el: "Ανεξάρτητα artifacts δίνουν ισχυρότερο πλαίσιο." } },
  ],
  "dfir-documents": [
    { q: { en: "Modern .docx is commonly…", el: "Το σύγχρονο .docx είναι συνήθως…" }, choices: [{ en: "A ZIP-based OOXML container", el: "ZIP-based OOXML container" }, { en: "A packet capture", el: "Packet capture" }, { en: "An NTFS hive", el: "NTFS hive" }, { en: "A plain bitmap", el: "Bitmap" }], answer: 0, why: { en: "OOXML documents package XML, relationships, metadata, and media.", el: "Τα OOXML πακετάρουν XML, relationships, metadata και media." } },
    { q: { en: "A detected macro means…", el: "Ένα εντοπισμένο macro απαιτεί…" }, choices: [{ en: "It definitely executed", el: "Σίγουρα εκτελέστηκε" }, { en: "Perform static inspection; execution still needs evidence", el: "Χρειάζεται στατική εξέταση, η εκτέλεση απαιτεί τεκμήρια" }, { en: "The document is benign", el: "Το έγγραφο είναι ακίνδυνο" }, { en: "The hash is wrong", el: "Λάθος hash" }], answer: 1, why: { en: "Presence is an indicator, not proof of execution.", el: "Η παρουσία είναι ένδειξη, όχι απόδειξη εκτέλεσης." } },
    { q: { en: "A hidden image string is…", el: "Κρυφό string εικόνας είναι…" }, choices: [{ en: "Always malicious", el: "Πάντα κακόβουλο" }, { en: "A lead to validate and contextualize", el: "Lead προς επαλήθευση και πλαίσιο" }, { en: "A file hash", el: "File hash" }, { en: "A chain-of-custody record", el: "Chain-of-custody record" }], answer: 1, why: { en: "Steganography findings need independent validation.", el: "Ευρήματα steganography θέλουν ανεξάρτητη επικύρωση." } },
  ],
  "dfir-web": [
    { q: { en: "Apache access logs commonly show…", el: "Τα Apache access logs δείχνουν συνήθως…" }, choices: [{ en: "Request line, status, time, client", el: "Request, status, χρόνος, client" }, { en: "Full POST body always", el: "Πάντα πλήρες POST body" }, { en: "RAM pages", el: "RAM pages" }, { en: "Registry hives", el: "Registry hives" }], answer: 0, why: { en: "POST request bodies may require WAF or application logs.", el: "POST bodies μπορεί να απαιτούν WAF/application logs." } },
    { q: { en: "A WAF rule hit is…", el: "WAF rule hit είναι…" }, choices: [{ en: "An automatic attribution verdict", el: "Αυτόματο attribution" }, { en: "A detector event to validate with context", el: "Detector event προς επαλήθευση με πλαίσιο" }, { en: "A hash mismatch", el: "Hash mismatch" }, { en: "Proof data was exfiltrated", el: "Απόδειξη exfiltration" }], answer: 1, why: { en: "Correlate rule, request, response, timestamps, and impact.", el: "Συσχέτισε rule, request, response, χρόνο και επίπτωση." } },
    { q: { en: "An IP address alone proves…", el: "Μια IP μόνη της αποδεικνύει…" }, choices: [{ en: "A named person", el: "Συγκεκριμένο άτομο" }, { en: "An observed network address", el: "Παρατηρημένη network address" }, { en: "Intent", el: "Πρόθεση" }, { en: "Malware family", el: "Malware family" }], answer: 1, why: { en: "NAT, VPNs, proxies, and shared infrastructure limit attribution.", el: "NAT, VPN, proxies και shared infrastructure περιορίζουν attribution." } },
  ],
  "dfir-network": [
    { q: { en: "A Wireshark display filter…", el: "Ένα Wireshark display filter…" }, choices: [{ en: "Deletes packets from the capture", el: "Διαγράφει packets" }, { en: "Narrows the displayed packet view", el: "Περιορίζει την προβολή packets" }, { en: "Rewrites the source PCAP", el: "Αλλάζει το PCAP" }, { en: "Authenticates a user", el: "Ελέγχει χρήστη" }], answer: 1, why: { en: "Filters change the view, not the evidence source.", el: "Τα filters αλλάζουν προβολή, όχι source evidence." } },
    { q: { en: "Follow TCP Stream helps…", el: "Το Follow TCP Stream βοηθά…" }, choices: [{ en: "Reconstruct conversation context", el: "Ανασύνθεση context συνομιλίας" }, { en: "Create a hash", el: "Δημιουργία hash" }, { en: "Mount NTFS", el: "Mount NTFS" }, { en: "Decrypt every TLS stream", el: "Αποκρυπτογράφηση TLS" }], answer: 0, why: { en: "It presents packets from one connection as a conversation.", el: "Παρουσιάζει packets μιας σύνδεσης ως συνομιλία." } },
    { q: { en: "Exported objects should be…", el: "Τα exported objects πρέπει να…" }, choices: [{ en: "Treated as original evidence", el: "Θεωρούνται πρωτότυπο" }, { en: "Recorded as derived evidence with source stream", el: "Καταγράφονται ως derived με source stream" }, { en: "Uploaded publicly", el: "Ανεβαίνουν δημόσια" }, { en: "Edited in place", el: "Τροποποιούνται επί τόπου" }], answer: 1, why: { en: "Record source capture, frame/stream, export method, and hash.", el: "Κατέγραψε source capture, frame/stream, export και hash." } },
  ],
  "dfir-disk": [
    { q: { en: "A forensic image should be…", el: "Ένα forensic image πρέπει να…" }, choices: [{ en: "Acquired read-only and verified", el: "Αποκτηθεί read-only και επαληθευτεί" }, { en: "Edited before hashing", el: "Τροποποιηθεί πριν το hash" }, { en: "Mounted read/write", el: "Mounted read/write" }, { en: "Renamed without notes", el: "Μετονομαστεί χωρίς σημειώσεις" }], answer: 0, why: { en: "Preserve source, document acquisition, and validate the copy.", el: "Διατήρησε πηγή, τεκμηρίωσε acquisition και επικύρωσε αντίγραφο." } },
    { q: { en: "$MFT primarily stores…", el: "$MFT κυρίως αποθηκεύει…" }, choices: [{ en: "NTFS file metadata records", el: "NTFS file metadata records" }, { en: "PCAP streams", el: "PCAP streams" }, { en: "Passwords in plaintext", el: "Plaintext passwords" }, { en: "Browser cookies only", el: "Μόνο cookies" }], answer: 0, why: { en: "$LogFile records filesystem metadata transactions; the two serve different roles.", el: "$LogFile κρατά filesystem metadata transactions, έχουν διαφορετικούς ρόλους." } },
    { q: { en: "A deleted MFT entry proves…", el: "Deleted MFT entry αποδεικνύει…" }, choices: [{ en: "All file contents are recoverable", el: "Ανακτάται όλο το περιεχόμενο" }, { en: "A metadata record is marked deleted", el: "Metadata record έχει σημειωθεί deleted" }, { en: "Who deleted the file", el: "Ποιος το διέγραψε" }, { en: "Malware execution", el: "Malware execution" }], answer: 1, why: { en: "Recovery and attribution require additional evidence.", el: "Ανάκτηση και attribution απαιτούν πρόσθετα evidence." } },
  ],
  "dfir-malware": [
    { q: { en: "Static analysis means…", el: "Η στατική ανάλυση είναι…" }, choices: [{ en: "Inspecting without executing the sample", el: "Εξέταση χωρίς εκτέλεση" }, { en: "Running it on a workstation", el: "Εκτέλεση σε workstation" }, { en: "Deleting logs", el: "Διαγραφή logs" }, { en: "Hash cracking", el: "Cracking hashes" }], answer: 0, why: { en: "Begin with metadata, hashes, strings, and safe code inspection.", el: "Ξεκίνα με metadata, hashes, strings και ασφαλή code inspection." } },
    { q: { en: "A defanged domain ending .invalid…", el: "Defanged domain με .invalid…" }, choices: [{ en: "Should resolve publicly", el: "Επιλύεται δημόσια" }, { en: "Is a safe, non-routable reporting placeholder", el: "Είναι ασφαλές reporting placeholder" }, { en: "Proves malware", el: "Αποδεικνύει malware" }, { en: "Is an MD5", el: "Είναι MD5" }], answer: 1, why: { en: ".invalid is reserved for examples and prevents accidental live navigation.", el: "Το .invalid είναι δεσμευμένο για παραδείγματα." } },
    { q: { en: "A clean public scanner result proves…", el: "Καθαρό public scanner result αποδεικνύει…" }, choices: [{ en: "The sample is harmless", el: "Το sample είναι ακίνδυνο" }, { en: "Only that those scanners did not flag it then", el: "Μόνο ότι δεν το επισήμαναν τότε" }, { en: "Its author", el: "Δημιουργό" }, { en: "No behavior", el: "Καμία συμπεριφορά" }], answer: 1, why: { en: "Absence of detections is not proof of benignness; public upload may expose confidential data.", el: "Απουσία detection δεν αποδεικνύει benignness, public upload εκθέτει πιθανώς confidential data." } },
  ],
  "dfir-memory": [
    { q: { en: "Memory evidence is especially valuable because it can preserve…", el: "Memory evidence είναι πολύτιμο γιατί διατηρεί…" }, choices: [{ en: "Only old file names", el: "Μόνο ονόματα αρχείων" }, { en: "Volatile processes, sockets, environment, clipboard", el: "Volatile processes, sockets, environment, clipboard" }, { en: "Only registry backups", el: "Μόνο registry backups" }, { en: "Static disk sectors only", el: "Μόνο sectors δίσκου" }], answer: 1, why: { en: "RAM captures a moment-in-time volatile system state.", el: "Η RAM συλλαμβάνει στιγμιαία volatile κατάσταση." } },
    { q: { en: "pstree adds which context to a process list?", el: "Το pstree προσθέτει ποιο πλαίσιο;" }, choices: [{ en: "Parent-child relationships", el: "Σχέσεις parent-child" }, { en: "File hashes", el: "File hashes" }, { en: "Partition offsets", el: "Partition offsets" }, { en: "Browser bookmarks", el: "Bookmarks" }], answer: 0, why: { en: "An unusual parent can help explain how a process started.", el: "Ασυνήθιστος parent βοηθά να εξηγηθεί εκκίνηση process." } },
    { q: { en: "A suggested memory profile is…", el: "Προτεινόμενο memory profile είναι…" }, choices: [{ en: "A parsing hypothesis to validate", el: "Υπόθεση parsing προς επικύρωση" }, { en: "The user's password", el: "Κωδικός χρήστη" }, { en: "A disk image", el: "Disk image" }, { en: "Always certain", el: "Πάντα βέβαιο" }], answer: 0, why: { en: "Validate profile output with image metadata and other artifacts.", el: "Επικύρωσε με image metadata και άλλα artifacts." } },
  ],
  "dfir-container": [
    { q: { en: "docker diff reports…", el: "Το docker diff αναφέρει…" }, choices: [{ en: "Added, deleted, changed paths", el: "Προσθήκες, διαγραφές, αλλαγές paths" }, { en: "Only network packets", el: "Μόνο packets" }, { en: "Password hashes", el: "Hashes κωδικών" }, { en: "VBA macros", el: "VBA macros" }], answer: 0, why: { en: "A/C/D changes compare a container's writable layer with its image.", el: "A/C/D συγκρίνουν writable layer με image." } },
    { q: { en: "Deleting a secret in a later image layer…", el: "Διαγραφή secret σε μεταγενέστερο layer…" }, choices: [{ en: "Guarantees bytes are erased", el: "Εγγυάται διαγραφή bytes" }, { en: "May leave secret bytes in an earlier layer", el: "Μπορεί να αφήσει bytes σε παλιότερο layer" }, { en: "Changes the host kernel", el: "Αλλάζει host kernel" }, { en: "Rewrites all logs", el: "Ξαναγράφει logs" }], answer: 1, why: { en: "Container image layers are immutable; inspect history and rotate exposed secrets.", el: "Image layers είναι immutable, έλεγξε history και κάνε rotation." } },
    { q: { en: "docker export typically captures…", el: "Το docker export συνήθως συλλέγει…" }, choices: [{ en: "Filesystem snapshot, not full image history", el: "Filesystem snapshot, όχι όλο image history" }, { en: "Only registry keys", el: "Μόνο registry keys" }, { en: "Every memory page", el: "Κάθε memory page" }, { en: "No evidence", el: "Κανένα evidence" }], answer: 0, why: { en: "Container filesystem export and image-layer acquisition answer different questions.", el: "Filesystem export και image-layer acquisition απαντούν διαφορετικά ερωτήματα." } },
  ],
  "dfir-passwords": [
    { q: { en: "A password hash is…", el: "Password hash είναι…" }, choices: [{ en: "Encrypted text with a reversible key", el: "Αναστρέψιμο κρυπτογραφημένο κείμενο" }, { en: "A one-way digest commonly checked against candidates", el: "One-way digest που συγκρίνεται με candidates" }, { en: "A username", el: "Username" }, { en: "A packet filter", el: "Packet filter" }], answer: 1, why: { en: "Candidate hashing and comparison can find weak passwords; the hash is not simply decrypted.", el: "Hash candidates και σύγκριση βρίσκουν αδύναμους κωδικούς, δεν αποκρυπτογραφείται απλά." } },
    { q: { en: "Why salt stored passwords?", el: "Γιατί salt στους κωδικούς;" }, choices: [{ en: "To make every account hash distinct and defeat precomputed reuse", el: "Μοναδικό hash ανά account και αποφυγή precomputed reuse" }, { en: "To reveal the password", el: "Για αποκάλυψη κωδικού" }, { en: "To speed up MD5", el: "Επιτάχυνση MD5" }, { en: "To encrypt a disk", el: "Κρυπτογράφηση δίσκου" }], answer: 0, why: { en: "Use a unique salt and a slow adaptive KDF such as Argon2id, bcrypt, or scrypt.", el: "Χρησιμοποίησε μοναδικό salt και αργό adaptive KDF όπως Argon2id, bcrypt ή scrypt." } },
    { q: { en: "A recovered candidate password proves…", el: "Ένας ανακτημένος candidate κωδικός αποδεικνύει…" }, choices: [{ en: "Which person typed it", el: "Ποιος τον πληκτρολόγησε" }, { en: "The candidate matches the supplied training digest", el: "Ο candidate ταιριάζει στο training digest" }, { en: "The account was used in the incident", el: "Το account χρησιμοποιήθηκε στο incident" }, { en: "The evidence is authentic", el: "Το evidence είναι authentic" }], answer: 1, why: { en: "Password recovery and user attribution are separate questions.", el: "Ανάκτηση κωδικού και attribution είναι διαφορετικά ερωτήματα." } },
  ],
  "ssh-svc-recon": [
    { q: { en: "SSH listens by default on…", el: "Το SSH ακούει εξ ορισμού στην…" }, choices: [{ en: "TCP 21", el: "TCP 21" }, { en: "TCP 22", el: "TCP 22" }, { en: "UDP 53", el: "UDP 53" }, { en: "TCP 3389", el: "TCP 3389" }], answer: 1, why: { en: "Port 22/tcp is the usual SSH listener unless an administrator moved it.", el: "Η θύρα 22/tcp είναι ο συνηθισμένος ακροατής SSH, εκτός αν μετακινήθηκε." } },
    { q: { en: "nmap -sV is used to…", el: "Το nmap -sV χρησιμοποιείται για να…" }, choices: [{ en: "Guess a password", el: "Μαντέψει κωδικό" }, { en: "Read the service banner and version", el: "Διαβάσει banner και έκδοση" }, { en: "Disable SSH", el: "Απενεργοποιήσει το SSH" }, { en: "Open a tunnel", el: "Ανοίξει τούνελ" }], answer: 1, why: { en: "Version detection tells you which daemon you are measuring before any login.", el: "Η ανίχνευση έκδοσης λέει ποιον daemon μετράς πριν από σύνδεση." } },
    { q: { en: "A version scan of a host you do not own is…", el: "Σάρωση έκδοσης σε host που δεν σου ανήκει είναι…" }, choices: [{ en: "Always allowed for learning", el: "Πάντα επιτρεπτή για μάθηση" }, { en: "Unauthorized testing", el: "Μη εξουσιοδοτημένος έλεγχος" }, { en: "Required by OpenSSH", el: "Απαίτηση του OpenSSH" }, { en: "Only a ping", el: "Μόνο ping" }], answer: 1, why: { en: "Practice stays on the fictional lab host or a machine you administer.", el: "Η εξάσκηση μένει στον φανταστικό host ή σε μηχάνημα που διαχειρίζεσαι." } },
  ],
  "ssh-svc-auth": [
    { q: { en: "If only publickey is offered…", el: "Αν προσφέρεται μόνο publickey…" }, choices: [{ en: "Password guessing still has a field", el: "Η μαντεψιά κωδικού έχει ακόμη πεδίο" }, { en: "There is no password field to guess", el: "Δεν υπάρχει πεδίο κωδικού για μαντεψιά" }, { en: "SSH is disabled", el: "Το SSH είναι κλειστό" }, { en: "The port moved", el: "Η θύρα μετακινήθηκε" }], answer: 1, why: { en: "Keys-only authentication removes remote password guessing.", el: "Η ταυτοποίηση μόνο με κλειδιά αφαιρεί την απομακρυσμένη μαντεψιά κωδικού." } },
    { q: { en: "PasswordAuthentication yes means…", el: "Το PasswordAuthentication yes σημαίνει…" }, choices: [{ en: "Keys are forbidden", el: "Τα κλειδιά απαγορεύονται" }, { en: "The server still accepts passwords", el: "Ο server δέχεται ακόμη κωδικούς" }, { en: "Forwarding is off", el: "Η προώθηση είναι κλειστή" }, { en: "The port is hidden", el: "Η θύρα είναι κρυφή" }], answer: 1, why: { en: "That line is the weak starting policy the lesson teaches you to close.", el: "Αυτή η γραμμή είναι η αδύναμη αρχική πολιτική που το μάθημα σε μαθαίνει να κλείνεις." } },
    { q: { en: "The lab auth-method script…", el: "Το script μεθόδων του lab…" }, choices: [{ en: "Queries any internet host", el: "Ρωτά οποιονδήποτε host στο διαδίκτυο" }, { en: "Prints a fixed answer for ssh.lab only", el: "Τυπώνει σταθερή απάντηση μόνο για το ssh.lab" }, { en: "Changes sshd_config", el: "Αλλάζει το sshd_config" }, { en: "Creates a private key", el: "Δημιουργεί ιδιωτικό κλειδί" }], answer: 1, why: { en: "GameHack does not probe a live daemon outside the sandbox.", el: "Το GameHack δεν εξετάζει ζωντανό daemon έξω από το sandbox." } },
  ],
  "ssh-svc-creds": [
    { q: { en: "A dictionary check tries…", el: "Ο έλεγχος λεξικού δοκιμάζει…" }, choices: [{ en: "Every possible byte", el: "Κάθε δυνατό byte" }, { en: "Likely values from a list", el: "Πιθανές τιμές από λίστα" }, { en: "Only empty passwords", el: "Μόνο κενούς κωδικούς" }, { en: "Host keys", el: "Κλειδιά host" }], answer: 1, why: { en: "People choose predictable passwords, so a short list is enough to expose weak hygiene.", el: "Οι άνθρωποι διαλέγουν προβλέψιμους κωδικούς, οπότε μια σύντομη λίστα αρκεί για να φανεί αδύναμη υγιεινή." } },
    { q: { en: "Running that check against a host you do not administer is…", el: "Ο ίδιος έλεγχος σε host που δεν διαχειρίζεσαι είναι…" }, choices: [{ en: "Fine if the wordlist is small", el: "Εντάξει αν το λεξικό είναι μικρό" }, { en: "Unauthorized and illegal in most places", el: "Μη εξουσιοδοτημένος και παράνομος στις περισσότερες χώρες" }, { en: "Required to learn SSH", el: "Απαραίτητος για να μάθεις SSH" }, { en: "Only rude", el: "Απλώς αγενής" }], answer: 1, why: { en: "The lab accepts only the fictional account on ssh.lab.", el: "Το εργαστήριο δέχεται μόνο τον φανταστικό λογαριασμό στο ssh.lab." } },
    { q: { en: "The durable fix after a weak password falls is…", el: "Η μόνιμη διόρθωση αφού πέσει αδύναμος κωδικός είναι…" }, choices: [{ en: "A longer login banner", el: "Μεγαλύτερο banner σύνδεσης" }, { en: "Keys, then disable passwords, plus lockout and alerts", el: "Κλειδιά, μετά κλείσιμο κωδικών, συν κλείδωμα και ειδοποιήσεις" }, { en: "Moving only the port", el: "Μόνο μετακίνηση της θύρας" }, { en: "Opening port 22 wider", el: "Μεγαλύτερο άνοιγμα της θύρας 22" }], answer: 1, why: { en: "Hiding the port does not remove the password field.", el: "Το κρύψιμο της θύρας δεν αφαιρεί το πεδίο κωδικού." } },
  ],
  "ssh-svc-harden": [
    { q: { en: "Changing SSH off port 22 mainly…", el: "Η μετακίνηση του SSH από τη θύρα 22 κυρίως…" }, choices: [{ en: "Stops a targeted scan", el: "Σταματά στοχευμένη σάρωση" }, { en: "Reduces casual scanner noise", el: "Μειώνει τον θόρυβο τυχαίων σαρωτών" }, { en: "Replaces key authentication", el: "Αντικαθιστά την ταυτοποίηση με κλειδί" }, { en: "Encrypts the session twice", el: "Κρυπτογραφεί τη συνεδρία δύο φορές" }], answer: 1, why: { en: "Obscurity is a minor control. Credential and configuration fixes are the real ones.", el: "Η αφάνεια είναι μικρός έλεγχος. Οι πραγματικοί είναι το διαπιστευτήριο και η ρύθμιση." } },
    { q: { en: "A private key without a passphrase…", el: "Ιδιωτικό κλειδί χωρίς συνθηματική φράση…" }, choices: [{ en: "Is safe if the filename is hidden", el: "Είναι ασφαλές αν κρυφτεί το όνομα" }, { en: "Is enough for access if the file is copied", el: "Αρκεί για πρόσβαση αν αντιγραφεί το αρχείο" }, { en: "Cannot be used by SSH", el: "Δεν μπορεί να χρησιμοποιηθεί από το SSH" }, { en: "Disables forwarding", el: "Απενεργοποιεί την προώθηση" }], answer: 1, why: { en: "Protect the key with a long random passphrase. This lab does not demonstrate guessing it.", el: "Προστάτευσε το κλειδί με μακριά τυχαία φράση. Αυτό το lab δεν δείχνει μαντεψιά." } },
    { q: { en: "AllowTcpForwarding no is for when…", el: "Το AllowTcpForwarding no είναι για όταν…" }, choices: [{ en: "You want every user to pivot internally", el: "Θέλεις κάθε χρήστη να μεταπηδά εσωτερικά" }, { en: "Forwarding is not genuinely needed", el: "Η προώθηση δεν χρειάζεται πραγματικά" }, { en: "Passwords must stay enabled", el: "Οι κωδικοί πρέπει να μείνουν ενεργοί" }, { en: "The port must stay 22", el: "Η θύρα πρέπει να μείνει 22" }], answer: 1, why: { en: "A valid login can otherwise reach services that were only bound to loopback.", el: "Αλλιώς μια έγκυρη σύνδεση μπορεί να φτάσει υπηρεσίες που άκουγαν μόνο στο loopback." } },
  ],
  "ssh-svc-lab": [
    { q: { en: "A VirtualBox NAT network is used so lab traffic…", el: "Το δίκτυο NAT του VirtualBox χρησιμοποιείται ώστε η κίνηση του lab…" }, choices: [{ en: "Joins your home LAN", el: "Μπαίνει στο οικιακό LAN" }, { en: "Stays off the physical LAN", el: "Μένει έξω από το φυσικό LAN" }, { en: "Reaches every classmate", el: "Φτάνει κάθε συμμαθητή" }, { en: "Replaces SSH", el: "Αντικαθιστά το SSH" }], answer: 1, why: { en: "Isolation is what makes repeated practice safe.", el: "Η απομόνωση κάνει ασφαλή την επανάληψη." } },
    { q: { en: "A snapshot after installing SSH lets you…", el: "Στιγμιότυπο μετά την εγκατάσταση SSH σε αφήνει να…" }, choices: [{ en: "Attack a real server again", el: "Επιτεθείς ξανά σε πραγματικό server" }, { en: "Revert and repeat the harden-and-verify loop", el: "Γυρίσεις πίσω και να επαναλάβεις τον κύκλο σκλήρυνσης" }, { en: "Skip authorization", el: "Παρακάμψεις την άδεια" }, { en: "Store a real private key", el: "Αποθηκεύσεις πραγματικό ιδιωτικό κλειδί" }], answer: 1, why: { en: "Reset the target to the weak starting state and practice the same sequence.", el: "Επαναφέρεις τον στόχο στην αδύναμη αρχική κατάσταση και εξασκείς την ίδια σειρά." } },
    { q: { en: "The easiest root cause in this path is…", el: "Η ευκολότερη βασική αιτία σε αυτό το μονοπάτι είναι…" }, choices: [{ en: "A missing banner", el: "Banner που λείπει" }, { en: "A weak or reused password", el: "Αδύναμος ή επαναχρησιμοποιημένος κωδικός" }, { en: "Using ed25519", el: "Η χρήση ed25519" }, { en: "Reading sshd_config", el: "Η ανάγνωση του sshd_config" }], answer: 1, why: { en: "Keys, a long passphrase, and password authentication disabled close that cause.", el: "Κλειδιά, μακριά φράση και κλειστή ταυτοποίηση με κωδικό κλείνουν αυτή την αιτία." } },
  ],
  "share-doc-intro": [
    { q: { en: "What mistake do anonymous FTP, guest SMB and insecure NFS share?", el: "Ποιο λάθος μοιράζονται το anonymous FTP, το guest SMB και το insecure NFS;" }, choices: [{ en: "A server trusts a client without verifying who it is", el: "Ένας server εμπιστεύεται έναν client χωρίς να επαληθεύει την ταυτότητά του" }, { en: "They all listen on port 21", el: "Όλα ακούνε στη θύρα 21" }, { en: "They all encrypt by default", el: "Όλα κρυπτογραφούν από προεπιλογή" }, { en: "They need root to install", el: "Χρειάζονται root για εγκατάσταση" }], answer: 0, why: { en: "Three protocols, one trust decision: no identity is checked.", el: "Τρία πρωτόκολλα, μία απόφαση εμπιστοσύνης: δεν ελέγχεται ταυτότητα." } },
    { q: { en: "Which port is the RPC portmapper that NFS clients query?", el: "Ποια θύρα είναι ο RPC portmapper που ρωτούν οι NFS clients;" }, choices: [{ en: "111", el: "111" }, { en: "2049", el: "2049" }, { en: "445", el: "445" }, { en: "21", el: "21" }], answer: 0, why: { en: "111 locates the NFS and mount daemons; 2049 is NFS itself.", el: "Η 111 εντοπίζει τους δαίμονες NFS και mount, η 2049 είναι το ίδιο το NFS." } },
    { q: { en: "The decisive question about a share is…", el: "Το κρίσιμο ερώτημα για ένα share είναι…" }, choices: [{ en: "What can an unauthenticated client do after connecting?", el: "Τι μπορεί να κάνει ένας client χωρίς ταυτοποίηση μετά τη σύνδεση;" }, { en: "Is the port open?", el: "Είναι ανοιχτή η θύρα;" }, { en: "Which distribution runs it?", el: "Ποια διανομή το τρέχει;" }, { en: "How old is the package?", el: "Πόσο παλιό είναι το πακέτο;" }], answer: 0, why: { en: "Availability is not authorisation.", el: "Η διαθεσιμότητα δεν είναι εξουσιοδότηση." } },
  ],
  "share-ftp": [
    { q: { en: "Which vsftpd directive allows passwordless anonymous login?", el: "Ποια οδηγία vsftpd επιτρέπει anonymous σύνδεση χωρίς κωδικό;" }, choices: [{ en: "anonymous_enable=YES", el: "anonymous_enable=YES" }, { en: "local_enable=YES", el: "local_enable=YES" }, { en: "listen_ipv6=YES", el: "listen_ipv6=YES" }, { en: "write_enable=YES", el: "write_enable=YES" }], answer: 0, why: { en: "One line decides whether the whole enumeration path exists.", el: "Μία γραμμή κρίνει αν υπάρχει ολόκληρη η διαδρομή αναγνώρισης." } },
    { q: { en: "hide_ids=YES is…", el: "Το hide_ids=YES είναι…" }, choices: [{ en: "A privacy setting that masks UID/GID in listings, not an access control", el: "Ρύθμιση ιδιωτικότητας που αποκρύπτει UID/GID στις λίστες και όχι έλεγχος πρόσβασης" }, { en: "A firewall rule", el: "Κανόνας firewall" }, { en: "Encryption for the data channel", el: "Κρυπτογράφηση του καναλιού δεδομένων" }, { en: "A way to disable listing", el: "Τρόπος απενεργοποίησης του listing" }], answer: 0, why: { en: "Everything shows as ftp:ftp, yet listing and download still work.", el: "Όλα εμφανίζονται ως ftp:ftp, όμως το listing και το download δουλεύουν ακόμα." } },
    { q: { en: "The Nmap script that reports anonymous FTP is…", el: "Το Nmap script που αναφέρει anonymous FTP είναι το…" }, choices: [{ en: "ftp-anon", el: "ftp-anon" }, { en: "ssh-auth-methods", el: "ssh-auth-methods" }, { en: "smb-enum-shares", el: "smb-enum-shares" }, { en: "rpc-grind", el: "rpc-grind" }], answer: 0, why: { en: "It prints FTP code 230 and the anonymous root inventory.", el: "Τυπώνει FTP code 230 και την απογραφή της anonymous ρίζας." } },
  ],
  "share-smb": [
    { q: { en: "Which share directive maps unauthenticated clients to guest access?", el: "Ποια οδηγία share αντιστοιχίζει clients χωρίς ταυτοποίηση σε guest πρόσβαση;" }, choices: [{ en: "guest ok = yes", el: "guest ok = yes" }, { en: "browsable = yes", el: "browsable = yes" }, { en: "path = /var/www/", el: "path = /var/www/" }, { en: "available = yes", el: "available = yes" }], answer: 0, why: { en: "public = yes is the legacy spelling of the same intent.", el: "Το public = yes είναι η παλιότερη διατύπωση της ίδιας πρόθεσης." } },
    { q: { en: "You append map to guest = Never to the end of smb.conf, restart Samba, and guest enumeration still works. What is the most likely cause?", el: "Προσθέτεις το map to guest = Never στο τέλος του smb.conf, επανεκκινείς το Samba και η guest απαρίθμηση εξακολουθεί να δουλεύει. Ποια είναι η πιο πιθανή αιτία;" }, choices: [{ en: "The line joined the last stanza in the file instead of [global]", el: "Η γραμμή μπήκε στο τελευταίο stanza του αρχείου αντί για το [global]" }, { en: "Samba has to be restarted twice", el: "Το Samba χρειάζεται επανεκκίνηση δύο φορές" }, { en: "Validating the file cancels pending changes", el: "Η επικύρωση του αρχείου ακυρώνει τις εκκρεμείς αλλαγές" }, { en: "Guest mapping cannot be turned off at all", el: "Η guest αντιστοίχιση δεν απενεργοποιείται καθόλου" }], answer: 0, why: { en: "smb.conf is an INI file: a directive governs the section it sits under, so where it lands matters as much as its value.", el: "Το smb.conf είναι αρχείο INI: μια οδηγία κυβερνά την ενότητα κάτω από την οποία βρίσκεται, οπότε το πού θα καταλήξει είναι εξίσου σημαντικό με την τιμή της." } },
    { q: { en: "To stop unauthenticated mapping you set…", el: "Για να σταματήσεις την αντιστοίχιση χωρίς ταυτοποίηση ορίζεις…" }, choices: [{ en: "map to guest = Never", el: "map to guest = Never" }, { en: "map to guest = Bad User", el: "map to guest = Bad User" }, { en: "browsable = no", el: "browsable = no" }, { en: "read only = yes", el: "read only = yes" }], answer: 0, why: { en: "Together with removing guest ok and public from every share.", el: "Μαζί με την αφαίρεση των guest ok και public από κάθε share." } },
  ],
  "share-nfs": [
    { q: { en: "no_root_squash means…", el: "Το no_root_squash σημαίνει…" }, choices: [{ en: "A remote root keeps root identity on the exported files", el: "Ένας απομακρυσμένος root διατηρεί root ταυτότητα στα εξαγόμενα αρχεία" }, { en: "Root cannot mount the export", el: "Ο root δεν μπορεί να προσαρτήσει την εξαγωγή" }, { en: "The export is read only", el: "Η εξαγωγή είναι μόνο για ανάγνωση" }, { en: "Ports below 1024 are refused", el: "Οι θύρες κάτω από 1024 αρνούνται" }], answer: 0, why: { en: "The default root_squash maps remote root to nobody.", el: "Το προεπιλεγμένο root_squash αντιστοιχίζει τον remote root στο nobody." } },
    { q: { en: "Which command shows the options the kernel will actually enforce?", el: "Ποια εντολή δείχνει τις επιλογές που θα εφαρμόσει πραγματικά ο kernel;" }, choices: [{ en: "exportfs -v", el: "exportfs -v" }, { en: "exportfs -a", el: "exportfs -a" }, { en: "showmount -e", el: "showmount -e" }, { en: "rpcinfo -p", el: "rpcinfo -p" }], answer: 0, why: { en: "exportfs -a reloads silently; -v prints the effective table.", el: "Το exportfs -a επαναφορτώνει σιωπηλά, το -v τυπώνει τον ενεργό πίνακα." } },
    { q: { en: "Why is a firewall rule for port 2049 alone insufficient for NFS?", el: "Γιατί ένας κανόνας firewall μόνο για τη θύρα 2049 δεν αρκεί για το NFS;" }, choices: [{ en: "mountd normally uses dynamic ports unless they are pinned", el: "Το mountd συνήθως χρησιμοποιεί δυναμικές θύρες αν δεν καρφιτσωθούν" }, { en: "NFS uses UDP only", el: "Το NFS χρησιμοποιεί μόνο UDP" }, { en: "rpcbind runs on 2049", el: "Το rpcbind τρέχει στην 2049" }, { en: "NFS needs no firewall", el: "Το NFS δεν χρειάζεται firewall" }], answer: 0, why: { en: "The RPC table shows why: 111, 2049 and the mountd port all matter.", el: "Ο πίνακας RPC δείχνει γιατί: μετρούν η 111, η 2049 και η θύρα mountd." } },
  ],
  "share-harden": [
    { q: { en: "The preferred replacement for anonymous FTP file transfer is…", el: "Η προτιμώμενη αντικατάσταση για anonymous FTP μεταφορά αρχείων είναι…" }, choices: [{ en: "SFTP over SSH", el: "SFTP πάνω από SSH" }, { en: "FTP with hide_ids", el: "FTP με hide_ids" }, { en: "Telnet", el: "Telnet" }, { en: "TFTP", el: "TFTP" }], answer: 0, why: { en: "SFTP gives authentication and encryption by default.", el: "Το SFTP δίνει ταυτοποίηση και κρυπτογράφηση από προεπιλογή." } },
    { q: { en: "min protocol = SMB2 does what?", el: "Τι κάνει το min protocol = SMB2;" }, choices: [{ en: "Prevents fallback to the obsolete SMB1 dialect", el: "Αποτρέπει την επιστροφή στην ξεπερασμένη διάλεκτο SMB1" }, { en: "Enables guest access", el: "Ενεργοποιεί την guest πρόσβαση" }, { en: "Opens port 139", el: "Ανοίγει τη θύρα 139" }, { en: "Disables printing", el: "Απενεργοποιεί τις εκτυπώσεις" }], answer: 0, why: { en: "Modern clients already negotiate SMB2 or SMB3.", el: "Οι σύγχρονοι clients ήδη διαπραγματεύονται SMB2 ή SMB3." } },
    { q: { en: "A quarterly file-share audit should read…", el: "Ένας τριμηνιαίος έλεγχος κοινόχρηστων πρέπει να διαβάζει…" }, choices: [{ en: "/etc/vsftpd.conf, /etc/samba/smb.conf and /etc/exports", el: "/etc/vsftpd.conf, /etc/samba/smb.conf και /etc/exports" }, { en: "/etc/passwd only", el: "Μόνο το /etc/passwd" }, { en: "The web access log", el: "Το access log του web" }, { en: "The package list", el: "Τη λίστα πακέτων" }], answer: 0, why: { en: "One search per file finds every misconfiguration in this path.", el: "Μία αναζήτηση ανά αρχείο βρίσκει κάθε κακορύθμιση αυτής της διαδρομής." } },
  ],
  "ssh-doc-setup": [
    { q: { en: "Clients report connection refused on the SSH port. What do you confirm first?", el: "Οι clients αναφέρουν άρνηση σύνδεσης στη θύρα SSH. Τι επιβεβαιώνεις πρώτα;" }, choices: [{ en: "That the daemon is installed, running and listening", el: "Ότι ο δαίμονας είναι εγκατεστημένος, ενεργός και ακούει" }, { en: "The client software version", el: "Την έκδοση του λογισμικού client" }, { en: "The banner wording", el: "Τη διατύπωση του banner" }, { en: "The uptime of the host", el: "Τον χρόνο λειτουργίας του host" }], answer: 0, why: { en: "A local refusal and a network refusal have different causes.", el: "Μια τοπική άρνηση και μια άρνηση δικτύου έχουν διαφορετικές αιτίες." } },
    { q: { en: "A class image enables remote shell access on every interface by default. The concern is…", el: "Ένα image τάξης ενεργοποιεί την απομακρυσμένη πρόσβαση shell σε κάθε διεπαφή από προεπιλογή. Η ανησυχία είναι…" }, choices: [{ en: "The attack surface widened before anyone decided to expose it", el: "Η επιφάνεια επίθεσης διευρύνθηκε πριν κανείς αποφασίσει να την εκθέσει" }, { en: "Remote shell cannot be attacked", el: "Η απομακρυσμένη πρόσβαση shell δεν δέχεται επίθεση" }, { en: "Only administrative logins matter", el: "Μόνο οι διαχειριστικές συνδέσεις μετρούν" }, { en: "The port number is wrong", el: "Ο αριθμός θύρας είναι λάθος" }], answer: 0, why: { en: "Defaults are decisions made for you; expose deliberately.", el: "Οι προεπιλογές είναι αποφάσεις που πάρθηκαν για εσένα· εξέθεσε συνειδητά." } },
    { q: { en: "What proves a service belongs to your host?", el: "Τι αποδεικνύει ότι μια υπηρεσία ανήκει στον δικό σου host;" }, choices: [{ en: "Host identity plus listening state and the owning process", el: "Η ταυτότητα του host μαζί με την κατάσταση ακρόασης και την ιδιοκτήτρια διεργασία" }, { en: "The banner text", el: "Το κείμενο του banner" }, { en: "The IP address alone", el: "Μόνο η διεύθυνση IP" }, { en: "The uptime", el: "Ο χρόνος λειτουργίας" }], answer: 0, why: { en: "Banners can be set by anyone; the process owner cannot.", el: "Τα banner τα ορίζει ο καθένας· τον ιδιοκτήτη της διεργασίας όχι." } },
  ],
  "ssh-doc-boundary": [
    { q: { en: "A colleague wants to demonstrate password guessing against a production server. Your answer is…", el: "Ένας συνάδελφος θέλει να επιδείξει εικασία κωδικών σε server παραγωγής. Η απάντησή σου είναι…" }, choices: [{ en: "Refuse: testing must be authorised and confined to lab assets", el: "Αρνήσου: ο έλεγχος πρέπει να είναι εξουσιοδοτημένος και περιορισμένος σε lab υποδομές" }, { en: "Agree with a small word list", el: "Συμφώνησε με μικρή λίστα λέξεων" }, { en: "Do it outside working hours", el: "Κάνε το εκτός ωραρίου" }, { en: "Let them run it instead", el: "Άσε τους να το τρέξουν εκείνοι" }], answer: 0, why: { en: "A technique is not a licence; authorisation is.", el: "Μια τεχνική δεν είναι άδεια· η εξουσιοδότηση είναι." } },
    { q: { en: "A lab exercise produced a working credential. You should…", el: "Μια lab άσκηση παρήγαγε ένα λειτουργικό διαπιστευτήριο. Πρέπει να…" }, choices: [{ en: "Report it as a finding and close it", el: "Το αναφέρεις ως εύρημα και να το κλείσεις" }, { en: "Keep it for later labs", el: "Το κρατήσεις για μελλοντικά lab" }, { en: "Share it with the class", el: "Το μοιραστείς με την τάξη" }, { en: "Store it in a public repository", el: "Το αποθηκεύσεις σε δημόσιο αποθετήριο" }], answer: 0, why: { en: "Reusing a finding turns practice into intrusion.", el: "Η επαναχρησιμοποίηση ενός ευρήματος μετατρέπει την εξάσκηση σε εισβολή." } },
    { q: { en: "You find an exposed host outside your authorised range. You should…", el: "Βρίσκεις έναν εκτεθειμένο host εκτός του εξουσιοδοτημένου εύρους σου. Πρέπει να…" }, choices: [{ en: "Stop, document and report through the responsible channel", el: "Σταματήσεις, να τεκμηριώσεις και να αναφέρεις μέσω του αρμόδιου καναλιού" }, { en: "Test it briefly to confirm", el: "Το δοκιμάσεις σύντομα για επιβεβαίωση" }, { en: "Fix it yourself quietly", el: "Το διορθώσεις μόνος σου σιωπηλά" }, { en: "Ignore it entirely", el: "Το αγνοήσεις εντελώς" }], answer: 0, why: { en: "Unauthorised remediation is still unauthorised access.", el: "Η μη εξουσιοδοτημένη αποκατάσταση παραμένει μη εξουσιοδοτημένη πρόσβαση." } },
  ],
  "ssh-doc-audit": [
    { q: { en: "The configuration is hardened but nobody recorded who changed it or when. The gap is…", el: "Η διαμόρφωση είναι σκληρυμένη αλλά κανείς δεν κατέγραψε ποιος την άλλαξε και πότε. Το κενό είναι…" }, choices: [{ en: "Missing change records make verification and rollback unreliable", el: "Η έλλειψη αρχείου αλλαγών κάνει την επαλήθευση και την επαναφορά αναξιόπιστες" }, { en: "Nothing: the file is what matters", el: "Τίποτα: το αρχείο είναι αυτό που μετράει" }, { en: "Records are optional in a lab", el: "Οι καταγραφές είναι προαιρετικές σε lab" }, { en: "The file's modification time is enough", el: "Ο χρόνος τροποποίησης του αρχείου αρκεί" }], answer: 0, why: { en: "Without a change record you cannot answer the next auditor's first question.", el: "Χωρίς αρχείο αλλαγών δεν απαντάς στην πρώτη ερώτηση του επόμενου ελεγκτή." } },
    { q: { en: "What shows a hardening change is genuinely in effect?", el: "Τι δείχνει ότι μια αλλαγή σκλήρυνσης ισχύει πραγματικά;" }, choices: [{ en: "Effective runtime configuration plus a test that the old path fails", el: "Η ενεργή διαμόρφωση κατά την εκτέλεση μαζί με δοκιμή ότι η παλιά διαδρομή αποτυγχάνει" }, { en: "The edited file alone", el: "Μόνο το επεξεργασμένο αρχείο" }, { en: "A screenshot of the editor", el: "Ένα στιγμιότυπο του editor" }, { en: "The package version", el: "Η έκδοση του πακέτου" }], answer: 0, why: { en: "Two independent signals beat one document.", el: "Δύο ανεξάρτητα σήματα υπερισχύουν ενός εγγράφου." } },
    { q: { en: "Two hosts with the same role have different security settings. This is…", el: "Δύο hosts με τον ίδιο ρόλο έχουν διαφορετικές ρυθμίσεις ασφαλείας. Αυτό είναι…" }, choices: [{ en: "Configuration drift against a documented baseline", el: "Απόκλιση διαμόρφωσης από τεκμηριωμένη βάση" }, { en: "Normal variety", el: "Φυσιολογική ποικιλία" }, { en: "Only a production concern", el: "Ανησυχία μόνο της παραγωγής" }, { en: "Proof the newer host is correct", el: "Απόδειξη ότι ο νεότερος host είναι σωστός" }], answer: 0, why: { en: "Drift means at least one host is not what you believe it is.", el: "Η απόκλιση σημαίνει ότι τουλάχιστον ένας host δεν είναι ό,τι νομίζεις." } },
  ],
  "dfi-intro": [
    { q: { en: "Which obligation in the definition has to be satisfied before any tool runs?", el: "Ποια υποχρέωση του ορισμού πρέπει να ικανοποιηθεί πριν τρέξει οποιοδήποτε εργαλείο;" }, choices: [{ en: "Lawful search authority", el: "Νόμιμη εξουσιοδότηση αναζήτησης" }, { en: "Reporting the results", el: "Η αναφορά των αποτελεσμάτων" }, { en: "Expert testimony", el: "Η κατάθεση ως εμπειρογνώμονας" }, { en: "Use of approved tools", el: "Η χρήση εγκεκριμένων εργαλείων" }], answer: 0, why: { en: "Evidence gathered without authority may be inadmissible however decisive it looks.", el: "Στοιχείο που συλλέχθηκε χωρίς εξουσιοδότηση μπορεί να κριθεί απαραδέκτο όσο αποφασιστικό και αν φαίνεται." } },
    { q: { en: "Why do artifacts exist in the first place?", el: "Γιατί υπάρχουν καν τα τεκμήρια;" }, choices: [{ en: "Because systems need that data to function correctly", el: "Επειδή τα συστήματα χρειάζονται αυτά τα δεδομένα για να λειτουργούν σωστά" }, { en: "Because operating systems are designed to help investigators", el: "Επειδή τα λειτουργικά συστήματα είναι σχεδιασμένα να βοηθούν τους ερευνητές" }, { en: "Because logging is required by law", el: "Επειδή η καταγραφή απαιτείται από τον νόμο" }, { en: "Because users ask to be recorded", el: "Επειδή οι χρήστες ζητούν να καταγράφονται" }], answer: 0, why: { en: "The data is a by-product of usefulness, not a gift to examiners.", el: "Τα δεδομένα είναι υποπροϊόν της χρησιμότητας, όχι δώρο προς τους ερευνητές." } },
    { q: { en: "In the BTK case, what ended thirty years of concealment?", el: "Στην υπόθεση BTK, τι τερμάτισε τριάντα χρόνια απόκρυψης;" }, choices: [{ en: "Provenance metadata on a document sent on a floppy disk", el: "Μεταδεδομένα προέλευσης σε έγγραφο που στάλθηκε σε δισκέτα" }, { en: "A witness who finally spoke", el: "Ένας μάρτυρας που μίλησε τελικά" }, { en: "A confession obtained before any technical work", el: "Ομολογία που ελήφθη πριν από οποιαδήποτε τεχνική εργασία" }, { en: "A traffic capture from the church network", el: "Καταγραφή κίνησης από το δίκτυο της εκκλησίας" }], answer: 0, why: { en: "One small artifact tied the disk to a named user at a named organisation.", el: "Ένα μικρό τεκμήριο έδεσε τη δισκέτα με κατονομαζόμενο χρήστη σε κατονομαζόμενο οργανισμό." } },
  ],
  "dfi-navigate": [
    { q: { en: "How does a tree search differ from listing a directory?", el: "Πώς διαφέρει η αναζήτηση σε δέντρο από την παράθεση καταλόγου;" }, choices: [{ en: "Listing reports one directory; the search walks the whole tree beneath a starting point", el: "Η παράθεση αναφέρει έναν κατάλογο· η αναζήτηση διασχίζει ολόκληρο το δέντρο κάτω από ένα σημείο εκκίνησης" }, { en: "They are the same with different output formats", el: "Είναι το ίδιο με διαφορετικές μορφές εξόδου" }, { en: "The search only works on the current directory", el: "Η αναζήτηση δουλεύει μόνο στον τρέχοντα κατάλογο" }, { en: "Listing follows the tree recursively by default", el: "Η παράθεση ακολουθεί το δέντρο αναδρομικά από προεπιλογή" }], answer: 0, why: { en: "The two answer different questions, which is why both belong in a working set.", el: "Οι δύο απαντούν σε διαφορετικά ερωτήματα, γι' αυτό και οι δύο ανήκουν σε ένα εργαλείο εργασίας." } },
    { q: { en: "Why do line numbers matter when you filter a log?", el: "Γιατί έχουν σημασία οι αριθμοί γραμμής όταν φιλτράρεις αρχείο καταγραφής;" }, choices: [{ en: "They let you return to the original context and cite it accurately", el: "Σου επιτρέπουν να γυρίσεις στο αρχικό πλαίσιο και να το παραθέσεις με ακρίβεια" }, { en: "They make the output sort correctly", el: "Κάνουν την έξοδο να ταξινομείται σωστά" }, { en: "They shorten the output", el: "Μικραίνουν την έξοδο" }, { en: "They replace the need for timestamps", el: "Αντικαθιστούν την ανάγκη για χρονοσημάνσεις" }], answer: 0, why: { en: "A line number turns a finding into a citation someone else can verify.", el: "Ο αριθμός γραμμής μετατρέπει ένα εύρημα σε παραπομπή που κάποιος άλλος μπορεί να επαληθεύσει." } },
    { q: { en: "What does a tree search reveal that a plain listing does not?", el: "Τι αποκαλύπτει η αναζήτηση σε δέντρο που η απλή παράθεση δεν αποκαλύπτει;" }, choices: [{ en: "Dot-prefixed entries, which listing omits by convention", el: "Εγγραφές με αρχική τελεία, που η παράθεση παραλείπει κατά σύμβαση" }, { en: "Files that listing deletes", el: "Αρχεία που η παράθεση διαγράφει" }, { en: "Only directories with write permission", el: "Μόνο καταλόγους με δικαίωμα εγγραφής" }, { en: "Nothing: both show the same entries", el: "Τίποτα: και οι δύο δείχνουν τις ίδιες εγγραφές" }], answer: 0, why: { en: "The interesting material frequently sits where listing conventions quietly omit.", el: "Το ενδιαφέρον υλικό συχνά βρίσκεται εκεί που οι συμβάσεις παράθεσης παραλείπουν σιωπηλά." } },
  ],
  "dfi-content": [
    { q: { en: "What does a type identification command base its answer on?", el: "Σε τι βασίζει την απάντησή της μια εντολή ταυτοποίησης τύπου;" }, choices: [{ en: "The leading bytes of the file, ignoring the filename", el: "Τα πρώτα byte του αρχείου, αγνοώντας το όνομα" }, { en: "The file extension", el: "Την επέκταση του αρχείου" }, { en: "The directory it was found in", el: "Τον κατάλογο όπου βρέθηκε" }, { en: "The owner recorded on disk", el: "Τον ιδιοκτήτη που καταγράφεται στον δίσκο" }], answer: 0, why: { en: "An extension is a claim by whoever named the file; the bytes are the fact.", el: "Η επέκταση είναι ισχυρισμός αυτού που ονόμασε το αρχείο· τα byte είναι το γεγονός." } },
    { q: { en: "What is the main limitation of extracting readable strings from a binary?", el: "Ποιος είναι ο κύριος περιορισμός της εξαγωγής αναγνώσιμων συμβολοσειρών από ένα δυαδικό αρχείο;" }, choices: [{ en: "It returns anything printable, so a candidate must be corroborated before it is treated as a finding", el: "Επιστρέφει οτιδήποτε εκτυπώσιμο, οπότε κάθε υποψήφια πρέπει να επιβεβαιωθεί πριν θεωρηθεί εύρημα" }, { en: "It only works on text files", el: "Δουλεύει μόνο σε αρχεία κειμένου" }, { en: "It alters the file it reads", el: "Αλλοιώνει το αρχείο που διαβάζει" }, { en: "It cannot read executables", el: "Δεν μπορεί να διαβάσει εκτελέσιμα" }], answer: 0, why: { en: "A string is a lead, never a conclusion.", el: "Μια συμβολοσειρά είναι ένδειξη, ποτέ συμπέρασμα." } },
    { q: { en: "Why is an extension unreliable evidence of file type?", el: "Γιατί η επέκταση είναι αναξιόπιστο στοιχείο για τον τύπο αρχείου;" }, choices: [{ en: "It is a label applied by whoever named the file, and renaming costs nothing", el: "Είναι ετικέτα που έβαλε όποιος ονόμασε το αρχείο, και η μετονομασία δεν κοστίζει τίποτα" }, { en: "Extensions are limited to three characters", el: "Οι επεκτάσεις περιορίζονται σε τρεις χαρακτήρες" }, { en: "Operating systems ignore extensions entirely", el: "Τα λειτουργικά συστήματα αγνοούν εντελώς τις επεκτάσεις" }, { en: "Extensions change automatically when content changes", el: "Οι επεκτάσεις αλλάζουν αυτόματα όταν αλλάζει το περιεχόμενο" }], answer: 0, why: { en: "A renamed program is still a program, and users judge by icon and name.", el: "Ένα μετονομασμένο πρόγραμμα παραμένει πρόγραμμα, και οι χρήστες κρίνουν από εικονίδιο και όνομα." } },
  ],
  "dfi-integrity": [
    { q: { en: "When should a hash be computed?", el: "Πότε πρέπει να υπολογίζεται ένα hash;" }, choices: [{ en: "At acquisition, so every later examiner can verify the copy independently", el: "Κατά την απόκτηση, ώστε κάθε μελλοντικός ερευνητής να μπορεί να επαληθεύσει ανεξάρτητα το αντίγραφο" }, { en: "At the end of the examination, to summarise the work", el: "Στο τέλος της εξέτασης, για να συνοψίσει τη δουλειά" }, { en: "Only if the file is challenged in court", el: "Μόνο αν το αρχείο αμφισβητηθεί στο δικαστήριο" }, { en: "Only for large disk images", el: "Μόνο για μεγάλα είδωλα δίσκων" }], answer: 0, why: { en: "Hashing only at the end proves something about your copy and nothing about its history.", el: "Το hashing μόνο στο τέλος αποδεικνύει κάτι για το δικό σου αντίγραφο και τίποτα για την ιστορία του." } },
    { q: { en: "Can you recover a file from its hash?", el: "Μπορείς να ανακτήσεις ένα αρχείο από το hash του;" }, choices: [{ en: "No: hashing is one-way, which is exactly why it works as identity", el: "Όχι: το hashing είναι μονοκατευθυντικό, που είναι ακριβώς γιατί λειτουργεί ως ταυτότητα" }, { en: "Yes, by running the same algorithm in reverse", el: "Ναι, τρέχοντας τον ίδιο αλγόριθμο ανάστροφα" }, { en: "Yes, if you know the file size", el: "Ναι, αν γνωρίζεις το μέγεθος του αρχείου" }, { en: "Yes, for short files only", el: "Ναι, μόνο για σύντομα αρχεία" }], answer: 0, why: { en: "You can prove something about a file without revealing its contents.", el: "Μπορείς να αποδείξεις κάτι για ένα αρχείο χωρίς να αποκαλύψεις τα περιεχόμενά του." } },
    { q: { en: "What is the accurate statement about the two weakest digests in common forensic use?", el: "Ποια είναι η ακριβής διατύπωση για τις δύο ασθενέστερες συναρτήσεις που χρησιμοποιούνται συνήθως στην ερευνητική εργασία;" }, choices: [{ en: "They are broken for resisting a deliberate attacker but remain useful for identification and matching known sets", el: "Είναι σπασμένες ως προς την αντίσταση σε σκόπιμο επιτιθέμενο αλλά παραμένουν χρήσιμες για ταυτοποίηση και αντιστοίχιση με γνωστά σύνολα" }, { en: "They are cryptographically strong and preferred everywhere", el: "Είναι κρυπτογραφικά ισχυρές και προτιμώνται παντού" }, { en: "They cannot detect any change to a file", el: "Δεν μπορούν να ανιχνεύσουν καμία αλλαγή σε ένα αρχείο" }, { en: "They produce identical output for the same input", el: "Παράγουν πανομοιότυπη έξοδο για την ίδια είσοδο" }], answer: 0, why: { en: "Collisions have been demonstrated for both, so a finding that depends on them must say so.", el: "Έχουν επιδειχθεί συγκρούσεις και για τις δύο, οπότε ένα εύρημα που εξαρτάται από αυτές πρέπει να το λέει." } },
  ],
  "dfi-live": [
    { q: { en: "Why is live connection state a triage priority?", el: "Γιατί η ζωντανή κατάσταση συνδέσεων είναι προτεραιότητα διαλογής;" }, choices: [{ en: "It disappears the moment the machine is powered off", el: "Εξαφανίζεται τη στιγμή που σβήσει το μηχάνημα" }, { en: "It is the only evidence that survives reboot", el: "Είναι το μόνο στοιχείο που επιβιώνει της επανεκκίνησης" }, { en: "It is easier to collect than disk images", el: "Είναι ευκολότερη στη συλλογή από τα είδωλα δίσκων" }, { en: "It requires no tooling", el: "Δεν απαιτεί εργαλεία" }], answer: 0, why: { en: "A report must also say when it was captured, because the state itself cannot.", el: "Μια αναφορά πρέπει επίσης να λέει πότε καταγράφηκε, γιατί η ίδια η κατάσταση δεν μπορεί." } },
    { q: { en: "What does the first question an examiner asks about a live machine look like?", el: "Πώς μοιάζει το πρώτο ερώτημα που θέτει ένας ερευνητής για ένα ζωντανό μηχάνημα;" }, choices: [{ en: "What is running now, and started by what", el: "Τι εκτελείται τώρα, και από τι ξεκίνησε" }, { en: "What was installed last year", el: "Τι εγκαταστάθηκε πέρυσι" }, { en: "Which distribution is running", el: "Ποια διανομή εκτελείται" }, { en: "How much free disk space remains", el: "Πόσος ελεύθερος χώρος δίσκου απομένει" }], answer: 0, why: { en: "A malicious program has to execute to do anything at all.", el: "Ένα κακόβουλο πρόγραμμα πρέπει να εκτελεστεί για να κάνει οτιδήποτε." } },
    { q: { en: "Why must a repair happen on a copy rather than on the original?", el: "Γιατί η επιδιόρθωση πρέπει να γίνει σε αντίγραφο και όχι στο πρωτότυπο;" }, choices: [{ en: "Repairing in place converts a document into the examiner's own reconstruction", el: "Η επιδιόρθωση επί τόπου μετατρέπει ένα έγγραφο σε ανακατασκευή του ίδιου του ερευνητή" }, { en: "Copies are faster to edit", el: "Τα αντίγραφα είναι πιο γρήγορα στην επεξεργασία" }, { en: "The original cannot be opened for reading", el: "Το πρωτότυπο δεν μπορεί να ανοίξει για ανάγνωση" }, { en: "Editing tools refuse to open originals", el: "Τα εργαλεία επεξεργασίας αρνούνται να ανοίξουν πρωτότυπα" }], answer: 0, why: { en: "The original stays evidence; the copy is where the work happens, and the change is recorded.", el: "Το πρωτότυπο μένει τεκμήριο· στο αντίγραφο γίνεται η δουλειά, και η αλλαγή καταγράφεται." } },
  ],
};
