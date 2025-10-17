import { test } from "node:test";
import { strict as assert } from "node:assert";
import { renameFiles } from "./rename.js";
import { mkdir, rm, writeFile, readdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

test("should rename files with {index} placeholder", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "image1.png"), "test content");
    await writeFile(join(testDir, "image2.png"), "test content");
    await writeFile(join(testDir, "image3.png"), "test content");

    const result = await renameFiles("model_{index}.png", { directory: testDir });

    assert.equal(result.count, 3, "Should rename 3 files");
    assert.equal(result.renamed.length, 3, "Should return 3 renamed files");

    const files = await readdir(testDir);
    assert.equal(files.length, 3, "Should still have 3 files");
    assert(files.includes("model_1.png"), "model_1.png should exist");
    assert(files.includes("model_2.png"), "model_2.png should exist");
    assert(files.includes("model_3.png"), "model_3.png should exist");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should preserve extension when pattern has no extension", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-ext-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "photo1.jpg"), "test content");
    await writeFile(join(testDir, "photo2.png"), "test content");
    await writeFile(join(testDir, "photo3.gif"), "test content");

    const result = await renameFiles("image_{index}", { directory: testDir });

    assert.equal(result.count, 3, "Should rename 3 files");

    const files = await readdir(testDir);
    assert.equal(files.length, 3, "Should still have 3 files");
    assert(files.includes("image_1.jpg"), "image_1.jpg should exist");
    assert(files.includes("image_2.png"), "image_2.png should exist");
    assert(files.includes("image_3.gif"), "image_3.gif should exist");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle pattern with extension", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-with-ext-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "file1.txt"), "test content");
    await writeFile(join(testDir, "file2.txt"), "test content");

    const result = await renameFiles("document_{index}.txt", { directory: testDir });

    assert.equal(result.count, 2, "Should rename 2 files");

    const files = await readdir(testDir);
    assert.equal(files.length, 2, "Should still have 2 files");
    assert(files.includes("document_1.txt"), "document_1.txt should exist");
    assert(files.includes("document_2.txt"), "document_2.txt should exist");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle empty directory", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-empty-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const result = await renameFiles("file_{index}", { directory: testDir });

    assert.equal(result.count, 0, "Should rename 0 files");
    assert.deepEqual(result.renamed, [], "Should return empty array");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should rename files in alphabetical order", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-order-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "zebra.txt"), "test content");
    await writeFile(join(testDir, "apple.txt"), "test content");
    await writeFile(join(testDir, "banana.txt"), "test content");

    const result = await renameFiles("item_{index}", { directory: testDir });

    assert.equal(result.count, 3, "Should rename 3 files");
    
    // Files should be renamed in alphabetical order
    assert.equal(result.renamed[0].from, "apple.txt");
    assert.equal(result.renamed[0].to, "item_1.txt");
    assert.equal(result.renamed[1].from, "banana.txt");
    assert.equal(result.renamed[1].to, "item_2.txt");
    assert.equal(result.renamed[2].from, "zebra.txt");
    assert.equal(result.renamed[2].to, "item_3.txt");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should skip hidden files", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-hidden-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "file1.txt"), "test content");
    await writeFile(join(testDir, ".hidden"), "test content");
    await writeFile(join(testDir, "file2.txt"), "test content");

    const result = await renameFiles("doc_{index}", { directory: testDir });

    assert.equal(result.count, 2, "Should rename 2 files (excluding hidden)");

    const files = await readdir(testDir);
    assert.equal(files.length, 3, "Should still have 3 files");
    assert(files.includes(".hidden"), "Hidden file should remain unchanged");
    assert(files.includes("doc_1.txt"), "doc_1.txt should exist");
    assert(files.includes("doc_2.txt"), "doc_2.txt should exist");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
