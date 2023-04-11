import * as React from "react";
import { Box, Text } from "ink";

const Icons = {
  waiting: "",
  active: "⚙️",
  done: "✔️",
  error: "❌",
};

export type File = {
  fileName: string;
  state: "waiting" | "active" | "done" | "error";
  message?: string;
};

export type Props = {
  files?: File[];
};

export const FileList = ({ files }: Props) => {
  const fileElements = files?.map((v, idx) => (
    <Text key={idx}>
      {v.fileName}
      {` ${Icons[v.state]} ${v.message || ""}`}
    </Text>
  ));

  return files ? <Box flexDirection="column">{fileElements}</Box> : null;
};
