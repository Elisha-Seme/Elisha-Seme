import {NextResponse} from 'next/server';
export const ok=(data:unknown,status=200)=>NextResponse.json({data},{status});
export const fail=(status:number,code:string,message:string,details?:unknown)=>NextResponse.json({error:{code,message,...(details?{details}:{})}},{status});
