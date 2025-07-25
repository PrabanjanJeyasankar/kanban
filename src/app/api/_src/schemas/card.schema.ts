import { z } from 'zod'

export const createCardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  position: z.number().min(1, 'Position must be greater than zero'),
  status: z.enum(['to-do', 'in-progress', 'completed']).optional(),
})

export type CreateCardInput = z.infer<typeof createCardSchema>

export const updateCardSchema = createCardSchema.partial().refine(
  (data) => {
    return Object.keys(data).length > 0
  },
  {
    message: 'At least one field must be provided for update',
  }
)
