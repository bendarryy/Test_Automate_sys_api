import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Button, MenuItem, Switch, FormControlLabel, Snackbar, Alert, Stack, CircularProgress } from '@mui/material';
import { updateSystemSchema, UpdateSystemFormValues } from './utils/validation';
import { useGetSystem, useUpdateSystem } from './hooks/useUpdateSystem';
import TextFieldWrapper from './components/TextFieldWrapper';

const glassStyles = {
  background: 'rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  borderRadius: 8,
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.18)',
  p: { xs: 2, md: 4 },
  maxWidth: 500,
  mx: 'auto',
  mt: 6,
};

const UpdateSystem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading: isFetching, error: fetchError } = useGetSystem(id!);
  const { update, loading: isPending, error: updateError } = useUpdateSystem(id!);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UpdateSystemFormValues>({
    resolver: zodResolver(updateSystemSchema),
    defaultValues: {
      name: '',
      category: 'restaurant',
      description: '',
      is_public: false,
      subdomain: '',
      custom_domain: '',
      phone_number: '',
      custom_link: '',
      password: '',
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (data) {
      reset({
        ...data,
        password: '', // never prefill password
      });
    }
  }, [data, reset]);

  React.useEffect(() => {
    if (!updateError) return;
    setOpenSnackbar(true);
  }, [updateError]);

  if (isFetching) {
    return (
      <Box sx={{ ...glassStyles, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (fetchError) {
    return (
      <Box sx={glassStyles}>
        <Alert severity="error">Failed to load system data.</Alert>
      </Box>
    );
  }

  const onSubmit = (values: UpdateSystemFormValues) => {
    // Ensure all required fields are present and not undefined
    const safeValues = {
      name: values.name ?? '',
      category: values.category ?? 'restaurant',
      description: values.description ?? '',
      is_public: values.is_public ?? false,
      subdomain: values.subdomain ?? '',
      custom_domain: values.custom_domain ?? '',
      phone_number: values.phone_number ?? '',
      custom_link: values.custom_link ?? '',
      password: values.password ?? '',
      is_active: values.is_active ?? true,
    };
    update(safeValues).then(() => {
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate(`/system/${id}/edit`);
      }, 1200);
    });
  };

  return (
    <Box sx={glassStyles}>
      <Typography variant="h5" fontWeight={700} mb={2} align="center">
        Edit System
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextFieldWrapper
                label="System Name"
                required
                errorObj={errors.name}
                {...field}
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextFieldWrapper
                select
                label="Category"
                errorObj={errors.category}
                {...field}
              >
                <MenuItem value="restaurant">Restaurant</MenuItem>
                <MenuItem value="supermarket">Supermarket</MenuItem>
              </TextFieldWrapper>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextFieldWrapper
                label="Description"
                multiline
                minRows={2}
                errorObj={errors.description}
                {...field}
              />
            )}
          />
          <Controller
            name="is_public"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Public System"
              />
            )}
          />
          <Controller
            name="subdomain"
            control={control}
            render={({ field }) => (
              <TextFieldWrapper
                label="Subdomain"
                errorObj={errors.subdomain}
                {...field}
              />
            )}
          />
          <Controller
            name="custom_domain"
            control={control}
            render={({ field }) => (
              <TextFieldWrapper
                label="Custom Domain"
                errorObj={errors.custom_domain}
                {...field}
              />
            )}
          />
          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <TextFieldWrapper
                label="Phone Number"
                errorObj={errors.phone_number}
                {...field}
              />
            )}
          />
          <Controller
            name="custom_link"
            control={control}
            render={({ field }) => (
              <TextFieldWrapper
                label="Custom Link (URL)"
                errorObj={errors.custom_link}
                {...field}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextFieldWrapper
                label="Password"
                type="password"
                required
                errorObj={errors.password}
                {...field}
              />
            )}
          />
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Active System"
              />
            )}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isPending}
            sx={{ borderRadius: 4, fontWeight: 600 }}
            fullWidth
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </form>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {updateError ? (
          <Alert severity="error" variant="filled">{updateError}</Alert>
        ) : (
          <Alert severity="success" variant="filled">System updated successfully!</Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default UpdateSystem;
