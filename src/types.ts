export type Usage = { input: number; output: number };
export type StopReason = "stop" | "length" | "toolUse";

//text block
export type TextBlock = { type: "text"; text: string };

export type ToolCallBlock = {
  type: "toolCall";
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type ContentBlock = TextBlock | ToolCallBlock;

//tool result message
export type ToolResultMessage = {
  role: "toolResult";
  toolCallId: string;
  toolName: string;
  content: string;
  isError: boolean;
};

//tool description
export type ToolSpec = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type Tool = ToolSpec & {
  execute(args: Record<string, unknown>): Promise<string>;
};

//usermessafe
export type UserMessage = { role: "user"; content: string };

export type AssistantMessage = {
  role: "assistant";
  content: ContentBlock[];
  usage: Usage;
  stopReason: StopReason;
};

export type Message = UserMessage | AssistantMessage | ToolResultMessage;

export type StreamEvent =
  | { type: "text_delta"; delta: string }
  | { type: "done"; message: AssistantMessage };

export type StreamOptions = {
  model: string;
  messages: Message[];
  tools?: ToolSpec[];
  system?: string;
};

export interface Provider {
  name: string;
  defaultModel: string;
  stream(args: StreamOptions): AsyncIterable<StreamEvent>;
}
