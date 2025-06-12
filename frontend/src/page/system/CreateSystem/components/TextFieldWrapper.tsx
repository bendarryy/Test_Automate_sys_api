// MUI TextField with error display
import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { FieldError } from 'react-hook-form';

interface Props extends Omit<TextFieldProps, 'label' | 'required'> {
  label: string;
  required?: boolean;
  errorObj?: FieldError;
}

const TextFieldWrapper = React.forwardRef<HTMLInputElement, Props>(
  ({ label, required, errorObj, ...props }, ref) => (
    <TextField
      label={label}
      required={required}
      error={!!errorObj}
      helperText={errorObj ? errorObj.message : ''}
      fullWidth
      variant="outlined"
      inputRef={ref}
      sx={{
        background: 'rgba(255,255,255,0.15)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        borderRadius: 4,
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
      {...props}
    />
  )
);

export default TextFieldWrapper;
