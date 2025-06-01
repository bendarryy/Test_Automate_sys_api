// نوع عنصر القائمة
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  cost: number;

  category: string;
  is_available: boolean;
  description: string;
  image?: string | null | File;
}


// نوع طاولة المطعم
export interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
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

export type { ApiError };