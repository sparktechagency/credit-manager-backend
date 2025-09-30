import { z } from 'zod';
import { checkValidID } from '../../../shared/checkValidID';

export const TransactionZodValidationSchema = z.object({
    body: z.object({
        amount: z.number({ required_error: 'Amount is required' }),
        client: checkValidID("Client ID is required"),
    })
});