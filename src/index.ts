import { startApp } from "./app.js";

export function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.log("No API Key in the environment variable OPENAI_API_KEY.");
    return;
  }

  startApp();
}

main();
