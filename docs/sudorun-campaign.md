# Sudo_Run — Linux for Beginners

Campaign `sudorun` in `src/data/lessons.ts` → twelve labs across three data files:

| file | labs |
| --- | --- |
| `src/data/sudorun-lessons-a.ts` | 1–5 |
| `src/data/sudorun-lessons-b.ts` | 6–9 |
| `src/data/sudorun-lessons-c.ts` | 10–12 |

Every lab runs on its own simulated Kali box built by `buildSudoRunFS()`
(`src/lib/sudorun.ts`) and driven by the lab terminal engine
(`src/lib/terminal.ts`).

## Source coverage

The curriculum covers the full text of the three-part *Linux for Beginners*
guide, rebranded to HackForge (`hackingarticles.in` → `hackforge.in`,
`hacking-articles.txt` → `hackforge.txt`, `ftp.cesca.es` →
`files.hackforge.lab`). The article's screenshots are terminal captures, so
each one is reproduced as live simulated output rather than as an image.

### Part 1 — A Small Guide

| Article section | Lab |
| --- | --- |
| Why use Linux for pentesting (open source, transparency, tooling, maintenance, stability) | 1 · Boot Camp |
| `pwd`, `whoami`, `cd`, `ls` | 1 · Boot Camp |
| `--help` (`volatility --help`), `man ls` | 2 · Search Party |
| `locate CTF \| more` | 2 · Search Party (`locate hackforge`, `locate ctf`) |
| `whereis git`, `which git` (binaries in /usr/bin, PATH) | 2 · Search Party |
| `grep -I "echo" simple_bash.sh`, `ifconfig \| grep inet` | 2 · Search Party (+ task in lab 7) |
| `find / -type f -name …`, `2>&1 \| grep -v "Permission Denied"` | 2 · Search Party |
| `cat hacking-articles.txt` | 3 · File Forge |
| `touch hacking-artciles-2.txt` | 3 · File Forge |
| `mkdir Documents/ignite` | 3 · File Forge |
| `cp … Documents/ignite`, `mv … /root/Documents/` | 3 · File Forge |
| `rm …`, `rmdir ignite_screenshots/`, `rm -r` | 3 · File Forge |
| `head /etc/ettercap/etter.dns`, `tail`, `nl` | 4 · Text Smith |
| `sed s/WWW/www/g hacking-artciles.in` | 4 · Text Smith |
| `more`, `less` (+ `/keyword` search) | 4 · Text Smith |
| `apt-cache search hydra` | 5 · Package Ops |
| `apt-get install/remove/purge git` | 5 · Package Ops |
| `apt-get update`, `apt-get upgrade` | 5 · Package Ops |
| `nano /etc/apt/sources.list`, adding repositories | 5 · Package Ops |
| r / w / x permissions, users and groups | 6 · Permission Forge |
| `chown Raj hacking-articles.txt` | 6 · Permission Forge (`chown ignite …`) |
| `chgrp ignite hacking-articles.txt` | 6 · Permission Forge |
| `ls -l` column breakdown | 6 · Permission Forge |
| `chmod` numeric table (0–7), `chmod 777`, `chmod 111`, `chmod +x` | 6 · Permission Forge |
| SUID `chmod 4644` | 6 · Permission Forge |
| SGID `chmod 2466` | 6 · Permission Forge |

### Part 2 — Managing Networks, Processes, Environment Variables

| Article section | Lab |
| --- | --- |
| `ifconfig` (eth0, lo, netmask, broadcast, MAC) | 7 · Network Control |
| `iwconfig` wireless adapters | 7 · Network Control |
| `ifconfig eth0 192.168.1.13` | 7 · Network Control |
| MAC spoofing: `down` → `hw ether 00:11:22:33:44:55` → `up` | 7 · Network Control |
| `dhclient eth0` (DHCP daemon) | 7 · Network Control |
| `dig hackforge.in`, `dig … mx`, `dig … ns` | 7 · Network Control |
| `echo "nameserver 1.1.1.1" > /etc/resolv.conf` | 7 · Network Control |
| `nano /etc/hosts`, dnspoof redirect story | 7 · Network Control |
| `ps`, PID | 8 · Process Command |
| `ps aux` (USER/PID/%CPU/%MEM/COMMAND) | 8 · Process Command |
| `ps aux \| grep msfconsole` | 8 · Process Command |
| `top` (live, resource-ordered) | 8 · Process Command |
| `nice -n -10 /usr/bin/ssh-agent` | 8 · Process Command |
| `renice 20 6242` | 8 · Process Command |
| `kill -1 6242`, `kill -9 4378`, 64 signals, zombies | 8 · Process Command |
| `nano hacking-articles.txt &`, `jobs`, `fg` | 8 · Process Command |
| `at 9:00pm` + job command | 8 · Process Command |
| `set \| more` (all environment variables) | 9 · Environment Shaper |
| `set \| grep HISTSIZE` (1000) | 9 · Environment Shaper |
| `HISTSIZE = 0` temporary change | 9 · Environment Shaper |
| `echo $HISTSIZE ~/valueofHISTSIZE.txt` backup | 9 · Environment Shaper |
| `HISTSIZE=0` + `export HISTSIZE` | 9 · Environment Shaper |
| `url_variable="hackforge.in/"`, `echo $url_variable` | 9 · Environment Shaper |
| `unset url_variable` | 9 · Environment Shaper |

