import {Redirect} from "expo-router";
// Battles aren't a standalone browsing experience — same as web, they only
// happen inside a live room (see app/live/[id].tsx for the real in-room
// battle UI: score bar, opponent video, invite/accept/decline).
export default function Battles(){return <Redirect href="/live"/>;}
