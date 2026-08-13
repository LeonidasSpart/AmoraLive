import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<{ id: string; ingestUrl: string; playbackUrl: string } | null>(null);
  const router = useRouter();

  const startStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/live/create', { title: title.trim() });
      setStream(response.data);
      Alert.alert('Stream Created', `Your stream is live! Ingest URL: ${response.data.ingestUrl}`);
    } catch (error) {
      console.error('Start stream error:', error);
      Alert.alert('Error', 'Unable to start stream. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const endStream = async () => {
    if (!stream) return;
    try {
      await api.post(`/live/end/${stream.id}`);
      setStream(null);
      Alert.alert('Stream Ended', 'Your stream has been ended.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Unable to end stream');
    }
  };

  const copyIngestUrl = () => {
    if (stream?.ingestUrl) {
      // In React Native, you'd use Clipboard API; for now just alert
      Alert.alert('Copy URL', stream.ingestUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Go Live</Text>
          <View style={{ width: 24 }} />
        </View>

        {!stream ? (
          <>
            <View style={styles.iconCircle}>
              <Ionicons name="radio" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Start Streaming</Text>
            <Text style={styles.subtitle}>Broadcast to your audience live</Text>

            <TextInput
              style={styles.input}
              placeholder="Stream Title"
              placeholderTextColor={Colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <TouchableOpacity
              style={[styles.startButton, loading && styles.disabledButton]}
              onPress={startStream}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="radio" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Start Live Stream</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.streamInfo}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.streamTitle}>{title}</Text>
            <View style={styles.urlContainer}>
              <Text style={styles.urlLabel}>Ingest URL:</Text>
              <Text style={styles.urlValue} numberOfLines={1}>{stream.ingestUrl}</Text>
              <TouchableOpacity onPress={copyIngestUrl} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.streamId}>Stream ID: {stream.id}</Text>
            <TouchableOpacity style={[styles.endButton, styles.startButton]} onPress={endStream}>
              <Ionicons name="stop-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>End Stream</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  streamInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 8,
  },
  liveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  streamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  urlLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  urlValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  copyButton: {
    padding: 4,
  },
  streamId: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  endButton: {
    backgroundColor: '#dc3545',
  },
});
