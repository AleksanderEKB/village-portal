// frontend/src/features/userProfile/components/AdsEditForm.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../app/hook';
import { RootState } from '../../../app/store';
import { fetchAdvertisementBySlug, updateAdvertisement } from '../userProfileSlice';
import type { Advertisement } from '../../../types/globalTypes';

const MAX_IMAGES = 5;

const AdsEditForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Берём объявление из redux
  const advertisement = useSelector((state: RootState) => state.userProfile.currentAd) as Advertisement | null;
  const loading = useSelector((state: RootState) => state.userProfile.loading);

  // Локальный стейт для формы
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'sell',
    price: '',
    location: '',
    contact_phone: '',
    contact_email: '',
    is_active: true,
  });
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);

  // Загрузить объявление по slug
  useEffect(() => {
    if (slug) {
      dispatch(fetchAdvertisementBySlug(slug));
    }
  }, [dispatch, slug]);

  // Когда объявление загрузилось — заполнить форму
  useEffect(() => {
    if (advertisement) {
      setForm({
        title: advertisement.title,
        description: advertisement.description,
        category: advertisement.category,
        price: advertisement.price || '',
        location: advertisement.location || '',
        contact_phone: advertisement.contact_phone || '',
        contact_email: advertisement.contact_email || '',
        is_active: advertisement.is_active,
      });
    }
  }, [advertisement]);

  // Обработка изменения полей
const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value, type } = e.target as HTMLInputElement;

  if (type === "checkbox") {
    setForm((prev) => ({
      ...prev,
      [name]: (e.target as HTMLInputElement).checked,
    }));
  } else {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  // Изменение основного изображения
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  // Изменение дополнительных изображений
  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > MAX_IMAGES) {
        alert(`Максимум ${MAX_IMAGES} изображений`);
        return;
      }
      setImages(files);
    }
  };

  // Сабмит формы
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value as string);
    });
    if (mainImage) data.append('main_image', mainImage);
    images.forEach((img) => data.append('images', img));
    const res = await dispatch(updateAdvertisement({ slug, formData: data }));
    if (updateAdvertisement.fulfilled.match(res)) {
      navigate(`/ads/${slug}`);
    } else {
      alert((res.payload as string) || "Ошибка обновления объявления");
    }
  };

  if (loading || !advertisement) return <div>Загрузка...</div>;

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <label>Заголовок: <input name="title" value={form.title} onChange={handleChange} required /></label>
      <label>Описание: <textarea name="description" value={form.description} onChange={handleChange} required /></label>
      <label>Категория:
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="sell">Продаю</option>
          <option value="buy">Куплю</option>
          <option value="free">Отдам даром</option>
          <option value="service">Услуги</option>
          <option value="job">Работа: ищу работу</option>
          <option value="hire">Работа: ищу сотрудника</option>
        </select>
      </label>
      <label>Цена: <input name="price" value={form.price} onChange={handleChange} /></label>
      <label>Город: <input name="location" value={form.location} onChange={handleChange} /></label>
      <label>Телефон: <input name="contact_phone" value={form.contact_phone} onChange={handleChange} /></label>
      <label>Email: <input name="contact_email" value={form.contact_email} onChange={handleChange} /></label>
      <label>
        Активно:
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
      </label>
      <label>
        Основное изображение:
        <input type="file" name="main_image" accept="image/*" onChange={handleMainImageChange} />
      </label>
      <label>
        Доп. изображения (до 5):
        <input type="file" name="images" accept="image/*" multiple onChange={handleImagesChange} />
      </label>
      <button type="submit" disabled={loading}>Сохранить</button>
    </form>
  );
};

export default AdsEditForm;
