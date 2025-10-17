import { test } from "node:test";
import { strict as assert } from "node:assert";
import { removeFiles } from "./remove.js";
import { mkdir, rm, writeFile, access, readdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

test("should remove files matching pattern *.png", async () => {
  const testDir = join(tmpdir(), "bxl-remove-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "image1.png"), "test content");
    await writeFile(join(testDir, "image2.png"), "test content");
    await writeFile(join(testDir, "image3.jpg"), "test content");
    await writeFile(join(testDir, "document.txt"), "test content");

    const result = await removeFiles("*.png", { directory: testDir });

    assert.equal(result.count, 2, "Should remove 2 PNG files");
    assert.deepEqual(
      result.removed.sort(),
      ["image1.png", "image2.png"],
      "Should return removed file names"
    );

    const files = await readdir(testDir);
    assert.equal(files.length, 2, "Should have 2 files remaining");
    assert(files.includes("image3.jpg"), "JPG file should remain");
    assert(files.includes("document.txt"), "TXT file should remain");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should remove files matching pattern *.jpg", async () => {
  const testDir = join(tmpdir(), "bxl-remove-test-jpg-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "photo1.jpg"), "test content");
    await writeFile(join(testDir, "photo2.jpg"), "test content");
    await writeFile(join(testDir, "image.png"), "test content");

    const result = await removeFiles("*.jpg", { directory: testDir });

    assert.equal(result.count, 2, "Should remove 2 JPG files");
    assert.deepEqual(
      result.removed.sort(),
      ["photo1.jpg", "photo2.jpg"],
      "Should return removed file names"
    );

    const files = await readdir(testDir);
    assert.equal(files.length, 1, "Should have 1 file remaining");
    assert(files.includes("image.png"), "PNG file should remain");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle case when no files match pattern", async () => {
  const testDir = join(tmpdir(), "bxl-remove-test-nomatch-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "file1.txt"), "test content");
    await writeFile(join(testDir, "file2.doc"), "test content");

    const result = await removeFiles("*.png", { directory: testDir });

    assert.equal(result.count, 0, "Should remove 0 files");
    assert.deepEqual(result.removed, [], "Should return empty array");

    const files = await readdir(testDir);
    assert.equal(files.length, 2, "All files should remain");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should match files with specific names", async () => {
  const testDir = join(tmpdir(), "bxl-remove-test-specific-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "test.png"), "test content");
    await writeFile(join(testDir, "production.png"), "test content");
    await writeFile(join(testDir, "testing.png"), "test content");

    const result = await removeFiles("test*.png", { directory: testDir });

    assert.equal(result.count, 2, "Should remove 2 files");
    assert.deepEqual(
      result.removed.sort(),
      ["test.png", "testing.png"],
      "Should remove files starting with 'test'"
    );

    const files = await readdir(testDir);
    assert.equal(files.length, 1, "Should have 1 file remaining");
    assert(files.includes("production.png"), "production.png should remain");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
