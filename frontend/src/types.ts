// نوع عنصر القائمة
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
  description: string;
  specialOffer: boolean;
}

// نوع خطأ API
interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      detail?: string;
    };
  };
}

export type { ApiError, MenuItem };