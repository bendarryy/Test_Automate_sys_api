import React, { useState } from "react";
import { useOrders } from "../hooks/useOrders";
// تم حذف استيراد bootstrap لأن الاستيراد موجود في main.tsx فقط
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { MdDelete, MdSort } from "react-icons/md";

import { useNavigate } from "react-router-dom";
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';

const OrdersPage: React.FC = () => {
  const [selectedSystemId] = useSelectedSystemId();
  const { orders, loading, error, handleFilter, sortOrders, updateOrderStatus, deleteOrder } =
    useOrders(Number(selectedSystemId));
  const navigate = useNavigate();

  const [sortKey, setSortKey] = useState<"created_at" | "total_price">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  return (
    <Container className="mt-4">
      <h4 className="mb-4">Order Management</h4>
      {/* Filter Orders */}
      <Form.Group className="mb-3 d-inline-block me-2" style={{ minWidth: 200 }}>
        <Form.Label>Status</Form.Label>
        <Form.Select onChange={(e) => handleFilter(e.target.value)} defaultValue="">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </Form.Select>
      </Form.Group>

      {/* Sort Orders */}
      <Button
        variant="secondary"
        className="mb-3 ms-2"
        onClick={() => {
          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          sortOrders(sortKey, sortOrder);
        }}
      >
        <span className="me-2"><MdSort size={20} /></span>
        Sort by {sortKey} ({sortOrder})
      </Button>

      {/* Loading and Error States */}
      {loading && <Spinner animation="border" />}
      {error && <div className="text-danger">{error}</div>}

      {/* Orders Table */}
      <Table bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Table</th>
            <th style={{ cursor: 'pointer' }}
              onClick={() => {
                setSortKey("total_price");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                sortOrders("total_price", sortOrder);
              }}>
              Total Price
              <span className="ms-1"><MdSort size={16} /></span>
            </th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                No orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer_name}</td>
                <td>{order.table_number}</td>
                <td>${order.total_price}</td>
                <td>
                  <Form.Select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-1"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-1"
                    onClick={() => navigate(`/orders/${order.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteOrder(order.id)}
                  >
                    <MdDelete size={18} />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default OrdersPage;
