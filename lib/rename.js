import { readdir, rename as fsRename } from "fs/promises";
import { join, extname, basename } from "path";

export async function renameFiles(pattern, options = {}) {
  const directory = options.directory || ".";

  try {
    const files = await readdir(directory);
    
    // Filter out directories and hidden files
    const filesOnly = [];
    for (const file of files) {
      if (!file.startsWith('.')) {
        filesOnly.push(file);
      }
    }

    if (filesOnly.length === 0) {
      return { renamed: [], count: 0 };
    }

    // Sort files for consistent ordering
    filesOnly.sort();

    const renamed = [];
    for (let i = 0; i < filesOnly.length; i++) {
      const file = filesOnly[i];
      const filePath = join(directory, file);
      const ext = extname(file);
      
      // Replace placeholders in the pattern
      let newName = pattern.replace(/{index}/g, String(i + 1));
      
      // If the pattern doesn't include an extension, preserve the original extension
      if (!extname(newName)) {
        newName += ext;
      }

      const newPath = join(directory, newName);

      try {
        await fsRename(filePath, newPath);
        renamed.push({ from: file, to: newName });
      } catch (error) {
        console.error(`✗ Failed to rename ${file}:`, error.message);
      }
    }

    return { renamed, count: renamed.length };
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
}
