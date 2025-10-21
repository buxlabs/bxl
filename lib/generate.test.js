import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { generateFile } from "./generate.js";
import { existsSync } from "fs";
import { unlink, rmdir, readFile, readdir, mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import sharp from "sharp";

describe("generateFile", () => {
  test("should generate PNG image with correct dimensions", async () => {
    const testDir = join(tmpdir(), "bxl-generate-test-" + Date.now());
    await mkdir(testDir, { recursive: true });

    try {
      const filename = "test_300x200.png";
      const result = await generateFile(filename, { directory: testDir });

      assert.strictEqual(result.filename, filename);
      assert(result.path.includes(filename));
      assert(result.size > 0);
      assert(existsSync(result.path));

      // Verify image properties
      const buffer = await readFile(result.path);
      const metadata = await sharp(buffer).metadata();
      assert.strictEqual(metadata.width, 300);
      assert.strictEqual(metadata.height, 200);
      assert.strictEqual(metadata.format, "png");
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test("should generate JPEG image with correct dimensions", async () => {
    const testDir = join(tmpdir(), "bxl-generate-test-jpeg-" + Date.now());
    await mkdir(testDir, { recursive: true });

    try {
      const filename = "placeholder_400x300.jpg";
      const result = await generateFile(filename, { directory: testDir });

      assert.strictEqual(result.filename, filename);
      assert(existsSync(result.path));

      const buffer = await readFile(result.path);
      const metadata = await sharp(buffer).metadata();
      assert.strictEqual(metadata.width, 400);
      assert.strictEqual(metadata.height, 300);
      assert.strictEqual(metadata.format, "jpeg");
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test("should generate WebP image with correct dimensions", async () => {
    const testDir = join(tmpdir(), "bxl-generate-test-webp-" + Date.now());
    await mkdir(testDir, { recursive: true });

    try {
      const filename = "image_150x150.webp";
      const result = await generateFile(filename, { directory: testDir });

      const buffer = await readFile(result.path);
      const metadata = await sharp(buffer).metadata();
      assert.strictEqual(metadata.width, 150);
      assert.strictEqual(metadata.height, 150);
      assert.strictEqual(metadata.format, "webp");
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test("should create directory if it does not exist", async () => {
    const testDir = join(tmpdir(), "bxl-generate-test-mkdir-" + Date.now());

    try {
      const filename = "test_100x100.png";

      assert.strictEqual(existsSync(testDir), false);

      const result = await generateFile(filename, { directory: testDir });

      assert(existsSync(testDir));
      assert(existsSync(result.path));
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test("should use current directory when no directory option provided", async () => {
    const filename = "default_50x50.png";

    try {
      const result = await generateFile(filename);

      assert.strictEqual(result.path, join(process.cwd(), filename));
      assert(existsSync(result.path));
    } finally {
      await unlink(join(process.cwd(), filename));
    }
  });

  test("should throw error for invalid filename without dimensions", async () => {
    await assert.rejects(generateFile("invalid.png"), {
      name: "Error",
      message: /Filename must include dimensions in the format/,
    });
  });

  test("should throw error for filename with invalid dimension format", async () => {
    await assert.rejects(generateFile("test_invalid.png"), {
      name: "Error",
      message: /Filename must include dimensions in the format/,
    });
  });

  test("should throw error for unsupported image format", async () => {
    const testDir = join(tmpdir(), "bxl-generate-test-error-" + Date.now());

    try {
      await assert.rejects(
        generateFile("test_100x100.gif", { directory: testDir }),
        {
          name: "Error",
          message: /Unsupported image format: gif/,
        }
      );
    } finally {
      await rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  test("should handle complex filenames with underscores", async () => {
    const testDir = join(tmpdir(), "bxl-generate-test-complex-" + Date.now());
    await mkdir(testDir, { recursive: true });

    try {
      const filename = "my_complex_image_name_250x250.png";
      const result = await generateFile(filename, { directory: testDir });

      const buffer = await readFile(result.path);
      const metadata = await sharp(buffer).metadata();
      assert.strictEqual(metadata.width, 250);
      assert.strictEqual(metadata.height, 250);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test("should handle large dimensions", async () => {
    const testDir = join(tmpdir(), "bxl-generate-test-large-" + Date.now());
    await mkdir(testDir, { recursive: true });

    try {
      const filename = "large_1920x1080.png";
      const result = await generateFile(filename, { directory: testDir });

      const buffer = await readFile(result.path);
      const metadata = await sharp(buffer).metadata();
      assert.strictEqual(metadata.width, 1920);
      assert.strictEqual(metadata.height, 1080);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test("should handle square images", async () => {
    const testDir = join(tmpdir(), "bxl-generate-test-square-" + Date.now());
    await mkdir(testDir, { recursive: true });

    try {
      const filename = "square_500x500.webp";
      const result = await generateFile(filename, { directory: testDir });

      const buffer = await readFile(result.path);
      const metadata = await sharp(buffer).metadata();
      assert.strictEqual(metadata.width, 500);
      assert.strictEqual(metadata.height, 500);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});
