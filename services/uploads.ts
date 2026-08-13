import api from './api';

export const uploadPhoto = async (file: { uri: string; name: string; type: string }) => {
  const formData = new FormData();
  formData.append('photo', file as any);

  const response = await api.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
