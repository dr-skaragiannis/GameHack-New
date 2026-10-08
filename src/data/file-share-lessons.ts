import type { Bi, Challenge, CheckCtx, Module, Section, Task } from "./lessons";
import { usedCmd } from "../lib/terminal";

const lab = "lab" as const;
const bi = (en: string, el: string): Bi => ({ en, el });
const shot = (cmd: string, lines: string[]) => ({ cmd, lines });
const section = (heading: Bi, body: Bi, shots?: Section["shots"], tip?: Bi): Section => ({
  heading,
  body,
  ...(shots ? { shots } : {}),
  ...(tip ? { tip } : {}),
});
const task = (id: string, instruction: Bi, hint: Bi, explain: Bi, check: (term: CheckCtx) => boolean): Task => ({
  id,
  instruction,
  hint,
  explain,
  check,
});
const pair = (first: Challenge, second: Challenge): [Challenge, Challenge] => [first, second];

const scope = bi(
  `Run these checks only against systems you own or for which you hold written authorisation. Everything in this path stays inside the GameHack sandbox: the target is the fictional host ubuntu-lab at 192.168.1.9, and no command opens a socket on your own machine.`,
  `Εκτέλεσε αυτούς τους ελέγχους μόνο σε συστήματα που σου ανήκουν ή για τα οποία έχεις γραπτή άδεια. Όλα σε αυτή τη διαδρομή μένουν μέσα στο sandbox του GameHack: ο στόχος είναι ο φανταστικός host ubuntu-lab στη διεύθυνση 192.168.1.9 και καμία εντολή δεν ανοίγει socket στον δικό σου υπολογιστή.`,
);

