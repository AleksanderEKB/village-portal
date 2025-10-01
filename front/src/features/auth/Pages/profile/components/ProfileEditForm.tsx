// front/src/features/auth/Pages/profile/components/ProfileEditForm.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../app/hook';
import { selectUser } from '../../../model/selectors';
import { updateProfileThunk } from '../../../model/authSlice';
import styles from '../profile.module.scss';

import { validateFirstName, validateLastName } from '../../../utils/validateAuthPage';
import DangerZone from './DangerZone';

type Props = {
  visible?: boolean;
  onCancel?: () => void;
  onSaved?: () => void;
};

const PHONE_RE = /^\+?[0-9]{7,18}$/;

const ProfileEditForm: React.FC<Props> = ({ visible = true, onCancel, onSaved }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  const [touched, setTouched] = React.useState<{ fn?: boolean; ln?: boolean; ph?: boolean }>({});
  const [errors, setErrors] = React.useState<{ fn?: string | null; ln?: string | null; ph?: string | null }>({});

  React.useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name ?? '');
    setLastName(user.last_name ?? '');
    setPhone(user.phone_number ?? '');
    setTouched({});
    setErrors({});
  }, [user]);

  if (!visible) return null;
  if (!user) return null;

  const userId: string = user.id;

  const validateAll = React.useCallback(() => {
    const fnErr = validateFirstName(firstName);
    const lnErr = validateLastName(lastName);
    const phErr = phone ? (PHONE_RE.test(phone) ? null : 'Некорректный номер') : null; // телефон опционален
    setErrors({ fn: fnErr, ln: lnErr, ph: phErr });
    return { fnErr, lnErr, phErr };
  }, [firstName, lastName, phone]);

  React.useEffect(() => {
    validateAll();
  }, [firstName, lastName, phone, validateAll]);

  const hasErrors = !!(errors.fn || errors.ln || errors.ph);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const { fnErr, lnErr, phErr } = validateAll();
    if (fnErr || lnErr || phErr) return;

    await dispatch(
      updateProfileThunk({
        userId,
        payload: { first_name: firstName, last_name: lastName, phone_number: phone || null },
      })
    ).unwrap();

    onSaved?.();
  }

  return (
    <>
      <form onSubmit={onSave} noValidate>
        <div className={styles.field}>
          <label htmlFor="fn">Имя</label>
          <input
            id="fn"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, fn: true }))}
            className={`${errors.fn && touched.fn ? styles.inputError : ''}`}
            aria-invalid={!!(errors.fn && touched.fn)}
            aria-describedby={errors.fn && touched.fn ? 'fn-error' : undefined}
          />
          {errors.fn && touched.fn && <div id="fn-error" className={styles.fieldError}>{errors.fn}</div>}
        </div>

        <div className={styles.field}>
          <label htmlFor="ln">Фамилия</label>
          <input
            id="ln"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, ln: true }))}
            className={`${errors.ln && touched.ln ? styles.inputError : ''}`}
            aria-invalid={!!(errors.ln && touched.ln)}
            aria-describedby={errors.ln && touched.ln ? 'ln-error' : undefined}
          />
          {errors.ln && touched.ln && <div id="ln-error" className={styles.fieldError}>{errors.ln}</div>}
        </div>

        <div className={styles.field}>
          <label htmlFor="ph">Телефон</label>
          <input
            id="ph"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, ph: true }))}
            placeholder="+79991234567"
            className={`${errors.ph && touched.ph ? styles.inputError : ''}`}
            aria-invalid={!!(errors.ph && touched.ph)}
            aria-describedby={errors.ph && touched.ph ? 'ph-error' : undefined}
          />
          {errors.ph && touched.ph && <div id="ph-error" className={styles.fieldError}>{errors.ph}</div>}
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={hasErrors}>Сохранить</button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => onCancel?.()}
          >
            Отмена
          </button>
        </div>
      </form>

      {/* Опасная зона — внутрь секции редактирования, ниже формы */}
      <DangerZone />
    </>
  );
};

export default ProfileEditForm;
