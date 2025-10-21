import { test } from "node:test";
import { strict as assert } from "node:assert";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, mkdir, rm, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test("should display help for fetch command", async () => {
  const { stdout } = await execAsync("node ../../bin/cli.js fetch --help", {
    cwd: __dirname,
  });
  assert.ok(
    stdout.includes("Download a file from a URL"),
    "Should show fetch command help"
  );
  assert.ok(stdout.includes("--output"), "Should show output option");
});

test.skip("should fetch a file from a data URL", async () => {
  const testDir = join(tmpdir(), "bxl-fetch-cli-test-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const dataUrl = "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=="; // "Hello, World!"
    const { stdout } = await execAsync(
      `node ${join(
        __dirname,
        "../../bin/cli.js"
      )} fetch "${dataUrl}" -o downloaded.txt`,
      {
        cwd: testDir,
      }
    );

    assert.ok(stdout.includes("Downloaded"), "Should show success message");
    assert.ok(stdout.includes("downloaded.txt"), "Should show filename");

    const files = await readdir(testDir);
    assert.ok(files.includes("downloaded.txt"), "File should exist");

    const content = await readFile(join(testDir, "downloaded.txt"), "utf-8");
    assert.equal(content, "Hello, World!", "Should have correct content");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test.skip("should fetch without custom output filename", async () => {
  const testDir = join(tmpdir(), "bxl-fetch-cli-test-no-output-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    const dataUrl = "data:text/plain;base64,VGVzdCBjb250ZW50"; // "Test content"
    const { stdout } = await execAsync(
      `node ${join(__dirname, "../../bin/cli.js")} fetch "${dataUrl}"`,
      {
        cwd: testDir,
      }
    );

    assert.ok(stdout.includes("Downloaded"), "Should show success message");

    const files = await readdir(testDir);
    assert.equal(files.length, 1, "Should create one file");
  } finally {
    await rm(testDir, { recursive: true, force: true });
  }
});

test("should handle invalid URL error", async () => {
  const testDir = join(tmpdir(), "bxl-fetch-cli-test-error-" + Date.now());
  await mkdir(testDir, { recursive: true });

  try {
    await assert.rejects(
      async () => {
        await execAsync(
          `node ${join(__dirname, "../../bin/cli.js")} fetch "not-a-valid-url"`,
          {
            cwd: testDir,
          }
        );
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
