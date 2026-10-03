import type { FileNode } from "./terminal";

// ---- tiny builders (mirror terminal.ts helpers, kept local so this file is standalone)
const file = (content: string, perms = "rw-r--r--", owner = "operator", group = "operator"): FileNode => ({
  type: "file",
  content,
  perms,
  owner,
  group,
  size: content.length,
});
const dir = (children: Record<string, FileNode>, perms = "rwxr-xr-x", owner = "operator", group = "operator"): FileNode => ({
  type: "dir",
  perms,
  owner,
  group,
  size: 4096,
  children,
});

// ============================================================================
// Sudo_Run campaign filesystem
//
// An original simulated Kali box for the "Linux for Beginners" curriculum.
// Everything here was authored for HackForge's training lab: original text,
// simulated config layouts matching how real Linux systems are arranged.
// ============================================================================

const BASHRC = `# ~/.bashrc - executed by bash for non-login shells (HackForge lab)
HISTSIZE=1000
HISTFILESIZE=2000
alias ll='ls -la'
alias ..='cd ..'
export PATH="/usr/local/bin:/usr/bin:/bin"
`;

const PROFILE = `# ~/.profile - executed by the command interpreter for login shells
if [ -f "$HOME/.bashrc" ]; then . "$HOME/.bashrc"; fi
`;

const BASH_HISTORY = `pwd
ls -la
cat /etc/passwd
ifconfig
`;

const README_DESKTOP = `Welcome to the HackForge training lab.
This desktop is your launchpad for the Sudo_Run campaign.
Work through the modules, keep notes in ~/Documents, and remember:
the terminal is your best friend on a pentest engagement.
`;

const HACKFORGE_TXT = `HackForge is a hands-on security training platform.
We learn Linux because every serious pentest starts from a Linux terminal.
Navigation, search, file handling, text parsing, packages, permissions,
networking and process control are the daily bread of an operator.
Practice every command until your fingers remember it.
`;

const HACKFORGE_IN = `WWW.HACKFORGE.IN is the training portal domain.
Visit WWW.HACKFORGE.IN/dns to learn about DNS records.
Our mail servers live under WWW.HACKFORGE.IN as MX records.
Replace the uppercase WWW with lowercase www everywhere in this file.
`;

const SIMPLE_BASH = `#!/bin/bash
echo off
echo hello HackForge operator
echo "this file demonstrates the echo built-in"
echo one
echo two
echo three
echo done
`;

const FIRST_SCRIPT = `#!/bin/bash
echo "Hello World! My first bash script."
echo "Second line of output."
`;

const GREET_SH = `#!/bin/bash
echo "Please enter your name:"
read name
echo "Hello, $name - welcome to HackForge."
echo "You used the read built-in to capture input."
`;

const SCANNER_SH = `#!/bin/bash
# HackForge network scanner — find every live host on a network.
# nmap -sP performs a ping sweep (host discovery, no port scan).
echo "Enter the network you want to scan (e.g. 10.10.10.0/24):"
read ip
nmap -sP $ip | grep "scan report" | cut -d " " -f 5 | head -n -1
echo "Scan complete."
`;

const ETTER_DNS = [
  "# HackForge Lab - ettercap DNS spoof configuration (simulated)",
  "# syntax:  hostname  A  ip-address",
  "#          hostname  PTR ip-address",
  "#",
  "# This file is long on purpose: it is the Sudo_Run target for",
  "# head / tail / nl / more / less practice. 30+ lines below.",
  "#",
  "training.hackforge.lab      A   10.10.10.13",
  "portal.hackforge.lab        A   10.10.10.13",
  "login.hackforge.lab         A   10.10.10.13",
  "*.hackforge.in              A   10.10.10.6",
  "www.hackforge.in            A   10.10.10.6",
  "mail.hackforge.in           A   10.10.10.6",
  "ns1.hackforge.lab           A   10.10.10.1",
  "ns2.hackforge.lab           A   10.10.10.1",
  "cache.hackforge.lab         A   10.10.10.1",
  "printer.hackforge.lab       A   10.10.10.21",
  "camera-01.hackforge.lab     A   10.10.10.31",
  "camera-02.hackforge.lab     A   10.10.10.32",
  "camera-03.hackforge.lab     A   10.10.10.33",
  "cameras.hackforge.lab       A   10.10.10.30",
  "wiki.hackforge.internal     A   10.10.20.12",
  "git.hackforge.internal      A   10.10.20.13",
  "jenkins.hackforge.internal  A   10.10.20.14",
  "artifactory.hackforge.io    A   10.10.20.15",
  "backup.hackforge.internal   A   10.10.20.16",
  "vpn.hackforge.internal      A   10.10.20.17",
  "siem.hackforge.internal     A   10.10.20.18",
  "dns-spoof-example.test      A   192.168.4.4",
  "evil-twin.demo              A   192.168.4.5",
  "facebook.demo-trap          A   192.168.4.6",
  "gmail.demo-trap             A   192.168.4.7",
  "twitter.demo-trap           A   192.168.4.8",
  "update.vendor-cdn.demo      A   192.168.4.9",
  "telemetry.beacon.demo       A   192.168.4.10",
  "# end of hackforge lab etter.dns",
].join("\n") + "\n";

