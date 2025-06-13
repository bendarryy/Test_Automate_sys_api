import React from 'react';
import { Modal, Input, Upload, Button, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MenuItem } from '../types/menu';

interface MenuItemModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
  formData: MenuItem;
  setFormData: (data: MenuItem) => void;
  categories: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  editItem: MenuItem | null;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  visible,
  onCancel,
  onSave,
  formData,
  setFormData,
  categories,
  onChange,
  editItem,
}) => (
  <Modal
    title={editItem ? 'Edit Item' : 'Add Item'}
    open={visible}
    onCancel={onCancel}
    footer={[
      <Button key="back" onClick={onCancel}>
        Cancel
      </Button>,
      <Button key="submit" type="primary" onClick={onSave}>
        Save
      </Button>,
    ]}
  >
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 500 }}>Name</label>
        <Input
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Name"
          style={{ marginTop: 4 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 500, display: 'block' }}>Image</label>
        <Upload
          name="image"
          listType="picture-card"
          showUploadList={false}
          accept="image/*"
          beforeUpload={file => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
              message.error('يرجى اختيار صورة فقط');
              return Upload.LIST_IGNORE;
            }
            setFormData({ ...formData, image: file });
            return false;
          }}
        >
          {formData.image ? (
            <img
              src={typeof formData.image === 'object' && formData.image !== null && 'type' in formData.image
                ? URL.createObjectURL(formData.image as File)
                : (formData.image as string)}
              alt="preview"
              style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
            />
          ) : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>رفع صورة</div>
            </div>
          )}
        </Upload>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500 }}>Category</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              style={{ display: 'none' }} /> {/* dummy for spacing, can be removed if not needed */}
            <Select
              showSearch
              allowClear={false}
              value={formData.category || undefined}
              placeholder="Select or add category"
              style={{ width: '100%', marginTop: 4 }}
              onChange={val => setFormData({ ...formData, category: val })}
              onSearch={() => {}}
              filterOption={(input, option) => {
                const label = typeof option?.children === 'string' ? option.children : '';
                return label.toLowerCase().includes(input.toLowerCase());
              }}
              dropdownRender={menu => (
                <>
                  {menu}
                  <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                    <Input
                      style={{ flex: 1 }}
                      placeholder="Add new category"
                      value={formData.newCategory || ''}
                      onChange={e => setFormData({ ...formData, newCategory: e.target.value })}
                      onPressEnter={e => {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !categories.includes(val)) {
                          setFormData({ ...formData, category: val, newCategory: '' });
                          categories.push(val);
                            message.success('Category added');
                        }
                      }}
                    />
                    <Button
                      type="link"
                      onClick={() => {
                        const val = (formData.newCategory || '').trim();
                        if (val && !categories.includes(val)) {
                          setFormData({ ...formData, category: val, newCategory: '' });
                          categories.push(val);
                          message.success('Category added');
                        }
                      }}
                      style={{ marginLeft: 0, padding: "0 4px", height: 'auto', lineHeight: 'normal' }}
                    >
                     +
                    </Button>
                  </div>
                </>
              )}
            >
              {categories.map(cat => (
                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500 }}>Price (EGP)</label>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={onChange}
            placeholder="Price"
            style={{ marginTop: 4 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500 }}>Cost</label>
          <Input
            name="cost"
            type="number"
            value={formData.cost}
            onChange={onChange}
            placeholder="Cost"
            style={{ marginTop: 4 }}
          />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontWeight: 500 }}>
          <span>Available</span>
          <span style={{ marginLeft: 8 }}>
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={onChange}
              style={{ verticalAlign: 'middle' }}
            />
          </span>
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 500 }}>Description</label>
        <Input.TextArea
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Description"
          autoSize={{ minRows: 3, maxRows: 5 }}
          style={{ marginTop: 4 }}
        />
      </div>
    </div>
  </Modal>
);

export default MenuItemModal;