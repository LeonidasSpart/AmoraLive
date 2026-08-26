import { phase2Request } from "./phase2Api";
import { Platform } from "react-native";
async function first(paths:string[],options:RequestInit={}){let last:any;for(const p of paths){try{return await phase2Request(p,options)}catch(e){last=e}}throw last||new Error("Request failed")}
const post=(p:string[],b:any)=>first(p,{method:"POST",body:JSON.stringify(b)});
export const phase4Api={
membership:()=>first(["/memberships/me","/membership/me","/users/me/membership"]),
plans:()=>first(["/memberships/plans","/membership/plans","/plans/memberships"]),
subscribe:(planId:string)=>post(["/memberships/subscribe","/membership/subscribe"],{planId}),
wallet:()=>first(["/wallet","/wallet/me","/users/me/wallet"]),
transactions:()=>first(["/wallet/transactions","/wallet/history","/transactions"]),
// Coin packages are stored per-platform (web/ios/android) since Apple and
// Google each need their own product IDs — omitting this defaulted the
// backend to the *web* catalog for every mobile request, so every native
// purchase attempt 404'd with "Package not available" (those web rows
// have no apple_product_id/google_product_id set).
coinPackages:()=>{const platform=Platform.OS==="ios"?"ios":Platform.OS==="android"?"android":"web";return first([`/wallet/packages?platform=${platform}`])},
datingFeed:()=>first(["/dating/discover","/dating/feed","/discover/dating"]),
like:(userId:string)=>post(["/dating/like","/likes"],{userId}),
pass:(userId:string)=>post(["/dating/pass","/passes"],{userId}),
superLike:(userId:string)=>post(["/dating/super-like","/dating/superlike"],{userId}),
matches:()=>first(["/dating/matches","/matches"])
};
