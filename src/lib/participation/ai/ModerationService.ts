import type {AiProvider} from './AiProvider'; export class ModerationService{constructor(private provider:AiProvider){} run(text:string){return this.provider.moderate(text)}}
