// frontend/src/features/posts/postsSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';
import { PostExtended, Comment, UserWithAvatar } from '../../types/globalTypes';
import { updateUserProfile } from '../userProfile/userProfileSlice';

// Тип ответа API с пагинацией
export type PostsApiResponse = {
  results: PostExtended[];
  count: number;
  next: string | null;
  previous: string | null;
};

export interface PostsState {
  posts: PostExtended[];
  post: PostExtended | null;
  comments: Record<number, Comment[]>;
  loading: boolean;
  error: string | null;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

const initialState: PostsState = {
  posts: [],
  post: null,
  comments: {},
  loading: false,
  error: null,
  count: undefined,
  next: null,
  previous: null,
};

export const fetchPosts = createAsyncThunk<PostsApiResponse, { limit?: number; offset?: number } | void>(
  'posts/fetchPosts',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<PostsApiResponse>('/api/post/', { params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки постов');
    }
  }
);

export const fetchPostById = createAsyncThunk<PostExtended, string>(
  'posts/fetchPostById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<PostExtended>(`/api/post/${id}/`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки поста');
    }
  }
);

export const fetchComments = createAsyncThunk<{ postId: number; comments: Comment[] }, number>(
  'posts/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<Comment[]>(`/api/post/${postId}/comments/`);
      return { postId, comments: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев');
    }
  }
);

export const createComment = createAsyncThunk<
  { postId: number; comment: Comment },
  { postId: number; commentData: Partial<Comment> }
>('posts/createComment', async ({ postId, commentData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post<Comment>(`/api/post/${postId}/comments/`, commentData);
    return { postId, comment: res.data };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || 'Ошибка создания комментария');
  }
});

export const likePost = createAsyncThunk<{ postId: number; isLiked: boolean }, { postId: number; isLiked: boolean }>(
  'posts/likePost',
  async ({ postId, isLiked }) => {
    if (isLiked) {
      await axiosInstance.post(`/api/post/${postId}/remove_like/`);
    } else {
      await axiosInstance.post(`/api/post/${postId}/like/`);
    }
    return { postId, isLiked };
  }
);

export const deletePost = createAsyncThunk<number, number>(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/post/${postId}/`);
      return postId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка удаления поста');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPost(state) {
      state.post = null;
    },
    setCommentText(state, action: PayloadAction<{ postId: number; text: string }>) {
      // Не используется — реализуй при необходимости
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.post = action.payload;
        state.loading = false;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.postId] = action.payload.comments;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        state.comments[postId] = [comment, ...(state.comments[postId] || [])];
        const post = state.posts.find((p) => p.id === postId);
        if (post) post.comments_count += 1;
        if (state.post && state.post.id === postId) state.post.comments_count += 1;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, isLiked } = action.payload;
        for (const post of state.posts) {
          if (post.id === postId) {
            post.liked = !isLiked;
            post.likes_count = (post.likes_count || 0) + (isLiked ? -1 : 1);
          }
        }
        if (state.post && state.post.id === postId) {
          state.post.liked = !isLiked;
          state.post.likes_count = (state.post.likes_count || 0) + (isLiked ? -1 : 1);
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        state.posts = state.posts.map((post) =>
          post.author.id === updatedUser.id ? { ...post, author: updatedUser } : post
        );
        if (state.post && state.post.author.id === updatedUser.id) {
          state.post = { ...state.post, author: updatedUser };
        }
      });
  },
});

export default postsSlice.reducer;
export const { clearPost } = postsSlice.actions;
