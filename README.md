# MyTerminal Agent

A minimal terminal-based AI coding agent built with TypeScript and Node.js. MyTerminal Agent connects an LLM to filesystem-inspection tools and a Bash command runner so it can explore a codebase, search for relevant code, read files, and execute commands in an iterative agent loop.

This is a learning project inspired by the architecture of AI coding agents. It focuses on the internals: provider adapters, streaming responses, tool calling, and feeding tool results back to the model.

## Features

- **Agent loop:** sends conversation history and tool definitions to the model, executes requested tools, appends tool results to the conversation, and continues until the model finishes or the turn limit is reached.
- **Streaming output:** prints generated text incrementally instead of waiting for the whole response.
- **Tool calling:** routes model-requested calls to registered tool handlers.
- **Codebase exploration:** lists files, finds paths by name/glob/regex, searches file contents, reads files, and inspects file metadata.
- **Bash execution:** runs shell commands from the current working directory, with a timeout and output truncation.
- **Provider abstraction:** keeps a common internal message/event format separate from provider-specific API formats.
- **Usage reporting:** displays token usage and stop reason at the end of a model turn.

## Tech stack

- TypeScript and Node.js
- OpenAI SDK
- `tsx` for running TypeScript directly
- `dotenv` for environment variables
- Anthropic SDK is listed as a dependency, but the current repository's provider registry wires up OpenAI only.

## Requirements

- A recent Node.js version and npm
- An OpenAI API key with access to the model you configure
- Bash; on Windows, Git Bash is recommended

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/satyam7409/myterminal-agent.git
cd myterminal-agent
npm install
```

### 2. Configure your API key

**Before adding your key, fix the env-file path.** The current `src/main.ts` points to `../env` (a root-level file named `env`), while `.gitignore` ignores `.env`, not `env`. To avoid accidentally committing credentials, update the config path in `src/main.ts` to:

```ts
config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});
```

Then create a `.env` file in the repository root:

```dotenv
OPENAI_API_KEY=your_openai_api_key
```

The repository's `.gitignore` already ignores `.env`. Never commit or show your API key in a screen recording.

### 3. Run the agent

The current CLI accepts a prompt with `-p`/`--prompt`, an optional provider name, and an optional model ID:

```bash
npx tsx bin/mypy.js -p "Explain the project structure" --model "YOUR_MODEL_ID"
```

Replace `YOUR_MODEL_ID` with a model identifier supported by your OpenAI API account. The current CLI passes an empty model string when `--model` is omitted, so supplying `--model` is necessary unless you update the CLI to fall back to `provider.defaultModel`.

More examples:

```bash
npx tsx bin/mypy.js -p "Find the main entry point and explain the agent loop" --model "YOUR_MODEL_ID"
npx tsx bin/mypy.js -p "Search for TODO comments and summarize them" --model "YOUR_MODEL_ID"
npx tsx bin/mypy.js -p "Run the project's tests and explain any failures" --model "YOUR_MODEL_ID"
```

## Run it against another project

The filesystem tools and Bash runner use `process.cwd()` as their working directory. Open a terminal in the project you want to inspect, then launch the agent using the absolute path to this repository's CLI:

```powershell
cd "S:\path\to\target-project"
npx tsx "S:\path\to\myterminal-agent\bin\mypy.js" -p "Explain this codebase" --model "YOUR_MODEL_ID"
```

Replace both paths with your local paths. The target project is the current working directory; the agent's source code can live elsewhere. Ensure the agent can load its environment file independently of the current working directory.

## Available tools

| Tool | What it does |
| --- | --- |
| `ls` | Recursively lists files/directories; skips common generated directories and hidden paths by default. |
| `find` | Finds files or directories by name, glob, or regular expression. |
| `grep` | Searches files recursively using a regular expression and returns file/line matches. |
| `read` | Reads a text file. |
| `stat` | Reports file metadata, including size and timestamps. |
| `bash` | Executes a Bash command and returns output and exit code. |

The current tool registry has no dedicated file-edit/write tool. The model may use Bash commands for operations that modify files, so review commands and diffs carefully.

## Architecture

```text
User prompt
    |
    v
CLI (src/main.ts)
    |
    v
Agent loop (src/agent/loop.ts)
    |
    v
Provider interface
    |
    v
OpenAI streaming API
    |
    +---- text deltas --------------------> print to terminal
    |
    +---- tool call
              |
              v
          Tool registry
              |
              +--> ls / find / grep / read / stat / bash
              |
              v
          Tool result appended to messages
              |
              v
          Agent loop continues
```

### Request lifecycle

1. The CLI parses the prompt and model options.
2. The provider sends conversation history and tool definitions to the model.
3. Streaming text deltas are printed as they arrive.
4. If the model requests a tool, the agent looks up and executes the corresponding handler.
5. The tool result is appended to the conversation and sent back to the model on the next turn.
6. The loop stops when the model finishes or the maximum turn count is reached (currently 20 by default).

## Project structure

```text
.
├── bin/
│   └── mypy.js             # CLI launcher
└── src/
    ├── agent/
    │   └── loop.ts         # Agent/tool execution loop
    ├── providers/
    │   ├── index.ts        # Provider registry
    │   └── openai.ts       # OpenAI adapter and streaming logic
    ├── tools/
    │   ├── bash.ts         # Bash command execution
    │   ├── find.ts         # Find files by name/pattern
    │   ├── fsutil.ts       # Filesystem traversal and glob matching
    │   ├── grep.ts         # Search inside files
    │   ├── index.ts        # Tool registry
    │   ├── ls.ts           # List files/directories
    │   ├── read.ts         # Read file contents
    │   └── stat.ts         # File metadata
    ├── main.ts             # CLI setup and orchestration
    └── types.ts            # Shared provider, message, tool and event types
```

## Safety notes

This is a prototype and **is not a security sandbox**. Bash commands run with the permissions of the current user, and the current implementation does not enforce a strict project-root boundary for every operation. Run it on a test repository or a clean Git branch, inspect proposed changes, and avoid exposing credentials or sensitive files to the model. Do not run it on production systems with elevated privileges.

## Possible next steps

- [ ] Fix environment-file loading and default-model selection
- [ ] Add explicit project-root handling and path-boundary checks
- [ ] Add confirmation for destructive or risky shell commands
- [ ] Add validation for model-generated tool arguments
- [ ] Add session/history persistence
- [ ] Add tests for provider adapters, tools, and the agent loop
- [ ] Add cancellation and a richer terminal UI
- [ ] Wire in an Anthropic adapter if multi-provider support is desired

## Learning outcomes

This project is a hands-on way to explore:

- LLM tool/function calling
- Streaming and async generators
- Provider adapters and normalized message formats
- Agent loops and tool-result handling
- Node.js process execution and filesystem operations

---

Built by [Satyam Bansal](https://github.com/satyam7409).
