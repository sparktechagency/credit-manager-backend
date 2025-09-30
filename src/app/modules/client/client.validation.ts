import { z } from 'zod';

export const ClientZodValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email format' }),
        address: z.string({ required_error: 'Address is required' }),
        contact: z.string({ required_error: 'Contact is required' }),
        password: z.string({ required_error: 'Password is required' })
    })
});