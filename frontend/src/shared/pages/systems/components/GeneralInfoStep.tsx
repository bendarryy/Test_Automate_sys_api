import React from 'react';
import { Form, Input, Select } from 'antd';
import { useFormContext, Controller } from 'react-hook-form';
import { CreateSystemFormValues } from '../types/CreateSystemFormValues';

const { Option } = Select;

const GeneralInfoStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<CreateSystemFormValues>();

  return (
    <Form layout="vertical">
      <Form.Item
        label="System Name"
        validateStatus={errors.name ? 'error' : ''}
        help={errors.name?.message}
        required
      >
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field }) => <Input {...field} placeholder="Enter system name" />} />
      </Form.Item>
      <Form.Item
        label="Category"
        validateStatus={errors.category ? 'error' : ''}
        help={errors.category?.message}
        required
      >
        <Controller
          name="category"
          control={control}
          rules={{ required: 'Category is required' }}
          render={({ field }) => (
            <Select {...field} placeholder="Select category" allowClear>
              <Option value="restaurant">Restaurant</Option>
              <Option value="supermarket">Supermarket</Option>
            </Select>
          )}
        />
      </Form.Item>
      <Form.Item label="Description" validateStatus={errors.description ? 'error' : ''} help={errors.description?.message}>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <Input.TextArea {...field} placeholder="Description (optional)" rows={3} />} />
      </Form.Item>
      <Form.Item label="Phone Number" validateStatus={errors.phone_number ? 'error' : ''} help={errors.phone_number?.message}>
        <Controller
          name="phone_number"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Phone number (optional)" />} />
      </Form.Item>
    </Form>
  );
};

export default GeneralInfoStep;
