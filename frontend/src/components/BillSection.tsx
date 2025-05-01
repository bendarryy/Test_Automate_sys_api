import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { removeItem, clearBill, addItem } from "../store/billSlice";
// تم نقل استيراد bootstrap إلى نقطة دخول التطبيق (main.tsx أو index.tsx) لتحسين الأداء ومنع تكرار التحميل.
import styles from "../styles/BillSection.module.css";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useSendOrders } from "../hooks/useSendOrders";
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';

const BillSection = () => {
  const billItems = useSelector((state: RootState) => state.bill.items);
  const selectedTable = useSelector((state: RootState) => state.bill.selectedTable);
  const dispatch = useDispatch();

  const [discount, setDiscount] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [selectedSystemId] = useSelectedSystemId();
  const { createOrder, addItemToOrder, loading: apiLoading } = useSendOrders(Number(selectedSystemId));

  // حساب الإجمالي باستخدام useMemo
  const total = React.useMemo(() => billItems.reduce((total, item) => total + item.price, 0), [billItems]);
  const discountedTotal = React.useMemo(() => total - (total * discount) / 100, [total, discount]);

  // استخدم useCallback لمنع إعادة إنشاء الدوال إلا عند الحاجة
  const handleSendBill = React.useCallback(async () => {
    setIsSending(true);
    try {
      const orderData = {
        customer_name: "John Doe",
        table_number: "5", // Change to string to match the expected type
        waiter: null, // Provide a default waiter ID
      };

      // Create a new order
      const orderResponse = await createOrder(orderData);

      // Add items to the created order
      const orderId = orderResponse.id;
      for (const item of billItems) {
        const payload = {
          menu_item: Number(item.id), // Ensure item.id is converted to a number
          quantity: item.quantity,
        };
        await addItemToOrder(orderId, payload); // Send each item individually
      }

      alert("Bill sent successfully!");
      dispatch(clearBill());
    } catch (err) {
      console.error(err);
      alert("Failed to send the bill. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, [billItems, createOrder, addItemToOrder, dispatch]);

  const handlePrintBill = React.useCallback(() => {
    window.print();
  }, []);

  return (
    <div className={`${styles.container} d-flex flex-column justify-content-between`}>
      <h4 className={styles.title}>
        {selectedTable ? `Bill for Table: ${selectedTable}` : "Bill for External Order"}
      </h4>
      <div className={styles.body}>
        {billItems.length === 0 ? (
          <div className={styles.emptyBill}>
            <IoMdAddCircleOutline size={100} />
            <h3>Add items to the bill</h3>
          </div>
        ) : (
          <ul className={`list-group ${styles.list}`}>
            {billItems.map((item) => (
              <li key={item.id} className={`list-group-item d-flex align-items-center justify-content-between ${styles.listItem}`}>
                <div className={styles.listItemText}>
                  <strong>{item.name}</strong>
                  <div className="text-muted">Price: ${item.price.toFixed(2)}</div>
                </div>
                <input
                  type="number"
                  name="quantity"
                  id={`quantity-${item.id}`}
                  min={1}
                  value={item.quantity}
                  className={`form-control form-control-sm ${styles.quantityInput}`}
                  style={{ width: "80px", marginRight: "10px" }}
                  onChange={(e) => {
                    const newQuantity = Number(e.target.value);
                    if (newQuantity > 0) {
                      dispatch(
                        addItem({
                          ...item,
                          quantity: newQuantity - item.quantity,
                        })
                      );
                    }
                  }}
                />
                <button
                  className={`btn btn-outline-danger btn-sm ${styles.removeButton}`}
                  onClick={() => dispatch(removeItem(item.id))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.footer}>
        <input
          type="number"
          id="discount"
          min={0}
          max={100}
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          className={`form-control ${styles.discountInput}`}
          placeholder="Discount (%)"
        />
        <h5 className={styles.total}>
          Total: ${total.toFixed(2)}
        </h5>
        <h5 className={styles.discountedTotal}>
          Total after Discount: ${discountedTotal.toFixed(2)}
        </h5>

        <div className={styles.buttonContainer}>
          <button
            className={`btn btn-secondary ${styles.button} ${styles.clearButton} me-2`}
            onClick={() => dispatch(clearBill())}
          >
            Clear Bill
          </button>
          <button
            className={`btn btn-primary ${styles.button} ${styles.sendButton} me-2`}
            onClick={handleSendBill}
            disabled={isSending || apiLoading}
          >
            {isSending || apiLoading ? "Sending..." : "Send Bill"}
          </button>
          <button
            className={`btn btn-outline-dark ${styles.button} ${styles.printButton}`}
            onClick={handlePrintBill}
          >
            Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillSection;