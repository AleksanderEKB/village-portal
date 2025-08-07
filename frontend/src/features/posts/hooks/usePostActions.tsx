import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { fetchComments, createComment, likePost, updateComment, deleteComment } from '../postsSlice';
import { PostExtended, UserWithAvatar, PostComment } from '../../../types/globalTypes';
import { toast } from 'react-toastify';

export const usePostActions = ({
  post,
  isAuthenticated,
  user,
  commentTexts,
  setCommentTexts,
}: {
  post: PostExtended;
  isAuthenticated: boolean;
  user: UserWithAvatar | null;
  commentTexts: Record<number, string>;
  setCommentTexts: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) => {
  const dispatch = useAppDispatch();
  const comments = useAppSelector(state => state.posts.comments);
  const commentsNext = useAppSelector(state => state.posts.commentsNext);

  // Для auto-resize textarea, если понадобится
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- Редактирование/удаление комментария
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>('');

  // --- Обработчики
  const handleLike = () => {
    if (!isAuthenticated || !user) {
      alert('Хочешь лайкнуть — авторизуйся или зарегистрируйся!');
      return;
    }
    if (user.id === post.author.id) {
      toast.error('Свои посты не лайкаем');
      return;
    }
    dispatch(likePost({ postId: post.id, isLiked: !!post.liked }));
  };

  const handleCommentInputChange = (value: string) => {
    setCommentTexts((prev) => ({ ...prev, [post.id]: value }));
  };

  const handleCommentTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleCommentInputChange(e.target.value);
    if (commentTextareaRef.current) {
      commentTextareaRef.current.style.height = 'auto';
      commentTextareaRef.current.style.height = commentTextareaRef.current.scrollHeight + 'px';
    }
  };

  const handleCommentSubmit = () => {
    if (!isAuthenticated || !user) return;
    const text = commentTexts[post.id];
    if (text && text.trim()) {
      dispatch(createComment({ postId: post.id, commentData: { body: text, author: user.id, post: post.id } }));
      setCommentTexts((prev) => ({ ...prev, [post.id]: '' }));
    }
  };

  const handleLoadMore = () => {
    const currentComments = comments[post.id] || [];
    const offset = currentComments.length;
    dispatch(fetchComments({ postId: post.id, offset }));
  };

  // --- isOwner для комментариев
  const isOwner = (comment: PostComment) => {
    if (!user) return false;
    if (typeof comment.author !== "number" && comment.author.id) {
      return user.id === comment.author.id;
    }
    return false;
  };

  const handleEditStart = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.body);
  };

  const handleEditSave = (comment: PostComment) => {
    if (editCommentText.trim()) {
      dispatch(updateComment({ postId: post.id, commentId: comment.id, commentData: { body: editCommentText } }));
      setEditingCommentId(null);
      setEditCommentText('');
    }
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleDelete = (comment: PostComment) => {
    if (window.confirm('Удалить комментарий?')) {
      dispatch(deleteComment({ postId: post.id, commentId: comment.id }));
      if (editingCommentId === comment.id) {
        setEditingCommentId(null);
        setEditCommentText('');
      }
    }
  };

  return {
    comments,
    commentsNext,
    handleLike,
    handleCommentSubmit,
    handleLoadMore,
    handleCommentTextareaChange,
    setEditCommentText,
    editingCommentId,
    editCommentText,
    isOwner,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleDelete,
    commentTextareaRef,
  };
};
