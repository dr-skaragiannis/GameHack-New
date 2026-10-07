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
          "ifconfig displays the network interfaces known to the system. In this lab, eth0 is a simulated wired interface and lo is the loopback interface used by the local machine to talk to itself. The output may include an IPv4 address (inet), a subnet mask (netmask), a broadcast address, the hardware address (ether/MAC), and whether the interface is up.\n\nRead the flags field as a quick health summary. The value 4163<UP,BROADCAST,RUNNING,MULTICAST> means the interface is administratively enabled, supports broadcast traffic, has an active link, and listens for multicast. When the interface goes down, UP and RUNNING clear and the number drops to a smaller value such as 4098, which is why re-running ifconfig after a down/up cycle is a useful verification step.\n\nThe RX and TX rows count received and transmitted packets plus their byte totals, followed by error counters. In a healthy lab capture every error and dropped counter reads 0; persistent RX errors point at the link or driver, while TX drops often mean the transmit queue overflowed. Loopback carries its own smaller counters because local traffic still passes through the networking stack.",
          "Η εντολή ifconfig εμφανίζει τις διεπαφές δικτύου που γνωρίζει το σύστημα. Στο εργαστήριο, το eth0 είναι μια εικονική ενσύρματη διεπαφή και το lo είναι η διεπαφή loopback, με την οποία ο υπολογιστής επικοινωνεί με τον εαυτό του. Στην έξοδο μπορείς να δεις τη διεύθυνση IPv4 (inet), τη μάσκα υποδικτύου (netmask), τη διεύθυνση broadcast, τη διεύθυνση υλικού (ether/MAC) και αν η διεπαφή είναι ενεργή.\n\nΗ νεότερη εντολή ip addr εμφανίζει παρόμοιες πληροφορίες και είναι η συνήθης επιλογή στις σύγχρονες διανομές Linux. Για μια πρώτη ανάγνωση, εντόπισε το eth0 και σύγκρινε τη διεύθυνση IPv4 με τη μάσκα. Το 127.0.0.1 ανήκει στο lo, δεν είναι διεύθυνση άλλου υπολογιστή στο δίκτυο.\n\nΔιάβασε το πεδίο flags ως γρήγορη σύνοψη κατάστασης. Η τιμή 4163<UP,BROADCAST,RUNNING,MULTICAST> δηλώνει ότι η διεπαφή είναι ενεργοποιημένη, υποστηρίζει broadcast, έχει ενεργή σύνδεση και ακούει multicast. Όταν η διεπαφή απενεργοποιηθεί, τα UP και RUNNING σβήνουν και ο αριθμός πέφτει, για παράδειγμα στο 4098, γι’ αυτό η επανάληψη της ifconfig μετά από κύκλο down/up αποτελεί χρήσιμο έλεγχο.\n\nΟι γραμμές RX και TX μετρούν τα ληφθέντα και τα απεσταλμένα πακέτα μαζί με τα bytes τους, και μετά τους μετρητές σφαλμάτων. Σε υγιή έξοδο όλοι οι μετρητές σφαλμάτων και dropped εμφανίζουν 0, ενώ μόνιμα σφάλματα RX δείχνουν πρόβλημα στη σύνδεση ή τον οδηγό και απώλειες TX υπερχείλιση της ουράς αποστολής. Το loopback έχει δικούς του μικρότερους μετρητές, επειδή και η τοπική κίνηση περνά από τη στοίβα δικτύου.",
        ),
        "ifconfig",
        [
          "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500",
          "        inet 10.10.10.2  netmask 255.255.255.0  broadcast 10.10.10.255",
          "        inet6 fe80::a00:27ff:fe12:3456  prefixlen 64",
          "        ether 08:00:27:12:34:56",
          "        RX packets 4821  bytes 612340 (597.9 KiB)",
          "        RX errors 0  dropped 0  overruns 0  frame 0",
          "        TX packets 3910  bytes 488120 (476.6 KiB)",
          "        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0",
          "lo: flags=73<UP,LOOPBACK,RUNNING> mtu 65536",
          "        inet 127.0.0.1  netmask 255.0.0.0",
          "        RX packets 214  bytes 18760 (18.3 KiB)",
          "        TX packets 214  bytes 18760 (18.3 KiB)",
        ],
      ),
      section(
        bi("iwconfig: inspect a wireless adapter", "iwconfig: έλεγχος ασύρματης διεπαφής"),
        bi(
          "iwconfig shows wireless-specific details such as the operating mode, the network name (ESSID), association state, and power-management settings. It is useful only for wireless devices; a wired interface such as eth0 normally reports that it has no wireless extensions.",
          "Η εντολή iwconfig εμφανίζει πληροφορίες που αφορούν ασύρματες συσκευές, όπως τη λειτουργία σύνδεσης, το όνομα δικτύου (ESSID), την κατάσταση σύνδεσης και τις ρυθμίσεις εξοικονόμησης ενέργειας. Είναι χρήσιμη μόνο για ασύρματες διεπαφές, μια ενσύρματη διεπαφή, όπως η eth0, συνήθως αναφέρει ότι δεν διαθέτει ασύρματες επεκτάσεις.\n\nΣτον προσομοιωτή υπάρχει ένα εικονικό wlan0, ώστε να μπορείς να διαβάσεις ένα παράδειγμα χωρίς πραγματικό ασύρματο προσαρμογέα. Αν σε πραγματικό σύστημα δεν εμφανίζεται ασύρματη συσκευή, αυτό δεν σημαίνει ότι η εντολή απέτυχε, πιθανότατα δεν υπάρχει διαθέσιμος κατάλληλος προσαρμογέας.",
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
        bi("Decode the wireless rows: mode, ESSID, and link quality", "Αποκωδικοποίηση ασύρματων γραμμών: mode, ESSID και ποιότητα σύνδεσης"),
        bi(
          "A wireless block starts with the standard and the network name: IEEE 802.11 with ESSID:off/any means no network is currently selected. Mode:Managed marks normal client operation, where the adapter joins an access point instead of acting as one; the lab row Access Point: Not-Associated confirms that no association exists yet, so no authentication or traffic has happened.\n\nThe remaining rows describe link policy rather than traffic. Retry short limit:7 caps fast retransmission attempts, RTS thr:off and Fragment thr:off keep handshake and fragmentation thresholds disabled, and Power Management:on lets the adapter sleep its radio to save energy. When a real adapter associates, these rows gain signal and link-quality readings; their absence here is itself information, because it matches the Not-Associated state. A configured adapter would add frequency, Tx-Power, and link-quality readings to the same block.\n\nSecurity testers also meet Mode:Monitor, in which an adapter captures nearby frames without joining a network. Monitor mode needs explicit support from the adapter, and the lab keeps wlan0 in Managed mode, so treat the lab block as a reading exercise: every row explains itself, and no row claims a connection that does not exist.",
          "Το ασύρματο μπλοκ ξεκινά με το πρότυπο και το όνομα δικτύου: το IEEE 802.11 με ESSID:off/any δηλώνει ότι δεν έχει επιλεγεί δίκτυο. Το Mode:Managed αντιστοιχεί στην κανονική λειτουργία πελάτη, όπου ο προσαρμογέας συνδέεται σε access point αντί να λειτουργεί ως access point, ενώ η γραμμή Access Point: Not-Associated επιβεβαιώνει ότι δεν υπάρχει σύνδεση ακόμη, άρα ούτε έλεγχος ταυτότητας ούτε κίνηση.\n\nΟι υπόλοιπες γραμμές περιγράφουν πολιτική σύνδεσης και όχι κίνηση. Το Retry short limit:7 ορίζει το όριο γρήγορων επαναλήψεων, τα RTS thr:off και Fragment thr:off αφήνουν ανενεργά τα κατώφλια χειραψίας και κατακερματισμού, και το Power Management:on επιτρέπει στον προσαρμογέα να αδρανοποιεί το ραδιόφωνο για εξοικονόμηση ενέργειας. Όταν πραγματικός προσαρμογέας συνδεθεί, οι γραμμές αποκτούν μετρήσεις σήματος και ποιότητας, η απουσία τους εδώ είναι πληροφορία, επειδή ταιριάζει με την κατάσταση Not-Associated. Ρυθμισμένος προσαρμογέας θα πρόσθετε στο ίδιο μπλοκ συχνότητα, Tx-Power και μετρήσεις ποιότητας σύνδεσης.\n\nΟι ελεγκτές ασφάλειας συναντούν επίσης το Mode:Monitor, στο οποίο ο προσαρμογέας συλλαμβάνει γειτονικά πλαίσια χωρίς να συνδέεται σε δίκτυο. Η λειτουργία monitor απαιτεί ρητή υποστήριξη από τον προσαρμογέα και το εργαστήριο κρατά το wlan0 σε Managed, οπότε αντιμετώπισε το μπλοκ ως άσκηση ανάγνωσης: κάθε γραμμή εξηγεί τον εαυτό της και καμία δεν ισχυρίζεται σύνδεση που δεν υπάρχει.",
        ),
        "iwconfig",
        [
          "…",
          "wlan0     IEEE 802.11  ESSID:off/any",
          "          Mode:Managed  Access Point: Not-Associated",
          "          Retry short limit:7   RTS thr:off   Fragment thr:off",
          "          Power Management:on",
        ],
      ),
      section(
        bi("Assign a temporary IPv4 address", "Προσωρινή διεύθυνση IPv4"),
        bi(
          "The classic form ifconfig eth0 10.10.10.13 assigns an address to eth0 in this simulated session. The modern equivalent is ip addr add 10.10.10.13/24 dev eth0; /24 describes the subnet size. Choose an address that belongs to the lab subnet and is not already assigned to another lab device.",
          "Η κλασική εντολή ifconfig eth0 10.10.10.13 εκχωρεί μια διεύθυνση στην eth0 για την τρέχουσα εικονική συνεδρία. Η νεότερη αντίστοιχη μορφή είναι ip addr add 10.10.10.13/24 dev eth0, το /24 περιγράφει το μέγεθος του υποδικτύου. Επίλεξε διεύθυνση που ανήκει στο υποδίκτυο του εργαστηρίου και δεν χρησιμοποιείται ήδη από άλλη εικονική συσκευή.\n\nΗ αλλαγή αυτή δεν είναι μόνιμη σε ένα συνηθισμένο Linux σύστημα, διαχειριστές δικτύου αποθηκεύουν μόνιμες ρυθμίσεις στον κατάλληλο διαχειριστή δικτύου. Εδώ αλλάζει μόνο η κατάσταση του eth0 μέσα στο προσωπικό sandbox και μπορείς να την ελέγξεις ξανά με ifconfig ή ip addr.",
        ),
        "ifconfig eth0 10.10.10.13",
        ["eth0 inet 10.10.10.13"],
      ),
      section(
        bi("A MAC address is not an identity check", "Η διεύθυνση MAC δεν αποδεικνύει ταυτότητα"),
        bi(
          "A MAC address identifies a network interface on its local link. Administrators sometimes set a locally administered address while testing hardware or network configuration. The lab example uses 02:00:00:00:00:13, a clearly fictional test value; the sequence is to bring the interface down, assign the value, then bring it up again.",
          "Η διεύθυνση MAC χαρακτηρίζει μια διεπαφή στο τοπικό τμήμα του δικτύου. Ένας διαχειριστής μπορεί να ορίσει τοπικά διαχειριζόμενη διεύθυνση κατά τη δοκιμή εξοπλισμού ή ρυθμίσεων. Το παράδειγμα του εργαστηρίου χρησιμοποιεί την καθαρά δοκιμαστική τιμή 02:00:00:00:00:13, η σειρά είναι να απενεργοποιήσεις τη διεπαφή, να ορίσεις τη νέα τιμή και έπειτα να την ενεργοποιήσεις ξανά.\n\nΗ αλλαγή διεύθυνσης MAC δεν σε κάνει ανώνυμο και δεν πρέπει να χρησιμοποιείται για παράκαμψη ελέγχων πρόσβασης. Σε πραγματικό δίκτυο ακολούθησε τις οδηγίες του διαχειριστή και κάνε τέτοιες δοκιμές μόνο σε εξοπλισμό που έχεις δικαίωμα να ρυθμίσεις. Στο GameHack οι εντολές μεταβάλλουν αποκλειστικά την εικονική eth0.",
        ),
      ),
      section(
        bi("dhclient: request a DHCP lease", "dhclient: αίτημα διεύθυνσης DHCP"),
        bi(
          "DHCP lets a client request network settings from a DHCP server. A lease can include an IP address, subnet, gateway, DNS resolver, and an expiry time. Run dhclient eth0 to request a lease for the named interface; a real client may need administrator privileges and an available DHCP server.\n\nBehind the four lab lines sits the four-message DHCP exchange: the client broadcasts DISCOVER, servers answer with OFFER, the client selects one with REQUEST, and the chosen server confirms with ACK. The lab shows Listening, DHCPREQUEST, the server's DHCPACK, and a bound to receipt because the outcome is what matters for the exercise. The renewal countdown, here 1800 seconds, tells the client when to ask again; an expired lease without renewal returns the address to the pool.",
          "Το DHCP επιτρέπει σε έναν υπολογιστή να ζητήσει ρυθμίσεις δικτύου από έναν DHCP server. Το lease μπορεί να περιλαμβάνει διεύθυνση IP, υποδίκτυο, gateway, DNS resolver και χρόνο λήξης. Με την εντολή dhclient eth0 ζητάς lease για τη συγκεκριμένη διεπαφή, σε πραγματικό σύστημα μπορεί να χρειάζονται δικαιώματα διαχειριστή και διαθέσιμος DHCP server.\n\nΣτο εργαστήριο η απάντηση είναι προκαθορισμένη και η eth0 παίρνει την εικονική διεύθυνση 10.10.10.42. Ένα lease μπορεί να αντικαταστήσει τη χειροκίνητη διεύθυνση που όρισες προηγουμένως, γι’ αυτό έλεγξε ξανά την κατάσταση με ifconfig ή ip addr.\n\nΠίσω από τις τέσσερις γραμμές του εργαστηρίου βρίσκεται η τετραπλή ανταλλαγή DHCP: ο πελάτης εκπέμπει DISCOVER, οι servers απαντούν με OFFER, ο πελάτης επιλέγει με REQUEST και ο επιλεγμένος server επιβεβαιώνει με ACK. Το εργαστήριο εμφανίζει Listening, DHCPREQUEST, το DHCPACK του server και απόδειξη bound to, επειδή το αποτέλεσμα μετρά για την άσκηση. Η αντίστροφη μέτρηση ανανέωσης, εδώ 1800 δευτερόλεπτα, δηλώνει πότε ο πελάτης θα ξαναζητήσει lease, ενώ ληγμένο lease χωρίς ανανέωση επιστρέφει τη διεύθυνση στη δεξαμενή.",
        ),
        "dhclient eth0",
        [
          "Listening on LPF/eth0",
          "DHCPREQUEST of 10.10.10.42 on eth0",
          "DHCPACK of 10.10.10.42 from 10.10.10.1",
          "bound to 10.10.10.42 -- renewal in 1800 seconds.",
        ],
      ),
      section(
        bi("dig: query A, MX, and NS records", "dig: ερωτήματα για εγγραφές A, MX και NS"),
        bi(
          "DNS translates names into records. With no record type, dig normally requests an A record, which maps a host name to an IPv4 address. MX records identify mail exchangers for a domain, while NS records identify its name servers. Try dig gamehack.lab, dig gamehack.lab MX, and dig gamehack.lab NS.\n\nRead the full answer block top to bottom. The header echoes the query, the QUESTION SECTION repeats the name and type you asked about, and the ANSWER SECTION carries the record with its time-to-live in seconds — 300 here, meaning resolvers may cache it for five minutes. The footer names the answering server, reports a 4 msec query time, and stamps WHEN the answer arrived with its message size.\n\nReverse lookups flip the question: dig -x 10.10.10.5 asks which name belongs to an address and the lab answers with a PTR record under the reversed in-addr.arpa name. Unknown lab addresses resolve to unknown.gamehack.lab, which is itself a useful result — it tells you the address has no fixture name instead of failing silently.\n\nOn MX rows, read the two fields after the type separately: the preference number (10 here) ranks exchangers when several exist, with lower values tried first, and the trailing-dot name is the fully qualified relay host. The trailing dot matters — it marks the name as complete, so resolvers never append search suffixes to it.",
          "Το DNS αντιστοιχίζει ονόματα σε εγγραφές. Αν δεν ορίσεις τύπο, η dig συνήθως ζητά εγγραφή A, η οποία συνδέει ένα όνομα με διεύθυνση IPv4. Οι εγγραφές MX δείχνουν τους mail exchangers ενός domain, ενώ οι NS δείχνουν τους name servers του. Δοκίμασε dig gamehack.lab, dig gamehack.lab MX και dig gamehack.lab NS.\n\nΣτην έξοδο, η ενότητα ANSWER SECTION περιέχει τις εγγραφές που επέστρεψε ο resolver. Οι απαντήσεις του GameHack είναι εικονικές και περιορίζονται στα ονόματα του εργαστηρίου, δεν γίνεται ερώτημα σε δημόσιο domain ούτε αποστέλλεται κίνηση στο Internet.\n\nΔιάβασε το πλήρες μπλοκ από πάνω προς τα κάτω. Η επικεφαλίδα επαναλαμβάνει το ερώτημα, η ενότητα QUESTION SECTION επαναλαμβάνει το όνομα και τον τύπο που ζήτησες, και η ANSWER SECTION φέρνει την εγγραφή με τον χρόνο ζωής της σε δευτερόλεπτα, εδώ 300, που δηλώνει ότι οι resolvers μπορούν να την κρατήσουν για πέντε λεπτά. Το υποσέλιδο αναφέρει τον server που απάντησε, εμφανίζει χρόνο ερωτήματος 4 msec και καταγράφει πότε έφτασε η απάντηση (WHEN) μαζί με το μέγεθος μηνύματος.\n\nΟι αντίστροφες αναζητήσεις αντιστρέφουν το ερώτημα: η dig -x 10.10.10.5 ρωτά ποιο όνομα αντιστοιχεί σε μια διεύθυνση και το εργαστήριο απαντά με εγγραφή PTR κάτω από το αντεστραμμένο όνομα in-addr.arpa. Άγνωστες διευθύνσεις του εργαστηρίου επιστρέφουν unknown.gamehack.lab, αποτέλεσμα εξίσου χρήσιμο, επειδή δηλώνει ότι η διεύθυνση δεν έχει όνομα δοκιμής αντί να αποτύχει σιωπηλά.\n\nΣτις γραμμές MX, διάβασε χωριστά τα δύο πεδία μετά τον τύπο: ο αριθμός προτίμησης (εδώ 10) κατατάσσει τους exchangers όταν υπάρχουν περισσότεροι, με τις μικρότερες τιμές να δοκιμάζονται πρώτες, και το όνομα με τελική τελεία είναι ο πλήρης host αναμετάδοσης. Η τελική τελεία έχει σημασία, δηλώνει πλήρες όνομα, οπότε οι resolvers δεν προσθέτουν ποτέ επιθήματα αναζήτησης.",
        ),
        "dig gamehack.lab MX",
        [
          "; <<>> DiG (simulated) <<>> gamehack.lab MX",
          ";; QUESTION SECTION:",
          ";gamehack.lab.\t\t\tIN\tMX",
          ";; ANSWER SECTION:",
          "gamehack.lab.    300 IN MX 10 mail.gamehack.lab.",
          ";; Query time: 4 msec",
          ";; SERVER: 10.10.10.53#53",
          ";; WHEN: Wed Oct 07 09:00:00 UTC 2026",
          ";; MSG SIZE  rcvd: 78",
        ],
      ),
      section(
        bi("/etc/resolv.conf: choose a resolver", "/etc/resolv.conf: επιλογή DNS resolver"),
        bi(
          "The file /etc/resolv.conf lists DNS resolver addresses. A line such as nameserver 10.10.10.53 tells the resolver library where to send name queries. In this sandbox, 10.10.10.53 is a fictional lab resolver; a public resolver address is not needed for the exercises.\n\nLarger setups add keywords beyond nameserver: search appends fallback suffixes to short host names, domain sets the local domain, and options tunes timeouts and attempts. The lab needs none of them because every fixture name is already complete, but recognizing these keywords keeps you from misreading a resolver file that uses them.",
          "Το αρχείο /etc/resolv.conf περιέχει τις διευθύνσεις των DNS resolvers. Μια γραμμή όπως nameserver 10.10.10.53 δηλώνει πού θα σταλούν τα ερωτήματα ονομάτων. Στο sandbox η 10.10.10.53 είναι εικονικός resolver του εργαστηρίου, οι ασκήσεις δεν χρειάζονται δημόσια διεύθυνση DNS.\n\nΗ εντολή echo \"nameserver 10.10.10.53\" > /etc/resolv.conf αντικαθιστά το περιεχόμενο του αρχείου. Το σύμβολο > γράφει από την αρχή, ενώ το >> προσθέτει γραμμές. Σε πραγματικό σύστημα ο διαχειριστής δικτύου μπορεί να ξαναγράψει αυτό το αρχείο, γι’ αυτό έλεγξε ποιος διαχειρίζεται τη ρύθμιση πριν την αλλάξεις.\n\nΜεγαλύτερες εγκαταστάσεις προσθέτουν λέξεις-κλειδιά πέρα από το nameserver: το search συμπληρώνει επιθήματα σε σύντομα ονόματα, το domain ορίζει το τοπικό domain και το options ρυθμίζει χρονικά όρια και επαναλήψεις. Το εργαστήριο δεν τα χρειάζεται, επειδή κάθε όνομα δοκιμής είναι ήδη πλήρες, αλλά η αναγνώρισή τους σε εμποδίζει να παρανοήσεις αρχείο resolver που τα χρησιμοποιεί.",
        ),
        'echo "nameserver 10.10.10.53" > /etc/resolv.conf',
        [""],
      ),
      section(
        bi("/etc/hosts: a local name table", "/etc/hosts: τοπικός πίνακας ονομάτων"),
        bi(
          "The file /etc/hosts stores static name-to-address entries for one machine. A line contains an address followed by one or more names, for example 10.10.10.30 docs.gamehack.lab. This mapping affects name resolution on the local machine; it does not publish a record to DNS.\n\nRead the fixture rows as a small map. The 127.0.0.1 localhost row keeps the machine talking to itself, 127.0.1.1 kali follows the Debian convention of pairing the machine name with loopback, and 192.168.0.11 ubuntu.lab keeps a second fictional host reachable by name. Matching is first-match-wins from the top, so your appended docs line must not duplicate an earlier mapping for the same name — duplicates resolve to the upper row and hide the lower one.",
          "Το αρχείο /etc/hosts αποθηκεύει στατικές αντιστοιχίσεις ονομάτων και διευθύνσεων για έναν υπολογιστή. Μια γραμμή περιέχει πρώτα τη διεύθυνση και έπειτα ένα ή περισσότερα ονόματα, για παράδειγμα 10.10.10.30 docs.gamehack.lab. Η αντιστοίχιση επηρεάζει την επίλυση ονομάτων μόνο στον συγκεκριμένο υπολογιστή, δεν δημοσιεύει εγγραφή DNS.\n\nΗ nano /etc/hosts ανοίγει το αρχείο στον εικονικό προβολέα κειμένου του εργαστηρίου, ενώ η cat το εμφανίζει στο τερματικό. Για να προσθέσεις με ασφάλεια ένα δοκιμαστικό alias μέσα στο VFS, μπορείς να χρησιμοποιήσεις echo \"10.10.10.30 docs.gamehack.lab\" >> /etc/hosts και μετά να επιβεβαιώσεις τη γραμμή με grep.\n\nΔιάβασε τις γραμμές ως μικρό χάρτη. Η γραμμή 127.0.0.1 localhost κρατά τον υπολογιστή σε επικοινωνία με τον εαυτό του, η 127.0.1.1 kali ακολουθεί τη συνήθεια του Debian να ζευγαρώνει το όνομα μηχανήματος με loopback, και η 192.168.0.11 ubuntu.lab κρατά δεύτερο εικονικό host προσβάσιμο με όνομα. Η αντιστοίχιση κερδίζεται από την πρώτη γραμμή από πάνω, οπότε η δική σου γραμμή docs δεν πρέπει να διπλασιάζει προηγούμενη αντιστοίχιση του ίδιου ονόματος, γιατί τα διπλότυπα επιλύονται στην επάνω γραμμή και κρύβουν την κάτω.",
        ),
        "cat /etc/hosts",
        [
          "127.0.0.1 localhost",
          "127.0.1.1 kali",
          "10.10.10.8 gamehack.lab www.gamehack.lab",
          "192.168.0.11 ubuntu.lab",
          "10.10.10.30 docs.gamehack.lab",
        ],
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
      { cmd: "dig -x ADDRESS", desc: bi("Reverse lookup: name for an IP", "Αντίστροφη αναζήτηση: όνομα για IP") },
      { cmd: "ip route", desc: bi("Show the virtual default gateway", "Προβολή εικονικού default gateway") },
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
          "Γιατί: Οι στατικές ρυθμίσεις βοηθούν να καταλάβεις τη διεπαφή, ενώ το DHCP δείχνει πώς ένας υπολογιστής παίρνει αυτόματα ένα lease. Πώς: κάνε τις προσωρινές αλλαγές μόνο στην εικονική eth0, ενεργοποίησε ξανά τη σύνδεση και ζήτησε DHCP. Η τελική διεύθυνση δίνεται από τον προσομοιωτή.",
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
          "Γιατί: Κάθε τύπος εγγραφής DNS απαντά σε διαφορετικό ερώτημα για ένα domain. Πώς: διάβασε τη διεύθυνση της A, τον mail exchanger της MX και τον name server της NS, κράτησε τα ερωτήματα στο domain του εργαστηρίου. Η εγγραφή είναι πληροφορία επίλυσης ονόματος, όχι άδεια σύνδεσης ή σάρωσης του host.",
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
          "Γιατί: το resolv.conf επιλέγει resolver, ενώ το hosts κρατά τοπικές στατικές αντιστοιχίσεις, τα δύο αρχεία εξυπηρετούν διαφορετικές ανάγκες επίλυσης ονομάτων. Πώς: χρησιμοποίησε > μόνο στο αρχείο resolver που θέλεις να αντικαταστήσεις, >> για να διατηρήσεις τις υπάρχουσες εγγραφές hosts και διάβασε και τα δύο αρχεία για επαλήθευση. Οι αλλαγές μένουν στο προσωπικό VFS.",
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
        bi("ps with no flags: your own shell processes", "ps χωρίς ορίσματα: οι διεργασίες του shell σου"),
        bi(
          "Bare ps answers a narrow question: which processes are attached to this terminal right now. The lab prints a PID column, the terminal name (TTY), the CPU TIME each process has consumed, and the CMD name. Because the listing is small, it is the fastest way to confirm that your shell session sees the expected processes before you widen the view.\n\nRead the lab rows literally. PID 1 is init, the first process; sshd keeps the virtual remote-access service; msfconsole is an interactive console attached to pts/0; and [zombie-lab] is a finished process whose parent has not collected its exit status. Square brackets around a name mark a kernel thread or a special state rather than an ordinary user program.\n\nA TIME of 00:00:00 means the process has consumed less than a second of CPU, which is normal for idle daemons. Compare this short listing with ps aux in the next section: anything missing here but present there belongs to another session or runs detached from any terminal.",
          "Η σκέτη ps απαντά σε στενό ερώτημα: ποιες διεργασίες συνδέονται με αυτό το τερματικό τώρα. Το εργαστήριο εμφανίζει στήλη PID, το όνομα τερματικού (TTY), τον χρόνο CPU (TIME) που έχει καταναλώσει κάθε διεργασία και το όνομα CMD. Επειδή η λίστα είναι μικρή, αποτελεί τον ταχύτερο τρόπο να επιβεβαιώσεις ότι η συνεδρία σου βλέπει τις αναμενόμενες διεργασίες πριν διευρύνεις την προβολή.\n\nΔιάβασε τις γραμμές του εργαστηρίου κατά γράμμα. Το PID 1 είναι το init, η πρώτη διεργασία, το sshd κρατά την εικονική υπηρεσία απομακρυσμένης πρόσβασης, το msfconsole είναι διαδραστική κονσόλα στο pts/0 και το [zombie-lab] είναι τερματισμένη διεργασία που ο γονέας της δεν έχει συλλέξει ακόμη. Οι αγκύλες γύρω από όνομα δηλώνουν νήμα πυρήνα ή ειδική κατάσταση και όχι συνηθισμένο πρόγραμμα χρήστη.\n\nΤο TIME 00:00:00 δηλώνει ότι η διεργασία έχει καταναλώσει λιγότερο από ένα δευτερόλεπτο CPU, φυσιολογικό για αδρανείς δαίμονες. Σύγκρινε τη σύντομη λίστα με την ps aux της επόμενης ενότητας: ό,τι λείπει από εδώ αλλά υπάρχει εκεί ανήκει σε άλλη συνεδρία ή εκτελείται αποσυνδεδεμένο από τερματικό.",
        ),
        "ps",
        [
          "  PID TTY          TIME CMD",
          " 1 ?        00:00:00 /sbin/init",
          " 412 ?        00:00:00 sshd",
          " 880 pts/0    00:00:00 msfconsole",
          " 4378 ?        00:00:00 [zombie-lab]",
        ],
      ),
      section(
        bi("ps: inspect a process snapshot", "ps: στιγμιότυπο διεργασιών"),
        bi(
          "A process is a running instance of a program. It has a process ID (PID), a user, a state, and resource measurements. ps gives you a snapshot of processes associated with your terminal; ps aux is a common BSD-style form that shows processes across users together with CPU, memory, and command columns.\n\nThe wider columns repay a slower reading. VSZ is the virtual memory set claimed by the process while RSS counts the resident pages actually held in RAM, so VSZ is always the larger figure. TTY names the controlling terminal, with ? marking daemons detached from any terminal; STAT compresses the process state into letters; START records when the process began; and TIME totals the CPU consumed since then.",
          "Διεργασία είναι ένα πρόγραμμα που εκτελείται εκείνη τη στιγμή. Έχει αναγνωριστικό διεργασίας (PID), χρήστη, κατάσταση και μετρήσεις πόρων. Η ps δίνει στιγμιότυπο διεργασιών που σχετίζονται με το τερματικό σου, η συνηθισμένη μορφή ps aux εμφανίζει διεργασίες όλων των χρηστών μαζί με στήλες CPU, μνήμης και εντολής.\n\nΤο PID είναι χρήσιμο όταν θέλεις να ελέγξεις ή να επηρεάσεις μία συγκεκριμένη διεργασία. Μην βασίζεσαι μόνο στο όνομα: έλεγξε ολόκληρη τη γραμμή και τον χρήστη, επειδή δύο διεργασίες μπορεί να έχουν παρόμοια ονόματα.\n\nΟι ευρύτερες στήλες αξίζουν πιο αργή ανάγνωση. Το VSZ είναι η εικονική μνήμη που διεκδικεί η διεργασία, ενώ το RSS μετρά τις σελίδες που βρίσκονται πραγματικά στη RAM, γι’ αυτό το VSZ είναι πάντα μεγαλύτερο. Το TTY δηλώνει το τερματικό ελέγχου, με το ? να αντιστοιχεί σε δαίμονες χωρίς τερματικό, το STAT συμπυκνώνει την κατάσταση σε γράμματα, το START καταγράφει πότε ξεκίνησε η διεργασία και το TIME το σύνολο CPU που κατανάλωσε από τότε.",
        ),
        "ps aux",
        [
          "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT  START   TIME COMMAND",
          "root      7440  0.4  0.2    7442  1229 ?        S    09:00  0:00 training-worker --batch",
          "root      7441  0.1  0.1    3753   614 ?        S    09:00  0:00 training-reporter",
          "…",
          "root      9001  0.0  0.2    7451  1229 ?        S    09:00  0:00 cron",
        ],
      ),
      section(
        bi("Filter a process list with grep", "Φιλτράρισμα λίστας διεργασιών με grep"),
        bi(
          "A pipe sends the output of one command to the input of another. ps aux | grep training-worker asks grep to print only process-list lines that contain that name, which is easier to read than scanning every row by eye.",
          "Το pipe στέλνει την έξοδο μιας εντολής στην είσοδο της επόμενης. Με το ps aux | grep training-worker ζητάς από το grep να εμφανίσει μόνο τις γραμμές της λίστας που περιέχουν αυτό το όνομα, έτσι δεν χρειάζεται να ψάχνεις μία προς μία όλες τις εγγραφές.\n\nΣε πραγματικό shell, η ίδια αναζήτηση μπορεί να εμφανίσει και την ίδια την εντολή grep, επειδή συμμετέχει επίσης στη λίστα διεργασιών. Για γρήγορη διερεύνηση αυτό είναι αναμενόμενο, επιβεβαίωσε το PID και την πλήρη εντολή πριν ενεργήσεις.",
        ),
        "ps aux | grep training-worker",
        ["root      7440  0.4  0.2    7442  1229 ?        S    09:00  0:00 training-worker --batch"],
      ),
      section(
        bi("Decode the STAT codes", "Αποκωδικοποίηση των κωδικών STAT"),
        bi(
          "The STAT column compresses a process state into one letter plus modifiers. R marks a runnable process, S an interruptible sleeper waiting on an event, D an uninterruptible sleeper inside a device call, T a stopped process, and Z a zombie that already exited while its parent has not collected the status. Read Z as bookkeeping debt, not as a running program.\n\nExtra letters refine the picture: < flags high scheduling priority, N low priority, s a session leader, l a multithreaded process, and + a foreground process group. In the lab, init shows Ss because it leads its session, reniced workers gain N, and [zombie-lab] shows a bare Z. When you pipe ps aux into grep, the STAT letter travels with the row, so you can classify a match without re-running the full listing.",
          "Η στήλη STAT συμπυκνώνει την κατάσταση διεργασίας σε ένα γράμμα με τροποποιητές. Το R δηλώνει εκτελέσιμη διεργασία, το S ύπνο που διακόπτεται εν αναμονή γεγονότος, το D ύπνο χωρίς διακοπή μέσα σε κλήση συσκευής, το T σταματημένη διεργασία και το Z zombie που έχει ήδη τερματίσει ενώ ο γονέας δεν έχει συλλέξει την κατάσταση. Διάβασε το Z ως εκκρεμή λογιστική εγγραφή και όχι ως εκτελούμενο πρόγραμμα.\n\nΤα επιπλέον γράμματα εξειδικεύουν την εικόνα: το < δηλώνει υψηλή προτεραιότητα scheduler, το N χαμηλή, το s επικεφαλής συνεδρίας, το l πολυνηματική διεργασία και το + ομάδα προσκηνίου. Στο εργαστήριο το init εμφανίζει Ss επειδή ηγείται της συνεδρίας του, οι workers με renice αποκτούν N και το [zombie-lab] εμφανίζει σκέτο Z. Όταν περνάς την ps aux σε grep, το γράμμα STAT ταξιδεύει μαζί με τη γραμμή, οπότε ταξινομείς το αποτέλεσμα χωρίς να ξανατρέξεις όλη τη λίστα.",
        ),
        "ps aux | grep zombie",
        ["root      4378  8.4  6.2  228571 38093 ?        Z    09:00  0:08 [zombie-lab]"],
      ),
      section(
        bi("top: compare resource use", "top: σύγκριση χρήσης πόρων"),
        bi(
          "top normally shows a live summary of uptime and load, task states, CPU and memory/swap use, followed by a process table. The rows are usually ordered by resource use, so compare the %CPU and %MEM columns to see which processes are busiest; those figures describe a moment, not a diagnosis.\n\nThe process columns extend the ps vocabulary. PR is the kernel scheduling priority, NI the niceness you can tune, VIRT the claimed virtual memory, RES the resident subset, SHR the shareable portion, and S the single-letter state. The load average trio covers the last 1, 5, and 15 minutes, while the %Cpu line splits time into user (us), system (sy), niced (ni), and idle (id); a high id with busy-looking rows means the snapshot caught short bursts, not sustained load.",
          "Η εντολή top εμφανίζει συνήθως μια ζωντανή σύνοψη με τον χρόνο λειτουργίας και το load average, τις καταστάσεις των εργασιών, τη χρήση CPU και μνήμης/swap και, στη συνέχεια, έναν πίνακα διεργασιών. Οι γραμμές ταξινομούνται συνήθως με βάση τη χρήση πόρων, ώστε να συγκρίνεις τις στήλες %CPU και %MEM και να εντοπίσεις τις πιο απασχολημένες διεργασίες, τα ποσοστά περιγράφουν μια στιγμή, δεν εξηγούν από μόνα τους την αιτία.\n\nΣε πραγματικό τερματικό, πάτησε q για έξοδο από τη ζωντανή προβολή. Το GameHack δείχνει ένα σταθερό, εικονικό στιγμιότυπο και επιστρέφει αμέσως στο prompt, δεν παρακολουθεί ούτε επηρεάζει διεργασίες του υπολογιστή σου.\n\nΟι στήλες διεργασιών επεκτείνουν το λεξιλόγιο της ps. Το PR είναι η προτεραιότητα του πυρήνα, το NI το niceness που μπορείς να ρυθμίσεις, το VIRT η διεκδικούμενη εικονική μνήμη, το RES το παραμένον υποσύνολο, το SHR το κοινόχρηστο τμήμα και το S η κατάσταση σε ένα γράμμα. Η τριάδα load average καλύπτει τα τελευταία 1, 5 και 15 λεπτά, ενώ η γραμμή %Cpu κατανέμει τον χρόνο σε χρήστη (us), σύστημα (sy), niced (ni) και αδράνεια (id), υψηλό id με φαινομενικά απασχολημένες γραμμές δηλώνει σύντομες ριπές και όχι παρατεταμένο φόρτο.",
        ),
        "top",
        [
          "top - 09:00:00 up 2 days, 1 user, load average: 0.04, 0.08, 0.09 — GameHack virtual snapshot",
          "Tasks: 9 total, 1 running, 7 sleeping, 0 stopped, 1 zombie",
          "%Cpu(s): 2.1 us, 0.7 sy, 0.0 ni, 97.2 id",
          "MiB Mem : 1024.0 total, 384.0 used, 512.0 free, 128.0 buff/cache",
          "MiB Swap: 0.0 total, 0.0 used, 0.0 free",
          "PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND",
          " 4378 root     20  5  223M  37M 12M Z  8.4  6.2 0:08.68 [zombie-lab]",
          "  880 root     20  0   76M  13M  4M R  1.2  2.1 0:01.50 msfconsole",
          " 7440 root     20  0    7M   1M 410K S  0.4  0.2 0:00.80 training-worker --batch",
          "…",
        ],
      ),
      section(
        bi("nice and renice: set scheduling niceness", "nice και renice: ρύθμιση προτεραιότητας scheduler"),
        bi(
          "nice starts a command with a chosen niceness; renice changes the niceness of a process that already exists. Linux values range from -20 (highest scheduling priority) to 19 (lowest). A more positive value gives a process a smaller share of CPU when other work competes; a negative value raises its priority and may require administrator privileges.\n\nTreat renice values as absolute targets, not increments: renice 10 7440 sets niceness to exactly 10 whatever it was before, and the lab answers with an old/new receipt line. Negative values such as nice -n -10 raise priority above normal and require root; the GameHack shell runs as root, so the simulator accepts the full -20 to 19 range while the lesson demo stays with the polite value 10.",
          "Η nice ξεκινά εντολή με συγκεκριμένη τιμή niceness, ενώ η renice αλλάζει την τιμή μιας διεργασίας που εκτελείται ήδη. Στο Linux οι τιμές κυμαίνονται από -20 (υψηλότερη προτεραιότητα scheduler) έως 19 (χαμηλότερη). Μια πιο θετική τιμή περιορίζει το μερίδιο CPU όταν ανταγωνίζονται άλλες εργασίες, μια αρνητική τιμή αυξάνει την προτεραιότητα και μπορεί να απαιτεί δικαιώματα διαχειριστή.\n\nΓια παράδειγμα, το nice -n 10 /usr/bin/ssh-agent ξεκινά την εικονική εντολή με χαμηλότερη προτεραιότητα από την προεπιλογή. Το renice 10 7440 ορίζει την απόλυτη τιμή 10 για το PID 7440. Σε αντίθεση με τη nice, η renice δεν προσθέτει προσαύξηση στην παλιά τιμή.\n\nΑντιμετώπισε τις τιμές renice ως απόλυτους στόχους και όχι προσαυξήσεις: το renice 10 7440 ορίζει niceness ακριβώς 10 όποια κι αν ήταν πριν, και το εργαστήριο απαντά με γραμμή απόδειξης παλιάς/νέας τιμής. Αρνητικές τιμές όπως το nice -n -10 ανεβάζουν την προτεραιότητα πάνω από το κανονικό και απαιτούν root, το shell του GameHack εκτελείται ως root, οπότε ο προσομοιωτής δέχεται όλο το εύρος -20 έως 19, ενώ η επίδειξη του μαθήματος μένει στην ευγενική τιμή 10.",
        ),
        "renice 10 7440",
        ["7440 (process ID) old priority 0, new priority 10"],
      ),
      section(
        bi("kill sends a signal; it does not erase resources", "Το kill στέλνει σήμα, δεν «σβήνει» πόρους"),
        bi(
          "kill sends a signal to a PID. SIGTERM (15) asks a program to stop and gives it a chance to save work and clean up. SIGHUP (1) traditionally means that a terminal or connection went away; some programs use it to reload configuration, so it is not a universal gentle-stop command.\n\nLearn the numbers by pair: 1 (HUP) asks for reload-or-release, 2 (INT) is the keyboard-interrupt equivalent, 15 (TERM) is the polite default when you name no signal, and 9 (KILL) ends the process without cleanup and cannot be caught or ignored. The lab accepts names with or without the SIG prefix, so kill -TERM 7440 and kill -15 7440 do the same thing; prefer the explicit form in notes so the reader never guesses which signal you meant.",
          "Η kill στέλνει σήμα σε ένα PID. Το SIGTERM (15) ζητά από το πρόγραμμα να σταματήσει και του δίνει χρόνο να αποθηκεύσει εργασία και να καθαρίσει πόρους. Το SIGHUP (1) σήμαινε παραδοσιακά ότι χάθηκε το τερματικό ή η σύνδεση, ορισμένα προγράμματα το χρησιμοποιούν για επαναφόρτωση ρυθμίσεων, άρα δεν είναι καθολική εντολή ήπιου τερματισμού.\n\nΤο SIGKILL (9) τερματίζει αναγκαστικά τη διεργασία και δεν της δίνει χρόνο για καθαρισμό. Χρησιμοποίησέ το μόνο όταν έχει προηγηθεί έλεγχος του PID και η κανονική διακοπή δεν πέτυχε. Μια zombie διεργασία έχει ήδη τερματίσει και περιμένει από τη γονική διεργασία να συλλέξει την κατάστασή της, το kill δεν διορθώνει από μόνο του αυτή την κατάσταση.\n\nΜάθε τους αριθμούς κατά ζεύγη: το 1 (HUP) ζητά επαναφόρτωση ή αποδέσμευση, το 2 (INT) αντιστοιχεί στη διακοπή πληκτρολογίου, το 15 (TERM) είναι η ευγενική προεπιλογή όταν δεν ονομάζεις σήμα, και το 9 (KILL) τερματίζει χωρίς καθαρισμό και δεν παγιδεύεται ούτε αγνοείται. Το εργαστήριο δέχεται ονόματα με ή χωρίς το πρόθεμα SIG, οπότε τα kill -TERM 7440 και kill -15 7440 κάνουν το ίδιο πράγμα, προτίμησε την αναλυτική μορφή στις σημειώσεις ώστε να μη μαντεύει κανείς ποιο σήμα εννοούσες.",
        ),
        "kill -TERM 7440",
        ["sent SIGTERM to 7440; process stopped (simulated)."],
      ),
      section(
        bi("Background jobs: &, jobs, and fg", "Εργασίες παρασκηνίου: &, jobs και fg"),
        bi(
          "Appending & to a command asks the shell to run it in the background, so the prompt is available for another command. jobs lists the background jobs known to the current shell; it is different from ps, which reports processes more broadly.\n\nThe jobs listing marks the current job with + and the previous job with -, while older jobs carry a blank; fg with no argument resumes the + job. Explicit specs remove the guesswork: fg %1 names a job number, fg %- the previous job, and fg %+ or fg %% the current one. An unknown spec answers fg: %9: no such job and changes nothing, so re-list with jobs before retrying.",
          "Όταν προσθέτεις & στο τέλος μιας εντολής, ζητάς από το shell να την εκτελέσει στο παρασκήνιο ώστε να μπορείς να συνεχίσεις στο prompt. Η jobs εμφανίζει τις εργασίες παρασκηνίου που γνωρίζει το τρέχον shell, διαφέρει από την ps, η οποία παρουσιάζει διεργασίες γενικότερα.\n\nΗ fg επαναφέρει μια εργασία στο προσκήνιο για να συνεχίσεις την αλληλεπίδραση. Στο GameHack μπορείς να δοκιμάσεις nano /root/linux-beginners-2/processes/notes.txt & και μετά jobs και fg. Ο εικονικός editor δεν ξεκινά πραγματικό πρόγραμμα στον υπολογιστή σου.\n\nΗ λίστα jobs σημειώνει την τρέχουσα εργασία με + και την προηγούμενη με -, ενώ οι παλαιότερες φέρουν κενό, η σκέτη fg συνεχίζει την εργασία +. Οι ρητοί προσδιοριστές αφαιρούν την αμφιβολία: το fg %1 ονομάζει αριθμό εργασίας, το fg %- την προηγούμενη και τα fg %+ ή fg %% την τρέχουσα. Άγνωστος προσδιοριστής απαντά fg: %9: no such job χωρίς αλλαγή, γι’ αυτό ξανατρέξε jobs πριν ξαναδοκιμάσεις.",
        ),
        "nano /root/linux-beginners-2/processes/notes.txt &",
        [
          "[1] 7100",
          "(simulated editor preview) /root/linux-beginners-2/processes/notes.txt",
          "Training editor fixture. No host process is started.",
          "",
          "Use supported VFS redirection commands to save changes.",
        ],
      ),
      section(
        bi("at for one time; cron for repeated work", "at για μία φορά, cron για επανάληψη"),
        bi(
          "The at command queues one command for a single future run. In a real interactive shell, `at 21:30` opens an input prompt and Ctrl-D closes it. In this lab you can either use `at 21:30 /root/scanning_script.sh` or enter `at 21:30` followed by the script path on the next line; the simulator queues that one line and returns to the prompt. The queue is only a VFS-backed training record: nothing is launched later on the host.\n\nThe receipt line is your confirmation: job 1 queued for 21:30 names the queue entry the simulator recorded. In the interactive form, typing Ctrl-D on the prompt line cancels instead of queueing, which mirrors how a real shell aborts the entry. Keep the two schedulers apart in your notes: at fires once and forgets, while a crontab line re-arms itself every time its five time fields match.",
          "Η εντολή at προγραμματίζει μία εντολή για μία μελλοντική εκτέλεση. Σε πραγματικό διαδραστικό shell, η `at 21:30` ανοίγει prompt και το Ctrl-D ολοκληρώνει την καταχώριση. Εδώ μπορείς είτε να γράψεις `at 21:30 /root/scanning_script.sh` είτε να δώσεις πρώτα `at 21:30` και τη διαδρομή του script στην επόμενη γραμμή, ο προσομοιωτής αποθηκεύει αυτή τη μία γραμμή και επιστρέφει στο prompt. Η ουρά είναι μόνο εγγραφή εκπαίδευσης στο VFS, καμία εντολή δεν θα εκτελεστεί αργότερα στον υπολογιστή σου.\n\nΤο cron προορίζεται για επαναλαμβανόμενες εργασίες. Η `crontab -l` εμφανίζει τον πίνακα του χρήστη, ενώ η `crontab -e` ανοίγει τον εικονικό editor. Στο GameHack μπορείς επίσης να προσθέσεις μία γραμμή με `echo \"30 21 * * * /root/scanning_script.sh\" | crontab -` και να την επαληθεύσεις με `crontab -l`, το σύστημα καταγράφει το χρονοπρόγραμμα, δεν εκτελεί το script.\n\nΗ γραμμή απόδειξης είναι η επιβεβαίωσή σου: το job 1 queued for 21:30 ονομάζει την εγγραφή που κατέγραψε ο προσομοιωτής. Στη διαδραστική μορφή, το Ctrl-D στη γραμμή prompt ακυρώνει αντί να καταχωρίσει, όπως το πραγματικό shell ματαιώνει την καταχώριση. Κράτησε τους δύο χρονοπρογραμματιστές χωριστά στις σημειώσεις: το at εκτελείται μία φορά και ξεχνιέται, ενώ η γραμμή crontab οπλίζει ξανά κάθε φορά που τα πέντε χρονικά πεδία της ταιριάζουν.",
        ),
        "at 21:30 /root/scanning_script.sh\ncrontab -l",
        [
          "job 1 queued for 21:30: /root/scanning_script.sh (simulated; not executed)",
          "# m h dom mon dow command",
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
          "Εκτέλεσε ps και ps aux και έπειτα φιλτράρισε τον πίνακα για το training-worker με grep. Διάβασε το PID και ολόκληρη την εντολή πριν επιχειρήσεις αλλαγή.",
        ),
        bi("ps\nps aux\nps aux | grep training-worker", "ps\nps aux\nps aux | grep training-worker"),
        bi(
          "Why: A PID identifies one process instance, while a name can be reused by several programs. How: compare the user, PID, resource columns, and full command in ps aux, then use grep to narrow the output. These are fictional rows provided for practice.",
          "Γιατί: Το PID χαρακτηρίζει μία συγκεκριμένη διεργασία, ενώ το ίδιο όνομα μπορεί να χρησιμοποιείται από περισσότερα προγράμματα. Πώς: σύγκρινε χρήστη, PID, στήλες πόρων και πλήρη εντολή στην ps aux και έπειτα περιόρισε την έξοδο με grep. Οι εγγραφές είναι εικονικές.",
        ),
        (term) => term.flags.has("ps-aux") && term.flags.has("ps-grep"),
      ),
      task(
        "top-snapshot",
        bi(
          "Run top by itself. Read the summary lines and identify the process at the top of the resource-sorted table; compare its PID and command with ps aux.",
          "Εκτέλεσε την top μόνη της. Διάβασε τις γραμμές σύνοψης και εντόπισε τη διεργασία στην κορυφή του ταξινομημένου πίνακα, σύγκρινε το PID και την εντολή της με την ps aux.",
        ),
        bi("top", "top"),
        bi(
          "Why: A process snapshot can help you spot unusual CPU or memory use before you investigate further. How: inspect the summary, read the %CPU and %MEM columns, and verify the selected row with ps; the terminal returns to the prompt because this lab uses a fixed snapshot.",
          "Γιατί: Ένα στιγμιότυπο διεργασιών μπορεί να σε βοηθήσει να εντοπίσεις ασυνήθιστη χρήση CPU ή μνήμης πριν συνεχίσεις τη διερεύνηση. Πώς: διάβασε τη σύνοψη και τις στήλες %CPU και %MEM και επιβεβαίωσε τη γραμμή με την ps, το εργαστήριο επιστρέφει στο prompt επειδή χρησιμοποιεί σταθερό στιγμιότυπο.",
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
          "Γιατί: Η niceness βοηθά τον scheduler να μοιράζει την CPU όταν ανταγωνίζονται διεργασίες. Πώς: μια θετική τιμή μειώνει τη σχετική προτεραιότητα, η renice εφαρμόζει απόλυτη τιμή στο επιλεγμένο PID. Ο προσομοιωτής αλλάζει μόνο τον εικονικό πίνακα διεργασιών και δεν ξεκινά ssh-agent στον υπολογιστή σου.",
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
          "Γιατί: Τα σήματα επικοινωνούν με μια διεργασία, δεν είναι εναλλάξιμοι τρόποι διαγραφής της. Πώς: το SIGHUP δηλώνει απώλεια σύνδεσης, το SIGTERM ζητά κανονική έξοδο και το SIGKILL τερματίζει αναγκαστικά χωρίς καθαρισμό. Επιβεβαίωσε το PID και χρησιμοποίησε το ηπιότερο σήμα που ταιριάζει στην περίσταση.",
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
          "Γιατί: Οι εργασίες παρασκηνίου αφήνουν διαθέσιμο το prompt, ενώ οι schedulers αναλαμβάνουν εργασίες για αργότερα. Πώς: βάλε & για εργασία του shell, χρησιμοποίησε jobs για να τη βρεις και fg για να την επαναφέρεις, το at είναι εφάπαξ και το cron επαναλαμβανόμενο. Το sandbox καταγράφει και προβάλλει τις ενέργειες χωρίς να τις εκτελεί στο σύστημα υποδοχής.",
        ),
        (term) => term.flags.has("bg") && term.flags.has("jobs") && term.flags.has("fg") && term.flags.has("at") && term.flags.has("crontab-install") && term.flags.has("crontab"),
      ),
    ],
    challenges: [
      {
        title: bi("Locate the quiet training worker", "Εντόπισε την ήρεμη εκπαιδευτική διεργασία"),
        brief: bi(
          "Use ps aux and grep to find training-worker. Record its PID, then lower its priority with renice; do not signal it during this challenge.",
          "Χρησιμοποίησε ps aux και grep για να βρεις το training-worker. Σημείωσε το PID του και μείωσε την προτεραιότητά του με renice, μην του στείλεις σήμα σε αυτή την πρόκληση.",
        ),
        success: bi("You inspected a process before changing its scheduler setting.", "Έλεγξες τη διεργασία πριν αλλάξεις τη ρύθμιση του scheduler."),
        check: (term) => term.flags.has("ps-grep") && term.flags.has("renice"),
      },
      {
        title: bi("Compare one-time and recurring work", "Σύγκρινε εφάπαξ και επαναλαμβανόμενη εργασία"),
        brief: bi(
          "Read the schedule notes under /root/linux-beginners-2/processes, run at 21:30, and inspect the user's crontab. Both results should stay within the simulator.",
          "Διάβασε τις σημειώσεις προγραμματισμού στο /root/linux-beginners-2/processes, εκτέλεσε at 21:30 και έλεγξε το crontab του χρήστη. Και τα δύο αποτελέσματα πρέπει να μείνουν στον προσομοιωτή.",
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
          "A variable is a name paired with a value, such as HOME=/root. env lists environment variables that child processes can inherit. In Bash, set also shows shell variables and functions, so set may produce more output than env; pipe it to more for paging or to grep HISTSIZE to find one entry.\n\nTwo companions make the listing usable. Piping into more pages long output one screen at a time, while printenv HISTSIZE prints only the value 1000 without the NAME= prefix — handy when a script needs the raw value. Bare printenv with no argument lists the whole exported environment instead, so name the variable whenever you want exactly one answer.",
          "Μια μεταβλητή συνδέει ένα όνομα με μια τιμή, όπως HOME=/root. Η env εμφανίζει μεταβλητές περιβάλλοντος που μπορούν να κληρονομήσουν οι διεργασίες-παιδιά. Στο Bash, η set εμφανίζει επιπλέον μεταβλητές του shell και συναρτήσεις, οπότε μπορεί να παράγει περισσότερη έξοδο, χρησιμοποίησε pipe προς more για σελιδοποίηση ή προς grep HISTSIZE για να εντοπίσεις μία εγγραφή.\n\nΟι μεταβλητές περιβάλλοντος δεν είναι αυτομάτως «καθολικές» για όλο το σύστημα. Ανήκουν στη διεργασία και περνούν στις διεργασίες που ξεκινά, εφόσον έχουν γίνει export. Κάθε νέο shell μπορεί να ξεκινήσει με διαφορετικές τιμές.\n\nΔύο βοηθοί κάνουν τη λίστα χρηστική. Το pipe προς more σελιδοποιεί τη μακριά έξοδο μία οθόνη τη φορά, ενώ το printenv HISTSIZE εμφανίζει μόνο την τιμή 1000 χωρίς το πρόθεμα NAME=, βολικό όταν ένα script χρειάζεται την καθαρή τιμή. Η σκέτη printenv χωρίς όρισμα εμφανίζει όλο το exported περιβάλλον, οπότε ονόμαζε τη μεταβλητή κάθε φορά που θέλεις ακριβώς μία απάντηση.",
        ),
        "set | grep HISTSIZE",
        ["HISTSIZE=1000"],
      ),
      section(
        bi("Read the lab's starting variables", "Ανάγνωση των αρχικών μεταβλητών του εργαστηρίου"),
        bi(
          "A fresh lab shell starts with five shell variables. HOME points at /root, USER names the root account, PATH lists the command search directories, HISTSIZE caps the remembered history at 1000 entries, and SHELL records /bin/bash. The set listing prints them in this creation order, so after your own assignments the new names appear below these five.\n\nCompare with env, which prints only four rows because HISTSIZE starts as a shell-only variable; inheritance requires the export step from a later section. This four-versus-five contrast is the whole lesson in miniature: set shows shell state, env shows the exported subset, and nothing crosses the boundary by accident.",
          "Το φρέσκο shell του εργαστηρίου ξεκινά με πέντε μεταβλητές. Το HOME δείχνει το /root, το USER ονομάζει τον λογαριασμό root, το PATH απαριθμεί τους καταλόγους αναζήτησης εντολών, το HISTSIZE ορίζει το όριο ιστορικού στις 1000 εγγραφές και το SHELL καταγράφει το /bin/bash. Η λίστα set τις εμφανίζει με αυτή τη σειρά δημιουργίας, οπότε μετά τις δικές σου αναθέσεις τα νέα ονόματα εμφανίζονται κάτω από αυτές τις πέντε.\n\nΣύγκρινε με την env, που εμφανίζει μόνο τέσσερις γραμμές επειδή το HISTSIZE ξεκινά ως μεταβλητή μόνο του shell, η κληρονόμηση απαιτεί το βήμα export επόμενης ενότητας. Αυτή η αντίθεση τεσσάρων προς πέντε είναι όλο το μάθημα σε μικρογραφία: η set εμφανίζει την κατάσταση του shell, η env το exported υποσύνολο, και τίποτα δεν περνά το όριο κατά λάθος.",
        ),
        "set",
        [
          "HOME=/root",
          "USER=root",
          "PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin",
          "HISTSIZE=1000",
          "SHELL=/bin/bash",
        ],
      ),
      section(
        bi("Assign a value with no spaces around =", "Ανάθεση τιμής χωρίς κενά γύρω από το ="),
        bi(
          "In a shell, write NAME=value without spaces around the equals sign. For example, HISTSIZE=0 changes the history-size variable in the current simulated shell. A command such as HISTSIZE = 0 is not the same syntax: the shell would treat the words as a command and arguments.\n\nThe history command prints the numbered session log the shell has recorded so far. On a real shell, HISTSIZE=0 would stop new entries from being remembered; in the simulator the visible log stays put so you can keep following the lesson. Treat the lab value as configuration practice with honest limits: the variable changes, the lesson log remains.",
          "Σε ένα shell γράφεις NAME=value χωρίς κενά γύρω από το ίσον. Για παράδειγμα, η εντολή HISTSIZE=0 αλλάζει τη μεταβλητή μεγέθους ιστορικού στο τρέχον εικονικό shell. Η μορφή HISTSIZE = 0 δεν έχει την ίδια σημασία: το shell αντιμετωπίζει τις λέξεις ως εντολή και ορίσματα.\n\nΜια απλή ανάθεση δημιουργεί ή αλλάζει shell variable για την τρέχουσα συνεδρία. Αν η τιμή πρέπει να είναι διαθέσιμη σε επόμενη εντολή-παιδί, χρειάζεται export. Η αλλαγή μιας μεταβλητής HISTSIZE δεν διαγράφει παλιές εγγραφές ούτε αποτελεί τρόπο απόκρυψης ενεργειών.\n\nΗ εντολή history εμφανίζει το αριθμημένο ημερολόγιο συνεδρίας που έχει καταγράψει το shell ως τώρα. Σε πραγματικό shell, το HISTSIZE=0 θα σταματούσε την απομνημόνευση νέων εγγραφών, στον προσομοιωτή το ορατό ημερολόγιο παραμένει ώστε να συνεχίσεις το μάθημα. Αντιμετώπισε την τιμή του εργαστηρίου ως εξάσκηση ρύθμισης με ειλικρινή όρια: η μεταβλητή αλλάζει, το ημερολόγιο του μαθήματος παραμένει.",
        ),
        "HISTSIZE=0",
        [""],
      ),
      section(
        bi("Save a value before changing it", "Αποθήκευση τιμής πριν από την αλλαγή"),
        bi(
          "Before experimenting, save the current value in a virtual file. echo \"$HISTSIZE\" > /root/linux-beginners-2/environment/histsize-before-change.txt expands the variable and writes one line. The > operator replaces the destination file; use >> only when you deliberately want to append.",
          "Πριν από μια δοκιμή, αποθήκευσε την τρέχουσα τιμή σε εικονικό αρχείο. Η εντολή echo \"$HISTSIZE\" > /root/linux-beginners-2/environment/histsize-before-change.txt αναπτύσσει (expand) τη μεταβλητή και γράφει μία γραμμή. Ο τελεστής > αντικαθιστά το αρχείο-στόχο, χρησιμοποίησε >> μόνο όταν θέλεις σκόπιμα να προσθέσεις περιεχόμενο.\n\nΈλεγξε το αποτέλεσμα με cat πριν αλλάξεις τη μεταβλητή. Στο συγκεκριμένο sandbox η ανακατεύθυνση ενημερώνει μόνο το προσωπικό VFS, το οποίο διατηρείται όταν αλλάζεις μάθημα ή διαδρομή.",
        ),
        'echo "$HISTSIZE" > /root/linux-beginners-2/environment/histsize-before-change.txt',
        [""],
      ),
      section(
        bi("export applies to child processes, not future logins", "Το export αφορά child processes, όχι μελλοντικές συνδέσεις"),
        bi(
          "export HISTSIZE marks the shell variable for inheritance by commands started from this shell. You can verify the exported value with env | grep HISTSIZE. The change remains part of the current shell session; export alone does not make a setting permanent across logout, restart, or a new login.\n\nTwo spellings cover daily use: export NAME=value assigns and exports in one line, while bare export with no argument lists every exported name in declare -x form. Prefer the one-line form for fresh values and the bare listing when you audit what a session currently passes to its children.",
          "Η εντολή export HISTSIZE επιτρέπει στις εντολές που ξεκινούν από αυτό το shell να κληρονομήσουν τη μεταβλητή. Μπορείς να επαληθεύσεις την τιμή με env | grep HISTSIZE. Η αλλαγή ισχύει στην τρέχουσα συνεδρία, το export από μόνο του δεν διατηρεί τη ρύθμιση μετά την αποσύνδεση, την επανεκκίνηση ή μια νέα σύνδεση.\n\nΓια ρύθμιση που φορτώνεται σε μελλοντικά διαδραστικά shells, οι διαχειριστές συχνά προσθέτουν μια προσεκτικά ελεγμένη γραμμή στο ~/.bashrc. Στο εργαστήριο μπορείς να δεις αυτή την ιδέα με echo 'export LAB_MODE=training' >> /root/.bashrc και cat /root/.bashrc, η γραμμή μένει στο VFS.\n\nΔύο συντάξεις καλύπτουν την καθημερινή χρήση: το export NAME=value αναθέτει και εξάγει σε μία γραμμή, ενώ η σκέτη export χωρίς όρισμα απαριθμεί κάθε exported όνομα σε μορφή declare -x. Προτίμησε τη μονογραμμική μορφή για φρέσκες τιμές και τη σκέτη λίστα όταν επιθεωρείς τι περνά η συνεδρία στα παιδιά της.",
        ),
        "export HISTSIZE",
        ["HISTSIZE=0 exported for this virtual shell."],
      ),
      section(
        bi("Read PATH and locate commands with which", "Ανάγνωση του PATH και εντοπισμός εντολών με which"),
        bi(
          "PATH is a colon-separated list of directories the shell searches left to right whenever you type a command name. The lab value /usr/local/bin:/usr/bin:/bin:/usr/sbin means local additions win over system directories, and system binaries win over /bin. Order is policy: the first match executes, so two same-named programs in different directories are not equal.\n\nThe which command reveals the winner without running it: which dig answers /usr/bin/dig because that is the first PATH hit. Reach for echo $PATH when a command misbehaves and which COMMAND when you must prove which copy the shell would choose; both read state, neither changes it.",
          "Το PATH είναι λίστα καταλόγων με διαχωριστικό άνω-κάτω τελεία, που το shell ψάχνει από αριστερά προς τα δεξιά κάθε φορά που πληκτρολογείς όνομα εντολής. Η τιμή /usr/local/bin:/usr/bin:/bin:/usr/sbin δηλώνει ότι οι τοπικές προσθήκες προηγούνται των συστημικών καταλόγων και τα συστημικά δυαδικά του /bin. Η σειρά είναι πολιτική: εκτελείται η πρώτη αντιστοίχιση, οπότε δύο ομώνυμα προγράμματα σε διαφορετικούς καταλόγους δεν είναι ίσα.\n\nΗ εντολή which φανερώνει τον νικητή χωρίς να τον εκτελέσει: το which dig απαντά /usr/bin/dig επειδή αυτό είναι το πρώτο χτύπημα στο PATH. Χρησιμοποίησε echo $PATH όταν εντολή συμπεριφέρεται παράξενα και which COMMAND όταν πρέπει να αποδείξεις ποιο αντίγραφο θα διάλεγε το shell, και τα δύο διαβάζουν κατάσταση, κανένα δεν την αλλάζει.",
        ),
        "echo $PATH\nwhich dig",
        ["/usr/local/bin:/usr/bin:/bin:/usr/sbin", "/usr/bin/dig"],
      ),
      section(
        bi("Create, read, and remove a custom variable", "Δημιουργία, ανάγνωση και αφαίρεση δικής σου μεταβλητής"),
        bi(
          "A variable name should describe the value it holds. url_variable=\"gamehack.lab/\" creates a shell variable; echo \"$url_variable\" expands it so you can read the value. Quoting protects the text from accidental splitting when it contains spaces or shell characters.",
          "Το όνομα μιας μεταβλητής καλό είναι να περιγράφει την τιμή που κρατά. Η ανάθεση url_variable=\"gamehack.lab/\" δημιουργεί shell variable και η echo \"$url_variable\" εμφανίζει την τιμή της. Τα εισαγωγικά προστατεύουν το κείμενο από ανεπιθύμητο διαχωρισμό όταν περιέχει κενά ή χαρακτήρες του shell.\n\nΗ unset url_variable αφαιρεί τη μεταβλητή από την τρέχουσα συνεδρία, δεν διαγράφει αρχείο με παρόμοιο όνομα. Μετά την αφαίρεση, το echo \"$url_variable\" εμφανίζει κενή τιμή. Οι εντολές εκτελούνται στον προσομοιωμένο λογαριασμό και δεν αλλάζουν μεταβλητές στο σύστημα του υπολογιστή σου.",
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
      { cmd: "printenv NAME", desc: bi("Print one exported value", "Εμφάνιση μίας exported τιμής") },
      { cmd: "history", desc: bi("Show the numbered session log", "Εμφάνιση αριθμημένου ιστορικού") },
      { cmd: "which COMMAND", desc: bi("Show which copy PATH selects", "Ποιο αντίγραφο επιλέγει το PATH") },
    ],
    tasks: [
      task(
        "inspect-variables",
        bi(
          "Compare the shell listing with the exported environment: run set | more, env, and set | grep HISTSIZE. Find the current history-size value.",
          "Σύγκρινε τη λίστα του shell με το exported περιβάλλον: εκτέλεσε set | more, env και set | grep HISTSIZE. Εντόπισε την τρέχουσα τιμή του μεγέθους ιστορικού.",
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
          "Γιατί: Η ανάθεση και το export είναι διαφορετικά βήματα, το πρώτο αλλάζει μια τιμή του shell και το δεύτερο τη διαθέτει στις child εντολές. Πώς: γράψε σωστά την ανάθεση, κάνε export το όνομα και έλεγξε το περιβάλλον. Η διαδικασία δεν διαγράφει παλιό ιστορικό ούτε διατηρείται μετά από νέα συνεδρία.",
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
          "Γιατί: Η ονομασία, η ανάγνωση, το export και η αφαίρεση μιας μεταβλητής είναι ξεχωριστές λειτουργίες του shell. Πώς: κάνε ανάθεση, εμφάνισε την τιμή με echo, χρησιμοποίησε unset και σύγκρινε το κενό αποτέλεσμα, στο τέλος έλεγξε το εικονικό παράδειγμα .bashrc. Το export μόνο του είναι προσωρινό, ενώ το startup file διαβάζεται από μελλοντικά διαδραστικά shells.",
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
        success: bi("You changed and restored a setting.", "Άλλαξες και επανέφερες μια ρύθμιση."),
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