const SOURCES_LIST = `# HackForge Kali package sources (simulated)
deb http://kali.hackforge.lab/kali kali-rolling main non-free contrib non-free-firmware
# deb-src http://kali.hackforge.lab/kali kali-rolling main non-free contrib
`;

const RESOLV_CONF = `domain hackforge.lab
search hackforge.lab
nameserver 10.10.10.1
`;

const HOSTS_FILE = `127.0.0.1\tlocalhost
127.0.1.1\tkali
10.10.10.1\tgateway.hackforge.lab
10.10.10.6\twww.hackforge.in hackforge.in
10.10.10.9\tfiles.hackforge.lab

# The following lines are mappings the lab keeps for lecture demos.
# An attacker who can edit this file can silently redirect innocent users.
::1\tlocalhost ip6-localhost ip6-loopback
`;

const CRONTAB_FILE = `# /etc/crontab: system-wide crontab (HackForge sim)
# m h dom mon dow user   command
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    /usr/sbin/logrotate /etc/logrotate.conf
47 6    * * 7   root    /usr/lib/apt/apt.systemd.daily
`;

const PASSWD = `root:x:0:0:root:/root:/bin/bash
operator:x:1000:1000:operator:/home/operator:/bin/bash
ignite:x:1001:1001:HackForge trainee:/home/ignite:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:100:102:MySQL Server,,,:/nonexistent:/bin/false
`;

const SHADOW = `root:$6$saltsalt$k1lq5BHB5z2Z9mYPWAq6xdWmL2z3YjGQV7r9XyQp2s8OQ==:19356:0:99999:7:::
operator:$6$hackforge$N0OTR34LP4SSW0RDZULy7V3ryL0ngH4shStr1ngG03sH3r3==:19356:0:99999:7:::
ignite:$6$another$VGhpc0lzU2ltdWxhdGVkSHNoYWRvd0xpbmU=:19356:0:99999:7:::
`;

const WWW_INDEX = `<html>
<head><title>HackForge - It works!</title></head>
<body>
  <h1>HackForge training page works!</h1>
  <p>This file is being served from <code>/var/www/html/index.html</code>
     by the <strong>apache2</strong> service.</p>
  <p>If you can read this, the web server on your Kali box is running.</p>
</body>
</html>
`;

const AUTH_LOG = `Oct  1 08:12:11 kali sshd[4569]: Accepted publickey for operator from 10.10.10.5 port 55100 ssh2
Oct  1 08:12:14 kali sshd[4569]: pam_unix(sshd:session): session opened for user operator
Oct  1 09:40:02 kali CRON[6123]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)
Oct  1 10:05:00 kali sshd[4710]: Failed password for invalid user admin from 10.10.10.9 port 44912 ssh2
Oct  1 10:05:02 kali sshd[4710]: Failed password for invalid user admin from 10.10.10.9 port 44912 ssh2
Oct  1 10:05:04 kali sshd[4710]: Failed password for root from 10.10.10.9 port 44912 ssh2
Oct  1 10:05:05 kali sshd[4710]: ssh0. brute force detected: 3 failures from 10.10.10.9
Oct  1 10:05:06 kali sshd[4710]: Connection closed by 10.10.10.9 port 44912
Oct  1 10:05:07 kali sudo: operator : TTY=pts/0 ; PWD=/home/operator ; USER=root ; COMMAND=/usr/bin/apt-get install git
Oct  1 10:05:30 kali sshd[4801]: reverse mapping checking getaddrinfo for files.hackforge.lab [10.10.10.9] failed
`;

const CTF_NOTE = `HackForge CTF night - writeup notes.
Box 1: web flag hidden in the page source.
Box 2: cron job ran a world-writable script (classic privesc).
Box 3: the answer was in /etc/passwd all along.
`;

const IGNITE_NOTE = `Notes from the HackForge trainee session.
The instructor asked us to practice moving, copying and renaming files in this folder.
Nothing in this tree is real - practice freely, break things, rebuild them.
`;

const SCREENSHOTS_NOTE = `Screenshots of previous lab sessions live here.
In the simulator you do not need screenshots - the live terminal IS the demo.
`;

