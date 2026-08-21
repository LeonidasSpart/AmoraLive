import { router } from "expo-router";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { theme } from "../src/theme";

export default function Auth() {
  return <View style={s.page}>
    <Text style={s.brand}>AMORA</Text>
    <Text style={s.title}>Find your meaningful connection.</Text>
    <TextInput placeholder="Email" placeholderTextColor="#8d849b" style={s.input}/>
    <TextInput placeholder="Password" placeholderTextColor="#8d849b" secureTextEntry style={s.input}/>
    <Pressable style={s.primary} onPress={()=>router.replace("/home")}><Text style={s.primaryText}>Continue with email</Text></Pressable>
    <Pressable style={s.google} onPress={()=>router.replace("/home")}><Text style={s.googleText}>Continue with Google</Text></Pressable>
    <Text style={s.or}>OR</Text>
    <Pressable onPress={()=>router.replace("/home")}><Text style={s.link}>Log in with username or email</Text></Pressable>
    <Text style={s.foot}>By continuing you accept the Terms and Privacy Policy.</Text>
  </View>
}
const s=StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg,padding:24,justifyContent:"center"},
  brand:{fontSize:30,fontWeight:"900",letterSpacing:6,color:theme.pink,textAlign:"center"},
  title:{fontSize:28,fontWeight:"800",color:theme.text,textAlign:"center",marginVertical:28},
  input:{backgroundColor:theme.surface,borderWidth:1,borderColor:theme.border,borderRadius:15,padding:16,color:theme.text,marginBottom:12},
  primary:{backgroundColor:theme.pink,borderRadius:15,padding:16,alignItems:"center"},
  primaryText:{color:"#fff",fontWeight:"800"},
  google:{backgroundColor:"#fff",borderRadius:15,padding:16,alignItems:"center",marginTop:10},
  googleText:{color:"#17131f",fontWeight:"800"},
  or:{color:theme.muted,textAlign:"center",margin:20},
  link:{color:theme.pink,textAlign:"center",fontWeight:"700"},
  foot:{color:"#777080",fontSize:11,textAlign:"center",marginTop:28}
});
