#!/usr/bin/env node

import { Command } from "commander";
import { transformFiles } from "../lib/transform.js";
import { removeFiles } from "../lib/remove.js";
import { renameFiles } from "../lib/rename.js";
import { fetchFile } from "../lib/fetch.js";
import { generateFile } from "../lib/generate.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  await readFile(join(__dirname, "..", "package.json"), "utf-8")
);

const program = new Command();

program.name("bxl").description("CLI toolkit").version(packageJson.version);

// Preprocess arguments to handle "transform <input> to webp" syntax
// Convert: ["transform", "<path>", "to", "webp"] -> ["transform", "to", "webp", "<path>"]
// Convert: ["transform", "<path>", "add", "dimensions"] -> ["transform", "add", "dimensions", "<path>"]
const args = process.argv.slice(2);
if (args.length >= 2 && args[0] === "transform") {
  const input = args[1];
  // Check if second argument is not a known subcommand
  if (input !== "to" && input !== "add" && !input.startsWith("-")) {
    // Reorder: move input to the end
    const restArgs = args.slice(2);
    process.argv = [
      ...process.argv.slice(0, 2),
      "transform",
      ...restArgs,
      input,
    ];
  }
}

// Store the input path for use in nested commands
let transformInput = ".";

const transform = program
  .command("transform")
  .description("Transform operations");

const to = transform.command("to").description("Convert images to format");

to.command("webp [input]")
  .option("-o, --output <dir>", "Output directory", ".")
  .option("-q, --quality <number>", "Quality (0-100)", "100")
  .description("Convert images to webp format")
  .action(async (input = ".", options) => {
    try {
      await transformFiles(input, options);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program
  .command("remove <pattern>")
  .description("Remove files matching the given pattern in current directory")
  .action(async (pattern) => {
    try {
      await removeFiles(pattern);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

const rename = program
  .command("rename <input>")
  .description("Rename files in directory");

rename
  .command("to <pattern>")
  .description("Rename files using pattern with {index} placeholder")
  .action(async (input, pattern) => {
    try {
      const result = await renameFiles(input, pattern);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program
  .command("version")
  .description("Display version information")
  .action(() => {
    console.log(packageJson.version);
  });

program
  .command("fetch <url>")
  .description("Download a file from a URL to the current directory")
  .option("-o, --output <filename>", "Output filename")
  .action(async (url, options) => {
    try {
      const result = await fetchFile(url, options);
      console.log(`Downloaded ${result.filename} (${result.size} bytes)`);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program
  .command("generate <filename>")
  .alias("gen")
  .alias("g")
  .description("Generate a file based on the filename")
  .action(async (filename) => {
    try {
      await generateFile(filename);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
