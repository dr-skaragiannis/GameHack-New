import { getNode, resolvePath, type FileNode, type TermLine, type Terminal } from "./terminal";

function directory(name: string, entries: FileNode[] = [], mode = "drwxr-xr-xr-x"): FileNode {
  return {
    name,
    type: "dir",
    mode,
    owner: "analyst",
    group: "dfir",
    children: Object.fromEntries(entries.map((entry) => [entry.name, entry])),
  };
}

function evidenceFile(name: string, content: string, mode = "-r--r-----"): FileNode {
  return { name, type: "file", content, mode, owner: "analyst", group: "dfir" };
}

const accessLog = `192.0.2.44 - - [12/Apr/2025:09:14:02 +0000] "GET / HTTP/1.1" 200 842 "-" "Firefox/124.0"
192.0.2.44 - - [12/Apr/2025:09:14:11 +0000] "GET /images.php HTTP/1.1" 200 1114 "http://portal.gamehack.invalid/" "Firefox/124.0"
192.0.2.44 - - [12/Apr/2025:09:14:16 +0000] "GET /view.php?image=starry_night.jpg HTTP/1.1" 200 613774 "http://portal.gamehack.invalid/images.php" "Firefox/124.0"
192.0.2.44 - - [12/Apr/2025:09:15:08 +0000] "GET /view.php?image=..%2F..%2Fetc%2Fpasswd HTTP/1.1" 200 650 "http://portal.gamehack.invalid/images.php" "Firefox/124.0"
192.0.2.44 - - [12/Apr/2025:09:16:25 +0000] "POST /command.php HTTP/1.1" 200 1052 "http://portal.gamehack.invalid/command.php" "Firefox/124.0"
192.0.2.44 - - [12/Apr/2025:09:17:41 +0000] "POST /command.php HTTP/1.1" 200 1395 "http://portal.gamehack.invalid/command.php" "Firefox/124.0"
192.0.2.44 - - [12/Apr/2025:09:19:14 +0000] "POST /users.php HTTP/1.1" 200 1944 "http://portal.gamehack.invalid/users.php" "Firefox/124.0"
192.0.2.44 - - [12/Apr/2025:09:19:42 +0000] "POST /users.php HTTP/1.1" 200 2518 "http://portal.gamehack.invalid/users.php" "Firefox/124.0"
`;

const auditLog = `--GH-2404-A--
[12/Apr/2025:09:15:08 +0000] 192.0.2.44 41022 198.51.100.20 80
--GH-2404-B--
GET /view.php?image=../../etc/passwd HTTP/1.1
User-Agent: Firefox/124.0
--GH-2404-H--
Message: Path Traversal Attack (/../)
Rule ID: 930100
Severity: CRITICAL
Matched Data: ../../etc/passwd
Unique ID: DFIR-7F3A
--GH-2404-A--
[12/Apr/2025:09:17:41 +0000] 192.0.2.44 41044 198.51.100.20 80
--GH-2404-B--
POST /command.php HTTP/1.1
--GH-2404-H--
Message: OS File Access Attempt
Rule ID: 930120
Severity: CRITICAL
Matched Data: /etc/shadow
Unique ID: DFIR-8A11
--GH-2404-A--
[12/Apr/2025:09:19:42 +0000] 192.0.2.44 41102 198.51.100.20 80
--GH-2404-B--
POST /users.php HTTP/1.1
--GH-2404-H--
Message: SQL Injection Attack Detected
Rule ID: 942100
Severity: CRITICAL
Matched Data: union select
Unique ID: DFIR-9C22
--GH-2404-A--
[12/Apr/2025:09:17:41 +0000] 192.0.2.44 41044 198.51.100.20 80
--GH-2404-B--
POST /command.php HTTP/1.1
--GH-2404-H--
Message: Remote Command Execution pattern detected in request parameter
Rule ID: 932160
Severity: CRITICAL
Matched Data: cat /etc/passwd (logged pattern only; no command executed by this fixture)
Unique ID: DFIR-8A11-RCE
`;