### Part 3 — Bash Scripting, Scheduling, Services

| Article section | Lab |
| --- | --- |
| Shell concepts, bash, text editors | 10 · Script Forge |
| Shebang `#! /bin/bash`, `first_script` | 10 · Script Forge |
| `echo "Hello World"` | 10 · Script Forge |
| `chmod +x`, `./first_script` | 10 · Script Forge |
| Variables and `read name` user input | 10 · Script Forge |
| Scanner script: `nmap -sP $ip` piped through `grep`/`cut`/`head` | 10 · Script Forge |
| cron daemon, `crontab`, `/etc/crontab`, the seven fields | 11 · Clockwork |
| Field table (minute/hour/dom/month/dow) | 11 · Clockwork |
| `service cron status`, `service cron start` | 11 · Clockwork |
| `crontab -e` and the editor picker | 11 · Clockwork |
| `55 23 * * * /root/scanner` | 11 · Clockwork (`… operator /home/operator/scanner.sh`) |
| rc scripts, init.d daemon, runlevels 0/1/2-5/6 | 11 · Clockwork |
| `update-rc.d mysql defaults` (remove\|defaults\|disable\|enable) | 11 · Clockwork |
| Verify with `ps aux \| grep mysql` | 11 · Clockwork |
| `service <name> <start\|stop\|restart\|status>` | 12 · Service Ops |
| `service apache2 start/status/stop/restart` | 12 · Service Ops |
| `nano /var/www/html/index.html`, `http://localhost` | 12 · Service Ops |
| OpenSSH vs telnet, `ssh ignite@192.168.0.11` | 12 · Service Ops |
| `ftp ftp.cesca.es`, `anonymous`/`anonymous`, `ls`, `get favicon.ico`, `bye` | 12 · Service Ops |

## Sandbox VFS (`src/lib/sudorun.ts`)

```
/
├── home/operator/            ← lab home (you are `operator@kali`)
│   ├── Desktop/readme.md
│   ├── Documents/
│   │   ├── ignite/notes.txt
│   │   ├── ignite_screenshots/about.md
│   │   └── ctf/ctf_writeups.txt
│   ├── .bashrc · .profile · .bash_history     (revealed by `ls -a`)
│   ├── hackforge.txt        ← chown / chgrp / chmod / SUID / SGID target
│   ├── hackforge.in         ← sed WWW→www target
│   ├── simple_bash.sh       ← grep / at / cron target (already executable)
│   ├── first_script.sh      ← shebang + echo, needs chmod +x
│   ├── greet.sh             ← `read name` interactive script
│   └── scanner.sh           ← nmap -sP pipeline script
├── etc/
│   ├── ettercap/etter.dns   ← 30+ line head / tail / nl / more / less target
│   ├── apt/sources.list
│   ├── init.d/{apache2,cron,mysql,ssh}
│   ├── rc2.d · rc3.d · rc4.d · rc5.d   ← update-rc.d writes S01/K01 links here
│   ├── passwd · shadow · hosts · resolv.conf · crontab · hostname
├── var/www/html/index.html  ← Apache document root served by curl localhost
├── var/log/auth.log
└── root/                    ← permission-denied noise for `find /`
```

Network-side fixtures live in `src/lib/terminal.ts`: the `10.10.10.0/24`
network model, the `ps`/`top` process table (including zombie PID 4378 and
`msfconsole` PID 5123) and the FTP mirror tree on `files.hackforge.lab`
(`ubuntu/releases/favicon.ico`, `SHA256SUMS.txt`, `README.txt`).

## Tests

```
npm run test:sudorun    # drives all 12 labs through the real engine (120 objectives + 24 challenges)
npm run test:engine     # engine regressions for the pre-existing campaigns
npm run test:smoke      # mounts the whole app in jsdom and clicks through the map
npm run typecheck
```
