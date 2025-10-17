import { test } from "node:test";
import { strict as assert } from "node:assert";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test("should display version with --version flag", async () => {
  const { stdout } = await execAsync("node bin/cli.js --version", {
    cwd: join(__dirname, ".."),
  });
  const packageJson = JSON.parse(
    await readFile(join(__dirname, "..", "package.json"), "utf-8")
  );
  assert.equal(stdout.trim(), packageJson.version, "Should show package.json version");
});

test("should display version with version command", async () => {
  const { stdout } = await execAsync("node bin/cli.js version", {
    cwd: join(__dirname, ".."),
  });
  const packageJson = JSON.parse(
    await readFile(join(__dirname, "..", "package.json"), "utf-8")
  );
  assert.equal(stdout.trim(), packageJson.version, "Should show package.json version");
});

test("version command and --version flag should output same version", async () => {
  const { stdout: versionFlag } = await execAsync("node bin/cli.js --version", {
    cwd: join(__dirname, ".."),
  });
  const { stdout: versionCommand } = await execAsync("node bin/cli.js version", {
    cwd: join(__dirname, ".."),
  });
  assert.equal(
    versionFlag.trim(),
    versionCommand.trim(),
    "Both commands should output the same version"
  );
});
