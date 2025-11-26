// src/features/posts/ui/CreatePostForm.tsx
import React from 'react';
import styles from './createPostForm.module.scss';

import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { selectIsAuth } from '../../auth/model/selectors';

import { toast } from 'react-toastify';

import ImagePickerModal from '../../shared/components/image-picker/ImagePickerModal';
import ImageInlinePreview from '../../shared/components/image-picker/ImageInlinePreview';
import AnimatedCollapse from '../../shared/components/collapse/AnimatedCollapse';

import { FaFileImage, FaCheckDouble, FaCircleXmark, FaCirclePlus } from 'react-icons/fa6';

import { useTextareaAutoResize } from '../model/hooks/useTextareaAutoResize';
import { useAddButtonFade } from '../model/hooks/useAddButtonFade';
import { useImagePickerState } from '../model/hooks/useImagePickerState';
import { useCreatePostForm } from '../model/hooks/useCreatePostForm';
import { ADD_POST_BTN_FADE_MS, DEFAULT_POST_IMAGE_URL } from '../model/constants';

const CreatePostForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);

  const { textRef, autoResize, focus } = useTextareaAutoResize();
  const { addBtnVisible, hideWithFade, showWithFade } = useAddButtonFade({ fadeMs: ADD_POST_BTN_FADE_MS });
  const { file, pickerOpen, openPicker, closePicker, confirmPicker, removeSelected } = useImagePickerState(null);

  const { isOpen, openForm, closeForm, content, setContent, onChangeContent, onSubmit, resetForm } =
    useCreatePostForm({
      dispatch,
      onError: (msg) => toast.error(msg),
      onAfterSuccess: () => {
        // При успешной публикации запускаем обратную анимацию:
        // 1) сразу показываем кнопку (начинается её раскрытие)
        // 2) одновременно закрываем форму (она схлопывается)
        showWithFade();
        closeForm();
      },
    });

  React.useEffect(() => {
    autoResize();
  }, [autoResize, content]);

  React.useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        autoResize();
        focus();
      });
    }
  }, [isOpen, autoResize, focus]);

  if (!isAuth) return null;

  const handleOpenForm = () => {
    // Стартуем скрытие кнопки и параллельно раскрываем форму — строго симметрично
    hideWithFade();
    openForm();
  };

  const handleAfterClose = () => {
    // После завершения схлопывания только сбрасываем состояние формы
    resetForm(() => requestAnimationFrame(() => autoResize()));
    // Кнопку НЕ трогаем — она уже вернулась через showWithFade при старте закрытия
  };

  const handleCloseForm = () => {
    // При отмене — обратная анимация: показать кнопку + закрыть форму
    showWithFade();
    closeForm();
  };

  return (
    <>
      <div
        className={[
          styles.addButtonBox,
          addBtnVisible ? styles.addBtnVisible : styles.addBtnHidden,
        ].join(' ')}
      >
        <button type="button" className={styles.addPostBtn} onClick={handleOpenForm}>
          <span className={styles.addPostBtnIcon} aria-hidden="true">
            <FaCirclePlus />
          </span>
          <span className={styles.addPostBtnLabel}>Добавить пост</span>
        </button>
      </div>

      <AnimatedCollapse
        isOpen={isOpen}
        className={styles.collapseWrapper}
        innerClassName={styles.collapseInner}
        heightOpenDuration={820}
        heightCloseDuration={760}
        heightOpenEasing="cubic-bezier(0.22, 0.72, 0.22, 1)"
        heightCloseEasing="cubic-bezier(0.2, 0.6, 0.2, 1)"
        contentInDuration={560}
        contentOutDuration={660}
        contentInEasing="cubic-bezier(0.2, 0.8, 0.2, 1)"
        contentOutEasing="cubic-bezier(0.2, 0.6, 0.2, 1)"
        translateY={12}
        opacityFrom={0}
        unmountOnClose={false}
        onAfterClose={handleAfterClose}
      >
        <form
          className={styles.createForm}
          onSubmit={(e) => onSubmit(e, file)}
        >
          <textarea
            ref={textRef}
            placeholder="Что у вас нового?"
            value={content}
            onChange={(e) => onChangeContent(e, autoResize)}
          />

          {file && (
            <div className={styles.imagePreviewSlot}>
              <ImageInlinePreview file={file} onRemove={removeSelected} />
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.actionBtn} onClick={openPicker}>
              <FaFileImage />
            </button>

            <button type="submit" className={styles.actionBtn}>
              <FaCheckDouble />
            </button>

            <button type="button" className={styles.actionBtn} onClick={handleCloseForm}>
              <FaCircleXmark />
            </button>
          </div>
        </form>
      </AnimatedCollapse>

      <ImagePickerModal
        open={pickerOpen}
        onClose={closePicker}
        initialFile={file}
        onConfirm={confirmPicker}
        onError={(msg) => toast.error(msg)}
        defaultImageUrl={DEFAULT_POST_IMAGE_URL}
      />
    </>
  );
};

export default CreatePostForm;
