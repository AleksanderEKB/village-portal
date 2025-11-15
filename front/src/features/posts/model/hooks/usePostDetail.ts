// front/src/features/posts/model/hooks/usePostDetail.ts
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../app/hook';
import {
  fetchPostThunk,
  deletePostThunk,
  updatePostThunk,
  toggleLikeThunk
} from '../slice';
import type { Post } from '../../model/types';
import { selectIsAuth } from '../../../auth/model/selectors';

export function usePostDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const post: Post | undefined = useAppSelector((s) =>
    id ? s.posts.byId[id] : undefined
  );
  const isAuth = useAppSelector(selectIsAuth);
  const meId = useAppSelector((s: any) => s?.auth?.user?.id);
  const isOwner = Boolean(isAuth && meId && post?.author?.id && meId === post?.author?.id);
  const toggling = useAppSelector((s) => (id ? s.posts.togglingLike[id] : false));

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(post?.content || '');

  const [viewerOpen, setViewerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    dispatch(fetchPostThunk({ id }));
  }, [dispatch, id]);

  React.useEffect(() => {
    setDraft(post?.content || '');
  }, [post?.content]);

  React.useEffect(() => {
    if (!viewerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [viewerOpen]);

  const onEditClick = () => {
    setMenuOpen(false);
    setEditing(true);
  };

  const onDeleteClick = async () => {
    setMenuOpen(false);
    if (!post) return;
    if (!window.confirm('Удалить пост без возможности восстановления?')) return;
    await dispatch(deletePostThunk({ id: post.id })).unwrap();
    navigate('/posts');
  };

  const onSaveEdit = async () => {
    if (!post) return;
    await dispatch(updatePostThunk({ id: post.id, content: draft })).unwrap();
    setEditing(false);
  };

  const onCancelEdit = () => {
    setEditing(false);
    setDraft(post?.content || '');
  };

  const onLike = () => {
    if (!post || !isAuth || toggling) return;
    dispatch(toggleLikeThunk({ id: post.id }));
  };

  return {
    id,
    post,
    isAuth,
    isOwner,
    toggling,

    menuOpen,
    setMenuOpen,

    editing,
    setEditing,
    draft,
    setDraft,

    viewerOpen,
    setViewerOpen,

    onEditClick,
    onDeleteClick,
    onSaveEdit,
    onCancelEdit,
    onLike,
  };
}
