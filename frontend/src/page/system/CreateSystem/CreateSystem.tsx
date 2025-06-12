import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box, Typography, Button, MenuItem, Switch, FormControlLabel, Snackbar, Alert, Stack, Stepper, Step, StepLabel, TextField
} from '@mui/material';
import { createSystemSchema, CreateSystemFormValues } from './utils/validation';
import { CreateSystemRequest } from './types';
import { useCreateSystem } from './hooks/useCreateSystem';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useApi } from 'shared/hooks/useApi';
import { useNavigate } from 'react-router-dom';

const steps = [
  'Basic Info',
  'Visibility',
  'Public Profile (optional)',
  'Media (optional)'
];

const glassStyles = {
  background: 'rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  borderRadius: 8,
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.18)',
  p: { xs: 2, md: 4 },
  maxWidth: 600,
  mx: 'auto',
  mt: 6,
};

const defaultValues: CreateSystemFormValues = {
  name: '',
  category: 'restaurant',
  description: '',
  is_public: false,
  subdomain: '',
  custom_domain: '',
  phone_number: '',
  custom_link: '',
};

// Add type for public profile
interface PublicProfileForm {
  public_title: string;
  public_description: string;
  general_description: string;
  primary_color: string;
  secondary_color: string;
  email: string;
  whatsapp_number: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    other?: string;
  };
  is_public: boolean;
  logo?: string;
  gallery?: string[];
}

const useUpdatePublicProfile = (systemId: string | null) => {
  const { callApi, loading, error } = useApi();
  return useMutation({
    mutationFn: async (data: PublicProfileForm) => {
      if (!systemId) throw new Error('No systemId');
      // Use useApi instead of axios
      const response = await callApi('patch', `/core/systems/${systemId}/public-profile/`, data);
      return response;
    },
  });
};

