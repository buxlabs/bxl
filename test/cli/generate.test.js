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

test("should display help for generate command", async () => {
  const { stdout } = await execAsync("node ../../bin/cli.js generate --help", {
    cwd: __dirname,
  });
  assert.ok(
    stdout.includes("Generate a file based on the filename"),
    "Should show generate command help"
  );
  assert.ok(stdout.includes("filename"), "Should show filename argument");
});

test("should generate PNG image with correct dimensions", async () => {
  const testDir = join(tmpdir(), "bxl-generate-cli-test-png-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate placeholder_300x200.png`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(
      files.includes("placeholder_300x200.png"),
      "PNG file should exist"
    );

    const buffer = await readFile(join(testDir, "placeholder_300x200.png"));
    const metadata = await sharp(buffer).metadata();
    assert.strictEqual(metadata.width, 300, "Width should be 300px");
    assert.strictEqual(metadata.height, 200, "Height should be 200px");
    assert.strictEqual(metadata.format, "png", "Format should be PNG");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should generate JPEG image with correct dimensions", async () => {
  const testDir = join(tmpdir(), "bxl-generate-cli-test-jpeg-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const { stdout } = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate banner_400x300.jpg`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(files.includes("banner_400x300.jpg"), "JPEG file should exist");

    const buffer = await readFile(join(testDir, "banner_400x300.jpg"));
    const metadata = await sharp(buffer).metadata();
    assert.strictEqual(metadata.width, 400, "Width should be 400px");
    assert.strictEqual(metadata.height, 300, "Height should be 300px");
    assert.strictEqual(metadata.format, "jpeg", "Format should be JPEG");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should generate WebP image with correct dimensions", async () => {
  const testDir = join(tmpdir(), "bxl-generate-cli-test-webp-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate avatar_150x150.webp`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(files.includes("avatar_150x150.webp"), "WebP file should exist");

    const buffer = await readFile(join(testDir, "avatar_150x150.webp"));
    const metadata = await sharp(buffer).metadata();
    assert.strictEqual(metadata.width, 150, "Width should be 150px");
    assert.strictEqual(metadata.height, 150, "Height should be 150px");
    assert.strictEqual(metadata.format, "webp", "Format should be WebP");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should work with gen alias", async () => {
  const testDir = join(tmpdir(), "bxl-generate-cli-test-alias-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const { stdout } = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} gen test_100x100.png`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(
      files.includes("test_100x100.png"),
      "PNG file should exist with gen alias"
    );

    const buffer = await readFile(join(testDir, "test_100x100.png"));
    const metadata = await sharp(buffer).metadata();
    assert.strictEqual(metadata.width, 100, "Width should be 100px");
    assert.strictEqual(metadata.height, 100, "Height should be 100px");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should work with g alias", async () => {
  const testDir = join(tmpdir(), "bxl-generate-cli-test-g-alias-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const { stdout } = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} g square_200x200.webp`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(
      files.includes("square_200x200.webp"),
      "WebP file should exist with g alias"
    );

    const buffer = await readFile(join(testDir, "square_200x200.webp"));
    const metadata = await sharp(buffer).metadata();
    assert.strictEqual(metadata.width, 200, "Width should be 200px");
    assert.strictEqual(metadata.height, 200, "Height should be 200px");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle invalid filename format", async () => {
  const testDir = join(tmpdir(), "bxl-generate-cli-test-invalid-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const result = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate invalid.png`,
      {
        cwd: testDir,
      }
    ).catch((error) => error);

    assert.ok(result.stderr || result.stdout, "Should show error message");
    assert.ok(
      (result.stderr || result.stdout).includes("dimensions") ||
        (result.stderr || result.stdout).includes("format"),
      "Error should mention dimensions or format"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle unsupported file format", async () => {
  const testDir = join(
    tmpdir(),
    "bxl-generate-cli-test-unsupported-" + Date.now()
  );
  await mkdir(testDir, { recursive: true });

  try {
    const result = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate test_100x100.bmp`,
      {
        cwd: testDir,
      }
    ).catch((error) => error);

    assert.ok(result.stderr || result.stdout, "Should show error message");
    assert.ok(
      (result.stderr || result.stdout).includes("Unsupported") ||
        (result.stderr || result.stdout).includes("format"),
      "Error should mention unsupported format"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should generate large image dimensions", async () => {
  const testDir = join(tmpdir(), "bxl-generate-cli-test-large-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const { stdout } = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} generate hero_1920x1080.jpg`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(
      files.includes("hero_1920x1080.jpg"),
      "Large JPEG file should exist"
    );

    const buffer = await readFile(join(testDir, "hero_1920x1080.jpg"));
    const metadata = await sharp(buffer).metadata();
    assert.strictEqual(metadata.width, 1920, "Width should be 1920px");
    assert.strictEqual(metadata.height, 1080, "Height should be 1080px");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should generate multiple files in sequence", async () => {
  const testDir = join(
    tmpdir(),
    "bxl-generate-cli-test-multiple-" + Date.now()
  );
  await mkdir(testDir, { recursive: true });

  try {
    // Generate first image
    await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate thumbnail_100x100.png`,
      {
        cwd: testDir,
      }
    );

    // Generate second image
    await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} generate banner_800x200.webp`,
      {
        cwd: testDir,
      }
    );

    const files = await readdir(testDir);
    assert.ok(
      files.includes("thumbnail_100x100.png"),
      "First image should exist"
    );
    assert.ok(
      files.includes("banner_800x200.webp"),
      "Second image should exist"
    );

    // Verify first image
    const buffer1 = await readFile(join(testDir, "thumbnail_100x100.png"));
    const metadata1 = await sharp(buffer1).metadata();
    assert.strictEqual(
      metadata1.width,
      100,
      "First image width should be 100px"
    );
    assert.strictEqual(
      metadata1.height,
      100,
      "First image height should be 100px"
    );

    // Verify second image
    const buffer2 = await readFile(join(testDir, "banner_800x200.webp"));
    const metadata2 = await sharp(buffer2).metadata();
    assert.strictEqual(
      metadata2.width,
      800,
      "Second image width should be 800px"
    );
    assert.strictEqual(
      metadata2.height,
      200,
      "Second image height should be 200px"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
