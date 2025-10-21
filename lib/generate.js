import { writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";

function getDimensionsFromFilename(filename) {
  const [name] = filename.split(".");
  if (!name.includes("_") || !name.includes("x"))
    return { width: null, height: null };
  const parts = name.split("_");
  const last = parts[parts.length - 1];
  const [width, height] = last.split("x").map(Number);
  return { width, height };
}

export async function generateFile(filename, options = {}) {
  const directory = options.directory || ".";

  const { width, height } = getDimensionsFromFilename(filename);

  if (width === null || height === null) {
    throw new Error(
      "Filename must include dimensions in the format name_{width}x{height}.ext (e.g., placeholder_300x300.webp)"
    );
  }

  try {
    // Validate URL

    // Ensure directory exists
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true });
    }

    const outputPath = resolve(join(directory, filename));

    const content = "";
    // Write to file
    await writeFile(outputPath, content);

    return { filename, path: outputPath, size: content.length };
  } catch (error) {
    throw error;
  }
}
