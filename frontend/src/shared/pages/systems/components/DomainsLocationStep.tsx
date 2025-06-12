import React from 'react';
import { Form, Input } from 'antd';
import { useFormContext, Controller } from 'react-hook-form';
import { CreateSystemFormValues } from '../types/CreateSystemFormValues';

const DomainsLocationStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<CreateSystemFormValues>();

  return (
    <Form layout="vertical">
      <Form.Item label="Subdomain" validateStatus={errors.subdomain ? 'error' : ''} help={errors.subdomain?.message}>
        <Controller
          name="subdomain"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Subdomain (optional)" />} />
      </Form.Item>
      <Form.Item label="Custom Domain" validateStatus={errors.custom_domain ? 'error' : ''} help={errors.custom_domain?.message}>
        <Controller
          name="custom_domain"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Custom domain (optional)" />} />
      </Form.Item>
      <Form.Item label="Custom Link" validateStatus={errors.custom_link ? 'error' : ''} help={errors.custom_link?.message}>
        <Controller
          name="custom_link"
          control={control}
          rules={{
            pattern: {
              value: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/,
              message: 'Enter a valid URL',
            },
          }}
          render={({ field }) => <Input {...field} placeholder="Custom link (URL, optional)" />} />
      </Form.Item>
    </Form>
  );
};

export default DomainsLocationStep;
