import {useState} from "react";
import {ActivityIndicator,Pressable,StyleSheet,Text,TextInput,View} from "react-native";
import {router} from "expo-router";
import AppShell from "../../src/AppShell";
import {theme} from "../../src/theme";
import {phase3Api} from "../../src/phase3Api";

export default function CreateStory(){
 const [url,setUrl]=useState(""),[caption,setCaption]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const save=async()=>{if(!url.trim())return setError("Add an image or video URL.");setBusy(true);try{await phase3Api.createStory({media_url:url.trim(),caption:caption.trim()});router.back()}catch(e:any){setError(e.message||"Unable to publish story.")}finally{setBusy(false)}};
 return <AppShell><View style={s.page}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>AMORA STORIES</Text><Text style={s.title}>Share a moment</Text><Text style={s.label}>Media URL</Text><TextInput value={url} onChangeText={setUrl} placeholder="https://…" placeholderTextColor={theme.dim} style={s.input}/><Text style={s.label}>Caption</Text><TextInput value={caption} onChangeText={setCaption} placeholder="Say something…" placeholderTextColor={theme.dim} style={[s.input,{height:90,textAlignVertical:"top"}]} multiline/><Pressable disabled={busy} onPress={save} style={s.button}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.buttonText}>Publish Story</Text>}</Pressable>{!!error&&<Text style={s.error}>{error}</Text>}</View></AppShell>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:28,fontWeight:"900",marginTop:5,marginBottom:20},label:{color:theme.dim,fontSize:9,marginTop:10,marginBottom:6},input:{backgroundColor:theme.surface,borderRadius:13,color:"#fff",padding:13,fontSize:10},button:{marginTop:18;backgroundColor:theme.pink,borderRadius:13,paddingVertical:14,alignItems:"center"},buttonText:{color:"#fff",fontWeight:"900"},error:{color:"#ff8bad",textAlign:"center",marginTop:10}
});
