import { readdir, rename as fsRename } from "fs/promises";
import { join, extname, basename } from "path";
import sharp from "sharp";

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".tiff",
  ".tif",
  ".bmp",
  ".svg",
  ".webp",
];

export async function renameFiles(input, pattern) {
  const directory = input || ".";

  try {
    const files = await readdir(directory);

    // Filter out directories and hidden files
    const filesOnly = [];
    for (const file of files) {
      if (!file.startsWith(".")) {
        filesOnly.push(file);
      }
    }

    if (filesOnly.length === 0) {
      return { renamed: [], count: 0 };
    }

    // Sort files for consistent ordering
    filesOnly.sort();

    // Check if pattern requires image dimensions
    const needsDimensions =
      pattern.includes("{width}") || pattern.includes("{height}");

    const renamed = [];
    let currentIndex = 1;

    const ilen = filesOnly.length;
    const padLength = String(ilen).length;
    for (let i = 0; i < ilen; i++) {
      const file = filesOnly[i];
      const filePath = join(directory, file);
      const ext = extname(file);

      // Replace placeholders in the pattern
      let newName = pattern.replace(
        /{index}/g,
        String(currentIndex).padStart(padLength, "0")
      );

      // Handle width and height placeholders
      if (needsDimensions) {
        const isImage = IMAGE_EXTENSIONS.includes(ext.toLowerCase());

        if (isImage) {
          try {
            const metadata = await sharp(filePath).metadata();
            const { width, height } = metadata;
            newName = newName.replace(/{width}/g, String(width));
            newName = newName.replace(/{height}/g, String(height));
          } catch (error) {
            console.error(
              `✗ Failed to get dimensions for ${file}:`,
              error.message
            );
            continue;
          }
        } else {
          // Skip non-image files if pattern requires dimensions
          console.error(`✗ Skipping ${file}: not an image file`);
          continue;
        }
      }

      // If the pattern doesn't include an extension, preserve the original extension
      if (!extname(newName)) {
        newName += ext;
      }

      const newPath = join(directory, newName);

      try {
        await fsRename(filePath, newPath);
        renamed.push({ from: file, to: newName });
        currentIndex++;
      } catch (error) {
        console.error(`✗ Failed to rename ${file}:`, error.message);
      }
    }

    return { renamed, count: renamed.length };
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
}
