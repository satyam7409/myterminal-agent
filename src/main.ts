import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { Message } from "./types";
config({
  path: fileURLToPath(new URL(".././env", import.meta.url)),
  quiet: true,
});

const { values } = parseArgs({
  options: {
    prompt: { type: "string", short: "p" },
    provider: { type: "string", default: "openai" },
    model: { type: "string" },
  },
  allowPositionals: true,
});

if (!values.prompt) {
  console.error(`prompt to daal bhaii`);
  process.exit(1);
}

const provider = getProvider(values.provider);
const model = values.model ? values.model : "";
const messages: Message[] = [{ role: "user", content: values.prompt }];

await runAgent({
  provider,
  model,
  messages,
  tools,
  onEvent(event) {
    // if (event.type === "text") process.stdout.write(event.delta);
    // else if (event.type == "tool_start") console.log(`\n ${event.call.name}`);
    // else if (event.type == "tool_end") {
    //   const lines = event.result.split("\n").length;
    //   console.log(`\n ${event.isError ? event.result : lines}`);
    // } else if (event.type === "turn_end") {
    //   const { usage, stopReason } = event.message;
    //   console.log(
    //     `\n\n  ${provider.name} ... ${model} ... ${usage.input} ... ${usage.output} ... ${stopReason}`,
    //   );
    // }
  },
});
