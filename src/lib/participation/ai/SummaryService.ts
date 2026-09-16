import type {AiProvider} from './AiProvider'; export class SummaryService{constructor(private provider:AiProvider){} run(text:string){return this.provider.summarize(text)}}