export function dfirFS(): FileNode {
  return directory("/", [
    directory("cases", [
      directory("IR-2404", [
        evidenceFile("README.txt", "GameHack DFIR CASE GH-2404\nMission: build a reproducible, evidence-led incident timeline.\nAll names, IPs, logs, hashes, and artifacts are fictional training data.\nPreserve originals. Analyze copies. Record every action.\n"),
        evidenceFile("case_notes.md", "CASE GH-2404 — suspected web-server compromise\nLead: Morgan Lee\nIncident window: 2025-04-12 09:14–09:22 UTC\nPortal: portal.gamehack.invalid (198.51.100.20)\nQuestion: what happened, what was accessed, and what should responders preserve next?\nAn IP address is a network observation, not a human attribution.\n"),
        evidenceFile("chain_of_custody.csv", "evidence_id,ts_utc,handler,action,sha256,notes\nE-001,2025-04-12T10:04:00Z,analyst,received read-only training image,9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08,fixture source\nE-002,2025-04-12T10:07:00Z,analyst,created verified working copy,9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08,hash match\n"),
        directory("evidence", [
          directory("01-intake", [
            evidenceFile("hash_sample.txt", "test"),
            evidenceFile("triage-notes.txt", "Triage checklist: preserve, identify, hash, examine a copy, document limits.\n"),
            evidenceFile("manifest.csv", "id,source,acquired_utc,method,sha256\nE-001,USB training media,2025-04-12T10:04:00Z,read-only logical copy,9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08\nE-002,web-server log bundle,2025-04-12T10:08:00Z,exported training fixture,fixture-digest-documented-in-case-notes\n"),
            evidenceFile("acquisition.log", "10:04 Evidence E-001 received.\n10:06 Original mounted read-only.\n10:07 Working copy created.\n10:08 SHA-256 verification matched.\n10:09 Examiner: analyst-01.\n"),
            evidenceFile("challenge-corrupt.png", "00 00 00 00 50 4e 47 0d 0a 1a 0a | ...PNG.... | simulated image signature damaged\n"),
          ]),
          directory("02-windows", [
            evidenceFile("NTUSER.DAT", "SIMULATED REGISTRY HIVE EXPORT — read-only training view\n[HKCU\\Control Panel\\Mouse]\nDoubleClickSpeed=500\n[HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\TypedPaths]\nurl1=C:\\Users\\Morgan\\Downloads\\QuarterlyForecast.docm\n[HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run]\nOneDriveUpdate=C:\\Users\\Morgan\\AppData\\Local\\Temp\\invoice.exe\n"),
            evidenceFile("passwd.lnk", "SIMULATED LNK METADATA\nTarget: C:\\Users\\Morgan\\Desktop\\payroll_export.csv\nCreated: 2025-04-12 09:02:14Z\nModified: 2025-04-12 09:02:14Z\nAccessed: 2025-04-12 09:18:43Z\nMachine: WORKSTATION-7\nVolume serial: 02916957\n"),
            directory("Firefox", [
              evidenceFile("places.sqlite", "SIMULATED SQLITE TABLE: moz_places\nid,url,title,last_visit_utc,visit_count\n1,https://portal.gamehack.invalid/,GameHack Portal,2025-04-12T08:51:11Z,3\n2,https://cdn-updates.invalid/manual,Update Manual,2025-04-12T09:01:55Z,1\n3,https://mail.gamehack.invalid/attachment,Quarterly Forecast,2025-04-12T09:02:02Z,1\n"),
              evidenceFile("logins.json", "{\"logins\":[{\"hostname\":\"https://portal.gamehack.invalid\",\"encryptedUsername\":\"[REDACTED]\",\"encryptedPassword\":\"[REDACTED]\"}],\"note\":\"Training fixture: credentials are intentionally redacted\"}\n"),
            ]),
            directory("Chrome", [
              evidenceFile("History.sqlite", "SIMULATED SQLITE TABLE: urls\nid,url,title,last_visit_time\n4,https://portal.gamehack.invalid/login,GameHack Portal Login,2025-04-12T09:13:21Z\n5,https://cdn-updates.invalid/manual,Update Manual,2025-04-12T09:14:01Z\n"),
              evidenceFile("Local State.txt", "Chrome profile metadata. Encryption key material omitted from this teaching fixture.\n"),
            ]),
            directory("Recent", [evidenceFile("QuarterlyForecast.lnk", "Target: C:\\Users\\Morgan\\Downloads\\QuarterlyForecast.docm\nAccessed: 2025-04-12 09:02:14Z\n")]),
            evidenceFile("Security.evtx", "SIMULATED WINDOWS SECURITY EVENTS\n2025-04-12T08:58:10Z EventID=4624 Account=MORGAN LogonType=2 Source=local\n2025-04-12T09:20:15Z EventID=4625 Account=administrator Source=192.0.2.44 Result=failure\n2025-04-12T09:21:03Z EventID=1102 Account=MORGAN Message=Audit log cleared (investigate context)\n2025-04-12T09:22:51Z EventID=4720 Account=svc-update Message=Local user created\n"),
            evidenceFile("PowerShell-Operational.evtx", "SIMULATED POWERSHELL EVENTS\n2025-04-12T09:04:16Z EventID=4104 ScriptBlock=Get-FileHash QuarterlyForecast.docm\n2025-04-12T09:04:20Z EventID=4104 ScriptBlock=Invoke-WebRequest hxxps://cdn-updates.invalid/package.bin [DEFANGED]\n2025-04-12T09:05:02Z EventID=4104 ScriptBlock=Start-Process invoice.exe -WindowStyle Hidden [SIMULATED]\n"),
          ]),
          directory("03-documents", [
            evidenceFile("QuarterlyForecast.docm", "SIMULATED OOXML / MACRO-ENABLED OFFICE DOCUMENT\nContainer: ZIP-based OOXML\nCore properties creator: Morgan Lee\nLast modified by: Morgan Lee\nEmbedded item: word/vbaProject.bin (represented by safe text fixture)\n"),
            directory("word", [
              evidenceFile("document.xml", "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<w:document><w:body><w:p><w:t>Quarterly Forecast — Confidential</w:t></w:p><w:p><w:t>Prepared by: Morgan Lee</w:t></w:p><w:p><w:t>Review note: send updated figures before 17:00.</w:t></w:p></w:body></w:document>\n"),
              evidenceFile("vbaProject.txt", "STATIC VBA ANALYSIS FIXTURE — NEVER EXECUTABLE\nProcedure: Document_Open\nObserved references: CreateObject(\"WScript.Shell\") [API NAME ONLY]\nObserved string: hxxps://cdn-updates.invalid/package.bin [DEFANGED]\nObserved behavior category: process-launch reference flagged for review\nNo macro code is stored or executed in this case.\n"),
              evidenceFile("_rels-document.xml.rels", "Relationship: rId1 -> https://cdn-updates.invalid/remote-template.dotm [DEFANGED]\n"),
            ]),
            evidenceFile("starry_night.png", "SIMULATED PNG METADATA\nDimensions: 2 x 2 training thumbnail\nLSB scan result: embedded marker '148: follow the evidence trail'\nExif Artist: Unknown\n"),
            evidenceFile("super_secret_audio.wav", "SIMULATED AUDIO ANALYSIS SUMMARY\nDuration: 4.2s\nChannels: mono\nSpectrogram note: narrow-band tone around 1.2 kHz encodes FLAG{spectral_clue}\nAudio payload is not included; this textual record is the safe fixture.\n"),
            evidenceFile("Presentation.pptx", "SIMULATED OOXML PRESENTATION\nFirst embedded image: starry_night.png\nOverlay images: 4 decorative stock placeholders\nAnalyst note: inspect archive relationships and media ordering.\n"),
          ]),
          directory("04-web", [
            evidenceFile("access.log", accessLog),
            evidenceFile("error.log", "[12/Apr/2025:09:17:41 +0000] [client 192.0.2.44] application request attempted protected path /etc/shadow; Permission denied for www-data\n[12/Apr/2025:09:19:42 +0000] SQLi detector raised alert on /users.php search parameter\n"),
            evidenceFile("modsec_audit.log", auditLog),
            evidenceFile("case-summary.txt", "Observed sequence: normal page visit -> path traversal attempt -> command endpoint POST -> user-search SQLi probes. Source 192.0.2.44 is an evidence pivot, not a human attribution.\n"),
          ]),
          directory("05-network", [
            evidenceFile("capture.pcapng", "GameHack PCAP-NG training fixture | capture id GH-0425-17\nPackets: 38 | Capture window: 2025-04-12 09:13:58Z - 09:20:02Z\nProtocols: DNS 5, TCP 21, HTTP 8, FTP 4\nFrame 8  192.0.2.44:51510 -> 198.51.100.20:80   GET /images.php\nFrame 13 192.0.2.44:51510 -> 198.51.100.20:80   GET /view.php?image=../../etc/passwd\nFrame 19 192.0.2.44:51544 -> 198.51.100.20:21  FTP USER analyst\nFrame 20 192.0.2.44:51544 -> 198.51.100.20:21  FTP PASS [REDACTED TRAINING SECRET]\nFrame 27 192.0.2.44:51510 -> 198.51.100.20:80   POST /command.php\nFrame 35 192.0.2.44:51602 -> 203.0.113.77:443  TLS SNI cdn-updates.invalid\n"),
            evidenceFile("protocol-hierarchy.txt", "Protocol       Packets   Share\nTCP            21        55.3%\nHTTP            8        21.1%\nDNS             5        13.2%\nFTP             4        10.5%\n"),
            evidenceFile("tcp-stream-7.txt", "SIMULATED TCP STREAM #7\nClient 192.0.2.44 -> portal.gamehack.invalid\nGET /view.php?image=../../etc/passwd HTTP/1.1\nHTTP/1.1 200 OK\nResponse body includes simulated passwd artifact.\n"),
            evidenceFile("ftp-stream-2.txt", "SIMULATED FTP STREAM #2\nUSER analyst\nPASS [REDACTED]\n230 Login successful (fixture)\nRETR quarterly-export.csv\n226 Transfer complete\n"),
            evidenceFile("exported-objects.txt", "SIMULATED HTTP OBJECT EXPORT\nquarterly-export.csv | 2.1 KB | source stream 7 | hash fixture: 5d41402abc4b2a76b9719d911017c592\n"),
          ]),
          directory("06-disk", [
            evidenceFile("usb.dd", "SIMULATED RAW DISK IMAGE METADATA\nSource: USB training image\nImage format: raw/dd\nSector size: 512 bytes\nVolume serial (raw hexadecimal): 0x02916957\nAcquired read-only: yes\nImage size: 16 MiB\nEvidence ID: E-004\n"),
            evidenceFile("note.txt", "SIMULATED RECOVERED USB NOTE\nReview payroll.csv before sharing.\nMarker: FLAG{disk_artifact}\n"),
            evidenceFile("meme.jpeg", "SIMULATED JPEG METADATA\nOriginal URL: https://social.gamehack.invalid/post/4815\n"),
            evidenceFile("$MFT.csv", "Record,Parent,Name,CreatedUTC,ModifiedUTC,AccessedUTC,Deleted\n42,5,note.txt,2025-04-11T16:10:00Z,2025-04-12T08:55:00Z,2025-04-12T09:01:00Z,false\n57,5,$Txf,2025-04-11T16:20:00Z,2025-04-11T16:20:00Z,2025-04-12T09:05:54Z,true\n61,42,meme.jpeg,2025-04-11T16:30:00Z,2025-04-11T16:30:00Z,2025-04-12T09:00:00Z,false\n"),
            evidenceFile("$LogFile.csv", "LSN,Operation,Record,UTC\n1001,FILE_CREATE,42,2025-04-11T16:10:00Z\n1002,DATA_EXTEND,42,2025-04-11T16:10:02Z\n1019,FILE_DELETE,57,2025-04-12T09:05:54Z\n"),
            evidenceFile("$MFTMirr.txt", "SIMULATED NTFS METADATA MIRROR\nMirrors critical initial MFT records.\nCompare mirror state with $MFT.csv when investigating metadata damage.\n"),
            evidenceFile("acquisition-hash.txt", "E-004 source digest: documented training fixture value; this text is not a raw image hash.\nWorking copy verification: MATCH (simulated case record).\n"),
          ]),
          directory("07-malware", [
            evidenceFile("sample.bin", "SAFE STATIC SAMPLE — TEXT REPRESENTATION ONLY\nFormat: ELF 64-bit, x86-64, not an executable binary\nSHA256: 84b3d3b9f01da8c7ef85d519b613f941b4d8217f71e4dfe3a715ef10e2349012\nStrings: /bin/sh | hxxps://telemetry.gamehack.invalid/collect | [REDACTED-SHELL-ARGUMENT]\nBehavior clue: process launch + outbound socket attempt (simulated)\n"),
            evidenceFile("source-analysis.c", "/* Fictional code-analysis notes; not compilable malware */\n/* A decode routine transforms a marker string with ROT13. */\n/* Network and process APIs are listed as indicators only. */\n/* No payload, command, socket, or execution logic is provided. */\nchar *indicator = \"hxxps://telemetry.gamehack.invalid/collect\";\n"),
            evidenceFile("dynamic-observations.txt", "ISOLATED ANALYSIS SNAPSHOT\nProcess: invoice.exe (simulated)\nChild process: powershell.exe (simulated)\nNetwork: attempted 192.0.2.66:443 -> 203.0.113.77:443\nFile write: %TEMP%/cache-update.dat (simulated)\nHost changes: none; detonation is represented as a report only.\n"),
            evidenceFile("strings.txt", "invoice.exe\nCreateProcessW [API indicator]\nRegSetValueExW [API indicator]\nhxxps://telemetry.gamehack.invalid/collect [DEFANGED IOC]\n[REDACTED-SHELL-ARGUMENT]\n"),
            evidenceFile("decode-notes.txt", "STATIC STRING TRANSFORM EXERCISE\nEncoded marker (ROT13): Synt{fgngvp_nanlyfvf}\nDecoded training marker: Flag{static_analysis}\nThis inert marker demonstrates string transformation; it is not executable code.\n"),
            evidenceFile("cutter-report.txt", "STATIC DISASSEMBLY SUMMARY — SYNTHETIC\nFunction: main -> decode_marker -> report_indicator\nObserved transform: ROT13, key 13\nProcess/network APIs: indicator references only\nNo executable instructions or payload included.\n"),
            evidenceFile("strace-report.txt", "DYNAMIC TRACE SUMMARY — SYNTHETIC, NOT EXECUTED\nexecve: sample process start (fixture event)\nopenat: reads local config (fixture event)\nconnect: attempted connection to 203.0.113.77:443 (fixture event)\nNo system call was made on the analyst host.\n"),
            evidenceFile("ltrace-report.txt", "LIBRARY CALL SUMMARY — SYNTHETIC\nlibc: getenv [observed fixture]\nlibc: fopen [observed fixture]\nlibc: system [flagged API reference; redacted arguments]\nNo target process executed.\n"),
            evidenceFile("reputation-report.txt", "OFFLINE TEACHING FIXTURE — PUBLIC REPUTATION LOOKUP\nSample SHA-256: 84b3d3b9f01da8c7ef85d519b613f941b4d8217f71e4dfe3a715ef10e2349012\nCommunity detections: 0 / 70 (fictional fixture)\nInterpretation: absence of detections does not establish that a sample is safe.\nPrivacy reminder: do not upload confidential evidence to public scanners without policy approval.\n"),
          ]),
          directory("08-memory", [
            evidenceFile("workstation.raw", "SIMULATED MEMORY IMAGE\nOS: Windows 7 SP1 x64 (suggested profile)\nImage time: 2025-04-12T15:04:02Z\nAcquired: 2025-04-12T15:30:11Z\nVolatile evidence may include processes, network sockets, environment, clipboard and console history.\n"),
            evidenceFile("pslist.txt", "PID   PPID  ImageName       User          Start (UTC)\n4     0     System          SYSTEM        14:55:52\n292   4     smss.exe        SYSTEM        14:55:52\n544   440   services.exe    SYSTEM        14:55:53\n556   440   lsass.exe       SYSTEM        14:55:53\n1816  544   taskhost.exe    MORGAN        15:02:01\n2048  1816  invoice.exe     MORGAN        15:04:12\n2112  2048  powershell.exe  MORGAN        15:04:16\n"),
            evidenceFile("pstree.txt", "System (4)\n└── services.exe (544)\n    └── taskhost.exe (1816)\n        └── invoice.exe (2048)\n            └── powershell.exe (2112)\n"),
            evidenceFile("netscan.txt", "Proto   Local Address        Foreign Address       State       PID   Owner\nTCPv4   192.0.2.44:51412     203.0.113.77:443      ESTABLISHED 2112  powershell.exe\nTCPv4   0.0.0.0:445          0.0.0.0:0             LISTENING   4     System\n"),
            evidenceFile("envars.txt", "PID   Process         Variable          Value\n2048  invoice.exe     TEMP              C:\\Users\\Morgan\\AppData\\Local\\Temp\n2112  powershell.exe  CASE_TOKEN        FLAG{environment_trace}\n"),
            evidenceFile("clipboard.txt", "SIMULATED CLIPBOARD ARTIFACT\ntext: FLAG{clipboard_cache}\nsource process: powershell.exe (PID 2112)\n"),
            evidenceFile("search-history.txt", "SIMULATED BROWSER SEARCH ARTIFACT\n2025-04-02 15:01:21Z query=incident-response portal\n2025-04-02 15:02:05Z query=FLAG{browser_search_trace}\n"),
            evidenceFile("cmdline.txt", "PID   Process          CommandLine\n2048  invoice.exe      C:\\Users\\Morgan\\Downloads\\invoice.exe\n2112  powershell.exe   powershell.exe -File [REDACTED SCRIPT PATH] ; set CASE_FLAG=FLAG{command_line_trace}\n"),
            evidenceFile("mspaint-artifact.txt", "SIMULATED MSPAINT PIXEL-ART STRING\nCanvas: 96 x 32 px\nOCR marker: FLAG{paint_buffer_trace}\nRecovered from a fictional in-memory bitmap region; no real image pixels are stored.\n"),
          ]),
          directory("09-container", [
            evidenceFile("container.inspect.json", "{\n  \"Id\": \"sha256:df1a7c40cafe0000\",\n  \"Image\": \"gamehack/web:1.4\",\n  \"Created\": \"2025-04-12T09:02:11Z\",\n  \"State\": { \"Status\": \"exited\", \"ExitCode\": 0, \"Pid\": 0 },\n  \"Config\": { \"User\": \"www-data\", \"Env\": [\"APP_ENV=production\", \"CASE=GH-2404\", \"TRAINING_MARKER=FLAG{container_config}\"] },\n  \"NetworkSettings\": { \"IPAddress\": \"172.18.0.7\", \"Ports\": { \"80/tcp\": [{\"HostPort\":\"9090\"}] } }\n}\n"),
            evidenceFile("container.diff.txt", "C /root\nA /root/.ash_history\nA /tmp/cache-update.dat\nA /tmp/FLAG{container_diff}\nD /app/healthcheck.sh\n"),
            evidenceFile("container.log", "/ # ls\n/app # echo [REDACTED] > /tmp/cache-update.dat\n/app # printf 'FLAG{container_logs}' > /tmp/trace.txt [SIMULATED]\n/app # rm /app/healthcheck.sh\n/app # exit\n"),
            evidenceFile("image.history.txt", "IMAGE       CREATED BY                                  SIZE\nsha256:df1a  /bin/sh -c #(nop) CMD [\"node\",\"server.js\"] 0B\n<missing>    /bin/sh -c #(nop) COPY app/ /app/              1.8MB\n<missing>    /bin/sh -c echo FLAG{container_history} > /root/secret.txt 64B [SIMULATED BUILD METADATA]\n"),
            evidenceFile("layers.txt", "Layer 0: base alpine (read-only)\nLayer 1: app source (read-only)\nLayer 2: build-time secret artifact /root/secret.txt [REMOVED IN LATER LAYER]\nLayer 3: runtime config\nA later delete instruction does not remove bytes from an earlier immutable layer.\n"),
            evidenceFile("memory-strings.txt", "SIMULATED CONTAINER MEMORY STRINGS\nNODE_ENV=production\nCASE=GH-2404\nFLAG{container_layer}\nFLAG{container_memory}\n"),
          ]),
          directory("10-passwords", [
            evidenceFile("hashes.txt", "# Fictional exercise hashes; never use real credential hashes without authorization\nMD5 098f6bcd4621d373cade4e832627b4f6 user=tester label=sample-known\nMD5 5f4dcc3b5aa765d61d8327deb882cf99 user=analyst label=weak-training-only\nSHA256 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08 user=sample label=integrity-demo\n"),
            evidenceFile("wordlist.txt", "test\npassword\ncorrect-horse\nWinter2025!\n"),
            evidenceFile("hash-notes.txt", "Hashes are one-way digests, not encryption. Candidate testing computes each candidate's digest and compares it. Salt prevents identical passwords from sharing a stored digest; slow password KDFs raise guessing cost. MD5/SHA-1 are not suitable password storage functions.\n"),
            evidenceFile("rainbow-notes.txt", "A rainbow table is a precomputed time-memory tradeoff for unsalted hashes. It can make lookup fast for covered candidates, but storage is large and a unique salt changes the hash input. Modern password storage uses a unique salt and a slow adaptive KDF such as Argon2id, bcrypt, or scrypt.\n"),
            evidenceFile("crack-report.txt", "TRAINING-ONLY CANDIDATE MATCHES\n098f6bcd4621d373cade4e832627b4f6 -> test (known classroom vector)\n5f4dcc3b5aa765d61d8327deb882cf99 -> password (weak toy example)\n"),
          ]),
        ]),
        directory("visuals", [
          evidenceFile("case-timeline.csv", "ts_utc,source,event,confidence\n2025-04-12T09:02:14Z,LNK,QuarterlyForecast.docm accessed,medium\n2025-04-12T09:04:20Z,PowerShell log,Defanged update URL observed,high\n2025-04-12T09:15:08Z,Apache access,Traversal-shaped request,high\n2025-04-12T09:15:08Z,ModSecurity,Rule 930100 triggered,high\n2025-04-12T09:19:42Z,ModSecurity,SQLi rule 942100 triggered,high\n2025-04-12T09:21:03Z,Security EVTX,Audit log cleared event,medium\n"),
          evidenceFile("incident-graph.txt", "SOURCE 192.0.2.44 -> WEB 198.51.100.20 -> traversal / command endpoint / SQLi probes\nENDPOINT 203.0.113.77:443 <- simulated process network observation\nCaveat: shared infrastructure, VPNs, NAT and spoofing mean an IP is not a person's identity.\n"),
        ]),
        directory("working-copy", [
          {
            name: "challenge-corrupt.png",
            type: "file",
            mode: "-rw-r--r--",
            owner: "analyst",
            group: "dfir",
            content: "00 00 00 00 50 4e 47 0d 0a 1a 0a | ...PNG.... | derived writable training copy\n",
          },
          evidenceFile("README.txt", "Derived writable copy for the magic-byte exercise. The evidence/01-intake source remains read-only.\n", "-rw-r--r--"),
        ]),
        directory("derived", [evidenceFile("README.txt", "Derived outputs created by simulated tools are collected here.\n", "-rw-r--r--")]),
      ]),
    ]),
    directory("usr", [directory("bin", [evidenceFile("cat", "ELF 64-bit LSB pie executable, x86-64, dynamically linked (virtual command catalog)\n")])]),
  ]);
}

