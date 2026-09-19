import { spawn } from "node:child_process";

const processes = [
  {
    name: "api",
    command: "server.js",
  },
  {
    name: "worker",
    command: "src/workers/resumeAnalysis.worker.js",
  },
];

let shuttingDown = false;

const children = processes.map(({ name, command }) => {
  const child = spawn(process.execPath, [command], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    console.log(
      `[${name}] exited${signal ? ` with signal ${signal}` : ` with code ${code}`}`,
    );

    if (!shuttingDown) {
      shutdown(`process:${name}`);
    }
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start:`, error);
    shutdown(`error:${name}`);
  });

  return child;
});

const shutdown = (reason) => {
  if (shuttingDown) return;

  shuttingDown = true;
  console.log(`[start-prod] Shutting down (${reason})...`);

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    process.exit(0);
  }, 5000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
