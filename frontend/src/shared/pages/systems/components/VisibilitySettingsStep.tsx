import React from 'react';
import { Form, Switch, Input } from 'antd';
import { useFormContext, Controller } from 'react-hook-form';
import { CreateSystemFormValues } from '../types/CreateSystemFormValues';

interface VisibilitySettingsStepProps {
  isEditMode?: boolean;
}

const VisibilitySettingsStep: React.FC<VisibilitySettingsStepProps> = ({ isEditMode }) => {
  const { control, formState: { errors }, watch } = useFormContext<CreateSystemFormValues>();
  const isPublic = watch('is_public');

  return (
    <Form layout="vertical">
      <Form.Item label="Public System">
        <Controller
          name="is_public"
          control={control}
          render={({ field }) => (
            <Switch
              checked={!!field.value}
              onChange={field.onChange}
              checkedChildren="Public"
              unCheckedChildren="Private"
            />
          )}
        />
      </Form.Item>
      {isEditMode && !isPublic && (
        <Form.Item label="Password" validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => <Input.Password {...field} placeholder="Password (optional)" />} />
        </Form.Item>
      )}
    </Form>
  );
};

export default VisibilitySettingsStep;