const CreateSystem: React.FC = () => {
  const navigate = useNavigate();
  const { create, loading: isPending, error: createError } = useCreateSystem();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [systemId, setSystemId] = React.useState<string | null>(null);
  const [publicProfile, setPublicProfile] = React.useState<Partial<PublicProfileForm> & { logo?: string; gallery?: string[] }>({});
  const {
    mutate: updatePublicProfile,
  } = useUpdatePublicProfile(systemId);

  const { control, handleSubmit, formState: { errors }, getValues, trigger, watch } = useForm<CreateSystemFormValues>({
    resolver: zodResolver(createSystemSchema),
    defaultValues,
  });

  const isPublic = watch('is_public');

  // Step content renderers
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  label="System Name"
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...field}
                  fullWidth
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Category"
                  error={!!errors.category}
                  helperText={errors.category?.message}
                  {...field}
                  fullWidth
                  variant="outlined"
                >
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="supermarket">Supermarket</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Description"
                  multiline
                  minRows={2}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  {...field}
                  fullWidth
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="phone_number"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Phone Number"
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message}
                  {...field}
                  fullWidth
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="custom_link"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Location URL"
                  error={!!errors.custom_link}
                  helperText={errors.custom_link?.message}
                  {...field}
                  fullWidth
                  variant="outlined"
                />
              )}
            />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={2}>
            <Controller
              name="is_public"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Make this system public?"
                />
              )}
            />
            {isPublic && (
              <>
                <Controller
                  name="subdomain"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Subdomain"
                      error={!!errors.subdomain}
                      helperText={errors.subdomain?.message}
                      {...field}
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
                <Controller
                  name="custom_domain"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Custom Domain (optional)"
                      error={!!errors.custom_domain}
                      helperText={errors.custom_domain?.message}
                      {...field}
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </>
            )}
          </Stack>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" mb={2}>Public Profile (optional)</Typography>
            <Stack spacing={2}>
              <TextField
                label="Public Title"
                placeholder="e.g. My Restaurant Group"
                value={publicProfile.public_title || ''}
                onChange={e => setPublicProfile(p => ({ ...p, public_title: e.target.value }))}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Public Description"
                placeholder="e.g. Welcome to our restaurant group, serving quality food since 1990."
                value={publicProfile.public_description || ''}
                onChange={e => setPublicProfile(p => ({ ...p, public_description: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
                variant="outlined"
              />
              <TextField
                label="General Description"
                placeholder="e.g. We operate 5 branches across the city."
                value={publicProfile.general_description || ''}
                onChange={e => setPublicProfile(p => ({ ...p, general_description: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
                variant="outlined"
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Primary Color"
                  type="color"
                  value={publicProfile.primary_color || '#1976d2'}
                  onChange={e => setPublicProfile(p => ({ ...p, primary_color: e.target.value }))}
                  sx={{ width: 80, p: 0, minWidth: 0 }}
                  InputProps={{ style: { padding: 0 } }}
                />
                <TextField
                  label="Secondary Color"
                  type="color"
                  value={publicProfile.secondary_color || '#fff'}
                  onChange={e => setPublicProfile(p => ({ ...p, secondary_color: e.target.value }))}
                  sx={{ width: 80, p: 0, minWidth: 0 }}
                  InputProps={{ style: { padding: 0 } }}
                />
              </Stack>
              <TextField
                label="Email"
                placeholder="e.g. info@myrestaurant.com"
                value={publicProfile.email || ''}
                onChange={e => setPublicProfile(p => ({ ...p, email: e.target.value }))}
                fullWidth
                type="email"
                variant="outlined"
              />
              <TextField
                label="Whatsapp Number"
                placeholder="e.g. +201234567890"
                value={publicProfile.whatsapp_number || ''}
                onChange={e => setPublicProfile(p => ({ ...p, whatsapp_number: e.target.value }))}
                fullWidth
                variant="outlined"
              />
              <Typography variant="subtitle1" mt={2}>Social Links</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Facebook"
                  placeholder="e.g. https://facebook.com/myrestaurant"
                  value={publicProfile.social_links?.facebook || ''}
                  onChange={e => setPublicProfile(p => ({ ...p, social_links: { ...p.social_links, facebook: e.target.value } }))}
                  fullWidth
                />
                <TextField
                  label="Instagram"
                  placeholder="e.g. https://instagram.com/myrestaurant"
                  value={publicProfile.social_links?.instagram || ''}
                  onChange={e => setPublicProfile(p => ({ ...p, social_links: { ...p.social_links, instagram: e.target.value } }))}
                  fullWidth
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Twitter"
                  placeholder="e.g. https://twitter.com/myrestaurant"
                  value={publicProfile.social_links?.twitter || ''}
                  onChange={e => setPublicProfile(p => ({ ...p, social_links: { ...p.social_links, twitter: e.target.value } }))}
                  fullWidth
                />
                <TextField
                  label="LinkedIn"
                  placeholder="e.g. https://linkedin.com/company/myrestaurant"
                  value={publicProfile.social_links?.linkedin || ''}
                  onChange={e => setPublicProfile(p => ({ ...p, social_links: { ...p.social_links, linkedin: e.target.value } }))}
                  fullWidth
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="YouTube"
                  placeholder="e.g. https://youtube.com/myrestaurant"
                  value={publicProfile.social_links?.youtube || ''}
                  onChange={e => setPublicProfile(p => ({ ...p, social_links: { ...p.social_links, youtube: e.target.value } }))}
                  fullWidth
                />
                <TextField
                  label="TikTok"
                  placeholder="e.g. https://tiktok.com/@myrestaurant"
                  value={publicProfile.social_links?.tiktok || ''}
                  onChange={e => setPublicProfile(p => ({ ...p, social_links: { ...p.social_links, tiktok: e.target.value } }))}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Other Link"
                placeholder="e.g. https://mywebsite.com"
                value={publicProfile.social_links?.other || ''}
                onChange={e => setPublicProfile(p => ({ ...p, social_links: { ...p.social_links, other: e.target.value } }))}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={publicProfile.is_public || false}
                    onChange={e => setPublicProfile(p => ({ ...p, is_public: e.target.checked }))}
                  />
                }
                label="Show public profile?"
              />
            </Stack>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" mb={2}>Media (optional)</Typography>
            <Stack spacing={2}>
              <Typography variant="subtitle1">System Logo</Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{ width: 200 }}
              >
                Upload Logo Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => {
                        setPublicProfile(p => ({ ...p, logo: ev.target?.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
              {publicProfile.logo && (
                <Box mt={1}>
                  <img
                    src={publicProfile.logo}
                    alt="Logo Preview"
                    style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                  />
                </Box>
              )}
              <Typography variant="subtitle1">Gallery Images</Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{ width: 200 }}
              >
                Upload Gallery Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={e => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const readers = Array.from(files).map(file => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = ev => resolve(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readers).then(imgs => {
                        setPublicProfile(p => ({ ...p, gallery: imgs }));
                      });
                    }
                  }}
                />
              </Button>
              {publicProfile.gallery && publicProfile.gallery.length > 0 && (
                <Stack direction="row" spacing={1} mt={1}>
                  {publicProfile.gallery.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>
        );
      default:
        return null;
    }
  };

  // Step navigation
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleNext = async () => {
    let valid = true;
    if (activeStep === 0 || activeStep === 1) {
      valid = await trigger();
    }
    if (!valid) return;
    if (activeStep === 0) {
      setActiveStep((prev) => prev + 1);
      return;
    }
    if (activeStep === 1) {
      // Create system on step 1 (Visibility)
      handleSubmit(async (values) => {
        const filtered = Object.fromEntries(
          Object.entries(values).filter(([_, v]) =>
            v !== '' && v !== undefined && v !== null
          )
        ) as unknown as CreateSystemRequest;
        const res = await create(filtered);
        setOpenSnackbar(true);
        const newId = res && (res as any).system && (res as any).system.id ? (res as any).system.id : undefined;
        if (newId) {
          setSystemId(newId);
          setActiveStep((prev) => prev + 1);
        } else {
          console.log('No id in response, not advancing step.');
        }
      })();
      return;
    }
    if (activeStep === 2 && systemId) {
      updatePublicProfile(publicProfile as PublicProfileForm, {
        onSuccess: () => setActiveStep((prev) => prev + 1)
      });
      return;
    }
    if (activeStep === 3) {
      // After Media step, go to /systems
      navigate('/systems');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  return (
    <Box sx={glassStyles}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {/* Remove onSubmit from form, handle navigation via button */}
      <form noValidate>
        {renderStepContent(activeStep)}
        <Stack direction="row" spacing={2} mt={4} justifyContent="center">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={isPending}
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Stack>
      </form>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {systemId ? (
          <Alert severity="success" variant="filled">System created successfully!</Alert>
        ) : createError ? (
          <Alert severity="error" variant="filled">{createError}</Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

export default CreateSystem;
