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

test("should remove duplicate files using unique command", async () => {
  const fixtureDir = join(__dirname, "..", "fixtures", "unique-001");
  const testDir = join(tmpdir(), "bxl-unique-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Copy fixture files into the test directory
    await copyFile(
      join(fixtureDir, "test_150x100_1.jpg"),
      join(testDir, "test_150x100_1.jpg")
    );
    await copyFile(
      join(fixtureDir, "test_150x100_2.jpg"),
      join(testDir, "test_150x100_2.jpg")
    );

    // Run the CLI unique command
    await execAsync(`node ${join(__dirname, "../../bin/cli.js")} unique`, {
      cwd: testDir,
    });

    const files = await readdir(testDir);
    // After removing duplicates only one file should remain
    assert.equal(
      files.length,
      1,
      "Should have exactly 1 file after deduplication"
    );

    // Ensure the remaining file is one of the originals
    const remaining = files[0];
    assert.ok(
      remaining === "test_150x100_1.jpg" || remaining === "test_150x100_2.jpg",
      "Remaining file should be one of the fixture files"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
