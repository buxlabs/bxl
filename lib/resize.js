import sharp from "sharp";
import { readdir, stat, mkdir, writeFile, rm } from "fs/promises";
import { join, extname, basename, dirname } from "path";
import { existsSync } from "fs";

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".tiff",
  ".tif",
  ".bmp",
  ".webp",
];

export async function resizeFiles(size) {
  const dir = process.cwd();
  const files = await readdir(dir);
  let count = 0;

  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      const extension = extname(filePath).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(extension)) {
        const metadata = await sharp(filePath).metadata();
        let width, height;
        if (size === "1/2") {
          width = Math.round(metadata.width / 2);
          height = Math.round(metadata.height / 2);
        }
        const buffer = await sharp(filePath)
          .resize({
            width,
            height,
          })
          .toBuffer();

        const hasMetadataInPath = filePath.includes(
          `_${metadata.width}x${metadata.height}.`
        );

        const newFilePath = hasMetadataInPath
          ? filePath.replace(
              `_${metadata.width}x${metadata.height}.`,
              `_${width}x${height}.`
            )
          : filePath;

        await writeFile(newFilePath, buffer);

        if (hasMetadataInPath) {
          await rm(filePath);
        }

        count++;
      }
    }
  }

  return {
    count,
  };
}
