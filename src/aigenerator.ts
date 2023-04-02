import { Configuration, OpenAIApi } from "openai";

export async function generateFileList(
  description: string
): Promise<string[] | undefined> {
  const aiPrompt = `In your response output only a comma-separated list of files prefixed with standard folder names. Do not place any text before or after the response. What are the files necessary to bootstrap a project as described: ${description}`;
  const resp = await generate(aiPrompt);
  if (resp) {
    return resp.split(",").map((v) => v.trim());
  }
}

export async function generateCodeFile(
  file: string,
  projectName: string,
  projectDescription: string
): Promise<string | undefined> {
  const aiPrompt = `In your response output only code. Do not place any text before or after the response. Generate the contents of the file named ${file} suitable for this project: Project name: ${projectName}, Project description: ${projectDescription}`;
  const resp = await generate(aiPrompt);
  return resp;
}

export async function generatePackageJSON(
  name: string,
  description: string
): Promise<string | undefined> {
  const aiPrompt = `Generate a package.json file suitable for the project described below. Output only code, no text before or after\n name: ${name}\n description: ${description}`;
  const response = await generate(aiPrompt);
  return response;
}

export async function generate(aiprompt: string) {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  // Set up the parameters for the API request
  const model_engine = "gpt-3.5-turbo";
  const language = "typescript";
  const max_tokens = 500;

  try {
    const resp = await openai.createChatCompletion({
      model: model_engine,
      temperature: 0.2,
      max_tokens: 500,
      messages: [{ role: "user", content: aiprompt }],
    });

    return resp.data.choices[0].message?.content;
  } catch (e) {
    console.log("ERROR");
    console.log(e);
    return undefined;
  }
}
