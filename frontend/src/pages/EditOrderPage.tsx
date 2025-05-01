import React from "react";
// تم حذف استيراد bootstrap لأن الاستيراد موجود في main.tsx فقط
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { MdAdd, MdRemove, MdDelete } from "react-icons/md";
import { useEditOrder } from "../hooks/useEditOrder";
import { useNavigate } from "react-router-dom";
import { useGetMenu } from "../hooks/useGetMenu";
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';

const EditOrderPage: React.FC = () => {
  const [selectedSystemId] = useSelectedSystemId();
  const {
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
  } = useEditOrder();

  const { getMenu, data, loading: menuLoading, error: menuError } = useGetMenu(Number(selectedSystemId));
  
  React.useEffect(() => {
    getMenu();
  }, []);
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <Container className="mt-4" style={{ maxWidth: 600 }}>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  return (
    <Container className="mt-4" style={{ maxWidth: 600 }}>
      <div className="p-3 bg-white rounded shadow-sm">
        <h5 className="mb-3">Edit Order #{orderDetails?.id}</h5>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="customerName">
            <Form.Label>Customer Name</Form.Label>
            <Form.Control
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="tableNumber">
            <Form.Label>Table Number</Form.Label>
            <Form.Control
              type="text"
              name="table_number"
              value={formData.table_number}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="totalPrice">
            <Form.Label>Total Price</Form.Label>
            <Form.Control
              type="text"
              name="total_price"
              value={formData.total_price}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control
              type="text"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            />
          </Form.Group>
          <h6 className="mt-4">Order Items</h6>
          <Table bordered hover responsive className="mt-2">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={item.id + index}>
                  <td>
                    <Form.Select
                      value={item.menu_item_name}
                      onChange={e => handleItemNameChange(item.id, e.target.value)}
                    >
                      {data?.map(menuItem => (
                        <option key={menuItem.id} value={menuItem.name}>
                          {menuItem.name}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <MdRemove size={20} />
                    </Button>
                    {item.quantity}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <MdAdd size={20} />
                    </Button>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <MdDelete size={20} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="outline-primary" className="mt-3" onClick={() => handleAddItem()}>
            Add Item
          </Button>
          <h6 className="mt-4">Add Items from Menu</h6>
          {menuLoading ? (
            <Spinner animation="border" />
          ) : menuError ? (
            <Alert variant="danger">{menuError}</Alert>
          ) : (
            <div className="mt-2">
              {data?.map(menuItem => (
                <Button
                  key={menuItem.id}
                  variant="outline-secondary"
                  className="me-2 mb-2"
                  onClick={() => {
                    handleAddItem({
                      id: menuItem.id,
                      menu_item_name: menuItem.name,
                      quantity: 1,
                    });
                  }}
                >
                  {menuItem.name}
                </Button>
              ))}
            </div>
          )}
          <div className="mt-4 d-flex justify-content-between">
            <Button variant="primary" type="submit">
              Save
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default EditOrderPage;
