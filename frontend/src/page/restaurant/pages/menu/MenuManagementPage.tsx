import React from 'react';
import Header from '../../../../components/Header';
import { Spin } from 'antd';
import { useMenuManagement } from './hooks/useMenuManagement';
import MenuManagementHeader from './components/MenuManagementHeader';
import MenuTable from './components/MenuTable';
import MenuItemModal from './components/MenuItemModal';

const MenuManagementPage: React.FC = () => {
  const {
    categories,
    filteredItems,
    loading,
    showModal,
    setShowModal,
    formData,
    setFormData,
    editItem,
    selectedCategories,
    setSelectedCategories,
    searchText,
    setSearchText,
    handleAddClick,
    handleEditClick,
    handleDeleteClick,
    handleSave,
    handleChange,
    itemLoadingId, // تأكد من تمرير هذا إذا كنت تستخدمه في MenuTable
  } = useMenuManagement();

  const isInitialLoading = loading && categories.length === 0;

  return (
    <div style={{ padding: 24 }}>
      <Header
        title="Menu Management"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Menu' }
        ]}
        actions={
          <MenuManagementHeader
            searchText={searchText}
            setSearchText={setSearchText}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            categories={categories}
            loading={loading}
            onAdd={handleAddClick}
          />
        }
      />
      {isInitialLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin size="large" />
        </div>
      ) : (
        <MenuTable
          items={filteredItems}
          categories={categories}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          loading={false}
          itemLoadingId={itemLoadingId}
        />
      )}
      <MenuItemModal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        onChange={handleChange}
        editItem={editItem}
      />
    </div>
  );
};

export default MenuManagementPage;