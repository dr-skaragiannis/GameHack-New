import { spawn } from "node:child_process";

try {
  process.loadEnvFile(".env");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const children = [
  spawn(process.execPath, ["server/index.mjs"], {
    stdio: "inherit",
    env: {
      ...process.env,
      API_PORT: process.env.API_PORT || "3001",
      HOST: process.env.API_HOST || "127.0.0.1",
      NODE_ENV: "development",
    },
  }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "0.0.0.0"], {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "development" },
  }),
];

let shuttingDown = false;
function stop(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 100);
}

for (const child of children) {
  child.on("error", (error) => {
    console.error("Could not start a development process:", error);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!shuttingDown) stop(code || 0);
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
