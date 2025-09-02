// front/src/features/auth/Pages/AuthPage.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthError, selectAuthLoading } from '../model/selectors';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './auth.module.scss';
import { useAuthForm } from '../hooks/useAuthForm';
import { getInitialMode } from '../utils/getInitialMode';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import AvatarPreview from '../ui/Avatar/AvatarPreview';
import { toast } from 'react-toastify';
import { apiRequestPasswordReset } from '../api/api';
import AuthTabs from '../ui/Tabs/AuthTabs';
import AuthInputField from '../ui/Auth/AuthInputField';
import FieldNames from '../ui/Names/FieldNames';
import PhoneField from '../ui/Phone/PhoneField';
import PasswordSection from '../ui/Password/PasswordSection';
import AvatarField from '../ui/Avatar/AvatarField';
import AuthActions from '../ui/Actions/AuthActions';
import PasswordHintsModal from '../ui/Modals/PasswordHintsModal';
import ForgotPasswordModal from '../ui/Modals/ForgotPasswordModal';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const initialMode = getInitialMode(location.pathname);

  const {
    mode,
    setMode,
    fields,
    handleFieldChange,
    handleRemoveAvatar,
    localError,
    setLocalError,
    touched,
    errors,
    passwordCheck,
  } = useAuthForm(initialMode);

  const submitAuth = useAuthSubmit();

  const [isHintOpen, setHintOpen] = useState(false);
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState('');

  const switchTo = (m: 'login' | 'register') => {
    setMode(m);
    navigate(m === 'login' ? '/login' : '/register', { replace: true });
    setLocalError(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      const firstError =
        errors.email ||
        errors.first_name ||
        errors.last_name ||
        errors.password ||
        errors.confirmPassword ||
        errors.avatar ||
        passwordCheck.error;
      if (firstError) {
        setLocalError(firstError);
        return;
      }
    }

    submitAuth({
      mode,
      fields,
      setLocalError,
      onSuccess: () => {
        if (mode === 'register') {
          toast.success(
            'На ваш email отправлено письмо для подтверждения. Перейдите по ссылке из письма для активации аккаунта.',
            { autoClose: 8000 }
          );
        }
        navigate('/profile');
      },
    });
  };

  const handleForgotPassword = async () => {
    if (!fpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fpEmail)) {
      toast.error('Введите корректный email');
      return;
    }
    try {
      await apiRequestPasswordReset(fpEmail);
      toast.success('Если такой email существует, мы отправили письмо со ссылкой для сброса.');
      setFpOpen(false);
    } catch {
      toast.success('Если такой email существует, мы отправили письмо со ссылкой для сброса.');
      setFpOpen(false);
    }
  };

  return (
    <div className={styles.formWrap}>
      <AuthTabs mode={mode} switchTo={switchTo} error={error} localError={localError} />

      <form onSubmit={onSubmit} noValidate>
        <AuthInputField
          id="email"
          type="email"
          label="Email"
          value={fields.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleFieldChange('email', fields.email)}
          touched={!!touched.email}
          error={errors.email ?? undefined}
          required
          inputMode="email"
          autoComplete="email"
        />

        {mode === 'register' && (
          <>
            <FieldNames
              id="firstName"
              label="Имя"
              value={fields.first_name}
              onChange={(v) => handleFieldChange('first_name', v)}
              onBlur={() => handleFieldChange('first_name', fields.first_name)}
              required
              autoComplete="given-name"
              touched={!!touched.first_name}
              error={errors.first_name ?? null}
              describedById="firstName-error"
            />

            <FieldNames
              id="lastName"
              label="Фамилия"
              value={fields.last_name}
              onChange={(v) => handleFieldChange('last_name', v)}
              onBlur={() => handleFieldChange('last_name', fields.last_name)}
              required
              autoComplete="family-name"
              touched={!!touched.last_name}
              error={errors.last_name ?? null}
              describedById="lastName-error"
            />

            <PhoneField
              value={fields.phone_number}
              onChange={(v) => handleFieldChange('phone_number', v)}
              onBlur={() => handleFieldChange('phone_number', fields.phone_number)}
              touched={!!touched.phone_number}
              error={errors.phone_number ?? null}
            />
          </>
        )}

        <PasswordSection
          mode={mode}
          password={fields.password}
          confirmPassword={fields.confirmPassword}
          touchedPassword={!!touched.password}
          touchedConfirm={!!touched.confirmPassword}
          errorPassword={errors.password ?? null}
          errorConfirm={errors.confirmPassword ?? null}
          passwordCheck={passwordCheck}
          onOpenHint={() => setHintOpen(true)}
          onOpenForgot={() => setFpOpen(true)}
          onChangePassword={(v) => handleFieldChange('password', v)}
          onBlurPassword={() => handleFieldChange('password', fields.password)}
          onChangeConfirm={(v) => handleFieldChange('confirmPassword', v)}
          onBlurConfirm={() => handleFieldChange('confirmPassword', fields.confirmPassword)}
        />

        {mode === 'register' && (
          <>
            <AvatarField
              file={fields.avatar}
              error={errors.avatar ?? null}
              onRemove={handleRemoveAvatar}
              onChange={(file) => handleFieldChange('avatar', file)}
              inputId="avatar"
              label="Аватар (опционально)"
              describedById="avatar-error"
            />
          </>
        )}

        <AuthActions loading={loading} mode={mode} onSwitch={switchTo} />
      </form>

      <div className={styles.linksMuted}>
        <Link to="/">На главную</Link>
      </div>

      <PasswordHintsModal
        open={isHintOpen}
        onClose={() => setHintOpen(false)}
        passwordCheck={passwordCheck}
      />

      <ForgotPasswordModal
        open={fpOpen}
        onClose={() => setFpOpen(false)}
        fpEmail={fpEmail}
        onChangeEmail={setFpEmail}
        onSubmit={handleForgotPassword}
      />
    </div>
  );
};

export default AuthPage;
