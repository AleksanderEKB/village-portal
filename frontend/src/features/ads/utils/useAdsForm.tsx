// frontend/src/features/ads/utils/useAdForm.ts
import { useState, useEffect } from 'react';
import type { AdsCategory } from '../../../types/globalTypes';
import { getPriceInputState, allowAdditionalImages } from './adsFormLogic';
import { validateAdForm, AdFormValidationErrors } from './validateAdForm';
import { MAX_IMAGES } from './constants';
import axiosInstance from '../../../axiosInstance';

export type ServerImage = { id: number; image: string; order: number };

export type FormState = {
  title: string;
  description: string;
  category: AdsCategory;
  price: string;
  location: string;
  contact_phone: string;
  main_image: File | null;
  main_image_url: string | null;
  images: File[];
  server_images: ServerImage[];
};

export const initialForm: FormState = {
  title: '',
  description: '',
  category: 'sell',
  price: '',
  location: '',
  contact_phone: '',
  main_image: null,
  main_image_url: null,
  images: [],
  server_images: [],
};

function isImageFile(file: File | null): boolean {
  if (!file) return false;
  return file.type.startsWith('image/');
}

type UseAdFormProps = {
  initialData?: Partial<FormState>;
  slug?: string;
  currentAd?: any;
  onAfterSubmit?: (slug?: string) => void;
  dispatch?: any;
  setCurrentAd?: (ad: any) => void;
};

export function useAdForm({
  initialData,
  slug,
  currentAd,
  onAfterSubmit,
  dispatch,
  setCurrentAd
}: UseAdFormProps) {
  const [form, setForm] = useState<FormState>({
    ...initialForm,
    ...initialData,
  });
  const [validationErrors, setValidationErrors] = useState<AdFormValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalImagesCount = form.server_images.length + form.images.length;

  // Валидация на каждый чих
  useEffect(() => {
    setValidationErrors(validateAdForm(form, !!slug));
  }, [form, slug]);

  // Если загрузили объявление с сервера
  useEffect(() => {
    if (slug && currentAd) {
      setForm({
        title: currentAd.title || '',
        description: currentAd.description || '',
        category: currentAd.category as AdsCategory,
        price: String(currentAd.price || ''),
        location: currentAd.location || '',
        contact_phone: currentAd.contact_phone || '',
        main_image: null,
        main_image_url: currentAd.main_image || null,
        images: [],
        server_images: currentAd.images || [],
      });
    }
  }, [slug, currentAd]);

  // Очистка
  useEffect(() => {
    return () => {
      setForm(initialForm);
      if (dispatch && setCurrentAd) dispatch(setCurrentAd(null));
    };
  }, [dispatch, setCurrentAd]);

  useEffect(() => {
    if (!form.main_image && form.images.length > 0) {
      setForm(f => ({ ...f, images: [] }));
    }
  }, [form.main_image]);

  // --- Handlers ---
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
          server_images: allowAdditionalImages(newCategory) ? prev.server_images : [],
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith('image/')) {
      setValidationErrors(prev => ({ ...prev, main_image: 'Файл должен быть изображением' }));
      setForm(prev => ({ ...prev, main_image: file })); // всё равно сохраняем файл
      return;
    }
    setValidationErrors(prev => ({ ...prev, main_image: undefined }));
    setForm(prev => ({ ...prev, main_image: file, main_image_url: null }));
  };

  const handleClearMainImage = () => {
    setForm(prev => ({ ...prev, main_image: null, main_image_url: null }));
    setValidationErrors(prev => ({ ...prev, main_image: undefined }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const existingNames = form.images.map(f => f.name);

    const newFiles = imageFiles.filter(f => !existingNames.includes(f.name));
    const images = [...form.images, ...newFiles].slice(0, MAX_IMAGES - form.server_images.length);
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

  const handleRemoveServerImage = async (imgId: number) => {
    if (!slug) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/ads/${slug}/images/${imgId}/delete/`);
      setForm(prevForm => ({
        ...prevForm,
        server_images: prevForm.server_images.filter(img => img.id !== imgId),
      }));
    } catch (err: any) {
      setError('Ошибка удаления изображения');
    } finally {
      setLoading(false);
    }
  };

  // Submit
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
    if (form.location) data.append('location', form.location);
    if (form.contact_phone) data.append('contact_phone', form.contact_phone);

    if (form.main_image && isImageFile(form.main_image)) {
      data.append('main_image', form.main_image);
    } else if (!form.main_image && !form.main_image_url && !!slug) {
      data.append('main_image', '');
    }

    if (allowAdditionalImages(form.category)) {
      form.images.forEach(f => data.append('images', f));
    }

    try {
      if (slug) {
        await axiosInstance.patch(`/api/ads/${slug}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (dispatch && setCurrentAd) dispatch(setCurrentAd(null));
        if (onAfterSubmit) onAfterSubmit(slug);
      } else {
        await axiosInstance.post('/api/ads/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setForm(initialForm);
        if (onAfterSubmit) onAfterSubmit();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    validationErrors,
    setValidationErrors,
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
  };
}
