import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, router } from "expo-router";
import { theme } from "./theme";
import { useTranslation } from "./i18n";

export default function AppShell({ children, bottom = true }: { children: ReactNode; bottom?: boolean }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const items = [
    { path: "/home", label: t("nav.home"), icon: "⌂" },
    { path: "/video-match", label: t("nav.match"), icon: "♡" },
    { path: "/live", label: t("nav.live"), icon: "✦" },
    { path: "/messages", label: t("nav.chat"), icon: "◌" },
    { path: "/profile", label: t("nav.profile"), icon: "◎" }
  ];
  return (
    <View style={s.shell}>
      <View style={s.content}>{children}</View>
      {bottom && (
        <View style={s.nav}>
          {items.map((item) => {
            const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Pressable key={item.path} style={s.navItem} onPress={() => router.push(item.path as any)}>
                <View style={[s.navIcon, active && s.navIconActive]}>
                  <Text style={[s.navIconText, active && s.navIconTextActive]}>{item.icon}</Text>
                </View>
                <Text style={[s.navText, active && s.navTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  shell:{flex:1,backgroundColor:theme.bg},
  content:{flex:1},
  nav:{height:72,paddingHorizontal:10,paddingTop:7,paddingBottom:8,backgroundColor:"rgba(12,8,22,.98)",borderTopWidth:1,borderTopColor:"rgba(255,255,255,.08)",flexDirection:"row",justifyContent:"space-around"},
  navItem:{flex:1,alignItems:"center",justifyContent:"center",gap:3},
  navIcon:{width:36,height:30,borderRadius:12,alignItems:"center",justifyContent:"center"},
  navIconActive:{backgroundColor:"rgba(255,79,163,.12)",borderWidth:1,borderColor:"rgba(255,79,163,.22)"},
  navIconText:{fontSize:20,color:theme.dim},navIconTextActive:{color:theme.pink},
  navText:{fontSize:9,color:theme.dim,fontWeight:"700"},navTextActive:{color:"#fff"}
});
