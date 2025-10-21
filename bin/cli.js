#!/usr/bin/env node

import { Command } from "commander";
import {
  transformImagesToWebp,
  addDimensionsToImages,
} from "../lib/transform.js";
import { removeFiles } from "../lib/remove.js";
import { renameFiles } from "../lib/rename.js";
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
      await transformImagesToWebp(input, options);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

const images = transform
  .command("images")
  .description("Image transformation operations");

const add = images.command("add").description("Add metadata to images");

add
  .command("dimensions [input]")
  .description("Add image dimensions to filename")
  .action(async (input = ".") => {
    try {
      await addDimensionsToImages(input);
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
  .command("rename")
  .description("Rename files in directory");

rename
  .command("to <pattern>")
  .description("Rename files using pattern with {index} placeholder")
  .action(async (pattern) => {
    try {
      const result = await renameFiles(pattern);
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

program.parse();
