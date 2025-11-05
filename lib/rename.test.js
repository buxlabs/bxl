import { test } from "node:test";
import { strict as assert } from "node:assert";
import { renameFiles } from "./rename.js";
import { mkdir, rm, writeFile, readdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import sharp from "sharp";

test("should rename files with {index} placeholder", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await writeFile(join(testDir, "image1.png"), "test content");
    await writeFile(join(testDir, "image2.png"), "test content");
    await writeFile(join(testDir, "image3.png"), "test content");

    const result = await renameFiles(testDir, "model_{index}.png");

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

test("should rename files with {index} placeholder and pad index", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-pad-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    for (let i = 1, ilen = 10; i <= ilen; i++) {
      await writeFile(join(testDir, `image${i}.png`), "test content");
    }

    const result = await renameFiles(testDir, "model_{index}.png");

    assert.equal(result.count, 10, "Should rename 10 files");
    assert.equal(result.renamed.length, 10, "Should return 10 renamed files");

    const files = await readdir(testDir);
    assert.equal(files.length, 10, "Should still have 10 files");
    assert(files.includes("model_01.png"), "model_01.png should exist");
    assert(files.includes("model_10.png"), "model_10.png should exist");
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

    const result = await renameFiles(testDir, "image_{index}");

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

    const result = await renameFiles(testDir, "document_{index}.txt");

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
    const result = await renameFiles(testDir, "file_{index}");

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

    const result = await renameFiles(testDir, "item_{index}");

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

    const result = await renameFiles(testDir, "doc_{index}");

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

test("should rename images with {index}, {width} and {height} placeholders", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-dimensions-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Create test images with specific dimensions
    await sharp({
      create: {
        width: 100,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toFile(join(testDir, "image1.png"));

    await sharp({
      create: {
        width: 300,
        height: 150,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .png()
      .toFile(join(testDir, "image2.png"));

    const result = await renameFiles(testDir, "model_{index}_{width}x{height}");

    assert.equal(result.count, 2, "Should rename 2 files");
    assert.equal(result.renamed.length, 2, "Should return 2 renamed files");

    const files = await readdir(testDir);
    assert.equal(files.length, 2, "Should still have 2 files");
    assert(
      files.includes("model_1_100x200.png"),
      "model_1_100x200.png should exist"
    );
    assert(
      files.includes("model_2_300x150.png"),
      "model_2_300x150.png should exist"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should rename images with {width}x{height} only", async () => {
  const testDir = join(
    tmpdir(),
    "bxl-rename-test-dimensions-only-" + Date.now()
  );
  await mkdir(testDir, { recursive: true });

  try {
    // Create test image
    await sharp({
      create: {
        width: 256,
        height: 128,
        channels: 3,
        background: { r: 0, g: 0, b: 255 },
      },
    })
      .png()
      .toFile(join(testDir, "test.png"));

    const result = await renameFiles(testDir, "photo_{width}x{height}");

    assert.equal(result.count, 1, "Should rename 1 file");

    const files = await readdir(testDir);
    assert.equal(files.length, 1, "Should still have 1 file");
    assert(
      files.includes("photo_256x128.png"),
      "photo_256x128.png should exist"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should skip non-image files when pattern requires dimensions", async () => {
  const testDir = join(tmpdir(), "bxl-rename-test-mixed-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Create an image
    await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 3,
        background: { r: 100, g: 100, b: 100 },
      },
    })
      .png()
      .toFile(join(testDir, "image.png"));

    // Create a text file
    await writeFile(join(testDir, "file.txt"), "test content");

    const result = await renameFiles(testDir, "item_{index}_{width}x{height}");

    // Only the image should be renamed
    assert.equal(result.count, 1, "Should rename 1 file (only the image)");

    const files = await readdir(testDir);
    assert.equal(files.length, 2, "Should still have 2 files");
    assert(files.includes("item_1_50x50.png"), "item_1_50x50.png should exist");
    assert(files.includes("file.txt"), "file.txt should remain unchanged");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should preserve extension when pattern has no extension with dimensions", async () => {
  const testDir = join(
    tmpdir(),
    "bxl-rename-test-ext-dimensions-" + Date.now()
  );
  await mkdir(testDir, { recursive: true });

  try {
    // Create images with different extensions
    await sharp({
      create: {
        width: 80,
        height: 60,
        channels: 3,
        background: { r: 255, g: 255, b: 0 },
      },
    })
      .png()
      .toFile(join(testDir, "photo1.png"));

    await sharp({
      create: {
        width: 120,
        height: 90,
        channels: 3,
        background: { r: 255, g: 0, b: 255 },
      },
    })
      .jpeg()
      .toFile(join(testDir, "photo2.jpg"));

    const result = await renameFiles(testDir, "image_{index}_{width}x{height}");

    assert.equal(result.count, 2, "Should rename 2 files");

    const files = await readdir(testDir);
    assert.equal(files.length, 2, "Should still have 2 files");
    // Files are sorted alphabetically: photo1.png comes first, photo2.jpg second
    assert(
      files.includes("image_1_80x60.png"),
      "image_1_80x60.png should exist"
    );
    assert(
      files.includes("image_2_120x90.jpg"),
      "image_2_120x90.jpg should exist"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
