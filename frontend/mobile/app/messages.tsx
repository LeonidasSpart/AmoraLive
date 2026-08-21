import { router } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { theme } from "../src/theme";

export default function Messages(){
 return <View style={s.page}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.title}>Messages</Text>
 <View style={s.card}><Text style={s.avatar}>●</Text><View><Text style={s.name}>Amora Service</Text><Text style={s.msg}>Welcome to Amora.</Text></View><Text style={s.time}>now</Text></View>
 <View style={s.empty}><Text style={s.big}>♡</Text><Text style={s.emptyTitle}>Your conversations</Text><Text style={s.muted}>Matches and messages will appear here.</Text></View>
 </View>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:20},back:{fontSize:42,color:theme.text},title:{fontSize:30,fontWeight:"900",color:theme.text,marginVertical:12},card:{backgroundColor:theme.surface,borderRadius:18,padding:16,flexDirection:"row",alignItems:"center",gap:12},avatar:{fontSize:32,color:theme.pink},name:{color:theme.text,fontWeight:"800"},msg:{color:theme.muted,marginTop:4},time:{marginLeft:"auto",color:theme.muted},empty:{flex:1,alignItems:"center",justifyContent:"center"},big:{fontSize:70,color:theme.pink},emptyTitle:{fontSize:22,fontWeight:"800",color:theme.text},muted:{color:theme.muted,marginTop:8}});
