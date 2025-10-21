import { writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

function getMetadataFromFilename(filename) {
  const [name, extension] = filename.split(".");
  if (!name.includes("_") || !name.includes("x"))
    return { width: null, height: null };
  const parts = name.split("_");
  const last = parts[parts.length - 1];
  const [width, height] = last.split("x").map(Number);
  return { width, height, name, extension };
}

export async function generateFile(filename, options = {}) {
  const directory = options.directory || ".";

  const { width, height, extension, name } = getMetadataFromFilename(filename);

  if (width === null || height === null) {
    throw new Error(
      "Filename must include dimensions in the format name_{width}x{height}.ext (e.g., placeholder_300x300.webp)"
    );
  }

  try {
    // Ensure directory exists
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true });
    }

    const outputPath = resolve(join(directory, filename));

    const content = await generateImageContent({ width, height, extension });
    await writeFile(outputPath, content);

    return { filename, path: outputPath, size: content.length };
  } catch (error) {
    throw error;
  }
}

async function generateImageContent({ width, height, extension, ...options }) {
  const backgroundColor = options.backgroundColor || "#f0f0f0";

  const fontSize = Math.min(width, height) / 8;
  const textColor = options.textColor || "#666666";

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" 
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
        ${width}×${height}
      </text>
    </svg>
  `;

  let sharpInstance = sharp(Buffer.from(svg)).resize(width, height);

  // Convert to requested format
  switch (extension.toLowerCase()) {
    case "png":
      return await sharpInstance.png().toBuffer();
    case "jpg":
    case "jpeg":
      return await sharpInstance.jpeg().toBuffer();
    case "webp":
      return await sharpInstance.webp().toBuffer();
    default:
      throw new Error(`Unsupported image format: ${extension}`);
  }
}
