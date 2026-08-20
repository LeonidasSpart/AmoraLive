import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

export default function Store({ navigation }) {
  const [cosmetics, setCosmetics] = useState([]);

  useEffect(() => {
    axios.get('https://api.amoramatch.one/store/catalog', {
      headers: { Authorization: `Bearer YOUR_TOKEN` }
    }).then(res => setCosmetics(res.data));
  }, []);

  const purchase = (id) => {
    axios.post('https://api.amoramatch.one/store/purchase', { cosmeticId: id }, {
      headers: { Authorization: `Bearer YOUR_TOKEN` }
    }).then(() => alert('Purchased!'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ Amora Aura Boutique</Text>
      <FlatList
        data={cosmetics}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price_coins} coins</Text>
            <TouchableOpacity style={styles.buyBtn} onPress={() => purchase(item.id)}>
              <Text style={styles.buyText}>Buy (7 days)</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF6B9D', marginBottom: 20 },
  card: { backgroundColor: '#1e1e32', borderRadius: 12, padding: 16, marginBottom: 16 },
  image: { width: '100%', height: 150, borderRadius: 8 },
  name: { color: '#fff', fontSize: 18, marginTop: 8 },
  price: { color: '#FFD700', fontSize: 16 },
  buyBtn: { backgroundColor: '#FF6B9D', padding: 12, borderRadius: 8, marginTop: 8 },
  buyText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
