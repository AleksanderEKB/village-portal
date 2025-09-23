import React from 'react';
import phoneStyles from './phone.module.scss';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  touched: boolean;
  error?: string | null;
};

const PhoneField: React.FC<Props> = ({ value, onChange, onBlur, touched, error }) => {
  return (
    <div className={phoneStyles.field}>
      <label htmlFor="phoneNumber">Телефон</label>
      <input
        id="phoneNumber"
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="tel"
        placeholder="+79991234567"
        className={`${phoneStyles.input} ${touched ? (error ? phoneStyles.inputError : phoneStyles.inputValid) : ''}`}
        onBlur={onBlur}
        aria-invalid={!!(touched && error)}
        aria-describedby={touched && error ? 'phoneNumber-error' : undefined}
      />
      {touched && error && (
        <div id="phoneNumber-error" className={phoneStyles.fieldError}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PhoneField;
