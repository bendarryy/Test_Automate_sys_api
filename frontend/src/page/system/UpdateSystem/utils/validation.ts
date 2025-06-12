// Zod schema for UpdateSystem form validation
import { z } from 'zod';

export const updateSystemSchema = z.object({
  password: z.string().min(1, 'Password is required'), // always required
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  category: z.enum(['restaurant', 'supermarket']).optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  is_public: z.boolean().optional(),
  subdomain: z.string()
    .regex(/^[a-z0-9-]+$/i, 'Subdomain can only contain letters, numbers, and hyphens')
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be at most 63 characters')
    .toLowerCase()
    .optional(),
  custom_domain: z.string()
    .regex(/^[a-z0-9.-]+$/i, 'Custom domain can only contain letters, numbers, dots, and hyphens')
    .max(255, 'Custom domain must be at most 255 characters')
    .toLowerCase()
    .optional(),
  phone_number: z.string().optional(),
  custom_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});

export type UpdateSystemFormValues = z.infer<typeof updateSystemSchema>;
