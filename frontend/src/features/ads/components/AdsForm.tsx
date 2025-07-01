import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchAdById, setCurrentAd } from '../adsSlice';
import axiosInstance from '../../../axiosInstance';
import { CATEGORY_OPTIONS, MAX_IMAGES } from '../utils/constants';
import {
  getPriceInputState,
  getPricePlaceholder,
  getTitlePlaceholder,
  allowAdditionalImages,
} from '../utils/adsFormLogic';
import type { AdsCategory } from '../../../types/globalTypes';
import { validateAdForm, AdFormValidationErrors } from '../utils/validateAdForm';

type FormState = {
  title: string;
  description: string;
  category: AdsCategory;
  price: string;
  location: string;
  contact_phone: string;
  main_image: File | null;
  images: File[];
};

const initialForm: FormState = {
  title: '',
  description: '',
  category: 'sell',
  price: '',
  location: '',
  contact_phone: '',
  main_image: null,
  images: [],
};

const AdsForm: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const currentAd = useSelector((state: RootState) => state.ads.currentAd);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [form, setForm] = useState<FormState>(initialForm);
  const [validationErrors, setValidationErrors] = useState<AdFormValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValidationErrors(validateAdForm(form, !!slug));
  }, [form, slug]);

  useEffect(() => {
    if (slug) {
      dispatch(fetchAdById(slug));
    } else {
      setForm(initialForm);
      dispatch(setCurrentAd(null));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (slug && currentAd) {
      setForm({
        title: currentAd.title || '',
        description: currentAd.description || '',
        category: currentAd.category as AdsCategory,
        price: currentAd.price || '',
        location: currentAd.location || '',
        contact_phone: currentAd.contact_phone || '',
        main_image: null,
        images: [],
      });
    }
  }, [slug, currentAd]);

  useEffect(() => {
    return () => {
      setForm(initialForm);
      dispatch(setCurrentAd(null));
    };
  }, [dispatch]);

  useEffect(() => {
    if (!form.main_image && form.images.length > 0) {
      setForm(f => ({ ...f, images: [] }));
    }
  }, [form.main_image]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => {
      if (name === 'category') {
        const newCategory = value as AdsCategory;
        const shouldHavePrice = getPriceInputState(newCategory);
        return {
          ...prev,
          category: newCategory,
          price: shouldHavePrice ? prev.price : '',
          images: allowAdditionalImages(newCategory) ? prev.images : [],
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith('image/')) {
      setValidationErrors(prev => ({ ...prev, main_image: 'Файл должен быть изображением' }));
      // Не устанавливаем файл
      setForm(prev => ({ ...prev, main_image: null }));
      return;
    }
    setValidationErrors(prev => ({ ...prev, main_image: undefined }));
    setForm(prev => ({ ...prev, main_image: file }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    // Пропускаем не-изображения
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const existingNames = form.images.map(f => f.name);

    const newFiles = imageFiles.filter(f => !existingNames.includes(f.name));
    const images = [...form.images, ...newFiles].slice(0, MAX_IMAGES);
    setForm(prevForm => ({
      ...prevForm,
      images,
    }));
    e.target.value = '';
  };


  const handleRemoveImage = (idx: number) => {
    setForm(prevForm => ({
      ...prevForm,
      images: prevForm.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const errors = validateAdForm(form, !!slug);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('category', form.category);
    if (getPriceInputState(form.category) && form.price) {
      data.append('price', form.price);
    }
    if (form.price) data.append('price', form.price);
    if (form.location) data.append('location', form.location);
    if (form.contact_phone) data.append('contact_phone', form.contact_phone);
    if (form.main_image) data.append('main_image', form.main_image);
    if (allowAdditionalImages(form.category)) {
      form.images.forEach(f => data.append('images', f));
    }

    try {
      if (slug) {
        await axiosInstance.patch(`/api/ads/${slug}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        dispatch(setCurrentAd(null));
        navigate(`/ads/${slug}`);
      } else {
        await axiosInstance.post('/api/ads/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setForm(initialForm);
        navigate('/ads');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

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
      {validationErrors.title && (
        <div className="error">{validationErrors.title}</div>
      )}

      <textarea
        name="description"
        placeholder="Описание"
        value={form.description}
        onChange={handleChange}
        required
      />
      {validationErrors.description && (
        <div className="error">{validationErrors.description}</div>
      )}

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
          {validationErrors.price && (
            <div className="error">{validationErrors.price}</div>
          )}
        </>
      )}

      <input
        name="location"
        placeholder="Город/Место"
        value={form.location}
        onChange={handleChange}
      />
      {validationErrors.location && (
        <div className="error">{validationErrors.location}</div>
      )}

      <input
        name="contact_phone"
        placeholder="Телефон"
        value={form.contact_phone}
        onChange={handleChange}
      />
      {validationErrors.contact_phone && (
        <div className="error">{validationErrors.contact_phone}</div>
      )}

      <label>
        Основное изображение:
        <input type="file" accept="image/*" onChange={handleMainImageChange} />
      </label>
      {validationErrors.main_image && (
        <div className="error">{validationErrors.main_image}</div>
      )}

      {additionalImagesAllowed && (
        <label>
          Доп. изображения (до {MAX_IMAGES}):
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            disabled={!form.main_image || form.images.length >= MAX_IMAGES}
          />
          {form.main_image && (
            <div style={{ marginBottom: 15 }}>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 3 }}>Превью основного изображения:</div>
              <img
                src={URL.createObjectURL(form.main_image)}
                alt="Превью"
                width={120}
                height={120}
                style={{ objectFit: 'cover', borderRadius: 10, border: '1px solid #ccc' }}
              />
            </div>
          )}
        </label>
      )}
      {validationErrors.images && (
        <div className="error">{validationErrors.images}</div>
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

      <button type="submit" disabled={loading || Object.keys(validationErrors).length > 0}>
        {loading ? 'Отправка...' : (slug ? 'Сохранить' : 'Опубликовать')}
      </button>
    </form>
  );
};

export default AdsForm;
