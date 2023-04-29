import commandLineArgs from "command-line-args";
import { OptionDefinition } from "command-line-args";

export function parseCommandLineArgs(config: Array<OptionDefinition>) {
  return commandLineArgs(config);
}
