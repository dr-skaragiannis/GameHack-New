import type { Module } from "./lessons";
import { buildSudoRunFS } from "../lib/sudorun";

// Match a normalized command line that was typed into the lab terminal.
const cmd = (t: any, re: RegExp) => t.ran.some((r: string) => re.test(r));

// ============================================================================
// Sudo_Run — Linux for Beginners (modules 10-12)
// Bash scripting · Task scheduling & boot services · Running services
// All lesson text is original HackForge teaching material.
// ============================================================================

export const SUDO_MODULES_C: Module[] = [
  // ================================================== MODULE 10 — SCRIPT FORGE
  {
    id: "sr-script",
    order: 10,
    icon: "📜",
    color: "from-teal-500 to-cyan-700",
    title: { en: "Script Forge", el: "Σφυρηλάτηση Scripts" },
    subtitle: {
      en: "Shebang, echo, chmod +x, ./script, read input — and a real scanner.",
      el: "Shebang, echo, chmod +x, ./script, είσοδος χρήστη — και ένας πραγματικός scanner.",
    },
    difficulty: 3,
    badge: { en: "Scriptwright", el: "Τεχνίτης Scripts" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "Why operators write scripts", el: "Γιατί οι operators γράφουν scripts" },
        body: {
          en: "Hackers often need to automate certain commands, sometimes stitching output from several tools together. Instead of retyping a five-command routine every time, you write it down once as a small computer program — a script. Automation is not a luxury in security work: an engagement can demand the same reconnaissance sweep against two hundred hosts, and the difference between doing that by hand and doing it with a script is the difference between a tired analyst and a report on time.",
          el: "Οι hackers συχνά χρειάζεται να αυτοματοποιήσουν εντολές, μερικές φορές ράβοντας την έξοδο πολλών εργαλείων μαζί. Αντί να ξαναγράφεις μια ρουτίνα πέντε εντολών κάθε φορά, την γράφεις μία φορά ως μικρό πρόγραμμα — ένα script. Η αυτοματοποίηση δεν είναι πολυτέλεια στη δουλειά ασφαλείας: μια αποστολή μπορεί να ζητήσει την ίδια σάρωση αναγνώρισης σε διακόσιους hosts, και η διαφορά ανάμεσα στο να το κάνεις με το χέρι και στο να το κάνεις με script είναι η διαφορά ανάμεσα σε έναν κουρασμένο analyst και σε μια αναφορά στην ώρα της.",
        },
      },
      {
        heading: { en: "The shell, and the shebang", el: "Το shell, και το shebang" },
        body: {
          en: "Back to fundamentals: a shell is the interface between the user and the operating system, and Linux ships several of them — bash, zsh, sh, fish. Ours is bash. A bash script is an ordinary text file, so any editor will do (nano, vim, or echo with redirection). The first line is the one that matters to the kernel: `#!/bin/bash`. Those two characters, hash and bang — 'shebang' — tell the operating system which interpreter should run the rest of the file. Without it the file may still run under whatever shell invoked it, and subtle differences between shells will bite you at the worst possible moment.",
          el: "Πίσω στα βασικά: ένα shell είναι η διεπαφή ανάμεσα στον χρήστη και το λειτουργικό σύστημα, και το Linux φέρνει πολλά — bash, zsh, sh, fish. Το δικό μας είναι το bash. Ένα bash script είναι ένα συνηθισμένο αρχείο κειμένου, άρα κάνει οποιοσδήποτε editor (nano, vim, ή echo με ανακατεύθυνση). Η πρώτη γραμμή είναι αυτή που νοιάζει τον πυρήνα: `#!/bin/bash`. Αυτοί οι δύο χαρακτήρες, δίεση και θαυμαστικό — «shebang» — λένε στο λειτουργικό ποιος διερμηνέας πρέπει να τρέξει το υπόλοιπο αρχείο. Χωρίς αυτό το αρχείο μπορεί και πάλι να τρέξει κάτω από όποιο shell το κάλεσε, και οι μικρές διαφορές μεταξύ shells θα σε δαγκώσουν στην πιο ακατάλληλη στιγμή.",
        },
        tip: {
          en: "`#!/bin/bash` must be the very first two characters of the file — no blank line above it, or the kernel ignores it.",
          el: "Το `#!/bin/bash` πρέπει να είναι οι δύο πρώτοι χαρακτήρες του αρχείου — χωρίς κενή γραμμή από πάνω, αλλιώς ο πυρήνας το αγνοεί.",
        },
      },
      {
        heading: { en: "echo, permissions, and the ./ that runs it", el: "echo, δικαιώματα, και το ./ που το τρέχει" },
        body: {
          en: "The simplest useful statement is `echo \"Hello World\"` — it prints exactly what you give it. Put that under a shebang, save the file as first_script.sh, and you have a program. Two things stand between you and running it. First, permission: a new file is not executable, so the shell refuses with 'Permission denied' until you run `chmod +x first_script.sh`. Second, the path: typing the bare name makes the shell look in PATH, where your file does not live, so you prefix it with `./` — 'the file called first_script.sh in the current directory'. Alternatively you can skip the permission step entirely by handing the file to an interpreter: `bash first_script.sh`.",
          el: "Η απλούστερη χρήσιμη εντολή είναι το `echo \"Hello World\"` — τυπώνει ακριβώς ό,τι του δώσεις. Βάλ' το κάτω από ένα shebang, σώσε το αρχείο ως first_script.sh, και έχεις πρόγραμμα. Δύο πράγματα σε χωρίζουν από το να το τρέξεις. Πρώτον, το δικαίωμα: ένα νέο αρχείο δεν είναι εκτελέσιμο, οπότε το shell αρνείται με 'Permission denied' μέχρι να τρέξεις `chmod +x first_script.sh`. Δεύτερον, η διαδρομή: αν γράψεις το σκέτο όνομα, το shell ψάχνει στο PATH, όπου το αρχείο σου δεν ζει, οπότε βάζεις το πρόθεμα `./` — «το αρχείο first_script.sh στον τρέχοντα φάκελο». Εναλλακτικά μπορείς να παραλείψεις εντελώς το βήμα των δικαιωμάτων δίνοντας το αρχείο σε έναν διερμηνέα: `bash first_script.sh`.",
        },
      },
      {
        heading: { en: "Variables and taking user input", el: "Μεταβλητές και είσοδος από τον χρήστη" },
        body: {
          en: "A variable is like a bucket: it holds a value in memory, and that value can be text or numbers. Three lines turn a static script into a conversation: `echo \"What is your name?\"` asks the question, `read name` stops the script and waits for the user to type something, storing it in the variable called name, and `echo \"Welcome, $name\"` greets them using it. The `$` is essential — it is the difference between printing the word 'name' and printing what the bucket contains. This same mechanism is how scripts accept parameters, target addresses and passwords in the real world.",
          el: "Μια μεταβλητή είναι σαν κουβάς: κρατά μια τιμή στη μνήμη, και η τιμή μπορεί να είναι κείμενο ή αριθμοί. Τρεις γραμμές μετατρέπουν ένα στατικό script σε συνομιλία: το `echo \"What is your name?\"` κάνει την ερώτηση, το `read name` σταματά το script και περιμένει ο χρήστης να γράψει κάτι, αποθηκεύοντάς το στη μεταβλητή name, και το `echo \"Welcome, $name\"` τους χαιρετά χρησιμοποιώντας την. Το `$` είναι απαραίτητο — είναι η διαφορά ανάμεσα στο να τυπώσεις τη λέξη 'name' και στο να τυπώσεις ό,τι περιέχει ο κουβάς. Αυτός ο ίδιος μηχανισμός είναι ο τρόπος που τα scripts δέχονται παραμέτρους, διευθύνσεις στόχων και κωδικούς στον πραγματικό κόσμο.",
        },
      },
      {
        heading: { en: "A useful script: the network scanner", el: "Ένα χρήσιμο script: ο scanner δικτύου" },
        body: {
          en: "Now build something an operator actually uses. The goal: scan the whole network for live hosts and print their addresses. The tool is nmap — essential for network penetration testing, used to discover open ports, the services behind them, and even the target's operating system. Its basic syntax is `nmap <type of scan> <target>`; the `-sP` option performs a simple ping sweep, which asks every address in a range 'are you there?' and lists the ones that answer. The full line chains four ideas you already know: `nmap -sP $ip | grep \"scan report\" | cut -d \" \" -f 5 | head -n -1` — sweep, keep only the report lines, slice out the fifth space-separated field (the host), and drop the final summary line. Wrap that in a script with a `read ip` prompt and you have a reusable reconnaissance tool.",
          el: "Τώρα φτιάξε κάτι που πραγματικά χρησιμοποιεί ένας operator. Ο στόχος: σάρωσε όλο το δίκτυο για ζωντανούς hosts και τύπωσε τις διευθύνσεις τους. Το εργαλείο είναι το nmap — απαραίτητο για network penetration testing, που ανακαλύπτει ανοιχτές θύρες, τις υπηρεσίες πίσω τους, ακόμα και το λειτουργικό του στόχου. Η βασική του σύνταξη είναι `nmap <τύπος σάρωσης> <στόχος>`· η επιλογή `-sP` κάνει ένα απλό ping sweep, που ρωτά κάθε διεύθυνση μιας περιοχής «είσαι εκεί;» και εμφανίζει όσες απαντούν. Η πλήρης γραμμή αλυσοδένει τέσσερις ιδέες που ήδη ξέρεις: `nmap -sP $ip | grep \"scan report\" | cut -d \" \" -f 5 | head -n -1` — σάρωση, κράτα μόνο τις γραμμές αναφοράς, κόψε το πέμπτο πεδίο που χωρίζεται με κενό (τον host), και πέτα την τελευταία γραμμή σύνοψης. Τύλιξέ το σε script με ένα prompt `read ip` και έχεις ένα επαναχρησιμοποιήσιμο εργαλείο αναγνώρισης.",
        },
        tip: {
          en: "Only ever point a scanner at networks you own or are contracted to test. Scanning is loud, logged and, unauthorised, illegal.",
          el: "Στράψε τον scanner μόνο σε δίκτυα που σου ανήκουν ή που έχεις σύμβαση να ελέγξεις. Η σάρωση είναι θορυβώδης, καταγράφεται, και χωρίς εξουσιοδότηση είναι παράνομη.",
        },
      },
    ],
    cheats: [
      { cmd: "#!/bin/bash", desc: { en: "Shebang — first line of every script", el: "Shebang — πρώτη γραμμή κάθε script" } },
      { cmd: "echo \"text\"", desc: { en: "Print a line", el: "Τύπωσε μια γραμμή" } },
      { cmd: "read var", desc: { en: "Wait for user input", el: "Περίμενε είσοδο χρήστη" } },
      { cmd: "echo $var", desc: { en: "Use the variable's value", el: "Χρησιμοποίησε την τιμή της μεταβλητής" } },
      { cmd: "chmod +x script.sh", desc: { en: "Make it executable", el: "Κάν' το εκτελέσιμο" } },
      { cmd: "./script.sh", desc: { en: "Run the script in this directory", el: "Τρέξε το script αυτού του φακέλου" } },
      { cmd: "bash script.sh", desc: { en: "Run it via the interpreter", el: "Τρέξε το μέσω διερμηνέα" } },
      { cmd: "nmap -sP NET", desc: { en: "Ping sweep: who is alive", el: "Ping sweep: ποιοι είναι ζωντανοί" } },
    ],
    tasks: [
      {
        id: "sr-script-read",
        instruction: {
          en: "Inspect the script you are about to run — never execute what you have not read: cat first_script.sh",
          el: "Επιθεώρησε το script που πρόκειται να τρέξεις — μην εκτελείς ποτέ ό,τι δεν έχεις διαβάσει: cat first_script.sh",
        },
        hint: { en: "cat first_script.sh", el: "cat first_script.sh" },
        explain: {
          en: "Two lines: the shebang and an echo. Reading a script before running it is a professional reflex, not paranoia — on a real engagement the 'helper script' a colleague left behind may contain something you did not expect.",
          el: "Δύο γραμμές: το shebang και ένα echo. Το να διαβάζεις ένα script πριν το τρέξεις είναι επαγγελματικό αντανακλαστικό, όχι παρανοϊκή προφύλαξη — σε πραγματική αποστολή το «βοηθητικό script» που άφησε ένας συνάδελφος μπορεί να περιέχει κάτι που δεν περίμενες.",
        },
        check: (t) => t.readFiles.has("/home/operator/first_script.sh"),
      },
      {
        id: "sr-script-denied",
        instruction: {
          en: "Try to run it as it is: ./first_script.sh — and read the refusal carefully.",
          el: "Προσπάθησε να το τρέξεις ως έχει: ./first_script.sh — και διάβασε προσεκτικά την άρνηση.",
        },
        hint: { en: "./first_script.sh", el: "./first_script.sh" },
        explain: {
          en: "'Permission denied' — the file exists and the path is right, but there is no execute bit. This is the permission model from module 6 doing its job: being able to READ a program is not the same as being allowed to RUN it.",
          el: "'Permission denied' — το αρχείο υπάρχει και η διαδρομή είναι σωστή, αλλά δεν υπάρχει execute bit. Αυτό είναι το μοντέλο δικαιωμάτων της ενότητας 6 να κάνει τη δουλειά του: το να μπορείς να ΔΙΑΒΑΣΕΙΣ ένα πρόγραμμα δεν είναι το ίδιο με το να επιτρέπεται να το ΤΡΕΞΕΙΣ.",
        },
        check: (t) => cmd(t, /^\.\/first_script\.sh\b/),
      },
      {
        id: "sr-script-chmodx",
        instruction: {
          en: "Grant the missing permission: chmod +x first_script.sh",
          el: "Δώσε το δικαίωμα που λείπει: chmod +x first_script.sh",
        },
        hint: { en: "chmod +x first_script.sh", el: "chmod +x first_script.sh" },
        explain: {
          en: "One letter changed and the file became a program. Confirm with `ls -l first_script.sh` if you like — the x appears in all three triplets, because +x without a who-part means everybody.",
          el: "Ένα γράμμα άλλαξε και το αρχείο έγινε πρόγραμμα. Επιβεβαίωσε με `ls -l first_script.sh` αν θες — το x εμφανίζεται και στις τρεις τριάδες, γιατί το +x χωρίς μέρος who σημαίνει όλοι.",
        },
        check: (t) => t.chmodX.has("/home/operator/first_script.sh"),
      },
      {
        id: "sr-script-run",
        instruction: {
          en: "Now run your first program: ./first_script.sh",
          el: "Τώρα τρέξε το πρώτο σου πρόγραμμα: ./first_script.sh",
        },
        hint: { en: "./first_script.sh", el: "./first_script.sh" },
        explain: {
          en: "The shebang made the kernel hand the file to /bin/bash, which executed the echo. You have just crossed the line from 'typing commands' to 'shipping programs' — everything after this is scale, not a new idea.",
          el: "Το shebang έκανε τον πυρήνα να δώσει το αρχείο στο /bin/bash, που εκτέλεσε το echo. Μόλις πέρασες τη γραμμή από το «πληκτρολογώ εντολές» στο «παραδίδω προγράμματα» — ό,τι ακολουθεί είναι κλίμακα, όχι νέα ιδέα.",
        },
        check: (t) => t.ranScripts.has("/home/operator/first_script.sh"),
      },
      {
        id: "sr-script-greet",
        instruction: {
          en: "Run the interactive one: make greet.sh executable (chmod +x greet.sh) and start it with ./greet.sh — then answer its question by typing your name.",
          el: "Τρέξε το διαδραστικό: κάνε το greet.sh εκτελέσιμο (chmod +x greet.sh) και ξεκίνα το με ./greet.sh — μετά απάντησε στην ερώτησή του γράφοντας το όνομά σου.",
        },
        hint: { en: "chmod +x greet.sh  →  ./greet.sh  →  (type your name)", el: "chmod +x greet.sh  →  ./greet.sh  →  (γράψε το όνομά σου)" },
        explain: {
          en: "The script paused at `read name`, took your line of input into the variable, and printed it back inside a sentence. That pause is the whole trick of interactive tooling: prompts, confirmations and target selection in real tools are exactly this pattern.",
          el: "Το script σταμάτησε στο `read name`, πήρε τη γραμμή εισόδου σου στη μεταβλητή, και την τύπωσε πίσω μέσα σε πρόταση. Αυτή η παύση είναι όλο το κόλπο του διαδραστικού tooling: prompts, επιβεβαιώσεις και επιλογή στόχων στα πραγματικά εργαλεία είναι ακριβώς αυτό το μοτίβο.",
        },
        check: (t) => t.ranScripts.has("/home/operator/greet.sh") && t.readUsed,
      },
      {
        id: "sr-script-scannerx",
        instruction: {
          en: "Prepare the reconnaissance tool: chmod +x scanner.sh — then read it with cat to see how the pipes are wired.",
          el: "Ετοίμασε το εργαλείο αναγνώρισης: chmod +x scanner.sh — και μετά διάβασέ το με cat για να δεις πώς είναι δεμένα τα pipes.",
        },
        hint: { en: "chmod +x scanner.sh  then  cat scanner.sh", el: "chmod +x scanner.sh  και μετά  cat scanner.sh" },
        explain: {
          en: "Four lines of shell doing real work: a prompt, a read, an nmap sweep filtered by grep, sliced by cut and trimmed by head, then a closing message. Every one of those pieces you learned in an earlier module — scripting is composition, not new syntax.",
          el: "Τέσσερις γραμμές shell που κάνουν πραγματική δουλειά: ένα prompt, ένα read, μια σάρωση nmap φιλτραρισμένη με grep, κομμένη με cut και κουρεμένη με head, και μετά ένα κλείσιμο. Κάθε ένα από αυτά τα κομμάτια το έμαθες σε προηγούμενη ενότητα — το scripting είναι σύνθεση, όχι νέα σύνταξη.",
        },
        check: (t) =>
          t.chmodX.has("/home/operator/scanner.sh") && t.readFiles.has("/home/operator/scanner.sh"),
      },
      {
        id: "sr-script-scanner",
        instruction: {
          en: "Run the sweep: ./scanner.sh — and when it asks for the network, type 10.10.10.0/24",
          el: "Τρέξε τη σάρωση: ./scanner.sh — και όταν ζητήσει το δίκτυο, γράψε 10.10.10.0/24",
        },
        hint: { en: "./scanner.sh  then  10.10.10.0/24", el: "./scanner.sh  και μετά  10.10.10.0/24" },
        explain: {
          en: "nmap ping-swept the range and your pipeline reduced the whole report to the live hosts, one per line. That is the operator's craft in miniature: a loud tool plus three filters equals a clean answer. Save that one-liner; you will reuse it in every network assessment.",
          el: "Το nmap σάρωσε την περιοχή με ping και η σωλήνωσή σου μείωσε ολόκληρη την αναφορά στους ζωντανούς hosts, έναν ανά γραμμή. Αυτή είναι η τέχνη του operator σε μικρογραφία: ένα θορυβώδες εργαλείο συν τρία φίλτρα ίσον καθαρή απάντηση. Αποθήκευσε αυτό το one-liner· θα το ξαναχρησιμοποιήσεις σε κάθε network assessment.",
        },
        check: (t) => t.ranScripts.has("/home/operator/scanner.sh") && t.nmapPingSweep,
      },
      {
        id: "sr-script-nano",
        instruction: {
          en: "Open an editor to write your own: nano myscan.sh",
          el: "Άνοιξε έναν editor για να γράψεις δικό σου: nano myscan.sh",
        },
        hint: { en: "nano myscan.sh", el: "nano myscan.sh" },
        explain: {
          en: "nano opens the file (creating it if it does not exist) and shows the shortcut bar: Ctrl+O writes it out, Ctrl+X exits. In this sandbox the editor is read-style, so the tasks below build files with echo and redirection — the same end result, and a technique you can use over SSH where no editor is installed.",
          el: "Το nano ανοίγει το αρχείο (δημιουργώντας το αν δεν υπάρχει) και δείχνει τη μπάρα συντομεύσεων: Ctrl+O το αποθηκεύει, Ctrl+X βγαίνει. Σε αυτό το sandbox ο editor είναι read-style, οπότε οι παρακάτω εργασίες φτιάχνουν αρχεία με echo και ανακατεύθυνση — το ίδιο τελικό αποτέλεσμα, και τεχνική που χρησιμοποιείς πάνω από SSH όπου δεν υπάρχει εγκατεστημένος editor.",
        },
        check: (t) => t.nanoOpened.has("/home/operator/myscan.sh"),
      },
      {
        id: "sr-script-write",
        instruction: {
          en: "Build a script without an editor, one line at a time: echo '#!/bin/bash' > hello.sh , then echo 'echo Hello from HackForge' >> hello.sh , then chmod +x hello.sh",
          el: "Φτιάξε ένα script χωρίς editor, γραμμή-γραμμή: echo '#!/bin/bash' > hello.sh , μετά echo 'echo Hello from HackForge' >> hello.sh , μετά chmod +x hello.sh",
        },
        hint: {
          en: "echo '#!/bin/bash' > hello.sh  →  echo 'echo Hello from HackForge' >> hello.sh  →  chmod +x hello.sh",
          el: "echo '#!/bin/bash' > hello.sh  →  echo 'echo Hello from HackForge' >> hello.sh  →  chmod +x hello.sh",
        },
        explain: {
          en: "The first redirect creates the file with the shebang; the second APPENDS the statement — mixing up > and >> here would silently destroy line one. This is exactly how scripts get deployed from a shell you do not control: no editor, no uploads, just redirection.",
          el: "Η πρώτη ανακατεύθυνση δημιουργεί το αρχείο με το shebang· η δεύτερη ΠΡΟΣΘΕΤΕΙ την εντολή — αν μπερδέψεις το > με το >> εδώ θα καταστρέψεις σιωπηλά την πρώτη γραμμή. Ακριβώς έτσι γίνονται deploy scripts από ένα shell που δεν ελέγχεις: χωρίς editor, χωρίς ανέβασμα, μόνο ανακατεύθυνση.",
        },
        check: (t) =>
          (t.fileContent("/home/operator/hello.sh") || "").includes("#!/bin/bash") &&
          (t.fileContent("/home/operator/hello.sh") || "").includes("echo Hello from HackForge"),
      },
      {
        id: "sr-script-hellorun",
        instruction: {
          en: "Run the file you just assembled: ./hello.sh",
          el: "Τρέξε το αρχείο που μόλις συναρμολόγησες: ./hello.sh",
        },
        hint: { en: "./hello.sh", el: "./hello.sh" },
        explain: {
          en: "It printed your sentence — the file you created with two echo commands is now a working program. Verify the whole loop any time with `cat hello.sh`: what you see is exactly what bash will execute.",
          el: "Τύπωσε την πρότασή σου — το αρχείο που δημιούργησες με δύο echo είναι τώρα πρόγραμμα που δουλεύει. Επαλήθευσε όλο τον βρόχο όποτε θες με `cat hello.sh`: ό,τι βλέπεις είναι ακριβώς ό,τι θα εκτελέσει το bash.",
        },
        check: (t) => t.ranScripts.has("/home/operator/hello.sh"),
      },
      {
        id: "sr-script-bashrun",
        instruction: {
          en: "Run a script the other way — through the interpreter, no execute bit needed: bash simple_bash.sh",
          el: "Τρέξε ένα script με τον άλλο τρόπο — μέσω διερμηνέα, χωρίς να χρειάζεται execute bit: bash simple_bash.sh",
        },
        hint: { en: "bash simple_bash.sh", el: "bash simple_bash.sh" },
        explain: {
          en: "Handing a file to bash works even when the file is not executable, which is why you will see it used on locked-down systems and in quick tests. Same code, different door. Knowing both doors is what separates someone who follows instructions from someone who understands them.",
          el: "Το να δώσεις ένα αρχείο στο bash δουλεύει ακόμα και όταν το αρχείο δεν είναι εκτελέσιμο, γι' αυτό θα το δεις να χρησιμοποιείται σε κλειδωμένα συστήματα και σε γρήγορα τεστ. Ίδιος κώδικας, διαφορετική πόρτα. Το να ξέρεις και τις δύο πόρτες είναι αυτό που ξεχωρίζει όποιον ακολουθεί οδηγίες από όποιον τις καταλαβαίνει.",
        },
        check: (t) => t.ranScripts.has("/home/operator/simple_bash.sh"),
      },
    ],
    challenges: [
      {
        title: { en: "One-Liner Recon", el: "Αναγνώριση Μίας Γραμμής" },
        brief: {
          en: "Write your own script — any filename you like — whose content pipes 'ps aux' into grep looking for sshd. Make it executable and run it. It completes the moment a script containing that pipeline has actually executed.",
          el: "Γράψε δικό σου script — όποιο όνομα θες — του οποίου το περιεχόμενο περνά το 'ps aux' από grep ψάχνοντας για sshd. Κάν' το εκτελέσιμο και τρέξε το. Ολοκληρώνεται τη στιγμή που ένα script με αυτή τη σωλήνωση έχει πραγματικά εκτελεστεί.",
        },
        success: { en: "Your own recon script ran. Composition mastered.", el: "Το δικό σου script αναγνώρισης έτρεξε. Η σύνθεση κατακτήθηκε." },
        check: (t) =>
          [...(t.ranScripts as Set<string>)].some((p) => {
            const body = t.fileContent(p) || "";
            return body.includes("ps aux") && /grep/.test(body);
          }),
      },
      {
        title: { en: "Automation Handshake", el: "Χειραψία Αυτοματοποίησης" },
        brief: {
          en: "Prove the interactive loop end to end: run greet.sh, answer the prompt with exactly the word HackForge, and let the script echo the greeting back.",
          el: "Απόδειξε τον διαδραστικό βρόχο από άκρη σε άκρη: τρέξε το greet.sh, απάντησε στο prompt με ακριβώς τη λέξη HackForge, και άσε το script να τυπώσει πίσω τον χαιρετισμό.",
        },
        success: { en: "Input captured, variable filled, greeting printed. read() is yours.", el: "Είσοδος καταγράφηκε, μεταβλητή γεμίστηκε, χαιρετισμός τυπώθηκε. Το read() είναι δικό σου." },
        check: (t) => t.ranScripts.has("/home/operator/greet.sh") && t.getVar("name") === "HackForge",
      },
    ],
  },

  // ====================================================== MODULE 11 — CLOCKWORK
  {
    id: "sr-cron",
    order: 11,
    icon: "⏰",
    color: "from-indigo-500 to-blue-800",
    title: { en: "Clockwork", el: "Ρολογάκι" },
    subtitle: {
      en: "cron, crontab's seven fields, service, runlevels and update-rc.d.",
      el: "cron, τα επτά πεδία του crontab, service, runlevels και update-rc.d.",
    },
    difficulty: 3,
    badge: { en: "Timekeeper", el: "Χρονοφύλακας" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "The cron daemon", el: "Ο cron daemon" },
        body: {
          en: "Sometimes a task must run without you — a nightly backup, a hourly log rotation, a periodic scan. Linux handles this with crond, a daemon that runs in the background forever, checking the cron table (crontab) for commands whose time has come. Altering the crontab is all it takes to put your own task on that schedule. The system-wide table lives at /etc/crontab, and every user can also have a personal one, which is what `crontab -e` edits.",
          el: "Μερικές φορές μια εργασία πρέπει να τρέξει χωρίς εσένα — ένα νυχτερινό backup, μια ωριαία εναλλαγή log, μια περιοδική σάρωση. Το Linux το χειρίζεται με το crond, έναν daemon που τρέχει στο παρασκήνιο για πάντα, ελέγχοντας τον πίνακα cron (crontab) για εντολές των οποίων η ώρα έφτασε. Το μόνο που χρειάζεται για να βάλεις τη δική σου εργασία σε αυτό το πρόγραμμα είναι να αλλάξεις το crontab. Ο συστημικός πίνακας ζει στο /etc/crontab, και κάθε χρήστης μπορεί να έχει και προσωπικό, που είναι αυτό που επεξεργάζεται το `crontab -e`.",
        },
      },
      {
        heading: { en: "Seven fields, five of them about time", el: "Επτά πεδία, τα πέντε για τον χρόνο" },
        body: {
          en: "A crontab line has seven fields. The first five say WHEN: minute (0-59), hour (0-23), day of the month (1-31), month (1-12), day of the week (0-7, where both 0 and 7 mean Sunday). The sixth field is the USER the job runs as, and the seventh is the command. An asterisk means 'every'. So `55 23 * * * operator /home/operator/scanner.sh` reads: at 23:55, every day of every month, run the scanner as operator. `17 * * * *` runs at minute 17 of every hour. Read the five time fields out loud in your head and you will never get them backwards again.",
          el: "Μια γραμμή crontab έχει επτά πεδία. Τα πρώτα πέντε λένε ΠΟΤΕ: λεπτό (0-59), ώρα (0-23), ημέρα του μήνα (1-31), μήνας (1-12), ημέρα της εβδομάδας (0-7, όπου και το 0 και το 7 σημαίνουν Κυριακή). Το έκτο πεδίο είναι ο ΧΡΗΣΤΗΣ ως τον οποίο τρέχει η εργασία, και το έβδομο είναι η εντολή. Ο αστερίσκος σημαίνει «κάθε». Άρα το `55 23 * * * operator /home/operator/scanner.sh` διαβάζεται: στις 23:55, κάθε μέρα κάθε μήνα, τρέξε τον scanner ως operator. Το `17 * * * *` τρέχει στο λεπτό 17 κάθε ώρας. Διάβασε τα πέντε χρονικά πεδία δυνατά μέσα στο κεφάλι σου και δεν θα τα μπερδέψεις ποτέ ξανά.",
        },
        tip: {
          en: "The classic mistake is putting the hour first. It is minute, then hour — smallest unit to largest.",
          el: "Το κλασικό λάθος είναι να βάλεις την ώρα πρώτη. Είναι λεπτό, μετά ώρα — από τη μικρότερη μονάδα στη μεγαλύτερη.",
        },
      },
      {
        heading: { en: "Turning cron on: service start & status", el: "Άναψε το cron: service start & status" },
        body: {
          en: "A crontab is only honoured if the daemon is actually running. Check with `service cron status`; if it reports inactive, `service cron start` brings it up. The service command is the same interface you will use for every other service on the box, and its grammar is worth memorising: `service NAME start|stop|restart|status`. In the next module you will drive apache2 and ssh with exactly this syntax.",
          el: "Ένα crontab τηρείται μόνο αν ο daemon τρέχει πραγματικά. Έλεγξε με `service cron status`· αν αναφέρει inactive, το `service cron start` τον ανεβάζει. Η εντολή service είναι η ίδια διεπαφή που θα χρησιμοποιήσεις για κάθε άλλη υπηρεσία στο box, και η γραμματική της αξίζει αποστήθιση: `service NAME start|stop|restart|status`. Στην επόμενη ενότητα θα οδηγήσεις τα apache2 και ssh με ακριβώς αυτή τη σύνταξη.",
        },
      },
      {
        heading: { en: "crontab -e and the editor picker", el: "crontab -e και ο επιλογέας editor" },
        body: {
          en: "Type `crontab -e` and Debian-family systems ask you to choose an editor before opening the table — press 1 for nano if you have been following this campaign. Inside, you scroll to the bottom and add your seven-field line. `crontab -l` lists what is currently scheduled, and that listing is your verification step: a schedule you did not list is a schedule you did not confirm.",
          el: "Γράψε `crontab -e` και τα συστήματα οικογένειας Debian σε ρωτούν να διαλέξεις editor πριν ανοίξει ο πίνακας — πάτα 1 για nano αν ακολουθείς αυτή την καμπάνια. Μέσα, πηγαίνεις κάτω-κάτω και προσθέτεις τη γραμμή των επτά πεδίων. Το `crontab -l` εμφανίζει ό,τι είναι προγραμματισμένο τώρα, και αυτή η λίστα είναι το βήμα επαλήθευσής σου: ένα πρόγραμμα που δεν εμφάνισες είναι ένα πρόγραμμα που δεν επιβεβαίωσες.",
        },
      },
      {
        heading: { en: "rc scripts, init.d and runlevels", el: "rc scripts, init.d και runlevels" },
        body: {
          en: "When you switch a Linux machine on, a number of processes run to set up the environment you will use. The scripts they execute are the rc scripts, and at boot the kernel starts a daemon known as init.d (historically /sbin/init reading /etc/init.d) that is responsible for running them. Which services come up is decided by RUNLEVELS — a number describing how much of the system should be alive: 0 halts the system, 1 is single-user/minimal mode, 2 through 5 are the multiuser modes (5 normally adds a graphical login), and 6 reboots. The directories /etc/rc2.d through /etc/rc5.d hold the per-runlevel links, where S-files start a service, K-files stop it, and the number after the letter sets the order.",
          el: "Όταν ανοίγεις ένα μηχάνημα Linux, αρκετές διεργασίες τρέχουν για να στήσουν το περιβάλλον που θα χρησιμοποιήσεις. Τα scripts που εκτελούν είναι τα rc scripts, και στην εκκίνηση ο πυρήνας ξεκινά έναν daemon γνωστό ως init.d (ιστορικά το /sbin/init που διαβάζει το /etc/init.d), υπεύθυνο για να τα τρέξει. Το ποιες υπηρεσίες ανεβαίνουν το αποφασίζουν τα RUNLEVELS — ένας αριθμός που περιγράφει πόσο από το σύστημα πρέπει να είναι ζωντανό: το 0 σταματά το σύστημα, το 1 είναι single-user/ελάχιστη λειτουργία, το 2 έως 5 είναι οι πολυχηστικές λειτουργίες (το 5 συνήθως προσθέτει γραφική σύνδεση), και το 6 κάνει επανεκκίνηση. Οι φάκελοι /etc/rc2.d έως /etc/rc5.d κρατούν τους συνδέσμους ανά runlevel, όπου τα αρχεία S ξεκινούν μια υπηρεσία, τα K την σταματούν, και ο αριθμός μετά το γράμμα ορίζει τη σειρά.",
        },
      },
      {
        heading: { en: "update-rc.d — putting a service in the boot path", el: "update-rc.d — βάζοντας υπηρεσία στη διαδρομή εκκίνησης" },
        body: {
          en: "Adding those links by hand is tedious and easy to get wrong, which is why the tool exists: `update-rc.d mysql defaults` installs the standard start links for the mysql init script in runlevels 2-5, so MySQL starts every time the machine boots. The options are defaults, enable, disable and remove. Restart the box afterwards and `ps aux | grep mysql` proves it came back on its own. Attackers use exactly this command for persistence — an entry that survives reboot is worth far more to them than a process you can kill once — so on a real assessment you always inspect the rc directories and the crontabs of a machine you suspect.",
          el: "Το να προσθέτεις αυτούς τους συνδέσμους με το χέρι είναι κουραστικό και εύκολο να το πετύχεις λάθος, γι' αυτό υπάρχει το εργαλείο: το `update-rc.d mysql defaults` εγκαθιστά τους τυπικούς συνδέσμους εκκίνησης για το init script του mysql στα runlevels 2-5, ώστε η MySQL να ξεκινά σε κάθε εκκίνηση του μηχανήματος. Οι επιλογές είναι defaults, enable, disable και remove. Επανεκκίνησε το box μετά και το `ps aux | grep mysql` αποδεικνύει ότι γύρισε μόνο του. Οι επιτιθέμενοι χρησιμοποιούν ακριβώς αυτή την εντολή για persistence — μια καταχώρηση που επιβιώνει της επανεκκίνησης αξίζει πολύ περισσότερο γι' αυτούς από μια διεργασία που μπορείς να σκοτώσεις μία φορά — οπότε σε πραγματικό assessment πάντα επιθεωρείς τους φακέλους rc και τα crontabs ενός μηχανήματος που υποψιάζεσαι.",
        },
      },
    ],
    cheats: [
      { cmd: "service cron status/start", desc: { en: "Is the daemon alive? Wake it up", el: "Ζει ο daemon; Ξύπνα τον" } },
      { cmd: "crontab -l / -e", desc: { en: "List the schedule / edit it", el: "Εμφάνισε το πρόγραμμα / επεξεργάσου το" } },
      { cmd: "m h dom mon dow user cmd", desc: { en: "The seven crontab fields", el: "Τα επτά πεδία του crontab" } },
      { cmd: "55 23 * * *", desc: { en: "Every day at 23:55", el: "Κάθε μέρα στις 23:55" } },
      { cmd: "17 * * * *", desc: { en: "Minute 17 of every hour", el: "Λεπτό 17 κάθε ώρας" } },
      { cmd: "cat /etc/crontab", desc: { en: "The system-wide table", el: "Ο συστημικός πίνακας" } },
      { cmd: "update-rc.d NAME defaults", desc: { en: "Start this service at boot", el: "Ξεκίνα την υπηρεσία στην εκκίνηση" } },
      { cmd: "0 · 1 · 2-5 · 6", desc: { en: "Halt · single-user · multiuser · reboot", el: "Σταμάτημα · single-user · πολυχηστικό · επανεκκίνηση" } },
    ],
    tasks: [
      {
        id: "sr-cron-status",
        instruction: {
          en: "Before scheduling anything, find out whether the scheduler is even awake: service cron status",
          el: "Πριν προγραμματίσεις οτιδήποτε, μάθε αν ο scheduler είναι καν ξύπνιος: service cron status",
        },
        hint: { en: "service cron status", el: "service cron status" },
        explain: {
          en: "It reports 'inactive (dead)' — so any crontab entry you add right now would simply never fire. Checking a service before blaming your configuration is the debugging habit that saves the most time.",
          el: "Αναφέρει 'inactive (dead)' — άρα όποια καταχώρηση crontab προσθέσεις τώρα απλά δεν θα πυροδοτηθεί ποτέ. Το να ελέγχεις μια υπηρεσία πριν κατηγορήσεις τη ρύθμισή σου είναι η συνήθεια debugging που γλιτώνει τον περισσότερο χρόνο.",
        },
        check: (t) => cmd(t, /^service\s+cron\s+status\b/),
      },
      {
        id: "sr-cron-start",
        instruction: {
          en: "Wake it up: service cron start",
          el: "Ξύπνα τον: service cron start",
        },
        hint: { en: "service cron start", el: "service cron start" },
        explain: {
          en: "Active (running). The daemon is now polling the tables every minute. On a real system you would also want it enabled at boot — the service command affects this boot only, which is exactly what update-rc.d later in this module is for.",
          el: "Active (running). Ο daemon τώρα ρωτά τους πίνακες κάθε λεπτό. Σε πραγματικό σύστημα θα ήθελες και ενεργοποίηση στην εκκίνηση — η εντολή service επηρεάζει μόνο αυτή την εκκίνηση, που είναι ακριβώς η δουλειά του update-rc.d αργότερα σε αυτή την ενότητα.",
        },
        check: (t) => t.serviceState("cron").startsWith("active"),
      },
      {
        id: "sr-cron-cat",
        instruction: {
          en: "Read the system-wide schedule before you change it: cat /etc/crontab",
          el: "Διάβασε το συστημικό πρόγραμμα πριν το αλλάξεις: cat /etc/crontab",
        },
        hint: { en: "cat /etc/crontab", el: "cat /etc/crontab" },
        explain: {
          en: "Notice the comment line spelling out the field order — m h dom mon dow user command — and three real jobs: an hourly run-parts, a daily logrotate, a weekly apt job. Every Linux box you will ever audit looks like this; learn to skim it in seconds.",
          el: "Πρόσεξε τη γραμμή σχολίου που γράφει τη σειρά των πεδίων — m h dom mon dow user command — και τρεις πραγματικές εργασίες: ένα ωριαίο run-parts, ένα καθημερινό logrotate, ένα εβδομαδιαίο apt job. Κάθε Linux box που θα κάνεις audit μοιάζει έτσι· μάθε να το διαβάζεις σε δευτερόλεπτα.",
        },
        check: (t) => t.readFiles.has("/etc/crontab"),
      },
      {
        id: "sr-cron-list",
        instruction: {
          en: "List the table the proper way: crontab -l",
          el: "Εμφάνισε τον πίνακα με τον σωστό τρόπο: crontab -l",
        },
        hint: { en: "crontab -l", el: "crontab -l" },
        explain: {
          en: "crontab -l is the read-only view an auditor uses. It is also the first place to look for attacker persistence: an unfamiliar line running a script in /tmp or a hidden home directory is a red flag worth chasing.",
          el: "Το crontab -l είναι η read-only προβολή που χρησιμοποιεί ένας auditor. Είναι επίσης το πρώτο μέρος που κοιτάς για persistence επιτιθέμενου: μια άγνωστη γραμμή που τρέχει script σε /tmp ή σε κρυφό home φάκελο είναι κόκκινη σημαία που αξίζει να κυνηγήσεις.",
        },
        check: (t) => t.cronListed,
      },
      {
        id: "sr-cron-edit",
        instruction: {
          en: "Open the table for editing: crontab -e — and note the editor selection it offers.",
          el: "Άνοιξε τον πίνακα για επεξεργασία: crontab -e — και σημείωσε την επιλογή editor που προσφέρει.",
        },
        hint: { en: "crontab -e", el: "crontab -e" },
        explain: {
          en: "Debian asks which editor you want (1 = nano, the easy choice). The sandbox cannot host a full-screen editor, so the next task appends the line with redirection instead — a method that works identically on a real box and is what you will use over a non-interactive SSH session.",
          el: "Το Debian ρωτά ποιον editor θες (1 = nano, η εύκολη επιλογή). Το sandbox δεν μπορεί να φιλοξενήσει full-screen editor, οπότε η επόμενη εργασία προσθέτει τη γραμμή με ανακατεύθυνση — μέθοδος που δουλεύει πανομοιότυπα σε πραγματικό box και είναι αυτή που θα χρησιμοποιήσεις πάνω από μη διαδραστικό SSH session.",
        },
        check: (t) => t.cronEdited,
      },
      {
        id: "sr-cron-add",
        instruction: {
          en: "Schedule the scanner for 23:55 every night: echo \"55 23 * * * operator /home/operator/scanner.sh\" >> /etc/crontab",
          el: "Προγραμμάτισε τον scanner για τις 23:55 κάθε βράδυ: echo \"55 23 * * * operator /home/operator/scanner.sh\" >> /etc/crontab",
        },
        hint: {
          en: "echo \"55 23 * * * operator /home/operator/scanner.sh\" >> /etc/crontab",
          el: "echo \"55 23 * * * operator /home/operator/scanner.sh\" >> /etc/crontab",
        },
        explain: {
          en: "Minute 55, hour 23, every day, every month, every weekday, as operator, running the scanner. Read the five time fields left to right and the line stops looking like noise. The >> appended it without touching the existing jobs — always append to a crontab, never overwrite it.",
          el: "Λεπτό 55, ώρα 23, κάθε μέρα, κάθε μήνα, κάθε ημέρα εβδομάδας, ως operator, τρέχοντας τον scanner. Διάβασε τα πέντε χρονικά πεδία από αριστερά προς τα δεξιά και η γραμμή σταματά να μοιάζει με θόρυβο. Το >> την πρόσθεσε χωρίς να πειράξει τις υπάρχουσες εργασίες — πάντα να προσθέτεις σε crontab, ποτέ να μην το αντικαθιστάς.",
        },
        check: (t) => (t.fileContent("/etc/crontab") || "").includes("/home/operator/scanner.sh"),
      },
      {
        id: "sr-cron-verify",
        instruction: {
          en: "Confirm the schedule is registered: crontab -l and find your 55 23 line.",
          el: "Επιβεβαίωσε ότι το πρόγραμμα καταχωρήθηκε: crontab -l και βρες τη γραμμή 55 23.",
        },
        hint: { en: "crontab -l", el: "crontab -l" },
        explain: {
          en: "Change → verify, again. A cron entry that you never listed is an entry you cannot be sure about, and cron is unforgiving: a single wrong field means the job never runs and nothing complains.",
          el: "Αλλαγή → επαλήθευση, πάλι. Μια καταχώρηση cron που δεν εμφάνισες ποτέ είναι καταχώρηση για την οποία δεν μπορείς να είσαι σίγουρος, και το cron είναι αμείλικτο: ένα λάθος πεδίο σημαίνει ότι η εργασία δεν τρέχει ποτέ και τίποτα δεν παραπονιέται.",
        },
        check: (t) => t.cronListed && /55\s+23\s+\*\s+\*\s+\*/.test(t.fileContent("/etc/crontab") || ""),
      },
      {
        id: "sr-cron-rcdir",
        instruction: {
          en: "Look at the boot-link directory: ls /etc/rc3.d — these are the runlevel 3 start/stop links.",
          el: "Κοίταξε τον φάκελο με τους συνδέσμους εκκίνησης: ls /etc/rc3.d — αυτοί είναι οι σύνδεσμοι start/stop του runlevel 3.",
        },
        hint: { en: "ls /etc/rc3.d", el: "ls /etc/rc3.d" },
        explain: {
          en: "Right now it holds only a README. Once a service is registered for boot you will see files named S01mysql — S for start, the number for ordering, then the service name. K-files do the opposite. This directory is a persistence hunting ground on real assessments.",
          el: "Προς το παρόν κρατά μόνο ένα README. Μόλις μια υπηρεσία καταχωρηθεί για εκκίνηση θα δεις αρχεία με όνομα S01mysql — S για start, ο αριθμός για τη σειρά, μετά το όνομα της υπηρεσίας. Τα αρχεία K κάνουν το αντίθετο. Αυτός ο φάκελος είναι έδαφος κυνηγιού persistence σε πραγματικά assessments.",
        },
        check: (t) => t.listedDirs.has("/etc/rc3.d"),
      },
      {
        id: "sr-cron-updaterc",
        instruction: {
          en: "Register MySQL to start at every boot: update-rc.d mysql defaults",
          el: "Καταχώρησε τη MySQL να ξεκινά σε κάθε εκκίνηση: update-rc.d mysql defaults",
        },
        hint: { en: "update-rc.d mysql defaults", el: "update-rc.d mysql defaults" },
        explain: {
          en: "The tool created start links in runlevels 2, 3, 4 and 5 pointing at /etc/init.d/mysql. The other options are enable, disable and remove. This is the standard way to make a service survive reboots — and the standard way attackers install persistence.",
          el: "Το εργαλείο δημιούργησε συνδέσμους εκκίνησης στα runlevels 2, 3, 4 και 5 που δείχνουν στο /etc/init.d/mysql. Οι υπόλοιπες επιλογές είναι enable, disable και remove. Αυτός είναι ο τυπικός τρόπος να επιβιώνει μια υπηρεσία των επανεκκινήσεων — και ο τυπικός τρόπος που οι επιτιθέμενοι εγκαθιστούν persistence.",
        },
        check: (t) => t.rcAdded.has("mysql:defaults"),
      },
      {
        id: "sr-cron-rclink",
        instruction: {
          en: "Prove the link materialised: ls /etc/rc3.d again and look for S01mysql.",
          el: "Απόδειξε ότι ο σύνδεσμος υλοποιήθηκε: ls /etc/rc3.d ξανά και ψάξε για το S01mysql.",
        },
        hint: { en: "ls /etc/rc3.d", el: "ls /etc/rc3.d" },
        explain: {
          en: "S01mysql is there. Tools that claim to have changed the system should always be checked this way — the claim and the filesystem are two different things, and only one of them is true.",
          el: "Το S01mysql είναι εκεί. Εργαλεία που ισχυρίζονται ότι άλλαξαν το σύστημα πρέπει πάντα να ελέγχονται έτσι — ο ισχυρισμός και το σύστημα αρχείων είναι δύο διαφορετικά πράγματα, και μόνο το ένα είναι αλήθεια.",
        },
        check: (t) => t.exists("/etc/rc3.d/S01mysql"),
      },
      {
        id: "sr-cron-psmysql",
        instruction: {
          en: "Confirm the database really is running on this box: ps aux | grep mysql",
          el: "Επιβεβαίωσε ότι η βάση πραγματικά τρέχει σε αυτό το box: ps aux | grep mysql",
        },
        hint: { en: "ps aux | grep mysql", el: "ps aux | grep mysql" },
        explain: {
          en: "mysqld is in the process table. Boot configuration plus a running process plus a verified link — three independent confirmations of the same fact. That triangle (config, process, filesystem) is how you prove anything on a machine you do not trust.",
          el: "Η mysqld είναι στον πίνακα διεργασιών. Ρύθμιση εκκίνησης συν τρέχουσα διεργασία συν επαληθευμένος σύνδεσμος — τρεις ανεξάρτητες επιβεβαιώσεις του ίδιου γεγονότος. Αυτό το τρίγωνο (ρύθμιση, διεργασία, σύστημα αρχείων) είναι ο τρόπος να αποδείξεις οτιδήποτε σε μηχάνημα που δεν εμπιστεύεσαι.",
        },
        check: (t) => cmd(t, /^ps\s+aux\s*\|\s*grep\s+mysql/),
      },
    ],
    challenges: [
      {
        title: { en: "Every Hour, Forever", el: "Κάθε Ώρα, Για Πάντα" },
        brief: {
          en: "Schedule simple_bash.sh to run at minute 0 of every hour as operator, appended to /etc/crontab, then list the table so the entry is on screen.",
          el: "Προγραμμάτισε το simple_bash.sh να τρέχει στο λεπτό 0 κάθε ώρας ως operator, προστιθέμενο στο /etc/crontab, και μετά εμφάνισε τον πίνακα ώστε η καταχώρηση να είναι στην οθόνη.",
        },
        success: { en: "An hourly job, registered and verified. Cron is yours.", el: "Μια ωριαία εργασία, καταχωρημένη και επαληθευμένη. Το cron είναι δικό σου." },
        check: (t) =>
          /(^|\n)0\s+\*\s+\*\s+\*\s+\*[^\n]*simple_bash\.sh/.test(t.fileContent("/etc/crontab") || "") &&
          t.cronListed,
      },
      {
        title: { en: "Boot Proof", el: "Απόδειξη Εκκίνησης" },
        brief: {
          en: "Undo the persistence you created: remove mysql from the boot runlevels with update-rc.d, then prove the S-link is gone from /etc/rc3.d.",
          el: "Αναίρεσε το persistence που δημιούργησες: αφαίρεσε τη mysql από τα runlevels εκκίνησης με update-rc.d, και μετά απόδειξε ότι ο σύνδεσμος S έφυγε από το /etc/rc3.d.",
        },
        success: { en: "Link removed and verified — you can install persistence and clean it up.", el: "Ο σύνδεσμος αφαιρέθηκε και επαληθεύτηκε — μπορείς να εγκαταστήσεις persistence και να το καθαρίσεις." },
        check: (t) => t.rcAdded.has("mysql:remove") && !t.exists("/etc/rc3.d/S01mysql"),
      },
    ],
  },

  // ==================================================== MODULE 12 — SERVICE OPS
  {
    id: "sr-services",
    order: 12,
    icon: "🛰️",
    color: "from-orange-500 to-rose-700",
    title: { en: "Service Ops", el: "Λειτουργίες Υπηρεσιών" },
    subtitle: {
      en: "Apache on localhost, OpenSSH to a remote box, and an anonymous FTP pull.",
      el: "Apache στο localhost, OpenSSH σε απομακρυσμένο box, και anonymous FTP λήψη.",
    },
    difficulty: 3,
    badge: { en: "Service Marshal", el: "Επόπτης Υπηρεσιών" },
    labFS: buildSudoRunFS,
    theory: [
      {
        heading: { en: "What a service is", el: "Τι είναι μια υπηρεσία" },
        body: {
          en: "'Service' is the common Linux word for an application that runs in the background waiting to be used — there is no window, only a listening port and a process. Several come preinstalled, and the ones you will meet constantly are the Apache web server (creating and deploying web servers) and OpenSSH (connecting to another machine's terminal). Understanding how they work from the inside is what lets you abuse them later, which is the whole point of this module.",
          el: "«Υπηρεσία» είναι η κοινή λέξη του Linux για μια εφαρμογή που τρέχει στο παρασκήνιο περιμένοντας να χρησιμοποιηθεί — δεν υπάρχει παράθυρο, μόνο μια θύρα που ακούει και μια διεργασία. Αρκετές έρχονται προεγκατεστημένες, και αυτές που θα συναντάς συνεχώς είναι ο Apache web server (δημιουργία και deployment web servers) και το OpenSSH (σύνδεση στο τερματικό άλλου μηχανήματος). Το να καταλάβεις πώς δουλεύουν από μέσα είναι αυτό που σου επιτρέπει να τις εκμεταλλευτείς αργότερα, που είναι και όλο το νόημα αυτής της ενότητας.",
        },
      },
      {
        heading: { en: "start, stop, restart, status", el: "start, stop, restart, status" },
        body: {
          en: "One grammar covers them all: `service <name> <start|stop|restart|status>`. Start it, check it with status, stop it, and restart it whenever you change a configuration file and need the process to re-read it. `status` is the honest friend here — it prints Active: active (running) or inactive (dead), and it is the first command to run whenever 'the website is down' or 'I cannot connect'.",
          el: "Μία γραμματική τα καλύπτει όλα: `service <όνομα> <start|stop|restart|status>`. Ξεκίνα το, έλεγξέ το με status, σταμάτα το, και επανεκκίνησέ το όποτε αλλάξεις αρχείο ρυθμίσεων και χρειάζεται η διεργασία να το ξαναδιαβάσει. Το `status` είναι ο τίμιος φίλος εδώ — τυπώνει Active: active (running) ή inactive (dead), και είναι η πρώτη εντολή που τρέχεις όποτε «πέσε το site» ή «δεν συνδέομαι».",
        },
      },
      {
        heading: { en: "Apache: your own web server", el: "Apache: ο δικός σου web server" },
        body: {
          en: "More than sixty percent of the world's web servers run Apache, which makes it mandatory knowledge for a pentester. Start the service, then look at the file it serves by default: /var/www/html/index.html — the document root. Edit that file with nano (or overwrite it with echo), and the change appears the moment you load http://localhost in a browser. That single path is why web servers are so interesting to attackers: whoever can write there controls what every visitor sees, and a writable document root on a shared box is a route from 'some user' to 'code running as the web server'.",
          el: "Πάνω από εξήντα τοις εκατό των web servers του κόσμου τρέχουν Apache, που τον κάνει υποχρεωτική γνώση για έναν pentester. Ξεκίνα την υπηρεσία και μετά κοίτα το αρχείο που σερβίρει από προεπιλογή: /var/www/html/index.html — το document root. Επεξεργάσου αυτό το αρχείο με nano (ή αντικατέστησέ το με echo), και η αλλαγή εμφανίζεται τη στιγμή που θα φορτώσεις το http://localhost σε browser. Αυτή η μία διαδρομή είναι ο λόγος που οι web servers είναι τόσο ενδιαφέροντες για επιτιθέμενους: όποιος μπορεί να γράψει εκεί ελέγχει τι βλέπει κάθε επισκέπτης, και ένα εγγράψιμο document root σε κοινό box είναι διαδρομή από το «κάποιος χρήστης» στο «κώδικας που τρέχει ως web server».",
        },
        tip: {
          en: "curl http://localhost is the terminal's version of opening a browser — perfect for verifying a web server without leaving the shell.",
          el: "Το curl http://localhost είναι η εκδοχή του τερματικού για το άνοιγμα browser — τέλειο για να επαληθεύεις έναν web server χωρίς να φύγεις από το shell.",
        },
      },
      {
        heading: { en: "OpenSSH: encrypted remote terminals", el: "OpenSSH: κρυπτογραφημένα απομακρυσμένα τερματικά" },
        body: {
          en: "Secure Shell is what lets you connect to a terminal on a remote system, securely. Unlike its ancestor telnet — which sent every keystroke, including passwords, in clear text across the network — SSH encrypts the whole channel, which is why telnet has all but disappeared from production. Start the service, then connect with the syntax `ssh username@address`, for example `ssh ignite@192.168.0.11`, and you get a full shell on the other machine as that user. Everything you learned in this campaign — navigation, permissions, processes — now applies on somebody else's box, which is why SSH is both the pentester's front door and the defender's most-audited service.",
          el: "Το Secure Shell είναι αυτό που σε αφήνει να συνδεθείς σε τερματικό απομακρυσμένου συστήματος, με ασφάλεια. Σε αντίθεση με τον πρόγονό του telnet — που έστελνε κάθε πλήκτρο, μαζί και κωδικούς, σε καθαρό κείμενο μέσα από το δίκτυο — το SSH κρυπτογραφεί ολόκληρο το κανάλι, γι' αυτό το telnet έχει σχεδόν εξαφανιστεί από την παραγωγή. Ξεκίνα την υπηρεσία, μετά συνδέσου με τη σύνταξη `ssh username@address`, για παράδειγμα `ssh ignite@192.168.0.11`, και παίρνεις πλήρες shell στο άλλο μηχάνημα ως αυτός ο χρήστης. Ό,τι έμαθες σε αυτή την καμπάνια — πλοήγηση, δικαιώματα, διεργασίες — τώρα ισχύει στο box κάποιου άλλου, γι' αυτό το SSH είναι και η μπροστινή πόρτα του pentester και η πιο ελεγχόμενη υπηρεσία του αμυνόμενου.",
        },
      },
      {
        heading: { en: "FTP: file transfer, and anonymous logins", el: "FTP: μεταφορά αρχείων, και anonymous συνδέσεις" },
        body: {
          en: "The File Transfer Protocol does what its name says: move files over the network from a command line. Connect with `ftp <host>`, answer the name prompt, then the password prompt. Many public mirrors accept the username `anonymous` with the password `anonymous` — a deliberate convention for open download areas, and the first thing any tester tries, because a misconfigured FTP server frequently turns out to allow uploads as well. Once inside, the navigation commands you already know work unchanged: `ls` lists, `cd` moves, `get file` downloads to your current local directory, and `bye` logs out. Note that classic FTP sends credentials unencrypted, exactly like telnet — modern transfers use SFTP or FTPS.",
          el: "Το File Transfer Protocol κάνει ό,τι λέει το όνομά του: μεταφέρει αρχεία μέσα από το δίκτυο από γραμμή εντολών. Συνδέσου με `ftp <host>`, απάντησε στο prompt ονόματος, μετά στο prompt κωδικού. Πολλά δημόσια mirrors δέχονται το όνομα `anonymous` με κωδικό `anonymous` — σκόπιμη σύμβαση για ανοιχτές περιοχές λήψης, και το πρώτο που δοκιμάζει κάθε tester, γιατί ένας κακορυθμισμένος FTP server συχνά αποδεικνύεται ότι επιτρέπει και ανέβασμα. Μέσα, οι εντολές πλοήγησης που ήδη ξέρεις δουλεύουν αναλλοίωτες: το `ls` εμφανίζει, το `cd` μετακινεί, το `get file` κατεβάζει στον τρέχοντα τοπικό σου φάκελο, και το `bye` σε αποσυνδέει. Πρόσεξε ότι το κλασικό FTP στέλνει τα credentials χωρίς κρυπτογράφηση, ακριβώς όπως το telnet — οι σύγχρονες μεταφορές χρησιμοποιούν SFTP ή FTPS.",
        },
      },
    ],
    cheats: [
      { cmd: "service NAME start/stop/restart/status", desc: { en: "The one grammar for every service", el: "Η μία γραμματική για κάθε υπηρεσία" } },
      { cmd: "/var/www/html/index.html", desc: { en: "Apache's default document root", el: "Το προεπιλεγμένο document root του Apache" } },
      { cmd: "curl http://localhost", desc: { en: "Fetch your own web server", el: "Φέρε τον δικό σου web server" } },
      { cmd: "ssh user@host", desc: { en: "Encrypted remote terminal", el: "Κρυπτογραφημένο απομακρυσμένο τερματικό" } },
      { cmd: "ftp HOST", desc: { en: "Connect, then ls / cd / get / bye", el: "Σύνδεση, μετά ls / cd / get / bye" } },
      { cmd: "anonymous / anonymous", desc: { en: "The classic public-mirror login", el: "Η κλασική σύνδεση δημόσιου mirror" } },
      { cmd: "get file · bye", desc: { en: "Download to cwd, then log out", el: "Κατέβασμα στο cwd, μετά αποσύνδεση" } },
    ],
    tasks: [
      {
        id: "sr-svc-cold",
        instruction: {
          en: "Start in the wrong order on purpose: fetch your web server before starting it — curl http://localhost",
          el: "Ξεκίνα επίτηδες με τη λάθος σειρά: φέρε τον web server σου πριν τον ξεκινήσεις — curl http://localhost",
        },
        hint: { en: "curl http://localhost", el: "curl http://localhost" },
        explain: {
          en: "Connection refused. Nothing is listening on port 80 yet, and that error is the most common thing you will see during a web assessment — it means 'no service here', not 'blocked' and not 'broken page'. Always establish the cold state first; it makes the warm state meaningful.",
          el: "Connection refused. Τίποτα δεν ακούει ακόμα στη θύρα 80, και αυτό το σφάλμα είναι το πιο συχνό πράγμα που θα δεις σε web assessment — σημαίνει «καμία υπηρεσία εδώ», όχι «μπλοκαρισμένο» και όχι «σπασμένη σελίδα». Πάντα να καθιερώνεις πρώτα την ψυχρή κατάσταση· κάνει τη ζεστή κατάσταση να έχει νόημα.",
        },
        check: (t) => cmd(t, /^curl\s+http:\/\/localhost/),
      },
      {
        id: "sr-svc-status",
        instruction: {
          en: "Ask the service manager directly: service apache2 status",
          el: "Ρώτα απευθείας τον διαχειριστή υπηρεσιών: service apache2 status",
        },
        hint: { en: "service apache2 status", el: "service apache2 status" },
        explain: {
          en: "'inactive (dead)' — confirmation from the system itself, matching the refused connection. Two independent observations of the same fact is how you build confidence instead of guesswork.",
          el: "'inactive (dead)' — επιβεβαίωση από το ίδιο το σύστημα, που ταιριάζει με την άρνηση σύνδεσης. Δύο ανεξάρτητες παρατηρήσεις του ίδιου γεγονότος είναι ο τρόπος να χτίζεις βεβαιότητα αντί για εικασίες.",
        },
        check: (t) => cmd(t, /^service\s+apache2\s+status\b/),
      },
      {
        id: "sr-svc-start",
        instruction: {
          en: "Bring the web server up: service apache2 start",
          el: "Ανέβασε τον web server: service apache2 start",
        },
        hint: { en: "service apache2 start", el: "service apache2 start" },
        explain: {
          en: "Active (running), and a new apache2 process appears in ps aux. On a real Kali box you would also see port 80 listening in netstat. Starting a service is the moment an attack surface appears — defenders watch for exactly this event.",
          el: "Active (running), και μια νέα διεργασία apache2 εμφανίζεται στο ps aux. Σε πραγματικό Kali box θα έβλεπες και τη θύρα 80 να ακούει στο netstat. Η εκκίνηση μιας υπηρεσίας είναι η στιγμή που εμφανίζεται επιφάνεια επίθεσης — οι αμυνόμενοι παρακολουθούν ακριβώς αυτό το γεγονός.",
        },
        check: (t) => t.serviceState("apache2").startsWith("active"),
      },
      {
        id: "sr-svc-curl",
        instruction: {
          en: "Now fetch the page from the terminal: curl http://localhost — this is your browser, without the browser.",
          el: "Τώρα φέρε τη σελίδα από το τερματικό: curl http://localhost — αυτός είναι ο browser σου, χωρίς browser.",
        },
        hint: { en: "curl http://localhost", el: "curl http://localhost" },
        explain: {
          en: "HTTP 200 and the HTML body — served by YOUR apache from /var/www/html/index.html. On a real machine you would type http://localhost into a browser and see the rendered page; the terminal version shows you the raw bytes, which is what you actually need when hunting for headers, cookies or injected content.",
          el: "HTTP 200 και το HTML body — σερβιρισμένα από τον ΔΙΚΟ σου apache από το /var/www/html/index.html. Σε πραγματικό μηχάνημα θα έγραφες http://localhost σε browser και θα έβλεπες τη σελίδα· η εκδοχή τερματικού σου δείχνει τα ωμά bytes, που είναι ό,τι χρειάζεσαι πραγματικά όταν κυνηγάς headers, cookies ή injected περιεχόμενο.",
        },
        check: (t) => t.curled.has("localhost") && t.serviceState("apache2").startsWith("active"),
      },
      {
        id: "sr-svc-nano",
        instruction: {
          en: "Open the page Apache is serving: nano /var/www/html/index.html",
          el: "Άνοιξε τη σελίδα που σερβίρει ο Apache: nano /var/www/html/index.html",
        },
        hint: { en: "nano /var/www/html/index.html", el: "nano /var/www/html/index.html" },
        explain: {
          en: "This is the document root: whatever is in this file is what every visitor of http://localhost receives. Owning a writable document root is a serious finding on any assessment — it means arbitrary content in front of trusted visitors, and often a foothold into the web server's own account.",
          el: "Αυτό είναι το document root: ό,τι υπάρχει σε αυτό το αρχείο είναι ό,τι λαμβάνει κάθε επισκέπτης του http://localhost. Το να κατέχεις ένα εγγράψιμο document root είναι σοβαρό εύρημα σε κάθε assessment — σημαίνει αυθαίρετο περιεχόμενο μπροστά σε αξιόπιστους επισκέπτες, και συχνά πάτημα μέσα στον ίδιο τον λογαριασμό του web server.",
        },
        check: (t) => t.nanoOpened.has("/var/www/html/index.html"),
      },
      {
        id: "sr-svc-restart",
        instruction: {
          en: "Re-read configuration the professional way: service apache2 restart",
          el: "Ξαναδιάβασε τη ρύθμιση με τον επαγγελματικό τρόπο: service apache2 restart",
        },
        hint: { en: "service apache2 restart", el: "service apache2 restart" },
        explain: {
          en: "Restart stops and starts in one move, so configuration changes take effect. Use it after editing a config file; use stop when you want the service gone (and remember that leaving a service stopped on a production box is an outage, not a cleanup).",
          el: "Το restart σταματά και ξεκινά με μία κίνηση, άρα οι αλλαγές ρυθμίσεων εφαρμόζονται. Χρησιμοποίησέ το μετά από επεξεργασία αρχείου ρυθμίσεων· χρησιμοποίησε το stop όταν θες η υπηρεσία να φύγει (και θυμήσου ότι το να αφήνεις μια υπηρεσία σταματημένη σε production box είναι διακοπή λειτουργίας, όχι καθαριότητα).",
        },
        check: (t) => cmd(t, /^service\s+apache2\s+restart\b/),
      },
      {
        id: "sr-svc-stop",
        instruction: {
          en: "Take it down again: service apache2 stop — then curl http://localhost to see the refused connection return.",
          el: "Κατέβασέ το ξανά: service apache2 stop — και μετά κάνε curl http://localhost για να δεις την άρνηση σύνδεσης να επιστρέφει.",
        },
        hint: { en: "service apache2 stop  then  curl http://localhost", el: "service apache2 stop  και μετά  curl http://localhost" },
        explain: {
          en: "Same loop in reverse, and a lesson in itself: attack surface you can create, you can also remove. On a hardened box, every service you do not need should be stopped and disabled — each one is a door with a lock somebody must maintain.",
          el: "Ίδιος βρόχος ανάποδα, και μάθημα από μόνο του: επιφάνεια επίθεσης που μπορείς να δημιουργήσεις, μπορείς και να την αφαιρέσεις. Σε θωρακισμένο box, κάθε υπηρεσία που δεν χρειάζεσαι πρέπει να είναι σταματημένη και απενεργοποιημένη — η καθεμία είναι πόρτα με κλειδαριά που κάποιος πρέπει να συντηρεί.",
        },
        check: (t) => t.serviceState("apache2").startsWith("inactive"),
      },
      {
        id: "sr-svc-sshstart",
        instruction: {
          en: "Enable remote terminals on this box: service ssh start",
          el: "Ενεργοποίησε απομακρυσμένα τερματικά σε αυτό το box: service ssh start",
        },
        hint: { en: "service ssh start", el: "service ssh start" },
        explain: {
          en: "The sshd daemon now listens on port 22. Every service in this module follows the same rule: the service must be running before any client can reach it — which is why 'is the service up?' is always question one.",
          el: "Ο daemon sshd τώρα ακούει στη θύρα 22. Κάθε υπηρεσία σε αυτή την ενότητα ακολουθεί τον ίδιο κανόνα: η υπηρεσία πρέπει να τρέχει πριν την φτάσει οποιοσδήποτε πελάτης — γι' αυτό το «τρέχει η υπηρεσία;» είναι πάντα η πρώτη ερώτηση.",
        },
        check: (t) => t.serviceState("ssh").startsWith("active"),
      },
      {
        id: "sr-svc-ssh",
        instruction: {
          en: "Connect to a remote machine as another user: ssh ignite@192.168.0.11",
          el: "Συνδέσου σε απομακρυσμένο μηχάνημα ως άλλος χρήστης: ssh ignite@192.168.0.11",
        },
        hint: { en: "ssh ignite@192.168.0.11", el: "ssh ignite@192.168.0.11" },
        explain: {
          en: "Username @ address, a host-key warning the first time, a password prompt, and then a shell on the other machine — here an Ubuntu box, logged in as ignite. The channel is encrypted end to end, which is precisely why SSH replaced telnet everywhere. Everything else in this campaign now works on that remote box too.",
          el: "Όνομα χρήστη @ διεύθυνση, μια προειδοποίηση host-key την πρώτη φορά, ένα prompt κωδικού, και μετά shell στο άλλο μηχάνημα — εδώ ένα Ubuntu box, συνδεδεμένος ως ignite. Το κανάλι είναι κρυπτογραφημένο από άκρη σε άκρη, που είναι ακριβώς ο λόγος που το SSH αντικατέστησε το telnet παντού. Ό,τι άλλο σε αυτή την καμπάνια δουλεύει τώρα και σε εκείνο το απομακρυσμένο box.",
        },
        check: (t) => t.sshSessions.has("ignite@192.168.0.11"),
      },
      {
        id: "sr-svc-ftpconnect",
        instruction: {
          en: "Reach the HackForge file mirror: ftp files.hackforge.lab — then answer both prompts with the word anonymous.",
          el: "Φτάσε το mirror αρχείων του HackForge: ftp files.hackforge.lab — και μετά απάντησε και στα δύο prompts με τη λέξη anonymous.",
        },
        hint: { en: "ftp files.hackforge.lab  →  anonymous  →  anonymous", el: "ftp files.hackforge.lab  →  anonymous  →  anonymous" },
        explain: {
          en: "Name prompt, password prompt, and '230 Login successful'. Anonymous access is a deliberate feature of public mirrors, and it is also the first thing a tester checks on any FTP server they find — because anonymous servers are frequently writable by mistake.",
          el: "Prompt ονόματος, prompt κωδικού, και '230 Login successful'. Η anonymous πρόσβαση είναι σκόπιμο χαρακτηριστικό των δημόσιων mirrors, και είναι επίσης το πρώτο που ελέγχει ένας tester σε όποιον FTP server βρει — γιατί οι anonymous servers συχνά είναι κατά λάθος εγγράψιμοι.",
        },
        check: (t) => cmd(t, /^ftp\s+files\.hackforge\.lab\b/),
      },
      {
        id: "sr-svc-ftpnavigate",
        instruction: {
          en: "Inside the FTP session, navigate like you would locally: ls , then cd ubuntu , then cd releases , then ls again.",
          el: "Μέσα στο FTP session, πλοήγησε όπως θα έκανες τοπικά: ls , μετά cd ubuntu , μετά cd releases , μετά πάλι ls.",
        },
        hint: { en: "ls  →  cd ubuntu  →  cd releases  →  ls", el: "ls  →  cd ubuntu  →  cd releases  →  ls" },
        explain: {
          en: "The same verbs, the same mental model — which is the real payoff of learning navigation first. Remote filesystems, FTP shares, even web directories all respond to 'where am I, what is here, go deeper'.",
          el: "Ίδια ρήματα, ίδιο νοητικό μοντέλο — που είναι η πραγματική απόδοση του να μαθαίνεις πρώτα την πλοήγηση. Απομακρυσμένα συστήματα αρχείων, FTP shares, ακόμα και web φάκελοι, όλα απαντούν στο «πού είμαι, τι υπάρχει εδώ, πήγαινε βαθύτερα».",
        },
        check: (t) => cmd(t, /^cd\s+releases\b/),
      },
      {
        id: "sr-svc-ftpget",
        instruction: {
          en: "Pull a file down: get favicon.ico — it lands in your local current directory.",
          el: "Κατέβασε ένα αρχείο: get favicon.ico — προσγειώνεται στον τοπικό τρέχοντα φάκελό σου.",
        },
        hint: { en: "get favicon.ico", el: "get favicon.ico" },
        explain: {
          en: "'226 Transfer complete'. get downloads to wherever your shell currently sits — which is why people cd to a scratch folder first and then discover the file in the wrong place. The mirror command is put, which uploads — and an anonymous server that accepts put is a serious finding.",
          el: "'226 Transfer complete'. Το get κατεβάζει όπου κάθεται αυτή τη στιγμή το shell σου — γι' αυτό οι άνθρωποι πάνε πρώτα σε έναν φάκελο scratch και μετά ανακαλύπτουν το αρχείο σε λάθος μέρος. Η αντίστροφη εντολή είναι το put, που ανεβάζει — και ένας anonymous server που δέχεται put είναι σοβαρό εύρημα.",
        },
        check: (t) => t.ftpGot.has("favicon.ico"),
      },
      {
        id: "sr-svc-ftpbye",
        instruction: {
          en: "Log out cleanly with bye — then ls your home directory and find the file you just downloaded.",
          el: "Αποσυνδέσου καθαρά με bye — και μετά κάνε ls στον home φάκελό σου και βρες το αρχείο που μόλις κατέβασες.",
        },
        hint: { en: "bye  then  ls", el: "bye  και μετά  ls" },
        explain: {
          en: "'221 Goodbye' and the file is sitting in your home directory. Logging out properly closes the session and flushes the transfer log — leaving FTP sessions open is how half-finished downloads and confused audit trails happen.",
          el: "'221 Goodbye' και το αρχείο κάθεται στον home φάκελό σου. Η σωστή αποσύνδεση κλείνει το session και ολοκληρώνει το log μεταφοράς — το να αφήνεις FTP sessions ανοιχτά είναι ο τρόπος που συμβαίνουν μισοτελειωμένα κατεβάσματα και μπερδεμένα audit trails.",
        },
        check: (t) => t.ftpDone && t.exists("/home/operator/favicon.ico"),
      },
    ],
    challenges: [
      {
        title: { en: "Loopback Landing", el: "Προσγείωση Loopback" },
        brief: {
          en: "Publish your own page: overwrite /var/www/html/index.html with a single echo line of your choosing, start (or restart) apache2, then fetch http://localhost and see your text served back to you.",
          el: "Δημοσίευσε δική σου σελίδα: αντικατάστησε το /var/www/html/index.html με μία γραμμή echo της επιλογής σου, ξεκίνα (ή επανεκκίνησε) το apache2, και μετά φέρε το http://localhost και δες το κείμενό σου να σου σερβίρεται πίσω.",
        },
        success: { en: "You wrote the document root and served it. That is a web server, end to end.", el: "Έγραψες το document root και το σέρβιρες. Αυτό είναι ένας web server, από άκρη σε άκρη." },
        check: (t) =>
          cmd(t, /^echo\b.*>\s*\/var\/www\/html\/index\.html/) &&
          t.serviceState("apache2").startsWith("active") &&
          t.curled.has("localhost"),
      },
      {
        title: { en: "Anonymous Cargo", el: "Ανώνυμο Φορτίο" },
        brief: {
          en: "Go back to the mirror and take the checksums as well: connect to files.hackforge.lab, log in as anonymous, download SHA256SUMS.txt, and leave with bye so both downloaded files are verifiably in your home directory.",
          el: "Γύρνα στο mirror και πάρε και τα checksums: συνδέσου στο files.hackforge.lab, μπες ως anonymous, κατέβασε το SHA256SUMS.txt, και φύγε με bye ώστε και τα δύο κατεβασμένα αρχεία να είναι επαληθεύσιμα στον home φάκελό σου.",
        },
        success: { en: "Two files pulled over FTP and a clean logout. File transfer mastered.", el: "Δύο αρχεία τραβήχτηκαν μέσω FTP και καθαρή αποσύνδεση. Η μεταφορά αρχείων κατακτήθηκε." },
        check: (t) =>
          t.ftpGot.has("SHA256SUMS.txt") &&
          t.ftpDone &&
          t.exists("/home/operator/favicon.ico") &&
          t.exists("/home/operator/SHA256SUMS.txt"),
      },
    ],
  },
];
