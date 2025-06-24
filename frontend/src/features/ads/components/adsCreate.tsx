// src/features/ads/components/AdsForm.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { CATEGORY_OPTIONS, MAX_IMAGES } from '../constants';
import {
  getPriceInputState,
  getPricePlaceholder,
  getTitlePlaceholder,
  allowAdditionalImages
} from '../adsFormLogic';
import { useAdsForm } from '../hooks/useAdsForm';

const AdsForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const {
    form,
    error,
    loading,
    handleChange,
    handleCategoryChange,
    handleMainImageChange,
    handleImagesChange,
    handleRemoveImage,
    handleSubmit,
  } = useAdsForm({ onSuccess });

  if (!isAuthenticated) return <div>Только для зарегистрированных пользователей</div>;

  const showPriceInput = getPriceInputState(form.category);
  const pricePlaceholder = getPricePlaceholder(form.category);
  const titlePlaceholder = getTitlePlaceholder(form.category);
  const additionalImagesAllowed = allowAdditionalImages(form.category);

  return (
    <form className="ads-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        name="title"
        placeholder={titlePlaceholder}
        value={form.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Описание"
        value={form.description}
        onChange={handleChange}
        required
      />
      <select name="category" value={form.category} onChange={handleCategoryChange}>
        {CATEGORY_OPTIONS.map(opt => (
          <option value={opt.value} key={opt.value}>{opt.label}</option>
        ))}
      </select>
      {showPriceInput && (
        <input
          name="price"
          type="number"
          placeholder={pricePlaceholder}
          value={form.price}
          onChange={handleChange}
        />
      )}
      <input
        name="location"
        placeholder="Город/Место"
        value={form.location}
        onChange={handleChange}
      />
      <input
        name="contact_phone"
        placeholder="Телефон"
        value={form.contact_phone}
        onChange={handleChange}
      />
      <input
        name="contact_email"
        placeholder="Email"
        value={form.contact_email}
        onChange={handleChange}
      />
      <label>
        Основное изображение:
        <input type="file" accept="image/*" onChange={handleMainImageChange} />
      </label>
      {additionalImagesAllowed && (
        <label>
          Доп. изображения (до {MAX_IMAGES}):
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            disabled={form.images.length >= MAX_IMAGES}
          />
        </label>
      )}
      {additionalImagesAllowed && form.images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
          {form.images.map((file, idx) => (
            <div key={file.name + idx} style={{ position: 'relative', width: 80 }}>
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={80}
                height={80}
                style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                style={{
                  position: 'absolute', right: 2, top: 2, background: 'red', color: '#fff',
                  border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer'
                }}
                aria-label="Удалить"
              >×</button>
              <div style={{ fontSize: 12, textAlign: 'center', wordBreak: 'break-all' }}>{file.name}</div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Отправка...' : 'Опубликовать'}
      </button>
    </form>
  );
};

export default AdsForm;
