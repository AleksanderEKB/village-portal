// frontend/src/features/posts/utils/commentsApi.ts
import axiosInstance from '../../../axiosInstance';
import type { PostComment } from '../../../types/globalTypes';

export type CommentsApiResponse = {
  results: PostComment[];
  next: string | null;
};

export async function apiFetchComments(postId: number, params?: { limit?: number; offset?: number }) {
  const res = await axiosInstance.get<CommentsApiResponse>(`/api/post/${postId}/comments/`, {
    params,
  });
  return res.data;
}

export async function apiCreateComment(postId: number, commentData: Partial<PostComment>) {
  const res = await axiosInstance.post<PostComment>(`/api/post/${postId}/comments/`, commentData);
  return res.data;
}

export async function apiUpdateComment(
  postId: number,
  commentId: number,
  commentData: Partial<PostComment>
) {
  const res = await axiosInstance.put<PostComment>(
    `/api/post/${postId}/comments/${commentId}/`,
    commentData
  );
  return res.data;
}

export async function apiDeleteComment(postId: number, commentId: number) {
  return axiosInstance.delete(`/api/post/${postId}/comments/${commentId}/`);
}
