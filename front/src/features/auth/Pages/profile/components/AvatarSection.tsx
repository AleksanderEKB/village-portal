// front/src/features/auth/Pages/profile/components/AvatarSection.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../app/hook';
import { selectUser } from '../../../model/selectors';
import { updateProfileThunk } from '../../../model/authSlice';
import AvatarPreview from '../../../ui/Avatar/AvatarPreview';
import styles from '../profile.module.scss';

const DEFAULT_AVATAR_URL = '/media/default/default_avatar.jpeg';

const AvatarSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [pendingAvatarFile, setPendingAvatarFile] = React.useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = React.useState<string>(DEFAULT_AVATAR_URL);
  const [hasCustomAvatar, setHasCustomAvatar] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!user) return;
    const hasCustom = !!user.avatar;
    setHasCustomAvatar(hasCustom);
    setCurrentAvatarUrl(hasCustom ? (user.avatar as string) : DEFAULT_AVATAR_URL);
    setPendingAvatarFile(null);
  }, [user]);

  if (!user) return null;

  const triggerAvatarFilePick = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setPendingAvatarFile(file);
    setHasCustomAvatar(true);

    try {
      await dispatch(
        updateProfileThunk({
          userId: user.id,
          payload: { avatar: file },
        })
      ).unwrap();
    } catch {
      setPendingAvatarFile(null);
      setHasCustomAvatar(!!user.avatar);
      setCurrentAvatarUrl(!!user.avatar ? (user.avatar as string) : DEFAULT_AVATAR_URL);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onRemoveAvatar = async () => {
    const prevHasCustom = hasCustomAvatar;
    const prevUrl = currentAvatarUrl;

    setPendingAvatarFile(null);
    setHasCustomAvatar(false);
    setCurrentAvatarUrl(DEFAULT_AVATAR_URL);

    try {
      await dispatch(
        updateProfileThunk({
          userId: user.id,
          payload: { avatar: null },
        })
      ).unwrap();
    } catch {
      setHasCustomAvatar(prevHasCustom);
      setCurrentAvatarUrl(prevUrl);
    }
  };

  return (
    <div className={styles.avatarBlock}>
      <AvatarPreview
        file={pendingAvatarFile}
        currentUrl={currentAvatarUrl}
        hasCustom={hasCustomAvatar}
        defaultUrl={DEFAULT_AVATAR_URL}
        onChangeRequest={triggerAvatarFilePick}
        onRemove={onRemoveAvatar}
        label={undefined}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onAvatarFilePicked}
      />
    </div>
  );
};

export default AvatarSection;
