// components/PhotoUploader.tsx
import { useState } from 'react';
import { View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadPhoto } from '@/services/uploads'; // we'll create this

export const PhotoUploader = ({ onUploadSuccess }: { onUploadSuccess: (photo: any) => void }) => {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop() || 'photo.jpg';
      const type = 'image/jpeg';

      setUploading(true);
      try {
        const photo = await uploadPhoto({ uri, name: filename, type });
        onUploadSuccess(photo);
        Alert.alert('Success', 'Photo uploaded!');
      } catch (error) {
        Alert.alert('Error', 'Upload failed');
        console.error(error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} disabled={uploading} style={{ padding: 16 }}>
      {uploading ? <ActivityIndicator /> : <Ionicons name="camera-outline" size={28} color="#fff" />}
    </TouchableOpacity>
  );
};
