import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import { FaUser, FaChair, FaUserTie, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import icon from '../../assets/icon.png';
import './KdsOrderDetails.css';

interface KitchenOrder {
  id: number;
  customer_name: string;
  table_number: string;
  waiter?: string | null;
  status: string;
}

const KdsOrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const systemId = localStorage.getItem('selectedSystemId') || '5';
  const { callApi, loading, error } = useApi();
  const [order, setOrder] = useState<KitchenOrder | null>(null);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    callApi('get', `/restaurant/${systemId}/kitchen/orders/${orderId}/`)
      .then((data: any) => {
        setOrder(data);
        setTimeout(() => setShow(true), 200);
      })
      .catch(() => {});
  }, [orderId, systemId]);

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!order) return <div className="text-center">No order found.</div>;

  return (
    <div className={`kds-order-details-page ${show ? 'fade-in' : ''}`}>  
      <div className="text-start mb-3">
  <Button variant="outline-dark" className="back-btn" onClick={() => navigate(-1)}>
    <FaArrowLeft style={{ marginBottom: 3 }} /> Back
  </Button>
</div>
      <Card className="shadow-lg kds-order-card mx-auto animate__animated animate__fadeInUp" style={{ maxWidth: 420, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 24 }}>
        <Card.Img variant="top" src={icon} style={{ width: 90, height: 90, objectFit: 'contain', margin: '32px auto 0', borderRadius: 20, boxShadow: '0 4px 24px #0001' }} />
        <Card.Body>
          <Card.Title className="mb-4" style={{ fontWeight: 700, fontSize: 28, color: '#2a5298', letterSpacing: 1 }}>تفاصيل الطلب</Card.Title>
          <Row className="mb-3">
            <Col xs={4} className="text-center"><FaCheckCircle className="order-icon" style={{ color: '#2a5298' }} /><div className="order-label">رقم الطلب</div><div className="order-value">{order.id}</div></Col>
            <Col xs={4} className="text-center"><FaUser className="order-icon" style={{ color: '#1e3c72' }} /><div className="order-label">العميل</div><div className="order-value">{order.customer_name}</div></Col>
            <Col xs={4} className="text-center"><FaChair className="order-icon" style={{ color: '#1e3c72' }} /><div className="order-label">الطاولة</div><div className="order-value">{order.table_number}</div></Col>
          </Row>
          <Row className="mb-3">
            <Col xs={6} className="text-center"><FaUserTie className="order-icon" style={{ color: '#1e3c72' }} /><div className="order-label">النادل</div><div className="order-value">{order.waiter || <Badge bg="secondary">غير محدد</Badge>}</div></Col>
            <Col xs={6} className="text-center"><span className="order-icon"><Badge bg={order.status === 'completed' ? 'success' : 'warning'}>{order.status}</Badge></span><div className="order-label">الحالة</div></Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default KdsOrderDetails;
