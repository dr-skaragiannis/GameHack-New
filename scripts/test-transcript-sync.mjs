import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

/**
 * sawOutput() reads the transcript and the command log as a pair: it walks the
 * transcript and takes ran[i] for the i-th prompt. Saving trimmed the two with
 * independent limits, so once the transcript was long enough the pairing
 * shifted and output-based objectives silently stopped completing - the player
 * ran the right command, saw the right output, and the box stayed unticked.
 * Reverting the lab "fixed" it only because that reset both lists.
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const term = await server.ssrLoadModule("/src/lib/terminal.ts");
  const playerTerminal = await server.ssrLoadModule("/src/lib/playerTerminal.ts");
  const lessons = await server.ssrLoadModule("/src/data/lessons.ts");

  const module = lessons.LEARNING_PATHS.flatMap((path) => path.modules).find((item) => item.id === "sr-help");
  assert.ok(module, "the sr-help lab exists");
  const vol = module.tasks.find((task) => task.id === "vol");
  assert.ok(vol, "the volatility objective exists");

  const scenario = module.scenario || "lab";
  const terminal = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(terminal, "sr-help", scenario);

  term.runCommand(terminal, "volatility --help");
  assert.equal(vol.check(terminal), true, "the objective completes on a fresh terminal");

  // Enough verbose output to push the transcript past its saved limit while the
  // command count stays far below its own.
  for (let i = 0; i < 120; i += 1) term.runCommand(terminal, "cat /etc/ettercap/etter.dns");

  playerTerminal.savePlayerTerminal("alignment-probe", terminal);
  const restored = playerTerminal.loadPlayerTerminal("alignment-probe");
  playerTerminal.activateTerminalForModule(restored, "sr-help", scenario);

  const prompts = restored.lines.filter((line) => line.kind === "in").length;
  assert.equal(
    prompts,
    restored.ran.length,
    `the transcript kept ${prompts} prompts but the command log kept ${restored.ran.length} entries, so every output check reads the wrong pairing`,
  );

  // The original command scrolled out of the saved transcript, so the player
  // runs it again - and it has to count this time.
  term.runCommand(restored, "volatility --help");
  assert.equal(vol.check(restored), true, "re-running the command after a reload completes the objective");

  console.log("Transcript sync checks passed: the saved transcript and the command log stay prompt-for-prompt aligned, so output-based objectives keep completing after a reload instead of only after the lab is reverted.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await server.close();
}
