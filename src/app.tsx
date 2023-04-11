import * as React from "react";
import { render, Box, Text, useInput, useApp, Spacer } from "ink";
import { useStateMachine, StateMachineConfig } from "./statemachine.js";
import { TextInput } from "./components/TextInput.js";
import { File, FileList } from "./components/FileList.js";
import { createAIGenerator } from "./aigenerator.js";
import { writeToFile } from "./files.js";

type States = "InputName" | "InputDescription" | "Output";
type Messages = "NameInput" | "DescriptionInput";
const stateMachineConfig: StateMachineConfig<States, Messages> = {
  initial: "InputName",
  messages: {
    NameInput: "InputDescription",
    DescriptionInput: "Output",
  },
};

const App = () => {
  const { exit } = useApp();
  const { state, send } = useStateMachine<States, Messages>(stateMachineConfig);

  const [error, setError] = React.useState<string | undefined>(undefined);
  const [name, setName] = React.useState<string>("");
  const [desc, setDesc] = React.useState<string>("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [requestStarted, setRequestStarted] = React.useState<boolean>(false);

  const onName = React.useCallback(
    (name: string) => {
      setName(name);
      send("NameInput");
    },
    [send, setName]
  );

  const onDesc = React.useCallback(
    (desc: string) => {
      setDesc(desc);
      send("DescriptionInput");
    },
    [send, setDesc]
  );

  React.useEffect(() => {
    if (state == "Output" && !requestStarted) {
      setRequestStarted(true);
      generate(name, desc, setFiles, (error) => {
        setError(error);
        exit();
      });
    }
  }, [state, name, desc, setFiles]);

  return (
    <Box
      width="100%"
      flexDirection="column"
      borderStyle="round"
      paddingLeft={1}
    >
      <Text color="blue" bold={true}>
        AI Project bootstrapper 🤖
      </Text>
      <Text color="blue">
        Please enter a name and description for your project. Description should
        be a short sentence describing its nature.
      </Text>
      <Box width="100%">
        <Text color="blue">Example: </Text>
        <Text color="yellow">
          "A react project written in typescript using esbuild for bundling"
        </Text>
      </Box>
      <Spacer />
      {state === "InputName" ? (
        <TextInput
          prompt="Name:"
          active={state === "InputName"}
          onTextInput={onName}
          onAbort={exit}
          promptColor="blue"
          textColor="yellow"
        />
      ) : null}
      {state === "InputDescription" ? (
        <TextInput
          prompt="Description:"
          active={state === "InputDescription"}
          onTextInput={onDesc}
          onAbort={exit}
          promptColor="blue"
          textColor="yellow"
        />
      ) : null}

      {state === "Output" ? <FileList files={files} /> : null}

      {error != undefined ? <Text color="red">{error}</Text> : null}
    </Box>
  );
};

async function generate(
  name: string,
  desc: string,
  updateFiles: (files: File[]) => void,
  error: (error: string) => void
) {
  const generator = createAIGenerator();

  const fileNames = await generator.generateFileList(desc);
  if (!fileNames) {
    error("Failed when trying to generate a list of files");
    return;
  }

  let files = fileNames.map((v): File => ({ fileName: v, state: "waiting" }));
  updateFiles(files);

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    files = updateFileState(files, f.fileName, "active");
    updateFiles(files);

    const response = await generator.generateCodeFile(f.fileName, name, desc);
    if (response.errorCode) {
      files = updateFileState(
        files,
        f.fileName,
        "error",
        `Error in response: ${response.errorCode}`
      );
      updateFiles(files);
    } else if (response.responseText) {
      const err = await writeToFile(f.fileName, response.responseText);
      if (!err) {
        files = updateFileState(files, f.fileName, "done");
        updateFiles(files);
      } else {
        files = updateFileState(files, f.fileName, "error", "File error");
        updateFiles(files);
      }
    }
  }
}

function updateFileState(
  files: File[],
  fileName: string,
  newState: "waiting" | "active" | "done" | "error",
  msg?: string
): File[] {
  return files.map((f) =>
    f.fileName === fileName ? { ...f, state: newState, message: msg } : f
  );
}

export function startApp() {
  render(<App />);
}
