// src/features/ads/hooks/useAdsForm.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import { MAX_IMAGES } from '../utils/constants';
import { allowAdditionalImages } from '../utils/adsFormLogic';
import type { AdsCategory } from '../../../types/globalTypes';

export interface UseAdsFormProps {
  onSuccess?: () => void;
}

export const useAdsForm = ({ onSuccess }: UseAdsFormProps) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'sell' as AdsCategory,
    price: '',
    location: '',
    contact_phone: '',
    contact_email: '',
    main_image: null as File | null,
    images: [] as File[],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as AdsCategory;
    setForm(prev => ({
      ...prev,
      category,
      images: allowAdditionalImages(category) ? prev.images : [],
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setForm({ ...form, main_image: file || null });
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm(prevForm => {
      const existingNames = prevForm.images.map(f => f.name);
      const newFiles = files.filter(f => !existingNames.includes(f.name));
      const images = [...prevForm.images, ...newFiles].slice(0, MAX_IMAGES);
      return { ...prevForm, images };
    });
    e.target.value = '';
  };

  const handleRemoveImage = (idx: number) => {
    setForm(prevForm => ({
      ...prevForm,
      images: prevForm.images.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('category', form.category);
    if (form.price) data.append('price', form.price);
    if (form.location) data.append('location', form.location);
    if (form.contact_phone) data.append('contact_phone', form.contact_phone);
    if (form.contact_email) data.append('contact_email', form.contact_email);
    if (form.main_image) data.append('main_image', form.main_image);

    if (allowAdditionalImages(form.category)) {
      form.images.forEach((file) => {
        data.append('images', file);
      });
    }

    try {
      await axiosInstance.post('/api/ads/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({
        title: '', description: '', category: 'sell', price: '',
        location: '', contact_phone: '', contact_email: '',
        main_image: null, images: []
      });
      navigate('/ads');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    error,
    loading,
    handleChange,
    handleCategoryChange,
    handleMainImageChange,
    handleImagesChange,
    handleRemoveImage,
    handleSubmit,
  };
};