export const FILE_SHARE_MODULES: Module[] = [
  {
    id: "share-doc-intro",
    order: 1,
    icon: "book",
    color: "from-amber-300 to-orange-800",
    difficulty: 2,
    scenario: lab,
    title: bi("Why anonymous file shares matter", "Γιατί έχουν σημασία τα ανώνυμα κοινόχρηστα"),
    subtitle: bi("Three protocols, one mistake, and the lab that shows it", "Τρία πρωτόκολλα, ένα λάθος, και το εργαστήριο που το δείχνει"),
    badge: bi("Share Analyst", "Αναλυτής κοινόχρηστων"),
    theory: [
      section(
        bi("Three protocols, one mistake", "Τρία πρωτόκολλα, ένα λάθος"),
        bi(
          `${scope.en}

FTP, SMB and NFS carry the back office of almost every organisation: FTP for legacy data drops, SMB for Windows-compatible file servers, NFS for Unix-to-Unix exports. Each of them also ships with an anonymous or guest mode, and administrators routinely switch one on for convenience and never lock it down again. The three protocols expose data in three different ways, yet the underlying mistake is identical: a server trusts a network client without verifying who that client is. FTP exposes an anonymous root directory through the unprivileged ftp account. SMB exposes shares marked as guest-accessible. NFS exposes exported paths while trusting the UID that the client claims.`,
          `${scope.el}

Τα FTP, SMB και NFS κουβαλούν το back office σχεδόν κάθε οργανισμού: το FTP για παλιές εναποθέσεις δεδομένων, το SMB για file servers συμβατούς με Windows και το NFS για εξαγωγές μεταξύ Unix. Το καθένα κυκλοφορεί επίσης με μια anonymous ή guest λειτουργία, και οι διαχειριστές συνηθίζουν να την ενεργοποιούν για ευκολία και να μην την κλειδώνουν ποτέ ξανά. Τα τρία πρωτόκολλα εκθέτουν δεδομένα με τρεις διαφορετικούς τρόπους, όμως το βασικό σφάλμα είναι ίδιο: ένας server εμπιστεύεται έναν network client χωρίς να επαληθεύει την ταυτότητά του. Το FTP εκθέτει έναν anonymous root κατάλογο μέσω του μη προνομιούχου λογαριασμού ftp. Το SMB εκθέτει shares που χαρακτηρίζονται guest-accessible. Το NFS εκθέτει exported διαδρομές ενώ εμπιστεύεται το UID που δηλώνει ο client.`,
        ),
        [
          shot("ping -c 2 192.168.1.9", [
            "PING ubuntu-lab (192.168.1.9): 56(84) bytes of data.",
            "64 bytes from 192.168.1.9: icmp_seq=1 ttl=64 time=0.4 ms",
            "2 packets transmitted, 2 received, 0% packet loss",
          ]),
        ],
      ),
      section(
        bi("Enumeration belongs early, and the evidence is cheap", "Η αναγνώριση ανήκει νωρίς και τα στοιχεία είναι φθηνά"),
        bi(
          `The operational consequence is that file-share enumeration belongs at the beginning of internal testing, before password guessing, before exploitation and before post-exploitation. The operator asks a simple question first: does any machine here simply give files away? The commands are fast, the evidence is unambiguous, and the files that come back often contain the credentials or configuration detail needed for the next phase. One world-readable backup or deployment script can shorten an engagement more than a long brute-force run.

Unauthenticated access can expose source code, backup archives, configuration files, credentials and personal data, and no perimeter control recovers any of it after the fact. That is why every section of this path pairs the technique with the server-side setting responsible for it, so the same material can be read from the other side of the fight.`,
          `Η επιχειρησιακή συνέπεια είναι ότι η αναγνώριση κοινόχρηστων ανήκει στην αρχή ενός εσωτερικού ελέγχου, πριν από τις μαντεψιές κωδικών, πριν από την εκμετάλλευση και πριν από το post-exploitation. Ο ελεγκτής θέτει πρώτα ένα απλό ερώτημα: υπάρχει εδώ μηχάνημα που απλώς μοιράζει αρχεία; Οι εντολές είναι γρήγορες, τα στοιχεία είναι σαφή και τα αρχεία που επιστρέφουν συχνά περιέχουν τα διαπιστευτήρια ή τις λεπτομέρειες ρύθμισης που χρειάζονται για την επόμενη φάση. Ένα μόνο world-readable αντίγραφο ασφαλείας ή deployment script μπορεί να συντομεύσει έναν έλεγχο περισσότερο από μια πολύωρη επίθεση brute-force.

Η πρόσβαση χωρίς ταυτοποίηση μπορεί να εκθέσει πηγαίο κώδικα, αρχεία αντιγράφων ασφαλείας, αρχεία ρυθμίσεων, διαπιστευτήρια και προσωπικά δεδομένα, και κανένας έλεγχος περιμέτρου δεν τα ανακτά εκ των υστέρων. Γι’ αυτό κάθε ενότητα αυτής της διαδρομής ζευγαρώνει την τεχνική με τη ρύθμιση του server που την προκαλεί, ώστε το ίδιο υλικό να διαβάζεται και από την άλλη πλευρά της μάχης.`,
        ),
      ),
      section(
        bi("Availability is not authorisation", "Η διαθεσιμότητα δεν είναι εξουσιοδότηση"),
        bi(
          `It helps to separate two ideas. A share may be intentionally available and still require authentication; that is normal and it is not a finding. The vulnerability is never the existence of FTP, SMB or NFS. It is that an anonymous or guest identity can browse or retrieve data that was meant for authenticated users. So the decisive question is not "is the port open?" but "what can an unauthenticated client do after connecting?"

Unauthenticated enumeration, guest-share access, file retrieval, NFS mounting and privilege testing are aggressive, clearly detectable behaviours on a production network, and performing them without permission is a criminal offence in most jurisdictions. A purpose-built virtual lab is the right place to practise, and in this platform it is the only place: every service you configure and every share you enumerate is simulated.`,
          `Χωρίζει δύο έννοιες. Ένα share μπορεί σκόπιμα να είναι διαθέσιμο και ταυτόχρονα να απαιτεί ταυτοποίηση, αυτό είναι φυσιολογικό και δεν αποτελεί εύρημα. Η ευπάθεια δεν είναι ποτέ η ύπαρξη FTP, SMB ή NFS. Είναι το ότι μια anonymous ή guest ταυτότητα μπορεί να περιηγηθεί ή να ανακτήσει δεδομένα που προορίζονταν για ταυτοποιημένους χρήστες. Έτσι το κρίσιμο ερώτημα δεν είναι «είναι ανοιχτή η θύρα;» αλλά «τι μπορεί να κάνει ένας client χωρίς ταυτοποίηση μετά τη σύνδεση;»

Η αναγνώριση χωρίς ταυτοποίηση, η πρόσβαση σε guest share, η ανάκτηση αρχείων, η προσάρτηση NFS και οι δοκιμές κλιμάκωσης δικαιωμάτων είναι επιθετικές και σαφώς ανιχνεύσιμες συμπεριφορές σε δίκτυο παραγωγής, και η εκτέλεσή τους χωρίς άδεια αποτελεί ποινικό αδίκημα στις περισσότερες έννομες τάξεις. Ένα ειδικά φτιαγμένο εικονικό εργαστήριο είναι το σωστό μέρος για εξάσκηση και σε αυτή την πλατφόρμα είναι το μόνο μέρος: κάθε υπηρεσία που ρυθμίζεις και κάθε share που απαριθμείς είναι προσομοίωση.`,
        ),
      ),
      section(
        bi("The lab: two roles, one isolated segment", "Το εργαστήριο: δύο ρόλοι, ένα απομονωμένο τμήμα"),
        bi(
          `The source walkthrough uses two virtual machines on an isolated host-only segment: the target ubuntu-lab at 192.168.1.9 running vsftpd, Samba and the NFS kernel server, and an attacker at 192.168.1.17 with nmap, an FTP client, smbclient, NetExec and the NFS utilities. There is no route to the internet from that segment, and a snapshot is taken before and after the attack phase because the lab deliberately weakens defaults.

In GameHack you play both roles from one sandbox terminal. You configure the service as the administrator of ubuntu-lab, then you enumerate it as the tester, and both sets of output come from the same simulated filesystem. A sub-millisecond round-trip time is the usual signature of two machines on the same host; if the ping below fails on a real lab, fix virtual networking before anything else, because an unreachable target makes every later error misleading.`,
          `Η αρχική παρουσίαση χρησιμοποιεί δύο εικονικά μηχανήματα σε απομονωμένο host-only τμήμα: τον στόχο ubuntu-lab στη διεύθυνση 192.168.1.9 με vsftpd, Samba και NFS kernel server, και έναν επιτιθέμενο στη 192.168.1.17 με nmap, FTP client, smbclient, NetExec και τα εργαλεία NFS. Δεν υπάρχει διαδρομή προς το διαδίκτυο από αυτό το τμήμα και λαμβάνεται στιγμιότυπο πριν και μετά τη φάση επίθεσης, επειδή το εργαστήριο αποδυναμώνει σκόπιμα τις προεπιλογές.

Στο GameHack παίζεις και τους δύο ρόλους από ένα τερματικό sandbox. Ρυθμίζεις την υπηρεσία ως διαχειριστής του ubuntu-lab, μετά την απαριθμείς ως ελεγκτής, και οι δύο σύνολα εξόδου προέρχονται από το ίδιο εικονικό σύστημα αρχείων. Ο χρόνος απόκρισης κάτω από ένα χιλιοστό του δευτερολέπτου είναι η συνηθισμένη υπογραφή δύο μηχανημάτων στον ίδιο host, αν το παρακάτω ping αποτύχει σε πραγματικό εργαστήριο, διόρθωσε πρώτα την εικονική δικτύωση, επειδή ένας απρόσιτος στόχος κάνει κάθε μεταγενέστερο σφάλμα παραπλανητικό.`,
        ),
        [
          shot("apt update", ["Reading package lists... Done", "Building dependency tree... Done", "All packages are up to date."]),
        ],
        bi(
          `Prompts in the source transcripts carry meaning: a hash means the shell runs as root and a dollar sign means an ordinary user. The prompt root@ubuntu-lab is the target during lab construction, and root@kali is the tester during enumeration. Output there is representative rather than byte-identical, so read its structure, not its timestamps.`,
          `Τα prompts στα αρχικά transcripts έχουν νόημα: το σύμβολο δίεση σημαίνει ότι το shell τρέχει ως root και το δολάριο ότι τρέχει ως απλός χρήστης. Το prompt root@ubuntu-lab είναι ο στόχος κατά την κατασκευή του εργαστηρίου και το root@kali είναι ο ελεγκτής κατά την αναγνώριση. Η έξοδος εκεί είναι αντιπροσωπευτική και όχι πανομοιότυπη κατά byte, οπότε διάβασε τη δομή της και όχι τις χρονοσημάνσεις.`,
        ),
      ),
    ],
    cheats: [
      { cmd: "ping -c 2 192.168.1.9", desc: bi("prove the network path first", "απόδειξε πρώτα τη διαδρομή δικτύου") },
      { cmd: "apt update", desc: bi("refresh the simulated package catalogue", "ανανέωση του εικονικού καταλόγου πακέτων") },
      { cmd: "nmap -sV -p 21,111,139,445,2049 192.168.1.9", desc: bi("all five file-sharing ports in one pass", "και οι πέντε θύρες κοινόχρηστων σε μία σάρωση") },
      { cmd: "ss -tlnp", desc: bi("which local listeners are up", "ποιες τοπικές υποδοχές ακρόασης είναι ενεργές") },
    ],
    tasks: [
      task(
        "verify-the-path",
        bi(
          "Confirm that the simulated target answers before you test any service, then refresh the package catalogue.",
          "Επιβεβαίωσε ότι ο εικονικός στόχος απαντά πριν ελέγξεις οποιαδήποτε υπηρεσία και μετά ανανέωσε τον κατάλογο πακέτων.",
        ),
        bi("ping -c 2 192.168.1.9\napt update", "ping -c 2 192.168.1.9\napt update"),
        bi(
          "Why: An unreachable target makes every service-specific error misleading, so connectivity is proved first. How: the simulated ping answers from the lab host table and apt update refreshes the fictional catalogue. Nothing leaves the sandbox.",
          "Γιατί: Ένας απρόσιτος στόχος κάνει κάθε σφάλμα υπηρεσίας παραπλανητικό, οπότε η συνδεσιμότητα αποδεικνύεται πρώτη. Πώς: το εικονικό ping απαντά από τον πίνακα host του εργαστηρίου και το apt update ανανεώνει τον φανταστικό κατάλογο. Τίποτα δεν φεύγει από το sandbox.",
        ),
        (term) => term.flags.has("ping") && term.flags.has("apt"),
      ),
      task(
        "map-the-exposure",
        bi(
          "Scan the five file-sharing ports of the target in one pass and name the process family behind each.",
          "Σάρωσε τις πέντε θύρες κοινόχρηστων του στόχου σε μία περασιά και ονόμασε την οικογένεια διεργασιών πίσω από καθεμία.",
        ),
        bi("nmap -sV -p 21,111,139,445,2049 192.168.1.9", "nmap -sV -p 21,111,139,445,2049 192.168.1.9"),
        bi(
          "Why: Port 21 is FTP, 139 and 445 are SMB, 2049 is NFS, and 111 is the RPC portmapper that clients query to locate the NFS and mount daemons; leaving 111 out of the check hides the service that explains the others. How: the simulated scan reports state and version per port from the lab host record.",
          "Γιατί: Η θύρα 21 είναι FTP, οι 139 και 445 είναι SMB, η 2049 είναι NFS και η 111 είναι ο RPC portmapper τον οποίο ρωτούν οι clients για να βρουν τους δαίμονες NFS και mount, αν αφήσεις την 111 έξω από τον έλεγχο κρύβεις την υπηρεσία που εξηγεί τις υπόλοιπες. Πώς: η εικονική σάρωση αναφέρει κατάσταση και έκδοση ανά θύρα από την εγγραφή host του εργαστηρίου.",
        ),
        (term) => term.flags.has("nmap-share-ports") && term.flags.has("nmap-sv"),
      ),
    ],
    challenges: pair(
      {
        title: bi("Ask the right question", "Κάνε τη σωστή ερώτηση"),
        brief: bi(
          "An open port is only the beginning. Scan the five file-sharing ports, then decide what an unauthenticated client could do next.",
          "Μια ανοιχτή θύρα είναι μόνο η αρχή. Σάρωσε τις πέντε θύρες κοινόχρηστων και μετά αποφάσισε τι θα μπορούσε να κάνει ένας client χωρίς ταυτοποίηση.",
        ),
        success: bi("You have the port inventory and the question that follows it.", "Έχεις την απογραφή θυρών και την ερώτηση που ακολουθεί."),
        check: (term) => term.flags.has("nmap-share-ports"),
      },
      {
        title: bi("Know where you are", "Ξέρε πού βρίσκεσαι"),
        brief: bi("Before you touch a share, establish your own position: whoami names the account whose privileges every later mistake will carry, pwd names the directory you are standing in, and hostname names the machine that is.", "Πριν αγγίξεις ένα share, καθιέρωσε την ίδια σου τη θέση: το whoami κατονομάζει τον λογαριασμό του οποίου τα δικαιώματα θα κουβαλά κάθε μεταγενέστερο λάθος, το pwd τον κατάλογο όπου στέκεσαι, και το hostname το μηχάνημα στο οποίο βρίσκονται."),
        success: bi("You are the ordinary operator inside the sandbox, not root on a production host.", "Είσαι ο απλός χρήστης μέσα στο sandbox και όχι root σε host παραγωγής."),
        check: (term) => term.flags.has("whoami") && term.flags.has("pwd"),
      },
    ),
  },
  {
    id: "share-ftp",
    order: 2,
    icon: "folder",
    color: "from-sky-300 to-blue-900",
    difficulty: 3,
    scenario: lab,
    title: bi("Anonymous FTP with vsftpd", "Anonymous FTP με vsftpd"),
    subtitle: bi("Configure the exposure, then prove it and close it", "Ρύθμισε την έκθεση, μετά απόδειξέ την και κλείσε την"),
    badge: bi("FTP Auditor", "Ελεγκτής FTP"),
    theory: [
      section(
        bi("vsftpd: small footprint, conservative defaults", "vsftpd: μικρό αποτύπωμα, συντηρητικές προεπιλογές"),
        bi(
          `vsftpd, the Very Secure FTP Daemon, is the default FTP server on many Debian-derived systems. Out of the box it listens on TCP port 21, accepts local-user logins and disables anonymous access. The lab reverses that last default and configures a passive anonymous share that any network neighbour can read. Install it with apt install vsftpd; the single-package footprint and the few dependencies are exactly why teams reach for it.

That simplicity is also why configuration review matters. There is not much to audit, so an auditor should actually audit all of it. In this sandbox the package is recorded in the simulated package list and nothing is downloaded.`,
          `Το vsftpd, ο Very Secure FTP Daemon, είναι ο προεπιλεγμένος FTP server σε πολλά Debian-derived συστήματα. Από προεπιλογή ακούει στην TCP θύρα 21, δέχεται συνδέσεις τοπικών χρηστών και απενεργοποιεί την anonymous πρόσβαση. Το εργαστήριο αντιστρέφει αυτή την τελευταία προεπιλογή και ρυθμίζει ένα passive anonymous share που μπορεί να διαβαστεί από οποιονδήποτε γείτονα του δικτύου. Το εγκαθιστάς με apt install vsftpd, το αποτύπωμα ενός πακέτου και οι λίγες εξαρτήσεις είναι ακριβώς ο λόγος που οι ομάδες το επιλέγουν.

Η απλότητα αυτή είναι και ο λόγος που η ανασκόπηση ρυθμίσεων έχει σημασία. Δεν υπάρχουν πολλά να ελέγξεις, οπότε ο ελεγκτής πρέπει πραγματικά να τα ελέγξει όλα. Σε αυτό το sandbox το πακέτο καταγράφεται στην εικονική λίστα πακέτων και δεν κατεβαίνει τίποτα.`,
        ),
      ),
      section(
        bi("Read the defaults before changing them", "Διάβασε τις προεπιλογές πριν τις αλλάξεις"),
        bi(
          `The server configuration lives in /etc/vsftpd.conf. Before changing anything, inspect the directives that control the listeners and anonymous access. The important line is the anonymous default: with anonymous access disabled, none of the enumeration that follows would work. The listener settings decide whether the daemon listens on IPv4, IPv6 or both; the packaged Ubuntu default uses the IPv6 listener while still accepting IPv4 connections through the dual-stack socket.

Record the before state now, because the hardening module reverses this lab change by restoring a restrictive value. A commented directive is a default and not a decision, which is why the line begins with a hash.`,
          `Η ρύθμιση του server βρίσκεται στο /etc/vsftpd.conf. Πριν αλλάξεις οτιδήποτε, εξέτασε τις οδηγίες που ελέγχουν τους listeners και την anonymous πρόσβαση. Η σημαντική γραμμή είναι η προεπιλογή anonymous: με απενεργοποιημένη την anonymous πρόσβαση, κανένα από τα βήματα αναγνώρισης που ακολουθούν δεν θα λειτουργούσε. Οι ρυθμίσεις listener καθορίζουν αν ο δαίμονας ακούει σε IPv4, IPv6 ή και στα δύο, η πακεταρισμένη προεπιλογή του Ubuntu χρησιμοποιεί τον IPv6 listener ενώ εξακολουθεί να δέχεται IPv4 συνδέσεις μέσω dual-stack socket.

Κατάγραψε τώρα την κατάσταση πριν, επειδή το κεφάλαιο σκλήρυνσης αναιρεί αυτή την αλλαγή επαναφέροντας μια περιοριστική τιμή. Μια σχολιασμένη οδηγία είναι προεπιλογή και όχι απόφαση, γι’ αυτό η γραμμή ξεκινά με δίεση.`,
        ),
        [
          shot("grep -nE '^(#)?(listen|listen_ipv6|anonymous_enable|local_enable)=' /etc/vsftpd.conf", [
            "2:listen=NO",
            "3:listen_ipv6=YES",
            "4:#anonymous_enable=NO",
            "5:local_enable=YES",
          ]),
        ],
      ),
      section(
        bi("Turning anonymous access on", "Ενεργοποίηση της anonymous πρόσβασης"),
        bi(
          `The change is one directive: anonymous_enable=YES. On a real host you would open the file in an editor; in this lab you append the line, which produces the same effective configuration. Leaving local_enable=YES untouched means the daemon now accepts both local Linux users with their normal passwords and the anonymous user with none.

In production that combination is a critical exposure whenever port 21 is reachable: anyone who reaches the FTP port can list and download whatever the FTP account can read. That is the finding you are about to build on purpose.`,
          `Η αλλαγή είναι μία οδηγία: anonymous_enable=YES. Σε πραγματικό host θα άνοιγες το αρχείο σε editor, σε αυτό το εργαστήριο προσθέτεις τη γραμμή, που παράγει την ίδια ενεργή ρύθμιση. Αν αφήσεις το local_enable=YES ως έχει, ο δαίμονας δέχεται πλέον και τοπικούς Linux χρήστες με τους κανονικούς κωδικούς τους και τον anonymous χρήστη χωρίς κωδικό.

Στην παραγωγή αυτός ο συνδυασμός είναι κρίσιμη έκθεση όταν η θύρα 21 είναι προσβάσιμη: όποιος φτάσει στη θύρα FTP μπορεί να εμφανίσει και να κατεβάσει ό,τι διαβάζει ο λογαριασμός FTP. Αυτό είναι το εύρημα που θα φτιάξεις τώρα σκόπιμα.`,
        ),
      ),
      section(
        bi("The drop directory and its marker", "Ο κατάλογος εναπόθεσης και το αρχείο δείκτης"),
        bi(
          `The anonymous FTP user maps to the local ftp account, so the conventional layout is a public subdirectory under the anonymous root. Create it, give it the conventional unprivileged ownership, and seed it with a small marker file. The name pub dates back to early Internet file archives and it is exactly what a tester expects to find.

Seeding a known file matters for the whole walkthrough: successful anonymous access is proved by reading back exact bytes, not by listing a filename. The marker content is deliberately boring because the point is retrieval, not the data.`,
          `Ο anonymous χρήστης FTP αντιστοιχεί στον τοπικό λογαριασμό ftp, οπότε η συμβατική διάταξη είναι ένας δημόσιος υποκατάλογος κάτω από την anonymous ρίζα. Δημιούργησέ τον, δώσε του τη συμβατική μη προνομιούχα ιδιοκτησία και τοποθέτησε ένα μικρό αρχείο δείκτη. Το όνομα pub προέρχεται από τα πρώτα αρχεία FTP του διαδικτύου και είναι ακριβώς αυτό που περιμένει να βρει ένας ελεγκτής.

Η τοποθέτηση γνωστού αρχείου έχει σημασία για όλη τη διαδικασία: η επιτυχής anonymous πρόσβαση αποδεικνύεται διαβάζοντας πίσω τα ακριβή bytes και όχι εμφανίζοντας ένα όνομα αρχείου. Το περιεχόμενο του δείκτη είναι σκόπιμα βαρετό, επειδή το ζητούμενο είναι η ανάκτηση και όχι τα δεδομένα.`,
        ),
        [
          shot("mkdir -p /var/ftp/pub", ["Created directory tree: /var/ftp/pub"]),
          shot("chown nobody:nogroup /var/ftp/pub", ["Changed ownership of /var/ftp/pub to nobody:nogroup."]),
          shot("cat /var/ftp/pub/note.txt", ["Lab FTP retrieval marker"]),
        ],
      ),
      section(
        bi("Four directives that tune anonymous mode", "Τέσσερις οδηγίες που ρυθμίζουν την anonymous λειτουργία"),
        bi(
          `anon_root=/var/ftp/ roots anonymous sessions in the directory prepared above. no_anon_password=YES removes the password prompt for anonymous logins. hide_ids=YES masks the underlying UID and GID in directory listings. pasv_min_port=40000 with pasv_max_port=50000 constrains passive-mode data ports so firewall rules stay predictable.

hide_ids deserves special attention. It exists so an administrator can offer an anonymous share without disclosing which Linux account owns each file. That is a privacy improvement, not a security boundary: it does not prevent listing, does not prevent downloading, and does not stop anyone inferring that a sensitive file exists. When you read the listing later, every row will show ftp:ftp even for a file created by root.`,
          `Το anon_root=/var/ftp/ ριζώνει τις anonymous συνεδρίες στον κατάλογο που προετοίμασες. Το no_anon_password=YES αφαιρεί το password prompt για anonymous συνδέσεις. Το hide_ids=YES αποκρύπτει το υποκείμενο UID και GID στα directory listings. Το pasv_min_port=40000 μαζί με το pasv_max_port=50000 περιορίζει τις θύρες δεδομένων passive λειτουργίας ώστε οι κανόνες firewall να μένουν προβλέψιμοι.

Το hide_ids απαιτεί ιδιαίτερη προσοχή. Υπάρχει ώστε ένας διαχειριστής να προσφέρει anonymous share χωρίς να αποκαλύπτει ποιος Linux λογαριασμός κατέχει κάθε αρχείο. Αυτό είναι βελτίωση ιδιωτικότητας και όχι όριο ασφαλείας: δεν αποτρέπει το listing, δεν αποτρέπει το κατέβασμα και δεν εμποδίζει κανέναν να συμπεράνει ότι υπάρχει ευαίσθητο αρχείο. Όταν διαβάσεις παρακάτω τη λίστα, κάθε γραμμή θα δείχνει ftp:ftp ακόμα και για αρχείο που δημιούργησε ο root.`,
        ),
      ),
      section(
        bi("Restart, then prove the listener", "Επανεκκίνηση και απόδειξη της υποδοχής ακρόασης"),
        bi(
          `Apply the configuration with service vsftpd restart. On a systemd-managed distribution the command prints nothing on success, so an empty result after restart is the expected signal. Then prove the daemon is bound to port 21 with ss -tlnp and confirm with systemctl status that the running process is using the file you edited.

If port 21 is absent, recheck the listener directives before assuming anonymous access is broken: a daemon that is not listening cannot be enumerated at all. In this lab the listener appears in the simulated socket table only after the service is started.`,
          `Εφάρμοσε τη ρύθμιση με service vsftpd restart. Σε διανομή με systemd η εντολή δεν εμφανίζει τίποτα όταν πετυχαίνει, οπότε το κενό αποτέλεσμα μετά το restart είναι το αναμενόμενο σήμα. Μετά απόδειξε ότι ο δαίμονας είναι δεσμευμένος στη θύρα 21 με ss -tlnp και επιβεβαίωσε με systemctl status ότι η διεργασία που τρέχει χρησιμοποιεί το αρχείο που επεξεργάστηκες.

Αν η θύρα 21 απουσιάζει, ξαναέλεγξε τις οδηγίες listener πριν υποθέσεις ότι η anonymous πρόσβαση χάλασε: ένας δαίμονας που δεν ακούει δεν μπορεί καν να απαριθμηθεί. Σε αυτό το εργαστήριο η υποδοχή ακρόασης εμφανίζεται στον εικονικό πίνακα socket μόνο μετά την εκκίνηση της υπηρεσίας.`,
        ),
        [
          shot("service vsftpd restart", ["restarting vsftpd (simulated)."]),
          shot("ss -tlnp | grep :21", ["tcp   LISTEN 0      128    0.0.0.0:21          0.0.0.0:*         users:((\"vsftpd\",pid=1842,fd=3))"]),
          shot("systemctl status vsftpd --no-pager", [
            "● vsftpd.service - GameHack simulated service",
            "   Active: active (running)",
          ]),
        ],
      ),
      section(
        bi("The scan that proves it: nmap -A -p 21", "Η σάρωση που το αποδεικνύει: nmap -A -p 21"),
        bi(
          `The -A option enables version detection, script scanning, OS detection and traceroute in one pass. Against a single lab port it is a compact way to confirm both the daemon and the misconfiguration. Three facts drive the next step: the service is vsftpd 3.0.5 on the expected port, the ftp-anon script reports Anonymous FTP login allowed with FTP code 230, and the script lists the pub directory inside the anonymous root, so the operator already knows where to look before opening a session.

The -A option is noisy and slow compared with -sV, so use it after a narrower scan has found something worth investigating. Its value here is completeness: one command establishes the version, the anonymous-access finding and the initial directory inventory. Change anonymous_enable back to NO, restart, and the same scan reports that anonymous login is not allowed.`,
          `Η επιλογή -A ενεργοποιεί ανίχνευση έκδοσης, script scanning, ανίχνευση λειτουργικού και traceroute σε μία περασιά. Ενάντια σε μία μόνο θύρα εργαστηρίου είναι συμπαγής τρόπος να επιβεβαιώσεις τόσο τον δαίμονα όσο και την κακορύθμιση. Τρία γεγονότα οδηγούν στο επόμενο βήμα: η υπηρεσία είναι vsftpd 3.0.5 στην αναμενόμενη θύρα, το script ftp-anon αναφέρει Anonymous FTP login allowed με FTP code 230 και το script εμφανίζει τον κατάλογο pub μέσα στην anonymous ρίζα, οπότε ο ελεγκτής ξέρει ήδη πού να κοιτάξει πριν ανοίξει συνεδρία.

Η επιλογή -A είναι θορυβώδης και αργή σε σχέση με την -sV, οπότε χρησιμοποίησέ την αφού μια στενότερη σάρωση έχει βρει κάτι που αξίζει. Η αξία της εδώ είναι η πληρότητα: μία εντολή καθορίζει την έκδοση, το εύρημα anonymous πρόσβασης και την αρχική απογραφή καταλόγων. Γύρισε το anonymous_enable πίσω σε NO, επανεκκίνησε, και η ίδια σάρωση αναφέρει ότι η anonymous σύνδεση δεν επιτρέπεται.`,
        ),
        [
          shot("nmap -A -p 21 192.168.1.9", [
            "21   /tcp open     ftp        vsftpd 3.0.5",
            "| ftp-anon: Anonymous FTP login allowed (FTP code 230)",
            "| drwxr-xr-x    2 ftp      ftp          4096 Feb 10 12:01 pub",
            "|_End of status.",
          ]),
        ],
      ),
      section(
        bi("The session: anonymous, ls, cd pub, get, bye", "Η συνεδρία: anonymous, ls, cd pub, get, bye"),
        bi(
          `Connect as anonymous, list the anonymous root, enter pub and download the marker. The session authenticates without a password, receives code 230 for successful login, and the 229 lines show passive-mode data connections opening inside the configured 40000 to 50000 range. The transfer is tiny here, but the same workflow retrieves multi-gigabyte archives with no additional access required.

Two details belong in the report. First, FTP transmits the username, the commands, the file listing and the file contents without encryption unless TLS has been configured. Second, hide_ids is visible in the listing: everything appears owned by ftp:ftp even though root created the marker. Ownership masking did not prevent disclosure; it only made the listing less informative.`,
          `Συνδέσου ως anonymous, εμφάνισε την anonymous ρίζα, μπες στο pub και κατέβασε τον δείκτη. Η συνεδρία ταυτοποιείται χωρίς κωδικό, λαμβάνει κωδικό 230 για επιτυχή σύνδεση και οι γραμμές 229 δείχνουν συνδέσεις δεδομένων passive λειτουργίας να ανοίγουν μέσα στο ρυθμισμένο εύρος 40000 έως 50000. Η μεταφορά εδώ είναι μικροσκοπική, αλλά η ίδια ροή ανακτά αρχεία πολλών gigabyte χωρίς καμία επιπλέον πρόσβαση.

Δύο λεπτομέρειες ανήκουν στην αναφορά. Πρώτον, το FTP μεταδίδει το όνομα χρήστη, τις εντολές, τη λίστα αρχείων και τα περιεχόμενα χωρίς κρυπτογράφηση αν δεν έχει ρυθμιστεί TLS. Δεύτερον, το hide_ids φαίνεται στη λίστα: όλα εμφανίζονται ως ftp:ftp παρόλο που ο root δημιούργησε τον δείκτη. Η απόκρυψη ιδιοκτησίας δεν απέτρεψε την αποκάλυψη, απλώς έκανε τη λίστα λιγότερο πληροφοριακή.`,
        ),
        [
          shot("ftp 192.168.1.9", ["Connected to 192.168.1.9.", "220 (vsFTPd 3.0.5)", "Name (192.168.1.9:root):"]),
          shot("get note.txt", [
            "local: note.txt remote: note.txt",
            "150 Opening BINARY mode data connection for note.txt (25 bytes).",
            "226 Transfer complete.",
          ]),
        ],
      ),
    ],
    cheats: [
      { cmd: "apt install vsftpd", desc: bi("install the FTP daemon", "εγκατάσταση του FTP δαίμονα") },
      { cmd: "grep -nE '^(#)?(listen|listen_ipv6|anonymous_enable|local_enable)=' /etc/vsftpd.conf", desc: bi("the four directives that matter", "οι τέσσερις οδηγίες που έχουν σημασία") },
      { cmd: "nano /etc/vsftpd.conf", desc: bi("preview the configuration file", "προεπισκόπηση του αρχείου ρυθμίσεων") },
      { cmd: 'echo "anonymous_enable=YES" >> /etc/vsftpd.conf', desc: bi("the single decisive line", "η μία καθοριστική γραμμή") },
      { cmd: 'echo "anon_root=/var/ftp/" >> /etc/vsftpd.conf', desc: bi("root anonymous sessions here", "ρίζωσε εδώ τις anonymous συνεδρίες") },
      { cmd: 'echo "no_anon_password=YES" >> /etc/vsftpd.conf', desc: bi("drop the password prompt", "αφαίρεση του password prompt") },
      { cmd: 'echo "hide_ids=YES" >> /etc/vsftpd.conf', desc: bi("mask owner and group in listings", "απόκρυψη ιδιοκτήτη και ομάδας στις λίστες") },
      { cmd: "mkdir -p /var/ftp/pub", desc: bi("the conventional drop directory", "ο συμβατικός κατάλογος εναπόθεσης") },
      { cmd: "chown nobody:nogroup /var/ftp/pub", desc: bi("the conventional unprivileged owner", "ο συμβατικός μη προνομιούχος ιδιοκτήτης") },
      { cmd: 'echo "Lab FTP retrieval marker" > /var/ftp/pub/note.txt', desc: bi("seed a verifiable marker", "τοποθέτηση επαληθεύσιμου δείκτη") },
      { cmd: "service vsftpd restart", desc: bi("apply the configuration", "εφαρμογή της ρύθμισης") },
      { cmd: "ss -tlnp | grep :21", desc: bi("prove the listener", "απόδειξη της υποδοχής ακρόασης") },
      { cmd: "systemctl status vsftpd --no-pager", desc: bi("unit, boot state, active state", "μονάδα, κατάσταση boot και active") },
      { cmd: "nmap -A -p 21 192.168.1.9", desc: bi("version, script finding, directory inventory", "έκδοση, εύρημα script, απογραφή καταλόγων") },
      { cmd: "ftp 192.168.1.9", desc: bi("open the anonymous session", "άνοιγμα της anonymous συνεδρίας") },
    ],
    tasks: [
      task(
        "build-anonymous-ftp",
        bi(
          "Build the exposure on purpose: create the drop directory with unprivileged ownership, seed a marker, enable anonymous access, and prove the listener.",
          "Φτιάξε σκόπιμα την έκθεση: δημιούργησε τον κατάλογο εναπόθεσης με μη προνομιούχα ιδιοκτησία, τοποθέτησε δείκτη, ενεργοποίησε την anonymous πρόσβαση και απόδειξε την υποδοχή ακρόασης.",
        ),
        bi(
          'mkdir -p /var/ftp/pub\nchown nobody:nogroup /var/ftp/pub\necho "Lab FTP retrieval marker" > /var/ftp/pub/note.txt\ncat /var/ftp/pub/note.txt\necho "anonymous_enable=YES" >> /etc/vsftpd.conf\necho "anon_root=/var/ftp/" >> /etc/vsftpd.conf\necho "no_anon_password=YES" >> /etc/vsftpd.conf\necho "hide_ids=YES" >> /etc/vsftpd.conf\nservice vsftpd restart\nss -tlnp | grep :21',
          'mkdir -p /var/ftp/pub\nchown nobody:nogroup /var/ftp/pub\necho "Lab FTP retrieval marker" > /var/ftp/pub/note.txt\ncat /var/ftp/pub/note.txt\necho "anonymous_enable=YES" >> /etc/vsftpd.conf\necho "anon_root=/var/ftp/" >> /etc/vsftpd.conf\necho "no_anon_password=YES" >> /etc/vsftpd.conf\necho "hide_ids=YES" >> /etc/vsftpd.conf\nservice vsftpd restart\nss -tlnp | grep :21',
        ),
        bi(
          "Why: You cannot audit a misconfiguration you have never seen from the inside, and building it makes every later control concrete. How: mkdir and chown prepare the conventional drop folder, echo seeds the marker and appends the four directives, the restart applies them, and ss proves port 21 is bound. The lab records every change inside the virtual filesystem only.",
          "Γιατί: Δεν μπορείς να ελέγξεις μια κακορύθμιση που δεν έχεις δει ποτέ από μέσα, και η κατασκευή της κάνει κάθε μεταγενέστερο έλεγχο συγκεκριμένο. Πώς: τα mkdir και chown ετοιμάζουν τον συμβατικό φάκελο εναπόθεσης, το echo τοποθετεί τον δείκτη και προσθέτει τις τέσσερις οδηγίες, το restart τις εφαρμόζει και το ss αποδεικνύει ότι η θύρα 21 είναι δεσμευμένη. Το εργαστήριο καταγράφει κάθε αλλαγή μόνο μέσα στο εικονικό σύστημα αρχείων.",
        ),
        (term) => usedCmd(term, /chown\s+nobody:nogroup/) && term.flags.has("service-vsftpd-restart") && usedCmd(term, /anonymous_enable=YES/),
      ),
      task(
        "prove-anonymous-ftp",
        bi(
          "Prove the exposure twice: once from the scan and once from an actual session that retrieves the marker bytes.",
          "Απόδειξε την έκθεση δύο φορές: μία από τη σάρωση και μία από πραγματική συνεδρία που ανακτά τα bytes του δείκτη.",
        ),
        bi(
          "nmap -A -p 21 192.168.1.9\nftp 192.168.1.9\nanonymous\nls\ncd pub\nget note.txt\nbye\ncat note.txt",
          "nmap -A -p 21 192.168.1.9\nftp 192.168.1.9\nanonymous\nls\ncd pub\nget note.txt\nbye\ncat note.txt",
        ),
        bi(
          "Why: A script result says the login is accepted; reading back the exact bytes proves data left the server. How: the ftp-anon script confirms code 230, the session lists the anonymous root, enters pub, downloads the marker and closes with bye, then cat compares the local copy with what was seeded. The transfer happens inside the virtual filesystem.",
          "Γιατί: Το αποτέλεσμα του script λέει ότι η σύνδεση γίνεται αποδεκτή, η ανάγνωση των ακριβών bytes αποδεικνύει ότι δεδομένα έφυγαν από τον server. Πώς: το script ftp-anon επιβεβαιώνει τον κωδικό 230, η συνεδρία εμφανίζει την anonymous ρίζα, μπαίνει στο pub, κατεβάζει τον δείκτη και κλείνει με bye, μετά το cat συγκρίνει το τοπικό αντίγραφο με αυτό που τοποθετήθηκε. Η μεταφορά γίνεται μέσα στο εικονικό σύστημα αρχείων.",
        ),
        (term) => term.flags.has("nmap-ftp-anon") && term.flags.has("ftp-get") && term.filesRead.some((path) => path.endsWith("/note.txt")),
      ),
      task(
        "close-anonymous-ftp",
        bi(
          "Reverse the lab change and verify that the same scan now reports no passwordless login.",
          "Αναίρεσε την αλλαγή του εργαστηρίου και επαλήθευσε ότι η ίδια σάρωση αναφέρει πλέον ότι δεν υπάρχει σύνδεση χωρίς κωδικό.",
        ),
        bi(
          'echo "anonymous_enable=NO" >> /etc/vsftpd.conf\nservice vsftpd restart\nnmap -A -p 21 192.168.1.9',
          'echo "anonymous_enable=NO" >> /etc/vsftpd.conf\nservice vsftpd restart\nnmap -A -p 21 192.168.1.9',
        ),
        bi(
          "Why: The last active directive wins, so restoring NO removes the whole enumeration path without touching the network. How: appending the restrictive line, restarting the daemon and re-running the identical scan shows the changed output, which is the evidence a hardening ticket needs. Nothing here contacts a real host.",
          "Γιατί: Η τελευταία ενεργή οδηγία υπερισχύει, οπότε η επαναφορά του NO αφαιρεί ολόκληρη τη διαδρομή αναγνώρισης χωρίς να αγγίξει το δίκτυο. Πώς: η προσθήκη της περιοριστικής γραμμής, η επανεκκίνηση του δαίμονα και η επανάληψη της ίδιας σάρωσης δείχνουν την αλλαγμένη έξοδο, που είναι το στοιχείο που χρειάζεται ένα ticket σκλήρυνσης. Τίποτα εδώ δεν επικοινωνεί με πραγματικό host.",
        ),
        (term) => term.flags.has("nmap-ftp-anon-denied"),
      ),
    ],
    challenges: pair(
      {
        title: bi("Read what hide_ids hides", "Διάβασε τι κρύβει το hide_ids"),
        brief: bi("Inside the anonymous session, list the directory and read what the masking changes and what it does not: the owner column shows one account for everything, while permissions and the ability to download stay exactly as they were.", "Μέσα στην anonymous συνεδρία, παρέθεσε τον κατάλογο και διάβασε τι αλλάζει η απόκρυψη και τι όχι: η στήλη ιδιοκτήτη δείχνει έναν λογαριασμό για όλα, ενώ τα δικαιώματα και η δυνατότητα λήψης μένουν ακριβώς όπως ήταν."),
        success: bi("Every row shows ftp:ftp, which is a privacy setting and not an access control.", "Κάθε γραμμή δείχνει ftp:ftp, που είναι ρύθμιση ιδιωτικότητας και όχι έλεγχος πρόσβασης."),
        check: (term) => term.flags.has("ftp-ls"),
      },
      {
        title: bi("Prove the listener yourself", "Απόδειξε μόνος σου την υποδοχή ακρόασης"),
        brief: bi("Do not take the banner's word for it: restart the service with service vsftpd restart, then read the listener table with ss -tlnp and confirm a process is actually bound to port 21. A claim and a socket are different evidence.", "Μην παίρνεις το banner για λόγο του: επανεκκίνησε την υπηρεσία με service vsftpd restart και μετά διάβασε τον πίνακα ακρόασης με ss -tlnp και επιβεβαίωσε ότι μια διεργασία είναι πραγματικά δεσμευμένη στη θύρα 21. Ένας ισχυρισμός και μια υποδοχή είναι διαφορετικά στοιχεία."),
        success: bi("Port 21 is bound by vsftpd, so the service can be enumerated at all.", "Η θύρα 21 είναι δεσμευμένη από το vsftpd, άρα η υπηρεσία μπορεί καν να απαριθμηθεί."),
        check: (term) => term.flags.has("service-vsftpd-restart") && usedCmd(term, /ss\s+-/),
      },
    ),
  },
  {
    id: "share-smb",
    order: 3,
    icon: "share",
    color: "from-violet-300 to-indigo-900",
    difficulty: 3,
    scenario: lab,
    title: bi("Guest SMB with Samba", "Guest SMB με Samba"),
    subtitle: bi("One share section, two enumeration tools, one control", "Μία ενότητα share, δύο εργαλεία αναγνώρισης, ένας έλεγχος"),
    badge: bi("Share Enumerator", "Απαριθμητής shares"),
    theory: [
      section(
        bi("Samba and its packaged defaults", "Το Samba και οι πακεταρισμένες προεπιλογές του"),
        bi(
          `Samba implements the SMB/CIFS protocol on Linux and bridges Linux servers to Windows-compatible clients. Like vsftpd it ships with conservative defaults: the packaged smb.conf declares only global behaviour plus printer sections, so installing the daemon does not by itself expose anything. Install it with apt install samba; the package brings its common libraries and supporting tools.

After installation the daemon is ready to configure but it does not yet offer the lab share. That gap is the point of the next sections: the exposure comes from a section someone adds, not from the software.`,
          `Το Samba υλοποιεί το πρωτόκολλο SMB/CIFS στο Linux και γεφυρώνει Linux servers με Windows-compatible clients. Όπως το vsftpd, κυκλοφορεί με συντηρητικές προεπιλογές: το πακεταρισμένο smb.conf δηλώνει μόνο global συμπεριφορά και ενότητες εκτυπωτών, οπότε η εγκατάσταση του δαίμονα δεν εκθέτει από μόνη της τίποτα. Το εγκαθιστάς με apt install samba, το πακέτο φέρνει τις κοινές βιβλιοθήκες και τα βοηθητικά εργαλεία του.

Μετά την εγκατάσταση ο δαίμονας είναι έτοιμος για ρύθμιση αλλά δεν προσφέρει ακόμα το share του εργαστηρίου. Αυτό το κενό είναι το νόημα των επόμενων ενοτήτων: η έκθεση προέρχεται από μια ενότητα που προσθέτει κάποιος και όχι από το λογισμικό.`,
        ),
      ),
      section(
        bi("The configuration directory", "Ο κατάλογος ρυθμίσεων"),
        bi(
          `Move to /etc/samba and inspect it. The canonical file is smb.conf; gdbcommands supports debugging and the tls directory holds certificate material. Editing smb.conf directly is clear enough for a lab, but production changes should always be validated with testparm before the new configuration is applied.

In this sandbox the directory is a fixture you can list and read, and appending lines to smb.conf is the equivalent of the interactive edit shown in the source walkthrough.`,
          `Πήγαινε στο /etc/samba και εξέτασέ το. Το κανονικό αρχείο είναι το smb.conf, το gdbcommands υποστηρίζει αποσφαλμάτωση και ο κατάλογος tls κρατά υλικό πιστοποιητικών. Η απευθείας επεξεργασία του smb.conf είναι αρκετά σαφής για εργαστήριο, αλλά οι αλλαγές παραγωγής πρέπει πάντα να επικυρώνονται με testparm πριν εφαρμοστεί η νέα ρύθμιση.

Σε αυτό το sandbox ο κατάλογος είναι fixture που μπορείς να εμφανίσεις και να διαβάσεις, και η προσθήκη γραμμών στο smb.conf είναι το ισοδύναμο της διαδραστικής επεξεργασίας της αρχικής παρουσίασης.`,
        ),
        [
          shot("cd /etc/samba/", ["Changed directory to /etc/samba"]),
          shot("ls -al", ["-rw-r--r-- 1 root root   19 gdbcommands", "-rw-r--r-- 1 root root  812 smb.conf", "drwxr-xr-x 2 root root    4 tls"]),
        ],
      ),
      section(
        bi("A share section anyone can open", "Μία ενότητα share που ανοίγει ο καθένας"),
        bi(
          `The lab share needs only a few lines. guest ok = yes maps unauthenticated clients to guest access. public = yes is legacy syntax for the same intent. browsable = yes makes the share visible during enumeration. read only = no and writable = yes express the same writable setting twice, and they are inverse spellings of one option, so either one alone would permit writes.

Publishing /var/www compounds the risk because that path commonly backs onto web content: a writable SMB share over web-served files can become a write-anywhere primitive behind an HTTP endpoint. That is why the hardening section asks for isolated share roots such as /srv/samba/sharename instead.`,
          `Το share του εργαστηρίου χρειάζεται μόνο μερικές γραμμές. Το guest ok = yes αντιστοιχίζει clients χωρίς ταυτοποίηση σε guest πρόσβαση. Το public = yes είναι παλιότερη σύνταξη για την ίδια πρόθεση. Το browsable = yes κάνει το share ορατό κατά την αναγνώριση. Τα read only = no και writable = yes εκφράζουν την ίδια ρύθμιση εγγραφής δύο φορές και είναι αντίστροφες διατυπώσεις μίας επιλογής, οπότε οποιοδήποτε από τα δύο μόνο του θα επέτρεπε εγγραφές.

Η δημοσίευση του /var/www πολλαπλασιάζει τον κίνδυνο, επειδή αυτή η διαδρομή συνήθως στηρίζει web περιεχόμενο: ένα εγγράψιμο SMB share πάνω σε αρχεία που εξυπηρετούνται από web μπορεί να γίνει δυνατότητα εγγραφής οπουδήποτε πίσω από ένα HTTP endpoint. Γι’ αυτό η ενότητα σκλήρυνσης ζητά απομονωμένες ρίζες share όπως /srv/samba/sharename.`,
        ),
      ),
      section(
        bi("Validate before you restart", "Επικύρωσε πριν επανεκκινήσεις"),
        bi(
          `testparm parses the effective configuration and reports syntax or semantic problems before the daemon sees them. Its normalised output is also useful evidence: it shows the share path and the writable state without forcing the reader to interpret every redundant directive in the source file.

Then restart the SMB daemon and confirm the two traditional listeners. Ports 139 and 445 are the SMB sockets; if only one is present, check whether another service owns the missing one and whether the host firewall interferes. If neither is present, the configuration did not load as expected.`,
          `Το testparm διαβάζει την ενεργή ρύθμιση και αναφέρει συντακτικά ή σημασιολογικά προβλήματα πριν τα δει ο δαίμονας. Η κανονικοποιημένη του έξοδος είναι επίσης χρήσιμο στοιχείο: δείχνει τη διαδρομή του share και την κατάσταση εγγραφής χωρίς να αναγκάζει τον αναγνώστη να ερμηνεύσει κάθε πλεονάζουσα οδηγία του αρχείου.

Μετά επανεκκίνησε τον SMB δαίμονα και επιβεβαίωσε τις δύο παραδοσιακές υποδοχές ακρόασης. Οι θύρες 139 και 445 είναι τα SMB sockets, αν υπάρχει μόνο η μία, έλεγξε αν άλλη υπηρεσία κατέχει αυτή που λείπει και αν το host firewall παρεμβαίνει. Αν δεν υπάρχει καμία, η ρύθμιση δεν φορτώθηκε όπως περίμενες.`,
        ),
        [
          shot("testparm -s", ["Loaded services file OK.", "Server role: ROLE_STANDALONE", "[shares]", "\tpath = /var/www/", "\tread only = No"]),
          shot("systemctl restart smbd", ["● smbd.service - GameHack simulated service", "   Active: active (running)"]),
          shot("ss -tlnp | grep -E ':(139|445)'", [
            "tcp   LISTEN 0      128    0.0.0.0:139         0.0.0.0:*         users:((\"smbd\",pid=2261,fd=3))",
            "tcp   LISTEN 0      128    0.0.0.0:445         0.0.0.0:*         users:((\"smbd\",pid=2261,fd=3))",
          ]),
        ],
      ),
      section(
        bi("Seed a marker you can verify", "Τοποθέτησε δείκτη που μπορείς να επαληθεύσεις"),
        bi(
          `Create a marker inside the shared directory and read it back locally. The html subdirectory is the normal web-content directory, while the marker file is the verifiable retrieval target of this lab.

Seeding a known file matters because successful anonymous access should be proved by reading back exact bytes, not merely by listing a filename. The same rule applies to every protocol in this path.`,
          `Δημιούργησε έναν δείκτη μέσα στον κοινόχρηστο κατάλογο και διάβασέ τον τοπικά. Ο υποκατάλογος html είναι ο κανονικός κατάλογος web περιεχομένου, ενώ το αρχείο δείκτης είναι ο επαληθεύσιμος στόχος ανάκτησης αυτού του εργαστηρίου.

Η τοποθέτηση γνωστού αρχείου έχει σημασία, επειδή η επιτυχής anonymous πρόσβαση πρέπει να αποδεικνύεται με ανάγνωση των ακριβών bytes και όχι απλώς με εμφάνιση ενός ονόματος. Ο ίδιος κανόνας ισχύει για κάθε πρωτόκολλο αυτής της διαδρομής.`,
        ),
        [
          shot('echo "Lab SMB retrieval marker" > /var/www/file.txt', [""]),
          shot("cat /var/www/file.txt", ["Lab SMB retrieval marker"]),
        ],
      ),
      section(
        bi("NetExec discovers shares quickly", "Το NetExec ανακαλύπτει γρήγορα τα shares"),
        bi(
          `Two complementary tools handle Samba enumeration. NetExec discovers shares quickly across one host or many, while smbclient provides interactive session work against a single export. Use NetExec for discovery and smbclient for retrieval. Authenticating as guest with an empty password lists three shares: print$ for printer drivers, IPC$ for interprocess communication, and the lab share itself with READ permission.

That READ marker is the authorisation to continue: an unauthenticated client can browse and download from that export. NetExec markers are consistent across protocols, with informational lines beginning [*], successes [+] and failures [-], which makes one-host output readable and multi-host output scannable.`,
          `Δύο συμπληρωματικά εργαλεία χειρίζονται την αναγνώριση Samba. Το NetExec ανακαλύπτει γρήγορα shares σε έναν ή πολλούς hosts, ενώ το smbclient παρέχει διαδραστική εργασία συνεδρίας σε μία εξαγωγή. Χρησιμοποίησε το NetExec για ανακάλυψη και το smbclient για ανάκτηση. Η ταυτοποίηση ως guest με κενό κωδικό εμφανίζει τρία shares: το print$ για drivers εκτυπωτών, το IPC$ για επικοινωνία μεταξύ διεργασιών και το share του εργαστηρίου με δικαίωμα READ.

Αυτή η ένδειξη READ είναι η εξουσιοδότηση για συνέχεια: ένας client χωρίς ταυτοποίηση μπορεί να περιηγηθεί και να κατεβάσει από αυτή την εξαγωγή. Οι ενδείξεις του NetExec είναι σταθερές σε όλα τα πρωτόκολλα, με τις πληροφοριακές γραμμές να ξεκινούν με [*], τις επιτυχίες με [+] και τις αποτυχίες με [-], κάτι που κάνει την έξοδο ενός host αναγνώσιμη και πολλών host σαρώσιμη.`,
        ),
        [
          shot("nxc smb 192.168.1.9 --shares -u 'guest' -p ''", [
            "[*] SMB         192.168.1.9    445    UBUNTU-LAB     [*] Unix - Samba 4.17.7-Ubuntu",
            "[+] SMB         192.168.1.9    445    UBUNTU-LAB     UBUNTU-LAB\\guest: (Guest)",
            "[*] SMB         192.168.1.9    445    UBUNTU-LAB     shares          READ            Lab file share",
          ]),
        ],
      ),
      section(
        bi("smbclient, and why the SMB1 failure is good news", "smbclient και γιατί η αποτυχία SMB1 είναι καλό νέο"),
        bi(
          `The same inventory comes directly from smbclient. The -N option suppresses the password prompt for guest access and -L lists shares. The table matches the NetExec result, which is the cross-check that makes a finding reportable.

The trailing SMB1 messages are informative too: the client attempts an obsolete dialect only for workgroup listing, the negotiation fails, and the server does not fall back to SMB1. That failure is a welcome default. Modern clients should negotiate SMB2 or SMB3, and obsolete-dialect fallback should stay disabled with min protocol = SMB2 in the global section.`,
          `Η ίδια απογραφή έρχεται απευθείας από το smbclient. Η επιλογή -N καταργεί το password prompt για guest πρόσβαση και η -L εμφανίζει τα shares. Ο πίνακας ταιριάζει με το αποτέλεσμα του NetExec, που είναι η διασταύρωση η οποία κάνει ένα εύρημα αναφέρσιμο.

Και τα τελικά μηνύματα SMB1 είναι πληροφοριακά: ο client δοκιμάζει μια ξεπερασμένη διάλεκτο μόνο για εμφάνιση workgroup, η διαπραγμάτευση αποτυγχάνει και ο server δεν επιστρέφει σε SMB1. Αυτή η αποτυχία είναι καλοδεχούμενη προεπιλογή. Οι σύγχρονοι clients πρέπει να διαπραγματεύονται SMB2 ή SMB3 και η επιστροφή σε ξεπερασμένη διάλεκτο πρέπει να μένει απενεργοποιημένη με min protocol = SMB2 στην global ενότητα.`,
        ),
        [
          shot("smbclient -N -L //192.168.1.9", [
            "Anonymous login successful",
            "\tSharename       Type      Comment",
            "\tshares          Disk      Lab file share",
            "Unable to connect with SMB1 -- no workgroup available",
          ]),
        ],
      ),
      section(
        bi("Interactive retrieval, and the writable warning", "Διαδραστική ανάκτηση και η προειδοποίηση εγγραφής"),
        bi(
          `Open the share without a password, list it and retrieve the marker. The A attribute marks a normal file and D marks a directory, and the local cat proves the retrieved bytes match the seeded marker.

Because the export is writable, the same session could also upload or overwrite files. In an authorised test that capability should be demonstrated carefully and minimally, preferably with a uniquely named marker that is removed immediately afterwards. This lab never writes to the share during enumeration.`,
          `Άνοιξε το share χωρίς κωδικό, εμφάνισέ το και ανάκτησε τον δείκτη. Η ιδιότητα A χαρακτηρίζει κανονικό αρχείο και το D κατάλογο, και το τοπικό cat αποδεικνύει ότι τα ανακτημένα bytes ταιριάζουν με τον δείκτη που τοποθετήθηκε.

Επειδή η εξαγωγή είναι εγγράψιμη, η ίδια συνεδρία θα μπορούσε επίσης να ανεβάσει ή να αντικαταστήσει αρχεία. Σε εξουσιοδοτημένο έλεγχο αυτή η δυνατότητα πρέπει να επιδεικνύεται προσεκτικά και ελάχιστα, κατά προτίμηση με έναν δείκτη μοναδικού ονόματος που αφαιρείται αμέσως μετά. Αυτό το εργαστήριο δεν γράφει ποτέ στο share κατά την αναγνώριση.`,
        ),
        [
          shot("smbclient //192.168.1.9/shares -N", ["Try \"help\" to get a list of possible commands.", "smb: \\>"]),
          shot("get file.txt", ["getting file \\file.txt of size 25 as file.txt (1.2 KiloBytes/sec)"]),
        ],
      ),
    ],
    cheats: [
      { cmd: "apt install samba", desc: bi("install Samba and its libraries", "εγκατάσταση Samba και βιβλιοθηκών") },
      { cmd: "cd /etc/samba/", desc: bi("enter the configuration directory", "είσοδος στον κατάλογο ρυθμίσεων") },
      { cmd: "ls -al", desc: bi("smb.conf, gdbcommands and tls", "smb.conf, gdbcommands και tls") },
      { cmd: "nano /etc/samba/smb.conf", desc: bi("preview the Samba configuration", "προεπισκόπηση της ρύθμισης Samba") },
      { cmd: 'echo "[shares]" >> /etc/samba/smb.conf', desc: bi("begin the share section", "έναρξη της ενότητας share") },
      { cmd: 'echo "path = /var/www/" >> /etc/samba/smb.conf', desc: bi("which directory is published", "ποιος κατάλογος δημοσιεύεται") },
      { cmd: 'echo "guest ok = yes" >> /etc/samba/smb.conf', desc: bi("the decisive guest line", "η καθοριστική γραμμή guest") },
      { cmd: 'echo "read only = no" >> /etc/samba/smb.conf', desc: bi("writable, spelled one way", "εγγράψιμο, με μία διατύπωση") },
      { cmd: 'echo "browsable = yes" >> /etc/samba/smb.conf', desc: bi("visible during enumeration", "ορατό κατά την αναγνώριση") },
      { cmd: "testparm -s", desc: bi("validate and normalise the configuration", "επικύρωση και κανονικοποίηση της ρύθμισης") },
      { cmd: "systemctl restart smbd", desc: bi("apply the Samba configuration", "εφαρμογή της ρύθμισης Samba") },
      { cmd: "ss -tlnp | grep -E ':(139|445)'", desc: bi("the two traditional SMB listeners", "οι δύο παραδοσιακές SMB υποδοχές") },
      { cmd: 'echo "Lab SMB retrieval marker" > /var/www/file.txt', desc: bi("seed a verifiable marker", "τοποθέτηση επαληθεύσιμου δείκτη") },
      { cmd: "nxc smb 192.168.1.9 --shares -u 'guest' -p ''", desc: bi("enumerate shares as guest", "απαρίθμηση shares ως guest") },
      { cmd: "smbclient -N -L //192.168.1.9", desc: bi("the same inventory, second tool", "η ίδια απογραφή, δεύτερο εργαλείο") },
      { cmd: "smbclient //192.168.1.9/shares -N", desc: bi("open the guest share", "άνοιγμα του guest share") },
    ],
    tasks: [
      task(
        "build-guest-share",
        bi(
          "Add the guest-accessible share section, validate it, restart the daemon, and prove both listeners.",
          "Πρόσθεσε την ενότητα share με guest πρόσβαση, επικύρωσέ την, επανεκκίνησε τον δαίμονα και απόδειξε και τις δύο υποδοχές ακρόασης.",
        ),
        bi(
          'echo "[shares]" >> /etc/samba/smb.conf\necho "path = /var/www/" >> /etc/samba/smb.conf\necho "guest ok = yes" >> /etc/samba/smb.conf\necho "read only = no" >> /etc/samba/smb.conf\necho "browsable = yes" >> /etc/samba/smb.conf\ntestparm -s\nsystemctl restart smbd\nss -tlnp | grep -E ":(139|445)"\necho "Lab SMB retrieval marker" > /var/www/file.txt\ncat /var/www/file.txt',
          'echo "[shares]" >> /etc/samba/smb.conf\necho "path = /var/www/" >> /etc/samba/smb.conf\necho "guest ok = yes" >> /etc/samba/smb.conf\necho "read only = no" >> /etc/samba/smb.conf\necho "browsable = yes" >> /etc/samba/smb.conf\ntestparm -s\nsystemctl restart smbd\nss -tlnp | grep -E ":(139|445)"\necho "Lab SMB retrieval marker" > /var/www/file.txt\ncat /var/www/file.txt',
        ),
        bi(
          "Why: Every line of that section contributes to the exposure, so building it shows which single directive you would remove first. How: the appended lines form the share, testparm validates the result, the restart applies it, and ss proves ports 139 and 445 are bound. The marker gives the later retrieval something exact to verify.",
          "Γιατί: Κάθε γραμμή αυτής της ενότητας συμβάλλει στην έκθεση, οπότε η κατασκευή της δείχνει ποια μεμονωμένη οδηγία θα αφαιρούσες πρώτη. Πώς: οι προστιθέμενες γραμμές σχηματίζουν το share, το testparm επικυρώνει το αποτέλεσμα, το restart το εφαρμόζει και το ss αποδεικνύει ότι οι θύρες 139 και 445 είναι δεσμευμένες. Ο δείκτης δίνει στη μεταγενέστερη ανάκτηση κάτι ακριβές να επαληθεύσει.",
        ),
        (term) => term.flags.has("testparm-shares") && usedCmd(term, /systemctl\s+restart\s+smbd/) && usedCmd(term, /guest ok = yes/),
      ),
      task(
        "map-guest-shares",
        bi(
          "Enumerate the shares with both tools and compare the inventories.",
          "Απαρίθμησε τα shares και με τα δύο εργαλεία και σύγκρινε τις απογραφές.",
        ),
        bi(
          "nxc smb 192.168.1.9 --shares -u 'guest' -p ''\nsmbclient -N -L //192.168.1.9",
          "nxc smb 192.168.1.9 --shares -u 'guest' -p ''\nsmbclient -N -L //192.168.1.9",
        ),
        bi(
          "Why: Two independent tools agreeing is what makes a finding reportable, and the comparison shows which shares should never be reachable by an unauthenticated client. How: NetExec lists shares with permission markers and smbclient lists the same table plus the SMB1 negotiation result. Both read the simulated service.",
          "Γιατί: Η συμφωνία δύο ανεξάρτητων εργαλείων είναι αυτό που κάνει ένα εύρημα αναφέρσιμο, και η σύγκριση δείχνει ποια shares δεν θα έπρεπε ποτέ να είναι προσβάσιμα από client χωρίς ταυτοποίηση. Πώς: Το NetExec εμφανίζει τα shares με ενδείξεις δικαιωμάτων και το smbclient τον ίδιο πίνακα συν το αποτέλεσμα διαπραγμάτευσης SMB1. Και τα δύο διαβάζουν την εικονική υπηρεσία.",
        ),
        (term) => term.flags.has("nxc-smb-shares") && term.flags.has("smbclient-list"),
      ),
      task(
        "retrieve-over-smb",
        bi(
          "Open the guest share, list it, retrieve the marker and verify the bytes locally.",
          "Άνοιξε το guest share, εμφάνισέ το, ανάκτησε τον δείκτη και επαλήθευσε τα bytes τοπικά.",
        ),
        bi(
          "smbclient //192.168.1.9/shares -N\nls\nget file.txt\nexit\ncat file.txt",
          "smbclient //192.168.1.9/shares -N\nls\nget file.txt\nexit\ncat file.txt",
        ),
        bi(
          "Why: Listing a filename is not evidence; reading back the exact bytes is. How: the session opens without a password, ls shows the A and D attributes, get copies the marker into the virtual working directory and cat compares it with what was seeded. No host filesystem is touched.",
          "Γιατί: Η εμφάνιση ενός ονόματος αρχείου δεν είναι στοιχείο, η ανάγνωση των ακριβών bytes είναι. Πώς: Η συνεδρία ανοίγει χωρίς κωδικό, το ls δείχνει τις ιδιότητες A και D, το get αντιγράφει τον δείκτη στον εικονικό κατάλογο εργασίας και το cat τον συγκρίνει με αυτόν που τοποθετήθηκε. Δεν αγγίζεται κανένα πραγματικό σύστημα αρχείων.",
        ),
        (term) => term.flags.has("smb-get") && term.filesRead.some((path) => path.endsWith("/file.txt")),
      ),
      task(
        "remove-guest-access",
        bi(
          "Take guest access away, validate the result and show what the attacker sees afterwards.",
          "Αφαίρεσε την guest πρόσβαση, επικύρωσε το αποτέλεσμα και δείξε τι βλέπει μετά ο επιτιθέμενος.",
        ),
        bi(
          'echo "map to guest = Never" >> /etc/samba/smb.conf\ntestparm -s\nsystemctl restart smbd\nsmbclient -N -L //192.168.1.9',
          'echo "map to guest = Never" >> /etc/samba/smb.conf\ntestparm -s\nsystemctl restart smbd\nsmbclient -N -L //192.168.1.9',
        ),
        bi(
          "Why: Removing guest ok and public from the share and setting map to guest = Never is the control that closes the whole category; the change is visible in the enumeration output before anything else changes. How: append the global directive, validate with testparm, restart smbd and re-run smbclient. The lab reads its own configuration to decide what an unauthenticated client may do.",
          "Γιατί: Η αφαίρεση των guest ok και public από το share και η ρύθμιση map to guest = Never είναι ο έλεγχος που κλείνει ολόκληρη την κατηγορία, η αλλαγή φαίνεται στην έξοδο αναγνώρισης πριν αλλάξει οτιδήποτε άλλο. Πώς: Πρόσθεσε την global οδηγία, επικύρωσε με testparm, επανεκκίνησε το smbd και ξανατρέξε το smbclient. Το εργαστήριο διαβάζει τη δική του ρύθμιση για να αποφασίσει τι επιτρέπεται σε έναν client χωρίς ταυτοποίηση.",
        ),
        (term) => usedCmd(term, /map to guest = Never/) && term.flags.has("testparm") && usedCmd(term, /systemctl\s+restart\s+smbd/),
      ),
    ],
    challenges: pair(
      {
        title: bi("Name the writable setting", "Ονόμασε τη ρύθμιση εγγραφής"),
        brief: bi("Ask the server itself which shares it will publish and with which options: testparm -s. Its normalised output is the effective share state, and the setting that permits writes is the one you should be able to name without hesitating.", "Ρώτα τον ίδιο τον server ποια shares θα δημοσιεύσει και με ποιες επιλογές: testparm -s. Η κανονικοποιημένη του έξοδος είναι η ενεργή κατάσταση των share, και η ρύθμιση που επιτρέπει εγγραφές είναι αυτή που πρέπει να κατονομάζεις χωρίς δισταγμό."),
        success: bi("read only = No in the normalised output is the writable state, however it was spelled in the file.", "Το read only = No στην κανονικοποιημένη έξοδο είναι η κατάσταση εγγραφής, όπως κι αν γράφτηκε στο αρχείο."),
        check: (term) => term.flags.has("testparm"),
      },
      {
        title: bi("Cross-check two tools", "Διασταύρωσε δύο εργαλεία"),
        brief: bi("Enumerate the same shares twice with different tools — nxc smb 192.168.1.9 --shares -u 'guest' -p '' and smbclient -N -L //192.168.1.9 — and compare the two lists. Agreement between independent tools is what makes an enumeration trustworthy.", "Απαρίθμησε τα ίδια shares δύο φορές με διαφορετικά εργαλεία — nxc smb 192.168.1.9 --shares -u 'guest' -p '' και smbclient -N -L //192.168.1.9 — και σύγκρινε τις δύο λίστες. Η συμφωνία ανάμεσα σε ανεξάρτητα εργαλεία είναι αυτό που κάνει μια απαρίθμηση αξιόπιστη."),
        success: bi("Both inventories agree, so the finding survives review.", "Οι δύο απογραφές συμφωνούν, άρα το εύρημα αντέχει στην αναθεώρηση."),
        check: (term) => term.flags.has("nxc-smb-shares") && term.flags.has("smbclient-list"),
      },
    ),
  },
  {
    id: "share-nfs",
    order: 4,
    icon: "hard-drive",
    color: "from-emerald-300 to-teal-900",
    difficulty: 4,
    scenario: lab,
    title: bi("Insecure NFS exports", "Εξαγωγές NFS χωρίς ασφάλεια"),
    subtitle: bi("UID trust, no_root_squash, and the mount that follows", "Εμπιστοσύνη UID, no_root_squash, και η προσάρτηση που ακολουθεί"),
    badge: bi("Export Reviewer", "Ελεγκτής εξαγωγών"),
    theory: [
      section(
        bi("NFS trusts the UID the client claims", "Το NFS εμπιστεύεται το UID που δηλώνει ο client"),
        bi(
          `NFS, the Network File System, is the canonical Unix-to-Unix file-sharing protocol. Unlike FTP and SMB, NFS does not authenticate users at the protocol level by default: it trusts the UID declared by the client. The export options in this lab deliberately weaponise that trust model.

Install the kernel server with apt install nfs-kernel-server. The supporting packages matter as much as the server itself: nfs-common provides the client utilities, libnfsidmap1 handles identity mapping, keyutils supports key management, and rpcbind provides the portmapper on TCP and UDP port 111. Clients query the portmapper to locate the NFS and mount daemons, so an open port 111 is a strong indicator that NFS infrastructure is reachable.`,
          `Το NFS, το Network File System, είναι το κανονικό πρωτόκολλο κοινής χρήσης αρχείων μεταξύ Unix. Σε αντίθεση με FTP και SMB, το NFS δεν ταυτοποιεί χρήστες σε επίπεδο πρωτοκόλλου από προεπιλογή: εμπιστεύεται το UID που δηλώνει ο client. Οι επιλογές εξαγωγής σε αυτό το εργαστήριο οπλοποιούν σκόπιμα αυτό το μοντέλο εμπιστοσύνης.

Εγκατάστησε τον kernel server με apt install nfs-kernel-server. Τα υποστηρικτικά πακέτα έχουν την ίδια σημασία με τον ίδιο τον server: το nfs-common παρέχει τα εργαλεία client, το libnfsidmap1 χειρίζεται την αντιστοίχιση ταυτοτήτων, το keyutils υποστηρίζει τη διαχείριση κλειδιών και το rpcbind παρέχει τον portmapper στις TCP και UDP θύρες 111. Οι clients ρωτούν τον portmapper για να εντοπίσουν τους δαίμονες NFS και mount, οπότε μια ανοιχτή θύρα 111 είναι ισχυρή ένδειξη ότι η υποδομή NFS είναι προσβάσιμη.`,
        ),
      ),
      section(
        bi("A world-writable export directory", "Κατάλογος εξαγωγής με world-writable δικαιώματα"),
        bi(
          `Create a public export directory, make it world-writable and seed a marker file inside it. The directory permissions and the export options are two separate decisions, and this lab makes both of them badly.

World-writable 777 permissions are dangerous on their own, and they become especially dangerous combined with the no_root_squash export option below. That combination lets a remote root user write files that retain root ownership on the server, which is a textbook persistence and privilege-escalation surface.`,
          `Δημιούργησε έναν δημόσιο κατάλογο εξαγωγής, κάνε τον world-writable και τοποθέτησε μέσα ένα αρχείο δείκτη. Τα δικαιώματα καταλόγου και οι επιλογές εξαγωγής είναι δύο ξεχωριστές αποφάσεις και αυτό το εργαστήριο παίρνει και τις δύο λάθος.

Τα world-writable δικαιώματα 777 είναι επικίνδυνα από μόνα τους και γίνονται ιδιαίτερα επικίνδυνα σε συνδυασμό με την παρακάτω επιλογή εξαγωγής no_root_squash. Αυτός ο συνδυασμός επιτρέπει σε απομακρυσμένο root χρήστη να γράφει αρχεία που διατηρούν root ιδιοκτησία στον server, που είναι κλασική επιφάνεια εμμονής και κλιμάκωσης δικαιωμάτων.`,
        ),
        [
          shot("mkdir -p /srv/nfs/public", ["Created directory tree: /srv/nfs/public"]),
          shot("chmod 777 /srv/nfs/public", ["Mode of /srv/nfs/public changed to drwxrwxrwx."]),
          shot("cat /srv/nfs/public/data.txt", ["Lab NFS retrieval marker"]),
        ],
      ),
      section(
        bi("One line, four risky options", "Μία γραμμή, τέσσερις επικίνδυνες επιλογές"),
        bi(
          `NFS access control lives in /etc/exports, and the lab line combines four risky choices. The asterisk wildcard exports the directory to every client address. rw grants read and write. no_root_squash disables the default protection that maps remote root requests to the unprivileged nobody account, so a client acting as root acts as root on the exported files. insecure permits clients to connect from unprivileged source ports above 1024, removing the historical requirement for a privileged port.

Use commas between the options. A missing comma or an accidental space can change parsing or stop the export loading, and the resulting failure looks like a network problem when it is really a one-character configuration error.`,
          `Ο έλεγχος πρόσβασης NFS βρίσκεται στο /etc/exports και η γραμμή του εργαστηρίου συνδυάζει τέσσερις επικίνδυνες επιλογές. Το wildcard με αστερίσκο εξάγει τον κατάλογο σε κάθε διεύθυνση client. Το rw δίνει ανάγνωση και εγγραφή. Το no_root_squash απενεργοποιεί την προεπιλεγμένη προστασία που αντιστοιχίζει remote root αιτήματα στον μη προνομιούχο λογαριασμό nobody, οπότε ένας client που ενεργεί ως root ενεργεί ως root στα εξαγόμενα αρχεία. Το insecure επιτρέπει σε clients να συνδέονται από μη προνομιούχες source θύρες πάνω από το 1024, αφαιρώντας την ιστορική απαίτηση προνομιούχας θύρας.

Χρησιμοποίησε κόμματα μεταξύ των επιλογών. Ένα κόμμα που λείπει ή ένα τυχαίο κενό μπορεί να αλλάξει το parsing ή να εμποδίσει τη φόρτωση της εξαγωγής, και η αποτυχία που προκύπτει μοιάζει με πρόβλημα δικτύου ενώ είναι configuration error ενός χαρακτήρα.`,
        ),
        [
          shot("nano /etc/exports", ["# /etc/exports: the access control list for NFS filesystems (simulated lab copy)"]),
          shot("echo \"/srv/nfs/public *(rw,sync,no_subtree_check,no_root_squash,insecure)\" >> /etc/exports", [""]),
        ],
      ),
      section(
        bi("Apply the table, then verify what the kernel will enforce", "Εφάρμοσε τον πίνακα και επαλήθευσε τι θα εφαρμόσει ο kernel"),
        bi(
          `exportfs -a reloads every export-table entry without a daemon restart, and empty output is normal. exportfs -v then displays the effective options, which is the version of the configuration the kernel will actually enforce rather than the text you typed.

Restart the NFS server and confirm both listeners. The portmapper on 111 and NFS on 2049 must both be present; if either is missing, enumeration fails before UID behaviour even matters. Dynamic mountd ports are normal unless an administrator pins them.`,
          `Το exportfs -a επαναφορτώνει κάθε εγγραφή του πίνακα εξαγωγών χωρίς επανεκκίνηση δαίμονα και το κενό αποτέλεσμα είναι φυσιολογικό. Το exportfs -v εμφανίζει μετά τις ενεργές επιλογές, που είναι η εκδοχή της ρύθμισης την οποία θα εφαρμόσει πραγματικά ο kernel και όχι το κείμενο που πληκτρολόγησες.

Επανεκκίνησε τον NFS server και επιβεβαίωσε και τις δύο υποδοχές ακρόασης. Ο portmapper στη 111 και το NFS στη 2049 πρέπει να υπάρχουν και τα δύο, αν λείπει οποιοδήποτε, η αναγνώριση αποτυγχάνει πριν καν μετρήσει η συμπεριφορά UID. Οι δυναμικές θύρες mountd είναι φυσιολογικές αν ο διαχειριστής δεν τις έχει καρφιτσώσει.`,
        ),
        [
          shot("exportfs -v", ["/srv/nfs/public", "\t\t*(rw,wdelay,no_subtree_check,no_root_squash,insecure,sec=sys,no_all_squash)"]),
          shot("ss -tlnp | grep -E ':(111|2049)'", [
            "tcp   LISTEN 0      128    0.0.0.0:111         0.0.0.0:*         users:((\"rpcbind\",pid=2418,fd=3))",
            "tcp   LISTEN 0      128    0.0.0.0:2049        0.0.0.0:*         users:((\"nfsd\",pid=2431,fd=3))",
          ]),
        ],
      ),
      section(
        bi("Classic discovery: showmount and rpcinfo", "Κλασική ανακάλυψη: showmount και rpcinfo"),
        bi(
          `Before any modern tool, confirm the classic discovery path. showmount -e asks the target which directories it exports and returns the path with its client specification. rpcinfo -p lists the RPC services registered with the portmapper, confirming the portmapper, the mount daemon and NFS itself.

The RPC table also explains why NFS firewalling is more involved than opening port 2049 alone: the mount daemon normally listens on dynamic ports unless an administrator pins them, so a rule for 2049 leaves the rest of the service reachable.`,
          `Πριν από κάθε σύγχρονο εργαλείο, επιβεβαίωσε την κλασική διαδρομή ανακάλυψης. Το showmount -e ρωτά τον στόχο ποιους καταλόγους εξάγει και επιστρέφει τη διαδρομή με τον προσδιορισμό client. Το rpcinfo -p εμφανίζει τις RPC υπηρεσίες που είναι εγγεγραμμένες στον portmapper, επιβεβαιώνοντας τον portmapper, τον mount δαίμονα και το ίδιο το NFS.

Ο πίνακας RPC εξηγεί επίσης γιατί το firewalling του NFS είναι πιο περίπλοκο από το άνοιγμα μόνο της θύρας 2049: ο mount δαίμονας συνήθως ακούει σε δυναμικές θύρες αν ο διαχειριστής δεν τις καρφιτσώσει, οπότε ένας κανόνας για την 2049 αφήνει το υπόλοιπο της υπηρεσίας προσβάσιμο.`,
        ),
        [
          shot("showmount -e 192.168.1.9", ["Export list for 192.168.1.9:", "/srv/nfs/public *"]),
          shot("rpcinfo -p 192.168.1.9 | head -12", [
            "   program vers proto   port  service",
            "    100000    4   tcp    111  portmapper",
            "    100005    3   tcp  45231  mountd",
            "    100003    4   tcp   2049  nfs",
          ]),
        ],
      ),
      section(
        bi("NetExec: exports, listing and the root escape flag", "NetExec: εξαγωγές, εμφάνιση και η ένδειξη root escape"),
        bi(
          `The NetExec NFS module provides the same discovery workflow in the interface already used for SMB. Enumerating shares returns the exported path with its options and summarises the dangerous combination as root escape: True when writable access meets no_root_squash. Listing the share root then shows the marker without performing any local mount, and it requires no credentials because the export itself imposes no authentication check.

Downloading a single file directly from the export is the fastest path from the file exists to the file is on local disk. No mount point is created, no persistent filesystem state changes on the tester side, and no shell access to the target is required, which also makes it the cleanest method for evidence handling.`,
          `Η NFS ενότητα του NetExec παρέχει την ίδια ροή ανακάλυψης στη διεπαφή που χρησιμοποιήθηκε ήδη για το SMB. Η απαρίθμηση shares επιστρέφει την εξαγόμενη διαδρομή με τις επιλογές της και συνοψίζει τον επικίνδυνο συνδυασμό ως root escape: True όταν η εγγραφή συναντά το no_root_squash. Η εμφάνιση της ρίζας του share δείχνει μετά τον δείκτη χωρίς καμία τοπική προσάρτηση και δεν απαιτεί διαπιστευτήρια, επειδή η ίδια η εξαγωγή δεν επιβάλλει έλεγχο ταυτοποίησης.

Το κατέβασμα ενός μεμονωμένου αρχείου απευθείας από την εξαγωγή είναι ο γρηγορότερος δρόμος από το το αρχείο υπάρχει στο το αρχείο είναι στον τοπικό δίσκο. Δεν δημιουργείται σημείο προσάρτησης, δεν αλλάζει μόνιμη κατάσταση συστήματος αρχείων στην πλευρά του ελεγκτή και δεν απαιτείται πρόσβαση shell στον στόχο, κάτι που το κάνει και την καθαρότερη μέθοδο για διαχείριση στοιχείων.`,
        ),
        [
          shot("nxc nfs 192.168.1.9 --enum-shares", [
            "[*] NFS         192.168.1.9    2049   UBUNTU-LAB     [*] Enumerating NFS exports",
            "[+] NFS         192.168.1.9    2049   UBUNTU-LAB     /srv/nfs/public (rw, sync, no_subtree_check, no_root_squash, insecure, root escape: True)",
          ]),
          shot("nxc nfs 192.168.1.9 --share '/srv/nfs/public' --ls '/'", [
            "[*] NFS         192.168.1.9    2049   UBUNTU-LAB     [*] Listing / on /srv/nfs/public",
            "[*] NFS         192.168.1.9    2049   UBUNTU-LAB     -rw-r--r-- root root   25 data.txt",
          ]),
        ],
      ),
      section(
        bi("Mounting the export, and why it matters", "Η προσάρτηση της εξαγωγής και γιατί έχει σημασία"),
        bi(
          `A mount provides full filesystem semantics: ls, find, grep, cp, permission inspection and execution against the remote export as if it were a local directory. The mounted directory preserves the server-side ownership and permissions, including world-writable access and root ownership.

Because of no_root_squash, operations performed as root through this mount retain root identity on the server-side files. That behaviour turns an ordinary file share into a privilege-escalation primitive: files written through the mount can carry ownership and permission bits that would normally require local root to create. Unmount when you finish, because a forgotten mount confuses later tests, retains stale file handles after the export changes, and leaves misleading contents behind.`,
          `Μια προσάρτηση παρέχει πλήρη σημασιολογία συστήματος αρχείων: ls, find, grep, cp, έλεγχο δικαιωμάτων και εκτέλεση στην απομακρυσμένη εξαγωγή σαν να ήταν τοπικός κατάλογος. Ο προσαρτημένος κατάλογος διατηρεί την ιδιοκτησία και τα δικαιώματα της πλευράς του server, συμπεριλαμβανομένης της world-writable πρόσβασης και της root ιδιοκτησίας.

Λόγω του no_root_squash, οι λειτουργίες που εκτελούνται ως root μέσω αυτής της προσάρτησης διατηρούν root ταυτότητα στα αρχεία του server. Αυτή η συμπεριφορά μετατρέπει ένα απλό κοινόχρηστο σε μηχανισμό κλιμάκωσης δικαιωμάτων: αρχεία που γράφονται μέσω της προσάρτησης μπορούν να φέρουν ιδιοκτησία και δικαιώματα που κανονικά θα απαιτούσαν τοπικό root για να δημιουργηθούν. Αποπροσάρτησε όταν τελειώσεις, επειδή μια ξεχασμένη προσάρτηση μπερδεύει μεταγενέστερους ελέγχους, κρατά παλιούς file handlers μετά την αλλαγή της εξαγωγής και αφήνει πίσω παραπλανητικά περιεχόμενα.`,
        ),
        [
          shot("mount -t nfs 192.168.1.9:/srv/nfs/public /tmp/nfs", ["# 192.168.1.9:/srv/nfs/public is mounted on /tmp/nfs inside the virtual filesystem"]),
          shot("cat /tmp/nfs/data.txt", ["Lab NFS retrieval marker"]),
          shot("umount /tmp/nfs", ["# 192.168.1.9:/srv/nfs/public was unmounted from /tmp/nfs"]),
        ],
      ),
    ],
    cheats: [
      { cmd: "apt install nfs-kernel-server -y", desc: bi("server, client libraries and rpcbind", "server, βιβλιοθήκες client και rpcbind") },
      { cmd: "mkdir -p /srv/nfs/public", desc: bi("create the export directory", "δημιουργία του καταλόγου εξαγωγής") },
      { cmd: "chmod 777 /srv/nfs/public", desc: bi("world-writable, on purpose", "world-writable, επίτηδες") },
      { cmd: 'echo "Lab NFS retrieval marker" > /srv/nfs/public/data.txt', desc: bi("seed a verifiable marker", "τοποθέτηση επαληθεύσιμου δείκτη") },
      { cmd: "nano /etc/exports", desc: bi("the NFS access control list", "η λίστα ελέγχου πρόσβασης NFS") },
      { cmd: 'echo "/srv/nfs/public *(rw,sync,no_subtree_check,no_root_squash,insecure)" >> /etc/exports', desc: bi("the insecure lab export line", "η insecure γραμμή εξαγωγής του εργαστηρίου") },
      { cmd: "exportfs -a", desc: bi("reload every export entry", "επαναφόρτωση κάθε εγγραφής εξαγωγής") },
      { cmd: "exportfs -v", desc: bi("the options the kernel will enforce", "οι επιλογές που θα εφαρμόσει ο kernel") },
      { cmd: "systemctl restart nfs-kernel-server", desc: bi("restart the NFS user-space services", "επανεκκίνηση των NFS υπηρεσιών") },
      { cmd: "ss -tlnp | grep -E ':(111|2049)'", desc: bi("portmapper and NFS listeners", "υποδοχές portmapper και NFS") },
      { cmd: "showmount -e 192.168.1.9", desc: bi("which directories are exported", "ποιοι κατάλογοι εξάγονται") },
      { cmd: "rpcinfo -p 192.168.1.9", desc: bi("registered RPC services and ports", "εγγεγραμμένες RPC υπηρεσίες και θύρες") },
      { cmd: "nxc nfs 192.168.1.9 --enum-shares", desc: bi("discover exports and the root escape flag", "ανακάλυψη εξαγωγών και της ένδειξης root escape") },
      { cmd: "nxc nfs 192.168.1.9 --share '/srv/nfs/public' --ls '/'", desc: bi("list the export root without mounting", "εμφάνιση της ρίζας εξαγωγής χωρίς προσάρτηση") },
      { cmd: "nxc nfs 192.168.1.9 --share /srv/nfs/public/ --get-file data.txt data.txt", desc: bi("download one file, no mount", "λήψη ενός αρχείου, χωρίς προσάρτηση") },
      { cmd: "mount -t nfs 192.168.1.9:/srv/nfs/public /tmp/nfs", desc: bi("full filesystem semantics", "πλήρης σημασιολογία συστήματος αρχείων") },
      { cmd: "umount /tmp/nfs", desc: bi("clean up the mount point", "καθαρισμός του σημείου προσάρτησης") },
    ],
    tasks: [
      task(
        "build-insecure-export",
        bi(
          "Create the world-writable export directory, publish the insecure export line, apply it and verify the listeners.",
          "Δημιούργησε τον world-writable κατάλογο εξαγωγής, δημοσίευσε την insecure γραμμή εξαγωγής, εφάρμοσέ την και επαλήθευσε τις υποδοχές ακρόασης.",
        ),
        bi(
          'mkdir -p /srv/nfs/public\nchmod 777 /srv/nfs/public\necho "Lab NFS retrieval marker" > /srv/nfs/public/data.txt\necho "/srv/nfs/public *(rw,sync,no_subtree_check,no_root_squash,insecure)" >> /etc/exports\nexportfs -a\nexportfs -v\nsystemctl restart nfs-kernel-server\nss -tlnp | grep -E ":(111|2049)"',
          'mkdir -p /srv/nfs/public\nchmod 777 /srv/nfs/public\necho "Lab NFS retrieval marker" > /srv/nfs/public/data.txt\necho "/srv/nfs/public *(rw,sync,no_subtree_check,no_root_squash,insecure)" >> /etc/exports\nexportfs -a\nexportfs -v\nsystemctl restart nfs-kernel-server\nss -tlnp | grep -E ":(111|2049)"',
        ),
        bi(
          "Why: The four options in that single line are the whole finding, and exportfs -v shows what the kernel actually enforces rather than what you typed. How: mkdir and chmod build the directory, echo seeds the marker and appends the export, exportfs reloads and verifies, the restart applies broader service state, and ss proves ports 111 and 2049 are bound.",
          "Γιατί: Οι τέσσερις επιλογές σε αυτή τη μία γραμμή είναι ολόκληρο το εύρημα, και το exportfs -v δείχνει τι εφαρμόζει πραγματικά ο kernel και όχι τι πληκτρολόγησες. Πώς: Τα mkdir και chmod φτιάχνουν τον κατάλογο, το echo τοποθετεί τον δείκτη και προσθέτει την εξαγωγή, το exportfs επαναφορτώνει και επαληθεύει, το restart εφαρμόζει την ευρύτερη κατάσταση υπηρεσίας και το ss αποδεικνύει ότι οι θύρες 111 και 2049 είναι δεσμευμένες.",
        ),
        (term) => term.flags.has("exportfs-verify") && term.flags.has("exportfs-no-root-squash") && usedCmd(term, /chmod\s+777/),
      ),
      task(
        "classic-discovery",
        bi(
          "Discover the export the classic way and explain which services support it.",
          "Ανακάλυψε την εξαγωγή με τον κλασικό τρόπο και εξήγησε ποιες υπηρεσίες τη στηρίζουν.",
        ),
        bi(
          "showmount -e 192.168.1.9\nrpcinfo -p 192.168.1.9 | head -12",
          "showmount -e 192.168.1.9\nrpcinfo -p 192.168.1.9 | head -12",
        ),
        bi(
          "Why: The export list names the vulnerable path and the wildcard client specification, while the RPC table shows the portmapper, mountd and NFS. How: showmount asks the target directly and rpcinfo reads the portmapper; the dynamic mountd ports are why a firewall rule for 2049 alone is insufficient.",
          "Γιατί: Η λίστα εξαγωγών ονομάζει την ευπαθή διαδρομή και τον wildcard προσδιορισμό client, ενώ ο πίνακας RPC δείχνει τον portmapper, το mountd και το NFS. Πώς: Το showmount ρωτά απευθείας τον στόχο και το rpcinfo διαβάζει τον portmapper, οι δυναμικές θύρες mountd είναι ο λόγος που ένας κανόνας firewall μόνο για την 2049 δεν αρκεί.",
        ),
        (term) => term.flags.has("showmount-export") && term.flags.has("rpcinfo"),
      ),
      task(
        "netexec-nfs",
        bi(
          "Enumerate the exports with NetExec, then list the export root without mounting anything.",
          "Απαρίθμησε τις εξαγωγές με NetExec και μετά εμφάνισε τη ρίζα της εξαγωγής χωρίς να προσαρτήσεις τίποτα.",
        ),
        bi(
          "nxc nfs 192.168.1.9 --enum-shares\nnxc nfs 192.168.1.9 --share '/srv/nfs/public' --ls '/'",
          "nxc nfs 192.168.1.9 --enum-shares\nnxc nfs 192.168.1.9 --share '/srv/nfs/public' --ls '/'",
        ),
        bi(
          "Why: root escape: True is the summary of a writable export with no_root_squash, and the listing proves no credentials were needed. How: the first command discovers the export and its options, the second lists the export root. Both read the simulated export table.",
          "Γιατί: Το root escape: True είναι η σύνοψη μιας εγγράψιμης εξαγωγής με no_root_squash, και η εμφάνιση αποδεικνύει ότι δεν χρειάστηκαν διαπιστευτήρια. Πώς: Η πρώτη εντολή ανακαλύπτει την εξαγωγή και τις επιλογές της, η δεύτερη εμφανίζει τη ρίζα της εξαγωγής. Και οι δύο διαβάζουν τον εικονικό πίνακα εξαγωγών.",
        ),
        (term) => term.flags.has("nxc-nfs-enum") && term.flags.has("nxc-nfs-ls"),
      ),
      task(
        "download-and-mount",
        bi(
          "Retrieve the marker twice, once by direct download and once through a mount, then clean the mount point.",
          "Ανάκτησε τον δείκτη δύο φορές, μία με απευθείας λήψη και μία μέσω προσάρτησης, και μετά καθάρισε το σημείο προσάρτησης.",
        ),
        bi(
          "nxc nfs 192.168.1.9 --share /srv/nfs/public/ --get-file data.txt data.txt\ncat data.txt\nmkdir -p /tmp/nfs\nmount -t nfs 192.168.1.9:/srv/nfs/public /tmp/nfs\nls -la /tmp/nfs\ncat /tmp/nfs/data.txt\numount /tmp/nfs\nls /tmp/nfs",
          "nxc nfs 192.168.1.9 --share /srv/nfs/public/ --get-file data.txt data.txt\ncat data.txt\nmkdir -p /tmp/nfs\nmount -t nfs 192.168.1.9:/srv/nfs/public /tmp/nfs\nls -la /tmp/nfs\ncat /tmp/nfs/data.txt\numount /tmp/nfs\nls /tmp/nfs",
        ),
        bi(
          "Why: The download leaves one file and no filesystem state, while the mount exposes the whole export with server-side ownership intact, which is where no_root_squash becomes a privilege primitive. How: NetExec writes one local file, the mount mirrors the export inside the virtual filesystem, and umount empties the mount point again. No host mount table is touched.",
          "Γιατί: Η λήψη αφήνει ένα αρχείο και καθόλου κατάσταση συστήματος αρχείων, ενώ η προσάρτηση εκθέτει ολόκληρη την εξαγωγή με την ιδιοκτησία του server άθικτη, που είναι το σημείο όπου το no_root_squash γίνεται μηχανισμός δικαιωμάτων. Πώς: Το NetExec γράφει ένα τοπικό αρχείο, η προσάρτηση κατοπτρίζει την εξαγωγή μέσα στο εικονικό σύστημα αρχείων και το umount αδειάζει ξανά το σημείο προσάρτησης. Δεν αγγίζεται κανένας πραγματικός πίνακας προσαρτήσεων.",
        ),
        (term) => term.flags.has("nxc-nfs-get") && term.flags.has("nfs-mount") && term.flags.has("nfs-umount"),
      ),
      task(
        "audit-the-export-table",
        bi(
          "Run the single audit line that finds the risky options in the export table.",
          "Τρέξε τη μία γραμμή ελέγχου που βρίσκει τις επικίνδυνες επιλογές στον πίνακα εξαγωγών.",
        ),
        bi(
          'grep -nE "no_root_squash|insecure" /etc/exports\nexportfs -v\nshowmount -e 192.168.1.9',
          'grep -nE "no_root_squash|insecure" /etc/exports\nexportfs -v\nshowmount -e 192.168.1.9',
        ),
        bi(
          "Why: Every major NFS misconfiguration in this walkthrough is visible with one search in one file, and the same line belongs in a periodic audit. How: grep numbers the offending lines, exportfs -v shows the enforced options, and showmount confirms what the target advertises to the network. Read-only, and safe on a host you administer.",
          "Γιατί: Κάθε σημαντική κακορύθμιση NFS σε αυτή την παρουσίαση φαίνεται με μία αναζήτηση σε ένα αρχείο, και η ίδια γραμμή ανήκει σε έναν περιοδικό έλεγχο. Πώς: Το grep αριθμεί τις προβληματικές γραμμές, το exportfs -v δείχνει τις εφαρμοζόμενες επιλογές και το showmount επιβεβαιώνει τι διαφημίζει ο στόχος στο δίκτυο. Μόνο για ανάγνωση και ασφαλές σε host που διαχειρίζεσαι.",
        ),
        (term) => usedCmd(term, /grep\s+-nE\s+.*no_root_squash/) && term.flags.has("exportfs-verify"),
      ),
    ],
    challenges: pair(
      {
        title: bi("Explain root escape", "Εξήγησε το root escape"),
        brief: bi("Run the NFS enumeration and read the line that summarises the whole finding: nxc nfs 192.168.1.9 --enum-shares. When it reports root escape as true it is telling you that a writable export and unsquashed remote root are both present.", "Τρέξε την απαρίθμηση NFS και διάβασε τη γραμμή που συνοψίζει ολόκληρο το εύρημα: nxc nfs 192.168.1.9 --enum-shares. Όταν αναφέρει το root escape ως true, σου λέει ότι υπάρχουν μαζί μια εγγράψιμη εξαγωγή και απομακρυσμένος root χωρίς squash."),
        success: bi("Writable access plus no_root_squash means a remote root keeps root identity on the exported files.", "Η εγγραφή μαζί με no_root_squash σημαίνει ότι ένας απομακρυσμένος root διατηρεί root ταυτότητα στα εξαγόμενα αρχεία."),
        check: (term) => term.flags.has("nxc-nfs-root-escape"),
      },
      {
        title: bi("Leave the lab clean", "Καθάρισε το εργαστήριο"),
        brief: bi("Mount the export, read the marker inside it, and then unmount: mount -t nfs 192.168.1.9:/srv/nfs/public /tmp/nfs, then umount /tmp/nfs. Leaving a mount behind is how a finished exercise keeps touching a system it should no longer reach.", "Προσάρτησε την εξαγωγή, διάβασε τον δείκτη μέσα της και μετά αποπροσάρτησε: mount -t nfs 192.168.1.9:/srv/nfs/public /tmp/nfs και μετά umount /tmp/nfs. Το να αφήνεις μια προσάρτηση πίσω είναι ο τρόπος που μια τελειωμένη άσκηση συνεχίζει να αγγίζει ένα σύστημα που δεν πρέπει πια να φτάνει."),
        success: bi("No stale mount is left behind to confuse the next test.", "Δεν μένει πίσω παλιά προσάρτηση που να μπερδέψει τον επόμενο έλεγχο."),
        check: (term) => term.flags.has("nfs-mount") && term.flags.has("nfs-umount"),
      },
    ),
  },
  {
    id: "share-harden",
    order: 5,
    icon: "shield",
    color: "from-slate-300 to-slate-800",
    difficulty: 3,
    scenario: lab,
    title: bi("Hardening and detection", "Σκλήρυνση και ανίχνευση"),
    subtitle: bi("Every control that would have stopped this chain", "Κάθε έλεγχος που θα σταματούσε αυτή την αλυσίδα"),
    badge: bi("Share Hardener", "Σκληρυντής κοινόχρηστων"),
    theory: [
      section(
        bi("FTP hardening", "Σκλήρυνση FTP"),
        bi(
          `Disable anonymous access. Set anonymous_enable=NO in /etc/vsftpd.conf unless a documented business case justifies anonymous retrieval, and even then prefer SFTP over SSH, because SFTP provides authentication and encryption by default. Where FTP must remain, enforce TLS with ssl_enable=YES together with force_local_logins_ssl=YES and force_local_data_ssl=YES so credentials and content do not cross the network in cleartext; certificates, client compatibility and the passive-port firewall rules belong to the same deployment.

Restrict network exposure as well. Bind the daemon to internal interfaces where possible, limit port 21 to known management subnets with a host firewall, and open only the configured passive-port range. A share that cannot be reached from an untrusted segment cannot be enumerated from that segment.`,
          `Απενεργοποίησε την anonymous πρόσβαση. Όρισε anonymous_enable=NO στο /etc/vsftpd.conf εκτός αν τεκμηριωμένος επιχειρηματικός λόγος δικαιολογεί anonymous ανάκτηση, και ακόμα τότε προτίμησε το SFTP πάνω από SSH, επειδή το SFTP παρέχει ταυτοποίηση και κρυπτογράφηση από προεπιλογή. Όπου το FTP πρέπει να μείνει, επέβαλε TLS με ssl_enable=YES μαζί με force_local_logins_ssl=YES και force_local_data_ssl=YES ώστε τα διαπιστευτήρια και το περιεχόμενο να μην διασχίζουν το δίκτυο σε cleartext, τα πιστοποιητικά, η συμβατότητα clients και οι κανόνες firewall για το passive εύρος θυρών ανήκουν στην ίδια υλοποίηση.

Περιορίστε και την έκθεση δικτύου. Δέσε τον δαίμονα σε εσωτερικές διεπαφές όπου είναι δυνατόν, περιόρισε τη θύρα 21 σε γνωστά υποδίκτυα διαχείρισης με host firewall και άνοιξε μόνο το ρυθμισμένο passive εύρος θυρών. Ένα share που δεν φτάνει από μη έμπιστο τμήμα δεν μπορεί να απαριθμηθεί από αυτό το τμήμα.`,
        ),
        [
          shot('echo "anonymous_enable=NO" >> /etc/vsftpd.conf', [""]),
          shot("nmap -A -p 21 192.168.1.9", ["| ftp-anon: Anonymous FTP login not allowed (the daemon answered 530)"]),
        ],
      ),
      section(
        bi("Samba hardening", "Σκλήρυνση Samba"),
        bi(
          `Disable guest access. Remove guest ok = yes and public = yes from every share, set map to guest = Never in the global section, and require valid Linux accounts for every connection. Anonymous SMB access should be exceptional, documented and reviewed regularly.

Disable SMB1 with min protocol = SMB2 in the global section so the obsolete dialect is never negotiated; modern clients use SMB2 or SMB3 by default, so this rarely breaks legitimate access while removing a historically fragile path. Finally, restrict share paths: never publish /var/www, /etc, home directories or backup roots. Use isolated share roots such as /srv/samba/sharename so an access-control mistake has a smaller blast radius, and pair that layout with filesystem permissions that deny writes unless writes are explicitly required.`,
          `Απενεργοποίησε την guest πρόσβαση. Αφαίρεσε τα guest ok = yes και public = yes από κάθε share, όρισε map to guest = Never στην global ενότητα και απαίτησε έγκυρους Linux λογαριασμούς για κάθε σύνδεση. Η anonymous SMB πρόσβαση πρέπει να είναι εξαιρετική, τεκμηριωμένη και να ελέγχεται τακτικά.

Απενεργοποίησε το SMB1 με min protocol = SMB2 στην global ενότητα ώστε η ξεπερασμένη διάλεκτος να μη διαπραγματεύεται ποτέ, οι σύγχρονοι clients χρησιμοποιούν SMB2 ή SMB3 από προεπιλογή, οπότε αυτό σπάνια χαλάει νόμιμη πρόσβαση ενώ αφαιρεί μια ιστορικά εύθραυστη διαδρομή. Τέλος, περιόρισε τις διαδρομές share: μην δημοσιεύεις ποτέ /var/www, /etc, home καταλόγους ή ρίζες αντιγράφων ασφαλείας. Χρησιμοποίησε απομονωμένες ρίζες share όπως /srv/samba/sharename ώστε ένα λάθος ελέγχου πρόσβασης να έχει μικρότερη ακτίνα επιπτώσεων, και συνδύασε τη διάταξη με δικαιώματα συστήματος αρχείων που αρνούνται εγγραφές εκτός αν απαιτούνται ρητά.`,
        ),
      ),
      section(
        bi("NFS hardening", "Σκλήρυνση NFS"),
        bi(
          `Enable root_squash by removing no_root_squash from every export line. The default behaviour maps remote root requests to the unprivileged nobody account and removes the file-ownership persistence vector this path demonstrated. Replace the wildcard client with explicit addresses or CIDR ranges so only known hosts can mount the export; a backup server, an application host or a management workstation should be named individually.

Where the network is untrusted, authenticate NFS. NFSv4 with Kerberos security such as sec=krb5p provides authentication and encryption; without Kerberos the default UID-trust model is unsuitable for hostile or zero-trust networks. Firewall TCP and UDP port 111 for rpcbind, TCP and UDP 2049 for NFS and the mount-daemon port for every untrusted source, pin dynamic RPC services to stable ports where policy requires it, and verify exposure from an untrusted segment rather than only from localhost.`,
          `Ενεργοποίησε το root_squash αφαιρώντας το no_root_squash από κάθε γραμμή εξαγωγής. Η προεπιλεγμένη συμπεριφορά αντιστοιχίζει remote root αιτήματα στον μη προνομιούχο λογαριασμό nobody και αφαιρεί τον μηχανισμό εμμονής μέσω ιδιοκτησίας αρχείων που έδειξε αυτή η διαδρομή. Αντικατάστησε τον wildcard client με ρητές διευθύνσεις ή εύρη CIDR ώστε μόνο γνωστοί hosts να προσαρτούν την εξαγωγή, ένας backup server, ένας application host ή ένας σταθμός διαχείρισης πρέπει να ονομάζονται μεμονωμένα.

Όπου το δίκτυο δεν είναι έμπιστο, ταυτοποίησε το NFS. Το NFSv4 με Kerberos security όπως sec=krb5p παρέχει ταυτοποίηση και κρυπτογράφηση, χωρίς Kerberos το προεπιλεγμένο μοντέλο εμπιστοσύνης UID είναι ακατάλληλο για εχθρικά ή zero-trust δίκτυα. Κλείσε με firewall τις TCP και UDP θύρες 111 για το rpcbind, τις TCP και UDP 2049 για το NFS και τη θύρα του mount δαίμονα για κάθε μη έμπιστη πηγή, καρφίτσωσε τις δυναμικές RPC υπηρεσίες σε σταθερές θύρες όπου το απαιτεί η πολιτική και επαλήθευσε την έκθεση από μη έμπιστο τμήμα και όχι μόνο από το localhost.`,
        ),
      ),
      section(
        bi("Detection and auditing", "Ανίχνευση και έλεγχος"),
        bi(
          `Audit the configuration files directly. Every major misconfiguration in this walkthrough is visible with one search per file, and the useful starting checks are anonymous_enable, guest ok, public, map to guest, min protocol, no_root_squash, export wildcards and world-writable export directories.

Scan from the tester's perspective as well. Periodically probe ports 21, 111, 139, 445 and 2049 from untrusted segments; an open port is only the beginning, so follow it with the same anonymous and guest checks used earlier in this path. Retain FTP, Samba and NFS logs, alert on anonymous or guest authentication, and review export and share inventories after every configuration change. A quarterly audit of /etc/vsftpd.conf, /etc/samba/smb.conf and /etc/exports paired with network-level scanning closes every primitive demonstrated here.`,
          `Έλεγξε απευθείας τα αρχεία ρυθμίσεων. Κάθε σημαντική κακορύθμιση σε αυτή την παρουσίαση φαίνεται με μία αναζήτηση ανά αρχείο, και οι χρήσιμοι αρχικοί έλεγχοι είναι τα anonymous_enable, guest ok, public, map to guest, min protocol, no_root_squash, τα wildcard εξαγωγών και οι world-writable κατάλογοι εξαγωγών.

Σάρωσε και από την οπτική του ελεγκτή. Διερεύνα περιοδικά τις θύρες 21, 111, 139, 445 και 2049 από μη έμπιστα τμήματα, μια ανοιχτή θύρα είναι μόνο η αρχή, οπότε ακολούθησέ την με τους ίδιους anonymous και guest ελέγχους που χρησιμοποίησες νωρίτερα σε αυτή τη διαδρομή. Κράτα αρχεία καταγραφής FTP, Samba και NFS, σήμαινε συναγερμό σε anonymous ή guest ταυτοποίηση και αναθεώρησε τις απογραφές εξαγωγών και shares μετά από κάθε αλλαγή ρύθμισης. Ένας τριμηνιαίος έλεγχος των /etc/vsftpd.conf, /etc/samba/smb.conf και /etc/exports σε συνδυασμό με σάρωση δικτύου κλείνει κάθε μηχανισμό που παρουσιάστηκε εδώ.`,
        ),
        [
          shot("grep -n 'anonymous_enable' /etc/vsftpd.conf", ["4:#anonymous_enable=NO"]),
          shot("grep -n 'guest' /etc/samba/smb.conf", ["11:   map to guest = Bad User", "18:   guest ok = no"]),
        ],
      ),
      section(
        bi("Final analysis", "Τελική ανάλυση"),
        bi(
          `FTP, SMB and NFS collectively underpin much enterprise file sharing. Each ships with conservative defaults and each is routinely weakened for convenience. This path reproduced the resulting misconfigurations: anonymous FTP with masked ownership, a guest-accessible Samba share over a sensitive path, and an NFS export with no_root_squash and a wildcard client. The matching enumeration workflows collapse discovery and exploitation into a small number of commands.

Defenders win by treating file-share configuration as security-critical infrastructure rather than background plumbing. Every fix is short, every exposure is detectable, and the same lab supports both sides of the engagement: the operator practising the chain and the defender validating that controls actually catch it. Write the finding as you would report it: the initial weaknesses, the protocol-by-protocol path, the business impact, and three controls that would each have independently prevented unauthenticated retrieval.`,
          `Τα FTP, SMB και NFS στηρίζουν μαζί μεγάλο μέρος της κοινής χρήσης αρχείων στις επιχειρήσεις. Το καθένα κυκλοφορεί με συντηρητικές προεπιλογές και το καθένα αποδυναμώνεται routinely για ευκολία. Αυτή η διαδρομή αναπαρήγαγε τις κακορυθμίσεις που προκύπτουν: anonymous FTP με αποκρυμμένη ιδιοκτησία, ένα guest-accessible Samba share πάνω σε ευαίσθητη διαδρομή και μια εξαγωγή NFS με no_root_squash και wildcard client. Οι αντίστοιχες ροές αναγνώρισης συγχωνεύουν ανακάλυψη και εκμετάλλευση σε λίγες εντολές.

Οι αμυνόμενοι κερδίζουν όταν αντιμετωπίζουν τη ρύθμιση κοινόχρηστων ως υποδομή κρίσιμη για την ασφάλεια και όχι ως παρασκηνιακή δουλειά. Κάθε διόρθωση είναι σύντομη, κάθε έκθεση είναι ανιχνεύσιμη και το ίδιο εργαστήριο υπηρετεί και τις δύο πλευρές: τον χειριστή που εξασκείται στην αλυσίδα και τον αμυνόμενο που επαληθεύει ότι οι έλεγχοι πραγματικά την πιάνουν. Γράψε το εύρημα όπως θα το ανέφερες: οι αρχικές αδυναμίες, η διαδρομή ανά πρωτόκολλο, ο επιχειρησιακός αντίκτυπος και τρεις έλεγχοι που ο καθένας θα απέτρεπε ανεξάρτητα την ανάκτηση χωρίς ταυτοποίηση.`,
        ),
      ),
    ],
    cheats: [
      { cmd: "grep -n 'anonymous_enable' /etc/vsftpd.conf", desc: bi("the FTP decision line", "η γραμμή απόφασης του FTP") },
      { cmd: "grep -n 'guest' /etc/samba/smb.conf", desc: bi("guest ok, public and map to guest", "guest ok, public και map to guest") },
      { cmd: 'grep -nE "no_root_squash|insecure" /etc/exports', desc: bi("the risky export options", "οι επικίνδυνες επιλογές εξαγωγής") },
      { cmd: "nmap -sV -p 21,111,139,445,2049 192.168.1.9", desc: bi("file-share exposure from the network", "έκθεση κοινόχρηστων από το δίκτυο") },
      { cmd: 'echo "anonymous_enable=NO" >> /etc/vsftpd.conf', desc: bi("close anonymous FTP", "κλείσιμο του anonymous FTP") },
      { cmd: 'echo "map to guest = Never" >> /etc/samba/smb.conf', desc: bi("stop unauthenticated mapping", "διακοπή της αντιστοίχισης χωρίς ταυτοποίηση") },
      { cmd: 'echo "min protocol = SMB2" >> /etc/samba/smb.conf', desc: bi("refuse the obsolete dialect", "άρνηση της ξεπερασμένης διαλέκτου") },
      { cmd: "testparm -s", desc: bi("validate before applying", "επικύρωση πριν την εφαρμογή") },
      { cmd: "exportfs -v", desc: bi("the enforced export options", "οι εφαρμοζόμενες επιλογές εξαγωγής") },
      { cmd: "ss -tlnp", desc: bi("every simulated listener at once", "όλες οι εικονικές υποδοχές ακρόασης μαζί") },
      { cmd: "service vsftpd restart", desc: bi("apply the FTP policy", "εφαρμογή της πολιτικής FTP") },
      { cmd: "systemctl restart smbd", desc: bi("apply the Samba policy", "εφαρμογή της πολιτικής Samba") },
    ],
    tasks: [
      task(
        "audit-ftp-and-smb",
        bi(
          "Run one audit line per configuration file and record what each returns.",
          "Τρέξε μία γραμμή ελέγχου ανά αρχείο ρυθμίσεων και κατέγραψε τι επιστρέφει η καθεμία.",
        ),
        bi(
          "grep -n 'anonymous_enable' /etc/vsftpd.conf\ngrep -nE 'guest|map to guest' /etc/samba/smb.conf\ncat /etc/vsftpd.conf",
          "grep -n 'anonymous_enable' /etc/vsftpd.conf\ngrep -nE 'guest|map to guest' /etc/samba/smb.conf\ncat /etc/vsftpd.conf",
        ),
        bi(
          "Why: Every FTP and SMB misconfiguration in this path is visible with one search per file, so the audit is cheap enough to schedule. How: grep numbers the decisive directives and cat shows the surrounding context. Both read the simulated configuration only.",
          "Γιατί: Κάθε κακορύθμιση FTP και SMB σε αυτή τη διαδρομή φαίνεται με μία αναζήτηση ανά αρχείο, οπότε ο έλεγχος είναι αρκετά φθηνός για να προγραμματιστεί. Πώς: Το grep αριθμεί τις καθοριστικές οδηγίες και το cat δείχνει το γύρω πλαίσιο. Και τα δύο διαβάζουν μόνο την εικονική ρύθμιση.",
        ),
        (term) => usedCmd(term, /grep.*anonymous_enable/) && usedCmd(term, /grep.*map to guest/) && term.filesRead.some((path) => path.endsWith("/vsftpd.conf")),
      ),
      task(
        "harden-ftp",
        bi(
          "Close anonymous FTP and verify with the same scan that proved it open.",
          "Κλείσε το anonymous FTP και επαλήθευσε με την ίδια σάρωση που το απέδειξε ανοιχτό.",
        ),
        bi(
          'echo "anonymous_enable=NO" >> /etc/vsftpd.conf\nservice vsftpd restart\nnmap -A -p 21 192.168.1.9',
          'echo "anonymous_enable=NO" >> /etc/vsftpd.conf\nservice vsftpd restart\nnmap -A -p 21 192.168.1.9',
        ),
        bi(
          "Why: The control and the proof are the same two files and one scan, which is exactly what a hardening ticket should contain. How: append the restrictive directive, restart the daemon, re-run the scan and compare the ftp-anon line with the earlier result. Nothing contacts a real host.",
          "Γιατί: Ο έλεγχος και η απόδειξη είναι τα ίδια δύο αρχεία και μία σάρωση, που είναι ακριβώς ό,τι πρέπει να περιέχει ένα ticket σκλήρυνσης. Πώς: Πρόσθεσε την περιοριστική οδηγία, επανεκκίνησε τον δαίμονα, ξανατρέξε τη σάρωση και σύγκρινε τη γραμμή ftp-anon με το προηγούμενο αποτέλεσμα. Τίποτα δεν επικοινωνεί με πραγματικό host.",
        ),
        (term) => term.flags.has("nmap-ftp-anon-denied"),
      ),
      task(
        "harden-smb",
        bi(
          "Stop unauthenticated mapping, refuse the obsolete dialect, validate and apply.",
          "Σταμάτησε την αντιστοίχιση χωρίς ταυτοποίηση, αρνήσου την ξεπερασμένη διάλεκτο, επικύρωσε και εφάρμοσε.",
        ),
        bi(
          'echo "map to guest = Never" >> /etc/samba/smb.conf\necho "min protocol = SMB2" >> /etc/samba/smb.conf\ntestparm -s\nsystemctl restart smbd\nsmbclient -N -L //192.168.1.9',
          'echo "map to guest = Never" >> /etc/samba/smb.conf\necho "min protocol = SMB2" >> /etc/samba/smb.conf\ntestparm -s\nsystemctl restart smbd\nsmbclient -N -L //192.168.1.9',
        ),
        bi(
          "Why: Removing guest mapping and refusing SMB1 close the category and the legacy path at once, and testparm proves the file still parses before it is applied. How: append both global directives, validate, restart smbd, then re-run the guest enumeration to see the changed answer.",
          "Γιατί: Η αφαίρεση της guest αντιστοίχισης και η άρνηση του SMB1 κλείνουν την κατηγορία και την παλιά διαδρομή μαζί, και το testparm αποδεικνύει ότι το αρχείο εξακολουθεί να διαβάζεται πριν εφαρμοστεί. Πώς: Πρόσθεσε και τις δύο global οδηγίες, επικύρωσε, επανεκκίνησε το smbd και μετά ξανατρέξε την guest απαρίθμηση για να δεις την αλλαγμένη απάντηση.",
        ),
        (term) => usedCmd(term, /min protocol = SMB2/) && term.flags.has("testparm") && usedCmd(term, /systemctl\s+restart\s+smbd/),
      ),
      task(
        "network-view",
        bi(
          "Show the file-sharing exposure from the network side and from the socket table in one pass.",
          "Δείξε την έκθεση κοινόχρηστων από την πλευρά του δικτύου και από τον πίνακα υποδοχών σε μία περασιά.",
        ),
        bi(
          "nmap -sV -p 21,111,139,445,2049 192.168.1.9\nss -tlnp",
          "nmap -sV -p 21,111,139,445,2049 192.168.1.9\nss -tlnp",
        ),
        bi(
          "Why: A scan shows what a neighbour can reach and the socket table shows what the host believes it is serving; the difference between the two is where findings hide. How: the multi-port scan reports state and version per port, and ss lists the simulated listeners with their owning processes.",
          "Γιατί: Η σάρωση δείχνει τι φτάνει ένας γείτονας και ο πίνακας υποδοχών δείχνει τι νομίζει ο host ότι εξυπηρετεί, η διαφορά των δύο είναι εκεί που κρύβονται τα ευρήματα. Πώς: Η σάρωση πολλών θυρών αναφέρει κατάσταση και έκδοση ανά θύρα και το ss εμφανίζει τις εικονικές υποδοχές ακρόασης με τις διεργασίες ιδιοκτήτη τους.",
        ),
        (term) => term.flags.has("nmap-share-ports") && usedCmd(term, /ss\s+-/),
      ),
    ],
    challenges: pair(
      {
        title: bi("One search per file", "Μία αναζήτηση ανά αρχείο"),
        brief: bi("Audit the two configurations with one search each, because a multi-file search only reads the first: grep -n 'anonymous_enable' /etc/vsftpd.conf, then grep -n 'map to guest' /etc/samba/smb.conf. Report each result with its file and line number.", "Έλεγξε τις δύο διαμορφώσεις με μία αναζήτηση η καθεμία, γιατί η αναζήτηση σε πολλά αρχεία διαβάζει μόνο το πρώτο: grep -n 'anonymous_enable' /etc/vsftpd.conf και μετά grep -n 'map to guest' /etc/samba/smb.conf. Ανάφερε κάθε αποτέλεσμα με το αρχείο και τον αριθμό γραμμής του."),
        success: bi("anonymous_enable, guest ok and map to guest are all visible without opening an editor.", "Τα anonymous_enable, guest ok και map to guest φαίνονται όλα χωρίς να ανοίξεις editor."),
        check: (term) => usedCmd(term, /grep.*anonymous_enable/) && usedCmd(term, /grep.*guest/),
      },
      {
        title: bi("Prove the fix", "Απόδειξε τη διόρθωση"),
        brief: bi("Close anonymous FTP in the configuration and verify the change from the outside: after appending anonymous_enable=NO, scan again with nmap -A -p 21 192.168.1.9 and confirm the script now reports the login as denied.", "Κλείσε το anonymous FTP στις ρυθμίσεις και επαλήθευσε την αλλαγή από έξω: αφού προσθέσεις anonymous_enable=NO, σάρωσε ξανά με nmap -A -p 21 192.168.1.9 και επιβεβαίωσε ότι το script αναφέρει τώρα τη σύνδεση ως αρνούμενη."),
        success: bi("The ftp-anon line now reports that anonymous login is not allowed.", "Η γραμμή ftp-anon αναφέρει πλέον ότι η anonymous σύνδεση δεν επιτρέπεται."),
        check: (term) => term.flags.has("nmap-ftp-anon-denied"),
      },
    ),
  },
];
