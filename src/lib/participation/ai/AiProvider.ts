export type Sentiment={label:'supportive'|'skeptical'|'mixed'|'neutral';confidence:'low'|'medium'|'high';scores:{positive:number;negative:number}};
export type Summary={text:string;references:string[]}; export type Cluster={label:string;memberIndexes:number[];keywords:string[]};
export interface AiProvider{summarize(text:string):Summary;sentiment(text:string):Sentiment;cluster(texts:string[]):Cluster[];moderate(text:string):{flagged:boolean;reason?:string;recommendation?:'Needs human review.'}}
