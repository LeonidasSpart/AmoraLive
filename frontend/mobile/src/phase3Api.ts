import { phase2Request } from "./phase2Api";

async function first(paths:string[], options:RequestInit={}){
  let last:any;
  for(const path of paths){
    try{return await phase2Request(path,options)}catch(e:any){last=e;}
  }
  throw last||new Error("Request failed");
}
// Note: battles/battle/joinBattle/leaveBattle/story/discover/trending/
// createStory were removed here — they guessed at endpoint paths that were
// never real (the actual routes are /live/:id/battle* and /stories/feed,
// used directly elsewhere), and nothing in the app called them. Keeping
// unused, wrong-path API surface around is exactly what let this app end
// up with wiring bugs before — a 404 landmine for the next screen built
// against it.
export const phase3Api={
  stories:()=>first(["/stories","/stories/feed"]),
  viewStory:(id:string)=>first([`/stories/${id}/view`,`/stories/${id}/views`],{method:"POST"}),
  reactStory:(id:string,reaction:string)=>first([`/stories/${id}/react`,`/stories/${id}/reaction`],{method:"POST",body:JSON.stringify({reaction})})
};
