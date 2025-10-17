#!/usr/bin/env node

import { Command } from "commander";
import { transformImagesToWebp } from "../lib/transform.js";

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

program.parse();
