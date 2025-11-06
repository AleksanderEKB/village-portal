// front/src/features/posts/api/api.ts
import axiosInstance, { postForm } from '../../../axiosInstance';
import type { Post, Comment } from '../model/types';

export async function apiFetchPosts(): Promise<Post[]> {
  const { data } = await axiosInstance.get<Post[]>('/api/posts/');
  return data;
}

export async function apiFetchPost(id: string): Promise<Post> {
  const { data } = await axiosInstance.get<Post>(`/api/posts/${id}/`);
  return data;
}

export async function apiToggleLike(postId: string): Promise<{ liked: boolean; likes_count: number }> {
  const { data } = await axiosInstance.post<{ liked: boolean; likes_count: number }>(
    `/api/posts/${postId}/toggle-like/`
  );
  return data;
}

export async function apiFetchComments(postId: string): Promise<Comment[]> {
  const { data } = await axiosInstance.get<Comment[]>(`/api/posts/${postId}/comments/`);
  return data;
}

export async function apiAddComment(postId: string, content: string): Promise<Comment> {
  const { data } = await axiosInstance.post<Comment>(`/api/posts/${postId}/comments/`, { content });
  return data;
}

export async function apiCreatePost(payload: { content: string; image?: File | null }): Promise<Post> {
  const form = new FormData();
  form.append('content', payload.content ?? '');
  if (payload.image) form.append('image', payload.image);
  const { data } = await postForm<Post>('/api/posts/', form);
  return data;
}

/** UPDATE (PATCH) поста: ТОЛЬКО content */
export async function apiUpdatePost(
  id: string,
  payload: { content: string }
): Promise<Post> {
  const { data } = await axiosInstance.patch<Post>(`/api/posts/${id}/`, { content: payload.content });
  return data;
}

/** DELETE поста */
export async function apiDeletePost(id: string): Promise<void> {
  await axiosInstance.delete(`/api/posts/${id}/`);
}
