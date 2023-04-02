import { generateCodeFile, generateFileList } from "./aigenerator";
import { createFoldersIfNotExist, writeToFile, testfile } from "./files";

export async function createAllFiles(
  name: string,
  description: string
): Promise<void> {
  const files = await generateFileList(description);

  files?.forEach((fn) => {
    createAndSaveFile(fn, name, description);
  });
}

export async function createAndSaveFile(
  filename: string,
  projectName: string,
  projectDescription: string
): Promise<void> {
  const contents = await generateCodeFile(
    filename,
    projectName,
    projectDescription
  );

  if (contents) {
    createFoldersIfNotExist(testfile(filename));
    writeToFile(testfile(filename), contents);
    console.log("Created ", filename);
    return;
  }

  console.log("Failed to create file ", filename);
}
