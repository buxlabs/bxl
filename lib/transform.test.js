import { test } from "node:test";
import { strict as assert } from "node:assert";
import { transformFiles } from "./transform.js";
import sharp from "sharp";
import { mkdir, rm, access, stat, readdir, writeFile } from "fs/promises";
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

test("should transform PDF file to multiple WebP images", async () => {
  const testDir = join(tmpdir(), "bxl-test-pdf-" + Date.now());
  const outputDir = join(testDir, "output");

  await mkdir(testDir, { recursive: true });

  try {
    // Create a minimal valid PDF file with 2 pages
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R 4 0 R]
/Count 2
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 6 0 R
>>
endobj
5 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 700 Td
(Page 1) Tj
ET
endstream
endobj
6 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 700 Td
(Page 2) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
0000000519 00000 n 
0000000612 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
705
%%EOF`;

    const pdfPath = join(testDir, "test.pdf");
    await writeFile(pdfPath, pdfContent, "utf-8");

    await transformFiles(pdfPath, {
      output: outputDir,
      quality: "80",
    });

    // Check that both pages were converted
    const page1Path = join(outputDir, "test-page-1.webp");
    const page2Path = join(outputDir, "test-page-2.webp");

    await access(page1Path);
    await access(page2Path);

    const page1Stats = await stat(page1Path);
    const page2Stats = await stat(page2Path);

    assert(page1Stats.isFile(), "Page 1 WebP file should exist");
    assert(page1Stats.size > 0, "Page 1 WebP file should have content");
    assert(page2Stats.isFile(), "Page 2 WebP file should exist");
    assert(page2Stats.size > 0, "Page 2 WebP file should have content");

    const page1Metadata = await sharp(page1Path).metadata();
    const page2Metadata = await sharp(page2Path).metadata();

    assert.equal(page1Metadata.format, "webp", "Page 1 should be WebP format");
    assert.equal(page2Metadata.format, "webp", "Page 2 should be WebP format");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
