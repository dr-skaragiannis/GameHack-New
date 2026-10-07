import type { Bi, CheckCtx, Module, Section, Task } from "./lessons";
import { usedCmd } from "../lib/terminal";

const lab = "sudorun" as const;
const bi = (en: string, el: string): Bi => ({ en, el });
const shot = (cmd: string, lines: string[]) => ({ cmd, lines });
function ensureReadableParagraphs(value: string): string {
  if (value.split(/\n\s*\n/).filter((paragraph) => paragraph.trim()).length > 1) return value;
  const boundaries = [...value.matchAll(/[.!?]\s+(?=\S)/g)];
  if (!boundaries.length) return value;
  const midpoint = value.length / 2;
  const boundary = boundaries.reduce((closest, candidate) =>
    Math.abs((candidate.index || 0) - midpoint) < Math.abs((closest.index || 0) - midpoint) ? candidate : closest,
  );
  const splitAt = (boundary.index || 0) + boundary[0].length;
  return `${value.slice(0, splitAt).trim()}\n\n${value.slice(splitAt).trim()}`;
}

const section = (heading: Bi, body: Bi, cmd?: string, lines: string[] = []): Section => ({
  heading,
  body: { en: ensureReadableParagraphs(body.en), el: ensureReadableParagraphs(body.el) },
  ...(cmd ? { shots: [shot(cmd, lines)] } : {}),
});
const task = (id: string, instruction: Bi, hint: Bi, explain: Bi, check: (term: CheckCtx) => boolean): Task => ({
  id,
  instruction,
  hint,
  explain,
  check,
});

