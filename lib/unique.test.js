import { test } from "node:test";
import { strict as assert } from "node:assert";
import { uniqueFiles } from "./unique.js";
import { mkdir, rm, writeFile, readdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

test("should remove duplicate files in a directory", async () => {
  const testDir = join(tmpdir(), "bxl-unique-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  // Save current working directory to restore later
  const originalCwd = process.cwd();

  try {
    // Create two files with identical content and one with different content
    await writeFile(join(testDir, "a-1.jpg"), "duplicate content");
    await writeFile(join(testDir, "a-2.jpg"), "duplicate content");
    await writeFile(join(testDir, "b.jpg"), "unique content");

    // Change working directory to the test dir so uniqueFiles uses it
    process.chdir(testDir);

    await uniqueFiles();

    const files = await readdir(testDir);

    // Should only have two files: one of the duplicates removed and the unique file
    assert.equal(files.length, 2, "Should have 2 files after deduplication");
    assert(files.includes("b.jpg"), "Unique file should remain");

    // Ensure at least one of the duplicate names still exists (one removed)
    const duplicateExists = files.some((f) => f.startsWith("a-"));
    assert(duplicateExists, "One of the duplicate files should remain");
  } finally {
    // Restore working directory and cleanup
    process.chdir(originalCwd);
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should do nothing when there are no duplicates", async () => {
  const testDir = join(tmpdir(), "bxl-unique-test-nodup-" + Date.now());
  await mkdir(testDir, { recursive: true });

  const originalCwd = process.cwd();

  try {
    await writeFile(join(testDir, "one.jpg"), "one");
    await writeFile(join(testDir, "two.jpg"), "two");

    process.chdir(testDir);

    await uniqueFiles();

    const files = await readdir(testDir);
    assert.equal(
      files.length,
      2,
      "No files should be removed when there are no duplicates"
    );
    assert(files.includes("one.jpg") && files.includes("two.jpg"));
  } finally {
    process.chdir(originalCwd);
    await rm(testDir, { recursive: true, force: true });
  }
});
