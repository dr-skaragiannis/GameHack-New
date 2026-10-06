export type LinuxCommandInfo = {
  name: string;
  category: string;
  summary: string;
  synopsis: string;
  example: string;
};

// A shared reference for every lab. Familiar system commands come first; specialist security
// and forensics tools follow as additional simulated lab commands.
export const COMMON_LINUX_COMMANDS: LinuxCommandInfo[] = [
  { name: "apt", category: "Packages", summary: "Search, install, update, and remove packages.", synopsis: "apt [OPTIONS] COMMAND [PACKAGE...]", example: "apt install nmap" },
  { name: "apt-cache", category: "Packages", summary: "Query the package cache.", synopsis: "apt-cache search|show PACKAGE", example: "apt-cache search hydra" },
  { name: "apt-get", category: "Packages", summary: "Manage packages with the lower-level APT interface.", synopsis: "apt-get [OPTIONS] update|install|remove PACKAGE...", example: "apt-get install curl" },
  { name: "at", category: "Processes & services", summary: "Record a one-time simulated job; it is never executed on the host.", synopsis: "at TIME COMMAND...", example: "at 21:30 /root/scanning_script.sh" },
  { name: "awk", category: "Text", summary: "Select and format fields from text records.", synopsis: "awk 'PROGRAM' [FILE...]", example: "awk '{print $1}' /etc/passwd" },
  { name: "basename", category: "Files", summary: "Print a path without its directory components.", synopsis: "basename PATH [SUFFIX]", example: "basename /var/log/syslog" },
  { name: "bash", category: "Shell", summary: "Run a shell script in the virtual lab.", synopsis: "bash SCRIPT [ARGUMENT...]", example: "bash -c 'echo training'" },
  { name: "cat", category: "Files & text", summary: "Display or concatenate file contents.", synopsis: "cat [FILE...]", example: "cat /etc/hosts" },
  { name: "cd", category: "Files", summary: "Change the current working directory.", synopsis: "cd [DIRECTORY]", example: "cd /var/log" },
  { name: "chgrp", category: "Permissions", summary: "Change a virtual file's group ownership.", synopsis: "chgrp GROUP FILE...", example: "chgrp operators notes.txt" },
  { name: "chmod", category: "Permissions", summary: "Change file permission bits.", synopsis: "chmod MODE FILE...", example: "chmod 640 notes.txt" },
  { name: "chown", category: "Permissions", summary: "Change a virtual file's owner and group.", synopsis: "chown [OWNER][:GROUP] FILE...", example: "sudo chown root:root /etc/hosts" },
  { name: "clear", category: "Shell", summary: "Clear the terminal display.", synopsis: "clear", example: "clear" },
  { name: "cp", category: "Files", summary: "Copy files or directories in the virtual filesystem.", synopsis: "cp [-r] SOURCE DESTINATION", example: "cp notes.txt /tmp/notes.txt" },
  { name: "crontab", category: "Processes & services", summary: "View or edit the simulated recurring-task table; scheduled commands never run on the host.", synopsis: "crontab -l | -e | -", example: "crontab -l" },
  { name: "curl", category: "Network", summary: "Make a simulated HTTP request to a lab fixture.", synopsis: "curl [OPTIONS] URL", example: "curl http://web.lab/" },
  { name: "cut", category: "Text", summary: "Select fields or character ranges from each line.", synopsis: "cut -d DELIMITER -f LIST [FILE]", example: "cut -d: -f1 /etc/passwd" },
  { name: "date", category: "System", summary: "Print the simulated system date and time.", synopsis: "date [FORMAT]", example: "date" },
  { name: "dhclient", category: "Network", summary: "Request a simulated DHCP lease for a lab interface.", synopsis: "dhclient [INTERFACE]", example: "dhclient eth0" },
  { name: "dd", category: "Files", summary: "Copy data between virtual files; host devices are blocked.", synopsis: "dd if=INPUT of=OUTPUT [bs=SIZE]", example: "dd if=/etc/hosts of=/tmp/hosts.copy" },
  { name: "df", category: "Storage", summary: "Show simulated filesystem capacity and usage.", synopsis: "df [-h] [PATH]", example: "df -h" },
  { name: "diff", category: "Files & text", summary: "Compare two virtual text files line by line.", synopsis: "diff [OPTIONS] FILE1 FILE2", example: "diff /etc/passwd /etc/hosts" },
  { name: "dig", category: "Network", summary: "Query simulated DNS records for lab hosts.", synopsis: "dig [@SERVER] NAME [TYPE]", example: "dig web.lab A" },
  { name: "dirname", category: "Files", summary: "Print the directory component of a path.", synopsis: "dirname PATH", example: "dirname /var/log/syslog" },
  { name: "dmesg", category: "System", summary: "Read the simulated kernel message buffer.", synopsis: "dmesg [OPTIONS]", example: "dmesg | tail" },
  { name: "du", category: "Storage", summary: "Estimate virtual file and directory sizes.", synopsis: "du [-sh] [PATH...]", example: "du -sh /var/log" },
  { name: "echo", category: "Shell & text", summary: "Print text and expand current shell or environment variables.", synopsis: "echo [OPTIONS] [TEXT...]", example: "echo $HOME" },
  { name: "exit", category: "Shell", summary: "Close a simulated remote shell and restore the local lab prompt.", synopsis: "exit", example: "exit" },
  { name: "env", category: "Shell", summary: "Print exported variables in the current simulated environment.", synopsis: "env [NAME=VALUE ...] [COMMAND]", example: "env" },
  { name: "export", category: "Shell", summary: "Pass a shell variable to child commands in the current session.", synopsis: "export NAME | export NAME=VALUE", example: "export HISTSIZE" },
  { name: "file", category: "Files & forensics", summary: "Identify a virtual file from its name and contents.", synopsis: "file FILE...", example: "file /var/log/syslog" },
  { name: "fg", category: "Processes & services", summary: "Bring a simulated shell job back to the foreground.", synopsis: "fg [JOB]", example: "fg" },
  { name: "find", category: "Files", summary: "Search the virtual filesystem by path and name.", synopsis: "find PATH [OPTIONS]", example: "find /home -name '*.txt'" },
  { name: "free", category: "System", summary: "Show simulated memory usage.", synopsis: "free [-h]", example: "free -h" },
  { name: "ftp", category: "Network", summary: "Use the fixture-only FTP session; public hosts and live network access are blocked.", synopsis: "ftp ftp.forge.lab", example: "ftp ftp.forge.lab" },
  { name: "grep", category: "Text", summary: "Search text using a regular expression.", synopsis: "grep [OPTIONS] PATTERN [FILE...]", example: "grep -n root /etc/passwd" },
  { name: "groups", category: "Users", summary: "Print the current simulated user's groups.", synopsis: "groups [USER]", example: "groups" },
  { name: "gzip", category: "Archives", summary: "Create or inspect a simulated gzip archive.", synopsis: "gzip [-dk] FILE...", example: "gzip notes.txt" },
  { name: "head", category: "Text", summary: "Print the first lines of a file or pipeline; a negative count omits trailing lines.", synopsis: "head [-n LINES|-n -LINES] [FILE...]", example: "head -n -1 /root/linux-beginners-3/head-fixture.txt" },
  { name: "help", category: "Shell & help", summary: "Show the shared Linux command reference or help for one command.", synopsis: "help [COMMAND]", example: "help ip" },
  { name: "history", category: "Shell", summary: "Show commands entered in this lab session.", synopsis: "history", example: "history" },
  { name: "hostname", category: "System", summary: "Print or set the simulated hostname.", synopsis: "hostname [NAME]", example: "hostname" },
  { name: "id", category: "Users", summary: "Show the current simulated user and group IDs.", synopsis: "id [USER]", example: "id" },
  { name: "ifconfig", category: "Network", summary: "Show or configure a simulated network interface.", synopsis: "ifconfig [INTERFACE [ADDRESS]]", example: "ifconfig eth0" },
  { name: "ip", category: "Network", summary: "Inspect simulated addresses, links, routes, and neighbors.", synopsis: "ip [OPTIONS] OBJECT [COMMAND]", example: "ip a" },
  { name: "iwconfig", category: "Network", summary: "Inspect fictional wireless-interface settings.", synopsis: "iwconfig [INTERFACE]", example: "iwconfig wlan0" },
  { name: "jobs", category: "Processes & services", summary: "List simulated background jobs.", synopsis: "jobs [-l]", example: "jobs" },
  { name: "journalctl", category: "Processes & services", summary: "Read simulated system journal entries.", synopsis: "journalctl [OPTIONS]", example: "journalctl -n 20" },
  { name: "kill", category: "Processes & services", summary: "Send a signal to a simulated process ID.", synopsis: "kill [-SIGNAL] PID", example: "kill -TERM 7440" },
  { name: "less", category: "Files & text", summary: "Page through a virtual text file.", synopsis: "less [FILE...]", example: "less /var/log/auth.log" },
  { name: "ln", category: "Files", summary: "Create a virtual hard link or symbolic link.", synopsis: "ln [-s] TARGET LINK_NAME", example: "ln -s notes.txt notes-link" },
  { name: "locate", category: "Files", summary: "Search the simulated file index by name.", synopsis: "locate PATTERN", example: "locate credentials.txt" },
  { name: "ls", category: "Files", summary: "List virtual directory contents.", synopsis: "ls [OPTIONS] [PATH...]", example: "ls -la /home/operator" },
  { name: "lsof", category: "Processes & files", summary: "Show simulated open files and lab sessions.", synopsis: "lsof [OPTIONS]", example: "lsof -i" },
  { name: "man", category: "Shell & help", summary: "Read a manual page for a command.", synopsis: "man [-k] COMMAND", example: "man apt-get" },
  { name: "mkdir", category: "Files", summary: "Create a directory in the virtual filesystem.", synopsis: "mkdir [-p] DIRECTORY...", example: "mkdir -p /tmp/work" },
  { name: "more", category: "Files & text", summary: "Display a virtual text file one page at a time.", synopsis: "more [FILE...]", example: "more /etc/hosts" },
  { name: "mount", category: "Storage", summary: "Show the simulated mounts; host devices are never mounted.", synopsis: "mount [DEVICE DIRECTORY]", example: "mount" },
  { name: "mv", category: "Files", summary: "Move or rename entries in the virtual filesystem.", synopsis: "mv SOURCE DESTINATION", example: "mv /home/operator/welcome.txt /tmp/welcome.txt" },
  { name: "nano", category: "Files & text", summary: "Preview or create a text file in the simulated editor; changes stay in the VFS.", synopsis: "nano FILE", example: "nano /etc/hosts" },
  { name: "nc", category: "Network", summary: "Inspect a simulated network connection; no live listener is opened.", synopsis: "nc [OPTIONS] HOST PORT", example: "nc -vz web.lab 80" },
  { name: "netstat", category: "Network", summary: "Show simulated network sockets and routes.", synopsis: "netstat [OPTIONS]", example: "netstat -tuln" },
  { name: "nice", category: "Processes & services", summary: "Show a simulated command launch with adjusted priority.", synopsis: "nice [-n ADJUSTMENT] COMMAND", example: "nice -n 5 sleep 10" },
  { name: "nl", category: "Text", summary: "Number lines from a virtual text file or pipeline.", synopsis: "nl [FILE...]", example: "nl /etc/hosts" },
  { name: "nmap", category: "Network & security", summary: "Scan fictional lab hosts and services only.", synopsis: "nmap [OPTIONS] TARGET", example: "nmap -sV 10.10.10.8" },
  { name: "nslookup", category: "Network", summary: "Look up a simulated lab hostname.", synopsis: "nslookup NAME [SERVER]", example: "nslookup web.lab" },
  { name: "passwd", category: "Users", summary: "Show a safe simulated password-change response.", synopsis: "passwd [USER]", example: "passwd" },
  { name: "paste", category: "Text", summary: "Merge lines from virtual text files.", synopsis: "paste [OPTIONS] FILE...", example: "paste /etc/passwd /etc/hosts" },
  { name: "ping", category: "Network", summary: "Send simulated ICMP probes to a lab host.", synopsis: "ping [-c COUNT] HOST", example: "ping -c 4 web.lab" },
  { name: "pkill", category: "Processes & services", summary: "Signal simulated processes matching a name.", synopsis: "pkill [-SIGNAL] PATTERN", example: "pkill msfconsole" },
  { name: "printenv", category: "Shell", summary: "Print environment variables or one selected value.", synopsis: "printenv [NAME]", example: "printenv PATH" },
  { name: "printf", category: "Shell & text", summary: "Format and print text without a trailing newline by default.", synopsis: "printf FORMAT [ARGUMENT...]", example: "printf 'user=%s\\n' operator" },
  { name: "ps", category: "Processes & services", summary: "List simulated processes.", synopsis: "ps [OPTIONS]", example: "ps aux" },
  { name: "pwd", category: "Files", summary: "Print the current virtual working directory.", synopsis: "pwd", example: "pwd" },
  { name: "read", category: "Shell", summary: "Store simulated terminal input in a shell variable.", synopsis: "read VARIABLE", example: "read name" },
  { name: "reboot", category: "Processes & services", summary: "Apply virtual boot-service settings without rebooting the host.", synopsis: "reboot", example: "reboot" },
  { name: "python3", category: "Programming", summary: "Show the training Python interpreter information.", synopsis: "python3 [SCRIPT]", example: "python3 --version" },
  { name: "readlink", category: "Files", summary: "Print a virtual symbolic link's target.", synopsis: "readlink FILE", example: "readlink -f /etc/hosts" },
  { name: "renice", category: "Processes & services", summary: "Set niceness on an existing simulated process.", synopsis: "renice VALUE PID", example: "renice 10 7440" },
  { name: "rm", category: "Files", summary: "Remove entries from the virtual filesystem.", synopsis: "rm [-r] FILE...", example: "rm /tmp/.keep" },
  { name: "rmdir", category: "Files", summary: "Remove an empty virtual directory.", synopsis: "rmdir DIRECTORY...", example: "rmdir /tmp/empty" },
  { name: "route", category: "Network", summary: "Show the simulated IP routing table.", synopsis: "route [-n]", example: "route -n" },
  { name: "scp", category: "Network", summary: "Copy a file between simulated lab hosts.", synopsis: "scp [OPTIONS] SOURCE DESTINATION", example: "scp notes.txt operator@jump:/tmp/" },
  { name: "sed", category: "Text", summary: "Transform or select lines from virtual text.", synopsis: "sed [OPTIONS] 'EXPRESSION' [FILE]", example: "sed -n '1,5p' /etc/hosts" },
  { name: "seq", category: "Shell & text", summary: "Print a numeric sequence.", synopsis: "seq [FIRST [INCREMENT]] LAST", example: "seq 1 5" },
  { name: "service", category: "Processes & services", summary: "Inspect or change a simulated service state.", synopsis: "service NAME status|start|stop|restart", example: "service ssh status" },
  { name: "telnet", category: "Network", summary: "Show why plaintext telnet connections are blocked in the lab.", synopsis: "telnet HOST PORT", example: "telnet ignite@192.168.0.11 23" },
  { name: "update-rc.d", category: "Processes & services", summary: "Manage simulated SysV service links for boot runlevels.", synopsis: "update-rc.d SERVICE defaults|enable|disable|remove", example: "update-rc.d mysql defaults" },
  { name: "set", category: "Shell", summary: "List shell variables and function definitions in the virtual shell.", synopsis: "set [OPTIONS]", example: "set | grep HISTSIZE" },
  { name: "unset", category: "Shell", summary: "Remove a variable from the current virtual shell.", synopsis: "unset NAME", example: "unset LAB_MODE" },
  { name: "sha256sum", category: "Files & forensics", summary: "Show the lab fixture's SHA-256 digest or training marker.", synopsis: "sha256sum FILE...", example: "sha256sum notes.txt" },
  { name: "sleep", category: "Shell & processes", summary: "Show a non-blocking simulated delay.", synopsis: "sleep NUMBER[SUFFIX]", example: "sleep 2" },
  { name: "sort", category: "Text", summary: "Sort lines from a virtual file or pipeline.", synopsis: "sort [OPTIONS] [FILE...]", example: "sort /etc/passwd" },
  { name: "systemctl", category: "Processes & services", summary: "Inspect or change a simulated system service.", synopsis: "systemctl status|start|stop|restart UNIT", example: "systemctl status ssh.service" },
  { name: "ssh", category: "Network", summary: "Connect to a fictional lab host using simulated credentials.", synopsis: "ssh [OPTIONS] USER@HOST", example: "ssh labuser@10.10.10.12" },
  { name: "stat", category: "Files", summary: "Show metadata for a virtual file or directory.", synopsis: "stat FILE...", example: "stat /etc/hosts" },
  { name: "strings", category: "Files & forensics", summary: "Extract printable text from a virtual evidence file.", synopsis: "strings [OPTIONS] FILE...", example: "strings /var/log/syslog" },
  { name: "sudo", category: "Users & permissions", summary: "Run a simulated permitted command with elevated privileges.", synopsis: "sudo [OPTIONS] COMMAND", example: "sudo -l" },
  { name: "tail", category: "Files & text", summary: "Print the last lines of a file or pipeline.", synopsis: "tail [-n LINES] [FILE...]", example: "tail -n 10 /var/log/auth.log" },
  { name: "tar", category: "Archives", summary: "List or create a text-only virtual archive fixture.", synopsis: "tar [OPTIONS] ARCHIVE [FILE...]", example: "tar -czf logs.tar.gz /var/log" },
  { name: "tee", category: "Text", summary: "Copy pipeline text to the terminal and a virtual file.", synopsis: "tee [-a] FILE...", example: "echo ready | tee /tmp/status.txt" },
  { name: "time", category: "Shell & processes", summary: "Report a simulated command duration without running host processes.", synopsis: "time COMMAND [ARGUMENT...]", example: "time ls /tmp" },
  { name: "top", category: "Processes & services", summary: "Show simulated process and resource activity.", synopsis: "top [OPTIONS]", example: "top" },
  { name: "touch", category: "Files", summary: "Create an empty virtual file or update its timestamp marker.", synopsis: "touch FILE...", example: "touch /tmp/notes.txt" },
  { name: "tr", category: "Text", summary: "Translate or delete characters in pipeline text.", synopsis: "tr [OPTIONS] SET1 [SET2]", example: "echo hello | tr a-z A-Z" },
  { name: "uname", category: "System", summary: "Print simulated operating-system information.", synopsis: "uname [-a]", example: "uname -a" },
  { name: "uniq", category: "Text", summary: "Collapse adjacent duplicate lines.", synopsis: "uniq [OPTIONS] [INPUT [OUTPUT]]", example: "sort /etc/hosts | uniq" },
  { name: "uptime", category: "System", summary: "Show simulated uptime and load averages.", synopsis: "uptime", example: "uptime" },
  { name: "wc", category: "Text", summary: "Count lines, words, and bytes in virtual text.", synopsis: "wc [-lwmc] [FILE...]", example: "wc -l /etc/passwd" },
  { name: "wget", category: "Network", summary: "Fetch a lab fixture without making a live network request.", synopsis: "wget [OPTIONS] URL", example: "wget http://web.lab/" },
  { name: "which", category: "Shell", summary: "Show the simulated PATH location for a command.", synopsis: "which COMMAND...", example: "which nmap" },
  { name: "whoami", category: "Users", summary: "Print the current simulated username.", synopsis: "whoami", example: "whoami" },
  { name: "who", category: "Users", summary: "List the simulated terminal sessions.", synopsis: "who [OPTIONS]", example: "who" },
  { name: "xargs", category: "Text & shell", summary: "Show how pipeline words would be passed as command arguments.", synopsis: "xargs [OPTIONS] [COMMAND]", example: "printf 'a\\nb\\n' | xargs -n1 echo" },
];

