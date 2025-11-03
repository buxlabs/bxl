import { test } from "node:test";
import { strict as assert } from "node:assert";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, mkdir, rm, readdir, copyFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test("should resize files with width x height using resize command", async () => {
  const fixtureDir = join(__dirname, "..", "fixtures", "resize-001");
  const testDir = join(tmpdir(), "bxl-resize-001-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Copy fixture files into the test directory
    await copyFile(
      join(fixtureDir, "test_150x100.jpg"),
      join(testDir, "test_150x100.jpg")
    );

    // Run the CLI resize command
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} resize "1/2"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    // After removing duplicates only one file should remain
    assert.equal(files.length, 1, "Should have exactly 1 file after resize");

    // Ensure the remaining file is one of the originals
    const remaining = files[0];
    assert.ok(
      remaining === "test_75x50.jpg",
      "Remaining file should be resized"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should resize files without width x height using resize command", async () => {
  const fixtureDir = join(__dirname, "..", "fixtures", "resize-002");
  const testDir = join(tmpdir(), "bxl-resize-002-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Copy fixture files into the test directory
    await copyFile(join(fixtureDir, "test.jpg"), join(testDir, "test.jpg"));

    // Run the CLI resize command
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} resize "1/2"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    // After removing duplicates only one file should remain
    assert.equal(files.length, 1, "Should have exactly 1 file after resize");

    // Ensure the remaining file is one of the originals
    const remaining = files[0];
    assert.ok(remaining === "test.jpg", "Remaining file should be resized");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should resize webp files using resize command", async () => {
  const fixtureDir = join(__dirname, "..", "fixtures", "resize-003");
  const testDir = join(tmpdir(), "bxl-resize-003-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Copy fixture files into the test directory
    await copyFile(
      join(fixtureDir, "example.webp"),
      join(testDir, "example.webp")
    );

    // Run the CLI resize command
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} resize "1/2"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    // After removing duplicates only one file should remain
    assert.equal(files.length, 1, "Should have exactly 1 file after resize");

    // Ensure the remaining file is one of the originals
    const remaining = files[0];
    assert.ok(remaining === "example.webp", "Remaining file should be resized");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should resize files with odd dimensions and round them using resize command", async () => {
  const fixtureDir = join(__dirname, "..", "fixtures", "resize-004");
  const testDir = join(tmpdir(), "bxl-resize-004-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Copy fixture files into the test directory
    await copyFile(
      join(fixtureDir, "test_99x99.jpg"),
      join(testDir, "test_99x99.jpg")
    );

    // Run the CLI resize command
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} resize "1/2"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    // After removing duplicates only one file should remain
    assert.equal(files.length, 1, "Should have exactly 1 file after resize");

    // Ensure the remaining file is one of the originals
    const remaining = files[0];
    assert.ok(
      remaining === "test_50x50.jpg",
      "Remaining file should be resized"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
