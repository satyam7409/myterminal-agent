export type Usage = {input: number, output:number}


export type UserMessage = {role:"user",content:string};

export type Message = UserMessage | AssistantMessage | ToolMessage



export type ToolSpec = {
    name: string,
    description: string,
    parameters: Record<string, unknown>
}
export type Tool = ToolSpec & {execute(args:Record<string,unknown>):Promise<string>}