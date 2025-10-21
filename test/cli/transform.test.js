import { test } from "node:test";
import { strict as assert } from "node:assert";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, mkdir, rm } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test("it transforms images to webp with the shorter syntax", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await execAsync(`node ../../../bin/cli.js transform . to webp -q 40`, {
      cwd: join(__dirname, "../fixtures/transform-001"),
    });
    const pngFile = await readFile(
      join(__dirname, "../fixtures/transform-001", "example.png")
    );
    const webpFile = await readFile(
      join(__dirname, "../fixtures/transform-001", "example.webp")
    );
    assert.ok(pngFile.length > 0, "Original PNG file should not be empty");
    assert.ok(webpFile.length > 0, "WebP file should be created and not empty");
    assert.ok(
      webpFile.length < pngFile.length,
      "WebP file should be smaller than PNG file"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("it transforms images to webp with the longer syntax", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await execAsync(`node ../../../bin/cli.js transform to webp -q 40`, {
      cwd: join(__dirname, "../fixtures/transform-002"),
    });
    const pngFile = await readFile(
      join(__dirname, "../fixtures/transform-002", "example.png")
    );
    const webpFile = await readFile(
      join(__dirname, "../fixtures/transform-002", "example.webp")
    );
    assert.ok(pngFile.length > 0, "Original PNG file should not be empty");
    assert.ok(webpFile.length > 0, "WebP file should be created and not empty");
    assert.ok(
      webpFile.length < pngFile.length,
      "WebP file should be smaller than PNG file"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
