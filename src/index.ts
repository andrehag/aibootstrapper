import { createAllFiles } from "./fileGenerator";

export function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.log("No API Key in the environment variable OPENAI_API_KEY.");
    return;
  }
  const name = "TestProject";
  const description =
    "Typescript-based react project using esbuild for bundling";
  createAllFiles(name, description);
}

main();
