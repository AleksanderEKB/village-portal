// front/src/features/posts/model/slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PostsState, Post, Comment } from './types';
import {
  apiFetchPosts, apiFetchPost, apiToggleLike,
  apiFetchComments, apiAddComment, apiCreatePost,
  apiUpdatePost, apiDeletePost
} from '../api/api';
import { pickMessageFromData } from '../../shared/utils/httpError';
import { toast } from 'react-toastify';

const initialState: PostsState = {
  list: [],
  byId: {},
  commentsByPost: {},
  loading: false,
  error: null,
  creating: false,
  togglingLike: {},
  commenting: {},
};

export const fetchPostsThunk = createAsyncThunk<Post[]>(
  'posts/fetchList',
  async () => await apiFetchPosts()
);

export const fetchPostThunk = createAsyncThunk<Post, { id: string }>(
  'posts/fetchOne',
  async ({ id }) => await apiFetchPost(id)
);

export const toggleLikeThunk = createAsyncThunk<
  { id: string; liked: boolean; likes_count: number },
  { id: string },
  { rejectValue: string }
>(
  'posts/toggleLike',
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await apiToggleLike(id);
      return { id, liked: res.liked, likes_count: res.likes_count };
    } catch (e: any) {
      const msg = pickMessageFromData(e?.response?.data) || 'Не удалось поставить лайк';
      return rejectWithValue(msg);
    }
  }
);

export const fetchCommentsThunk = createAsyncThunk<{ postId: string; comments: Comment[] }, { postId: string }>(
  'posts/fetchComments',
  async ({ postId }) => {
    const comments = await apiFetchComments(postId);
    return { postId, comments };
  }
);

export const addCommentThunk = createAsyncThunk<
  { postId: string; comment: Comment },
  { postId: string; content: string },
  { rejectValue: string }
>(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const comment = await apiAddComment(postId, content);
      return { postId, comment };
    } catch (e: any) {
      const msg = pickMessageFromData(e?.response?.data) || 'Не удалось отправить комментарий';
      return rejectWithValue(msg);
    }
  }
);

export const createPostThunk = createAsyncThunk<Post, { content: string; image?: File | null }, { rejectValue: string }>(
  'posts/create',
  async ({ content, image }, { rejectWithValue }) => {
    try {
      return await apiCreatePost({ content, image: image ?? null });
    } catch (e: any) {
      const msg = pickMessageFromData(e?.response?.data) || 'Не удалось создать пост';
      return rejectWithValue(msg);
    }
  }
);

/** UPDATE: ТОЛЬКО content */
export const updatePostThunk = createAsyncThunk<
  Post,
  { id: string; content: string },
  { rejectValue: string }
>(
  'posts/update',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      return await apiUpdatePost(id, { content });
    } catch (e: any) {
      const msg = pickMessageFromData(e?.response?.data) || 'Не удалось обновить пост';
      return rejectWithValue(msg);
    }
  }
);

/** DELETE */
export const deletePostThunk = createAsyncThunk<
  { id: string },
  { id: string },
  { rejectValue: string }
>(
  'posts/delete',
  async ({ id }, { rejectWithValue }) => {
    try {
      await apiDeletePost(id);
      return { id };
    } catch (e: any) {
      const msg = pickMessageFromData(e?.response?.data) || 'Не удалось удалить пост';
      return rejectWithValue(msg);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchPostsThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPostsThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
        a.payload.forEach(p => { s.byId[p.id] = p; });
      })
      .addCase(fetchPostsThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || 'Не удалось загрузить ленту';
      })

      .addCase(fetchPostThunk.fulfilled, (s, a) => {
        s.byId[a.payload.id] = a.payload;
        const idx = s.list.findIndex(p => p.id === a.payload.id);
        if (idx === -1) {
          s.list.unshift(a.payload);
        } else {
          s.list[idx] = a.payload;
        }
      })

      .addCase(toggleLikeThunk.pending, (s, a) => {
        const id = a.meta.arg.id;
        s.togglingLike[id] = true;
      })
      .addCase(toggleLikeThunk.fulfilled, (s, a) => {
        const { id, liked, likes_count } = a.payload;
        s.togglingLike[id] = false;

        if (s.byId[id]) {
          s.byId[id] = {
            ...(s.byId[id] as Post),
            is_liked: liked,
            likes_count
          };
        }

        const idx = s.list.findIndex(p => p.id === id);
        if (idx !== -1) {
          s.list[idx] = {
            ...s.list[idx],
            is_liked: liked,
            likes_count
          };
        }
      })
      .addCase(toggleLikeThunk.rejected, (s, a) => {
        const id = a.meta.arg.id;
        s.togglingLike[id] = false;
        if (a.payload) toast.error(a.payload);
      })

      .addCase(fetchCommentsThunk.fulfilled, (s, a) => {
        s.commentsByPost[a.payload.postId] = a.payload.comments;
      })

      .addCase(addCommentThunk.pending, (s, a) => {
        s.commenting[a.meta.arg.postId] = true;
      })
      .addCase(addCommentThunk.fulfilled, (s, a) => {
        const { postId, comment } = a.payload;
        s.commenting[postId] = false;

        const list = s.commentsByPost[postId] || [];
        s.commentsByPost[postId] = [...list, comment];

        if (s.byId[postId]) {
          s.byId[postId] = {
            ...(s.byId[postId] as Post),
            comments_count: (s.byId[postId] as Post).comments_count + 1
          };
        }

        const idx = s.list.findIndex(p => p.id === postId);
        if (idx !== -1) {
          s.list[idx] = {
            ...s.list[idx],
            comments_count: s.list[idx].comments_count + 1
          };
        }
      })
      .addCase(addCommentThunk.rejected, (s, a) => {
        const postId = a.meta.arg.postId;
        s.commenting[postId] = false;
        if (a.payload) toast.error(a.payload);
      })

      .addCase(createPostThunk.pending, (s) => { s.creating = true; })
      .addCase(createPostThunk.fulfilled, (s, a) => {
        s.creating = false;
        s.list.unshift(a.payload);
        s.byId[a.payload.id] = a.payload;
        toast.success('Пост опубликован');
      })
      .addCase(createPostThunk.rejected, (s, a) => {
        s.creating = false;
        if (a.payload) toast.error(a.payload);
      })

      /* === UPDATE: только контент === */
      .addCase(updatePostThunk.fulfilled, (s, a) => {
        const p = a.payload;
        s.byId[p.id] = p;
        const idx = s.list.findIndex(x => x.id === p.id);
        if (idx !== -1) s.list[idx] = p;
        toast.success('Пост обновлён');
      })
      .addCase(updatePostThunk.rejected, (s, a) => {
        if (a.payload) toast.error(a.payload);
      })

      /* === DELETE === */
      .addCase(deletePostThunk.fulfilled, (s, a) => {
        const { id } = a.payload;
        delete s.byId[id];
        s.list = s.list.filter(p => p.id !== id);
        delete s.commentsByPost[id];
        toast.success('Пост удалён');
      })
      .addCase(deletePostThunk.rejected, (s, a) => {
        if (a.payload) toast.error(a.payload);
      });
  }
});

export default postsSlice.reducer;
