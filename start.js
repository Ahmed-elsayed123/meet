#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting Video Call Application...");

// Check if we're in development mode
const isDev =
  process.env.NODE_ENV === "development" || process.argv.includes("--dev");

// Set default port
const port = process.env.PORT || 3000;

// Set environment variables
process.env.PORT = port;

console.log(`📡 Server will run on port ${port}`);
console.log(`🔧 Mode: ${isDev ? "Development" : "Production"}`);

// Start the server
const serverProcess = spawn("node", ["server.js"], {
  stdio: "inherit",
  env: process.env,
});

// Handle server process events
serverProcess.on("error", (error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

serverProcess.on("close", (code) => {
  console.log(`\n🛑 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  serverProcess.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  serverProcess.kill("SIGTERM");
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  serverProcess.kill();
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  serverProcess.kill();
  process.exit(1);
});
