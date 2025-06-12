import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../store";
import { removeItem, clearBill, addItem } from "../../../../../store/billSlice";
import { PrinterOutlined, SendOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSendOrders } from "../hooks/useSendOrders";
import { useSelectedSystemId } from 'shared/hooks/useSelectedSystemId';
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
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');

  const [selectedSystemId] = useSelectedSystemId();
  const { createOrder, addItemToOrder, loading: apiLoading } = useSendOrders(Number(selectedSystemId));

  const total = React.useMemo(() => billItems.reduce((total, item) => total + (item.price * item.quantity), 0), [billItems]);
  const discountedTotal = React.useMemo(() => total - (total * discount) / 100, [total, discount]);

  const [customerNameTouched, setCustomerNameTouched] = useState(false);
  const [customerPhoneTouched, setCustomerPhoneTouched] = useState(false);
  const [deliveryAddressTouched, setDeliveryAddressTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleSendBill = React.useCallback(async () => {
    setSubmitAttempted(true);
    if (orderType === 'in_house' && !selectedTable) {
      message.error('Please select a table for in-house orders');
      return;
    }
    if (orderType === 'delivery' && !customerName.trim()) {
      message.error('Customer name is required for delivery orders');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      message.error('Delivery address is required for delivery orders');
      return;
    }
    if (orderType === 'delivery' && !customerPhone.trim()) {
      message.error('Customer phone is required for delivery orders');
      return;
    }

    setIsSending(true);
    try {
      const orderData = {
        customer_name: orderType === 'delivery' ? customerName.trim() : null,
        delivery_address: orderType === 'delivery' ? deliveryAddress.trim() : null,
        customer_phone: orderType === 'delivery' ? customerPhone.trim() : null,
        table_number: orderType === 'in_house' ? (selectedTable?.toString() || '') : null,
        waiter: orderType === 'in_house' ? waiter : null,
        order_type: orderType,
      };

      const orderResponse = await createOrder(orderData);
      const orderId = orderResponse?.id;
      
      for (const item of billItems) {
        const payload = {
          menu_item: Number(item.id),
          quantity: item.quantity,
        };
        await addItemToOrder(orderId!, payload);
      }

      message.success("Order sent successfully!");
      dispatch(clearBill());
      setWaiter(null);
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setCustomerNameTouched(false);
      setCustomerPhoneTouched(false);
      setDeliveryAddressTouched(false);
      setSubmitAttempted(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to send the order. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, [billItems, createOrder, addItemToOrder, dispatch, waiter, selectedTable, orderType, customerName, customerPhone, deliveryAddress]);

  const handlePrintBill = React.useCallback(() => {
    window.print();
  }, []);

  return (
    <Card 
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 0,
        borderLeft: '1px solid #f0f0f0'
      }}
      styles={{ 
        body: { 
          height: '100%', 
          padding: '12px', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        } 
      }}
    >
      <Title level={4} style={{ marginBottom: '16px' }}>
        {orderType === 'in_house' 
          ? (selectedTable ? `Orders for Table: ${selectedTable}` : "Select Table")
          : "Delivery Order"}
      </Title>
      
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
        <Divider style={{ margin: '12px 0' }} />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form layout="vertical" size="small">
            <Form.Item 
              label="Customer Name" 
              required={orderType === 'delivery'}
              validateStatus={orderType === 'delivery' && (!customerName.trim() && (customerNameTouched || submitAttempted)) ? 'error' : ''}
              help={orderType === 'delivery' && (!customerName.trim() && (customerNameTouched || submitAttempted)) ? 'Customer name is required for delivery orders' : ''}
            >
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onBlur={() => setCustomerNameTouched(true)}
                placeholder={orderType === 'delivery' ? "Enter customer name (required)" : "Enter customer name (optional)"}
              />
            </Form.Item>
            {orderType === 'delivery' && (
              <Form.Item label="Delivery Address" required={orderType === 'delivery'}
                validateStatus={!deliveryAddress.trim() && (deliveryAddressTouched || submitAttempted) ? 'error' : ''}
                help={!deliveryAddress.trim() && (deliveryAddressTouched || submitAttempted) ? 'Delivery address is required' : ''}
              >
                <Input
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  onBlur={() => setDeliveryAddressTouched(true)}
                  placeholder="Enter delivery address (required)"
                />
              </Form.Item>
            )}
            {orderType === 'delivery' && (
              <Form.Item label="Customer Phone" required={orderType === 'delivery'}
                validateStatus={!customerPhone.trim() && (customerPhoneTouched || submitAttempted) ? 'error' : ''}
                help={!customerPhone.trim() && (customerPhoneTouched || submitAttempted) ? 'Customer phone is required' : ''}
              >
                <Input
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  onBlur={() => setCustomerPhoneTouched(true)}
                  placeholder="Enter customer phone (required)"
                />
              </Form.Item>
            )}
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