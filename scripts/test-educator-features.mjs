import assert from "node:assert/strict";
import { createServer } from "vite";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
};

const server = await createServer({
  configFile: false,
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  db.resetAll();
  const educator = db.allEducators()[0];
  const seededTeams = db.teamsForEducator(educator.id);
  assert.equal(seededTeams.length, 2, "the demo cohort should have two research teams");

  const seededRequest = db.pendingTeamApplications(educator.id)[0];
  assert.ok(seededRequest, "the demo cohort includes a pending team application");
  assert.equal(db.reviewTeamApplication(educator.id, seededRequest.application.id, true), true);
  assert.equal(db.teamForPlayer(seededRequest.player.id)?.id, seededRequest.team.id);
  assert.equal(db.pendingTeamApplications(educator.id).length, 0);

  const applicant = db.establishAuthenticatedUser("analyst@ionio.gr", "Analyst One");
  const newTeam = db.createTeam(educator.id, "Forensic Review", "Evidence triage and peer review.");
  assert.ok(newTeam, "educators can create a team");
  const applicationResult = db.applyForTeam(applicant.id, newTeam.id);
  assert.equal(applicationResult.ok, true);
  assert.equal(db.pendingTeamApplications(educator.id).length, 1);
  assert.equal(db.applyForTeam(applicant.id, seededTeams[0].id).ok, false, "a player can have only one pending request");
  const newRequest = db.pendingTeamApplications(educator.id)[0];
  assert.equal(db.reviewTeamApplication(educator.id, newRequest.application.id, true), true);
  assert.equal(db.teamForPlayer(applicant.id)?.id, newTeam.id);
  assert.ok(db.teamMembers(newTeam.id).some((member) => member.id === applicant.id));

  const withdrawalUser = db.establishAuthenticatedUser("withdraw@ionio.gr", "Withdrawal Test");
  const withdrawResult = db.applyForTeam(withdrawalUser.id, seededTeams[0].id);
  assert.equal(withdrawResult.ok, true);
  assert.equal(db.withdrawTeamApplication(withdrawalUser.id, withdrawResult.application.id), true);
  assert.equal(db.pendingTeamApplications(educator.id).length, 0);

  const metricsBefore = applicant.metrics.commandsRun;
  db.recordCommand(applicant.id, { pasted: true, typo: false }, {
    command: "sshpass -p demo-secret ssh analyst@lab",
    campaignId: "gamehack",
    moduleId: "linux-basics",
    cwd: "/home/analyst",
    exitCode: 0,
    output: "Connected to the simulated lab.",
  });
  const logged = db.commandExecutions(applicant.id)[0];
  assert.equal(applicant.metrics.commandsRun, metricsBefore + 1);
  assert.equal(logged.pasted, true);
  assert.match(logged.command, /\[REDACTED\]/);
  assert.doesNotMatch(logged.command, /demo-secret/);
  assert.equal(logged.output, "Connected to the simulated lab.");
  assert.equal(logged.exitCode, 0);

  db.recordCommand(applicant.id, { pasted: false, typo: true }, {
    command: "--token=private-token cat /home/analyst/notes.txt",
    campaignId: "gamehack",
    moduleId: "linux-basics",
    cwd: "/home/analyst",
    exitCode: 127,
    output: "x".repeat(2600),
  });
  const truncated = db.commandExecutions(applicant.id)[0];
  assert.match(truncated.command, /\[REDACTED\]/);
  assert.equal(truncated.typo, true);
  assert.equal(truncated.output.length, 2400);
  assert.equal(truncated.outputTruncated, true);

  const reloaded = JSON.parse(values.get("gamehack.platform.v1"));
  assert.ok(Array.isArray(reloaded.teams));
  assert.ok(Array.isArray(reloaded.teamApplications));
  assert.equal(reloaded.commandLog.length, 2, "command audit records persist with the learning database");

  reloaded.users[0].activeCampaignId = "forge";
  reloaded.users[0].avatar = "ic:terminal:#ff6a2b";
  reloaded.commandLog[0].campaignId = "forge";
  const packetTeam = reloaded.teams.find((team) => team.name === "Packet Ops");
  assert.ok(packetTeam);
  packetTeam.name = "Packet Forge";
  reloaded.feed.push({ id: "legacy-path", ts: Date.now(), userId: reloaded.users[0].id, username: "legacy", kind: "module", text: "Legacy path", campaignId: "forge" });
  db.resetAll();
  values.set("hackforge.platform.v1", JSON.stringify(reloaded));
  const migrated = db.getDB();
  assert.equal(migrated.users[0].activeCampaignId, "gamehack", "legacy campaign IDs should migrate without resetting player progress");
  assert.equal(migrated.users[0].avatar, "ic:terminal:#06b6d4", "the old brand accent should migrate to the cyan palette");
  assert.equal(migrated.commandLog[0].campaignId, "gamehack");
  assert.equal(migrated.feed.at(-1).campaignId, "gamehack");
  assert.ok(migrated.teams.some((team) => team.name === "Packet Ops"), "the legacy demo-team name should be rebranded");
  assert.ok(values.has("gamehack.platform.v1"), "the migrated database should be saved under the GameHack key");
  assert.ok(!values.has("hackforge.platform.v1"), "the legacy storage key should be retired after migration");
  console.log("Educator analytics and GameHack storage-migration checks passed: teams, applications, approvals, audit masking, and saved path continuity.");
} finally {
  await server.close();
}
