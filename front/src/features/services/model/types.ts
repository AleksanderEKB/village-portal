// front/src/features/services/model/types.ts
export interface Service {
  id: number;
  title: string;
  slug: string;
  short_description?: string; // для списка
  description?: string;       // для деталки
  price: string;              // от API приходит строка для decimal
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServicesState {
  list: Service[];
  detail: Service | null;
  loadingList: boolean;
  loadingDetail: boolean;
  errorList: string | null;
  errorDetail: string | null;
}
