import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useEmployeeApi } from '../../hooks/useEmployeeApi';
// تم حذف استيراد bootstrap الجماعي. استخدم الاستيراد المنفرد فقط للمكونات المطلوبة.
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { FiUsers, FiEye, FiEdit2, FiTrash2, FiSave, FiXCircle } from 'react-icons/fi';

interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
}

const EmployeesPage: React.FC = () => {
  const { data, loading, error, callApi } = useApi<Employee[]>();
  const employeeApi = useEmployeeApi();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch employees
  const fetchEmployees = () => callApi('get', '/core/5/employees/');
  useEffect(() => { fetchEmployees(); /* eslint-disable-next-line */ }, []);

  // Open modal and fetch details
  const handleView = async (emp: Employee) => {
    setShowModal(true);
    setModalMode('view');
    setModalLoading(true);
    setModalError(null);
    try {
      const details = await employeeApi.getEmployee(emp.id);
      setSelectedEmployee(details);
      setEditForm(details);
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Error loading employee');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = () => {
    setModalMode('edit');
    setEditForm(selectedEmployee || {});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const updated = await employeeApi.updateEmployee(selectedEmployee.id, editForm);
      setSelectedEmployee(updated);
      setModalMode('view');
      fetchEmployees();
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Error updating employee');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    setDeleteLoading(true);
    setModalError(null);
    try {
      await employeeApi.deleteEmployee(selectedEmployee.id);
      setShowModal(false);
      fetchEmployees();
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Error deleting employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow mb-4">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <span className="bg-primary text-white rounded-circle p-2 me-2"><FiUsers size={24} /></span>
            <h3 className="mb-0 fw-bold">Employees List</h3>
          </div>
          {loading && <div className="text-center my-4"><Spinner animation="border" /></div>}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && data && Array.isArray(data) && (
            <Table responsive bordered hover className="align-middle mt-3">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr><td colSpan={6} className="text-center">No employees found.</td></tr>
                )}
                {data.map((emp: Employee, idx: number) => (
                  <tr key={emp.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{emp.name}</td>
                    <td>{emp.role}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.email}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-1" title="View" onClick={() => handleView(emp)}><FiEye /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      {/* Modal for view/edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'view' ? 'Employee Details' : 'Edit Employee'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <div className="text-center my-3"><Spinner animation="border" /></div>
          ) : modalError ? (
            <Alert variant="danger">{modalError}</Alert>
          ) : selectedEmployee ? (
            <>
              {modalMode === 'view' ? (
                <div>
                  <p><b>Name:</b> {selectedEmployee.name}</p>
                  <p><b>Role:</b> {selectedEmployee.role}</p>
                  <p><b>Phone:</b> {selectedEmployee.phone}</p>
                  <p><b>Email:</b> {selectedEmployee.email}</p>
                </div>
              ) : (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control name="name" value={editForm.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEditChange(e)} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select name="role" value={editForm.role || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleEditChange(e)}>
                      <option value="">Select Role</option>
                      <option value="waiter">Waiter</option>
                      <option value="chef">Chef</option>
                      <option value="manager">Manager</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control name="phone" value={editForm.phone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEditChange(e)} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" value={editForm.email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEditChange(e)} />
                  </Form.Group>
                </Form>
              )}
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {modalMode === 'view' && (
            <>
              <Button variant="outline-success" onClick={handleEdit} className="me-2"><FiEdit2 className="me-1" />Edit</Button>
              <Button variant="outline-danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <Spinner animation="border" size="sm" className="me-1" /> : <FiTrash2 className="me-1" />}
                Delete
              </Button>
            </>
          )}
          {modalMode === 'edit' && (
            <>
              <Button variant="success" onClick={handleSave}><FiSave className="me-1" />Save</Button>
              <Button variant="secondary" onClick={() => setModalMode('view')}><FiXCircle className="me-1" />Cancel</Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeesPage;
