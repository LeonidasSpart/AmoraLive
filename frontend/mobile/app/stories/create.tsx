import {useState} from "react";
import {ActivityIndicator,Alert,Image,Pressable,StyleSheet,Text,TextInput,View} from "react-native";
import {router} from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AppShell from "../../src/AppShell";
import {theme} from "../../src/theme";
import {api} from "../../src/api/client";

export default function CreateStory(){
 const [asset,setAsset]=useState<ImagePicker.ImagePickerAsset|null>(null);
 const [caption,setCaption]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");

 const pickMedia=async()=>{
  const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
  if(!permission.granted){Alert.alert("Permission needed","Amora needs access to your photos and videos to create a story.");return}
  const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.All,quality:0.8});
  if(result.canceled||!result.assets?.length)return;
  setAsset(result.assets[0]);
  setError("");
 };

 const save=async()=>{
  if(!asset)return setError("Add a photo or video first.");
  setBusy(true);setError("");
  try{
   const formData=new FormData();
   const filename=asset.uri.split("/").pop()||(asset.type==="video"?"story.mp4":"story.jpg");
   const match=/\.(\w+)$/.exec(filename);
   const ext=match?match[1].toLowerCase():(asset.type==="video"?"mp4":"jpg");
   const type=asset.type==="video"?`video/${ext==="mov"?"quicktime":ext}`:`image/${ext==="jpg"?"jpeg":ext}`;
   formData.append("media",{uri:asset.uri,name:filename,type} as any);
   formData.append("caption",caption.trim());
   await api.uploadStory(formData);
   router.back();
  }catch(e:any){setError(e.message||"Unable to publish story.")}
  finally{setBusy(false)}
 };

 return <AppShell><View style={s.page}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>AMORA STORIES</Text><Text style={s.title}>Share a moment</Text>
  <Pressable onPress={pickMedia} style={s.picker}>
   {asset?<Image source={{uri:asset.uri}} style={s.preview}/>:<Text style={s.pickerText}>Tap to choose a photo or video</Text>}
  </Pressable>
  <Text style={s.label}>Caption</Text>
  <TextInput value={caption} onChangeText={setCaption} placeholder="Say something…" placeholderTextColor={theme.dim} style={[s.input,{height:90,textAlignVertical:"top"}]} multiline/>
  <Pressable disabled={busy} onPress={save} style={s.button}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.buttonText}>Publish Story</Text>}</Pressable>
  {!!error&&<Text style={s.error}>{error}</Text>}
 </View></AppShell>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:28,fontWeight:"900",marginTop:5,marginBottom:20},picker:{backgroundColor:theme.surface,borderRadius:16,height:220,alignItems:"center",justifyContent:"center",overflow:"hidden"},pickerText:{color:theme.dim,fontSize:11,textAlign:"center",paddingHorizontal:20},preview:{width:"100%",height:"100%"},label:{color:theme.dim,fontSize:9,marginTop:14,marginBottom:6},input:{backgroundColor:theme.surface,borderRadius:13,color:"#fff",padding:13,fontSize:10},button:{marginTop:18,backgroundColor:theme.pink,borderRadius:13,paddingVertical:14,alignItems:"center"},buttonText:{color:"#fff",fontWeight:"900"},error:{color:"#ff8bad",textAlign:"center",marginTop:10}
});
