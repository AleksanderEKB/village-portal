// front/src/features/auth/Pages/AuthPage.tsx
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthError, selectAuthLoading } from '../model/selectors';
import { useLocation } from 'react-router-dom';
import styles from './auth.module.scss';
import { useAuthForm } from '../hooks/useAuthForm';
import { getInitialMode } from '../utils/getInitialMode';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import AuthTabs from '../ui/Tabs/AuthTabs';
import AuthInputField from '../ui/Auth/AuthInputField';
import FieldNames from '../ui/Names/FieldNames';
import PhoneField from '../ui/Phone/PhoneField';
import PasswordSection from '../ui/Password/PasswordSection';
import AvatarField from '../ui/Avatar/AvatarField';
import AuthActions from '../ui/Actions/AuthActions';
import PasswordHintsModal from '../ui/Modals/PasswordHintsModal';
import ForgotPasswordModal from '../ui/Modals/ForgotPasswordModal';
import { useAuthHandlers } from '../hooks/useAuthHandlers';

const AuthPage: React.FC = () => {
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

  // Extracted handlers
  const { switchTo, onSubmit, handleForgotPassword } = useAuthHandlers({
    mode,
    setMode,
    fields,
    errors,
    passwordCheck,
    setLocalError,
    submitAuth,
    fpEmail,
    setFpOpen,
  });

  // Проверка всех обязательных полей и ошибок
  const isButtonDisabled = useMemo(() => {
    // Проверяем наличие ошибок
    const hasErrors = Object.values(errors).some(Boolean);

    // Проверка обязательных полей для login
    if (mode === 'login') {
      if (!fields.email || !fields.password) return true;
    }

    // Проверка обязательных полей для register
    if (mode === 'register') {
      if (
        !fields.email ||
        !fields.password ||
        !fields.confirmPassword ||
        !fields.first_name ||
        !fields.last_name ||
        !fields.phone_number // если телефон не обязателен, убери эту строку
      ) {
        return true;
      }
    }

    // Если есть ошибки или localError
    return hasErrors || !!localError;
  }, [mode, fields, errors, localError]);

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
          placeholder="Введите свой Email"
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
              placeholder="Введите свое имя"
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
              placeholder='Введите свою фамилию'
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
          <AvatarField
            file={fields.avatar}
            error={errors.avatar ?? null}
            onRemove={handleRemoveAvatar}
            onChange={(file) => handleFieldChange('avatar', file)}
            inputId="avatar"
            label="Аватар"
            describedById="avatar-error"
            defaultUrl="/media/default/default_avatar.jpeg"
          />
        )}

        <AuthActions
          loading={loading}
          mode={mode}
          disabled={isButtonDisabled}
          onSwitch={switchTo}
        />
      </form>

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
