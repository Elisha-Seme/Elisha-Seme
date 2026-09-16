import type {AiProvider} from './AiProvider'; export class SentimentService{constructor(private provider:AiProvider){} run(text:string){return this.provider.sentiment(text)}}
