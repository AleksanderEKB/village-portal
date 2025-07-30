// frontend/src/features/ads/components/AdsForm.tsx
import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchAdById, setCurrentAd } from '../adsSlice';
import { CATEGORY_OPTIONS, MAX_IMAGES } from '../utils/constants';
import { AdsCategory } from '../../../types/globalTypes';
import {
  getPriceInputState,
  getPricePlaceholder,
  getTitlePlaceholder,
  allowAdditionalImages,
} from '../utils/adsFormLogic';
import { useAdForm } from '../utils/useAdsForm';
import CustomSelect from './CustomSelect';
import '../styles/scss_ads-form/main.scss';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AdsForm: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const currentAd = useSelector((state: RootState) => state.ads.currentAd);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (slug) dispatch(fetchAdById(slug));
    else dispatch(setCurrentAd(null));
  }, [dispatch, slug]);

  const handleAfterSubmit = (slug?: string) => {
    if (slug) navigate(`/ads/${slug}`);
    else navigate('/ads');
  };

  const {
    form,
    setForm,
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Оставляем только цифры
    setForm(prev => ({ ...prev, contact_phone: value }));
  };

  const handleCategoryChange = ({ name, value }: { name: string; value: AdsCategory }) => {
    setForm((prev: typeof form) => ({
      ...prev,
      [name]: value,
      images: allowAdditionalImages(value) ? prev.images : [],
    }));
  };

  

  function getInputValidationClass(field: string) {
    if (validationErrors[field]) return 'input-error';
    if (
      form[field as keyof typeof form] &&
      typeof form[field as keyof typeof form] === 'string' &&
      (form[field as keyof typeof form] as string).trim().length > 0 &&
      !validationErrors[field]
    ) return 'input-success';
    return '';
  }

  if (!isAuthenticated) return <div>Только для зарегистрированных пользователей</div>;

  const showPriceInput = getPriceInputState(form.category);
  const pricePlaceholder = getPricePlaceholder(form.category);
  const titlePlaceholder = getTitlePlaceholder(form.category);
  const additionalImagesAllowed = allowAdditionalImages(form.category);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const remainingImagesCount = Math.max(0, MAX_IMAGES - totalImagesCount);

  return (
    <>
      <h1 className="ads-form__heading">
        {slug ? "Редактирование объявления" : "Создание объявления"}
      </h1>
      <form className="ads-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <CustomSelect
          name="category"
          value={form.category}
          options={CATEGORY_OPTIONS}
          onChange={handleCategoryChange}
        />

        <input
          name="title"
          type="text"
          placeholder={titlePlaceholder}
          value={form.title}
          onChange={handleChange}
          required
          className={getInputValidationClass('title')}
        />
        {validationErrors.title && <div className="error">{validationErrors.title}</div>}

        <textarea
          name="description"
          placeholder="Описание"
          value={form.description}
          onChange={handleChange}
          required
          className={getInputValidationClass('description')}
        />
        {validationErrors.description && <div className="error">{validationErrors.description}</div>}

        {showPriceInput && (
          <>
            <input
              name="price"
              type="number"
              placeholder={pricePlaceholder}
              value={form.price}
              onChange={handleChange}
              className={getInputValidationClass('price')}
            />
            {validationErrors.price && <div className="error">{validationErrors.price}</div>}
          </>
        )}

        <input
          name="location"
          type="text"
          placeholder="Город/Место"
          value={form.location}
          onChange={handleChange}
          className={getInputValidationClass('location')}
        />
        {validationErrors.location && <div className="error">{validationErrors.location}</div>}

        <input
          name="contact_phone"
          type="text"
          placeholder="Телефон (только цифры)"
          value={form.contact_phone}
          onChange={handlePhoneChange}
          className={getInputValidationClass('contact_phone')}
        />
        {validationErrors.contact_phone && <div className="error">{validationErrors.contact_phone}</div>}

        <div className="upload-btn-wrapper">
          <input
            type="file"
            accept="image/*"
            id="main-img-upload"
            style={{ display: "none" }}
            onChange={(e) => {
              handleMainImageChange(e);
              if (mainImageInputRef.current) mainImageInputRef.current.value = '';
            }}
            ref={mainImageInputRef}
          />
          <label htmlFor="main-img-upload" className="upload-btn">
            {(form.main_image || form.main_image_url) ? 'Изменить изображение' : 'Добавить основное изображение'}
          </label>
        </div>
        {(form.main_image || form.main_image_url) && (
          <div className="main-image-preview">
            {form.main_image ? (
              form.main_image.type?.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(form.main_image)}
                  alt="Превью"
                />
              ) : (
                <div className="no-image">Не изображение</div>
              )
            ) : (
              <img src={form.main_image_url!} alt="Превью" />
            )}
            <button
              type="button"
              onClick={handleClearMainImage}
              aria-label="Очистить основное изображение"
              title="Очистить"
              className="remove-image-btn"
            >
              <FontAwesomeIcon className="icon-remove" icon={faCircleXmark} />
            </button>
          </div>
        )}
        {validationErrors.main_image && <div className="error">{validationErrors.main_image}</div>}

        {additionalImagesAllowed && (
          <div className="upload-btn-wrapper">
            <input
              type="file"
              accept="image/*"
              multiple
              id="additional-img-upload"
              style={{ display: "none" }}
              onChange={(e) => {
                handleImagesChange(e);
                if (additionalImagesInputRef.current) additionalImagesInputRef.current.value = '';
              }}
              disabled={!form.main_image && !form.main_image_url || totalImagesCount >= MAX_IMAGES}
              ref={additionalImagesInputRef}
            />
            <label htmlFor="additional-img-upload" className="upload-btn">
              Дополнительные изображения (осталось {remainingImagesCount})
            </label>
          </div>
        )}
        {validationErrors.images && <div className="error">{validationErrors.images}</div>}

        {additionalImagesAllowed && (form.server_images.length > 0 || form.images.length > 0) && (
          <div className="additional-images-list">
            {form.server_images.map((img, idx) => (
              <div className="img-thumb" key={img.id}>
                <img
                  src={img.image}
                  alt={`image_${idx}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveServerImage(img.id)}
                  aria-label="Удалить"
                  className="remove-image-btn"
                >
                  <FontAwesomeIcon className="icon-remove" icon={faCircleXmark} />
                </button>
              </div>
            ))}
            {form.images.map((file, idx) => (
              <div className="img-thumb" key={file.name + idx}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  aria-label="Удалить"
                  className="remove-image-btn"
                >
                  <FontAwesomeIcon className="icon-remove" icon={faCircleXmark} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading || Object.keys(validationErrors).length > 0}>
          {loading ? 'Отправка...' : (slug ? 'Сохранить' : 'Опубликовать')}
        </button>
      </form>
    </>
  );
};

export default AdsForm;
