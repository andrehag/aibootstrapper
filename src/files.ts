import * as fs from "fs/promises";
import * as fscb from "fs";
import * as path from "path";

export async function writeToFile(
  filename: string,
  content: string
): Promise<void> {
  try {
    await fs.writeFile(filename, content);
  } catch (err) {
    console.log("Unable to write to file ", filename);
  }
}

export function createFoldersIfNotExist(filePath: string) {
  const dirPath = path.dirname(filePath);

  if (!fscb.existsSync(dirPath)) {
    fscb.mkdirSync(dirPath, { recursive: true });
  }
}

export function testfile(n: string): string {
  return `testoutput/${n}`;
}
