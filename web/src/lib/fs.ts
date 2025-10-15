import fs from "fs";
import path from "path";

export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function saveBufferToFile(dir: string, filename: string, data: Buffer) {
  ensureDir(dir);
  const full = path.join(dir, filename);
  fs.writeFileSync(full, data);
  return full;
}
