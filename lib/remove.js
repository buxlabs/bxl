import { readdir, unlink } from "fs/promises";
import { join } from "path";

function matchesPattern(filename, pattern) {
  // Convert glob pattern to regex
  // Replace * with .* and escape special regex characters
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // Escape special chars except *
    .replace(/\*/g, ".*"); // Replace * with .*
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filename);
}

export async function removeFiles(pattern, options = {}) {
  const directory = options.directory || ".";
  
  try {
    const files = await readdir(directory);
    const matchedFiles = files.filter((file) => matchesPattern(file, pattern));
    
    if (matchedFiles.length === 0) {
      console.log(`No files matching pattern '${pattern}' found`);
      return { removed: [], count: 0 };
    }
    
    const removed = [];
    for (const file of matchedFiles) {
      const filePath = join(directory, file);
      try {
        await unlink(filePath);
        console.log(`✓ Removed ${file}`);
        removed.push(file);
      } catch (error) {
        console.error(`✗ Failed to remove ${file}:`, error.message);
      }
    }
    
    console.log(`\nRemoved ${removed.length} file(s)`);
    return { removed, count: removed.length };
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
}
