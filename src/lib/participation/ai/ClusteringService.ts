import type {AiProvider} from './AiProvider'; export class ClusteringService{constructor(private provider:AiProvider){} run(texts:string[]){return this.provider.cluster(texts)}}