type DfirContext = {
  cmd: string;
  args: string[];
  rest: string[];
  pos: string[];
  flags: Set<string>;
  input: string;
  print: (text: string, kind?: TermLine["kind"]) => void;
  stdin?: string | null;
};

function evidencePath(t: Terminal, candidate?: string) {
  const path = candidate || ".";
  return resolvePath(t, path);
}

function fileAt(t: Terminal, candidate?: string) {
  const path = evidencePath(t, candidate);
  const node = getNode(t.fs, path);
  return { path, node: node?.type === "file" ? node : null };
}

function mark(t: Terminal, ...flags: string[]) {
  flags.forEach((flag) => t.flags.add(flag));
}

function writeDerivedFile(t: Terminal, path: string, content: string) {
  const normalized = resolvePath(t, path);
  const lastSlash = normalized.lastIndexOf("/");
  const parentPath = lastSlash <= 0 ? "/" : normalized.slice(0, lastSlash);
  const name = normalized.slice(lastSlash + 1);
  const parent = getNode(t.fs, parentPath);
  if (!parent || parent.type !== "dir" || !parent.children || !name) return false;
  parent.children[name] = {
    name,
    type: "file",
    mode: "-rw-r--r--",
    owner: t.user,
    group: "dfir",
    content,
  };
  mark(t, "dfir-derived-output");
  return true;
}

