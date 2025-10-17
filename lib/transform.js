import sharp from "sharp";
import { readdir, stat, mkdir } from "fs/promises";
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
  ".svg",
  ".webp",
];

export async function transformImagesToWebp(input, options) {
  const { output, quality } = options;
  const qualityNum = parseInt(quality, 10);

  const inputStat = await stat(input);

  if (inputStat.isFile()) {
    await convertFile(input, output, qualityNum);
  } else if (inputStat.isDirectory()) {
    await convertDirectory(input, output, qualityNum);
  }
}

async function convertFile(filePath, outputDir, quality) {
  const ext = extname(filePath).toLowerCase();

  if (!IMAGE_EXTENSIONS.includes(ext)) {
    return;
  }

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const fileName = basename(filePath, ext);
  const outputPath = join(outputDir, `${fileName}.webp`);

  try {
    await sharp(filePath).webp({ quality }).toFile(outputPath);
  } catch (error) {
    console.error(`✗ Failed to convert ${filePath}:`, error.message);
  }
}

async function convertDirectory(dirPath, outputDir, quality) {
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const files = await readdir(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      const ext = extname(file).toLowerCase();

      if (IMAGE_EXTENSIONS.includes(ext)) {
        const fileName = basename(file, ext);
        const outputPath = join(outputDir, `${fileName}.webp`);

        try {
          await sharp(filePath).webp({ quality }).toFile(outputPath);
        } catch (error) {
          console.error(`✗ Failed to convert ${filePath}:`, error.message);
        }
      }
    }
  }
}

export async function addDimensionsToImages(input) {
  const inputStat = await stat(input);

  if (inputStat.isFile()) {
    await addDimensionsToFile(input);
  } else if (inputStat.isDirectory()) {
    await addDimensionsToDirectory(input);
  }
}

async function addDimensionsToFile(filePath) {
  const ext = extname(filePath).toLowerCase();

  if (!IMAGE_EXTENSIONS.includes(ext)) {
    return;
  }

  try {
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;
    
    const dir = dirname(filePath);
    const fileName = basename(filePath, ext);
    const outputPath = join(dir, `${fileName}_${width}x${height}${ext}`);

    await sharp(filePath).toFile(outputPath);
  } catch (error) {
    console.error(`✗ Failed to process ${filePath}:`, error.message);
  }
}

async function addDimensionsToDirectory(dirPath) {
  const files = await readdir(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      const ext = extname(file).toLowerCase();

      if (IMAGE_EXTENSIONS.includes(ext)) {
        try {
          const metadata = await sharp(filePath).metadata();
          const { width, height } = metadata;
          
          const fileName = basename(file, ext);
          const outputPath = join(dirPath, `${fileName}_${width}x${height}${ext}`);

          await sharp(filePath).toFile(outputPath);
        } catch (error) {
          console.error(`✗ Failed to process ${filePath}:`, error.message);
        }
      }
    }
  }
}
