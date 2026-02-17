#!/usr/bin/env bun

import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";

/**
 * Generate folder tree structure
 */
function generateTree(dir: string, prefix = "", lines: string[] = []): string[] {
  const items = readdirSync(dir);

  items.forEach((item, index) => {
    const fullPath = join(dir, item);
    const isLast = index === items.length - 1;
    const stats = statSync(fullPath);

    const connector = isLast ? "└── " : "├── ";
    const line = prefix + connector + item;
    lines.push(line);

    if (stats.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      generateTree(fullPath, newPrefix, lines);
    }
  });

  return lines;
}

/**
 * Show CLI help
 */
function showHelp() {
  console.log(`
saw-it - Folder Tree Viewer

Usage:
  saw-it <folder>

Examples:
  saw-it src
  saw-it src > tree.txt
  saw-it src > folder/tree.txt
`);
}

// ================= CLI =================

const args = process.argv.slice(2);
const folder = args[0];

// Show help
if (!folder || folder === "-h" || folder === "--help") {
  showHelp();
  process.exit(0);
}

// === NEW: check folder exists ===
if (!existsSync(folder)) {
  console.error(`❌ Folder not found: ${folder}`);
  process.exit(1);
}

// Optional: check is directory
try {
  if (!statSync(folder).isDirectory()) {
    console.error(`❌ Not a directory: ${folder}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`❌ Cannot access folder: ${folder}`);
  process.exit(1);
}

// Generate tree output
const lines: string[] = [];
lines.push(folder + "/");
generateTree(folder, "", lines);

const output = lines.join("\n");

/**
 * Output handling:
 * - If stdout is a terminal → print to console
 * - If stdout is redirected → write to file
 */
if (process.stdout.isTTY) {
  console.log(output);
} else {
  const outputPath = (process.stdout as any).path;

  if (outputPath) {
    const dir = dirname(outputPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(outputPath, output);
  }
}
