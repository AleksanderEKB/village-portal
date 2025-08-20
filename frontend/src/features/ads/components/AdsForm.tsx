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

// атомарные компоненты
import AdsFormHeading from '../components/AtomicForm/AdsFormHeading';
import FieldError from '../components/AtomicForm/FieldError';
import TextInput from '../components/AtomicForm/TextInput';
import TextArea from '../components/AtomicForm/TextArea';
import PriceField from '../components/AtomicForm/PriceField';
import MainImageUploader from '../components/AtomicForm/MainImageUploader';
import AdditionalImagesUploader from '../components/AtomicForm/AdditionalImagesUploader';
import AdditionalImagesList from '../components/AtomicForm/AdditionalImagesList';
import SubmitButton from '../components/AtomicForm/SubmitButton';

const AdsForm: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const currentAd = useSelector((state: RootState) => state.ads.currentAd);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

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
    const value = e.target.value.replace(/\D/g, '');
    setForm((prev) => ({ ...prev, contact_phone: value }));
  };

  const handleCategoryChange = ({
    name,
    value,
  }: {
    name: string;
    value: AdsCategory;
  }) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      images: allowAdditionalImages(value) ? prev.images : [],
    }));
  };

  function getInputValidationClass(field: string) {
    if (validationErrors[field]) return 'input-error';
    const val = form[field as keyof typeof form];
    if (
      val &&
      typeof val === 'string' &&
      (val as string).trim().length > 0 &&
      !validationErrors[field]
    )
      return 'input-success';
    return '';
  }

  if (!isAuthenticated)
    return <div>Только для зарегистрированных пользователей</div>;

  const showPriceInput = getPriceInputState(form.category);
  const pricePlaceholder = getPricePlaceholder(form.category);
  const titlePlaceholder = getTitlePlaceholder(form.category);
  const additionalImagesAllowed = allowAdditionalImages(form.category);
  const mainImageInputRef = React.useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = React.useRef<HTMLInputElement>(null);
  const remainingImagesCount = Math.max(0, MAX_IMAGES - totalImagesCount);
  const isEdit = !!slug;

  return (
    <>
      <AdsFormHeading isEdit={isEdit} />

      <form
        className="ads-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <CustomSelect
          name="category"
          value={form.category}
          options={CATEGORY_OPTIONS}
          onChange={handleCategoryChange}
        />

        <TextInput
          name="title"
          type="text"
          placeholder={titlePlaceholder}
          value={form.title}
          onChange={handleChange}
          required
          className={getInputValidationClass('title')}
        />
        <FieldError message={validationErrors.title} />

        <TextArea
          name="description"
          placeholder="Описание"
          value={form.description}
          onChange={handleChange}
          required
          className={getInputValidationClass('description')}
        />
        <FieldError message={validationErrors.description} />

        <PriceField
          show={showPriceInput}
          value={form.price}
          placeholder={pricePlaceholder}
          onChange={handleChange}
          className={getInputValidationClass('price')}
          error={validationErrors.price}
        />

        <TextInput
          name="location"
          type="text"
          placeholder="Город/Место"
          value={form.location}
          onChange={handleChange}
          className={getInputValidationClass('location')}
        />
        <FieldError message={validationErrors.location} />

        <TextInput
          name="contact_phone"
          type="text"
          placeholder="Телефон (только цифры)"
          value={form.contact_phone}
          onChange={handlePhoneChange}
          className={getInputValidationClass('contact_phone')}
        />
        <FieldError message={validationErrors.contact_phone} />

        <MainImageUploader
          mainImageInputRef={mainImageInputRef}
          form={{ main_image: form.main_image, main_image_url: form.main_image_url }}
          onChange={handleMainImageChange}
          onClear={handleClearMainImage}
          validationError={validationErrors.main_image}
        />

        {additionalImagesAllowed && (
          <AdditionalImagesUploader
            inputRef={additionalImagesInputRef}
            disabled={
              (!form.main_image && !form.main_image_url) ||
              totalImagesCount >= MAX_IMAGES
            }
            remaining={remainingImagesCount}
            onChange={handleImagesChange}
            validationError={validationErrors.images}
          />
        )}

        <AdditionalImagesList
          show={additionalImagesAllowed}
          serverImages={form.server_images}
          images={form.images}
          onRemoveServerImage={handleRemoveServerImage}
          onRemoveImage={handleRemoveImage}
        />

        {error && <div className="error">{error}</div>}

        <SubmitButton
          loading={loading}
          disabled={loading || Object.keys(validationErrors).length > 0}
          isEdit={isEdit}
        />
      </form>
    </>
  );
};

export default AdsForm;
