import { parseCommandLineArgs } from "../tools/parseCommandLineArgs";
import { CommandLineArgsConfig } from "../types";

async function testCommandLineArgsReading() {
  const config = parseCommandLineArgs(CommandLineArgsConfig);

  console.log(config);
}

testCommandLineArgsReading();
