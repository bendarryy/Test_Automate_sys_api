import React from 'react';
import { Card, Descriptions } from 'antd';
import { useFormContext } from 'react-hook-form';
import { CreateSystemFormValues } from '../types/CreateSystemFormValues';

const ReviewSubmitStep: React.FC = () => {
  const { getValues } = useFormContext<CreateSystemFormValues>();
  const values = getValues();

  return (
    <Card title="Review System Information" bordered>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Name">{values.name}</Descriptions.Item>
        <Descriptions.Item label="Category">{values.category}</Descriptions.Item>
        <Descriptions.Item label="Description">{values.description || '-'}</Descriptions.Item>
        <Descriptions.Item label="Phone Number">{values.phone_number || '-'}</Descriptions.Item>
        <Descriptions.Item label="Subdomain">{values.subdomain || '-'}</Descriptions.Item>
        <Descriptions.Item label="Custom Domain">{values.custom_domain || '-'}</Descriptions.Item>
        <Descriptions.Item label="Custom Link">{values.custom_link || '-'}</Descriptions.Item>
        <Descriptions.Item label="Public">{values.is_public ? 'Yes' : 'No'}</Descriptions.Item>
        {values.password && <Descriptions.Item label="Password">******</Descriptions.Item>}
      </Descriptions>
    </Card>
  );
};

export default ReviewSubmitStep;