function digestFor(algorithm: string, content: string | undefined): string {
  if (content === "test") {
    if (algorithm === "md5") return "098f6bcd4621d373cade4e832627b4f6";
    if (algorithm === "sha1") return "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3";
    return "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
  }
  return `fixture-only-${algorithm}-digest-not-computed`;
}

function fileType(path: string, content: string, t: Terminal) {
  if (path.endsWith("/usr/bin/cat") && content.includes("ELF")) return "ELF 64-bit LSB pie executable, x86-64, dynamically linked (virtual command catalog)";
  if (path.endsWith("challenge-corrupt.png")) {
    return t.flags.has("dfir-magic-fixed")
      ? "PNG image data, 2 x 2, valid magic signature (virtual repaired copy)"
      : "PNG image data, corrupted signature; expected 89 50 4e 47 at offset 0 (training fixture)";
  }
  if (path.endsWith(".raw") || path.endsWith(".dd") || path.endsWith(".ad1")) return "forensic disk image metadata (simulated text fixture)";
  if (path.endsWith(".pcapng")) return "pcapng capture metadata (simulated fixture; not a binary packet capture)";
  if (path.endsWith(".evtx")) return "Windows Event Log export (simulated text fixture)";
  if (path.endsWith(".sqlite")) return "SQLite browser-history table export (simulated text fixture)";
  if (path.endsWith(".docm") || path.endsWith(".pptx")) return "Office Open XML container metadata (simulated text fixture)";
  if (path.endsWith(".bin")) return "ELF 64-bit sample metadata (text-only, not executable)";
  if (path.endsWith(".png")) return "PNG image metadata (simulated training fixture)";
  if (path.endsWith(".wav")) return "WAVE audio-analysis metadata (simulated text fixture)";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "JPEG image metadata (simulated text fixture)";
  if (path.endsWith(".lnk")) return "Windows shortcut metadata export (simulated text fixture)";
  if (path.endsWith(".csv")) return "CSV text data";
  if (path.endsWith(".json")) return "JSON text data";
  if (path.endsWith(".txt") || path.endsWith(".log") || path.endsWith(".md") || path.endsWith(".xml") || path.endsWith(".c")) return "ASCII/UTF-8 text";
  return content.includes("SIMULATED") ? "GameHack simulated evidence text" : "ASCII/UTF-8 text";
}

