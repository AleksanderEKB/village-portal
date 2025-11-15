// front/src/features/posts/model/hooks/useComments.ts
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/hook';
import { addCommentThunk, fetchCommentsThunk } from '../../model/slice';

export function useComments(postId: string | undefined, newestOnTop = false) {
  const dispatch = useAppDispatch();

  const comments =
    useAppSelector((s) => (postId ? s.posts.commentsByPost[postId] : undefined)) || [];

  const commenting = useAppSelector((s) => (postId ? s.posts.commenting[postId] : false));

  const [text, setText] = React.useState('');

  React.useEffect(() => {
    if (!postId) return;
    dispatch(fetchCommentsThunk({ postId }));
  }, [dispatch, postId]);

  const onSubmitComment = async () => {
    if (!postId || !text.trim()) return;
    await dispatch(addCommentThunk({ postId, content: text.trim() })).unwrap();
    setText('');
  };

  const orderedComments = React.useMemo(() => {
    if (newestOnTop) return [...comments].reverse();
    return comments;
  }, [comments, newestOnTop]);

  return {
    comments: orderedComments,
    text,
    setText,
    commenting,
    onSubmitComment,
  };
}
