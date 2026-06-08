#!/usr/bin/env node
/**
 * Stdio-to-HTTP proxy for Google Stitch MCP.
 * Strips outputSchema from tools/list so Cursor accepts the payload
 * (~41KB vs ~287KB raw). See Cursor forum workaround for Stitch MCP.
 */

import { createInterface } from "readline";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { request } from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STITCH_URL = "https://stitch.googleapis.com/mcp";

function loadEnvFile() {
  const envPath = join(__dirname, "..", ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const API_KEY = process.env.STITCH_API_KEY;

if (!API_KEY) {
  process.stderr.write(
    "STITCH_API_KEY is required. Set it in .env or your shell environment.\n"
  );
  process.exit(1);
}

function postToStitch(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsed = new URL(STITCH_URL);
    const req = request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          "X-Goog-Api-Key": API_KEY,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}\n${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function stripOutputSchema(response) {
  if (response?.result?.tools && Array.isArray(response.result.tools)) {
    response.result.tools = response.result.tools.map(({ outputSchema, ...rest }) => rest);
  }
  return response;
}

const rl = createInterface({ input: process.stdin, terminal: false });

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return;
  }

  if (msg.id === undefined) {
    postToStitch(msg).catch(() => {});
    return;
  }

  try {
    let response = await postToStitch(msg);
    if (msg.method === "tools/list") {
      response = stripOutputSchema(response);
    }
    process.stdout.write(JSON.stringify(response) + "\n");
  } catch (err) {
    process.stdout.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: msg.id,
        error: { code: -32603, message: String(err.message) },
      }) + "\n"
    );
  }
});