export function handleDfirCommand(t: Terminal, context: DfirContext): boolean {
  if (t.scenario !== "dfir") return false;
  const { cmd, rest, pos, input, print } = context;
  const operands = pos.filter((value) => !value.startsWith("-") && value !== "-f" && value !== "-r");
  const pathArg = operands.find((value) => value.includes("/") || /\.[A-Za-z0-9$]+$/.test(value));

  switch (cmd.toLowerCase()) {
    case "file": {
      const { path, node } = fileAt(t, pathArg);
      if (!node) {
        print(`file: ${pathArg || "missing operand"}: cannot open`, "err");
        return true;
      }
      const type = fileType(path, node.content || "", t);
      mark(t, "dfir-file", "dfir-file:" + path);
      if (path.endsWith("challenge-corrupt.png") && t.flags.has("dfir-magic-fixed")) mark(t, "dfir-file-after-fix");
      print(`${pathArg}: ${type}`);
      return true;
    }
    case "netstat":
    case "ss": {
      mark(t, "dfir-netstat");
      print("Active Internet connections (simulated fixture snapshot)\nProto Local Address       Foreign Address       State       PID/Program\ntcp   192.0.2.44:51412    203.0.113.77:443     ESTABLISHED 2112/powershell.exe\ntcp   198.51.100.20:80   192.0.2.44:51510     ESTABLISHED 808/apache2\nudp   192.0.2.44:5353    224.0.0.251:5353      LISTENING   744/mdns\nNo live sockets were inspected.");
      return true;
    }
    case "strings": {
      const { path, node } = fileAt(t, pathArg);
      if (!node) {
        print(`strings: ${pathArg || "missing operand"}: No such file`, "err");
        return true;
      }
      mark(t, "dfir-strings", "dfir-strings:" + path);
      const rows = (node.content || "").split(/\r?\n/).filter((line) => line.trim().length >= 4);
      print(rows.join("\n") || "(no printable strings in this text fixture)");
      return true;
    }
    case "grep": {
      const pattern = pos.find((value) => !value.startsWith("-")) || "";
      const fileArg = pos.find((value, index) => index > 0 && /[./\\\\]/.test(value));
      const sourcePath = fileArg ? resolvePath(t, fileArg) : null;
      const sourceFile = sourcePath ? getNode(t.fs, sourcePath) : null;
      const source = context.stdin ?? (sourceFile?.type === "file" ? sourceFile.content || "" : "");
      if (!context.stdin && (!sourceFile || sourceFile.type !== "file")) {
        print(`grep: ${fileArg || "missing input"}: No such file`, "err");
        return true;
      }
      const invert = rest.includes("-v") || rest.includes("-iv") || rest.includes("-vi");
      const expression = new RegExp(pattern.replace(/^["']|["']$/g, ""), rest.some((arg) => arg.includes("i")) ? "i" : "");
      const sourceLines = source.split(/\r?\n/);
      const results = sourceLines.filter((line) => invert ? !expression.test(line) : expression.test(line));
      mark(t, "dfir-grep");
      if (sourcePath) t.filesRead.push(sourcePath);
      if (/error|permission/i.test(pattern)) mark(t, "dfir-grep-error");
      if (/traversal|passwd/i.test(pattern) && sourcePath?.endsWith("/access.log")) mark(t, "dfir-web-access");
      if (/930100/.test(pattern) && sourcePath?.endsWith("/modsec_audit.log")) mark(t, "dfir-waf-traversal");
      if (/942100/.test(pattern) && sourcePath?.endsWith("/modsec_audit.log")) mark(t, "dfir-waf-sqli");
      if (/932160/.test(pattern) && sourcePath?.endsWith("/modsec_audit.log")) mark(t, "dfir-waf-rce");
      print(results.join("\n"));
      return true;
    }
    case "md5sum":
    case "sha1sum":
    case "sha256sum": {
      const { path, node } = fileAt(t, pathArg);
      if (!node) {
        print(`${cmd}: ${pathArg || "missing operand"}: No such file`, "err");
        return true;
      }
      const algorithm = cmd.replace("sum", "");
      mark(t, `dfir-${algorithm}`, `dfir-hash:${algorithm}:${path}`);
      print(`${digestFor(algorithm, node.content)}  ${pathArg}`);
      if (node.content === "test") mark(t, "dfir-known-hash");
      return true;
    }
    case "xxd":
    case "hexdump": {
      const { path, node } = fileAt(t, pathArg);
      if (!node) {
        print(`${cmd}: ${pathArg || "missing operand"}: No such file`, "err");
        return true;
      }
      mark(t, "dfir-xxd", "dfir-xxd:" + path);
      if (path.endsWith("challenge-corrupt.png")) {
        print(t.flags.has("dfir-magic-fixed")
          ? "00000000: 8950 4e47 0d0a 1a0a 0000 0000 0000 0000  .PNG............"
          : "00000000: 0000 0000 504e 470d 0a1a 0a00 0000 0000  ....PNG.........");
      } else {
        print(`00000000: 4761 6d65 4861 636b 2044 4649 5220 4361  GameHack DFIR Ca\n00000010: 7365 2047 482d 3234 3034 205b 7369 6d75  se GH-2404 [simu`);
      }
      return true;
    }
    case "hexedit": {
      const { path, node } = fileAt(t, pathArg);
      if (!node || !path.endsWith("challenge-corrupt.png") || !path.includes("/working-copy/")) {
        print("hexedit: source evidence is read-only; choose /cases/IR-2404/working-copy/challenge-corrupt.png", "err");
        return true;
      }
      node.content = "89 50 4e 47 0d 0a 1a 0a | .PNG.... | repaired in a derived virtual copy\n";
      mark(t, "dfir-hexedit", "dfir-magic-fixed");
      print("Virtual working copy updated at offset 0: 89 50 4e 47. The evidence source is a sandbox copy; no host file was edited.", "ok");
      return true;
    }
    case "exiftool": {
      const { node } = fileAt(t, pathArg);
      if (!node) {
        print(`exiftool: ${pathArg || "missing operand"}: No such file`, "err");
        return true;
      }
      mark(t, "dfir-exif");
      print(`File Name                       : ${pathArg}\nFile Type                       : ${fileType(pathArg || "", node.content || "", t)}\nArtist                          : Unknown\nCase Metadata                   : fictional GH-2404 fixture`);
      if (pathArg?.includes("meme")) mark(t, "dfir-image-meta");
      return true;
    }
    case "reg": {
      if (pos[0] !== "query") {
        print("reg: usage: reg query HIVE_FILE", "err");
        return true;
      }
      const { node } = fileAt(t, pathArg);
      if (!node) {
        print(`reg: ${pathArg || "missing hive"}: No such file`, "err");
        return true;
      }
      mark(t, "dfir-reg-query");
      print((node.content || "").split("\n").filter((line) => /HKCU|DoubleClickSpeed|url1|OneDriveUpdate/.test(line)).join("\n"));
      t.filesRead.push(evidencePath(t, pathArg));
      return true;
    }
    case "lecmd": {
      const { node } = fileAt(t, pathArg);
      if (!node || !pathArg?.toLowerCase().endsWith(".lnk")) {
        print("LECmd: provide a simulated .lnk evidence file", "err");
        return true;
      }
      mark(t, "dfir-lnk");
      print(`LECmd training parser\nSource file: ${pathArg}\n${node.content || ""}`);
      t.filesRead.push(evidencePath(t, pathArg));
      return true;
    }
    case "sqlitebrowser":
    case "sqlite3": {
      const { node } = fileAt(t, pathArg);
      if (!node || !pathArg?.toLowerCase().endsWith(".sqlite")) {
        print(`${cmd}: provide a simulated .sqlite evidence file`, "err");
        return true;
      }
      mark(t, "dfir-browser-db");
      print(node.content || "(empty simulated database)");
      t.filesRead.push(evidencePath(t, pathArg));
      return true;
    }
    case "evtx":
    case "wevtutil":
    case "get-winevent": {
      const { node } = fileAt(t, pathArg);
      if (!node || !pathArg?.toLowerCase().endsWith(".evtx")) {
        print(`${cmd}: provide a simulated .evtx evidence file`, "err");
        return true;
      }
      const idMatch = input.match(/(?:\/q:|eventid\s*=|\bid\s*=)(\d{4})/i);
      const all = node.content || "";
      const selected = idMatch ? all.split("\n").filter((line) => line.includes(idMatch[1])) : all.split("\n");
      mark(t, "dfir-evtx");
      if (idMatch) mark(t, "dfir-evtx-query");
      if (pathArg?.toLowerCase().includes("powershell")) mark(t, "dfir-powershell-log");
      print(selected.join("\n"));
      t.filesRead.push(evidencePath(t, pathArg));
      return true;
    }
    case "oleid":
    case "olevba":
    case "oleobj": {
      const path = pathArg || "";
      if (!path.endsWith(".docm") && !path.endsWith(".pptx")) {
        print(`${cmd}: provide a simulated Office evidence document`, "err");
        return true;
      }
      const doc = getNode(t.fs, resolvePath(t, path));
      if (cmd === "oleid") {
        mark(t, "dfir-oleid");
        print(`Filename: ${path}\nContainer format: OpenXML (training fixture)\nEncrypted: False\nVBA Macros: Yes (static indicator; medium)\nExternal relationships: 1 (review)\nExecution: not performed`);
      } else if (cmd === "olevba") {
        const macroPath = resolvePath(t, "/cases/IR-2404/evidence/03-documents/word/vbaProject.txt");
        const macro = getNode(t.fs, macroPath);
        mark(t, "dfir-olevba");
        print(`Static macro report for ${path}\n${macro?.content || "Macro text unavailable"}`);
      } else {
        mark(t, "dfir-oleobj");
        print(`Embedded-object inventory for ${path}\n1 external relationship found\nExternal template URL is defanged in the case fixture.`);
      }
      if (doc) t.filesRead.push(resolvePath(t, path));
      return true;
    }
    case "zsteg":
    case "steghide": {
      const { node } = fileAt(t, pathArg);
      if (!node || !pathArg?.toLowerCase().match(/\.(png|jpe?g)$/)) {
        print(`${cmd}: provide a simulated image evidence file`, "err");
        return true;
      }
      mark(t, cmd === "zsteg" ? "dfir-zsteg" : "dfir-steghide");
      print(cmd === "zsteg"
        ? "b1,rgb,lsb,xy .. text: \"148: follow the evidence trail\"\nb2,r,lsb,xy .. text: \"FLAG{stego_marker}\"\nTraining output only; no image payload was executed."
        : "Extracted text marker from simulated image: FLAG{stego_marker}\nTraining fixture only.");
      return true;
    }
    case "audio-analyze":
    case "sonic-visualiser":
    case "sonic-visualizer": {
      mark(t, "dfir-audio");
      print("Simulated spectrogram summary\nDuration: 4.2 seconds | Channels: mono\nNarrow-band feature: approximately 1.2 kHz\nDecoded training marker: FLAG{spectral_clue}\nNo audio playback or executable content.");
      return true;
    }
    case "tshark":
    case "tcpdump":
    case "wireshark": {
      const pcapArg = pos.find((value) => value.endsWith(".pcapng")) || "05-network/capture.pcapng";
      const path = resolvePath(t, pcapArg);
      const capture = getNode(t.fs, path);
      if (!capture || capture.type !== "file") {
        print(`${cmd}: ${pcapArg}: No such evidence file`, "err");
        return true;
      }
      const text = capture.content || "";
      if (/export-objects|export objects/i.test(input)) {
        mark(t, "dfir-pcap-export");
        print(`Simulated HTTP object export\nquarterly-export.csv\nSource capture: ${pcapArg}\nSource stream: 7\nObject is a fictional training artifact.`);
      } else if (/follow|tcp\.stream|ascii,7|stream\s+7/i.test(input)) {
        mark(t, "dfir-tcp-stream");
        const stream = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/05-network/tcp-stream-7.txt"));
        print(stream?.content || "Simulated stream unavailable.");
      } else if (/(-z\s+io,phs|hierarchy|protocol-hierarchy)/i.test(input)) {
        mark(t, "dfir-pcap-hierarchy");
        const hierarchy = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/05-network/protocol-hierarchy.txt"));
        print(hierarchy?.content || "Protocol hierarchy unavailable.");
      } else if (/-Y\s+http|http\.request|filter\s+http/i.test(input)) {
        mark(t, "dfir-pcap-http");
        print(text.split("\n").filter((line) => /HTTP|GET|POST|Frame 8|Frame 13|Frame 27/i.test(line)).join("\n"));
      } else if (/ftp/i.test(input)) {
        mark(t, "dfir-pcap-ftp");
        const stream = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/05-network/ftp-stream-2.txt"));
        print(stream?.content || text.split("\n").filter((line) => /FTP/i.test(line)).join("\n"));
      } else {
        mark(t, "dfir-pcap-file");
        print(text);
      }
      return true;
    }
    case "packet":
    case "frame": {
      mark(t, "dfir-packet-detail");
      print("Frame 13 — simulated packet details\nEthernet II | IPv4 | TCP\nSource: 192.0.2.44:51510\nDestination: 198.51.100.20:80\nHTTP: GET /view.php?image=../../etc/passwd\nPayload bytes: [training preview]\nCapture remains unchanged.");
      return true;
    }
    case "tcp.stream":
    case "tcp.stream,ascii": {
      mark(t, "dfir-tcp-stream");
      const stream = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/05-network/tcp-stream-7.txt"));
      print(stream?.content || "Simulated stream unavailable.");
      return true;
    }
    case "ewfacquire":
    case "ftkimager":
    case "memory-acquire": {
      mark(t, cmd === "memory-acquire" ? "dfir-memory-acquire" : "dfir-disk-acquire");
      print(`${cmd} — SAFE SIMULATION\nEvidence source opened read-only.\nWorking copy recorded for case GH-2404.\nIntegrity verification: MATCH (fixture record).\nNo physical disk or host memory was accessed.`);
      return true;
    }
    case "mmls":
    case "fls":
    case "mftecmd": {
      const mft = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/06-disk/$MFT.csv"));
      if (cmd === "mmls") {
        mark(t, "dfir-mmls");
        print("DOS Partition Table\nSlot    Start       End         Length      Description\n00:     0000000000  0000000031  32 sectors  Unallocated\n01:     0000000032  0000032799  32768 sectors NTFS (training image)");
      } else if (cmd === "fls") {
        mark(t, "dfir-fls");
        print("r/r 42: note.txt\nr/r 61: meme.jpeg\nr/r * 57: $Txf (deleted entry)");
      } else {
        mark(t, "dfir-mft");
        print(`MFTECmd simulated timeline parser\n${mft?.content || "MFT fixture unavailable."}`);
      }
      return true;
    }
    case "icat": {
      mark(t, "dfir-icat");
      print("SIMULATED RECOVERED FILE CONTENT\nReview payroll.csv before sharing.\nMarker: FLAG{disk_artifact}\nSource record: 42\n");
      return true;
    }
    case "timeline": {
      const type = (pos[0] || "web").toLowerCase();
      const path = type === "disk"
        ? "/cases/IR-2404/evidence/06-disk/$MFT.csv"
        : type === "memory"
          ? "/cases/IR-2404/evidence/08-memory/pstree.txt"
          : "/cases/IR-2404/evidence/visuals/case-timeline.csv";
      const node = getNode(t.fs, resolvePath(t, path));
      mark(t, `dfir-${type}-timeline`);
      print(`Timeline view: ${type}\n${node?.content || "Timeline fixture unavailable."}`);
      return true;
    }
    case "static-report":
    case "sandbox-report": {
      const { node } = fileAt(t, pathArg || "07-malware/sample.bin");
      if (!node) {
        print(`${cmd}: sample artifact not found`, "err");
        return true;
      }
      if (cmd === "static-report") {
        mark(t, "dfir-static-report");
        print(`Static triage report\n${node.content || ""}\nNo sample execution performed.`);
      } else {
        mark(t, "dfir-sandbox-report");
        const observations = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/07-malware/dynamic-observations.txt"));
        print(`Isolated dynamic-analysis report (fictional)\n${observations?.content || "No observation fixture."}\nNo detonation was run by this terminal.`);
      }
      return true;
    }
    case "cutter-report": {
      mark(t, "dfir-cutter");
      const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/07-malware/cutter-report.txt"));
      print(node?.content || "Synthetic static reverse-engineering summary unavailable.");
      return true;
    }
    case "strace-report": {
      mark(t, "dfir-strace");
      const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/07-malware/strace-report.txt"));
      print(node?.content || "Synthetic syscall trace unavailable.");
      return true;
    }
    case "ltrace-report": {
      mark(t, "dfir-ltrace");
      const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/07-malware/ltrace-report.txt"));
      print(node?.content || "Synthetic library trace unavailable.");
      return true;
    }
    case "vt-report": {
      mark(t, "dfir-reputation");
      const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/07-malware/reputation-report.txt"));
      print(node?.content || "Offline reputation fixture unavailable.");
      return true;
    }
    case "rot13": {
      mark(t, "dfir-rot13");
      print("Encoded marker: Synt{fgngvp_nanlyfvf}\nDecoded marker: Flag{static_analysis}\nThis is a harmless static-analysis exercise string.");
      return true;
    }
    case "volatility":
    case "vol.py":
    case "vol": {
      const argsLower = input.toLowerCase();
      if (/imageinfo/.test(argsLower)) {
        mark(t, "dfir-vol-profile");
        print("Volatility training plugin: imageinfo\nSuggested Profile(s): Win7SP1x64\nArchitecture: x64\nImage time: 2025-04-12 15:04:02 UTC+0000\nProfile is a parser suggestion; validate against other artifacts.");
      } else if (/pstree/.test(argsLower)) {
        mark(t, "dfir-vol-pstree");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/08-memory/pstree.txt"));
        print(node?.content || "Process-tree fixture unavailable.");
      } else if (/pslist/.test(argsLower)) {
        mark(t, "dfir-vol-pslist");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/08-memory/pslist.txt"));
        print(node?.content || "Process-list fixture unavailable.");
      } else if (/netscan/.test(argsLower)) {
        mark(t, "dfir-vol-netscan");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/08-memory/netscan.txt"));
        print(node?.content || "Network-scan fixture unavailable.");
      } else if (/chromehistory|browserhistory|searchhistory/.test(argsLower)) {
        mark(t, "dfir-vol-browser-history");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/08-memory/search-history.txt"));
        print(node?.content || "Memory browser-history fixture unavailable.");
      } else if (/envars/.test(argsLower)) {
        mark(t, "dfir-vol-envars");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/08-memory/envars.txt"));
        print(node?.content || "Environment fixture unavailable.");
      } else if (/clipboard/.test(argsLower)) {
        mark(t, "dfir-vol-clipboard");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/08-memory/clipboard.txt"));
        print(node?.content || "Clipboard fixture unavailable.");
      } else if (/cmdline|cmdscan|consoles/.test(argsLower)) {
        mark(t, "dfir-vol-cmdline");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/08-memory/cmdline.txt"));
        print(node?.content || "Command-line fixture unavailable.");
      } else if (/mspaint|paint/.test(argsLower)) {
        mark(t, "dfir-vol-mspaint");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/08-memory/mspaint-artifact.txt"));
        print(node?.content || "Simulated bitmap artifact unavailable.");
      } else {
        print("Volatility simulated command reference\nPlugins: imageinfo, pslist, pstree, netscan, envars, clipboard, cmdline, chromehistory, mspaint\nNo memory image is parsed by this browser sandbox.");
      }
      return true;
    }
    case "gcore": {
      mark(t, "dfir-gcore");
      writeDerivedFile(t, "/cases/IR-2404/derived/core.2112", "SIMULATED CORE DUMP EXTRACT\nprocess=powershell.exe pid=2112\nMemory string: FLAG{container_memory}\nThis is a text fixture, not a host memory dump.\n");
      print("gcore simulation — target PID 2112\nSaved virtual core fixture to /cases/IR-2404/derived/core.2112\nNo process memory on the analyst host was accessed.");
      return true;
    }
    case "docker": {
      const subcommand = rest.find((value) => !value.startsWith("-")) || "";
      const subject = pos.find((value) => value !== subcommand && !value.startsWith("-")) || "GH-2404";
      if (subcommand === "diff") {
        mark(t, "dfir-docker-diff");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/09-container/container.diff.txt"));
        print(node?.content || "Diff fixture unavailable.");
      } else if (subcommand === "inspect") {
        mark(t, "dfir-docker-inspect");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/09-container/container.inspect.json"));
        print(node?.content || "Inspect fixture unavailable.");
      } else if (subcommand === "logs") {
        mark(t, "dfir-docker-logs");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/09-container/container.log"));
        print(node?.content || "Log fixture unavailable.");
      } else if (subcommand === "history") {
        mark(t, "dfir-docker-history");
        const node = getNode(t.fs, resolvePath(t, "/cases/IR-2404/evidence/09-container/image.history.txt"));
        print(`IMAGE HISTORY — ${subject}\n${node?.content || "History fixture unavailable."}`);
      } else if (subcommand === "export") {
        mark(t, "dfir-docker-export");
        writeDerivedFile(t, "/cases/IR-2404/derived/container-export.tar", "SIMULATED CONTAINER FILESYSTEM EXPORT\nContainer: GH-2404\nAcquired from fictional stopped container.\nImage-layer metadata is not included.\n");
        print(`Container export simulated: ${subject}\nFilesystem snapshot written to /cases/IR-2404/derived/container-export.tar\nImage history and layer metadata are not included.\nNo host container was accessed.`);
      } else {
        print("Docker forensics simulator\nSupported: docker diff | inspect | logs | history | export\nNo Docker daemon is connected.");
      }
      return true;
    }
    case "hash-identifier": {
      mark(t, "dfir-hash-identify");
      print("Hash identifier (training vector)\nPossible type: MD5\nAlternative formats may share the same length; confirm from source context.\nNo online lookup performed.");
      return true;
    }
    case "john":
    case "hashcat": {
      mark(t, cmd === "john" ? "dfir-john" : "dfir-hashcat");
      print(`${cmd} training-only local candidate comparison\n098f6bcd4621d373cade4e832627b4f6 : test\n5f4dcc3b5aa765d61d8327deb882cf99 : password\nOnly fictional classroom hashes were evaluated. No accounts, external services, or real credential stores were accessed.`);
      return true;
    }
    case "hashdeep": {
      mark(t, "dfir-hash-manifest");
      print("Hashdeep manifest simulation\nFiles inventoried: 8\nHash set: recorded in case manifest\nVerification: matching fixture records\n");
      return true;
    }
    case "rainbow-demo": {
      mark(t, "dfir-rainbow-demo");
      print("Rainbow-table classroom simulation\nTarget: unsalted training MD5 vector\nPrecomputed lookup: candidate found in toy table\nSalted variant: no table match (salt changes the digest input)\nNo external hash service or real credential was queried.");
      return true;
    }
    default:
      return false;
  }
}