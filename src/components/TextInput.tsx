import * as React from "react";
import { Box, Text, useInput } from "ink";

export type Props = {
  prompt: string;
  active: boolean;

  onTextInput: (text: string) => void;
  onAbort: () => void;

  promptColor: string;
  textColor: string;
};

export const TextInput = ({
  prompt,
  active,
  promptColor,
  textColor,
  onTextInput,
  onAbort,
}: Props) => {
  const [text, setText] = React.useState<string>("");

  useInput((input, key) => {
    if (active) {
      if (key.backspace && text.length > 0) {
        setText(text.substring(0, text.length - 1));
      } else if (key.return) {
        onTextInput(text);
      } else if (key.escape) {
        onAbort();
      } else {
        setText(text + input);
      }
    }
  });

  return (
    <Box>
      <Text color={promptColor}>{prompt} </Text>
      <Text color={textColor}>
        {text}
        {active ? "_" : ""}
      </Text>
    </Box>
  );
};
