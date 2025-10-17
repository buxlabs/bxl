import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { existsSync } from 'fs';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.tif', '.bmp', '.svg', '.webp'];

export async function transformImagesToWebp(input, options) {
  const { output, quality } = options;
  const qualityNum = parseInt(quality, 10);

  console.log(`Converting images to webp...`);
  console.log(`Input: ${input}`);
  console.log(`Output: ${output}`);
  console.log(`Quality: ${qualityNum}`);

  const inputStat = await stat(input);

  if (inputStat.isFile()) {
    await convertFile(input, output, qualityNum);
  } else if (inputStat.isDirectory()) {
    await convertDirectory(input, output, qualityNum);
  }

  console.log('Conversion complete!');
}

async function convertFile(filePath, outputDir, quality) {
  const ext = extname(filePath).toLowerCase();
  
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    console.log(`Skipping ${filePath} (not an image file)`);
    return;
  }

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const fileName = basename(filePath, ext);
  const outputPath = join(outputDir, `${fileName}.webp`);

  try {
    await sharp(filePath)
      .webp({ quality })
      .toFile(outputPath);
    
    console.log(`✓ Converted: ${filePath} → ${outputPath}`);
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
          await sharp(filePath)
            .webp({ quality })
            .toFile(outputPath);
          
          console.log(`✓ Converted: ${filePath} → ${outputPath}`);
        } catch (error) {
          console.error(`✗ Failed to convert ${filePath}:`, error.message);
        }
      }
    }
  }
}
