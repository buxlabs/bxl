#!/usr/bin/env node

import { Command } from "commander";
import { transformImagesToWebp, addDimensionsToImages } from "../lib/transform.js";
import { removeFiles } from "../lib/remove.js";
import { renameFiles } from "../lib/rename.js";

const program = new Command();

program.name("bxl").description("CLI toolkit").version("1.0.0");

const transform = program
  .command("transform")
  .description("Transform operations");

const images = transform
  .command("images")
  .description("Image transformation operations");

const to = images.command("to").description("Convert images to format");

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

const rename = program.command("rename").description("Rename files in directory");

rename
  .command("to <pattern>")
  .description("Rename files using pattern with {index} placeholder")
  .action(async (pattern) => {
    try {
      const result = await renameFiles(pattern);
      console.log(`✓ Renamed ${result.count} file(s)`);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
