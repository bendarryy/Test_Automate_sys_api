// InventoryManagementPage.tsx
import React from 'react';
import styles from './styles/InventoryManagementPage.module.css';
import InventoryHeader from './components/InventoryHeader';
import InventoryTable from './components/InventoryTable';
import InventoryFormModal from './components/InventoryFormModal';
import { useInventoryManagement } from './hooks/useInventoryManagement';

const InventoryManagementPage: React.FC = () => {
  const {
    inventory,
    loading,
    error,
    editingKey,
    editingData,
    newItem,
    showModal,
    setEditingData,
    setNewItem,
    handleOpenModal,
    handleCloseModal,
    handleAddNewIngredient,
    isEditing,
    edit,
    cancel,
    save,
    handleDelete,
  } = useInventoryManagement();

  return (
    <div className={`container py-4 ${styles.customContainer}`}>
      <InventoryHeader onAdd={handleOpenModal} />
      {error && <div className="alert alert-danger">{error}</div>}
      <InventoryTable
        inventory={inventory}
        loading={loading}
        editingKey={editingKey}
        editingData={editingData}
        isEditing={isEditing}
        edit={edit}
        cancel={cancel}
        save={save}
        handleDelete={handleDelete}
        setEditingData={setEditingData}
      />
      <InventoryFormModal
        visible={showModal}
        loading={loading}
        newItem={newItem}
        setNewItem={setNewItem}
        onCancel={handleCloseModal}
        onAdd={handleAddNewIngredient}
      />
    </div>
  );
};

export default InventoryManagementPage;