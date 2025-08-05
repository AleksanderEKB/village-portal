import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { fetchComments, createComment, likePost, updateComment, deleteComment } from '../postsSlice';
import { PostExtended, UserWithAvatar, PostComment } from '../../../types/globalTypes';
import { toast } from 'react-toastify';

const ANIMATION_DURATION = 500;

export const usePostActions = ({
  post,
  isAuthenticated,
  user,
  showComments,
  setShowComments,
  commentTexts,
  setCommentTexts,
}: {
  post: PostExtended;
  isAuthenticated: boolean;
  user: UserWithAvatar | null;
  showComments: Record<number, boolean>;
  setShowComments: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  commentTexts: Record<number, string>;
  setCommentTexts: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) => {
  const dispatch = useAppDispatch();
  const comments = useAppSelector(state => state.posts.comments);
  const commentsNext = useAppSelector(state => state.posts.commentsNext);

  // --- UI состояние для анимаций
  const [visibleComments, setVisibleComments] = useState(showComments[post.id]);
  const [isHiding, setIsHiding] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [fadingComments, setFadingComments] = useState<number[]>([]);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- Эффекты для плавности
  useEffect(() => {
    if (showComments[post.id]) {
      setVisibleComments(true);
      setIsHiding(false);
    } else if (visibleComments) {
      setIsHiding(true);
      setTimeout(() => {
        setVisibleComments(false);
        setIsHiding(false);
      }, ANIMATION_DURATION);
    }
    // eslint-disable-next-line
  }, [showComments[post.id]]);

  useEffect(() => {
    if (commentTextareaRef.current) {
      commentTextareaRef.current.style.height = 'auto';
      commentTextareaRef.current.style.height = commentTextareaRef.current.scrollHeight + 'px';
    }
  }, [commentTexts[post.id]]);

  useEffect(() => {
    if (isHiding && comments[post.id]) {
      setFadingComments(comments[post.id].map((c: PostComment) => c.id));
      setTimeout(() => setFadingComments([]), ANIMATION_DURATION);
    }
  }, [isHiding, comments, post.id]);

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

  const handleShowCommentsClick = () => {
    if (!showComments[post.id]) {
      dispatch(fetchComments({ postId: post.id, offset: 0 }));
    }
    setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
  };

  const handleCommentInputChange = (value: string) => {
    setCommentTexts((prev) => ({ ...prev, [post.id]: value }));
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
    dispatch(updateComment({ postId: post.id, commentId: comment.id, commentData: { body: editCommentText } }));
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleDelete = (comment: PostComment) => {
    if (window.confirm('Удалить комментарий?')) {
      dispatch(deleteComment({ postId: post.id, commentId: comment.id }));
    }
  };

  const handleCommentTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleCommentInputChange(e.target.value);
    if (commentTextareaRef.current) {
      commentTextareaRef.current.style.height = 'auto';
      commentTextareaRef.current.style.height = commentTextareaRef.current.scrollHeight + 'px';
    }
  };

  return {
    comments,
    commentsNext,
    visibleComments,
    isHiding,
    editingCommentId,
    editCommentText,
    fadingComments,
    commentTextareaRef,
    handleLike,
    handleShowCommentsClick,
    handleCommentInputChange,
    handleCommentSubmit,
    handleLoadMore,
    isOwner,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleDelete,
    handleCommentTextareaChange,
    setEditCommentText,
  };
};