export const LINUX_BEGINNERS_2_MODULES: Module[] = [
  {
    id: "sr-net",
    order: 1,
    icon: "wifi",
    color: "from-cyan-400 to-blue-800",
    difficulty: 2,
    scenario: lab,
    title: bi("Network interfaces & name resolution", "Διεπαφές δικτύου και επίλυση ονομάτων"),
    subtitle: bi("ifconfig, ip, iwconfig, DHCP, dig, hosts", "ifconfig, ip, iwconfig, DHCP, dig, hosts"),
    badge: bi("Network Observer", "Παρατηρητής δικτύου"),
    theory: [
      section(
        bi("ifconfig and ip: read the interface", "ifconfig και ip: έλεγχος διεπαφής"),
        bi(
          "ifconfig displays the network interfaces known to the system. In this lab, eth0 is a simulated wired interface and lo is the loopback interface used by the local machine to talk to itself. The output may include an IPv4 address (inet), a subnet mask (netmask), a broadcast address, the hardware address (ether/MAC), and whether the interface is up.",
          "Η εντολή ifconfig εμφανίζει τις διεπαφές δικτύου που γνωρίζει το σύστημα. Στο εργαστήριο, το eth0 είναι μια εικονική ενσύρματη διεπαφή και το lo είναι η διεπαφή loopback, με την οποία ο υπολογιστής επικοινωνεί με τον εαυτό του. Στην έξοδο μπορείς να δεις τη διεύθυνση IPv4 (inet), τη μάσκα υποδικτύου (netmask), τη διεύθυνση broadcast, τη διεύθυνση υλικού (ether/MAC) και αν η διεπαφή είναι ενεργή.\n\nΗ νεότερη εντολή ip addr εμφανίζει παρόμοιες πληροφορίες και είναι η συνήθης επιλογή στις σύγχρονες διανομές Linux. Για μια πρώτη ανάγνωση, εντόπισε το eth0 και σύγκρινε τη διεύθυνση IPv4 με τη μάσκα. Το 127.0.0.1 ανήκει στο lo· δεν είναι διεύθυνση άλλου υπολογιστή στο δίκτυο.",
        ),
        "ifconfig",
        [
          "eth0: flags=4163<UP,BROADCAST,RUNNING> mtu 1500",
          "        inet 10.10.10.2  netmask 255.255.255.0  broadcast 10.10.10.255",
          "        ether 08:00:27:12:34:56",
          "lo:     inet 127.0.0.1  netmask 255.0.0.0",
        ],
      ),
      section(
        bi("iwconfig: inspect a wireless adapter", "iwconfig: έλεγχος ασύρματης διεπαφής"),
        bi(
          "iwconfig shows wireless-specific details such as the operating mode, the network name (ESSID), association state, and power-management settings. It is useful only for wireless devices; a wired interface such as eth0 normally reports that it has no wireless extensions.",
          "Η εντολή iwconfig εμφανίζει πληροφορίες που αφορούν ασύρματες συσκευές, όπως τη λειτουργία σύνδεσης, το όνομα δικτύου (ESSID), την κατάσταση σύνδεσης και τις ρυθμίσεις εξοικονόμησης ενέργειας. Είναι χρήσιμη μόνο για ασύρματες διεπαφές· μια ενσύρματη διεπαφή, όπως η eth0, συνήθως αναφέρει ότι δεν διαθέτει ασύρματες επεκτάσεις.\n\nΣτον προσομοιωτή υπάρχει ένα εικονικό wlan0, ώστε να μπορείς να διαβάσεις ένα παράδειγμα χωρίς πραγματικό ασύρματο προσαρμογέα. Αν σε πραγματικό σύστημα δεν εμφανίζεται ασύρματη συσκευή, αυτό δεν σημαίνει ότι η εντολή απέτυχε· πιθανότατα δεν υπάρχει διαθέσιμος κατάλληλος προσαρμογέας.",
        ),
        "iwconfig",
        [
          "lo        no wireless extensions.",
          "eth0      no wireless extensions.",
          "wlan0     IEEE 802.11  ESSID:off/any",
          "          Mode:Managed  Access Point: Not-Associated",
        ],
      ),
      section(
        bi("Assign a temporary IPv4 address", "Προσωρινή διεύθυνση IPv4"),
        bi(
          "The classic form ifconfig eth0 10.10.10.13 assigns an address to eth0 in this simulated session. The modern equivalent is ip addr add 10.10.10.13/24 dev eth0; /24 describes the subnet size. Choose an address that belongs to the lab subnet and is not already assigned to another lab device.",
          "Η κλασική εντολή ifconfig eth0 10.10.10.13 εκχωρεί μια διεύθυνση στην eth0 για την τρέχουσα εικονική συνεδρία. Η νεότερη αντίστοιχη μορφή είναι ip addr add 10.10.10.13/24 dev eth0· το /24 περιγράφει το μέγεθος του υποδικτύου. Επίλεξε διεύθυνση που ανήκει στο υποδίκτυο του εργαστηρίου και δεν χρησιμοποιείται ήδη από άλλη εικονική συσκευή.\n\nΗ αλλαγή αυτή δεν είναι μόνιμη σε ένα συνηθισμένο Linux σύστημα· διαχειριστές δικτύου αποθηκεύουν μόνιμες ρυθμίσεις στον κατάλληλο διαχειριστή δικτύου. Εδώ αλλάζει μόνο η κατάσταση του eth0 μέσα στο προσωπικό sandbox και μπορείς να την ελέγξεις ξανά με ifconfig ή ip addr.",
        ),
        "ifconfig eth0 10.10.10.13",
        ["eth0 inet 10.10.10.13"],
      ),
      section(
        bi("A MAC address is not an identity check", "Η διεύθυνση MAC δεν αποδεικνύει ταυτότητα"),
        bi(
          "A MAC address identifies a network interface on its local link. Administrators sometimes set a locally administered address while testing hardware or network configuration. The lab example uses 02:00:00:00:00:13, a clearly fictional test value; the sequence is to bring the interface down, assign the value, then bring it up again.",
          "Η διεύθυνση MAC χαρακτηρίζει μια διεπαφή στο τοπικό τμήμα του δικτύου. Ένας διαχειριστής μπορεί να ορίσει τοπικά διαχειριζόμενη διεύθυνση κατά τη δοκιμή εξοπλισμού ή ρυθμίσεων. Το παράδειγμα του εργαστηρίου χρησιμοποιεί την καθαρά δοκιμαστική τιμή 02:00:00:00:00:13· η σειρά είναι να απενεργοποιήσεις τη διεπαφή, να ορίσεις τη νέα τιμή και έπειτα να την ενεργοποιήσεις ξανά.\n\nΗ αλλαγή διεύθυνσης MAC δεν σε κάνει ανώνυμο και δεν πρέπει να χρησιμοποιείται για παράκαμψη ελέγχων πρόσβασης. Σε πραγματικό δίκτυο ακολούθησε τις οδηγίες του διαχειριστή και κάνε τέτοιες δοκιμές μόνο σε εξοπλισμό που έχεις δικαίωμα να ρυθμίσεις. Στο GameHack οι εντολές μεταβάλλουν αποκλειστικά την εικονική eth0.",
        ),
      ),
      section(
        bi("dhclient: request a DHCP lease", "dhclient: αίτημα διεύθυνσης DHCP"),
        bi(
          "DHCP lets a client request network settings from a DHCP server. A lease can include an IP address, subnet, gateway, DNS resolver, and an expiry time. Run dhclient eth0 to request a lease for the named interface; a real client may need administrator privileges and an available DHCP server.",
          "Το DHCP επιτρέπει σε έναν υπολογιστή να ζητήσει ρυθμίσεις δικτύου από έναν DHCP server. Το lease μπορεί να περιλαμβάνει διεύθυνση IP, υποδίκτυο, gateway, DNS resolver και χρόνο λήξης. Με την εντολή dhclient eth0 ζητάς lease για τη συγκεκριμένη διεπαφή· σε πραγματικό σύστημα μπορεί να χρειάζονται δικαιώματα διαχειριστή και διαθέσιμος DHCP server.\n\nΣτο εργαστήριο η απάντηση είναι προκαθορισμένη και η eth0 παίρνει την εικονική διεύθυνση 10.10.10.42. Ένα lease μπορεί να αντικαταστήσει τη χειροκίνητη διεύθυνση που όρισες προηγουμένως, γι’ αυτό έλεγξε ξανά την κατάσταση με ifconfig ή ip addr.",
        ),
        "dhclient eth0",
        [
          "Listening on LPF/eth0",
          "DHCPREQUEST of 10.10.10.42 on eth0",
          "bound to 10.10.10.42 -- renewal in 1800 seconds.",
        ],
      ),
      section(
        bi("dig: query A, MX, and NS records", "dig: ερωτήματα για εγγραφές A, MX και NS"),
        bi(
          "DNS translates names into records. With no record type, dig normally requests an A record, which maps a host name to an IPv4 address. MX records identify mail exchangers for a domain, while NS records identify its name servers. Try dig gamehack.lab, dig gamehack.lab MX, and dig gamehack.lab NS.",
          "Το DNS αντιστοιχίζει ονόματα σε εγγραφές. Αν δεν ορίσεις τύπο, η dig συνήθως ζητά εγγραφή A, η οποία συνδέει ένα όνομα με διεύθυνση IPv4. Οι εγγραφές MX δείχνουν τους mail exchangers ενός domain, ενώ οι NS δείχνουν τους name servers του. Δοκίμασε dig gamehack.lab, dig gamehack.lab MX και dig gamehack.lab NS.\n\nΣτην έξοδο, η ενότητα ANSWER SECTION περιέχει τις εγγραφές που επέστρεψε ο resolver. Οι απαντήσεις του GameHack είναι εικονικές και περιορίζονται στα ονόματα του εργαστηρίου· δεν γίνεται ερώτημα σε δημόσιο domain ούτε αποστέλλεται κίνηση στο Internet.",
        ),
        "dig gamehack.lab MX",
        [";; ANSWER SECTION:", "gamehack.lab.  300 IN MX 10 mail.gamehack.lab."],
      ),
      section(
        bi("/etc/resolv.conf: choose a resolver", "/etc/resolv.conf: επιλογή DNS resolver"),
        bi(
          "The file /etc/resolv.conf lists DNS resolver addresses. A line such as nameserver 10.10.10.53 tells the resolver library where to send name queries. In this sandbox, 10.10.10.53 is a fictional lab resolver; a public resolver address is not needed for the exercises.",
          "Το αρχείο /etc/resolv.conf περιέχει τις διευθύνσεις των DNS resolvers. Μια γραμμή όπως nameserver 10.10.10.53 δηλώνει πού θα σταλούν τα ερωτήματα ονομάτων. Στο sandbox η 10.10.10.53 είναι εικονικός resolver του εργαστηρίου· οι ασκήσεις δεν χρειάζονται δημόσια διεύθυνση DNS.\n\nΗ εντολή echo \"nameserver 10.10.10.53\" > /etc/resolv.conf αντικαθιστά το περιεχόμενο του αρχείου. Το σύμβολο > γράφει από την αρχή, ενώ το >> προσθέτει γραμμές. Σε πραγματικό σύστημα ο διαχειριστής δικτύου μπορεί να ξαναγράψει αυτό το αρχείο, γι’ αυτό έλεγξε ποιος διαχειρίζεται τη ρύθμιση πριν την αλλάξεις.",
        ),
        'echo "nameserver 10.10.10.53" > /etc/resolv.conf',
        [""],
      ),
      section(
        bi("/etc/hosts: a local name table", "/etc/hosts: τοπικός πίνακας ονομάτων"),
        bi(
          "The file /etc/hosts stores static name-to-address entries for one machine. A line contains an address followed by one or more names, for example 10.10.10.30 docs.gamehack.lab. This mapping affects name resolution on the local machine; it does not publish a record to DNS and it does not change another user's computer.",
          "Το αρχείο /etc/hosts αποθηκεύει στατικές αντιστοιχίσεις ονομάτων και διευθύνσεων για έναν υπολογιστή. Μια γραμμή περιέχει πρώτα τη διεύθυνση και έπειτα ένα ή περισσότερα ονόματα, για παράδειγμα 10.10.10.30 docs.gamehack.lab. Η αντιστοίχιση επηρεάζει την επίλυση ονομάτων μόνο στον συγκεκριμένο υπολογιστή· δεν δημοσιεύει εγγραφή DNS ούτε αλλάζει τον υπολογιστή άλλου χρήστη.\n\nΗ nano /etc/hosts ανοίγει το αρχείο στον εικονικό προβολέα κειμένου του εργαστηρίου, ενώ η cat το εμφανίζει στο τερματικό. Για να προσθέσεις με ασφάλεια ένα δοκιμαστικό alias μέσα στο VFS, μπορείς να χρησιμοποιήσεις echo \"10.10.10.30 docs.gamehack.lab\" >> /etc/hosts και μετά να επιβεβαιώσεις τη γραμμή με grep. Το παράδειγμα δεν δρομολογεί επισκέπτες σε πραγματικό server.",
        ),
        "nano /etc/hosts",
        ["127.0.0.1 localhost", "10.10.10.8 gamehack.lab www.gamehack.lab"],
      ),
    ],
    cheats: [
      { cmd: "ifconfig", desc: bi("Show interface addresses and state", "Εμφάνιση διευθύνσεων και κατάστασης διεπαφών") },
      { cmd: "ip addr", desc: bi("Modern interface/address view", "Σύγχρονη προβολή διεπαφών και διευθύνσεων") },
      { cmd: "iwconfig", desc: bi("Inspect wireless settings", "Έλεγχος ασύρματων ρυθμίσεων") },
      { cmd: "ifconfig eth0 10.10.10.13", desc: bi("Set a temporary lab IP", "Προσωρινή IP στο εργαστήριο") },
      { cmd: "ifconfig eth0 down / hw ether / up", desc: bi("Change the fictional MAC", "Αλλαγή εικονικής MAC") },
      { cmd: "dhclient eth0", desc: bi("Request a simulated DHCP lease", "Αίτημα εικονικού DHCP lease") },
      { cmd: "dig NAME [MX|NS]", desc: bi("Read simulated DNS records", "Έλεγχος εικονικών εγγραφών DNS") },
      { cmd: "cat /etc/resolv.conf", desc: bi("Read the configured resolver", "Ανάγνωση του resolver") },
      { cmd: "nano /etc/hosts", desc: bi("Inspect local name mappings", "Έλεγχος τοπικών αντιστοιχίσεων") },
      { cmd: 'echo "ADDRESS NAME" >> /etc/hosts', desc: bi("Append a local lab alias", "Προσθήκη τοπικού alias") },
    ],
    tasks: [
      task(
        "interfaces",
        bi(
          "Inspect the simulated interfaces with ifconfig, ip addr, and iwconfig. Note which line belongs to eth0 and which one describes wlan0.",
          "Έλεγξε τις εικονικές διεπαφές με ifconfig, ip addr και iwconfig. Ξεχώρισε τη γραμμή της eth0 από τις πληροφορίες για το wlan0.",
        ),
        bi("ifconfig\nip addr\niwconfig", "ifconfig\nip addr\niwconfig"),
        bi(
          "Why: You need to know which interface and address you are looking at before changing network settings. How: compare the IPv4 line and link state from ifconfig with the address output from ip addr, then read the wireless-only details from iwconfig. The loopback address belongs to the local machine, not to a remote lab host.",
          "Γιατί: Πριν αλλάξεις ρυθμίσεις, χρειάζεται να ξέρεις ποια διεπαφή και ποια διεύθυνση βλέπεις. Πώς: σύγκρινε τη γραμμή IPv4 και την κατάσταση της ifconfig με την έξοδο της ip addr και έπειτα διάβασε τις ασύρματες πληροφορίες της iwconfig. Η διεύθυνση loopback ανήκει στον ίδιο τον υπολογιστή και όχι σε απομακρυσμένο host του εργαστηρίου.",
        ),
        (term) => usedCmd(term, /^\s*ifconfig\s*$/) && usedCmd(term, /^\s*ip\s+(?:addr|a)\b/) && term.flags.has("iwconfig"),
      ),
      task(
        "configure-interface",
        bi(
          "Change the virtual eth0 address, apply the test MAC in the documented order, then request a DHCP lease. Finish by inspecting ifconfig again.",
          "Άλλαξε τη διεύθυνση της εικονικής eth0, όρισε τη δοκιμαστική MAC με τη σωστή σειρά και ζήτησε DHCP lease. Στο τέλος έλεγξε ξανά την ifconfig.",
        ),
        bi(
          "ifconfig eth0 10.10.10.13\nifconfig eth0 down\nifconfig eth0 hw ether 02:00:00:00:00:13\nifconfig eth0 up\ndhclient eth0\nifconfig",
          "ifconfig eth0 10.10.10.13\nifconfig eth0 down\nifconfig eth0 hw ether 02:00:00:00:00:13\nifconfig eth0 up\ndhclient eth0\nifconfig",
        ),
        bi(
          "Why: Static settings help you understand the interface, while DHCP demonstrates how a machine receives a lease automatically. How: make the temporary changes only to eth0 in this lab, bring the link up again, and request DHCP. The final address is supplied by the simulator; no host adapter or outside network is touched.",
          "Γιατί: Οι στατικές ρυθμίσεις βοηθούν να καταλάβεις τη διεπαφή, ενώ το DHCP δείχνει πώς ένας υπολογιστής παίρνει αυτόματα ένα lease. Πώς: κάνε τις προσωρινές αλλαγές μόνο στην εικονική eth0, ενεργοποίησε ξανά τη σύνδεση και ζήτησε DHCP. Η τελική διεύθυνση δίνεται από τον προσομοιωτή· δεν επηρεάζεται πραγματικός προσαρμογέας ούτε εξωτερικό δίκτυο.",
        ),
        (term) => term.flags.has("ip-set") && term.flags.has("mac-spoof") && term.flags.has("if-up") && term.flags.has("dhclient"),
      ),
      task(
        "dns-records",
        bi(
          "Query the lab DNS records for gamehack.lab: make one default/A query, then ask for MX and NS records. Compare the answer sections.",
          "Ρώτησε το DNS του εργαστηρίου για το gamehack.lab: κάνε ένα βασικό ερώτημα A και έπειτα ζήτησε εγγραφές MX και NS. Σύγκρινε τις ενότητες απαντήσεων.",
        ),
        bi("dig gamehack.lab\ndig gamehack.lab MX\ndig gamehack.lab NS", "dig gamehack.lab\ndig gamehack.lab MX\ndig gamehack.lab NS"),
        bi(
          "Why: Different DNS record types answer different questions about a domain. How: read the A address, the mail exchanger in MX, and the name server in NS; keep the query inside the lab domain. A returned record is data about name resolution, not permission to connect to or scan the host.",
          "Γιατί: Κάθε τύπος εγγραφής DNS απαντά σε διαφορετικό ερώτημα για ένα domain. Πώς: διάβασε τη διεύθυνση της A, τον mail exchanger της MX και τον name server της NS· κράτησε τα ερωτήματα στο domain του εργαστηρίου. Η εγγραφή είναι πληροφορία επίλυσης ονόματος, όχι άδεια σύνδεσης ή σάρωσης του host.",
        ),
        (term) => term.flags.has("dig-a") && term.flags.has("dig-mx") && term.flags.has("dig-ns"),
      ),
      task(
        "resolver-and-hosts",
        bi(
          "Set the lab resolver in /etc/resolv.conf, inspect it, then add a local docs.gamehack.lab alias to /etc/hosts and verify the line with grep.",
          "Όρισε τον resolver του εργαστηρίου στο /etc/resolv.conf και έλεγξέ τον. Έπειτα πρόσθεσε το τοπικό alias docs.gamehack.lab στο /etc/hosts και επιβεβαίωσε τη γραμμή με grep.",
        ),
        bi(
          'echo "nameserver 10.10.10.53" > /etc/resolv.conf\ncat /etc/resolv.conf\necho "10.10.10.30 docs.gamehack.lab" >> /etc/hosts\ngrep docs.gamehack.lab /etc/hosts',
          'echo "nameserver 10.10.10.53" > /etc/resolv.conf\ncat /etc/resolv.conf\necho "10.10.10.30 docs.gamehack.lab" >> /etc/hosts\ngrep docs.gamehack.lab /etc/hosts',
        ),
        bi(
          "Why: resolv.conf selects a resolver, whereas hosts is a local static mapping; they solve related but different name-resolution problems. How: use > only for the resolver file you intend to replace, use >> to preserve existing hosts entries, then read both files to verify. These writes stay in your persistent VFS and do not affect anybody else's machine.",
          "Γιατί: το resolv.conf επιλέγει resolver, ενώ το hosts κρατά τοπικές στατικές αντιστοιχίσεις· τα δύο αρχεία εξυπηρετούν διαφορετικές ανάγκες επίλυσης ονομάτων. Πώς: χρησιμοποίησε > μόνο στο αρχείο resolver που θέλεις να αντικαταστήσεις, >> για να διατηρήσεις τις υπάρχουσες εγγραφές hosts και διάβασε και τα δύο αρχεία για επαλήθευση. Οι αλλαγές μένουν στο προσωπικό VFS και δεν επηρεάζουν κανέναν άλλο υπολογιστή.",
        ),
        (term) => term.flags.has("dns-set") && usedCmd(term, />>\s*\/etc\/hosts/) && usedCmd(term, /grep\s+docs\.gamehack\.lab/),
      ),
    ],
    challenges: [
      {
        title: bi("Find the lab mail route", "Βρες τη διαδρομή αλληλογραφίας του εργαστηρίου"),
        brief: bi(
          "Read the DNS fixture under /root/linux-beginners-2/network, then query the MX record for gamehack.lab. The answer must name the lab mail exchanger.",
          "Διάβασε το DNS fixture στο /root/linux-beginners-2/network και έπειτα ζήτησε την εγγραφή MX του gamehack.lab. Η απάντηση πρέπει να δείχνει τον mail exchanger του εργαστηρίου.",
        ),
        success: bi("You can distinguish address, mail, and name-server records.", "Ξεχωρίζεις πλέον τις εγγραφές διεύθυνσης, αλληλογραφίας και name server."),
        check: (term) => term.filesRead.some((path) => path.includes("dns-records.txt")) && term.flags.has("dig-mx"),
      },
      {
        title: bi("Add a local training alias", "Πρόσθεσε τοπικό alias εκπαίδευσης"),
        brief: bi(
          "Add docs.gamehack.lab to /etc/hosts with the reserved lab address, then use grep to verify the entry. Do not use a public domain name.",
          "Πρόσθεσε το docs.gamehack.lab στο /etc/hosts με τη δεσμευμένη διεύθυνση του εργαστηρίου και επιβεβαίωσε την εγγραφή με grep. Μην χρησιμοποιήσεις δημόσιο domain.",
        ),
        success: bi("The name resolves only in this player's virtual workspace.", "Το όνομα ισχύει μόνο στον εικονικό χώρο εργασίας του παίκτη."),
        check: (term) => usedCmd(term, /docs\.gamehack\.lab.*>>\s*\/etc\/hosts/) && usedCmd(term, /grep\s+docs\.gamehack\.lab/),
      },
    ],
  },
  {
    id: "sr-proc",
    order: 2,
    icon: "cpu",
    color: "from-violet-400 to-indigo-800",
    difficulty: 2,
    scenario: lab,
    title: bi("Processes, signals & scheduled work", "Διεργασίες, σήματα και προγραμματισμένες εργασίες"),
    subtitle: bi("ps, top, nice, renice, kill, jobs, at, cron", "ps, top, nice, renice, kill, jobs, at, cron"),
    badge: bi("Process Steward", "Διαχειριστής διεργασιών"),
    theory: [
      section(
        bi("ps: inspect a process snapshot", "ps: στιγμιότυπο διεργασιών"),
        bi(
          "A process is a running instance of a program. It has a process ID (PID), a user, a state, and resource measurements. ps gives you a snapshot of processes associated with your terminal; ps aux is a common BSD-style form that shows processes across users together with CPU, memory, and command columns.",
          "Διεργασία είναι ένα πρόγραμμα που εκτελείται εκείνη τη στιγμή. Έχει αναγνωριστικό διεργασίας (PID), χρήστη, κατάσταση και μετρήσεις πόρων. Η ps δίνει στιγμιότυπο διεργασιών που σχετίζονται με το τερματικό σου· η συνηθισμένη μορφή ps aux εμφανίζει διεργασίες όλων των χρηστών μαζί με στήλες CPU, μνήμης και εντολής.\n\nΤο PID είναι χρήσιμο όταν θέλεις να ελέγξεις ή να επηρεάσεις μία συγκεκριμένη διεργασία. Μην βασίζεσαι μόνο στο όνομα: έλεγξε ολόκληρη τη γραμμή και τον χρήστη, επειδή δύο διεργασίες μπορεί να έχουν παρόμοια ονόματα.",
        ),
        "ps aux",
        [
          "USER       PID %CPU %MEM COMMAND",
          "root       7440  0.4  0.2  training-worker --batch",
          "root       7441  0.1  0.1  training-reporter",
          "root       9001  0.0  0.2  cron",
        ],
      ),
      section(
        bi("Filter a process list with grep", "Φιλτράρισμα λίστας διεργασιών με grep"),
        bi(
          "A pipe sends the output of one command to the input of another. ps aux | grep training-worker asks grep to print only process-list lines that contain that name, which is easier to read than scanning every row by eye.",
          "Το pipe στέλνει την έξοδο μιας εντολής στην είσοδο της επόμενης. Με το ps aux | grep training-worker ζητάς από το grep να εμφανίσει μόνο τις γραμμές της λίστας που περιέχουν αυτό το όνομα· έτσι δεν χρειάζεται να ψάχνεις μία προς μία όλες τις εγγραφές.\n\nΣε πραγματικό shell, η ίδια αναζήτηση μπορεί να εμφανίσει και την ίδια την εντολή grep, επειδή συμμετέχει επίσης στη λίστα διεργασιών. Για γρήγορη διερεύνηση αυτό είναι αναμενόμενο· επιβεβαίωσε το PID και την πλήρη εντολή πριν ενεργήσεις.",
        ),
        "ps aux | grep training-worker",
        ["root       7440  0.4  0.2  training-worker --batch"],
      ),
      section(
        bi("top: compare resource use", "top: σύγκριση χρήσης πόρων"),
        bi(
          "top normally shows a live summary of uptime and load, task states, CPU and memory/swap use, followed by a process table. The rows are usually ordered by resource use, so compare the %CPU and %MEM columns to see which processes are busiest; those figures describe a moment, not a diagnosis.",
          "Η εντολή top εμφανίζει συνήθως μια ζωντανή σύνοψη με τον χρόνο λειτουργίας και το load average, τις καταστάσεις των εργασιών, τη χρήση CPU και μνήμης/swap και, στη συνέχεια, έναν πίνακα διεργασιών. Οι γραμμές ταξινομούνται συνήθως με βάση τη χρήση πόρων, ώστε να συγκρίνεις τις στήλες %CPU και %MEM και να εντοπίσεις τις πιο απασχολημένες διεργασίες· τα ποσοστά περιγράφουν μια στιγμή, δεν εξηγούν από μόνα τους την αιτία.\n\nΣε πραγματικό τερματικό, πάτησε q για έξοδο από τη ζωντανή προβολή. Το GameHack δείχνει ένα σταθερό, εικονικό στιγμιότυπο και επιστρέφει αμέσως στο prompt· δεν παρακολουθεί ούτε επηρεάζει διεργασίες του υπολογιστή σου.",
        ),
        "top",
        [
          "top - 09:00:00 up 2 days, 1 user, load average: 0.04, 0.08, 0.09 — GameHack virtual snapshot",
          "Tasks: 9 total, 1 running, 7 sleeping, 0 stopped, 1 zombie",
          "%Cpu(s): 2.1 us, 0.7 sy, 0.0 ni, 97.2 id",
          "MiB Mem : 1024.0 total, 384.0 used, 512.0 free, 128.0 buff/cache",
          "MiB Swap: 0.0 total, 0.0 used, 0.0 free",
          "PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND",
          "4378 root 20 5 124M 12M 6M Z 8.4 6.2 0:00.53 [zombie-lab]",
          " 880 root 20 0 128M 24M 8M R 1.2 2.1 0:01.27 msfconsole",
          "7440 root 20 0  64M  8M 4M S 0.4 0.2 0:00.08 training-worker --batch",
        ],
      ),
      section(
        bi("nice and renice: set scheduling niceness", "nice και renice: ρύθμιση προτεραιότητας scheduler"),
        bi(
          "nice starts a command with a chosen niceness; renice changes the niceness of a process that already exists. Linux values range from -20 (highest scheduling priority) to 19 (lowest). A more positive value gives a process a smaller share of CPU when other work competes; a negative value raises its priority and may require administrator privileges.",
          "Η nice ξεκινά εντολή με συγκεκριμένη τιμή niceness, ενώ η renice αλλάζει την τιμή μιας διεργασίας που εκτελείται ήδη. Στο Linux οι τιμές κυμαίνονται από -20 (υψηλότερη προτεραιότητα scheduler) έως 19 (χαμηλότερη). Μια πιο θετική τιμή περιορίζει το μερίδιο CPU όταν ανταγωνίζονται άλλες εργασίες· μια αρνητική τιμή αυξάνει την προτεραιότητα και μπορεί να απαιτεί δικαιώματα διαχειριστή.\n\nΓια παράδειγμα, το nice -n 10 /usr/bin/ssh-agent ξεκινά την εικονική εντολή με χαμηλότερη προτεραιότητα από την προεπιλογή. Το renice 10 7440 ορίζει την απόλυτη τιμή 10 για το PID 7440. Σε αντίθεση με τη nice, η renice δεν προσθέτει προσαύξηση στην παλιά τιμή.",
        ),
        "renice 10 7440",
        ["7440: old priority 0, new priority 10"],
      ),
      section(
        bi("kill sends a signal; it does not erase resources", "Το kill στέλνει σήμα· δεν «σβήνει» πόρους"),
        bi(
          "kill sends a signal to a PID. SIGTERM (15) asks a program to stop and gives it a chance to save work and clean up. SIGHUP (1) traditionally means that a terminal or connection went away; some programs use it to reload configuration, so it is not a universal gentle-stop command.",
          "Η kill στέλνει σήμα σε ένα PID. Το SIGTERM (15) ζητά από το πρόγραμμα να σταματήσει και του δίνει χρόνο να αποθηκεύσει εργασία και να καθαρίσει πόρους. Το SIGHUP (1) σήμαινε παραδοσιακά ότι χάθηκε το τερματικό ή η σύνδεση· ορισμένα προγράμματα το χρησιμοποιούν για επαναφόρτωση ρυθμίσεων, άρα δεν είναι καθολική εντολή ήπιου τερματισμού.\n\nΤο SIGKILL (9) τερματίζει αναγκαστικά τη διεργασία και δεν της δίνει χρόνο για καθαρισμό. Χρησιμοποίησέ το μόνο όταν έχει προηγηθεί έλεγχος του PID και η κανονική διακοπή δεν πέτυχε. Μια zombie διεργασία έχει ήδη τερματίσει και περιμένει από τη γονική διεργασία να συλλέξει την κατάστασή της· το kill δεν διορθώνει από μόνο του αυτή την κατάσταση.",
        ),
        "kill -TERM 7440",
        ["sent SIGTERM to 7440; process stopped (simulated)."],
      ),
      section(
        bi("Background jobs: &, jobs, and fg", "Εργασίες παρασκηνίου: &, jobs και fg"),
        bi(
          "Appending & to a command asks the shell to run it in the background, so the prompt is available for another command. jobs lists the background jobs known to the current shell; it is different from ps, which reports processes more broadly.",
          "Όταν προσθέτεις & στο τέλος μιας εντολής, ζητάς από το shell να την εκτελέσει στο παρασκήνιο ώστε να μπορείς να συνεχίσεις στο prompt. Η jobs εμφανίζει τις εργασίες παρασκηνίου που γνωρίζει το τρέχον shell· διαφέρει από την ps, η οποία παρουσιάζει διεργασίες γενικότερα.\n\nΗ fg επαναφέρει μια εργασία στο προσκήνιο για να συνεχίσεις την αλληλεπίδραση. Στο GameHack μπορείς να δοκιμάσεις nano /root/linux-beginners-2/processes/notes.txt & και μετά jobs και fg. Ο εικονικός editor δεν ξεκινά πραγματικό πρόγραμμα στον υπολογιστή σου.",
        ),
        "nano /root/linux-beginners-2/processes/notes.txt &",
        ["[1] 7100"],
      ),
      section(
        bi("at for one time; cron for repeated work", "at για μία φορά· cron για επανάληψη"),
        bi(
          "The at command queues one command for a single future run. In a real interactive shell, `at 21:30` opens an input prompt and Ctrl-D closes it. In this lab you can either use `at 21:30 /root/scanning_script.sh` or enter `at 21:30` followed by the script path on the next line; the simulator queues that one line and returns to the prompt. The queue is only a VFS-backed training record: nothing is launched later on the host.",
          "Η εντολή at προγραμματίζει μία εντολή για μία μελλοντική εκτέλεση. Σε πραγματικό διαδραστικό shell, η `at 21:30` ανοίγει prompt και το Ctrl-D ολοκληρώνει την καταχώριση. Εδώ μπορείς είτε να γράψεις `at 21:30 /root/scanning_script.sh` είτε να δώσεις πρώτα `at 21:30` και τη διαδρομή του script στην επόμενη γραμμή· ο προσομοιωτής αποθηκεύει αυτή τη μία γραμμή και επιστρέφει στο prompt. Η ουρά είναι μόνο εγγραφή εκπαίδευσης στο VFS· καμία εντολή δεν θα εκτελεστεί αργότερα στον υπολογιστή σου.\n\nΤο cron προορίζεται για επαναλαμβανόμενες εργασίες. Η `crontab -l` εμφανίζει τον πίνακα του χρήστη, ενώ η `crontab -e` ανοίγει τον εικονικό editor. Στο GameHack μπορείς επίσης να προσθέσεις μία γραμμή με `echo \"30 21 * * * /root/scanning_script.sh\" | crontab -` και να την επαληθεύσεις με `crontab -l`· το σύστημα καταγράφει το χρονοπρόγραμμα, δεν εκτελεί το script.",
        ),
        "at 21:30 /root/scanning_script.sh\ncrontab -l",
        [
          "job 1 queued for 21:30: /root/scanning_script.sh (simulated; not executed)",
          "# m h dom mon dow command",
          "17 * * * * root cd / && run-parts --report /etc/cron.hourly",
        ],
      ),
    ],
    cheats: [
      { cmd: "ps", desc: bi("Show processes attached to the shell", "Εμφάνιση διεργασιών του shell") },
      { cmd: "ps aux", desc: bi("Show a process snapshot across users", "Στιγμιότυπο διεργασιών όλων των χρηστών") },
      { cmd: "ps aux | grep NAME", desc: bi("Filter process rows by text", "Φιλτράρισμα διεργασιών με κείμενο") },
      { cmd: "top", desc: bi("Compare simulated CPU and memory use", "Σύγκριση εικονικής χρήσης CPU και μνήμης") },
      { cmd: "nice -n 10 COMMAND", desc: bi("Start with lower CPU scheduling priority", "Εκκίνηση με χαμηλότερη προτεραιότητα CPU") },
      { cmd: "renice 10 PID", desc: bi("Set an existing process's niceness", "Ορισμός niceness υπάρχουσας διεργασίας") },
      { cmd: "kill -15 PID", desc: bi("Request a graceful stop", "Αίτημα κανονικού τερματισμού") },
      { cmd: "kill -1 PID / kill -9 PID", desc: bi("Send SIGHUP / force with SIGKILL", "Αποστολή SIGHUP / αναγκαστικός τερματισμός με SIGKILL") },
      { cmd: "COMMAND &", desc: bi("Run a shell job in the background", "Εκτέλεση εργασίας στο παρασκήνιο") },
      { cmd: "jobs / fg", desc: bi("List jobs / return one to foreground", "Λίστα εργασιών / επαναφορά στο προσκήνιο") },
      { cmd: "at TIME COMMAND / crontab -e / -l", desc: bi("Queue once / edit or inspect recurring work", "Εφάπαξ εργασία / επεξεργασία ή έλεγχος επανάληψης") },
    ],
    tasks: [
      task(
        "inspect-processes",
        bi(
          "Run ps and ps aux, then filter the table for training-worker with grep. Read its PID and command before trying to change anything.",
          "Τρέξε ps και ps aux και έπειτα φιλτράρισε τον πίνακα για το training-worker με grep. Διάβασε το PID και ολόκληρη την εντολή πριν επιχειρήσεις αλλαγή.",
        ),
        bi("ps\nps aux\nps aux | grep training-worker", "ps\nps aux\nps aux | grep training-worker"),
        bi(
          "Why: A PID identifies one process instance, while a name can be reused by several programs. How: compare the user, PID, resource columns, and full command in ps aux, then use grep to narrow the output. These are fictional rows provided for practice.",
          "Γιατί: Το PID χαρακτηρίζει μία συγκεκριμένη διεργασία, ενώ το ίδιο όνομα μπορεί να χρησιμοποιείται από περισσότερα προγράμματα. Πώς: σύγκρινε χρήστη, PID, στήλες πόρων και πλήρη εντολή στην ps aux και έπειτα περιόρισε την έξοδο με grep. Οι εγγραφές είναι εικονικές και προορίζονται μόνο για εξάσκηση.",
        ),
        (term) => term.flags.has("ps-aux") && term.flags.has("ps-grep"),
      ),
      task(
        "top-snapshot",
        bi(
          "Run top by itself. Read the summary lines and identify the process at the top of the resource-sorted table; compare its PID and command with ps aux.",
          "Τρέξε την top μόνη της. Διάβασε τις γραμμές σύνοψης και εντόπισε τη διεργασία στην κορυφή του ταξινομημένου πίνακα· σύγκρινε το PID και την εντολή της με την ps aux.",
        ),
        bi("top", "top"),
        bi(
          "Why: A process snapshot can help you spot unusual CPU or memory use before you investigate further. How: inspect the summary, read the %CPU and %MEM columns, and verify the selected row with ps; the terminal returns to the prompt because this lab uses a fixed snapshot.",
          "Γιατί: Ένα στιγμιότυπο διεργασιών μπορεί να σε βοηθήσει να εντοπίσεις ασυνήθιστη χρήση CPU ή μνήμης πριν συνεχίσεις τη διερεύνηση. Πώς: διάβασε τη σύνοψη και τις στήλες %CPU και %MEM και επιβεβαίωσε τη γραμμή με την ps· το εργαστήριο επιστρέφει στο prompt επειδή χρησιμοποιεί σταθερό στιγμιότυπο.",
        ),
        (term) => term.flags.has("top") && usedCmd(term, /^\s*top\s*$/),
      ),
      task(
        "priority",
        bi(
          "Start the example with a positive nice value, then set PID 7440 to niceness 10 with renice. Compare the old and new values.",
          "Ξεκίνα το παράδειγμα με θετική τιμή nice και έπειτα όρισε niceness 10 στο PID 7440 με renice. Σύγκρινε την παλιά και τη νέα τιμή.",
        ),
        bi("nice -n 10 /usr/bin/ssh-agent\nrenice 10 7440", "nice -n 10 /usr/bin/ssh-agent\nrenice 10 7440"),
        bi(
          "Why: Niceness helps the scheduler share CPU when processes compete. How: a positive value lowers a process's relative priority; renice applies an absolute value to the selected PID. The simulator changes only its in-memory process table and never starts ssh-agent on the host.",
          "Γιατί: Η niceness βοηθά τον scheduler να μοιράζει την CPU όταν ανταγωνίζονται διεργασίες. Πώς: μια θετική τιμή μειώνει τη σχετική προτεραιότητα· η renice εφαρμόζει απόλυτη τιμή στο επιλεγμένο PID. Ο προσομοιωτής αλλάζει μόνο τον εικονικό πίνακα διεργασιών και δεν ξεκινά ssh-agent στον υπολογιστή σου.",
        ),
        (term) => term.flags.has("nice") && term.flags.has("renice"),
      ),
      task(
        "signals",
        bi(
          "Send SIGHUP to PID 7441, request a normal SIGTERM for PID 7440, then use SIGKILL only on the separate training process 7442. Watch how the simulated process table changes.",
          "Στείλε SIGHUP στο PID 7441, ζήτησε κανονικό SIGTERM για το PID 7440 και χρησιμοποίησε SIGKILL μόνο στην ξεχωριστή εκπαιδευτική διεργασία 7442. Παρατήρησε πώς αλλάζει ο εικονικός πίνακας.",
        ),
        bi("kill -1 7441\nkill -15 7440\nkill -9 7442", "kill -1 7441\nkill -15 7440\nkill -9 7442"),
        bi(
          "Why: Signals communicate with a process; they are not interchangeable ways to erase it. How: SIGHUP asks the program to handle a hangup, SIGTERM requests a normal exit, and SIGKILL forces termination without cleanup. Check the PID and use the least forceful signal that fits the situation.",
          "Γιατί: Τα σήματα επικοινωνούν με μια διεργασία· δεν είναι εναλλάξιμοι τρόποι διαγραφής της. Πώς: το SIGHUP δηλώνει απώλεια σύνδεσης, το SIGTERM ζητά κανονική έξοδο και το SIGKILL τερματίζει αναγκαστικά χωρίς καθαρισμό. Επιβεβαίωσε το PID και χρησιμοποίησε το ηπιότερο σήμα που ταιριάζει στην περίσταση.",
        ),
        (term) => term.flags.has("kill-1") && term.flags.has("kill-term") && term.flags.has("kill-9"),
      ),
      task(
        "jobs-and-schedules",
        bi(
          "Open the prepared notes file in the simulated editor in the background, inspect it with jobs, and return it with fg %1. Queue the training script once with at, then add and inspect a recurring cron entry.",
          "Άνοιξε το αρχείο σημειώσεων στον εικονικό editor στο παρασκήνιο, έλεγξέ το με jobs και επανάφερέ το με fg %1. Προγραμμάτισε μία εκτέλεση με at και έπειτα πρόσθεσε και έλεγξε μια επαναλαμβανόμενη εγγραφή cron.",
        ),
        bi(
          'nano /root/linux-beginners-2/processes/notes.txt &\njobs\nfg %1\nat 21:30 /root/scanning_script.sh\necho "30 21 * * * /root/scanning_script.sh" | crontab -\ncrontab -l',
          'nano /root/linux-beginners-2/processes/notes.txt &\njobs\nfg %1\nat 21:30 /root/scanning_script.sh\necho "30 21 * * * /root/scanning_script.sh" | crontab -\ncrontab -l',
        ),
        bi(
          "Why: Background jobs free the prompt, while schedulers handle work that should run later. How: use & for the shell job, jobs to find it, and fg to bring it back; at is one-time and cron is recurring. This sandbox only records and previews these actions.",
          "Γιατί: Οι εργασίες παρασκηνίου αφήνουν διαθέσιμο το prompt, ενώ οι schedulers αναλαμβάνουν εργασίες για αργότερα. Πώς: βάλε & για εργασία του shell, χρησιμοποίησε jobs για να τη βρεις και fg για να την επαναφέρεις· το at είναι εφάπαξ και το cron επαναλαμβανόμενο. Το sandbox καταγράφει και προβάλλει τις ενέργειες χωρίς να τις εκτελεί στο σύστημα υποδοχής.",
        ),
        (term) => term.flags.has("bg") && term.flags.has("jobs") && term.flags.has("fg") && term.flags.has("at") && term.flags.has("crontab-install") && term.flags.has("crontab"),
      ),
    ],
    challenges: [
      {
        title: bi("Locate the quiet training worker", "Εντόπισε την ήρεμη εκπαιδευτική διεργασία"),
        brief: bi(
          "Use ps aux and grep to find training-worker. Record its PID, then lower its priority with renice; do not signal it during this challenge.",
          "Χρησιμοποίησε ps aux και grep για να βρεις το training-worker. Σημείωσε το PID του και μείωσε την προτεραιότητά του με renice· μην του στείλεις σήμα σε αυτή την πρόκληση.",
        ),
        success: bi("You inspected a process before changing its scheduler setting.", "Έλεγξες τη διεργασία πριν αλλάξεις τη ρύθμιση του scheduler."),
        check: (term) => term.flags.has("ps-grep") && term.flags.has("renice"),
      },
      {
        title: bi("Compare one-time and recurring work", "Σύγκρινε εφάπαξ και επαναλαμβανόμενη εργασία"),
        brief: bi(
          "Read the schedule notes under /root/linux-beginners-2/processes, run at 21:30, and inspect the user's crontab. Both results should stay within the simulator.",
          "Διάβασε τις σημειώσεις προγραμματισμού στο /root/linux-beginners-2/processes, τρέξε at 21:30 και έλεγξε το crontab του χρήστη. Και τα δύο αποτελέσματα πρέπει να μείνουν στον προσομοιωτή.",
        ),
        success: bi("You can now tell a one-off queue from a recurring schedule.", "Ξεχωρίζεις πλέον την εφάπαξ ουρά από το επαναλαμβανόμενο πρόγραμμα."),
        check: (term) => term.filesRead.some((path) => path.includes("schedule-notes.txt")) && term.flags.has("at") && term.flags.has("crontab"),
      },
    ],
  },
  {
    id: "sr-env",
    order: 3,
    icon: "settings",
    color: "from-cyan-300 to-sky-800",
    difficulty: 2,
    scenario: lab,
    title: bi("Shell & environment variables", "Μεταβλητές shell και περιβάλλοντος"),
    subtitle: bi("set, env, HISTSIZE, export, unset", "set, env, HISTSIZE, export, unset"),
    badge: bi("Environment Keeper", "Φύλακας περιβάλλοντος"),
    theory: [
      section(
        bi("env and set: inspect the current shell", "env και set: έλεγχος τρέχοντος shell"),
        bi(
          "A variable is a name paired with a value, such as HOME=/root. env lists environment variables that child processes can inherit. In Bash, set also shows shell variables and functions, so set may produce more output than env; pipe it to more for paging or to grep HISTSIZE to find one entry.",
          "Μια μεταβλητή συνδέει ένα όνομα με μια τιμή, όπως HOME=/root. Η env εμφανίζει μεταβλητές περιβάλλοντος που μπορούν να κληρονομήσουν οι διεργασίες-παιδιά. Στο Bash, η set εμφανίζει επιπλέον μεταβλητές του shell και συναρτήσεις, οπότε μπορεί να παράγει περισσότερη έξοδο· χρησιμοποίησε pipe προς more για σελιδοποίηση ή προς grep HISTSIZE για να εντοπίσεις μία εγγραφή.\n\nΟι μεταβλητές περιβάλλοντος δεν είναι αυτομάτως «καθολικές» για όλο το σύστημα. Ανήκουν στη διεργασία και περνούν στις διεργασίες που ξεκινά, εφόσον έχουν γίνει export. Κάθε νέο shell μπορεί να ξεκινήσει με διαφορετικές τιμές.",
        ),
        "set | grep HISTSIZE",
        ["HISTSIZE=1000"],
      ),
      section(
        bi("Assign a value with no spaces around =", "Ανάθεση τιμής χωρίς κενά γύρω από το ="),
        bi(
          "In a shell, write NAME=value without spaces around the equals sign. For example, HISTSIZE=0 changes the history-size variable in the current simulated shell. A command such as HISTSIZE = 0 is not the same syntax: the shell would treat the words as a command and arguments.",
          "Σε ένα shell γράφεις NAME=value χωρίς κενά γύρω από το ίσον. Για παράδειγμα, η εντολή HISTSIZE=0 αλλάζει τη μεταβλητή μεγέθους ιστορικού στο τρέχον εικονικό shell. Η μορφή HISTSIZE = 0 δεν έχει την ίδια σημασία: το shell αντιμετωπίζει τις λέξεις ως εντολή και ορίσματα.\n\nΜια απλή ανάθεση δημιουργεί ή αλλάζει shell variable για την τρέχουσα συνεδρία. Αν η τιμή πρέπει να είναι διαθέσιμη σε επόμενη εντολή-παιδί, χρειάζεται export. Η αλλαγή μιας μεταβλητής HISTSIZE δεν διαγράφει παλιές εγγραφές ούτε αποτελεί τρόπο απόκρυψης ενεργειών.",
        ),
        "HISTSIZE=0",
        [""],
      ),
      section(
        bi("Save a value before changing it", "Αποθήκευση τιμής πριν από την αλλαγή"),
        bi(
          "Before experimenting, save the current value in a virtual file. echo \"$HISTSIZE\" > /root/linux-beginners-2/environment/histsize-before-change.txt expands the variable and writes one line. The > operator replaces the destination file; use >> only when you deliberately want to append.",
          "Πριν από μια δοκιμή, αποθήκευσε την τρέχουσα τιμή σε εικονικό αρχείο. Η εντολή echo \"$HISTSIZE\" > /root/linux-beginners-2/environment/histsize-before-change.txt κάνει expand τη μεταβλητή και γράφει μία γραμμή. Ο τελεστής > αντικαθιστά το αρχείο-στόχο· χρησιμοποίησε >> μόνο όταν θέλεις σκόπιμα να προσθέσεις περιεχόμενο.\n\nΈλεγξε το αποτέλεσμα με cat πριν αλλάξεις τη μεταβλητή. Στο συγκεκριμένο sandbox η ανακατεύθυνση ενημερώνει μόνο το προσωπικό VFS, το οποίο διατηρείται όταν αλλάζεις μάθημα ή διαδρομή.",
        ),
        'echo "$HISTSIZE" > /root/linux-beginners-2/environment/histsize-before-change.txt',
        [""],
      ),
      section(
        bi("export applies to child processes, not future logins", "Το export αφορά child processes, όχι μελλοντικές συνδέσεις"),
        bi(
          "export HISTSIZE marks the shell variable for inheritance by commands started from this shell. You can verify the exported value with env | grep HISTSIZE. The change remains part of the current shell session; export alone does not make a setting permanent across logout, restart, or a new login.",
          "Η εντολή export HISTSIZE επιτρέπει στις εντολές που ξεκινούν από αυτό το shell να κληρονομήσουν τη μεταβλητή. Μπορείς να επαληθεύσεις την τιμή με env | grep HISTSIZE. Η αλλαγή ισχύει στην τρέχουσα συνεδρία· το export από μόνο του δεν διατηρεί τη ρύθμιση μετά την αποσύνδεση, την επανεκκίνηση ή μια νέα σύνδεση.\n\nΓια ρύθμιση που φορτώνεται σε μελλοντικά διαδραστικά shells, οι διαχειριστές συχνά προσθέτουν μια προσεκτικά ελεγμένη γραμμή στο ~/.bashrc. Στο εργαστήριο μπορείς να δεις αυτή την ιδέα με echo 'export LAB_MODE=training' >> /root/.bashrc και cat /root/.bashrc· η γραμμή μένει στο VFS, αλλά δεν αλλάζει πραγματικό αρχείο ρυθμίσεων.",
        ),
        "export HISTSIZE",
        ["HISTSIZE=0 exported for this virtual shell."],
      ),
      section(
        bi("Create, read, and remove a custom variable", "Δημιουργία, ανάγνωση και αφαίρεση δικής σου μεταβλητής"),
        bi(
          "A variable name should describe the value it holds. url_variable=\"gamehack.lab/\" creates a shell variable; echo \"$url_variable\" expands it so you can read the value. Quoting protects the text from accidental splitting when it contains spaces or shell characters.",
          "Το όνομα μιας μεταβλητής καλό είναι να περιγράφει την τιμή που κρατά. Η ανάθεση url_variable=\"gamehack.lab/\" δημιουργεί shell variable και η echo \"$url_variable\" εμφανίζει την τιμή της. Τα εισαγωγικά προστατεύουν το κείμενο από ανεπιθύμητο διαχωρισμό όταν περιέχει κενά ή χαρακτήρες του shell.\n\nΗ unset url_variable αφαιρεί τη μεταβλητή από την τρέχουσα συνεδρία· δεν διαγράφει αρχείο με παρόμοιο όνομα. Μετά την αφαίρεση, το echo \"$url_variable\" εμφανίζει κενή τιμή. Οι εντολές εκτελούνται στον προσομοιωμένο λογαριασμό και δεν αλλάζουν μεταβλητές στο σύστημα του υπολογιστή σου.",
        ),
        'url_variable="gamehack.lab/"',
        [""],
      ),
    ],
    cheats: [
      { cmd: "set | more", desc: bi("Page through shell variables", "Σελιδοποίηση μεταβλητών shell") },
      { cmd: "env", desc: bi("List exported environment values", "Λίστα exported τιμών περιβάλλοντος") },
      { cmd: "set | grep HISTSIZE", desc: bi("Filter for one setting", "Φιλτράρισμα μίας ρύθμισης") },
      { cmd: "HISTSIZE=0", desc: bi("Assign in the current shell", "Ανάθεση στο τρέχον shell") },
      { cmd: 'echo "$HISTSIZE" > FILE', desc: bi("Save a value to the VFS", "Αποθήκευση τιμής στο VFS") },
      { cmd: "export HISTSIZE", desc: bi("Pass a value to child processes", "Μεταβίβαση σε child processes") },
      { cmd: 'url_variable="gamehack.lab/"', desc: bi("Create a custom shell variable", "Δημιουργία δικής σου μεταβλητής") },
      { cmd: "unset url_variable", desc: bi("Remove that variable", "Αφαίρεση της μεταβλητής") },
      { cmd: "cat /root/.bashrc", desc: bi("Read a virtual startup file", "Ανάγνωση εικονικού startup file") },
    ],
    tasks: [
      task(
        "inspect-variables",
        bi(
          "Compare the shell listing with the exported environment: run set | more, env, and set | grep HISTSIZE. Find the current history-size value.",
          "Σύγκρινε τη λίστα του shell με το exported περιβάλλον: τρέξε set | more, env και set | grep HISTSIZE. Εντόπισε την τρέχουσα τιμή του μεγέθους ιστορικού.",
        ),
        bi("set | more\nenv\nset | grep HISTSIZE", "set | more\nenv\nset | grep HISTSIZE"),
        bi(
          "Why: Inspecting variables first prevents you from changing a value whose role you do not understand. How: set shows shell state, env lists inherited environment values, and grep narrows the output to HISTSIZE. The simulator reports only the current virtual session.",
          "Γιατί: Ο έλεγχος των μεταβλητών πριν από την αλλαγή σε προστατεύει από τυχαία τροποποίηση άγνωστης ρύθμισης. Πώς: η set εμφανίζει την κατάσταση του shell, η env τις τιμές περιβάλλοντος που κληρονομούνται και το grep περιορίζει την έξοδο στο HISTSIZE. Ο προσομοιωτής δείχνει μόνο την τρέχουσα εικονική συνεδρία.",
        ),
        (term) => term.flags.has("set") && term.flags.has("grep-hist") && usedCmd(term, /^\s*env\b/),
      ),
      task(
        "save-histsize",
        bi(
          "Save the original HISTSIZE to the named file before changing it. Read the file with cat and confirm it contains the previous value.",
          "Αποθήκευσε την αρχική τιμή του HISTSIZE στο συγκεκριμένο αρχείο πριν την αλλάξεις. Διάβασε το αρχείο με cat και επιβεβαίωσε ότι περιέχει την προηγούμενη τιμή.",
        ),
        bi(
          'echo "$HISTSIZE" > /root/linux-beginners-2/environment/histsize-before-change.txt\ncat /root/linux-beginners-2/environment/histsize-before-change.txt',
          'echo "$HISTSIZE" > /root/linux-beginners-2/environment/histsize-before-change.txt\ncat /root/linux-beginners-2/environment/histsize-before-change.txt',
        ),
        bi(
          "Why: A saved starting value gives you a reference point and a way to restore the setting. How: expand HISTSIZE inside quotes, redirect the result into the training file, then read it back. The redirect writes to your virtual filesystem only.",
          "Γιατί: Η αποθήκευση της αρχικής τιμής σού δίνει σημείο αναφοράς και τρόπο επαναφοράς της ρύθμισης. Πώς: κάνε expand το HISTSIZE μέσα σε εισαγωγικά, κατεύθυνε το αποτέλεσμα στο εκπαιδευτικό αρχείο και διάβασέ το ξανά. Η ανακατεύθυνση γράφει μόνο στο εικονικό σύστημα αρχείων σου.",
        ),
        (term) => term.flags.has("hist-save") && term.filesRead.some((path) => path.includes("histsize-before-change.txt")),
      ),
      task(
        "change-and-export",
        bi(
          "Set HISTSIZE=0 with no spaces around the equals sign, export it, and verify the value through env. This affects only the simulated shell.",
          "Όρισε HISTSIZE=0 χωρίς κενά γύρω από το ίσον, κάνε export και επαλήθευσε την τιμή με env. Η αλλαγή αφορά μόνο το εικονικό shell.",
        ),
        bi("HISTSIZE=0\nexport HISTSIZE\nenv | grep HISTSIZE", "HISTSIZE=0\nexport HISTSIZE\nenv | grep HISTSIZE"),
        bi(
          "Why: Assignment and export are separate steps: the first changes a shell value, and the second makes it available to child commands. How: write the assignment exactly, export the name, then inspect the environment. This does not erase existing history or persist after a new session.",
          "Γιατί: Η ανάθεση και το export είναι διαφορετικά βήματα· το πρώτο αλλάζει μια τιμή του shell και το δεύτερο τη διαθέτει στις child εντολές. Πώς: γράψε σωστά την ανάθεση, κάνε export το όνομα και έλεγξε το περιβάλλον. Η διαδικασία δεν διαγράφει παλιό ιστορικό ούτε διατηρείται μετά από νέα συνεδρία.",
        ),
        (term) => term.flags.has("histsize") && term.flags.has("export-hist") && usedCmd(term, /env\s*\|\s*grep\s+HISTSIZE/),
      ),
      task(
        "custom-variable",
        bi(
          "Create url_variable, display it with echo, remove it with unset, and verify the value is now empty. Then inspect the example startup file.",
          "Δημιούργησε τη url_variable, εμφάνισέ την με echo, αφαίρεσέ την με unset και επιβεβαίωσε ότι τώρα είναι κενή. Έπειτα έλεγξε το παράδειγμα startup file.",
        ),
        bi(
          'url_variable="gamehack.lab/"\necho "$url_variable"\nunset url_variable\necho "$url_variable"\necho \'export LAB_MODE=training\' >> /root/.bashrc\ncat /root/.bashrc',
          'url_variable="gamehack.lab/"\necho "$url_variable"\nunset url_variable\necho "$url_variable"\necho \'export LAB_MODE=training\' >> /root/.bashrc\ncat /root/.bashrc',
        ),
        bi(
          "Why: Naming, reading, exporting, and removing variables are separate shell operations. How: assign a value, expand it with echo, use unset, and compare the empty result; then inspect the virtual .bashrc example. Exporting alone is temporary, while a startup file is read by later interactive shells.",
          "Γιατί: Η ονομασία, η ανάγνωση, το export και η αφαίρεση μιας μεταβλητής είναι ξεχωριστές λειτουργίες του shell. Πώς: κάνε ανάθεση, εμφάνισε την τιμή με echo, χρησιμοποίησε unset και σύγκρινε το κενό αποτέλεσμα· στο τέλος έλεγξε το εικονικό παράδειγμα .bashrc. Το export μόνο του είναι προσωρινό, ενώ το startup file διαβάζεται από μελλοντικά διαδραστικά shells.",
        ),
        (term) => term.flags.has("url-var") && term.flags.has("unset") && term.filesRead.some((path) => path.endsWith("/.bashrc")),
      ),
    ],
    challenges: [
      {
        title: bi("Keep a reversible setting change", "Κράτησε αναστρέψιμη την αλλαγή ρύθμισης"),
        brief: bi(
          "Read the saved HISTSIZE file, compare it with the current value, and restore the original setting in the shell. Verify the result with env.",
          "Διάβασε το αποθηκευμένο αρχείο HISTSIZE, σύγκρινέ το με την τρέχουσα τιμή και επανάφερε την αρχική ρύθμιση στο shell. Επιβεβαίωσε το αποτέλεσμα με env.",
        ),
        success: bi("You changed and restored a setting without touching the host shell.", "Άλλαξες και επανέφερες μια ρύθμιση χωρίς να πειράξεις το shell του υπολογιστή σου."),
        check: (term) => term.filesRead.some((path) => path.includes("histsize-before-change.txt")) && usedCmd(term, /HISTSIZE=1000/) && usedCmd(term, /env/),
      },
      {
        title: bi("Leave a clear shell startup note", "Άφησε σαφή σημείωση εκκίνησης shell"),
        brief: bi(
          "Append one LAB_MODE export line to the virtual /root/.bashrc, then read the file and confirm the line appears once. Do not replace the file.",
          "Πρόσθεσε μία γραμμή export για το LAB_MODE στο εικονικό /root/.bashrc, έπειτα διάβασε το αρχείο και επιβεβαίωσε ότι η γραμμή εμφανίζεται μία φορά. Μην αντικαταστήσεις το αρχείο.",
        ),
        success: bi("You distinguished a session export from a startup-file setting.", "Ξεχώρισες το export της συνεδρίας από τη ρύθμιση startup file."),
        check: (term) => usedCmd(term, /LAB_MODE=training.*>>\s*\/root\/\.bashrc/) && term.filesRead.some((path) => path.endsWith("/.bashrc")),
      },
    ],
  },
];
