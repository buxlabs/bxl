import { test } from "node:test";
import { strict as assert } from "node:assert";
import { transformImagesToWebp, addDimensionsToImages } from "./transform.js";
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

    await transformImagesToWebp(inputDir, {
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

test("should add dimensions to image filenames in directory", async () => {
  const testDir = join(tmpdir(), "bxl-test-dimensions-dir-" + Date.now());
  const inputDir = join(testDir, "input");

  await mkdir(inputDir, { recursive: true });

  try {
    const images = [
      { name: "red-image.jpg", color: { r: 255, g: 0, b: 0 }, width: 50, height: 50 },
      { name: "green-image.png", color: { r: 0, g: 255, b: 0 }, width: 100, height: 75 },
      { name: "blue-image.jpg", color: { r: 0, g: 0, b: 255 }, width: 200, height: 150 },
    ];

    for (const img of images) {
      const inputImagePath = join(inputDir, img.name);
      await sharp({
        create: {
          width: img.width,
          height: img.height,
          channels: 3,
          background: img.color,
        },
      })
        .jpeg({ quality: 80 })
        .toFile(inputImagePath);
    }

    await addDimensionsToImages(inputDir);

    for (const img of images) {
      const ext = img.name.substring(img.name.lastIndexOf('.'));
      const baseName = img.name.substring(0, img.name.lastIndexOf('.'));
      const dimensionedName = `${baseName}_${img.width}x${img.height}${ext}`;
      const outputImagePath = join(inputDir, dimensionedName);

      await access(outputImagePath);

      const outputStats = await stat(outputImagePath);
      assert(outputStats.isFile(), `Output file ${dimensionedName} should exist`);
      assert(
        outputStats.size > 0,
        `Output file ${dimensionedName} should have content`
      );

      const metadata = await sharp(outputImagePath).metadata();
      assert.equal(metadata.width, img.width, `${dimensionedName} width should match`);
      assert.equal(
        metadata.height,
        img.height,
        `${dimensionedName} height should match`
      );
    }

    const files = await readdir(inputDir);
    assert.equal(files.length, 6, "Should have original 3 files plus 3 new files with dimensions");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should add dimensions to a single image file", async () => {
  const testDir = join(tmpdir(), "bxl-test-dimensions-file-" + Date.now());

  await mkdir(testDir, { recursive: true });

  try {
    const imageName = "test-image.jpg";
    const imageWidth = 120;
    const imageHeight = 80;
    const inputImagePath = join(testDir, imageName);
    
    await sharp({
      create: {
        width: imageWidth,
        height: imageHeight,
        channels: 3,
        background: { r: 128, g: 128, b: 128 },
      },
    })
      .jpeg({ quality: 80 })
      .toFile(inputImagePath);

    await addDimensionsToImages(inputImagePath);

    const dimensionedName = `test-image_${imageWidth}x${imageHeight}.jpg`;
    const outputImagePath = join(testDir, dimensionedName);

    await access(outputImagePath);

    const outputStats = await stat(outputImagePath);
    assert(outputStats.isFile(), `Output file ${dimensionedName} should exist`);

    const metadata = await sharp(outputImagePath).metadata();
    assert.equal(metadata.width, imageWidth, "Width should match");
    assert.equal(metadata.height, imageHeight, "Height should match");

    const files = await readdir(testDir);
    assert.equal(files.length, 2, "Should have original file plus new file with dimensions");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
