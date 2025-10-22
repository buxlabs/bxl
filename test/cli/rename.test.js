import { test } from "node:test";
import { strict as assert } from "node:assert";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, mkdir, rm, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { existsSync } from "fs";
import sharp from "sharp";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test("should display help for rename command", async () => {
  const { stdout } = await execAsync("node ../../bin/cli.js rename --help", {
    cwd: __dirname,
  });
  assert.ok(
    stdout.includes("Rename files using pattern"),
    "Should show rename command help"
  );
  assert.ok(stdout.includes("{index}"), "Should mention index placeholder");
});

test("should display help for rename to command", async () => {
  const { stdout } = await execAsync("node ../../bin/cli.js --help", {
    cwd: __dirname,
  });
  assert.ok(
    stdout.includes("rename"),
    "Should show rename command in main help"
  );
});

test("should rename files using simple index pattern", async () => {
  const testDir = join(tmpdir(), "bxl-rename-index-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Generate test files with known dimensions
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate file1_300x200.png`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate file2_150x100.jpg`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate file3_400x300.webp`,
      { cwd: testDir }
    );

    const { stdout } = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} rename . to "item_{index}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    files.sort();

    assert.ok(files.includes("item_1.png"), "Should rename to item_1.png");
    assert.ok(files.includes("item_2.jpg"), "Should rename to item_2.jpg");
    assert.ok(files.includes("item_3.webp"), "Should rename to item_3.webp");
    assert.equal(files.length, 3, "Should have exactly 3 files");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should rename files using model_{index}_{width}x{height} pattern", async () => {
  const testDir = join(tmpdir(), "bxl-rename-model-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Generate test files with known dimensions
    await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate original1_300x200.png`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate original2_150x100.jpg`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate original3_400x300.webp`,
      { cwd: testDir }
    );

    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "model_{index}_{width}x{height}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    files.sort();

    // Verify the files exist with correct naming pattern
    assert.ok(
      files.includes("model_1_300x200.png"),
      "Should rename to model_1_300x200.png"
    );
    assert.ok(
      files.includes("model_2_150x100.jpg"),
      "Should rename to model_2_150x100.jpg"
    );
    assert.ok(
      files.includes("model_3_400x300.webp"),
      "Should rename to model_3_400x300.webp"
    );
    assert.equal(files.length, 3, "Should have exactly 3 files");

    // Verify the images still have correct dimensions
    const img1 = await sharp(join(testDir, "model_1_300x200.png")).metadata();
    const img2 = await sharp(join(testDir, "model_2_150x100.jpg")).metadata();
    const img3 = await sharp(join(testDir, "model_3_400x300.webp")).metadata();

    assert.equal(img1.width, 300, "First image should be 300px wide");
    assert.equal(img1.height, 200, "First image should be 200px tall");
    assert.equal(img2.width, 150, "Second image should be 150px wide");
    assert.equal(img2.height, 100, "Second image should be 100px tall");
    assert.equal(img3.width, 400, "Third image should be 400px wide");
    assert.equal(img3.height, 300, "Third image should be 300px tall");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle mixed image and non-image files with dimension pattern", async () => {
  const testDir = join(tmpdir(), "bxl-rename-mixed-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Generate test image files
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate image1_300x200.png`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate image2_150x100.jpg`,
      { cwd: testDir }
    );

    // Create a non-image file
    await import("fs/promises").then((fs) =>
      fs.writeFile(join(testDir, "document.txt"), "This is not an image")
    );

    const result = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "model_{index}_{width}x{height}"`,
      {
        cwd: testDir,
      }
    ).catch((err) => err);

    const files = await readdir(testDir);
    files.sort();

    // Only image files should be renamed (alphabetical order: document.txt, image1.png, image2.jpg)
    // But only images are renamed, so we get model_1 for image1 and model_2 for image2
    assert.ok(files.includes("model_1_300x200.png"), "Should rename image1");
    assert.ok(files.includes("model_2_150x100.jpg"), "Should rename image2");
    assert.ok(
      files.includes("document.txt"),
      "Should keep non-image file unchanged"
    );
    assert.equal(files.length, 3, "Should have exactly 3 files");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should preserve file extensions when pattern doesn't include extension", async () => {
  const testDir = join(tmpdir(), "bxl-rename-extensions-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate image_300x200.png`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate photo_150x100.jpg`,
      { cwd: testDir }
    );

    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "renamed_{index}_{width}x{height}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    files.sort();

    assert.ok(
      files.includes("renamed_1_300x200.png"),
      "Should preserve .png extension"
    );
    assert.ok(
      files.includes("renamed_2_150x100.jpg"),
      "Should preserve .jpg extension"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle pattern with explicit extension", async () => {
  const testDir = join(tmpdir(), "bxl-rename-explicit-ext-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate image_300x200.png`,
      { cwd: testDir }
    );

    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "model_{index}_{width}x{height}.png"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(
      files.includes("model_1_300x200.png"),
      "Should use pattern extension"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle empty directory gracefully", async () => {
  const testDir = join(tmpdir(), "bxl-rename-empty-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "model_{index}_{width}x{height}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.equal(files.length, 0, "Should remain empty");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should skip hidden files", async () => {
  const testDir = join(tmpdir(), "bxl-rename-hidden-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Generate test files
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate hidden_300x200.png`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate visible_150x100.jpg`,
      { cwd: testDir }
    );

    // Move the regular file to make it hidden
    await import("fs/promises").then((fs) =>
      fs.rename(
        join(testDir, "hidden_300x200.png"),
        join(testDir, ".hidden.png")
      )
    );

    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "model_{index}_{width}x{height}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    files.sort();

    assert.ok(
      files.includes(".hidden.png"),
      "Should keep hidden file unchanged"
    );
    assert.ok(
      files.includes("model_1_150x100.jpg"),
      "Should rename visible file"
    );
    assert.equal(files.length, 2, "Should have exactly 2 files");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should maintain consistent ordering", async () => {
  const testDir = join(tmpdir(), "bxl-rename-ordering-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Generate files in specific order
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate zebra_300x200.png`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate alpha_150x100.jpg`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate beta_400x300.webp`,
      { cwd: testDir }
    );

    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "model_{index}_{width}x{height}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    files.sort();

    // Files should be renamed in alphabetical order
    assert.ok(
      files.includes("model_1_150x100.jpg"),
      "alpha.jpg should become model_1"
    );
    assert.ok(
      files.includes("model_2_400x300.webp"),
      "beta.webp should become model_2"
    );
    assert.ok(
      files.includes("model_3_300x200.png"),
      "zebra.png should become model_3"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle large image dimensions", async () => {
  const testDir = join(tmpdir(), "bxl-rename-large-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Generate a large image
    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate large_1920x1080.jpg`,
      {
        cwd: testDir,
      }
    );

    const { stdout: renameOutput } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "model_{index}_{width}x{height}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(
      files.includes("model_1_1920x1080.jpg"),
      "Should handle large dimensions"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should work with different image formats", async () => {
  const testDir = join(tmpdir(), "bxl-rename-formats-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Generate images in different formats
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate test_100x100.png`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate test_200x150.jpg`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate test_300x250.webp`,
      { cwd: testDir }
    );

    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} rename . to "model_{index}_{width}x{height}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    files.sort();

    assert.ok(
      files.includes("model_1_100x100.png"),
      "Should handle PNG format"
    );
    assert.ok(
      files.includes("model_2_200x150.jpg"),
      "Should handle JPEG format"
    );
    assert.ok(
      files.includes("model_3_300x250.webp"),
      "Should handle WebP format"
    );
    assert.equal(files.length, 3, "Should have all 3 images renamed");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should rename files using shorthand syntax", async () => {
  const testDir = join(tmpdir(), "bxl-rename-model-index-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Generate test files with various names
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate file1_300x200.png`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate file2_150x100.jpg`,
      { cwd: testDir }
    );
    await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate file3_400x300.webp`,
      { cwd: testDir }
    );

    const { stdout } = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} rename to "model_{index}"`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    files.sort();

    assert.ok(files.includes("model_1.png"), "Should rename to model_1.png");
    assert.ok(files.includes("model_2.jpg"), "Should rename to model_2.jpg");
    assert.ok(files.includes("model_3.webp"), "Should rename to model_3.webp");
    assert.equal(files.length, 3, "Should have exactly 3 files");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
