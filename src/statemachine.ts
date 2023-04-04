import { useCallback, useState } from "react";

export type StateMachineConfig<T extends string, K extends string> = {
  initial: T;
  messages: { [x in K]: T };
};

export function useStateMachine<T extends string, K extends string>(
  config: StateMachineConfig<T, K>
) {
  const [oConfig] = useState(config);
  const [state, setState] = useState<T>(config.initial);

  const send = useCallback(
    (message: K) => {
      if (oConfig.messages[message]) {
        setState(oConfig.messages[message]);
      }
    },
    [setState]
  );

  return {
    state,
    send,
  };
}
