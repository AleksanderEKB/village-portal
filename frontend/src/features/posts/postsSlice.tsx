// frontend/src/features/posts/postsSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';
import { PostExtended, Comment, UserWithAvatar } from '../../types/globalTypes';
// Импортируем экшен обновления профиля
import { updateUserProfile } from '../userProfile/userProfileSlice';

export interface PostsState {
    posts: PostExtended[];
    post: PostExtended | null;
    comments: Record<number, Comment[]>;
    loading: boolean;
    error: string | null;
}

const initialState: PostsState = {
    posts: [],
    post: null,
    comments: {},
    loading: false,
    error: null,
};

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const res = await axiosInstance.get<PostExtended[]>('/api/post/');
    return res.data;
});

export const fetchPostById = createAsyncThunk('posts/fetchPostById', async (id: string) => {
    const res = await axiosInstance.get<PostExtended>(`/api/post/${id}/`);
    return res.data;
});

export const fetchComments = createAsyncThunk('posts/fetchComments', async (postId: number) => {
    const res = await axiosInstance.get<Comment[]>(`/api/post/${postId}/comments/`);
    return { postId, comments: res.data };
});

export const createComment = createAsyncThunk(
    'posts/createComment',
    async (
        { postId, commentData }: { postId: number; commentData: Partial<Comment> },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.post<Comment>(`/api/post/${postId}/comments/`, commentData);
            return { postId, comment: res.data };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const likePost = createAsyncThunk(
    'posts/likePost',
    async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
        if (isLiked) {
            await axiosInstance.post(`/api/post/${postId}/remove_like/`);
        } else {
            await axiosInstance.post(`/api/post/${postId}/like/`);
        }
        return { postId, isLiked };
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (postId: number) => {
        await axiosInstance.delete(`/api/post/${postId}/`);
        return postId;
    }
);

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearPost(state) { state.post = null; },
        setCommentText(state, action: PayloadAction<{ postId: number; text: string }>) {
            // Не используется в этом слайсе, но можно реализовать для единого source of truth
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => { state.loading = true; })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.posts = action.payload;
                state.loading = false;
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
                const post = state.posts.find(p => p.id === postId);
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
                state.posts = state.posts.filter(p => p.id !== action.payload);
            })
            // === ДЛЯ МОМЕНТАЛЬНОГО ОБНОВЛЕНИЯ АВТОРА ВО ВСЕХ ПОСТАХ ===
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                const updatedUser = action.payload;
                state.posts = state.posts.map(post =>
                    post.author.id === updatedUser.id
                        ? { ...post, author: updatedUser }
                        : post
                );
                if (state.post && state.post.author.id === updatedUser.id) {
                    state.post = { ...state.post, author: updatedUser };
                }
            });
    },
});

export default postsSlice.reducer;
export const { clearPost } = postsSlice.actions;
