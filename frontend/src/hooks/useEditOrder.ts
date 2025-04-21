import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

interface OrderDetails {
  id: number;
  customer_name: string;
  table_number: string;
  total_price: string;
  status: string;
}

interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
}

interface FormData {
  customer_name: string;
  table_number: string;
  total_price: string;
  status: string;
  waiter: number | null;
}

export const useEditOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { callApi, loading, error } = useApi();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [formData, setFormData] = useState<FormData>({
    customer_name: "",
    table_number: "",
    total_price: "",
    status: "",
    waiter: null
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const orderResponse = await callApi("get", `/restaurant/5/orders/${orderId}/`);
      if (orderResponse) {
        setOrderDetails(orderResponse);
        setFormData({
          customer_name: orderResponse.customer_name,
          table_number: orderResponse.table_number,
          total_price: orderResponse.total_price,
          status: orderResponse.status,
          waiter: null
        });
        setOrderItems(orderResponse.order_items || []);
      }
    };

    fetchData();
  }, []);

  // معالج تغيير بيانات الحقول النصية
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // معالج تغيير اسم عنصر الطلب
  const handleItemNameChange = (itemId: number, newName: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, menu_item_name: newName } : item
      )
    );
  };

  // تعديل كمية العنصر
  const handleQuantityChange = (itemId: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // حذف عنصر من عناصر الطلب
  const handleDeleteItem = (itemId: number) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // إضافة عنصر جديد
  const handleAddItem = (menuItem?: { id: number; menu_item_name: string; quantity: number }) => {
    setOrderItems((prev) => [
      ...prev,
      menuItem || { id: Date.now(), menu_item_name: "New Item", quantity: 1 },
    ]);
  };

  // إرسال التعديلات على عناصر الطلب للـ API
  const updateOrderItems = async (updatedItems: OrderItem[]) => {
    for (const item of updatedItems) {
      await callApi("post", `/restaurant/5/orders/${orderId}/items/`, {
        menu_item: item.id,
        menu_item_name: item.menu_item_name,
        quantity: item.quantity,
      });
    }
  };

  // إرسال التعديلات لل API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedOrder = {
      ...formData,
    };

    // تحديث الطلب الأساسي
    const orderResponse = await callApi("put", `/restaurant/5/orders/${orderId}/`, updatedOrder);

    // تحديث عناصر الطلب
    const itemsResponse = await updateOrderItems(orderItems);

    if (orderResponse && itemsResponse) {
      navigate(`/orders/${orderId}`);
    }
  };

  return {
    formData,
    orderItems,
    orderDetails,
    loading,
    error,
    handleInputChange,
    handleItemNameChange,
    handleQuantityChange,
    handleDeleteItem,
    handleAddItem,
    handleSubmit,
  };
};
