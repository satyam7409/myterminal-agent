import { Provider } from "../types";
import {openAI} from "./openai"


const providers:Record<string, ()=>Provider> = {
    openai: ()=>openAI("openai",process.env.OPENAI_API_KEY!,"gpt-6-luna")
}

export function getProvider(name:string):Provider{
    const create = providers[name];
    if(!create){
       throw new Error("Provider issue")
    }
    return create();
}