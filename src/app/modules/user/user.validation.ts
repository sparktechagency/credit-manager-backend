import { z } from 'zod';

export const createUserZodValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email format' }),
        password: z.string({ required_error: 'Password is required' }),
        role: z.string({ required_error: 'Role is required' })
    })
});