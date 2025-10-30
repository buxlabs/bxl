import { readdir, stat, readFile, unlink } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";

export async function uniqueFiles() {
  const dir = process.cwd();
  const files = await readdir(dir);
  const hashMap = new Map();

  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      const fileBuffer = await readFile(filePath);
      const hash = createHash("md5").update(fileBuffer).digest("hex");

      if (hashMap.has(hash)) {
        // Duplicate found, remove the file
        await unlink(filePath);
        console.log(`Removed duplicate file: ${file}`);
      } else {
        hashMap.set(hash, filePath);
      }
    }
  }
}
