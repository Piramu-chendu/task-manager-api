import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const TOKEN = process.env["GITHUB_PERSONAL_ACCESS_TOKEN"];
const OWNER = "Piramu-chendu";
const REPO = "task-manager-api";
const BASE = "https://api.github.com";

if (!TOKEN) throw new Error("GITHUB_PERSONAL_ACCESS_TOKEN not set");

const headers = {
  Authorization: `token ${TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
  "User-Agent": "task-manager-pusher",
};

const EXCLUDE_DIRS = [
  "node_modules", ".git", "dist", ".cache", ".local",
  "artifacts/mockup-sandbox",
];
const EXCLUDE_EXT = [".map", ".tsbuildinfo", ".lock"];
const EXCLUDE_FILES = ["pnpm-lock.yaml", ".npmrc"];

function shouldExclude(relPath: string): boolean {
  if (EXCLUDE_FILES.includes(relPath.split("/").pop()!)) return true;
  if (EXCLUDE_DIRS.some(ex => relPath.startsWith(ex + "/") || relPath.includes("/" + ex + "/"))) return true;
  if (EXCLUDE_EXT.some(ext => relPath.endsWith(ext))) return true;
  return false;
}

function walkDir(dir: string, root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(root, full);
    if (EXCLUDE_DIRS.some(ex => entry === ex)) continue;
    if (statSync(full).isDirectory()) {
      files.push(...walkDir(full, root));
    } else {
      if (!shouldExclude(rel)) files.push(full);
    }
  }
  return files;
}

async function upsertFile(path: string, content: string) {
  // Check if file exists to get its sha (needed for updates)
  const checkRes = await fetch(`${BASE}/repos/${OWNER}/${REPO}/contents/${path}`, { headers });
  const checkJson: any = checkRes.ok ? await checkRes.json() : null;

  const body: any = {
    message: `add: ${path}`,
    content,
  };
  if (checkJson?.sha) body.sha = checkJson.sha;

  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err: any = await res.json();
    throw new Error(`Failed to upload ${path}: ${err.message}`);
  }
}

async function main() {
  const root = "/home/runner/workspace";
  const files = walkDir(root, root);
  console.log(`Found ${files.length} files to push\n`);

  let uploaded = 0;
  let failed = 0;

  for (const filePath of files) {
    const relPath = relative(root, filePath);
    try {
      const buf = readFileSync(filePath);
      const base64Content = buf.toString("base64");
      await upsertFile(relPath, base64Content);
      process.stdout.write(`✓ ${relPath}\n`);
      uploaded++;
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    } catch (err: any) {
      console.log(`✗ SKIP ${relPath}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Done! Uploaded ${uploaded} files, skipped ${failed}`);
  console.log(`📦 Repository: https://github.com/${OWNER}/${REPO}`);
}

main().catch(err => { console.error("Error:", err.message); process.exit(1); });
