// frontend/src/features/posts/utils/postsApi.ts
import axiosInstance from '../../../axiosInstance';
import type { PostExtended } from '../../../types/globalTypes';

// Список постов (пагинация)
export type PostsApiResponse = {
  results: PostExtended[];
  count: number;
  next: string | null;
  previous: string | null;
};

export async function apiFetchPosts(params?: { limit?: number; offset?: number }) {
  const res = await axiosInstance.get<PostsApiResponse>('/api/post/', { params });
  return res.data;
}

export async function apiFetchPost(postId: string) {
  const res = await axiosInstance.get<PostExtended>(`/api/post/${postId}/`);
  return res.data;
}

export async function apiCreatePost(formData: FormData) {
  return axiosInstance.post('/api/post/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function apiUpdatePost(postId: string, formData: FormData) {
  return axiosInstance.put(`/api/post/${postId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function apiDeletePost(postId: number) {
  return axiosInstance.delete(`/api/post/${postId}/`);
}

export async function apiLikePost(postId: number) {
  return axiosInstance.post(`/api/post/${postId}/like/`);
}

export async function apiRemoveLike(postId: number) {
  return axiosInstance.post(`/api/post/${postId}/remove_like/`);
}
