// frontend/src/features/posts/postSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { PostExtended, PostComment, UserWithAvatar } from '../../types/globalTypes';
import { updateUserProfile } from '../userProfile/userProfileSlice';

// Инкапсулированные API
import {
  apiFetchPosts,
  apiFetchPost,
  apiDeletePost,
  apiLikePost,
  apiRemoveLike,
  type PostsApiResponse,
} from './utils/postsApi';
import {
  apiFetchComments,
  apiCreateComment,
  apiUpdateComment,
  apiDeleteComment,
} from './utils/commentsApi';

export interface PostsState {
  posts: PostExtended[];
  post: PostExtended | null;
  comments: Record<number, PostComment[]>;
  commentsNext: Record<number, string | null>;
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
  commentsNext: {},
  loading: false,
  error: null,
  count: undefined,
  next: null,
  previous: null,
};

// === Thunks ===

export const fetchPosts = createAsyncThunk<
  PostsApiResponse,
  { limit?: number; offset?: number },
  { rejectValue: string }
>('posts/fetchPosts', async (params, { rejectWithValue }) => {
  try {
    const data = await apiFetchPosts(params);
    return data;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки постов');
  }
});

export const fetchPostById = createAsyncThunk<PostExtended, string, { rejectValue: string }>(
  'posts/fetchPostById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await apiFetchPost(id);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки поста');
    }
  }
);

export const fetchComments = createAsyncThunk<
  { postId: number; comments: PostComment[]; next?: string | null; offset: number },
  { postId: number; limit?: number; offset?: number },
  { rejectValue: string }
>('posts/fetchComments', async ({ postId, limit = 4, offset = 0 }, { rejectWithValue }) => {
  try {
    const data = await apiFetchComments(postId, { limit, offset });
    return { postId, comments: data.results, next: data.next, offset };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки комментариев');
  }
});

export const createComment = createAsyncThunk<
  { postId: number; comment: PostComment },
  { postId: number; commentData: Partial<PostComment> },
  { rejectValue: string }
>('posts/createComment', async ({ postId, commentData }, { rejectWithValue }) => {
  try {
    const comment = await apiCreateComment(postId, commentData);
    return { postId, comment };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка создания комментария');
  }
});

export const updateComment = createAsyncThunk<
  { postId: number; comment: PostComment },
  { postId: number; commentId: number; commentData: Partial<PostComment> },
  { rejectValue: string }
>('posts/updateComment', async ({ postId, commentId, commentData }, { rejectWithValue }) => {
  try {
    const comment = await apiUpdateComment(postId, commentId, commentData);
    return { postId, comment };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка редактирования комментария');
  }
});

export const deleteComment = createAsyncThunk<
  { postId: number; commentId: number },
  { postId: number; commentId: number },
  { rejectValue: string }
>('posts/deleteComment', async ({ postId, commentId }, { rejectWithValue }) => {
  try {
    await apiDeleteComment(postId, commentId);
    return { postId, commentId };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка удаления комментария');
  }
});

export const likePost = createAsyncThunk<
  { postId: number; isLiked: boolean },
  { postId: number; isLiked: boolean },
  { rejectValue: string }
>('posts/likePost', async ({ postId, isLiked }, { rejectWithValue }) => {
  try {
    if (isLiked) {
      await apiRemoveLike(postId);
    } else {
      await apiLikePost(postId);
    }
    return { postId, isLiked };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка изменения лайка');
  }
});

export const deletePost = createAsyncThunk<number, number, { rejectValue: string }>(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await apiDeletePost(postId);
      return postId;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка удаления поста');
    }
  }
);

// === Slice ===

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPost(state) {
      state.post = null;
    },
    clearCommentsForPost(state, action: PayloadAction<number>) {
      delete state.comments[action.payload];
      delete state.commentsNext[action.payload];
    },
    setCommentText(state, action: PayloadAction<{ postId: number; text: string }>) {
      // Не используется — реализовать при необходимости
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const metaArg = (action.meta?.arg as { offset?: number } | undefined) ?? undefined;
        const offset = typeof metaArg?.offset === 'number' ? metaArg.offset : 0;

        if (offset === 0) {
          state.posts = action.payload.results;
        } else {
          state.posts = [...state.posts, ...action.payload.results];
        }

        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.post = action.payload;
        state.loading = false;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Ошибка загрузки поста';
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments, next, offset } = action.payload;
        if (offset === 0) {
          state.comments[postId] = comments;
        } else {
          state.comments[postId] = [...(state.comments[postId] || []), ...comments];
        }
        state.commentsNext[postId] = next || null;
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
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        state.comments[postId] = (state.comments[postId] || []).map((c) =>
          c.id === comment.id ? comment : c
        );
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        state.comments[postId] = (state.comments[postId] || []).filter((c) => c.id !== commentId);
        const post = state.posts.find((p) => p.id === postId);
        if (post && post.comments_count > 0) post.comments_count -= 1;
        if (state.post && state.post.id === postId && state.post.comments_count > 0) {
          state.post.comments_count -= 1;
        }
      });
  },
});

export default postsSlice.reducer;
export const { clearPost, clearCommentsForPost } = postsSlice.actions;
