import 'dotenv/config'

import { z } from 'zod'

const environmentSchema = z.object({
  NODE_ENV: z.enum([
    'development',
    'test',
    'production',
  ]),

  HOST: z.string().min(1),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .max(65535),

  DB_SERVER: z.string().min(1),

  DB_DATABASE: z.string().min(1),
})

const parsedEnvironment = environmentSchema.safeParse(
  process.env,
)

if (!parsedEnvironment.success) {
  console.error(
    'Invalid environment variables:',
    parsedEnvironment.error.flatten().fieldErrors,
  )

  throw new Error('Invalid environment variables')
}

export const env = parsedEnvironment.data