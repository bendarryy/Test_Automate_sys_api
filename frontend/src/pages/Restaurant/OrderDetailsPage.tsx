import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
// تم حذف استيراد bootstrap لأن الاستيراد موجود في main.tsx فقط
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

interface OrderDetails {
  id: number;
  customer_name: string;
  table_number: string;
  total_price: string;
  status: string;
  order_items: { menu_item_name: string; quantity: number }[];
  created_at: string;
}

const statusVariant: Record<string, string> = {
  pending: "warning",
  preparing: "secondary",
  ready: "success",
  completed: "success",
  canceled: "danger",
};

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { callApi, loading, error } = useApi();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const response = await callApi("get", `restaurant/5/orders/${orderId}/`);
      if (response) {
        setOrderDetails(response);
      }
    };
    fetchOrderDetails();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  return (
    <Container className="mt-4">
      {orderDetails ? (
        <Card className="p-3 shadow">
          <h5 className="fw-bold mb-3">Order #{orderDetails.id}</h5>
          <Row className="mb-3">
            <Col md={6}>
              <div><strong>Customer:</strong> {orderDetails.customer_name}</div>
              <div><strong>Table:</strong> {orderDetails.table_number}</div>
            </Col>
            <Col md={6}>
              <div><strong>Total Price:</strong> ${orderDetails.total_price}</div>
              <div><strong>Created At:</strong> {new Date(orderDetails.created_at).toLocaleString()}</div>
            </Col>
          </Row>
          <hr />
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="fw-bold">Status:</span>
            <Badge bg={statusVariant[orderDetails.status] || "secondary"} className="text-uppercase fw-bold">
              {orderDetails.status}
            </Badge>
          </div>
          <h6 className="mt-3 mb-2">Order Items:</h6>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-center">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.order_items.map((item, index) => (
                <tr key={index}>
                  <td>{item.menu_item_name}</td>
                  <td className="text-center">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <div className="text-center">No order details found.</div>
      )}
    </Container>
  );
};

export default OrderDetailsPage;
