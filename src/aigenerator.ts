import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { setTimeout } from "timers/promises";

const MIN_TIME_BETWEEN_CALLS_MILLIS: number = 1100;

type GenerateResponse = {
  errorCode?: number;
  errorMessage?: string;
  responseText?: string;
};

function createFileListPrompt(description: string): string {
  return `In your response output only a comma-separated list of files prefixed with standard folder names. Do not place any text before or after the response. What are the files necessary to bootstrap a project as described: ${description}`;
}

function createCodeFilePrompt(
  file: string,
  projectName: string,
  projectDescription: string
): string {
  return `In your response output only code. Do not place any text before or after the response. Do not use any markup. Generate the contents of the file named ${file} suitable for this project: Project name: ${projectName}, Project description: ${projectDescription}`;
}

async function generate(
  messages: ChatCompletionRequestMessage[]
): Promise<GenerateResponse> {
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

    return { responseText: resp.data.choices[0].message?.content };
  } catch (e) {
    return {};
  }
}

export type AIGenerator = {
  generateFileList: (description: string) => Promise<string[] | undefined>;
  generateCodeFile: (
    file: string,
    projectName: string,
    projectDescription: string
  ) => Promise<GenerateResponse>;
};

export function createAIGenerator(): AIGenerator {
  const generatorWithHistory = createHistoryGenerator();

  return {
    generateFileList: async (
      description: string
    ): Promise<string[] | undefined> => {
      const aiPrompt = createFileListPrompt(description);
      const response = await generatorWithHistory(aiPrompt);
      return response && response.responseText
        ? response.responseText.split(",").map((v) => v.trim())
        : undefined;
    },

    generateCodeFile: async (
      file: string,
      projectName: string,
      projectDescription: string
    ): Promise<GenerateResponse> => {
      const aiPrompt = createCodeFilePrompt(
        file,
        projectName,
        projectDescription
      );
      const response = await generatorWithHistory(aiPrompt);
      return {
        ...response,
        responseText: extractCode(response.responseText || ""),
      };
    },
  };
}

function createHistoryGenerator(): (
  aiPrompt: string
) => Promise<GenerateResponse> {
  let history: ChatCompletionRequestMessage[] = [];
  let lastCallTs: number = Date.now() - MIN_TIME_BETWEEN_CALLS_MILLIS;

  return async (aiPrompt: string): Promise<GenerateResponse> => {
    history.push({ role: "user", content: aiPrompt });

    while (estimateTokens(history.map((m) => m.content).join("")) > 2000) {
      history = history.splice(0, 1);
    }

    lastCallTs = await rateLimit(lastCallTs);

    const response = await generate(history);
    if (response && response.responseText) {
      history.push({ role: "assistant", content: response.responseText });
    }
    return response;
  };
}

async function rateLimit(prevTime: number): Promise<number> {
  const now = Date.now();
  const restTime = MIN_TIME_BETWEEN_CALLS_MILLIS - (now - prevTime);
  if (restTime > 0) {
    return await setTimeout(restTime, now);
  } else {
    return Promise.resolve(now);
  }
}

function estimateTokens(text: string): number {
  const regex = /\b\w+\b/g; // match word characters
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

export function extractCode(text: string): string {
  const regex = /\`\`\`(.*?)\`\`\`/gms;
  const matches = [...text.matchAll(regex)];

  const match = matches[0]?.[1]?.trim();
  return match ? match : text;
}
