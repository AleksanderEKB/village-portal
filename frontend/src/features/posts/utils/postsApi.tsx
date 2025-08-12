import axiosInstance from '../../../axiosInstance';
import { PostExtended } from '../../../types/globalTypes';

export async function fetchPost(postId: string) {
  const res = await axiosInstance.get<PostExtended>(`/api/post/${postId}/`);
  return res.data;
}

export async function createPost(formData: FormData) {
  return axiosInstance.post('/api/post/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function updatePost(postId: string, formData: FormData) {
  return axiosInstance.put(`/api/post/${postId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
