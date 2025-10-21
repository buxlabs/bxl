import { test } from "node:test";
import { strict as assert } from "node:assert";
import { fetchFile } from "./fetch.js";
import { mkdir, rm, readFile, readdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

// Mock server setup for testing
// We'll use a simple approach with local file URLs for basic testing

test("should fetch a file from a URL", async () => {
  const testDir = join(tmpdir(), "bxl-fetch-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    // Test with a real public URL (a small test image or file)
    // Using a data URL for testing purposes
    const dataUrl = "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=="; // "Hello, World!"

    const result = await fetchFile(dataUrl, { directory: testDir });

    assert.ok(result.filename, "Should return a filename");
    assert.ok(result.path, "Should return a path");
    assert.ok(result.size > 0, "Should have a size");

    const files = await readdir(testDir);
    assert.equal(files.length, 1, "Should create one file");

    const content = await readFile(result.path, "utf-8");
    assert.equal(content, "Hello, World!", "Should have correct content");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should use custom output filename", async () => {
  const testDir = join(tmpdir(), "bxl-fetch-test-custom-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const dataUrl = "data:text/plain;base64,VGVzdA=="; // "Test"

    const result = await fetchFile(dataUrl, {
      directory: testDir,
      output: "custom-name.txt",
    });

    assert.equal(
      result.filename,
      "custom-name.txt",
      "Should use custom filename"
    );

    const files = await readdir(testDir);
    assert.ok(
      files.includes("custom-name.txt"),
      "File should exist with custom name"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should create directory if it doesn't exist", async () => {
  const testDir = join(
    tmpdir(),
    "bxl-fetch-test-mkdir-" + Date.now(),
    "subdir"
  );

  try {
    const dataUrl = "data:text/plain;base64,VGVzdA=="; // "Test"

    const result = await fetchFile(dataUrl, { directory: testDir });

    assert.ok(
      result.path.includes(testDir),
      "Should create file in specified directory"
    );

    const content = await readFile(result.path, "utf-8");
    assert.equal(content, "Test", "Should have correct content");
  } finally {
    await rm(join(tmpdir(), "bxl-fetch-test-mkdir-" + Date.now()), {
      recursive: true,
      force: true,
    });
  }
});

test("should handle invalid URL", async () => {
  const testDir = join(tmpdir(), "bxl-fetch-test-invalid-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await assert.rejects(
      async () => {
        await fetchFile("not-a-valid-url", { directory: testDir });
      },
      {
        message: /Invalid URL/,
      },
      "Should throw error for invalid URL"
    );
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});
