import { useForm, UseFormReturn } from 'react-hook-form';
import { CreateSystemFormValues } from '../types/CreateSystemFormValues';

export const useCreateSystemForm = (): UseFormReturn<CreateSystemFormValues> => {
  return useForm<CreateSystemFormValues>({
    defaultValues: {
      name: '',
      category: undefined,
      description: '',
      is_public: true,
      subdomain: '',
      custom_domain: '',
      phone_number: '',
      custom_link: '',
      password: '',
    },
    mode: 'onTouched',
  });
};
