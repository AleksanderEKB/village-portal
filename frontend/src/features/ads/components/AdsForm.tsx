import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchAdById, setCurrentAd } from '../adsSlice';
import { CATEGORY_OPTIONS, MAX_IMAGES } from '../utils/constants';
import {
  getPriceInputState,
  getPricePlaceholder,
  getTitlePlaceholder,
  allowAdditionalImages,
} from '../utils/adsFormLogic';
import { useAdForm } from '../utils/useAdsForm'; // Кастомный хук

const AdsForm: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const currentAd = useSelector((state: RootState) => state.ads.currentAd);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Подгружаем объявление при необходимости
  useEffect(() => {
    if (slug) dispatch(fetchAdById(slug));
    else dispatch(setCurrentAd(null));
  }, [dispatch, slug]);

  // Навигация после сабмита
  const handleAfterSubmit = (slug?: string) => {
    if (slug) navigate(`/ads/${slug}`);
    else navigate('/ads');
  };

  // Используем хук
  const {
    form,
    validationErrors,
    loading,
    error,
    totalImagesCount,
    handleChange,
    handleMainImageChange,
    handleClearMainImage,
    handleImagesChange,
    handleRemoveImage,
    handleRemoveServerImage,
    handleSubmit,
  } = useAdForm({
    slug,
    currentAd,
    onAfterSubmit: handleAfterSubmit,
    dispatch,
    setCurrentAd,
  });

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
      {validationErrors.title && <div className="error">{validationErrors.title}</div>}

      <textarea
        name="description"
        placeholder="Описание"
        value={form.description}
        onChange={handleChange}
        required
      />
      {validationErrors.description && <div className="error">{validationErrors.description}</div>}

      <select name="category" value={form.category} onChange={handleChange}>
        {CATEGORY_OPTIONS.map(opt => (
          <option value={opt.value} key={opt.value}>{opt.label}</option>
        ))}
      </select>

      {showPriceInput && (
        <>
          <input
            name="price"
            type="number"
            placeholder={pricePlaceholder}
            value={form.price}
            onChange={handleChange}
          />
          {validationErrors.price && <div className="error">{validationErrors.price}</div>}
        </>
      )}

      <input
        name="location"
        placeholder="Город/Место"
        value={form.location}
        onChange={handleChange}
      />
      {validationErrors.location && <div className="error">{validationErrors.location}</div>}

      <input
        name="contact_phone"
        placeholder="Телефон"
        value={form.contact_phone}
        onChange={handleChange}
      />
      {validationErrors.contact_phone && <div className="error">{validationErrors.contact_phone}</div>}

      <label>
        Основное изображение:
        <input type="file" accept="image/*" onChange={handleMainImageChange} />
      </label>
      {(form.main_image || form.main_image_url) && (
        <div style={{ position: 'relative', margin: '10px 0 15px 0', display: 'inline-block' }}>
          {form.main_image ? (
            form.main_image.type?.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(form.main_image)}
                alt="Превью"
                width={120}
                height={120}
                style={{ objectFit: 'cover', borderRadius: 10, border: '1px solid #ccc', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#eee',
                  borderRadius: 10,
                  border: '1px solid #ccc',
                  color: '#999',
                  fontSize: 14,
                }}
              >
                Не изображение
              </div>
            )
          ) : (
            <img
              src={form.main_image_url!}
              alt="Превью"
              width={120}
              height={120}
              style={{ objectFit: 'cover', borderRadius: 10, border: '1px solid #ccc', display: 'block' }}
            />
          )}
          <button
            type="button"
            onClick={handleClearMainImage}
            style={{
              position: 'absolute',
              right: 4,
              top: 4,
              background: 'red',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 18,
              lineHeight: '18px',
            }}
            aria-label="Очистить основное изображение"
            title="Очистить"
          >×</button>
        </div>
      )}
      {validationErrors.main_image && <div className="error">{validationErrors.main_image}</div>}

      {additionalImagesAllowed && (
        <label>
          Доп. изображения (до {MAX_IMAGES}):
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            disabled={!form.main_image && !form.main_image_url || totalImagesCount >= MAX_IMAGES}
          />
        </label>
      )}
      {validationErrors.images && <div className="error">{validationErrors.images}</div>}

      {additionalImagesAllowed && (form.server_images.length > 0 || form.images.length > 0) && (
        <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
          {form.server_images.map((img, idx) => (
            <div key={img.id} style={{ position: 'relative', width: 80 }}>
              <img
                src={img.image}
                alt={`image_${idx}`}
                width={80}
                height={80}
                style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
              />
              <button
                type="button"
                onClick={() => handleRemoveServerImage(img.id)}
                style={{
                  position: 'absolute', right: 2, top: 2, background: 'red', color: '#fff',
                  border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer'
                }}
                aria-label="Удалить"
              >×</button>
            </div>
          ))}
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
              <div>{file.name}</div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading || Object.keys(validationErrors).length > 0}>
        {loading ? 'Отправка...' : (slug ? 'Сохранить' : 'Опубликовать')}
      </button>
    </form>
  );
};

export default AdsForm;
