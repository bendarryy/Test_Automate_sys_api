import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { removeItem, clearBill, addItem } from "../store/billSlice";
import { PrinterOutlined, SendOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSendOrders } from "../hooks/useSendOrders";
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';
import { Card, Input, Button, List, Typography, Space, Divider, Empty, Form, message } from "antd";

const { Title, Text } = Typography;

const OrdersSection = () => {
  const billItems = useSelector((state: RootState) => state.bill.items);
  const selectedTable = useSelector((state: RootState) => state.bill.selectedTable);
  const orderType = useSelector((state: RootState) => state.bill.orderType);
  const dispatch = useDispatch();

  const [discount, setDiscount] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [waiter, setWaiter] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState<string>('');

  const [selectedSystemId] = useSelectedSystemId();
  const { createOrder, addItemToOrder, loading: apiLoading } = useSendOrders(Number(selectedSystemId));

  const total = React.useMemo(() => billItems.reduce((total, item) => total + item.price, 0), [billItems]);
  const discountedTotal = React.useMemo(() => total - (total * discount) / 100, [total, discount]);

  const handleSendBill = React.useCallback(async () => {
    if (orderType === 'in_house' && !selectedTable) {
      message.error('Please select a table for in-house orders');
      return;
    }

    if (orderType === 'delivery' && !customerName.trim()) {
      message.error('Customer name is required for delivery orders');
      return;
    }

    setIsSending(true);
    try {
      const orderData = {
        customer_name: orderType === 'delivery' ? customerName.trim() : null,
        table_number: orderType === 'in_house' ? (selectedTable?.toString() || '') : null,
        waiter: orderType === 'in_house' ? waiter : null,
        order_type: orderType,
      };

      const orderResponse = await createOrder(orderData);
      const orderId = orderResponse.id;
      
      for (const item of billItems) {
        const payload = {
          menu_item: Number(item.id),
          quantity: item.quantity,
        };
        await addItemToOrder(orderId, payload);
      }

      message.success("Order sent successfully!");
      dispatch(clearBill());
      setWaiter(null);
      setCustomerName('');
    } catch (err) {
      console.error(err);
      message.error("Failed to send the order. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, [billItems, createOrder, addItemToOrder, dispatch, waiter, selectedTable, orderType, customerName]);

  const handlePrintBill = React.useCallback(() => {
    window.print();
  }, []);

  return (
    <Card 
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { height: '100%', padding: '12px', display: 'flex', flexDirection: 'column' } }}
    >
      <Title level={4}>
        {orderType === 'in_house' 
          ? (selectedTable ? `Orders for Table: ${selectedTable}` : "Select Table")
          : "Delivery Order"}
      </Title>
      
      <div style={{ flex: 1, overflowY: 'auto', justifyContent: billItems.length === 0 ? 'center' : 'space-between', flexDirection: "column", display: 'flex'}}>
        {billItems.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Add items to the order"
          />
        ) : (
          <List
            dataSource={billItems}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    style={{ width: 80 }}
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
                  />,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => dispatch(removeItem(item.id))}
                  />
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={`$${item.price.toFixed(2)}`}
                />
              </List.Item>
            )}
          />
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form layout="vertical">
            <Form.Item 
              label="Customer Name" 
              required={orderType === 'delivery'}
              validateStatus={orderType === 'delivery' && !customerName.trim() ? 'error' : ''}
              help={orderType === 'delivery' && !customerName.trim() ? 'Customer name is required for delivery orders' : ''}
            >
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={orderType === 'delivery' ? "Enter customer name (required)" : "Enter customer name (optional)"}
              />
            </Form.Item>

            {orderType === 'in_house' && (
              <Form.Item label="Waiter (Optional)">
                <Input
                  type="number"
                  value={waiter || ''}
                  onChange={(e) => setWaiter(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Enter waiter ID"
                />
              </Form.Item>
            )}

            <Form.Item label="Discount">
              <Input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="Discount (%)"
                addonAfter="%"
              />
            </Form.Item>
          </Form>
          
          <Text strong>Total: ${total.toFixed(2)}</Text>
          <Text type="secondary">After Discount: ${discountedTotal.toFixed(2)}</Text>

          <Space>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => dispatch(clearBill())}
            >
              Clear
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendBill}
              loading={isSending || apiLoading}
            >
              Send Order
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrintBill}
            >
              Print
            </Button>
          </Space>
        </Space>
      </div>
    </Card>
  );
};

export default OrdersSection;