import type { Module } from "./lessons";
import { usedCmd } from "../lib/terminal";

const lab = "sudorun" as const;
const shot = (cmd: string, lines: string[]) => ({ cmd, lines });

export const SUDO_RUN_MODULES_C: Module[] = [
  {
    id: "sr-bash",
    order: 11,
    icon: "terminal",
    color: "from-emerald-400 to-green-900",
    difficulty: 3,
    scenario: lab,
    title: { en: "Bash scripting basics", el: "Βασικά bash scripts" },
    subtitle: { en: "shebang, echo, chmod +x, read, scanner", el: "shebang, echo, chmod +x, read, scanner" },
    badge: { en: "Scripter", el: "Σκριπτάς" },
    theory: [
      {
        heading: { en: "The shell is bash", el: "Το shell είναι bash" },
        body: {
          en: "Operators automate commands — sometimes from several tools — by writing small programs. A shell is the interface to the OS. We use bash. You only need a text editor (nano, vim). Scripts in this lab already live in /root so you can chmod and run them; the lesson is still: write the shebang yourself on real boxes.",
          el: "Το bash αυτοματοποιεί εντολές. Στο lab τα scripts είναι στο /root για να τα τρέξεις.",
        },
      },
      {
        heading: { en: "Shebang #!", el: "Shebang #!" },
        body: {
          en: "First line of a script tells the kernel which interpreter: #!/bin/bash . File: first_script",
          el: "Πρώτη γραμμή: #!/bin/bash",
        },
        shots: [shot("cat first_script", ["#!/bin/bash", 'echo "Hello World"'])],
      },
      {
        heading: { en: "echo Hello World", el: "echo Hello World" },
        body: {
          en: "echo prints a line. After chmod +x first_script run it with ./first_script  (the ./ means 'in this directory').",
          el: "chmod +x και ./first_script",
        },
        shots: [
          shot("chmod +x first_script", [""]),
          shot("./first_script", ["Hello World"]),
        ],
      },
      {
        heading: { en: "read — user input", el: "read — είσοδος" },
        body: {
          en: 'A variable is a bucket. welcome.sh does: echo "What is your name?" ; read name ; echo "Welcome, $name". chmod +x welcome.sh && ./welcome.sh — the sandbox greets you as operator.',
          el: "./welcome.sh διαβάζει όνομα.",
        },
        shots: [shot("./welcome.sh", ["What is your name?", "Welcome, operator"])],
      },
      {
        heading: { en: "A tiny scanner", el: "Μικρός scanner" },
        body: {
          en: "nmap <scan type> <target>. -sn (modern name of -sP) is a ping sweep: who is alive on the /24. scanner wraps that. chmod +x scanner && ./scanner   (or bash scanner). Output is a simulated list of lab hosts. Only scan networks you are allowed to.",
          el: "./scanner κάνει ping sweep στο lab /24.",
        },
        shots: [
          shot("./scanner", ["Enter the ip address", "Nmap scan report for 10.10.10.1", "Nmap scan report for 10.10.10.5", "Nmap scan report for 10.10.10.8"]),
        ],
        tip: { en: "The published snippet had typos (nma -sp). In GameHack the script calls nmap -sn correctly.", el: "Στο GameHack το script καλεί σωστά nmap -sn." },
      },
    ],
    cheats: [
      { cmd: "#!/bin/bash", desc: { en: "shebang", el: "shebang" } },
      { cmd: "chmod +x FILE", desc: { en: "make executable", el: "εκτελέσιμο" } },
      { cmd: "./first_script", desc: { en: "run in cwd", el: "εκτέλεση εδώ" } },
      { cmd: "./welcome.sh", desc: { en: "read + echo", el: "read + echo" } },
      { cmd: "./scanner", desc: { en: "wrapped nmap -sn", el: "nmap -sn" } },
    ],
    tasks: [
      { id: "cat1", instruction: { en: "cat first_script  — see the shebang and Hello World", el: "cat first_script" }, hint: { en: "cat /root/first_script", el: "cat first_script" }, explain: { en: "Always read before you run.", el: "Διάβαζε πριν τρέξεις." }, check: (t) => t.filesRead.some((p) => p.includes("first_script")) || usedCmd(t, /cat\s+.*first_script/) },
      { id: "x1", instruction: { en: "chmod +x first_script", el: "chmod +x first_script" }, hint: { en: "chmod +x first_script", el: "chmod +x first_script" }, explain: { en: "Without +x, ./ fails.", el: "Χωρίς +x αποτυγχάνει το ./." }, check: (t) => usedCmd(t, /chmod\s+\+x\s+.*first_script/) || t.flags.has("chmod-x") },
      { id: "run1", instruction: { en: "./first_script   (or bash first_script)", el: "./first_script" }, hint: { en: "./first_script", el: "./first_script" }, explain: { en: "./ means this folder.", el: "./ = αυτός ο φάκελος." }, check: (t) => t.flags.has("hello-script") || usedCmd(t, /\.\/first_script|bash\s+first_script/) },
      { id: "welcome", instruction: { en: "./welcome.sh  after chmod +x if needed", el: "./welcome.sh" }, hint: { en: "chmod +x welcome.sh\n./welcome.sh", el: "chmod +x welcome.sh\n./welcome.sh" }, explain: { en: "read name into a variable.", el: "read σε μεταβλητή." }, check: (t) => t.flags.has("read-script") || usedCmd(t, /welcome\.sh/) },
      { id: "scan", instruction: { en: "./scanner  (ping sweep wrapper)", el: "./scanner" }, hint: { en: "./scanner", el: "./scanner" }, explain: { en: "-sn ping scan of the lab /24.", el: "Ping scan /24." }, check: (t) => t.flags.has("run-scanner") || usedCmd(t, /scanner/) },
    ],
    challenges: [
      {
        title: { en: "Raw nmap -sn", el: "Απευθείας nmap -sn" },
        brief: { en: "nmap -sn 10.10.10.0/24", el: "nmap -sn 10.10.10.0/24" },
        success: { en: "You don't need a wrapper once you know the flag.", el: "Ξέρεις το flag χωρίς wrapper." },
        check: (t) => t.flags.has("nmap-sn") || t.flags.has("nmap-sweep") || usedCmd(t, /nmap\s+-s[nP]/),
      },
      {
        title: { en: "nano your own copy", el: "nano δικό σου αντίγραφο" },
        brief: { en: "nano ~/my_hello.sh  (creates/opens). Optional: put the same shebang in it.", el: "nano ~/my_hello.sh" },
        success: { en: "You used an editor on a new script.", el: "Άνοιξες editor σε νέο script." },
        check: (t) => t.flags.has("nano") || usedCmd(t, /nano\s+/),
      },
    ],
  },
  {
    id: "sr-cron",
    order: 12,
    icon: "settings",
    color: "from-cyan-300 to-stone-800",
    difficulty: 3,
    scenario: lab,
    title: { en: "Scheduling & rc scripts", el: "Χρονοπρογραμματισμός & rc" },
    subtitle: { en: "cron, crontab -e, update-rc.d", el: "cron, crontab -e, update-rc.d" },
    badge: { en: "Clockwork", el: "Ρολόι" },
    theory: [
      {
        heading: { en: "cron table fields", el: "Πεδία crontab" },
        body: {
          en: "crond reads a table (/etc/crontab and per-user tables) for commands to fire. Seven fields in the system file: minute (0-59), hour (0-23), day-of-month (1-31), month (1-12), day-of-week (0-7), user, command. * means every.",
          el: "λεπτό ώρα μέρα μήνας εβδομάδα χρήστης εντολή.",
        },
      },
      {
        heading: { en: "Start cron, edit crontab", el: "Start cron, επεξεργασία" },
        body: {
          en: "service cron status  (may be inactive). service cron start. crontab -e  opens your user table. Schedule the scanner every night at 23:55:  55 23 * * * /root/scanner",
          el: "service cron start και crontab -e με 55 23 * * * /root/scanner",
        },
        shots: [
          shot("service cron status", ["● cron.service — inactive", "   Active: inactive"]),
          shot("service cron start", ["starting cron (simulated)."]),
          shot("crontab -e", ["# add a line like:", "# 55 23 * * * /root/scanner"]),
        ],
      },
      {
        heading: { en: "rc scripts & runlevels", el: "rc scripts & runlevels" },
        body: {
          en: "At boot, init.d runs rc scripts that build your environment. Runlevels: 0 halt, 1 single-user, 2–5 multiuser, 6 reboot. update-rc.d SERVICE defaults  adds a service to boot (remove|defaults|disable|enable). update-rc.d mysql defaults  — then a reboot would start MySQL. Check with ps aux | grep mysql on a real box.",
          el: "update-rc.d mysql defaults για εκκίνηση στο boot.",
        },
        shots: [shot("update-rc.d mysql defaults", ["update-rc.d: enabling mysql defaults (simulated)"])],
      },
    ],
    cheats: [
      { cmd: "service cron status", desc: { en: "is cron up?", el: "τρέχει το cron;" } },
      { cmd: "service cron start", desc: { en: "start cron", el: "εκκίνηση cron" } },
      { cmd: "crontab -e", desc: { en: "edit user table", el: "επεξεργασία" } },
      { cmd: "55 23 * * * /root/scanner", desc: { en: "23:55 daily", el: "23:55 κάθε μέρα" } },
      { cmd: "update-rc.d mysql defaults", desc: { en: "start at boot", el: "εκκίνηση στο boot" } },
    ],
    tasks: [
      { id: "st", instruction: { en: "service cron status", el: "service cron status" }, hint: { en: "service cron status", el: "service cron status" }, explain: { en: "Is the daemon up?", el: "Τρέχει το daemon;" }, check: (t) => t.flags.has("service-cron-status") || usedCmd(t, /service\s+cron\s+status/) },
      { id: "start", instruction: { en: "service cron start", el: "service cron start" }, hint: { en: "service cron start", el: "service cron start" }, explain: { en: "Bring it up.", el: "Άναψέ το." }, check: (t) => t.flags.has("service-cron-start") || usedCmd(t, /service\s+cron\s+start/) },
      { id: "cte", instruction: { en: "crontab -e", el: "crontab -e" }, hint: { en: "crontab -e", el: "crontab -e" }, explain: { en: "User crontab editor.", el: "Editor του user crontab." }, check: (t) => t.flags.has("crontab-e") || usedCmd(t, /crontab\s+-e/) },
      { id: "line", instruction: { en: 'Add the night scan: echo "55 23 * * * /root/scanner" >> /etc/crontab   (or type it after crontab -e)', el: "55 23 * * * /root/scanner" }, hint: { en: 'echo "55 23 * * * /root/scanner" >> /etc/crontab', el: 'echo "55 23 * * * /root/scanner" >> /etc/crontab' }, explain: { en: "23:55 every day.", el: "23:55 κάθε μέρα." }, check: (t) => t.flags.has("cron-line") || t.flags.has("crontab-e") || usedCmd(t, /55\s+23/) },
      { id: "rc", instruction: { en: "update-rc.d mysql defaults", el: "update-rc.d mysql defaults" }, hint: { en: "update-rc.d mysql defaults", el: "update-rc.d mysql defaults" }, explain: { en: "Enable at boot.", el: "Ενεργοποίηση στο boot." }, check: (t) => t.flags.has("rc-mysql") || usedCmd(t, /update-rc\.d\s+mysql/) },
    ],
    challenges: [
      {
        title: { en: "Read /etc/crontab", el: "Διάβασε /etc/crontab" },
        brief: { en: "cat /etc/crontab — seven fields.", el: "cat /etc/crontab" },
        success: { en: "You saw the system table.", el: "Είδες τον πίνακα συστήματος." },
        check: (t) => t.filesRead.some((p) => p.includes("crontab")) || t.flags.has("crontab-e"),
      },
      {
        title: { en: "Cron is running", el: "Το cron τρέχει" },
        brief: { en: "service cron status after start.", el: "status μετά το start." },
        success: { en: "Active (running).", el: "Active." },
        check: (t) => t.flags.has("service-cron-start"),
      },
    ],
  },
  {
    id: "sr-svc",
    order: 13,
    icon: "globe",
    color: "from-cyan-400 to-rose-900",
    difficulty: 4,
    scenario: lab,
    title: { en: "Linux services — Apache, SSH, FTP", el: "Υπηρεσίες — Apache, SSH, FTP" },
    subtitle: { en: "start/stop/status + a tiny web, ssh, ftp get", el: "start/stop/status + web, ssh, ftp" },
    badge: { en: "Sudo_Run Complete", el: "Sudo_Run Complete" },
    theory: [
      {
        heading: { en: "service NAME ACTION", el: "service NAME ACTION" },
        body: {
          en: "A service is an application running in the background. Syntax: service <name> <start|stop|restart|status>. Walk apache2 through start, status, stop, restart so you see each state.",
          el: "service apache2 start|status|stop|restart",
        },
        shots: [
          shot("service apache2 start", ["starting apache2 (simulated)."]),
          shot("service apache2 status", ["● apache2.service — running", "   Active: active (running)"]),
          shot("service apache2 stop", ["stopping apache2 (simulated)."]),
        ],
      },
      {
        heading: { en: "Apache default page", el: "Σελίδα Apache" },
        body: {
          en: "Over 60% of web servers historically ran Apache — know it as a defender. Default page: /var/www/html/index.html . nano it, then curl http://localhost  (a browser would open the same). Start apache2 first.",
          el: "nano /var/www/html/index.html και curl http://localhost",
        },
        shots: [
          shot("nano /var/www/html/index.html", ["<h1>Apache2 Debian Default Page</h1>", "<p>It works! This is the GameHack Sudo_Run web root …</p>"]),
          shot("curl http://localhost", ["<h1>Apache2 Debian Default Page</h1>"]),
        ],
      },
      {
        heading: { en: "OpenSSH", el: "OpenSSH" },
        body: {
          en: "SSH is encrypted remote shell (telnet was the insecure ancestor). service ssh start  then  ssh ignite@192.168.0.11  — the lab hostname and account are fictional fixtures; no external SSH server is contacted.",
          el: "service ssh start και ssh ignite@192.168.0.11",
        },
        shots: [
          shot("service ssh start", ["starting ssh (simulated)."]),
          shot("ssh ignite@192.168.0.11", ["Welcome to ubuntu (GameHack lab host)", "ignite@ubuntu:~$"]),
        ],
      },
      {
        heading: { en: "FTP", el: "FTP" },
        body: {
          en: "File Transfer Protocol moves files over the command line. ftp ftp.gamehack.lab  (the lab FTP service is a local simulation with fictional files). Name: anonymous  Password: anonymous  then ls, cd into a folder, get favicon.ico, bye, then ls locally to see the download.",
          el: "ftp ftp.gamehack.lab → anonymous / anonymous → get favicon.ico → bye",
        },
        shots: [
          shot("ftp ftp.gamehack.lab", ["Connected to ftp.gamehack.lab.", "Name (ftp.gamehack.lab:root):"]),
          shot("anonymous", ["331 Please specify the password."]),
          shot("anonymous", ["230 Login successful."]),
          shot("get favicon.ico", ["226 Transfer complete."]),
          shot("bye", ["221 Goodbye."]),
        ],
        tip: { en: "Anonymous FTP on the public internet is rare and often out of scope. This is a fake server.", el: "Το anonymous FTP εδώ είναι ψεύτικο." },
      },
    ],
    cheats: [
      { cmd: "service apache2 start", desc: { en: "start www", el: "εκκίνηση www" } },
      { cmd: "curl http://localhost", desc: { en: "fetch default page", el: "default page" } },
      { cmd: "nano /var/www/html/index.html", desc: { en: "edit site", el: "επεξεργασία" } },
      { cmd: "service ssh start", desc: { en: "start sshd", el: "sshd" } },
      { cmd: "ssh ignite@192.168.0.11", desc: { en: "remote shell (sim)", el: "απομακρυσμένο shell" } },
      { cmd: "ftp ftp.gamehack.lab", desc: { en: "open ftp (sim)", el: "ftp" } },
      { cmd: "get favicon.ico", desc: { en: "download", el: "λήψη" } },
    ],
    tasks: [
      { id: "a1", instruction: { en: "service apache2 start", el: "service apache2 start" }, hint: { en: "service apache2 start", el: "service apache2 start" }, explain: { en: "Bring the web server up.", el: "Άναψε τον web server." }, check: (t) => t.flags.has("service-apache2-start") },
      { id: "a2", instruction: { en: "service apache2 status", el: "service apache2 status" }, hint: { en: "service apache2 status", el: "service apache2 status" }, explain: { en: "Confirm running.", el: "Επιβεβαίωση." }, check: (t) => t.flags.has("service-apache2-status") },
      { id: "a3", instruction: { en: "service apache2 stop   then   service apache2 restart", el: "stop και restart" }, hint: { en: "service apache2 stop", el: "service apache2 stop" }, explain: { en: "Stop and restart after config changes.", el: "Stop/restart μετά από αλλαγές." }, check: (t) => t.flags.has("service-apache2-stop") || t.flags.has("service-apache2-restart") || usedCmd(t, /apache2\s+restart/) },
      { id: "idx", instruction: { en: "nano /var/www/html/index.html", el: "nano /var/www/html/index.html" }, hint: { en: "nano /var/www/html/index.html", el: "nano /var/www/html/index.html" }, explain: { en: "Default document root.", el: "Document root." }, check: (t) => t.flags.has("nano-index") || usedCmd(t, /index\.html/) },
      { id: "curl", instruction: { en: "curl http://localhost", el: "curl http://localhost" }, hint: { en: "curl http://localhost", el: "curl http://localhost" }, explain: { en: "Same as browsing http://localhost", el: "Σαν browser." }, check: (t) => t.flags.has("curl-local") || usedCmd(t, /localhost/) },
      { id: "sshst", instruction: { en: "service ssh start", el: "service ssh start" }, hint: { en: "service ssh start", el: "service ssh start" }, explain: { en: "sshd must listen first.", el: "Πρώτα το sshd." }, check: (t) => t.flags.has("service-ssh-start") || usedCmd(t, /service\s+ssh\s+start/) },
      { id: "sshi", instruction: { en: "ssh ignite@192.168.0.11", el: "ssh ignite@192.168.0.11" }, hint: { en: "ssh ignite@192.168.0.11", el: "ssh ignite@192.168.0.11" }, explain: { en: "Simulated ubuntu host.", el: "Προσομοιωμένο ubuntu." }, check: (t) => t.flags.has("ssh-ignite") },
      { id: "ftp", instruction: { en: "ftp ftp.gamehack.lab  then login anonymous / anonymous", el: "ftp ftp.gamehack.lab" }, hint: { en: "ftp ftp.gamehack.lab", el: "ftp ftp.gamehack.lab" }, explain: { en: "Then type anonymous twice.", el: "Μετά anonymous δύο φορές." }, check: (t) => t.flags.has("ftp") || t.flags.has("ftp-user") },
      { id: "get", instruction: { en: "In FTP: ls  then  get favicon.ico  then  bye", el: "ls, get favicon.ico, bye" }, hint: { en: "get favicon.ico", el: "get favicon.ico" }, explain: { en: "Download and quit.", el: "Λήψη και έξοδος." }, check: (t) => t.flags.has("ftp-get") || t.flags.has("ftp-bye") },
    ],
    challenges: [
      {
        title: { en: "Local souvenir", el: "Σουβενίρ" },
        brief: { en: "After bye, ls /root and look for favicon.ico", el: "ls /root για favicon.ico" },
        success: { en: "FTP get dropped a file in your home.", el: "Το get άφησε αρχείο στο home." },
        check: (t) => t.flags.has("ftp-get") || usedCmd(t, /favicon/),
      },
      {
        title: { en: "Submit the final flag", el: "Υποβολή τελικής σημαίας" },
        brief: { en: "submit FLAG{sudo_run_complete} when you have walked Apache, SSH and FTP.", el: "submit FLAG{sudo_run_complete}" },
        success: { en: "Sudo_Run (Linux for Beginners) is complete. You are dangerous — stay ethical.", el: "Το Sudo_Run ολοκληρώθηκε. Μείνε ηθικός." },
        check: (t) => t.flags.has("submit:FLAG{sudo_run_complete}") || (t.flags.has("ssh-ignite") && t.flags.has("curl-local")),
      },
    ],
  },
];
