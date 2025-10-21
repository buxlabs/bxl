import { writeFile, mkdir } from "fs/promises";
import { basename, join, resolve } from "path";
import { existsSync } from "fs";

export async function fetchFile(url, options = {}) {
  const directory = options.directory || ".";

  try {
    // Validate URL
    const urlObj = new URL(url);

    // Make HTTP/HTTPS request
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Determine filename
    let filename = options.output || basename(urlObj.pathname) || "downloaded-file";

    // If no extension and we have content-type, try to add appropriate extension
    if (!filename.includes(".") && response.headers.get("content-type")) {
      const contentType = response.headers.get("content-type");
      const extension = getExtensionFromContentType(contentType);
      if (extension) {
        filename = `${filename}${extension}`;
      }
    }

    // Ensure directory exists
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true });
    }

    const outputPath = resolve(join(directory, filename));

    // Get file contents
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write to file
    await writeFile(outputPath, buffer);

    return { filename, path: outputPath, size: buffer.length };
  } catch (error) {
    if (error.message.includes("Invalid URL")) {
      throw new Error(`Invalid URL: ${url}`);
    }
    throw error;
  }
}

function getExtensionFromContentType(contentType) {
  const typeMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "text/html": ".html",
    "text/plain": ".txt",
    "application/json": ".json",
    "application/pdf": ".pdf",
  };

  // Extract the base content type (remove charset, etc.)
  const baseType = contentType.split(";")[0].trim();
  return typeMap[baseType] || "";
}