export const LAB_COMMANDS: LinuxCommandInfo[] = [
  { name: "apt install", category: "Package labs", summary: "Install a package into the current virtual lab.", synopsis: "apt install PACKAGE...", example: "apt install hydra" },
  { name: "audio-analyze", category: "Forensics labs", summary: "Inspect a fictional audio-evidence fixture.", synopsis: "audio-analyze FILE", example: "audio-analyze /cases/IR-2404/evidence/03-documents/super_secret_audio.wav" },
  { name: "docker", category: "Forensics labs", summary: "Inspect the simulated container fixture; host containers are not visible.", synopsis: "docker inspect|diff CONTAINER", example: "docker inspect web-lab" },
  { name: "evtx", category: "Forensics labs", summary: "Query a simulated Windows event-log fixture.", synopsis: "evtx [OPTIONS] FILE", example: "evtx /cases/IR-2404/evidence/02-windows/Security.evtx" },
  { name: "exiftool", category: "Forensics labs", summary: "Read fictional image and document metadata.", synopsis: "exiftool FILE...", example: "exiftool /cases/IR-2404/evidence/03-documents/starry_night.png" },
  { name: "ewfacquire", category: "Forensics labs", summary: "Show the safe disk-image acquisition fixture.", synopsis: "ewfacquire [OPTIONS] SOURCE", example: "ewfacquire /cases/IR-2404/evidence/06-disk/usb.dd" },
  { name: "fls", category: "Forensics labs", summary: "List entries in the fictional disk-image fixture.", synopsis: "fls [OPTIONS] IMAGE", example: "fls /cases/IR-2404/evidence/06-disk/usb.dd" },
  { name: "ftkimager", category: "Forensics labs", summary: "Show the safe FTK Imager acquisition fixture.", synopsis: "ftkimager [OPTIONS] SOURCE DESTINATION", example: "ftkimager /cases/IR-2404/evidence/06-disk/usb.dd /cases/IR-2404/working-copy/usb-copy.ad1" },
  { name: "get-winevent", category: "Forensics labs", summary: "Query fictional Windows event records.", synopsis: "get-winevent [OPTIONS] FILE", example: "get-winevent /cases/IR-2404/evidence/02-windows/Security.evtx" },
  { name: "hashcat", category: "Security labs", summary: "Open the safe password-auditing training stub.", synopsis: "hashcat [OPTIONS] HASHFILE WORDLIST", example: "hashcat hashes.txt wordlist.txt" },
  { name: "hashdeep", category: "Forensics labs", summary: "Show a fixture-only recursive file-hash report.", synopsis: "hashdeep [OPTIONS] FILE...", example: "hashdeep /cases/IR-2404/evidence/10-passwords/hashes.txt" },
  { name: "hash-identifier", category: "Forensics labs", summary: "Classify a sample hash string in the training fixture.", synopsis: "hash-identifier HASH", example: "hash-identifier 5d41402abc4b2a76b9719d911017c592" },
  { name: "hexdump", category: "Forensics labs", summary: "Display a text fixture as simulated hexadecimal output.", synopsis: "hexdump [OPTIONS] FILE", example: "hexdump -C /cases/IR-2404/evidence/01-intake/challenge-corrupt.png" },
  { name: "hexedit", category: "Forensics labs", summary: "Inspect a virtual working copy; source evidence remains read-only.", synopsis: "hexedit FILE", example: "hexedit /cases/IR-2404/working-copy/challenge-corrupt.png" },
  { name: "hydra", category: "Security labs", summary: "Run the fictional credential-audit exercise against lab hosts.", synopsis: "hydra [OPTIONS] USER TARGET SERVICE", example: "hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12" },
  { name: "icat", category: "Forensics labs", summary: "Read a file from the simulated disk-image fixture.", synopsis: "icat IMAGE INODE", example: "icat /cases/IR-2404/evidence/06-disk/usb.dd 42" },
  { name: "john", category: "Security labs", summary: "Open the safe password-auditing training stub.", synopsis: "john [OPTIONS] HASHFILE", example: "john --wordlist=wordlist.txt hashes.txt" },
  { name: "LECmd", category: "Forensics labs", summary: "Parse a fictional Windows shortcut fixture.", synopsis: "LECmd [OPTIONS] FILE", example: "LECmd /cases/IR-2404/evidence/02-windows/passwd.lnk" },
  { name: "md5sum", category: "Forensics labs", summary: "Show the lab fixture's MD5 digest or training marker.", synopsis: "md5sum FILE...", example: "md5sum /cases/IR-2404/evidence/01-intake/hash_sample.txt" },
  { name: "medusa", category: "Security labs", summary: "Use the fictional credential-audit fixture.", synopsis: "medusa [OPTIONS]", example: "medusa -h 10.10.10.12 -u labuser -P /home/operator/tools/wordlist.txt" },
  { name: "memory-acquire", category: "Forensics labs", summary: "Show the safe memory-acquisition fixture.", synopsis: "memory-acquire [OPTIONS]", example: "memory-acquire --help" },
  { name: "mftecmd", category: "Forensics labs", summary: "Parse a fictional NTFS metadata fixture.", synopsis: "mftecmd [OPTIONS] FILE", example: "mftecmd /cases/IR-2404/evidence/06-disk/$MFT.csv" },
  { name: "mmls", category: "Forensics labs", summary: "List fictional disk-image partition metadata.", synopsis: "mmls IMAGE", example: "mmls /cases/IR-2404/evidence/06-disk/usb.dd" },
  { name: "ncrack", category: "Security labs", summary: "Use the fictional credential-audit fixture.", synopsis: "ncrack [OPTIONS] TARGET", example: "ncrack -P /home/operator/tools/wordlist.txt ssh://10.10.10.12" },
  { name: "oleid", category: "Forensics labs", summary: "Check a fictional Office document for suspicious indicators.", synopsis: "oleid FILE", example: "oleid /cases/IR-2404/evidence/03-documents/QuarterlyForecast.docm" },
  { name: "oleobj", category: "Forensics labs", summary: "List embedded-object metadata in an Office fixture.", synopsis: "oleobj [OPTIONS] FILE", example: "oleobj /cases/IR-2404/evidence/03-documents/QuarterlyForecast.docm" },
  { name: "olevba", category: "Forensics labs", summary: "Inspect fictional Office macro text.", synopsis: "olevba [OPTIONS] FILE", example: "olevba /cases/IR-2404/evidence/03-documents/QuarterlyForecast.docm" },
  { name: "reg", category: "Forensics labs", summary: "Query a simulated Windows registry export.", synopsis: "reg query HIVE_FILE", example: "reg query /cases/IR-2404/evidence/02-windows/NTUSER.DAT" },
  { name: "sandbox-report", category: "Forensics labs", summary: "Read a fictional malware-sandbox report.", synopsis: "sandbox-report FILE", example: "sandbox-report /cases/IR-2404/evidence/07-malware/sample.bin" },
  { name: "sha1sum", category: "Forensics labs", summary: "Show the lab fixture's SHA-1 digest or training marker.", synopsis: "sha1sum FILE...", example: "sha1sum /cases/IR-2404/evidence/01-intake/hash_sample.txt" },
  { name: "sqlite3", category: "Forensics labs", summary: "Inspect a fictional SQLite evidence export.", synopsis: "sqlite3 DATABASE [QUERY]", example: "sqlite3 /cases/IR-2404/evidence/02-windows/Firefox/places.sqlite" },
  { name: "sqlitebrowser", category: "Forensics labs", summary: "Open the SQLite training-data fixture.", synopsis: "sqlitebrowser DATABASE", example: "sqlitebrowser /cases/IR-2404/evidence/02-windows/Firefox/places.sqlite" },
  { name: "sqlmap", category: "Security labs", summary: "Test the intentionally vulnerable fictional web fixture.", synopsis: "sqlmap [OPTIONS] URL", example: "sqlmap -u 'http://web.lab/login.php?id=1'" },
  { name: "static-report", category: "Forensics labs", summary: "Read a fictional static-analysis report.", synopsis: "static-report FILE", example: "static-report /cases/IR-2404/evidence/07-malware/sample.bin" },
  { name: "steghide", category: "Forensics labs", summary: "Inspect the fictional steganography fixture.", synopsis: "steghide info|extract FILE", example: "steghide info /cases/IR-2404/evidence/03-documents/starry_night.png" },
  { name: "submit", category: "HackForge lab", summary: "Submit a captured training flag for the current challenge.", synopsis: "submit FLAG{...}", example: "submit FLAG{training_example}" },
  { name: "su", category: "Shell & permissions", summary: "Request a simulated user switch; use sudo for permitted lab escalation.", synopsis: "su [USER]", example: "sudo su" },
  { name: "python", category: "Programming", summary: "Alias for the safe Python training interpreter information.", synopsis: "python [SCRIPT]", example: "python --version" },
  { name: "netcat", category: "Network", summary: "Alias for the safe simulated nc command.", synopsis: "netcat [OPTIONS] HOST PORT", example: "netcat -vz web.lab 80" },
  { name: "whereis", category: "Shell", summary: "Locate a simulated command binary, source, or manual path.", synopsis: "whereis COMMAND...", example: "whereis nmap" },
  { name: "tcpdump", category: "Forensics labs", summary: "Read a simulated packet-capture fixture; no live capture is opened.", synopsis: "tcpdump [OPTIONS] -r FILE", example: "tcpdump -r /cases/IR-2404/evidence/05-network/capture.pcapng" },
  { name: "timeline", category: "Forensics labs", summary: "Correlate timestamps from fictional case artifacts.", synopsis: "timeline [CASE]", example: "timeline IR-2404" },
  { name: "tshark", category: "Forensics labs", summary: "Inspect simulated packet-capture metadata.", synopsis: "tshark [OPTIONS] -r FILE", example: "tshark -r /cases/IR-2404/evidence/05-network/capture.pcapng" },
  { name: "volatility", category: "Forensics labs", summary: "Show safe memory-analysis plugin help for the fixture.", synopsis: "volatility [OPTIONS]", example: "volatility --help" },
  { name: "wevtutil", category: "Forensics labs", summary: "Query a simulated Windows event-log export.", synopsis: "wevtutil qe FILE", example: "wevtutil qe /cases/IR-2404/evidence/02-windows/Security.evtx" },
  { name: "wireshark", category: "Forensics labs", summary: "Inspect the packet-analysis fixture without opening a live capture.", synopsis: "wireshark FILE", example: "wireshark /cases/IR-2404/evidence/05-network/capture.pcapng" },
  { name: "xxd", category: "Forensics labs", summary: "Display a virtual file as simulated hexadecimal output.", synopsis: "xxd [OPTIONS] FILE", example: "xxd /cases/IR-2404/evidence/01-intake/challenge-corrupt.png" },
  { name: "zsteg", category: "Forensics labs", summary: "Inspect a fictional image-steganography fixture.", synopsis: "zsteg [OPTIONS] IMAGE", example: "zsteg /cases/IR-2404/evidence/03-documents/starry_night.png" },
];

