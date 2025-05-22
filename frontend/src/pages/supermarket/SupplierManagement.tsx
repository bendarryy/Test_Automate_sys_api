import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import styles from '../../styles/SupplierManagement.module.css';
import { RiStore2Line } from 'react-icons/ri';

interface Supplier {
  supplier_id: number;
  name: string;
  phone: string;
  email: string;
}

interface SupplierFormData {
  name: string;
  phone: string;
  email: string;
}

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    phone: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { callApi } = useApi<Supplier[]>();
  const systemId = localStorage.getItem('selectedSystemId');

  const fetchSuppliers = async () => {
    try {
      const response = await callApi('get', `supermarket/${systemId}/suppliers/`);
      setSuppliers(response);
    } catch (err) {
      setError('Failed to fetch suppliers');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingSupplier) {
        await callApi('put', `supermarket/${systemId}/suppliers/${editingSupplier.supplier_id}/`, formData);
        setSuccess('Supplier updated successfully');
      } else {
        await callApi('post', `supermarket/${systemId}/suppliers/`, formData);
        setSuccess('Supplier added successfully');
      }
      setIsModalOpen(false);
      fetchSuppliers();
      resetForm();
    } catch (err) {
      setError('Operation failed. Please try again.');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (supplierId: number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await callApi('delete', `supermarket/${systemId}/suppliers/${supplierId}/`);
        setSuccess('Supplier deleted successfully');
        fetchSuppliers();
      } catch (err) {
        setError('Failed to delete supplier');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
    });
    setEditingSupplier(null);
  };

  return (
    <div className={styles.supplierContainer}>
      <div className={styles.supplierHeader}>
        <h1 className={styles.supplierTitle}>Supplier Management</h1>
        <button 
          className={styles.addSupplierButton}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <span style={{fontSize: '20px', fontWeight: 'bold', marginRight: '4px'}}>+</span> Add New Supplier
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.supplierList}>
        {suppliers.length === 0 ? (
          <div className={styles.emptySuppliers}>
            لا يوجد موردين حتى الآن<br />
            اضغط على زر "Add New Supplier" لإضافة أول مورد
          </div>
        ) : suppliers.map((supplier) => (
          <div key={supplier.supplier_id || supplier.name + supplier.phone} className={styles.supplierCard}>
            <h2 className={styles.supplierName}><RiStore2Line className={styles.supplierIcon} /> {supplier.name}</h2>
            <p className={styles.supplierInfo}>Phone: {supplier.phone}</p>
            <p className={styles.supplierInfo}>Email: {supplier.email}</p>
            <div className={styles.supplierActions}>
              <button 
                className={styles.editButton}
                onClick={() => handleEdit(supplier)}
              >
                Edit
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDelete(supplier.supplier_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 style={{textAlign: 'center', marginBottom: 18}}>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.addSupplierButton}
                >
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement; 