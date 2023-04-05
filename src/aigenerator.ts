import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

function createFileListPrompt(description: string): string {
  return `In your response output only a comma-separated list of files prefixed with standard folder names. Do not place any text before or after the response. What are the files necessary to bootstrap a project as described: ${description}`;
}

function createCodeFilePrompt(
  file: string,
  projectName: string,
  projectDescription: string
): string {
  return `In your response output only code. Do not place any text before or after the response. Generate the contents of the file named ${file} suitable for this project: Project name: ${projectName}, Project description: ${projectDescription}`;
}

async function generate(messages: ChatCompletionRequestMessage[]) {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  // Set up the parameters for the API request
  const model_engine = "gpt-3.5-turbo";

  try {
    const resp = await openai.createChatCompletion({
      model: model_engine,
      temperature: 0.2,
      max_tokens: 3500,
      messages,
    });

    return resp.data.choices[0].message?.content;
  } catch (e) {
    console.log("ERROR");
    console.log(e);
    return undefined;
  }
}

export type AIGenerator = {
  generateFileList: (description: string) => Promise<string[] | undefined>;
  generateCodeFile: (
    file: string,
    projectName: string,
    projectDescription: string
  ) => Promise<string | undefined>;
};

export function createAIGenerator(): AIGenerator {
  const generatorWithHistory = createHistoryGenerator();

  return {
    generateFileList: async (
      description: string
    ): Promise<string[] | undefined> => {
      const aiPrompt = createFileListPrompt(description);
      const response = await generatorWithHistory(aiPrompt);
      return response ? response.split(",").map((v) => v.trim()) : undefined;
    },

    generateCodeFile: async (
      file: string,
      projectName: string,
      projectDescription: string
    ): Promise<string | undefined> => {
      const aiPrompt = createCodeFilePrompt(
        file,
        projectName,
        projectDescription
      );
      const response = await generatorWithHistory(aiPrompt);
      return response;
    },
  };
}

function createHistoryGenerator(): (
  aiPrompt: string
) => Promise<string | undefined> {
  let history: ChatCompletionRequestMessage[] = [];

  return async (aiPrompt: string): Promise<string | undefined> => {
    history.push({ role: "user", content: aiPrompt });

    while (estimateTokens(history.map((m) => m.content).join("")) > 2000) {
      history = history.splice(0, 1);
    }

    const response = await generate(history);
    if (response) {
      const regex = /\`\`\`.*$/;
      const matches = response.match(regex);
      if (matches) {
      }
      history.push({ role: "assistant", content: response });
    }
    return response;
  };
}

function estimateTokens(text: string): number {
  const regex = /\b\w+\b/g; // match word characters
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}
