import {createHash,randomBytes} from 'crypto'; import {NextRequest} from 'next/server';
const buckets=new Map<string,{n:number;until:number}>();
export function limited(req:NextRequest,limit=8){const key=req.headers.get('x-forwarded-for')?.split(',')[0]??'local';const now=Date.now(),b=buckets.get(key);if(!b||b.until<now){buckets.set(key,{n:1,until:now+60_000});return false}b.n++;return b.n>limit}
export function sameOrigin(req:NextRequest){const origin=req.headers.get('origin');return !origin||origin===req.nextUrl.origin}
export function fingerprint(req:NextRequest,id:string){return createHash('sha256').update(`${process.env.PARTICIPATION_HASH_SECRET??'local-development-only'}:${req.headers.get('user-agent')??''}:${req.headers.get('x-forwarded-for')??''}:${id}`).digest('hex')}
export const reference=()=>`KPP-${randomBytes(5).toString('hex').toUpperCase()}`;
export async function role(req:NextRequest){const bearer=req.headers.get('authorization')?.replace(/^Bearer /,'');const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!bearer||!url||!key)return null;const response=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,authorization:`Bearer ${bearer}`},cache:'no-store'});if(!response.ok)return null;const user=await response.json() as {app_metadata?:{role?:string}};return user.app_metadata?.role}
