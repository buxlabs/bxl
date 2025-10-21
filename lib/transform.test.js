import { test } from "node:test";
import { strict as assert } from "node:assert";
import { transformFiles } from "./transform.js";
import sharp from "sharp";
import { mkdir, rm, access, stat, readdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

test("should transform directory of images from JPG to WebP", async () => {
  const testDir = join(tmpdir(), "bxl-test-dir-" + Date.now());
  const inputDir = join(testDir, "input");
  const outputDir = join(testDir, "output");

  await mkdir(inputDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  try {
    const images = [
      { name: "red-image.jpg", color: { r: 255, g: 0, b: 0 } },
      { name: "green-image.jpg", color: { r: 0, g: 255, b: 0 } },
      { name: "blue-image.jpg", color: { r: 0, g: 0, b: 255 } },
    ];

    for (const img of images) {
      const inputImagePath = join(inputDir, img.name);
      await sharp({
        create: {
          width: 50,
          height: 50,
          channels: 3,
          background: img.color,
        },
      })
        .jpeg({ quality: 80 })
        .toFile(inputImagePath);
    }

    await transformFiles(inputDir, {
      output: outputDir,
      quality: "70",
    });

    for (const img of images) {
      const webpName = img.name.replace(".jpg", ".webp");
      const outputImagePath = join(outputDir, webpName);

      await access(outputImagePath);

      const outputStats = await stat(outputImagePath);
      assert(outputStats.isFile(), `Output WebP file ${webpName} should exist`);
      assert(
        outputStats.size > 0,
        `Output WebP file ${webpName} should have content`
      );

      const metadata = await sharp(outputImagePath).metadata();
      assert.equal(
        metadata.format,
        "webp",
        `${webpName} should be WebP format`
      );
      assert.equal(metadata.width, 50, `${webpName} width should be preserved`);
      assert.equal(
        metadata.height,
        50,
        `${webpName} height should be preserved`
      );
    }
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
