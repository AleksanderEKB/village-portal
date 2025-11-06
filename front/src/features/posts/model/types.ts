// front/src/features/posts/model/types.ts
import type { UUIDHex } from '../../auth/model/types';

export type AuthorShort = {
  id: UUIDHex;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string | null;
};

export type Post = {
  id: UUIDHex;
  author: AuthorShort;
  content: string;
  short_content?: string; // <- добавлено для сниппета с бэка
  image?: string | null;
  likes_count: number;
  is_liked: boolean;
  comments_count: number;
  created: string;
  updated: string;
};

export type Comment = {
  id: UUIDHex;
  author: AuthorShort;
  content: string;
  created: string;
  updated: string;
};

export type PostsState = {
  list: Post[];
  byId: Record<string, Post | undefined>;
  commentsByPost: Record<string, Comment[] | undefined>;
  loading: boolean;
  error: string | null;
  creating: boolean;
  togglingLike: Record<string, boolean>;
  commenting: Record<string, boolean>;
};
