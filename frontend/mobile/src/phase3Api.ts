import { phase2Request } from "./phase2Api";

async function first(paths:string[], options:RequestInit={}){
  let last:any;
  for(const path of paths){
    try{return await phase2Request(path,options)}catch(e:any){last=e;}
  }
  throw last||new Error("Request failed");
}
export const phase3Api={
  discover:(params:string="")=>first([`/discover${params}`,`/discover/feed${params}`,`/live/discover${params}`]),
  trending:()=>first(["/discover/trending","/live/trending"]),
  stories:()=>first(["/stories","/stories/feed"]),
  story:(id:string)=>first([`/stories/${id}`]),
  createStory:(body:any)=>first(["/stories"],{method:"POST",body:JSON.stringify(body)}),
  viewStory:(id:string)=>first([`/stories/${id}/view`,`/stories/${id}/views`],{method:"POST"}),
  reactStory:(id:string,reaction:string)=>first([`/stories/${id}/react`,`/stories/${id}/reaction`],{method:"POST",body:JSON.stringify({reaction})}),
  battles:(id?:string)=>first(id?[`/live/battles/${id}`,`/battles/${id}`]:["/live/battles","/battles"]),
  battle:(id:string)=>first([`/live/battles/${id}`,`/battles/${id}`]),
  joinBattle:(id:string)=>first([`/live/battles/${id}/join`,`/battles/${id}/join`],{method:"POST"}),
  leaveBattle:(id:string)=>first([`/live/battles/${id}/leave`,`/battles/${id}/leave`],{method:"POST"})
};
