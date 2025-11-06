// front/src/features/services/api/api.ts
import axiosInstance from '../../../axiosInstance';
import { Service } from '../model/types';

export const fetchServicesApi = async (): Promise<Service[]> => {
  const res = await axiosInstance.get<Service[]>('/api/services/');
  return res.data;
};

export const fetchServiceBySlugApi = async (slug: string): Promise<Service> => {
  const res = await axiosInstance.get<Service>(`/api/services/${slug}/`);
  return res.data;
};
