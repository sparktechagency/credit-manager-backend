import { z } from 'zod';

export const ClientZodValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        username: z.string({ required_error: 'Username is required' }),
        password: z.string({ required_error: 'Password is required' })
    })
});