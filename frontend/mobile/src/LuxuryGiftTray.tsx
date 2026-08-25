import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "./api/client";
import GiftIcon from "./GiftIcon";
import { theme } from "./theme";

const RARITY: Record<string, { label: string; accent: string }> = {
  common:{label:"Classic",accent:"#a9a5b5"}, uncommon:{label:"Uncommon",accent:"#5de0ae"},
  rare:{label:"Rare",accent:"#55b8ff"}, epic:{label:"Epic",accent:"#b875ff"},
  legendary:{label:"Legendary",accent:"#ffd45e"}, mythic:{label:"Mythic",accent:"#ff5fc8"},
  royal:{label:"Royal",accent:"#ffd86b"}, eternal:{label:"Eternal",accent:"#c88cff"}
};

export default function LuxuryGiftTray({
  receiverId, onSent, onClose
}: { receiverId: string; onSent?: (payload: any) => void; onClose: () => void }) {
  const [gifts, setGifts] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.gifts().then((data) => active && setGifts(Array.isArray(data) ? data : []))
      .catch((e) => active && setMessage(e.message || "Unable to load gifts."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => [
    "all", ...Array.from(new Set(gifts.map((g) => String(g.category || "").toLowerCase()).filter(Boolean)))
  ], [gifts]);

  const visible = category === "all" ? gifts : gifts.filter((g) => String(g.category || "").toLowerCase() === category);
  const meta = selected ? (RARITY[String(selected.rarity || "common").toLowerCase()] || RARITY.common) : RARITY.common;

  const sendGift = async () => {
    if (!selected || sending) return;
    setSending(true); setMessage("");
    try {
      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const data = await api.sendGift({ giftId: selected.id, receiverId, quantity, idempotencyKey });
      const transaction = data.transaction || data;
      const payload = { ...(transaction.gift || selected), quantity: transaction.quantity || quantity, transaction };
      setMessage(`✦ ${payload.quantity} × ${payload.name} sent`);
      setSelected(null); setQuantity(1);
      onSent?.(payload);
    } catch (e: any) {
      setMessage(e.message || "Unable to send gift.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.kicker}>AMORA PRIVATE COLLECTION</Text>
              <Text style={s.title}>Send something unforgettable</Text>
              <Text style={s.sub}>Luxury gifts designed to feel rare, expressive and alive.</Text>
            </View>
            <Pressable style={s.close} onPress={onClose}><Text style={s.closeText}>×</Text></Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categories}>
            {categories.map((item) => (
              <Pressable key={item} style={[s.tab, category === item && s.tabActive]} onPress={() => setCategory(item)}>
                <Text style={[s.tabText, category === item && s.tabTextActive]}>{item === "all" ? "All" : item[0].toUpperCase()+item.slice(1)}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {loading ? <ActivityIndicator color={theme.pink} style={{ marginVertical: 30 }} /> : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.gifts}>
              {visible.map((gift) => {
                const r = RARITY[String(gift.rarity || "common").toLowerCase()] || RARITY.common;
                const active = selected?.id === gift.id;
                return (
                  <Pressable key={gift.id} onPress={() => { setSelected(gift); setQuantity(1); setMessage(""); }}
                    style={[s.card, active && { borderColor:r.accent, shadowColor:r.accent }]}>
                    <Text style={[s.rarity,{color:r.accent}]}>{r.label.toUpperCase()}</Text>
                    <View style={s.art}><GiftIcon name={gift.name} glyph={gift.glyph} rarity={gift.rarity} size={78} animated={gift.rarity === "legendary" || gift.rarity === "mythic"} /></View>
                    <Text style={s.name} numberOfLines={1}>{gift.name}</Text>
                    <Text style={s.price}>◉ {Number(gift.coin_price || 0).toLocaleString()}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {selected && (
            <View style={[s.selected,{borderColor:`${meta.accent}66`}]}>
              <GiftIcon name={selected.name} glyph={selected.glyph} rarity={selected.rarity} size={86} animated />
              <View style={{flex:1}}>
                <Text style={[s.rarity,{color:meta.accent}]}>{meta.label.toUpperCase()}</Text>
                <Text style={s.selectedName}>{selected.name}</Text>
                <Text style={s.selectedDesc}>{selected.description || "A premium Amora gesture, crafted for the moment."}</Text>
                <View style={s.qtyRow}>
                  <Pressable style={s.qty} onPress={() => setQuantity((q)=>Math.max(1,q-1))}><Text style={s.qtyText}>−</Text></Pressable>
                  <Text style={s.qtyNumber}>{quantity}</Text>
                  <Pressable style={s.qty} onPress={() => setQuantity((q)=>Math.min(100,q+1))}><Text style={s.qtyText}>+</Text></Pressable>
                  <Text style={s.total}>◉ {(Number(selected.coin_price || 0)*quantity).toLocaleString()}</Text>
                </View>
              </View>
              <Pressable style={s.send} disabled={sending} onPress={sendGift}><Text style={s.sendText}>{sending ? "…" : "Send"}</Text></Pressable>
            </View>
          )}
          {!!message && <Text style={s.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const s=StyleSheet.create({
  overlay:{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(0,0,0,.55)"},
  sheet:{maxHeight:"88%",backgroundColor:"#0d0919",borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:"rgba(255,255,255,.10)",padding:14,paddingBottom:24,shadowColor:"#000",shadowOpacity:.55,shadowRadius:35,shadowOffset:{width:0,height:-12}},
  handle:{width:42,height:4,borderRadius:2,backgroundColor:"rgba(255,255,255,.18)",alignSelf:"center",marginBottom:14},
  header:{flexDirection:"row",gap:10,alignItems:"flex-start"},kicker:{color:"#d9a4ff",fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:19,fontWeight:"900",marginTop:4},sub:{color:theme.dim,fontSize:10,marginTop:3},
  close:{width:38,height:38,borderRadius:19,backgroundColor:"rgba(255,255,255,.05)",borderWidth:1,borderColor:"rgba(255,255,255,.10)",alignItems:"center",justifyContent:"center"},closeText:{color:"#fff",fontSize:25},
  categories:{gap:7,paddingVertical:12},tab:{borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:"rgba(255,255,255,.03)",borderRadius:999,paddingHorizontal:12,paddingVertical:7},tabActive:{backgroundColor:theme.pink,borderColor:theme.pink},tabText:{color:"#82788d",fontSize:9},tabTextActive:{color:"#fff",fontWeight:"900"},
  gifts:{gap:9,paddingBottom:12},card:{width:112,height:156,borderRadius:20,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:"#171225",padding:8,alignItems:"center",shadowColor:"#000",shadowOpacity:.2,shadowRadius:12,shadowOffset:{width:0,height:7}},rarity:{fontSize:7,fontWeight:"900",letterSpacing:1.2},art:{height:92,width:96,alignItems:"center",justifyContent:"center"},name:{color:"#fff",fontSize:9,fontWeight:"900",maxWidth:95},price:{color:theme.gold,fontSize:9,fontWeight:"900",marginTop:4},
  selected:{flexDirection:"row",alignItems:"center",gap:9,padding:9,borderWidth:1,borderRadius:20,backgroundColor:"rgba(255,255,255,.045)",marginTop:2},selectedName:{color:"#fff",fontSize:15,fontWeight:"900",marginTop:2},selectedDesc:{color:theme.dim,fontSize:9,marginTop:3},qtyRow:{flexDirection:"row",alignItems:"center",gap:7,marginTop:7},qty:{width:26,height:26,borderRadius:8,backgroundColor:"#17121f",borderWidth:1,borderColor:"rgba(255,255,255,.1)",alignItems:"center",justifyContent:"center"},qtyText:{color:"#fff"},qtyNumber:{color:"#fff",fontWeight:"900",fontSize:10},total:{color:theme.gold,fontWeight:"900",fontSize:9},send:{backgroundColor:theme.pink,borderRadius:13,paddingHorizontal:14,paddingVertical:12},sendText:{color:"#fff",fontWeight:"900",fontSize:10},message:{color:"#ff9bd4",fontSize:10,textAlign:"center",marginTop:8}
});