export const ALL_LINUX_COMMANDS = [...COMMON_LINUX_COMMANDS, ...LAB_COMMANDS];

export function findLinuxCommand(name: string): LinuxCommandInfo | undefined {
  const normalized = name.toLowerCase();
  return ALL_LINUX_COMMANDS.find((command) => command.name.toLowerCase() === normalized);
}

export function linuxHelpText(): string {
  const grouped = new Map<string, LinuxCommandInfo[]>();
  for (const command of COMMON_LINUX_COMMANDS) {
    const current = grouped.get(command.category) || [];
    current.push(command);
    grouped.set(command.category, current);
  }

  const sections = [...grouped.entries()].map(([category, commands]) => {
    const rows = commands.map(({ name, summary }) => `  ${name.padEnd(13)} ${summary}`);
    return `${category.toUpperCase()}\n${rows.join("\n")}`;
  });

  const labTools = LAB_COMMANDS.map(({ name, summary }) => `  ${name.padEnd(13)} ${summary}`).join("\n");
  return [
    `HACKFORGE LINUX COMMAND REFERENCE — ${COMMON_LINUX_COMMANDS.length} COMMON COMMANDS`,
    "Type `man COMMAND` for a manual, `help COMMAND` for quick help, or press Tab to complete.",
    ...sections,
    "SPECIALIST LAB TOOLS",
    labTools,
    "\nAll commands run in a fictional, isolated training filesystem. Network, package, and process results are fixtures; no host shell, real network, or host files are accessed.",
  ].join("\n\n");
}

export function linuxManPage(name: string): string | null {
  const command = findLinuxCommand(name);
  if (!command) return null;
  const heading = command.name.toUpperCase();
  return `${heading}(1)                         HACKFORGE USER COMMANDS                         ${heading}(1)\n\nNAME\n       ${command.name} - ${command.summary}\n\nSYNOPSIS\n       ${command.synopsis}\n\nDESCRIPTION\n       ${command.summary} This implementation operates on the current lab's virtual filesystem and simulated services. It does not execute on the web server or access the host operating system.\n\nEXAMPLE\n       ${command.example}\n\nSAFETY\n       HackForge training fixture only. Do not use simulated output as evidence about a real system.`;
}
