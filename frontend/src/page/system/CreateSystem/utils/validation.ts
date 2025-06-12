// Zod schema for CreateSystem form validation
import { z } from 'zod';

export const createSystemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['restaurant', 'supermarket']),
  description: z.string().optional(),
  is_public: z.boolean(),
  subdomain: z.string().optional(),
  custom_domain: z.string().optional(),
  phone_number: z.string().optional(),
  custom_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type CreateSystemFormValues = z.infer<typeof createSystemSchema>;
