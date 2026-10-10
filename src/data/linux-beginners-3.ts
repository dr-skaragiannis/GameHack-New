import type { Bi, CheckCtx, Module, Section, Task } from "./lessons";
import { getNode, usedCmd } from "../lib/terminal";

const lab = "sudorun" as const;
const bi = (en: string, el: string): Bi => ({ en, el });
const shot = (cmd: string, lines: string[]) => ({ cmd, lines });
const section = (heading: Bi, body: Bi, shots?: Section["shots"], tip?: Bi): Section => ({
  heading,
  body,
  ...(shots ? { shots } : {}),
  ...(tip ? { tip } : {}),
});
const task = (
  id: string,
  instruction: Bi,
  hint: Bi,
  explain: Bi,
  check: (term: CheckCtx) => boolean,
): Task => ({ id, instruction, hint, explain, check });

const submitCheck = (term: CheckCtx, flag: string) => term.flags.has(`submit:${flag}`);

export const LINUX_BEGINNERS_3_MODULES: Module[] = [
  {
    id: "sr-bash",
    order: 1,
    icon: "terminal",
    color: "from-emerald-400 to-green-900",
    difficulty: 2,
    scenario: lab,
    title: bi("Bash scripts and a lab-only scanner", "Bash scripts και προσομοιωμένος scanner"),
    subtitle: bi(
      "Shebangs, input variables, executable files, and a safe Nmap pipeline",
      "Shebang, μεταβλητές εισόδου, εκτελέσιμα αρχεία και ασφαλές pipeline Nmap",
    ),
    badge: bi("Script Builder", "Δημιουργός scripts"),
    theory: [
      section(
        bi("A shell script and its shebang", "Shell script και shebang"),
        bi(
          "A Bash script is a plain-text file containing shell instructions, usually one command per line. Bash reads those lines in order, which makes a repeated task easier to review, adjust, and run consistently than retyping each command by hand. In this lab the examples live in your personal virtual filesystem under /root/linux-beginners-3; reading a script with cat only displays its text and does not run it.\n\nThe first line begins with #! and is called the shebang: it names the interpreter used when the operating system starts the file directly. For Bash, the conventional line is exactly #!/bin/bash. The article shows #! /bin/bash and #!/bin/bash/ as variants; the first has an unnecessary space and the second an invalid trailing slash, so this lesson uses the corrected form.",
          "Ένα Bash script είναι αρχείο απλού κειμένου με οδηγίες για το shell, συνήθως μία εντολή σε κάθε γραμμή. Το Bash διαβάζει τις γραμμές με τη σειρά, ώστε μια επαναλαμβανόμενη εργασία να ελέγχεται και να εκτελείται με συνέπεια, αντί να ξαναγράφεις κάθε εντολή. Τα παραδείγματα βρίσκονται στο προσωπικό εικονικό σύστημα αρχείων, μέσα στο /root/linux-beginners-3, το cat απλώς εμφανίζει το κείμενο και δεν εκτελεί το script.\n\nΗ πρώτη γραμμή αρχίζει με #! και ονομάζεται shebang: δηλώνει ποιον interpreter θα χρησιμοποιήσει το λειτουργικό όταν ξεκινήσεις το αρχείο απευθείας. Για Bash γράφουμε ακριβώς #!/bin/bash. Στο δημοσιευμένο παράδειγμα εμφανίζονται οι παραλλαγές #! /bin/bash και #!/bin/bash/, η πρώτη έχει περιττό κενό και η δεύτερη λανθασμένο τελικό slash, γι’ αυτό το μάθημα χρησιμοποιεί τη σωστή μορφή.",
        ),
        [
          shot("cat /root/linux-beginners-3/first_script", ["#!/bin/bash", "echo \"Hello World\""]),
        ],
      ),
      section(
        bi("echo: print a message", "echo: εμφάνιση μηνύματος"),
        bi(
          "echo writes its arguments to standard output, which normally means the terminal. In the first example, echo \"Hello World\" prints the words Hello World; the quotation marks keep the phrase together as one argument, and they are not included in the displayed result. This is a deliberately small first script: it demonstrates the input/output cycle without changing a file or contacting another system. On a real system the script runs in a child subshell, so variables it sets vanish when it exits.\n\nRun echo on its own to print a message immediately; inside a script, the message appears when Bash reaches that line. This makes it easy to inspect the file with cat first and then compare each instruction with the output it produces.",
          "Η echo γράφει τα ορίσματά της στο standard output, που συνήθως είναι το τερματικό. Στο πρώτο παράδειγμα, η echo \"Hello World\" εμφανίζει τις λέξεις Hello World, τα εισαγωγικά κρατούν τη φράση ως ένα όρισμα και δεν εμφανίζονται στην έξοδο. Το πρώτο script είναι σκόπιμα απλό: δείχνει τη σχέση εισόδου και εξόδου χωρίς να αλλάζει αρχεία ή να επικοινωνεί με άλλο σύστημα. Σε πραγματικό σύστημα το script εκτελείται σε θυγατρικό subshell, οπότε οι μεταβλητές που ορίζει χάνονται όταν τερματίσει.\n\nΑν χρησιμοποιήσεις την echo μόνη της στο τερματικό, το μήνυμα εμφανίζεται αμέσως. Μέσα σε script, εμφανίζεται όταν εκτελεστεί η αντίστοιχη γραμμή. Έτσι μπορείς πρώτα να εξετάσεις το περιεχόμενο με cat και μετά να συγκρίνεις τις εντολές του αρχείου με το αποτέλεσμα που βλέπεις.",
        ),
        [shot("./first_script", ["Hello World"])],
      ),
      section(
        bi("chmod +x and ./first_script", "chmod +x και ./first_script"),
        bi(
          "A new text file is not normally marked executable. chmod changes permission bits; the +x form adds execute permission, so chmod +x first_script lets the operating system start the file as a program. The permission belongs to the virtual file in this player’s workspace, not to a file on the web server or your computer.\n\nThe ./ prefix means “from the current directory.” Run ./first_script after cd /root/linux-beginners-3 and after adding +x. Naming the local path explicitly avoids accidentally running a different program with the same name elsewhere on PATH; if you do not want to change permissions, bash first_script asks Bash to read the file directly.\n\nRead the confirmation mode as three permission triples: -rwxr--r-- starts with - for a regular file, then rwx for the owner, r-- for the group, and r-- for everyone else. The +x you added is the owner\u2019s execute bit. The .sh suffix in the chapter\u2019s first_script.sh is only a human naming convention \u2014 Linux decides executability from these permission bits plus the shebang line, never from the extension, which is why the lab fixtures run fine without any suffix.",
          "Ένα νέο αρχείο κειμένου συνήθως δεν έχει δικαίωμα εκτέλεσης. Η chmod αλλάζει bits δικαιωμάτων, η μορφή +x προσθέτει εκτελεστότητα, οπότε η chmod +x first_script επιτρέπει την απευθείας εκκίνηση του αρχείου ως προγράμματος. Το δικαίωμα αλλάζει μόνο το εικονικό αρχείο του παίκτη, όχι κάποιο αρχείο του server ή του υπολογιστή σου.\n\nΤο πρόθεμα ./ δηλώνει «από τον τρέχοντα φάκελο». Γράψε ./first_script αφού μπεις στον φάκελο με cd /root/linux-beginners-3 και έχεις δώσει το +x. Η ρητή διαδρομή αποφεύγει να εκτελεστεί κατά λάθος κάποιο ομώνυμο πρόγραμμα που βρίσκεται αλλού στο PATH, αν δεν θέλεις να αλλάξεις δικαιώματα, η εναλλακτική bash first_script ζητά από το Bash να διαβάσει το αρχείο.\n\nΔιάβασε τη λειτουργία επιβεβαίωσης ως τρεις τριάδες δικαιωμάτων: το -rwxr--r-- ξεκινά με - για κανονικό αρχείο, μετά rwx για τον ιδιοκτήτη, r-- για την ομάδα και r-- για όλους τους υπόλοιπους. Το +x που πρόσθεσες είναι το bit εκτέλεσης του ιδιοκτήτη. Η κατάληξη .sh του first_script.sh είναι μόνο ανθρώπινη σύμβαση ονομασίας, το Linux κρίνει την εκτελεστότητα από αυτά τα bits και τη γραμμή shebang, ποτέ από την κατάληξη, γι’ αυτό τα fixtures του εργαστηρίου εκτελούνται κανονικά χωρίς κατάληξη.",
        ),
        [
          shot("chmod +x first_script", ["Mode of first_script changed to -rwxr--r--."]),
          shot("./first_script", ["Hello World"]),
        ],
      ),
      section(
        bi("read and a shell variable", "read και μεταβλητή shell"),
        bi(
          "The welcome script demonstrates a small conversation: echo \"What is your name?\" prints a prompt, read name stores the next input in a variable called name, and echo \"Welcome, $name\" expands that variable inside double quotes. A variable is a named value held for the running shell; the dollar sign asks Bash to substitute the value rather than print the characters $name literally.\n\nIn an ordinary Bash session, read waits for a line that the user types. GameHack uses a fixed sample value, operator, so the exercise can show the prompt and expansion without starting a real shell or accepting arbitrary input. Double quotes allow the variable to expand while keeping the whole greeting together; single quotes would leave $name unchanged.",
          "Το script υποδοχής δείχνει μια μικρή συνομιλία: η echo \"What is your name?\" εμφανίζει ερώτηση, η εντολή read name αποθηκεύει την επόμενη είσοδο στη μεταβλητή name και η echo \"Welcome, $name\" αντικαθιστά τη μεταβλητή με την τιμή της μέσα στα διπλά εισαγωγικά. Μια μεταβλητή είναι ονομασμένη τιμή του shell, το σύμβολο $ ζητά από το Bash να εμφανίσει την τιμή της αντί για τους χαρακτήρες $name.\n\nΣτο πραγματικό Bash, η read περιμένει να πληκτρολογήσεις απάντηση. Το GameHack δεν ανοίγει πραγματικό shell ούτε περιμένει αυθαίρετη εκτέλεση: το fixture προσφέρει την εικονική απάντηση operator, ώστε να μπορείς να παρατηρήσεις τη ροή. Οι διπλές αποστρόφοι επιτρέπουν επέκταση μεταβλητών, ενώ οι μονές αποστρόφοι θα κρατούσαν το $name κυριολεκτικό.",
        ),
        [
          shot("cat welcome.sh", [
            "#!/bin/bash",
            'echo "What is your name?"',
            "read name",
            'echo "Welcome, $name"',
          ]),
          shot("./welcome.sh", ["What is your name?", "Welcome, operator"]),
        ],
      ),
      section(
        bi("Nmap host discovery: use only the fixture subnet", "Ανακάλυψη hosts με Nmap: μόνο στο υποδίκτυο του fixture"),
        bi(
          "Nmap can perform several kinds of authorized network inventory. The article’s scanner intends to ask for an IP address, add /24 to describe its subnet, and use a ping sweep to identify responding hosts. The modern option is -sn; older Nmap versions used -sP (capital P). The printed nma -sp is a spelling/capitalization error. The intended Bash form is nmap -sn \"$ip\"/24: after read ip, Bash expands $ip and appends /24. GameHack shows that pattern as a comment in the fixture but uses a fixed fictional target, 10.10.10.0/24, when it runs.\n\nThe -sn option asks for host discovery without a port scan. The /24 suffix is CIDR notation for a 256-address subnet, but it is not permission to test a network. GameHack maps this reserved training target to canned VFS results; even if a different address is typed, no packets are sent to a live network.\n\nEach report row is followed by a Host is up companion line with a latency reading in seconds \u2014 that pair is what proves the address answered the sweep. Those companion lines contain no scan keyword, so the pipeline\u2019s grep drops them automatically; only the report rows and the final Nmap done summary survive to the cut stage.",
          "Το Nmap υποστηρίζει διάφορες μορφές απογραφής δικτύου όταν υπάρχει άδεια. Ο scanner του άρθρου ζητά μια διεύθυνση IP, προσθέτει /24 για να περιγράψει το υποδίκτυο και επιχειρεί ping sweep για να εντοπίσει hosts που απαντούν. Η σύγχρονη επιλογή είναι -sn, παλαιότερες εκδόσεις χρησιμοποιούσαν -sP με κεφαλαίο P. Το nma -sp είναι τυπογραφικό λάθος. Η σωστή μορφή Bash είναι nmap -sn \"$ip\"/24: μετά την εντολή read ip, το Bash αντικαθιστά το $ip με την τιμή και προσθέτει το /24. Το fixture δείχνει αυτή τη μορφή ως σχόλιο, αλλά εκτελεί μόνο τον σταθερό, φανταστικό στόχο 10.10.10.0/24.\n\nΗ επιλογή -sn ζητά ανακάλυψη hosts χωρίς σάρωση θυρών. Το /24 είναι CIDR notation για ένα υποδίκτυο 256 διευθύνσεων, αλλά δεν αποτελεί άδεια για να ελεγχθεί οποιοδήποτε δίκτυο. Στο GameHack κάθε στόχος αντιστοιχίζεται σε προκαθορισμένα στοιχεία του sandbox, δεν στέλνονται πακέτα σε πραγματικό δίκτυο, ακόμη κι αν ο παίκτης πληκτρολογήσει διαφορετική διεύθυνση.\n\nΚάθε γραμμή αναφοράς συνοδεύεται από γραμμή Host is up με μέτρηση καθυστέρησης σε δευτερόλεπτα, αυτό το ζεύγος αποδεικνύει ότι η διεύθυνση απάντησε στη σάρωση. Οι συνοδευτικές γραμμές δεν περιέχουν τη λέξη scan, οπότε το grep του pipeline τις απορρίπτει αυτόματα, μόνο οι γραμμές αναφοράς και η τελική σύνοψη Nmap done φτάνουν στο στάδιο της cut.",
        ),
        [
          shot("nmap -sn 10.10.10.0/24", [
            "Starting Nmap 7.94 ( https://nmap.org ) at lab-time",
            "Nmap scan report for 10.10.10.5 (raven.lab)",
            "Host is up (0.001s latency).",
            "Nmap scan report for 10.10.10.8 (web.lab)",
            "Host is up (0.001s latency).",
            "Nmap scan report for 10.10.10.12 (ssh.lab)",
            "Host is up (0.002s latency).",
            "Nmap scan report for 10.10.10.21 (db.lab)",
            "Host is up (0.002s latency).",
            "Nmap done: 256 IP addresses (4 hosts up) scanned in 2.14 seconds",
          ]),
        ],
        bi(
          "The article’s scanner prompt is retained, but the runnable GameHack fixture is deliberately fixed to its private simulated subnet.",
          "Η ερώτηση του άρθρου διατηρείται, αλλά το εκτελέσιμο fixture του GameHack περιορίζεται σκόπιμα στο εικονικό υποδίκτυό του.",
        ),
      ),
      section(
        bi("grep, cut, head, and the complete pipeline", "grep, cut, head και το πλήρες pipeline"),
        bi(
          "A pipe character | passes one command’s standard output to the next command as input. In the corrected article-shaped pipeline, grep scan keeps the Nmap report rows, cut -d \" \" -f 5 selects the fifth space-delimited field (the IP address), and head -n -1 prints every remaining line except the last one. That negative head form is supported by GNU head and by this simulator. The final Nmap summary row also contains “scanned,” so grep scan matches it; cut turns that row into “addresses,” and head -n -1 removes the summary while preserving all four host addresses. If an upstream command changes, inspect its rows before deciding what the negative count will omit. The chapter filters on the full report prefix Nmap scan report for; the lab shortens the pattern to scan, which is also why the summary row needs the head -n -1 guard.\n\nThe article’s original cut -d \"\" has no useful delimiter, so the runnable example corrects it to a space inside the quotes. Try the complete command: nmap -sn 10.10.10.0/24 | grep scan | cut -d \" \" -f 5 | head -n -1. Its results come only from GameHack’s fictional fixture and do not describe a real network.",
          "Ο τελεστής pipe | περνά το standard output μιας εντολής ως είσοδο στην επόμενη. Στο διορθωμένο pipeline του άρθρου, η grep scan κρατά τις γραμμές αναφοράς του Nmap, η cut -d \" \" -f 5 επιλέγει το πέμπτο πεδίο που χωρίζεται με κενά (τη διεύθυνση IP) και η head -n -1 εμφανίζει όλες τις γραμμές εκτός από την τελευταία. Αυτή η αρνητική μορφή της head υποστηρίζεται από το GNU head και από τον προσομοιωτή. Η τελική σύνοψη του Nmap περιέχει επίσης το “scanned”, άρα ταιριάζει στο grep scan, η cut μετατρέπει εκείνη τη γραμμή σε “addresses” και η head -n -1 αφαιρεί τη σύνοψη, διατηρώντας και τις τέσσερις διευθύνσεις hosts. Αν αλλάξει η έξοδος προηγούμενης εντολής, έλεγξε τις γραμμές πριν αποφασίσεις τι θα παραλείψει ο αρνητικός αριθμός. Το κεφάλαιο φιλτράρει με ολόκληρο το πρόθεμα αναφοράς Nmap scan report for, το εργαστήριο συντομεύει το μοτίβο σε scan, γι’ αυτό η γραμμή σύνοψης χρειάζεται την προστασία της head -n -1.\n\nΤο αρχικό cut -d \"\" δεν ορίζει χρήσιμο διαχωριστικό, οπότε το παράδειγμα διορθώνεται σε έναν κενό χαρακτήρα μέσα στα εισαγωγικά. Δοκίμασε ολόκληρη την εντολή στο τερματικό: nmap -sn 10.10.10.0/24 | grep scan | cut -d \" \" -f 5 | head -n -1. Η τελική λίστα προέρχεται αποκλειστικά από τα εικονικά αποτελέσματα του GameHack και δεν αποτελεί αναφορά πραγματικού δικτύου.",
        ),
        [
          shot('nmap -sn 10.10.10.0/24 | grep scan | cut -d " " -f 5 | head -n -1', [
            "10.10.10.5",
            "10.10.10.8",
            "10.10.10.12",
            "10.10.10.21",
          ]),
        ],
      ),
      section(
        bi("Run the canned scanner fixture", "Εκτέλεση του έτοιμου fixture scanner"),
        bi(
          "The scanner fixture ties the whole lesson together: it prints the chapter\u2019s input prompt, answers itself with Simulated input: 10.10.10.2, and then prints the same four fixture addresses the hand-typed pipeline produces. That middle line is the honesty marker \u2014 on a real system read would wait for your typing, while here the simulator supplies a fixed value and labels it as simulated.\n\nCompare the two invocation styles side by side. Typing the pipeline yourself exercises each filter stage, while ./scanner proves the same stages work when chained inside a script file. Both paths stay inside the VFS: the fixture subnet never changes, no packets leave the browser, and the run is recorded only as a training flag.",
          "Το fixture scanner δένει όλο το μάθημα: εμφανίζει την ερώτηση εισόδου του κεφαλαίου, απαντά μόνο του με Simulated input: 10.10.10.2 και μετά εμφανίζει τις ίδιες τέσσερις διευθύνσεις fixture που παράγει το χειροκίνητο pipeline. Η μεσαία γραμμή είναι ο δείκτης ειλικρίνειας, σε πραγματικό σύστημα η read θα περίμενε την πληκτρολόγησή σου, ενώ εδώ ο προσομοιωτής δίνει σταθερή τιμή και τη σημειώνει ως προσομοιωμένη.\n\nΣύγκρινε τους δύο τρόπους κλήσης δίπλα-δίπλα. Πληκτρολογώντας το pipeline εξασκείς κάθε στάδιο φίλτρου, ενώ το ./scanner αποδεικνύει ότι τα ίδια στάδια δουλεύουν αλυσιδωτά μέσα σε αρχείο script. Και οι δύο διαδρομές μένουν στο VFS: το υποδίκτυο fixture δεν αλλάζει, κανένα πακέτο δεν φεύγει από τον browser και η εκτέλεση καταγράφεται μόνο ως εκπαιδευτική σημαία.",
        ),
        [
          shot("./scanner", [
            "Enter the lab IP address (10.10.10.2)",
            "Simulated input: 10.10.10.2",
            "10.10.10.5",
            "10.10.10.8",
            "10.10.10.12",
            "10.10.10.21",
          ]),
        ],
      ),
    ],
    cheats: [
      { cmd: "cat /root/linux-beginners-3/first_script", desc: bi("inspect the script before running it", "έλεγχος του script πριν την εκτέλεση") },
      { cmd: 'echo "Hello World"', desc: bi("print a short message", "εμφάνιση σύντομου μηνύματος") },
      { cmd: "chmod +x first_script", desc: bi("add the execute permission", "προσθήκη δικαιώματος εκτέλεσης") },
      { cmd: "./first_script", desc: bi("run a script in this directory", "εκτέλεση script από αυτόν τον φάκελο") },
      { cmd: "read name", desc: bi("store the next input in a variable", "αποθήκευση εισόδου σε μεταβλητή") },
      { cmd: 'echo "Welcome, $name"', desc: bi("expand the variable in a message", "αντικατάσταση της μεταβλητής στο μήνυμα") },
      { cmd: "nmap -sn 10.10.10.0/24", desc: bi("simulated ping sweep of the lab subnet", "εικονικό ping sweep του υποδικτύου lab") },
      { cmd: "grep scan", desc: bi("keep scan-report lines", "διατήρηση γραμμών αναφοράς σάρωσης") },
      { cmd: 'cut -d " " -f 5', desc: bi("select the IP-address field", "επιλογή του πεδίου διεύθυνσης IP") },
      { cmd: "head -n -1", desc: bi("omit the last filtered line", "παράλειψη της τελευταίας φιλτραρισμένης γραμμής") },
      { cmd: "|", desc: bi("pass output to the next command", "πέρασμα εξόδου στην επόμενη εντολή") },
      { cmd: "./scanner", desc: bi("run the canned fixture scanner", "εκτέλεση του έτοιμου fixture scanner") },
      { cmd: "bash SCRIPT", desc: bi("ask Bash to read a file directly", "απευθείας ανάγνωση αρχείου από το Bash") },
    ],
    tasks: [
      task(
        "read-first-script",
        bi(
          "Enter the course script folder and inspect first_script before you execute it. Confirm that the first line selects Bash and the next line prints a greeting.",
          "Μπες στον φάκελο του μαθήματος και έλεγξε το first_script πριν το εκτελέσεις. Επιβεβαίωσε ότι η πρώτη γραμμή επιλέγει το Bash και η επόμενη εμφανίζει χαιρετισμό.",
        ),
        bi("cd /root/linux-beginners-3\ncat first_script", "cd /root/linux-beginners-3\ncat first_script"),
        bi(
          "Reading a script first lets you distinguish harmless display commands from actions that change state. Here you should see the corrected shebang and one echo command, both stored as ordinary text in your VFS.",
          "Ο έλεγχος πριν από την εκτέλεση σε βοηθά να ξεχωρίσεις την απλή εμφάνιση από ενέργειες που αλλάζουν κατάσταση. Εδώ θα δεις το σωστό shebang και μία εντολή echo, αποθηκευμένα ως απλό κείμενο στο VFS.",
        ),
        (term) => term.filesRead.some((path) => path.endsWith("/linux-beginners-3/first_script")),
      ),
      task(
        "make-executable",
        bi(
          "Grant the virtual first_script permission to execute. This changes the file’s mode only; no host file is touched.",
          "Δώσε στο εικονικό first_script δικαίωμα εκτέλεσης. Αλλάζει μόνο το mode του αρχείου.",
        ),
        bi("chmod +x first_script", "chmod +x first_script"),
        bi(
          "The +x permission is what allows the shell to start the script directly. If you skip this step, ./first_script should report a permission error; bash first_script is the alternative that invokes the interpreter explicitly.",
          "Το +x επιτρέπει στο shell να ξεκινήσει απευθείας το script. Αν παραλείψεις το βήμα, το ./first_script θα αναφέρει σφάλμα δικαιωμάτων, εναλλακτικά, το bash first_script καλεί ρητά τον interpreter.",
        ),
        (term) => term.flags.has("chmod-x") || usedCmd(term, /chmod\s+\+x\s+first_script/),
      ),
      task(
        "run-first-script",
        bi(
          "Run the script from the directory you inspected and compare its output with the echo line. The ./ prefix is required for this local path form.",
          "Εκτέλεσε το script από τον φάκελο που έλεγξες και σύγκρινε την έξοδο με τη γραμμή echo. Το πρόθεμα ./ χρειάζεται για αυτή τη σχετική διαδρομή.",
        ),
        bi("./first_script", "./first_script"),
        bi(
          "The interpreter reads the file and prints Hello World. This is a controlled example of a shell program; it neither changes the web page nor starts an operating-system process on the server.",
          "Ο interpreter διαβάζει το αρχείο και εμφανίζει Hello World. Είναι ελεγχόμενο παράδειγμα shell program, δεν αλλάζει τη σελίδα ούτε ξεκινά διεργασία στο σύστημα του server.",
        ),
        (term) => term.flags.has("hello-script"),
      ),
      task(
        "read-variable",
        bi(
          "Inspect and run welcome.sh to see echo, read, and the $name variable expansion in context. GameHack supplies a fixed sample name so the exercise never waits for real shell input.",
          "Έλεγξε και εκτέλεσε το welcome.sh για να δεις μαζί τις echo, read και την αντικατάσταση της μεταβλητής $name. Το GameHack δίνει σταθερό όνομα δείγματος, ώστε η άσκηση να μη ζητά είσοδο από πραγματικό shell.",
        ),
        bi("cat welcome.sh\nchmod +x welcome.sh\n./welcome.sh", "cat welcome.sh\nchmod +x welcome.sh\n./welcome.sh"),
        bi(
          "The first echo prints a question, read assigns the simulated answer to name, and the final echo substitutes that value. Notice that the dollar sign is part of variable expansion and that double quotes preserve the whole greeting as one string.",
          "Η πρώτη echo εμφανίζει ερώτηση, η read αποθηκεύει την εικονική απάντηση στο name και η τελευταία echo αντικαθιστά τη μεταβλητή με την τιμή της. Το σύμβολο $ δηλώνει αντικατάσταση μεταβλητής και τα διπλά εισαγωγικά κρατούν ολόκληρο τον χαιρετισμό ως μία φράση.",
        ),
        (term) => term.flags.has("read-script"),
      ),
      task(
        "run-scanner",
        bi(
          "Read the scanner fixture, grant it execute permission, and run it once. Its prompt and output are canned examples from the fixed 10.10.10.0/24 lab network.",
          "Διάβασε το fixture scanner, δώσε του δικαίωμα εκτέλεσης και εκτέλεσέ το μία φορά. Η ερώτηση και η έξοδος είναι προκαθορισμένα παραδείγματα από το σταθερό δίκτυο 10.10.10.0/24 του lab.",
        ),
        bi("cat scanner\nchmod +x scanner\n./scanner", "cat scanner\nchmod +x scanner\n./scanner"),
        bi(
          "The script combines an input prompt with Nmap and text filters, but the sandbox never passes a user-supplied address to a live scanner. The fixture reports only fictional hosts and marks each stage as simulated, so it is safe to practise here without contacting the Internet.",
          "Το script συνδυάζει ερώτηση εισόδου, Nmap και φίλτρα κειμένου, αλλά το sandbox δεν περνά διεύθυνση χρήστη σε ζωντανό scanner. Το fixture εμφανίζει μόνο φανταστικούς hosts και προσομοιώνει κάθε στάδιο, επομένως δεν επικοινωνεί με το Internet.",
        ),
        (term) => term.flags.has("run-scanner"),
      ),
      task(
        "filter-scan",
        bi(
          "Run the complete corrected pipeline against the reserved virtual subnet. Check which host rows survive grep, cut, and the final head filter.",
          "Εκτέλεσε ολόκληρο το διορθωμένο pipeline στο εικονικό υποδίκτυο. Έλεγξε ποιες γραμμές hosts παραμένουν μετά τα grep, cut και το τελευταίο φίλτρο head.",
        ),
        bi(
          'nmap -sn 10.10.10.0/24 | grep scan | cut -d " " -f 5 | head -n -1',
          'nmap -sn 10.10.10.0/24 | grep scan | cut -d " " -f 5 | head -n -1',
        ),
        bi(
          "The pipe feeds Nmap’s report to grep, then passes matching rows through cut and head. Because the Nmap summary row also matches grep scan and becomes “addresses” after cut, head -n -1 removes that final summary row while leaving all four host addresses visible.",
          "Το pipe περνά την αναφορά του Nmap στη grep και έπειτα στέλνει τις γραμμές που ταιριάζουν στην cut και την head. Επειδή η γραμμή σύνοψης του Nmap περιέχει το “scanned” και μετατρέπεται σε “addresses” μετά την cut, η head -n -1 αφαιρεί τη σύνοψη και αφήνει ορατές και τις τέσσερις διευθύνσεις hosts.",
        ),
        (term) => term.flags.has("nmap-sn") && term.flags.has("grep") && term.flags.has("cut") && term.flags.has("head"),
      ),
    ],
    challenges: [
      {
        title: bi("Only the lab network", "Μόνο το δίκτυο του lab"),
        brief: bi("Open the scanner source and confirm its target is the fixed 10.10.10.0/24 fixture rather than a public address, then run it so the sweep is recorded. Reading a script before executing it is the habit this lab exists to build.", "Άνοιξε τον κώδικα του scanner και επιβεβαίωσε ότι ο στόχος του είναι το σταθερό fixture 10.10.10.0/24 και όχι δημόσια διεύθυνση, και μετά τρέξε τον ώστε να καταγραφεί η σάρωση. Η ανάγνωση ενός script πριν την εκτέλεση είναι η συνήθεια που υπάρχει αυτό το lab για να χτίσει."),
        success: bi(
          "You identified the permitted fixture boundary and read the complete simulated host list.",
          "Εντόπισες τα όρια του επιτρεπόμενου fixture και διάβασες την πλήρη εικονική λίστα hosts.",
        ),
        check: (term) => term.flags.has("run-scanner") && term.flags.has("nmap-sweep"),
      },
      {
        title: bi("Submit the script-builder flag", "Υποβολή σημαίας δημιουργού scripts"),
        brief: bi("Once you have read the scanner source and run the Bash examples yourself, submit FLAG{linux_beginners_3_bash}. The flag records that you built and executed a script, not that you copied a string from somewhere.", "Αφού διαβάσεις τον κώδικα του scanner και εκτελέσεις μόνος σου τα παραδείγματα Bash, υπέβαλε το FLAG{linux_beginners_3_bash}. Το flag καταγράφει ότι έφτιαξες και εκτέλεσες script, και όχι ότι αντέγραψες μια συμβολοσειρά από κάπου."),
        success: bi(
          "The Bash lesson is complete; your scripts and their permissions remain in your virtual filesystem.",
          "Το μάθημα Bash ολοκληρώθηκε.",
        ),
        check: (term) => submitCheck(term, "FLAG{linux_beginners_3_bash}"),
      },
    ],
  },
  {
    id: "sr-cron",
    order: 2,
    icon: "clock",
    color: "from-cyan-400 to-sky-900",
    difficulty: 3,
    scenario: lab,
    title: bi("Cron schedules and boot services", "Προγραμματισμός cron και υπηρεσίες εκκίνησης"),
    subtitle: bi(
      "crontab, the 55 23 schedule, SysV runlevels, update-rc.d, reboot, and ps",
      "crontab, πρόγραμμα 23:55, runlevels SysV, update-rc.d, reboot και ps",
    ),
    badge: bi("Timekeeper", "Φύλακας χρόνου"),
    theory: [
      section(
        bi("cron and the service command", "cron και η εντολή service"),
        bi(
          "cron is a background scheduler: it checks stored tables and launches a listed command when its time fields match. The article begins with service cron status to inspect whether the daemon is active, then uses service cron start if it is stopped. In GameHack these commands update only this player’s simulated service state; no daemon is launched by the website.\n\nstatus reports the present state, while start requests a transition to running. Check again with service cron status rather than assuming the service started from the first message. The change belongs only to this player's VFS-backed terminal session and does not schedule work on the web server. A real status call prints a longer Loaded/Active/Main PID/Tasks block; the lab\u2019s two lines carry the same verdict \u2014 the service name plus its current state.",
          "Το cron είναι scheduler παρασκηνίου: ελέγχει αποθηκευμένους πίνακες και εκκινεί μια εντολή όταν ταιριάζουν τα πεδία ώρας. Το άρθρο ξεκινά με service cron status για να ελέγξει αν ο daemon είναι ενεργός και χρησιμοποιεί service cron start όταν είναι σταματημένος. Στο GameHack οι εντολές αλλάζουν μόνο την εικονική κατάσταση υπηρεσίας του παίκτη, ο ιστότοπος δεν ξεκινά πραγματικό daemon.\n\nΗ εντολή status εμφανίζει την τρέχουσα κατάσταση, ενώ η start ζητά μετάβαση σε running. Έλεγξε ξανά με service cron status αντί να συμπεράνεις ότι ξεκίνησε από το μήνυμα της εντολής. Η αλλαγή αφορά μόνο το προσωπικό VFS και δεν προγραμματίζει δουλειά στο λειτουργικό σύστημα του server. Η πραγματική κλήση status εμφανίζει μακρύτερο μπλοκ Loaded/Active/Main PID/Tasks, οι δύο γραμμές του εργαστηρίου μεταφέρουν την ίδια ετυμηγορία, το όνομα της υπηρεσίας και την τρέχουσα κατάστασή της.",
        ),
        [
          shot("service cron status", ["● cron.service — inactive", "   Active: inactive"]),
          shot("service cron start", ["starting cron (simulated)."]),
          shot("service cron status", ["● cron.service — running", "   Active: active (running)"]),
        ],
      ),
      section(
        bi("crontab -e and the editor selection", "crontab -e και επιλογή editor"),
        bi(
          "crontab -e edits the recurring schedule for the current user; the e means edit. The example uses the editor-choice prompt and selects option 1 for nano. GameHack reproduces that small interaction: after crontab -e, enter 1 to choose the virtual nano editor, then use a supported VFS command to record the line because the lab does not open a real interactive editor. The lab answers by echoing the current table and the exact VFS command that records a row, so the next objective continues without guesswork.\n\ncrontab -l prints the saved table, so use it to verify the result. The -e and -l options address the current account's per-user schedule; that is distinct from the central /etc/crontab file, which has a separate username column.",
          "Το crontab -e επεξεργάζεται το επαναλαμβανόμενο πρόγραμμα του τρέχοντος χρήστη, το e προέρχεται από τη λέξη edit (επεξεργασία). Στο παράδειγμα εμφανίζεται η επιλογή editor και επιλέγεται το 1 για το nano. Το GameHack προσομοιώνει αυτή τη μικρή αλληλεπίδραση: μετά το crontab -e γράψε 1 για να επιλέξεις το εικονικό nano και μετά χρησιμοποίησε υποστηριζόμενη εντολή VFS για την καταχώριση, επειδή το lab δεν ανοίγει πραγματικό διαδραστικό editor. Το εργαστήριο απαντά εμφανίζοντας τον τρέχοντα πίνακα και την ακριβή εντολή VFS που καταχωρίζει γραμμή, οπότε το επόμενο αντικείμενο συνεχίζει χωρίς μαντεψιές.\n\nΓια να ελέγξεις το περιεχόμενο, το crontab -l εμφανίζει τον προσωπικό πίνακα. Το crontab -e και το crontab -l αφορούν τον χρήστη που εκτελεί την εντολή, δεν είναι το ίδιο αρχείο με το /etc/crontab, το οποίο είναι ο κεντρικός πίνακας συστήματος.",
        ),
        [
          shot("crontab -e", ["Select an editor:", "1. /bin/nano", "2. /usr/bin/vim.tiny", "Choose 1-2 [1]:"]),
          shot("1", ["Selected editor: nano (simulated).", "# m h dom mon dow command", "Use echo \"55 23 * * * /root/scanner\" | crontab - to record a safe virtual schedule."]),
        ],
      ),
      section(
        bi("Five schedule fields and 23:55 every day", "Πέντε πεδία προγράμματος και κάθε μέρα στις 23:55"),
        bi(
          "A per-user crontab line has five time fields followed by a command: minute, hour, day of month, month, and day of week. In 55 23 * * * /root/scanner, minute 55 and hour 23 select 11:55 PM; the four asterisks mean every day of the month, every month, and every day of the week. The command path is the script cron should call, not a promise that it ran at the moment you saved the line.\n\nIn this lab, record the same row with echo \"55 23 * * * /root/scanner\" | crontab - and verify it with crontab -l. A real cron daemon uses the machine's configured time zone and may apply timing rules such as the special day-of-month/day-of-week behavior documented by the system. GameHack stores the per-player row but deliberately never executes it.\n\nMemorize the legal ranges with the fields: minute 0–59, hour 0–23 on the 24-hour clock, day of month 1–31, month 1–12, and day of week 0–7 where both 0 and 7 mean Sunday. An asterisk matches every value in its column, so 55 23 * * * reads as minute 55, hour 23, every day. Out-of-range values are rejected when the table loads, which is why reading the row aloud field by field is the fastest self-check. Cron mails a real job\u2019s output to its owner (or logs it); the lab has no output to deliver because the job never runs.",
          "Μια γραμμή προσωπικού crontab έχει πέντε πεδία χρόνου και μετά την εντολή: λεπτό, ώρα, ημέρα μήνα, μήνα και ημέρα εβδομάδας. Στο 55 23 * * * /root/scanner, τα 55 και 23 δηλώνουν 23:55, ενώ οι τρεις αστερίσκοι δηλώνουν κάθε ημέρα του μήνα, κάθε μήνα και κάθε ημέρα της εβδομάδας. Η διαδρομή είναι το script που θα καλούσε το cron, η αποθήκευση δεν δηλώνει ότι εκτελέστηκε εκείνη τη στιγμή.\n\nΣτο εργαστήριο καταχώρισε την ίδια γραμμή με echo \"55 23 * * * /root/scanner\" | crontab - και έπειτα επιβεβαίωσέ την με crontab -l. Η προσομοίωση αποθηκεύει τον πίνακα ανά παίκτη και δεν εκτελεί την εργασία αργότερα. Έτσι μπορείς να εξασκηθείς στη σύνταξη χωρίς να προκαλέσεις προγραμματισμένη ενέργεια σε πραγματικό σύστημα.\n\nΑπομνημόνευσε τα έγκυρα εύρη μαζί με τα πεδία: λεπτό 0–59, ώρα 0–23 στο 24ωρο ρολόι, ημέρα μήνα 1–31, μήνας 1–12 και ημέρα εβδομάδας 0–7, όπου το 0 και το 7 δηλώνουν Κυριακή. Ο αστερίσκος ταιριάζει με κάθε τιμή της στήλης του, οπότε το 55 23 * * * διαβάζεται λεπτό 55, ώρα 23, κάθε μέρα. Τιμές εκτός εύρους απορρίπτονται κατά τη φόρτωση του πίνακα, γι’ αυτό η φωναχτή ανάγνωση πεδίο προς πεδίο είναι ο ταχύτερος αυτοέλεγχος. Το cron στέλνει την έξοδο πραγματικής εργασίας με mail στον ιδιοκτήτη (ή την καταγράφει), το εργαστήριο δεν έχει έξοδο να παραδώσει επειδή η εργασία δεν εκτελείται ποτέ.",
        ),
        [
          shot('echo "55 23 * * * /root/scanner" | crontab -', ["installed 1 recurring entry in the virtual crontab (not executed)"]),
          shot("crontab -l", ["# m h dom mon dow command", "55 23 * * * /root/scanner"]),
        ],
      ),
      section(
        bi("Why /etc/crontab has an extra user field", "Γιατί το /etc/crontab έχει επιπλέον πεδίο χρήστη"),
        bi(
          "The system file /etc/crontab has seven columns: the same five schedule fields, a username, and the command. A per-user crontab omits the username because the file itself already belongs to one account, so it has five schedule fields plus the command. The article’s phrase “seven fields” describes /etc/crontab; its example saved through crontab -e is a user table and therefore contains six whitespace-separated parts.\n\nFor example, 17 * * * * root /path/to/command places root in the sixth column and the command path in the seventh. Do not copy that username field into a per-user table, where it would be treated as part of the command. cat /etc/crontab displays a harmless fixture so you can compare the formats.\n\nRead the top of the fixture as configuration, not schedule: SHELL=/bin/sh names the interpreter cron uses for job lines, and the long PATH line sets the command search path for those jobs. Below the field header sit two job rows \u2014 the hourly run-parts sweep and an every-minute backup call \u2014 each carrying the system table\u2019s extra username column you just learned to spot.",
          "Το αρχείο συστήματος /etc/crontab έχει επτά στήλες: τα ίδια πέντε πεδία χρόνου, ένα όνομα χρήστη και την εντολή. Το προσωπικό crontab παραλείπει τον χρήστη, επειδή ο ίδιος ο πίνακας ανήκει ήδη σε έναν λογαριασμό, έτσι έχει πέντε πεδία χρόνου και την εντολή. Η αναφορά του άρθρου σε «επτά πεδία» περιγράφει το /etc/crontab, ενώ το παράδειγμα που αποθηκεύεται με crontab -e είναι προσωπικός πίνακας με έξι τμήματα χωρισμένα με κενά.\n\nΣτο αρχείο συστήματος, μια γραμμή μπορεί να μοιάζει με 17 * * * * root /path/to/command, όπου το root είναι ο έκτος τομέας και ο δρόμος της εντολής ο έβδομος. Μην αντιγράψεις αυτό το πεδίο χρήστη σε προσωπικό crontab: εκεί θα ερμηνευόταν λανθασμένα ως μέρος της εντολής. Το cat /etc/crontab εμφανίζει ένα ασφαλές, εικονικό δείγμα για να συγκρίνεις τις δύο μορφές.\n\nΔιάβασε την κορυφή του fixture ως ρύθμιση και όχι ως πρόγραμμα: το SHELL=/bin/sh ονομάζει τον interpreter που χρησιμοποιεί το cron για τις γραμμές εργασιών, και η μακριά γραμμή PATH ορίζει τη διαδρομή αναζήτησης εντολών για αυτές τις εργασίες. Κάτω από την επικεφαλίδα πεδίων βρίσκονται δύο γραμμές εργασιών, η ωριαία σάρωση run-parts και μία κλήση backup κάθε λεπτό, καθεμία με την επιπλέον στήλη χρήστη του πίνακα συστήματος που μόλις έμαθες να εντοπίζεις.",
        ),
        [shot("cat /etc/crontab", [
          "# /etc/crontab: system crontab (GameHack lab)",
          "SHELL=/bin/sh",
          "PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin",
          "# m h dom mon dow user command",
          "17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly",
          "* * * * * root /usr/local/bin/backup.sh",
        ])],
      ),
      section(
        bi("SysV init, rc scripts, and runlevels", "SysV init, rc scripts και runlevels"),
        bi(
          "Traditional SysV systems use scripts in /etc/init.d and runlevel-specific links under directories such as /etc/rc2.d. A runlevel describes the kind of operating mode selected during boot. The familiar teaching table is 0 for halt, 1 for single-user or rescue mode, 2–5 for multi-user operation, and 6 for reboot; distributions can vary in how they assign the middle levels. The fixture spells levels 2 through 5 on separate rows for exactly that reason.\n\nLevels 0 and 6 describe shutdown and reboot, not ordinary working modes. Many current Linux distributions use systemd instead of the older rc links, but update-rc.d remains useful when reading legacy documentation. All runlevel folders in this lesson are virtual and cannot alter the server’s actual startup process.",
          "Τα παραδοσιακά συστήματα SysV χρησιμοποιούν scripts στο /etc/init.d και συνδέσμους ανά runlevel σε φακέλους όπως το /etc/rc2.d. Το runlevel περιγράφει τον τρόπο λειτουργίας που επιλέγεται κατά την εκκίνηση. Ο συνηθισμένος εκπαιδευτικός πίνακας είναι 0 για halt, 1 για single-user ή rescue mode, 2–5 για multi-user λειτουργία και 6 για reboot, οι διανομές μπορεί να διαφέρουν ως προς τα μεσαία επίπεδα. Το fixture γράφει τα επίπεδα 2 έως 5 σε χωριστές γραμμές ακριβώς γι’ αυτόν τον λόγο.\n\nΟι αριθμοί 0 και 6 περιγράφουν τερματισμό και επανεκκίνηση, όχι κανονικές καταστάσεις εργασίας. Πολλά σύγχρονα συστήματα χρησιμοποιούν systemd αντί για τα παλιά rc links, όμως το update-rc.d παραμένει χρήσιμο για να αναγνωρίζεις παλαιότερη τεκμηρίωση. Οι σχετικές διαδρομές στο μάθημα είναι εικονικές και δεν ελέγχουν την εκκίνηση του πραγματικού server.",
        ),
        [shot("cat /root/linux-beginners-3/runlevels.txt", [
          "Traditional SysV runlevel reference (the exact meaning can vary by distribution):",
          "0  halt / stop the system",
          "1  single-user or rescue mode",
          "2  multi-user mode",
          "3  multi-user mode",
          "4  multi-user mode",
          "5  multi-user mode",
          "6  reboot",
          "",
          "These are teaching notes only; GameHack never changes the host boot mode.",
        ])],
      ),
      section(
        bi("update-rc.d, reboot, and ps aux | grep mysql", "update-rc.d, reboot και ps aux | grep mysql"),
        bi(
          "update-rc.d configures legacy boot links for a service. update-rc.d mysql defaults creates the conventional start/stop links for the default runlevels; the article also names remove, disable, and enable. In this simulator, defaults and enable mark the service for the next simulated boot, disable prevents that autostart, and remove deletes only the virtual rc links. None of those settings starts MySQL immediately. Real systems print Synchronizing state ... and Executing: ... enable ... lines while the links are written; the lab answers with its one-line enabled verdict instead.\n\nThe lesson's reboot applies the final saved boot choice only to your simulated services and records the event in the virtual syslog. Afterwards, ps aux prints a process snapshot and grep mysql keeps the matching row. The displayed mysqld is fictional; no host is rebooted and no host process is created. On a real machine the grep row for mysql would appear alongside the daemon row; the lab shows fixture rows only, so a single mysqld line is the complete expected result.",
          "Η update-rc.d ρυθμίζει παλιούς συνδέσμους εκκίνησης μιας υπηρεσίας. Η update-rc.d mysql defaults δημιουργεί τους συνηθισμένους συνδέσμους start/stop για τα προεπιλεγμένα runlevels, το άρθρο αναφέρει επίσης τα remove, disable και enable. Στον προσομοιωτή, τα defaults και enable δηλώνουν αυτόματη εκκίνηση στο επόμενο εικονικό boot, το disable την απενεργοποιεί και το remove διαγράφει μόνο τους εικονικούς rc links. Καμία από αυτές τις ρυθμίσεις δεν ξεκινά αμέσως το MySQL. Τα πραγματικά συστήματα εμφανίζουν γραμμές Synchronizing state ... και Executing: ... enable ... όσο γράφονται οι σύνδεσμοι, το εργαστήριο απαντά με τη μονογραμμική ετυμηγορία enabled.\n\nΗ επανεκκίνηση του άρθρου αναπαρίσταται με reboot, το οποίο αλλάζει μόνο τις υπηρεσίες της προσωπικής προσομοίωσης και γράφει σχετική εγγραφή στο εικονικό syslog. Μετά, το ps aux εμφανίζει διεργασίες όλων των χρηστών και το grep mysql κρατά τις γραμμές που ταιριάζουν. Το GameHack δεν επανεκκινεί host ούτε ξεκινά πραγματικό mysqld, η γραμμή που βλέπεις είναι εικονική διεργασία μέσα στο VFS. Σε πραγματικό μηχάνημα η γραμμή grep για το mysql θα εμφανιζόταν δίπλα στη γραμμή του daemon, το εργαστήριο εμφανίζει μόνο γραμμές fixture, οπότε μία γραμμή mysqld είναι το πλήρες αναμενόμενο αποτέλεσμα.",
        ),
        [
          shot("update-rc.d mysql defaults", ["update-rc.d: mysql enabled for the simulated default runlevels 2, 3, 4 and 5."]),
          shot("reboot", [
            "GameHack reboot simulated; only virtual boot-enabled services were updated.",
            "Started: mysql. No host reboot occurred.",
          ]),
          shot("ps aux | grep mysql", ["mysql     3410  0.1  1.2   44253  7373 ?        S    09:00  0:00 mysqld --defaults-file=/etc/mysql/my.cnf (simulated)"]),
        ],
      ),
      section(
        bi("systemctl, is-active and systemd timers", "systemctl, is-active και systemd timers"),
        bi(
          "Before you schedule anything, confirm that the scheduler itself is running, because minimal installs sometimes ship without it. The traditional check is service cron status and the modern one is systemctl status cron, which prints a small report card. Loaded tells you whether the unit is enabled for boot, and Active tells you whether it runs right now; a unit can be enabled and still inactive, which means a scheduled job would not fire until the next start. systemctl is-active cron answers with one word, which is the form to use inside a script.\n\nOn systemd distributions the equivalents are systemctl start cron and systemctl stop cron for immediate control, systemctl enable cron for boot, and systemctl is-enabled cron for the boot question alone. Debian names the unit cron while the Red Hat family names it crond, so check the name before you conclude that a scheduler is missing. The modern counterpart of a crontab line is a systemd timer: it pairs a .timer unit with a .service unit and supports conditions such as ten minutes after boot, and systemctl list-timers --all lists every scheduled timer. This lab records timers and crontab lines without executing either.",
          "Πριν προγραμματίσεις οτιδήποτε, επιβεβαίωσε ότι ο ίδιος ο scheduler εκτελείται, επειδή οι λιτές εγκαταστάσεις μερικές φορές έρχονται χωρίς αυτόν. Ο παραδοσιακός έλεγχος είναι service cron status και ο σύγχρονος systemctl status cron, που εμφανίζει μικρή κάρτα αναφοράς. Το Loaded λέει αν η μονάδα είναι ενεργοποιημένη για εκκίνηση και το Active αν εκτελείται τώρα. Μια μονάδα μπορεί να είναι enabled και ταυτόχρονα inactive, που σημαίνει ότι η προγραμματισμένη εργασία δεν θα εκτελούνταν μέχρι την επόμενη εκκίνηση. Το systemctl is-active cron απαντά με μία λέξη, που είναι η μορφή για χρήση μέσα σε σενάριο.\n\nΣτις διανομές με systemd τα αντίστοιχα είναι systemctl start cron και systemctl stop cron για άμεσο έλεγχο, systemctl enable cron για εκκίνηση στο boot και systemctl is-enabled cron μόνο για το ερώτημα της εκκίνησης. Στο Debian η μονάδα ονομάζεται cron ενώ στην οικογένεια Red Hat ονομάζεται crond, οπότε έλεγξε το όνομα πριν συμπεράνεις ότι λείπει scheduler. Η σύγχρονη αντίστοιχη μορφή μιας γραμμής crontab είναι το systemd timer: ζευγαρώνει μια μονάδα .timer με μια .service και υποστηρίζει συνθήκες όπως δέκα λεπτά μετά την εκκίνηση, ενώ το systemctl list-timers --all εμφανίζει όλα τα προγραμματισμένα χρονόμετρα. Αυτό το εργαστήριο καταγράφει χρονόμετρα και γραμμές crontab χωρίς να εκτελεί τίποτα από τα δύο.",
        ),
        [
          shot("systemctl is-active cron", ["inactive"]),
          shot("systemctl start cron", ["Created symlink /etc/systemd/system/multi-user.target.wants/cron.service (simulated); boot state is now enabled."]),
          shot("systemctl list-timers", ["NEXT                        LEFT        LAST                        PASSED   UNIT                         ACTIVATES"]),
        ],
      ),
    ],
    cheats: [
      { cmd: "service cron status", desc: bi("inspect the simulated scheduler", "έλεγχος του εικονικού scheduler") },
      { cmd: "service cron start", desc: bi("start cron inside this virtual lab", "εκκίνηση του cron μέσα στο εικονικό lab") },
      { cmd: "systemctl is-active cron", desc: bi("one-word answer for scripts", "απάντηση μίας λέξης για σενάρια") },
      { cmd: "systemctl is-enabled cron", desc: bi("does it start at boot?", "εκκινεί στο boot;") },
      { cmd: "systemctl list-timers", desc: bi("list the recorded schedule", "εμφάνιση του καταγεγραμμένου προγράμματος") },
      { cmd: "cat /etc/crontab", desc: bi("read the system table and its user column", "ανάγνωση του system table και του πεδίου χρήστη") },
      { cmd: "crontab -e", desc: bi("open the current user’s schedule", "άνοιγμα του προγράμματος του τρέχοντος χρήστη") },
      { cmd: "crontab -l", desc: bi("list the current user’s schedule", "εμφάνιση του προγράμματος του τρέχοντος χρήστη") },
      { cmd: 'echo "55 23 * * * /root/scanner" | crontab -', desc: bi("store the daily 23:55 example without running it", "αποθήκευση του παραδείγματος 23:55 χωρίς εκτέλεση") },
      { cmd: "update-rc.d mysql defaults", desc: bi("enable virtual boot links", "ενεργοποίηση εικονικών συνδέσμων εκκίνησης") },
      { cmd: "update-rc.d mysql disable", desc: bi("disable virtual autostart", "απενεργοποίηση εικονικής αυτόματης εκκίνησης") },
      { cmd: "update-rc.d mysql enable", desc: bi("enable virtual autostart", "ενεργοποίηση εικονικής αυτόματης εκκίνησης") },
      { cmd: "update-rc.d mysql remove", desc: bi("remove only the virtual rc links", "αφαίρεση μόνο των εικονικών rc links") },
      { cmd: "reboot", desc: bi("simulate a per-player reboot", "προσομοίωση επανεκκίνησης του παίκτη") },
      { cmd: "ps aux | grep mysql", desc: bi("filter the simulated process list", "φιλτράρισμα της εικονικής λίστας διεργασιών") },
    ],
    tasks: [
      task(
        "cron-service",
        bi(
          "Read /etc/crontab, inspect the cron service, and start it if the virtual state is inactive. Compare the status before and after rather than assuming the service is running.",
          "Διάβασε το /etc/crontab, έλεγξε την υπηρεσία cron και ξεκίνησέ την αν είναι ανενεργή. Σύγκρινε την κατάσταση πριν και μετά, αντί να θεωρήσεις ότι λειτουργεί.",
        ),
        bi("cat /etc/crontab\nservice cron status\nservice cron start\nservice cron status", "cat /etc/crontab\nservice cron status\nservice cron start\nservice cron status"),
        bi(
          "The system table demonstrates the extra username column, while service status and start concern the scheduler daemon. All four commands read or update virtual state; they do not edit the host’s crontab or launch cron on the web server.",
          "Ο πίνακας συστήματος δείχνει την επιπλέον στήλη χρήστη, ενώ τα status και start αφορούν τον scheduler daemon. Και οι τέσσερις εντολές διαβάζουν ή αλλάζουν εικονική κατάσταση, δεν επεξεργάζονται το crontab του host ούτε ξεκινούν cron στον web server.",
        ),
        (term) => term.filesRead.some((path) => path.endsWith("/etc/crontab")) && term.flags.has("service-cron-start"),
      ),
      task(
        "choose-editor",
        bi(
          "Open the current user’s crontab and select option 1 for nano, as in the reference screenshots. The lab displays a simulated editor choice instead of opening a real process.",
          "Άνοιξε το crontab του τρέχοντος χρήστη και επίλεξε 1 για nano, όπως στα στιγμιότυπα αναφοράς. Το lab εμφανίζει εικονική επιλογή editor και δεν ανοίγει πραγματική διεργασία.",
        ),
        bi("crontab -e\n1", "crontab -e\n1"),
        bi(
          "The -e option requests editing; the numeric choice selects the editor configured for this exercise. GameHack records that choice and leaves the terminal available for the safe VFS-based schedule command in the next objective.",
          "Η επιλογή -e ζητά επεξεργασία και ο αριθμός επιλέγει τον editor της άσκησης. Το GameHack αποθηκεύει την επιλογή και κρατά το τερματικό διαθέσιμο για την ασφαλή εντολή VFS στο επόμενο αντικείμενο.",
        ),
        (term) => term.flags.has("crontab-e") && term.flags.has("crontab-editor-nano") && !term.crontabEditorPending,
      ),
      task(
        "save-nightly-schedule",
        bi(
          "Save the article’s exact daily scan schedule in the virtual per-user crontab, then list it to verify the saved row. The scheduled script is recorded only; it will never run in the background.",
          "Αποθήκευσε το ακριβές ημερήσιο πρόγραμμα σάρωσης του άρθρου στο εικονικό crontab χρήστη και εμφάνισέ το για επιβεβαίωση. Το script απλώς καταγράφεται και δεν θα εκτελεστεί στο παρασκήνιο.",
        ),
        bi('echo "55 23 * * * /root/scanner" | crontab -\ncrontab -l', 'echo "55 23 * * * /root/scanner" | crontab -\ncrontab -l'),
        bi(
          "The first five values describe 23:55 every day, and the remaining text is the command path. crontab -l should show the exact row; a user table does not include the extra account name used by /etc/crontab.",
          "Οι πέντε πρώτες τιμές περιγράφουν κάθε μέρα στις 23:55 και το υπόλοιπο κείμενο είναι η διαδρομή εντολής. Το crontab -l πρέπει να εμφανίσει ακριβώς τη γραμμή, ο προσωπικός πίνακας δεν έχει το επιπλέον όνομα χρήστη του /etc/crontab.",
        ),
        (term) => term.crontab.some((line) => line === "55 23 * * * /root/scanner"),
      ),
      task(
        "inspect-runlevels",
        bi(
          "Read the local runlevel table and identify which entries mean halt, single-user mode, multi-user operation, and reboot. Use the table as historical context for the rc scripts rather than as an instruction to change the real machine.",
          "Διάβασε τον τοπικό πίνακα runlevels και εντόπισε ποιοι αριθμοί αντιστοιχούν σε halt, single-user mode, multi-user λειτουργία και reboot. Χρησιμοποίησέ τον ως ιστορικό πλαίσιο για τα rc scripts, όχι ως οδηγία αλλαγής του πραγματικού μηχανήματος.",
        ),
        bi("cat /root/linux-beginners-3/runlevels.txt", "cat /root/linux-beginners-3/runlevels.txt"),
        bi(
          "Runlevels describe boot modes in traditional SysV init. Their meaning is distribution-specific, and level 0 and 6 are shutdown/reboot states rather than ordinary destinations for a learner’s service.",
          "Τα runlevels περιγράφουν λειτουργίες εκκίνησης στο παραδοσιακό SysV init. Η σημασία τους εξαρτάται από τη διανομή και τα επίπεδα 0 και 6 είναι καταστάσεις τερματισμού/επανεκκίνησης, όχι συνηθισμένοι στόχοι υπηρεσιών.",
        ),
        (term) => term.filesRead.some((path) => path.endsWith("/linux-beginners-3/runlevels.txt")),
      ),
      task(
        "configure-mysql-boot",
        bi(
          "Record the default MySQL boot links, exercise disable, enable, and remove, then restore defaults and simulate a reboot. Finally inspect the virtual process list for mysql.",
          "Καταχώρισε τους προεπιλεγμένους συνδέσμους εκκίνησης του MySQL, δοκίμασε disable, enable και remove, επανάφερε defaults και προσομοίωσε επανεκκίνηση. Στο τέλος έλεγξε την εικονική λίστα διεργασιών για mysql.",
        ),
        bi(
          "update-rc.d mysql defaults\nupdate-rc.d mysql disable\nupdate-rc.d mysql enable\nupdate-rc.d mysql remove\nupdate-rc.d mysql defaults\nreboot\nps aux | grep mysql",
          "update-rc.d mysql defaults\nupdate-rc.d mysql disable\nupdate-rc.d mysql enable\nupdate-rc.d mysql remove\nupdate-rc.d mysql defaults\nreboot\nps aux | grep mysql",
        ),
        bi(
          "defaults and enable arrange a future start; disable prevents it, while remove deletes the links rather than uninstalling MySQL. The simulated reboot applies the final enabled state to this player’s service record, and ps aux | grep mysql reads the matching virtual process.",
          "Τα defaults και enable ρυθμίζουν μελλοντική εκκίνηση, το disable την αποτρέπει, ενώ το remove διαγράφει τους συνδέσμους χωρίς να απεγκαθιστά το MySQL. Η εικονική επανεκκίνηση εφαρμόζει την τελική κατάσταση στην υπηρεσία του παίκτη και το ps aux | grep mysql διαβάζει την εικονική διεργασία.",
        ),
        (term) =>
          ["defaults", "disable", "enable", "remove"].every((action) => term.flags.has(`rc-mysql-${action}`)) &&
          term.flags.has("reboot") && term.procs.some((process) => process.alive && /mysqld/.test(process.cmd)),
      ),
      task(
        "systemd-view",
        bi(
          "Ask the same question in the systemd dialect: is the scheduler active, does it start at boot, and what schedule is recorded?",
          "Κάνε το ίδιο ερώτημα στη διάλεκτο του systemd: είναι ενεργός ο scheduler, εκκινεί στο boot και ποιο πρόγραμμα έχει καταγραφεί;",
        ),
        bi("systemctl is-active cron\nsystemctl is-enabled cron\nsystemctl list-timers", "systemctl is-active cron\nsystemctl is-enabled cron\nsystemctl list-timers"),
        bi(
          "Why: Enabled and active answer different questions, and a scheduled job needs both. How: is-active reports the current state in one word, is-enabled reports the boot setting, and list-timers shows the recorded schedule. The lab answers from its own service and schedule records; nothing runs on the host.",
          "Γιατί: Το enabled και το active απαντούν σε διαφορετικά ερωτήματα και μια προγραμματισμένη εργασία χρειάζεται και τα δύο. Πώς: το is-active αναφέρει την τρέχουσα κατάσταση με μία λέξη, το is-enabled τη ρύθμιση εκκίνησης και το list-timers το καταγεγραμμένο πρόγραμμα. Το εργαστήριο απαντά από τα δικά του αρχεία υπηρεσιών και προγράμματος, τίποτα δεν εκτελείται στον υπολογιστή.",
        ),
        (term) => usedCmd(term, /systemctl\s+is-active/) && usedCmd(term, /systemctl\s+is-enabled/) && usedCmd(term, /systemctl\s+list-timers/),
      ),
    ],
    challenges: [
      {
        title: bi("Distinguish user and system tables", "Διάκριση προσωπικού και system table"),
        brief: bi("Read the system table with cat /etc/crontab and your own user table with crontab -l, then explain the difference: the system table carries a username field because it can run entries as any account, and the user table cannot.", "Διάβασε τον πίνακα συστήματος με cat /etc/crontab και τον δικό σου πίνακα χρήστη με crontab -l, και μετά εξήγησε τη διαφορά: ο πίνακας συστήματος κουβαλά πεδίο χρήστη γιατί μπορεί να τρέχει εγγραφές ως οποιοδήποτε λογαριασμό, ο πίνακας χρήστη όχι."),
        success: bi(
          "You can now read both cron formats without shifting the command into the wrong field.",
          "Μπορείς πλέον να διαβάζεις και τις δύο μορφές cron χωρίς να μετακινείς την εντολή σε λάθος πεδίο.",
        ),
        check: (term) => term.filesRead.some((path) => path.endsWith("/etc/crontab")) && term.crontab.some((line) => line.startsWith("55 23")),
      },
      {
        title: bi("Submit the timekeeper flag", "Υποβολή σημαίας φύλακα χρόνου"),
        brief: bi("Save the schedule, review how the simulated boot services behave, and then submit FLAG{linux_beginners_3_cron}. The point of the flag is that you can now tell a user schedule from a system one and say which runs when.", "Αποθήκευσε το πρόγραμμα, εξέτασε πώς συμπεριφέρονται οι εικονικές υπηρεσίες εκκίνησης και μετά υπέβαλε το FLAG{linux_beginners_3_cron}. Το νόημα του flag είναι ότι τώρα ξεχωρίζεις ένα πρόγραμμα χρήστη από ένα συστήματος και λες ποιο τρέχει πότε."),
        success: bi(
          "Cron and legacy boot configuration are understood; all changes remain local to your player state.",
          "Κατανόησες το cron και την παλιά ρύθμιση εκκίνησης.",
        ),
        check: (term) => submitCheck(term, "FLAG{linux_beginners_3_cron}"),
      },
    ],
  },
  {
    id: "sr-svc",
    order: 3,
    icon: "globe",
    color: "from-rose-400 to-rose-900",
    difficulty: 3,
    scenario: lab,
    title: bi("Apache, OpenSSH, and FTP services", "Υπηρεσίες Apache, OpenSSH και FTP"),
    subtitle: bi(
      "Start, inspect, edit, and stop fictional services without leaving the VFS",
      "Εκκίνηση, έλεγχος και επεξεργασία εικονικών υπηρεσιών μέσα στο VFS",
    ),
    badge: bi("Service Operator", "Χειριστής υπηρεσιών"),
    theory: [
      section(
        bi("service NAME ACTION", "service NAME ACTION"),
        bi(
          "A service is a background program that offers a capability such as serving web pages or accepting encrypted remote shells. The traditional command form is service NAME start, status, stop, or restart. Start and stop change whether the simulated service is running; status reports the current state, and restart models a stop/start cycle after a configuration change.\n\nThe course walks Apache through each of those actions and starts the virtual SSH service separately. Responses are stored in the player’s terminal state, and the corresponding files under /etc/init.d are text fixtures only. No daemon runs on the host or inside the website server.\n\nA real status call prints a small report card: Loaded names the unit file and whether it is enabled, Active gives the state plus its timestamp, and Main PID, Tasks, and Memory identify the supervised process group. The lab compresses all of that into two lines \u2014 the service name with its state, and the Active verdict \u2014 so practice translating both directions: expand the lab line into the real fields in your notes, and reduce any real status block to name plus state at a glance.",
          "Μια υπηρεσία είναι πρόγραμμα παρασκηνίου που προσφέρει λειτουργία, όπως προβολή ιστοσελίδων ή αποδοχή κρυπτογραφημένων απομακρυσμένων shell. Η παραδοσιακή μορφή είναι service NAME και έπειτα start, status, stop ή restart. Τα start και stop αλλάζουν την εικονική κατάσταση, το status την εμφανίζει και το restart αναπαριστά κύκλο διακοπής/εκκίνησης μετά από αλλαγή ρυθμίσεων.\n\nΣτο μάθημα θα χρησιμοποιήσεις τις service apache2 start, status, stop και restart, καθώς και την service ssh start. Τα μηνύματα και οι μεταβάσεις αποθηκεύονται στο προσωπικό terminal state. Δεν ξεκινούν πραγματικά daemons και δεν δημιουργούν διεργασίες στο host.\n\nΗ πραγματική κλήση status εμφανίζει μικρή κάρτα αναφοράς: το Loaded ονομάζει το unit file και αν είναι enabled, το Active δίνει την κατάσταση με χρονική σήμανση, και τα Main PID, Tasks και Memory προσδιορίζουν την επιτηρούμενη ομάδα διεργασιών. Το εργαστήριο συμπυκνώνει όλα αυτά σε δύο γραμμές, το όνομα υπηρεσίας με την κατάστασή του και την ετυμηγορία Active, οπότε εξασκήσου στη μετάφραση και προς τις δύο κατευθύνσεις: ανάλυσε τη γραμμή του εργαστηρίου στα πραγματικά πεδία στις σημειώσεις σου, και περιόρισε κάθε πραγματικό μπλοκ status σε όνομα και κατάσταση με μία ματιά.",
        ),
        [
          shot("service apache2 start", ["starting apache2 (simulated)."]),
          shot("service apache2 status", ["● apache2.service — running", "   Active: active (running)"]),
          shot("service apache2 stop", ["stopping apache2 (simulated)."]),
          shot("service apache2 restart", ["restarting apache2 (simulated)."]),
        ],
      ),
      section(
        bi("Apache, nano, and the local web page", "Apache, nano και η τοπική σελίδα"),
        bi(
          "Apache serves files from its document root; in this lesson the page is /var/www/html/index.html. nano opens a virtual preview of that file so you can inspect the starter HTML. GameHack does not launch an editor process, but you can save a small VFS-only example with echo \"<h1>GameHack</h1>\" > /var/www/html/index.html and then read the result with cat.\n\nOnce the virtual Apache service is running, curl http://localhost returns the content of that local index.html. On a normal computer localhost points to a service on that same computer; here the address is intercepted by the simulator and never reaches the server host or the Internet.\n\nFetch before starting Apache and curl fails loudly instead: curl: (7) Failed to connect ... Connection refused names the refused localhost port and notes the simulated daemon is stopped. That refusal is useful data \u2014 it proves the request reached the simulator\u2019s listener table and found nothing there. curl prints only the response body, so a successful fetch shows your heading and nothing else; headers stay hidden unless a real-world flag asks for them.",
          "Ο Apache σερβίρει αρχεία από το document root, στο μάθημα η σελίδα είναι το /var/www/html/index.html. Η nano ανοίγει εικονική προεπισκόπηση του αρχείου για να ελέγξεις το αρχικό HTML. Το GameHack δεν ξεκινά editor process, αλλά μπορείς να αποθηκεύσεις μικρό παράδειγμα μόνο στο VFS με echo \"<h1>GameHack</h1>\" > /var/www/html/index.html και έπειτα να το διαβάσεις με cat.\n\nΌταν η εικονική υπηρεσία Apache είναι ενεργή, το curl http://localhost επιστρέφει το περιεχόμενο του τοπικού index.html. Σε κανονικό υπολογιστή το http://localhost θα άνοιγε την ίδια τοπική υπηρεσία σε browser, στο GameHack η διεύθυνση παραμένει εικονική και δεν κάνει αίτημα στον host ή στο Internet.\n\nΖήτησε πριν ξεκινήσει ο Apache και η curl αποτυγχάνει ηχηρά: το curl: (7) Failed to connect ... Connection refused ονομάζει την απορριφθείσα θύρα localhost και σημειώνει ότι ο προσομοιωμένος daemon είναι σταματημένος. Η άρνηση είναι χρήσιμο δεδομένο, αποδεικνύει ότι το αίτημα έφτασε στον πίνακα ακροατών του προσομοιωτή και δε βρήκε τίποτα εκεί. Η curl εμφανίζει μόνο το σώμα της απόκρισης, οπότε η επιτυχής ανάκτηση δείχνει την επικεφαλίδα σου και τίποτα άλλο, οι κεφαλίδες μένουν κρυφές εκτός αν ζητηθούν με σημαία πραγματικού κόσμου.",
        ),
        [
          shot("nano /var/www/html/index.html", ["<!DOCTYPE html>", "<html>", "<head><title>Apache2 Debian Default Page</title></head>", "<body>", "<h1>Apache2 Debian Default Page</h1>", "<p>It works! This is the GameHack Sudo_Run web root at /var/www/html/index.html</p>", "</body>", "</html>", ""]),
          shot("curl http://localhost", ["curl: (7) Failed to connect to localhost port 80: Connection refused (Apache is stopped in the simulated lab)."]),
          shot('echo "<h1>GameHack</h1>" > /var/www/html/index.html', [""]),
          shot("curl http://localhost", ["<h1>GameHack</h1>", ""]),
        ],
      ),
      section(
        bi("OpenSSH, a fictional host, and telnet’s warning", "OpenSSH, φανταστικός host και η προειδοποίηση για το telnet"),
        bi(
          "SSH provides an encrypted remote shell. Start the simulated local service with service ssh start, then try ssh ignite@192.168.0.11; GameHack maps that private address to its fictional ubuntu fixture and changes only the terminal’s simulated session. Use exit to return to the local prompt after inspecting the welcome banner.\n\nTelnet is a historical remote-terminal protocol that sends data without encryption, so it is not a safe substitute for SSH. GameHack accepts only a warning-only comparison and rejects the connection before opening a socket or displaying any real credentials.\n\nOn a real first connection the client would pause before any of this: it prints the host\u2019s key fingerprint, asks Are you sure you want to continue connecting, and only then prompts for the account password. The lab skips that handshake and lands you directly on the fixture banner ending in ignite@ubuntu:~$, where the prompt shape user@host:path$ tells you the session moved. Type exit to close it; the lab answers Connection closed and restores the saved local prompt.",
          "Το SSH παρέχει κρυπτογραφημένο απομακρυσμένο shell. Ξεκίνα την εικονική υπηρεσία με service ssh start και δοκίμασε ssh ignite@192.168.0.11, το GameHack αντιστοιχίζει αυτή την ιδιωτική διεύθυνση στο φανταστικό fixture ubuntu και αλλάζει μόνο την εικονική συνεδρία του τερματικού. Με το exit επιστρέφεις στο τοπικό prompt αφού ελέγξεις το μήνυμα υποδοχής.\n\nΤο telnet είναι παλαιότερο πρωτόκολλο απομακρυσμένου τερματικού και στέλνει τα δεδομένα χωρίς κρυπτογράφηση, οπότε δεν είναι ασφαλής εναλλακτική του SSH. Το μάθημα επιτρέπει μόνο μια τοπική προειδοποιητική προσομοίωση για σύγκριση, δεν επιχειρεί σύνδεση και δεν εμφανίζει πραγματικό password ή session.\n\nΣε πραγματική πρώτη σύνδεση ο client θα σταματούσε πριν από όλα αυτά: εμφανίζει το δακτυλικό αποτύπωμα κλειδιού του host, ρωτά Are you sure you want to continue connecting και μόνο μετά ζητά το password του λογαριασμού. Το εργαστήριο παραλείπει τη χειραψία και σε προσγειώνει απευθείας στο banner του fixture που λήγει σε ignite@ubuntu:~$, όπου το σχήμα prompt user@host:path$ δηλώνει ότι η συνεδρία μετακινήθηκε. Γράψε exit για να την κλείσεις, το εργαστήριο απαντά Connection closed και επαναφέρει το αποθηκευμένο τοπικό prompt.",
        ),
        [
          shot("service ssh start", ["starting ssh (simulated)."]),
          shot("ssh ignite@192.168.0.11", ["Welcome to ubuntu (GameHack lab host)", "Last login: simulated", "ignite@ubuntu:~$"]),
          shot("telnet ignite@192.168.0.11 23", ["telnet is plaintext and disabled for connections; use the simulated SSH lesson instead."]),
        ],
        bi(
          "The private IP is a fixture, not a host that is reached over a network. The simulator rejects telnet rather than opening a socket.",
          "Η ιδιωτική IP είναι fixture και όχι host στο οποίο γίνεται δικτυακή σύνδεση. Ο προσομοιωτής απορρίπτει το telnet αντί να ανοίξει socket.",
        ),
      ),
      section(
        bi("FTP: list, navigate, get, and bye", "FTP: λίστα, πλοήγηση, get και bye"),
        bi(
          "FTP transfers files through a command-line session, but traditional FTP does not encrypt credentials or file contents. The public example in the article uses ftp ftp.cesca.es; GameHack intentionally blocks external FTP names and provides ftp ftp.gamehack.lab instead. After connecting, type anonymous for the username and again for the sample password.\n\nAt the fixture prompt, use ls to inspect the remote root, cd ubuntu and cd release to reach the training folder, then get favicon.ico to copy that fixture into your current local VFS directory. bye closes the remote session; a final local ls should show the downloaded file. Nothing is fetched from the public server. Back on the local prompt, ls -l favicon.ico confirms the souvenir with permissions, size, and name.\n\nThe three-digit codes are the actual protocol conversation: 220 greets a new connection, 331 asks for the password once the username is known, 230 confirms the login, 250 acknowledges each directory change, 226 reports a finished transfer, and 221 says goodbye. Real servers add a 150 Opening data connection line while bytes move; the lab compresses that moment into the local:/remote: filename pair, so read the pair plus 226 as one completed download. Real servers also show PORT or PASV negotiation and a final bytes-received summary; the lab omits both and keeps the 226 verdict.",
          "Το FTP μεταφέρει αρχεία μέσα από συνεδρία γραμμής εντολών, αλλά το παραδοσιακό FTP δεν κρυπτογραφεί credentials ή περιεχόμενο. Το δημόσιο παράδειγμα του άρθρου είναι ftp ftp.cesca.es, το GameHack μπλοκάρει σκόπιμα εξωτερικά ονόματα και παρέχει το ftp ftp.gamehack.lab. Μετά τη σύνδεση γράψε anonymous ως όνομα χρήστη και ξανά ως δοκιμαστικό password.\n\nΣτο εικονικό server, το ls εμφανίζει τους φακέλους, το cd ubuntu και μετά cd release σε οδηγούν στο fixture και το get favicon.ico αντιγράφει το αρχείο στον τρέχοντα φάκελο του VFS σου. Η εντολή bye κλείνει τη συνεδρία FTP, μετά χρησιμοποίησε το τοπικό ls για να επιβεβαιώσεις ότι το αρχείο κατέβηκε. Κανένα αίτημα δεν φεύγει από το sandbox. Πίσω στο τοπικό prompt, το ls -l favicon.ico επιβεβαιώνει το αρχείο με δικαιώματα, μέγεθος και όνομα.\n\nΟι τριψήφιοι κωδικοί είναι η πραγματική συνομιλία πρωτοκόλλου: το 220 χαιρετά νέα σύνδεση, το 331 ζητά password αφού γίνει γνωστό το όνομα χρήστη, το 230 επιβεβαιώνει τη σύνδεση, το 250 επιβεβαιώνει κάθε αλλαγή φακέλου, το 226 αναφέρει ολοκληρωμένη μεταφορά και το 221 αποχαιρετά. Οι πραγματικοί servers προσθέτουν γραμμή 150 Opening data connection όσο κινούνται bytes, το εργαστήριο συμπυκνώνει εκείνη τη στιγμή στο ζεύγος ονομάτων local:/remote:, οπότε διάβασε το ζεύγος μαζί με το 226 ως μία ολοκληρωμένη λήψη. Οι πραγματικοί servers εμφανίζουν επίσης διαπραγμάτευση PORT ή PASV και τελική σύνοψη ληφθέντων bytes, το εργαστήριο παραλείπει και τα δύο και κρατά την ετυμηγορία 226.",
        ),
        [
          shot("ftp ftp.gamehack.lab", ["Connected to ftp.gamehack.lab.", "220 GameHack FTP server (simulated)", "Name (ftp.gamehack.lab:root):"]),
          shot("anonymous", ["331 Please specify the password."]),
          shot("anonymous", ["230 Login successful. Use ls, cd, get, bye."]),
          shot("ls", ["-rw-r--r--  welcome.txt", "drwxr-xr-x  ubuntu"]),
          shot("cd ubuntu", ["250 Directory successfully changed."]),
          shot("cd release", ["250 Directory successfully changed."]),
          shot("ls", ["-rw-r--r--  favicon.ico", "-rw-r--r--  release-notes.txt"]),
          shot("get favicon.ico", ["local: favicon.ico remote: favicon.ico", "226 Transfer complete."]),
          shot("bye", ["221 Goodbye."]),
        ],
        bi(
          "The remote folder and favicon.ico are text fixtures under /srv/ftp in the player’s shared virtual filesystem. The article’s public server is never contacted.",
          "Ο απομακρυσμένος φάκελος και το favicon.ico είναι αρχεία fixture στο /srv/ftp του κοινού εικονικού συστήματος του παίκτη. Δεν γίνεται ποτέ σύνδεση στον δημόσιο server του άρθρου.",
        ),
      ),
      section(
        bi("apache2ctl, systemctl and ss: who is listening", "apache2ctl, systemctl και ss: ποιος ακούει"),
        bi(
          "Some services ship their own control script. apache2ctl configtest parses the configuration and answers Syntax OK without opening a port, apache2ctl -S prints the virtual-host layout, and apache2ctl start, stop, restart, or graceful control the daemon. On systemd machines the same four verbs are written systemctl start apache2, and service is a thin wrapper around it, so both spellings reach the same state; systemctl is-enabled adds the boot question that service never answered.\n\nStarting a web server is the moment a machine becomes reachable, so confirm it from the socket side. ss -tlnp is the modern replacement for netstat: -t selects TCP, -u UDP, -l listening sockets, -n numeric output, and -p the owning process. A row reading 0.0.0.0:80 with users:((\"apache2\",...)) means the service listens on every interface, while 127.0.0.1:3306 means a database answers only to the local machine. Read those two shapes as a security statement before you read them as a status report, and pipe the result into grep when you only care about one port: ss -tlnp | grep :22.",
          "Κάποιες υπηρεσίες έχουν το δικό τους σενάριο ελέγχου. Το apache2ctl configtest διαβάζει τις ρυθμίσεις και απαντά Syntax OK χωρίς να ανοίξει θύρα, το apache2ctl -S εμφανίζει τη διάταξη των virtual hosts και τα apache2ctl start, stop, restart ή graceful ελέγχουν τον δαίμονα. Σε μηχανήματα με systemd τα ίδια τέσσερα ρήματα γράφονται systemctl start apache2, ενώ το service είναι απλό wrapper από πάνω, οπότε και οι δύο μορφές φτάνουν στην ίδια κατάσταση, το systemctl is-enabled προσθέτει το ερώτημα της εκκίνησης που το service δεν απαντούσε ποτέ.\n\nΗ εκκίνηση ενός web server είναι η στιγμή που το μηχάνημα γίνεται προσβάσιμο, οπότε επιβεβαίωσέ το από την πλευρά των υποδοχών. Το ss -tlnp είναι ο σύγχρονος αντικαταστάτης της netstat: το -t επιλέγει TCP, το -u UDP, το -l τις υποδοχές ακρόασης, το -n την αριθμητική έξοδο και το -p τη διεργασία ιδιοκτήτη. Μια γραμμή 0.0.0.0:80 με users:((\"apache2\",...)) σημαίνει ότι η υπηρεσία ακούει σε όλες τις διεπαφές, ενώ η 127.0.0.1:3306 σημαίνει ότι μια βάση απαντά μόνο στο τοπικό μηχάνημα. Διάβασε αυτά τα δύο σχήματα ως δήλωση ασφάλειας πριν τα διαβάσεις ως αναφορά κατάστασης, και πέρασε το αποτέλεσμα σε grep όταν σε ενδιαφέρει μία θύρα: ss -tlnp | grep :22.",
        ),
        [
          shot("apache2ctl configtest", ["Syntax OK"]),
          shot("service apache2 start", ["starting apache2 (simulated)."]),
          shot("ss -tlnp", [
            "Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process",
            'tcp   LISTEN 0      128    0.0.0.0:80          0.0.0.0:*         users:(("apache2",pid=1024,fd=3))',
          ]),
        ],
      ),
    ],
    cheats: [
      { cmd: "service apache2 start", desc: bi("start only the virtual web service", "εκκίνηση μόνο της εικονικής web υπηρεσίας") },
      { cmd: "service apache2 status", desc: bi("inspect the virtual web service", "έλεγχος της εικονικής web υπηρεσίας") },
      { cmd: "service apache2 stop", desc: bi("stop the virtual web service", "διακοπή της εικονικής web υπηρεσίας") },
      { cmd: "service apache2 restart", desc: bi("restart after a page or configuration change", "επανεκκίνηση μετά από αλλαγή σελίδας ή ρύθμισης") },
      { cmd: "apache2ctl configtest", desc: bi("parse the configuration, open no port", "ανάγνωση ρυθμίσεων, χωρίς θύρα") },
      { cmd: "apache2ctl -S", desc: bi("show the virtual-host layout", "διάταξη virtual hosts") },
      { cmd: "ss -tlnp", desc: bi("who listens, on which port, with which process", "ποιος ακούει, σε ποια θύρα, με ποια διεργασία") },
      { cmd: "systemctl status apache2", desc: bi("unit file, boot state and active state", "unit file, κατάσταση boot και active") },
      { cmd: "nano /var/www/html/index.html", desc: bi("preview the virtual document root", "προεπισκόπηση του εικονικού document root") },
      { cmd: 'echo "<h1>GameHack</h1>" > /var/www/html/index.html', desc: bi("write HTML into the player’s virtual page", "εγγραφή HTML στην εικονική σελίδα του παίκτη") },
      { cmd: "curl http://localhost", desc: bi("read the local simulated web response", "ανάγνωση της τοπικής εικονικής απόκρισης") },
      { cmd: "service ssh start", desc: bi("start the simulated SSH service", "εκκίνηση της εικονικής υπηρεσίας SSH") },
      { cmd: "ssh ignite@192.168.0.11", desc: bi("open the fictional ubuntu session", "άνοιγμα της φανταστικής συνεδρίας ubuntu") },
      { cmd: "exit", desc: bi("return from the simulated SSH session", "επιστροφή από την εικονική συνεδρία SSH") },
      { cmd: "telnet ignite@192.168.0.11 23", desc: bi("see why plaintext telnet is blocked", "έλεγχος γιατί μπλοκάρεται το plaintext telnet") },
      { cmd: "ftp ftp.gamehack.lab", desc: bi("connect to the local FTP fixture", "σύνδεση στο τοπικό FTP fixture") },
      { cmd: "ls", desc: bi("list files at the current FTP prompt", "εμφάνιση αρχείων στο τρέχον FTP prompt") },
      { cmd: "cd ubuntu", desc: bi("navigate within the remote fixture", "πλοήγηση στο απομακρυσμένο fixture") },
      { cmd: "cd release", desc: bi("enter the release fixture directory", "είσοδος στον φάκελο release του fixture") },
      { cmd: "get favicon.ico", desc: bi("copy the fixture into your VFS", "αντιγραφή του fixture στο VFS σου") },
      { cmd: "bye", desc: bi("close the FTP session", "κλείσιμο της FTP συνεδρίας") },
      { cmd: "cat favicon.ico", desc: bi("read the downloaded souvenir", "ανάγνωση του ληφθέντος αρχείου") },
      { cmd: "ls -l favicon.ico", desc: bi("verify the souvenir with size and mode", "επαλήθευση αρχείου με μέγεθος και δικαιώματα") },
    ],
    tasks: [
      task(
        "apache-lifecycle",
        bi(
          "Walk Apache through start, status, stop, and restart. Read each response as a state transition, not as evidence that a real daemon was launched.",
          "Πέρασε τον Apache από start, status, stop και restart. Διάβασε κάθε απάντηση ως αλλαγή κατάστασης και όχι ως ένδειξη πραγματικής εκκίνησης daemon.",
        ),
        bi(
          "service apache2 start\nservice apache2 status\nservice apache2 stop\nservice apache2 restart",
          "service apache2 start\nservice apache2 status\nservice apache2 stop\nservice apache2 restart",
        ),
        bi(
          "start changes the virtual service to running, status confirms it, stop changes it to stopped, and restart brings it back. These are the four lifecycle actions shown in the article, implemented entirely inside the player’s terminal state.",
          "Το start αλλάζει την εικονική υπηρεσία σε running, το status το επιβεβαιώνει, το stop τη θέτει σε stopped και το restart την επαναφέρει. Αυτές είναι οι τέσσερις ενέργειες του άρθρου και εκτελούνται αποκλειστικά στην κατάσταση του τερματικού του παίκτη.",
        ),
        (term) => ["start", "status", "stop", "restart"].every((action) => term.flags.has(`service-apache2-${action}`)),
      ),
      task(
        "edit-and-fetch-page",
        bi(
          "Preview Apache’s index.html, write a small heading into the virtual file, and fetch it through the simulated localhost URL. Inspect that the response matches your saved VFS content.",
          "Κάνε προεπισκόπηση του index.html του Apache, γράψε μια μικρή επικεφαλίδα στο εικονικό αρχείο και ζήτησέ την από το προσομοιωμένο localhost. Έλεγξε ότι η απόκριση ταιριάζει με το περιεχόμενο του VFS.",
        ),
        bi(
          'nano /var/www/html/index.html\necho "<h1>GameHack</h1>" > /var/www/html/index.html\ncurl http://localhost',
          'nano /var/www/html/index.html\necho "<h1>GameHack</h1>" > /var/www/html/index.html\ncurl http://localhost',
        ),
        bi(
          "nano previews the file; the quoted echo redirect replaces only the virtual index.html; curl reads that file as the local service response. This HTTP example never calls a browser or an address outside the sandbox.",
          "Η nano κάνει προεπισκόπηση, η echo με εισαγωγικά και redirect αντικαθιστά μόνο το εικονικό index.html, η curl διαβάζει αυτό το αρχείο ως τοπική απόκριση. Το παράδειγμα HTTP δεν καλεί browser ούτε διεύθυνση έξω από το sandbox.",
        ),
        (term) => {
          const page = getNode(term.fs, "/var/www/html/index.html");
          return term.flags.has("nano-index") && term.flags.has("curl-local") && page?.type === "file" && /GameHack/.test(page.content || "");
        },
      ),
      task(
        "ssh-and-telnet",
        bi(
          "Start the virtual SSH service, connect to the named fictional ubuntu fixture, and return with exit. Then try the telnet comparison to see its safety warning without opening a connection.",
          "Ξεκίνα την εικονική υπηρεσία SSH, συνδέσου στο φανταστικό fixture ubuntu και επέστρεψε με exit. Έπειτα δοκίμασε τη σύγκριση telnet για να δεις την προειδοποίηση χωρίς σύνδεση.",
        ),
        bi(
          "service ssh start\nssh ignite@192.168.0.11\nexit\ntelnet ignite@192.168.0.11 23",
          "service ssh start\nssh ignite@192.168.0.11\nexit\ntelnet ignite@192.168.0.11 23",
        ),
        bi(
          "SSH encrypts a remote session and the address is a fixture mapped inside the sandbox. exit restores your saved local prompt; telnet is rejected because it would expose data in plaintext and the lab never opens a socket.",
          "Το SSH κρυπτογραφεί την απομακρυσμένη συνεδρία και η διεύθυνση είναι fixture του sandbox. Το exit επαναφέρει το αποθηκευμένο τοπικό prompt, το telnet απορρίπτεται επειδή μεταφέρει δεδομένα σε απλό κείμενο και το lab δεν ανοίγει socket.",
        ),
        (term) => term.flags.has("service-ssh-start") && term.flags.has("ssh-ignite") && term.flags.has("ssh-return") && term.flags.has("telnet-blocked"),
      ),
      task(
        "ftp-connect",
        bi(
          "Open the local FTP fixture and log in with the anonymous username and sample password. The public ftp.cesca.es example is deliberately replaced so no public server is contacted.",
          "Άνοιξε το τοπικό FTP fixture και συνδέσου με όνομα χρήστη anonymous και το δοκιμαστικό password. Το δημόσιο παράδειγμα ftp.cesca.es αντικαθίσταται σκόπιμα ώστε να μη γίνει σύνδεση σε δημόσιο server.",
        ),
        bi("ftp ftp.gamehack.lab\nanonymous\nanonymous", "ftp ftp.gamehack.lab\nanonymous\nanonymous"),
        bi(
          "The server name resolves only to an in-memory fictional fixture. The first anonymous line supplies the username, the second supplies the sample password, and the login response is generated by the virtual FTP prompt.",
          "Το όνομα του server αντιστοιχεί μόνο σε εικονικό fixture που βρίσκεται στη μνήμη. Η πρώτη γραμμή anonymous δίνει όνομα χρήστη, η δεύτερη το δοκιμαστικό password και η απάντηση login παράγεται από το εικονικό FTP prompt.",
        ),
        (term) => term.flags.has("ftp-login") && term.ftp?.authenticated === true,
      ),
      task(
        "ftp-navigate",
        bi(
          "List the FTP root, then enter ubuntu and release. Confirm that favicon.ico is present in the remote fixture before downloading it.",
          "Εμφάνισε τη ρίζα FTP και μπες στους φακέλους ubuntu και release. Επιβεβαίωσε ότι το favicon.ico υπάρχει στο απομακρυσμένο fixture πριν το κατεβάσεις.",
        ),
        bi("ls\ncd ubuntu\ncd release\nls", "ls\ncd ubuntu\ncd release\nls"),
        bi(
          "The FTP prompt interprets these ls and cd lines against /srv/ftp in your virtual filesystem. Navigation stays below that fixture root, so a path cannot escape into the host or another service.",
          "Το FTP prompt ερμηνεύει τις ls και cd σε σχέση με το /srv/ftp του εικονικού συστήματος. Η πλοήγηση μένει κάτω από τη ρίζα του fixture, επομένως καμία διαδρομή δεν μπορεί να διαφύγει στον host ή σε άλλη υπηρεσία.",
        ),
        (term) => term.flags.has("ftp-ls") && term.ftp?.cwd === "/ubuntu/release",
      ),
      task(
        "ftp-download",
        bi(
          "Download favicon.ico, close FTP with bye, and list the local working directory. The copied file should appear in this player’s VFS beside the course scripts.",
          "Κατέβασε το favicon.ico, κλείσε το FTP με bye και εμφάνισε τον τοπικό φάκελο εργασίας. Το αντίγραφο πρέπει να εμφανιστεί στο VFS του παίκτη δίπλα στα scripts του μαθήματος.",
        ),
        bi("get favicon.ico\nbye\nls", "get favicon.ico\nbye\nls"),
        bi(
          "get copies the remote fixture’s contents into the current local directory; bye ends the session, and the final ls runs locally rather than against the FTP server. FTP is unencrypted on real systems, so use secure alternatives such as SFTP for real transfers.",
          "Η get αντιγράφει το περιεχόμενο του απομακρυσμένου fixture στον τρέχοντα τοπικό φάκελο, η bye τερματίζει τη συνεδρία και η τελευταία ls εκτελείται τοπικά, όχι στον FTP server. Σε πραγματικά συστήματα το FTP δεν είναι κρυπτογραφημένο, γι’ αυτό προτίμησε ασφαλείς εναλλακτικές όπως το SFTP.",
        ),
        (term) => {
          const downloaded = getNode(term.fs, `${term.cwd}/favicon.ico`);
          return term.flags.has("ftp-get") && term.flags.has("ftp-bye") && downloaded?.type === "file";
        },
      ),
      task(
        "confirm-the-listener",
        bi(
          "Check the Apache configuration, start the service, then prove from the socket side which port is now open and which process owns it.",
          "Έλεγξε τις ρυθμίσεις του Apache, ξεκίνα την υπηρεσία και έπειτα απόδειξε από την πλευρά των υποδοχών ποια θύρα άνοιξε και ποια διεργασία την κατέχει.",
        ),
        bi("apache2ctl configtest\napache2ctl start\nss -tlnp\nsystemctl status apache2", "apache2ctl configtest\napache2ctl start\nss -tlnp\nsystemctl status apache2"),
        bi(
          "Why: A service that is started is not the same as a service that is reachable, and the difference shows up in the listening socket. How: configtest validates the configuration without opening a port, start records the running state, ss -tlnp lists the listener with its owning process, and systemctl status shows the unit and its boot state. Every row here belongs to the virtual lab; no host port is opened.",
          "Γιατί: Μια υπηρεσία που ξεκίνησε δεν ταυτίζεται με μια υπηρεσία προσβάσιμη, και η διαφορά φαίνεται στην υποδοχή ακρόασης. Πώς: το configtest επικυρώνει τις ρυθμίσεις χωρίς να ανοίξει θύρα, το start καταγράφει την κατάσταση λειτουργίας, το ss -tlnp εμφανίζει την υποδοχή με τη διεργασία ιδιοκτήτη και το systemctl status τη μονάδα με την κατάσταση εκκίνησης. Κάθε γραμμή εδώ ανήκει στο εικονικό εργαστήριο, καμία θύρα του υπολογιστή δεν ανοίγει.",
        ),
        (term) => term.flags.has("apache2ctl-configtest") && term.flags.has("apache2ctl-start") && usedCmd(term, /ss\s+-/) && usedCmd(term, /systemctl\s+status\s+apache2/),
      ),
    ],
    challenges: [
      {
        title: bi("Verify the local souvenir", "Έλεγχος του τοπικού αρχείου"),
        brief: bi("After the FTP session closes, find the file you retrieved in your working directory with ls and read it with cat. Proving the download landed locally is the last step of any transfer and the one people skip.", "Αφού κλείσει η συνεδρία FTP, βρες το αρχείο που κατέβασες στον φάκελο εργασίας σου με ls και διάβασέ το με cat. Η απόδειξη ότι η λήψη προσγειώθηκε τοπικά είναι το τελευταίο βήμα κάθε μεταφοράς και αυτό που παραλείπουν."),
        success: bi(
          "The download came from the VFS FTP fixture and is now a normal file in your persistent player workspace.",
          "Η λήψη προήλθε από το FTP fixture του VFS και τώρα είναι κανονικό αρχείο στον μόνιμο χώρο του παίκτη.",
        ),
        check: (term) => term.flags.has("ftp-get") && term.filesRead.some((path) => path.endsWith("/favicon.ico")),
      },
      {
        title: bi("Submit the services flag", "Υποβολή σημαίας υπηρεσιών"),
        brief: bi("Once you have explored Apache, OpenSSH, read the telnet warning and worked through the local FTP fixture, submit FLAG{linux_beginners_3_services}. Each service taught you a different way a host talks to a network.", "Αφού εξερευνήσεις τον Apache, το OpenSSH, διαβάσεις την προειδοποίηση του telnet και δουλέψεις με το τοπικό FTP fixture, υπέβαλε το FLAG{linux_beginners_3_services}. Κάθε υπηρεσία σου δίδαξε έναν διαφορετικό τρόπο που ένας host μιλά σε ένα δίκτυο."),
        success: bi(
          "The service lesson is complete, and every page, state change, and transfer remained in the simulated player filesystem.",
          "Το μάθημα υπηρεσιών ολοκληρώθηκε.",
        ),
        check: (term) => submitCheck(term, "FLAG{linux_beginners_3_services}"),
      },
    ],
  },
];
