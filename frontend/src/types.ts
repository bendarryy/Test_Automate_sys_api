// نوع المستخدم
interface User {
    id: number;
    username: string;
    // أضف حقولًا إضافية إذا لزم الأمر
  }
  
  // نوع النظام
  interface System {
    id: number;
    name: string;
    category: string;
  }
  
  // نوع عنصر القائمة
  interface MenuItem {
    id: number;
    name: string;
    price: string; // أو number إذا كنت تفضل
    category: string;
  }
  
  // نوع الطلب
  interface Order {
    id: number;
    system: number;
    customer_name: string;
    table_number: string;
    waiter: number | null;
    total_price: string;
    status: string;
    order_items: OrderItem[];
    created_at: string;
    updated_at: string;
  }
  
  // نوع عنصر الطلب
  interface OrderItem {
    id: number;
    menu_item: number;
    menu_item_name: string;
    quantity: number;
  }