export function buildSudoRunFS(): FileNode {
  const root: FileNode = {
    type: "dir",
    perms: "rwxr-xr-x",
    owner: "root",
    group: "root",
    size: 4096,
    children: {
      bin: dir({}, "rwxr-xr-x", "root", "root"),
      boot: dir({}, "rwxr-xr-x", "root", "root"),
      dev: dir({}, "rwxr-xr-x", "root", "root"),
      home: dir(
        {
          operator: dir(
            {
              Desktop: dir({
                "readme.md": file(README_DESKTOP),
              }),
              Documents: dir({
                ignite: dir({
                  "notes.txt": file(IGNITE_NOTE),
                }),
                ignite_screenshots: dir({
                  "about.md": file(SCREENSHOTS_NOTE),
                }),
                ctf: dir({
                  "ctf_writeups.txt": file(CTF_NOTE),
                }),
              }),
              ".bashrc": file(BASHRC),
              ".profile": file(PROFILE),
              ".bash_history": file(BASH_HISTORY, "rw-------"),
              "hackforge.txt": file(HACKFORGE_TXT),
              "hackforge.in": file(HACKFORGE_IN),
              "simple_bash.sh": file(SIMPLE_BASH, "rwxr-xr-x"),
              "first_script.sh": file(FIRST_SCRIPT),
              "greet.sh": file(GREET_SH),
              "scanner.sh": file(SCANNER_SH),
            },
            "rwxr-xr-x"
          ),
          ignite: dir(
            {
              "trainee.txt": file("Home directory of ignite, a fellow HackForge trainee.\n"),
            },
            "rwxr-xr-x"
          ),
        },
        "rwxr-xr-x",
        "root",
        "root"
      ),
      etc: dir(
        {
          ettercap: dir(
            {
              "etter.dns": file(ETTER_DNS, "rw-r--r--", "root", "root"),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
          apt: dir(
            {
              "sources.list": file(SOURCES_LIST, "rw-r--r--", "root", "root"),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
          "init.d": dir(
            {
              apache2: file("#!/bin/sh\n# HackForge sim init script for apache2\n", "rwxr-xr-x", "root", "root"),
              cron: file("#!/bin/sh\n# HackForge sim init script for cron\n", "rwxr-xr-x", "root", "root"),
              mysql: file("#!/bin/sh\n# HackForge sim init script for mysql\n", "rwxr-xr-x", "root", "root"),
              ssh: file("#!/bin/sh\n# HackForge sim init script for ssh\n", "rwxr-xr-x", "root", "root"),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
          "rc2.d": dir(
            {
              README: file("Runlevel 2 boot links. S-files start a service, K-files stop it,\nthe number sets the order. update-rc.d manages these links for you.\n", "rw-r--r--", "root", "root"),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
          "rc3.d": dir(
            {
              README: file("Boot-time symlinks to /etc/init.d scripts live here on a real system.\nS-files start services, K-files stop them, numbers set the order.", "rw-r--r--", "root", "root"),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
          "rc4.d": dir(
            {
              README: file("Runlevel 4 boot links (see /etc/rc3.d/README).\n", "rw-r--r--", "root", "root"),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
          "rc5.d": dir(
            {
              README: file("Runlevel 5 boot links (see /etc/rc3.d/README).\n", "rw-r--r--", "root", "root"),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
          passwd: file(PASSWD, "rw-r--r--", "root", "root"),
          shadow: file(SHADOW, "rw-------", "root", "root"),
          "resolv.conf": file(RESOLV_CONF, "rw-r--r--", "root", "root"),
          hosts: file(HOSTS_FILE, "rw-r--r--", "root", "root"),
          crontab: file(CRONTAB_FILE, "rw-r--r--", "root", "root"),
          hostname: file("kali\n", "rw-r--r--", "root", "root"),
        },
        "rwxr-xr-x",
        "root",
        "root"
      ),
      root: dir({}, "rwx------", "root", "root"),
      tmp: dir({}, "rwxrwxrwx", "root", "root"),
      usr: dir({}, "rwxr-xr-x", "root", "root"),
      var: dir(
        {
          www: dir(
            {
              html: dir(
                {
                  "index.html": file(WWW_INDEX, "rw-r--r--", "root", "www-data"),
                },
                "rwxr-xr-x",
                "root",
                "root"
              ),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
          log: dir(
            {
              "auth.log": file(AUTH_LOG, "rw-r-----", "root", "adm"),
            },
            "rwxr-xr-x",
            "root",
            "root"
          ),
        },
        "rwxr-xr-x",
        "root",
        "root"
      ),
    },
  };
  return root;
}
