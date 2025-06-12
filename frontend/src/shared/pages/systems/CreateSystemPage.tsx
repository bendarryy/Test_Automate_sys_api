import React, { useState } from 'react';
import { Steps, Button, message, Card } from 'antd';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateSystemForm } from './hooks/useCreateSystemForm';
import { useApi } from '../../../shared/hooks/useApi';
import GeneralInfoStep from './components/GeneralInfoStep';
import DomainsLocationStep from './components/DomainsLocationStep';
import VisibilitySettingsStep from './components/VisibilitySettingsStep';
import ReviewSubmitStep from './components/ReviewSubmitStep';

const steps = [
  {
    title: 'General Info',
    content: <GeneralInfoStep />, 
    icon: 'info-circle',
  },
  {
    title: 'Domains & Location',
    content: <DomainsLocationStep />, 
    icon: 'global',
  },
  {
    title: 'Visibility & Settings',
    content: <VisibilitySettingsStep />, 
    icon: 'eye',
  },
  {
    title: 'Review & Submit',
    content: <ReviewSubmitStep />, 
    icon: 'check-circle',
  },
];

const CreateSystemPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const methods = useCreateSystemForm();
  const { callApi } = useApi();
  const navigate = useNavigate();

  const next = async () => {
    const valid = await methods.trigger();
    if (!valid) return;
    setCurrent(current + 1);
  };

  const prev = () => setCurrent(current - 1);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await callApi('post', '/core/systems/create/', data);
      message.success('System created successfully!');
      methods.reset();
      navigate('/systems');
    } catch (err: any) {
      message.error(err?.response?.data?.detail || err.message || 'Failed to create system');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ef 0%, #f8fafc 100%)',
      padding: 0,
    }}>
      <Card
        style={{
          maxWidth: 720,
          width: '100%',
          borderRadius: 22,
          boxShadow: '0 8px 32px rgba(60,60,120,0.13)',
          padding: 0,
          background: '#fff',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '40px 48px 32px 48px' }}>
          <Steps
            current={current}
            style={{ marginBottom: 40, fontSize: 18 }}
            responsive
            items={steps.map((item) => ({
              key: item.title,
              title: item.title,
              icon: item.icon,
            }))}
          />
          <FormProvider {...methods}>
            <div style={{
              minHeight: 340,
              marginBottom: 32,
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              {steps[current].content}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              {current > 0 && (
                <Button onClick={prev} style={{ minWidth: 120, borderRadius: 8, fontWeight: 500 }}>
                  Previous
                </Button>
              )}
              {current < steps.length - 1 && (
                <Button type="primary" onClick={next} style={{ minWidth: 120, borderRadius: 8, fontWeight: 500 }}>
                  Next
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button type="primary" loading={submitting} onClick={methods.handleSubmit(onSubmit)} style={{ minWidth: 120, borderRadius: 8, fontWeight: 500 }}>
                  Submit
                </Button>
              )}
            </div>
          </FormProvider>
        </div>
      </Card>
    </div>
  );
};

export default CreateSystemPage;
