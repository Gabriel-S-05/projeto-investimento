import { z } from 'zod'

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  HOST: z.string().default('127.0.0.1'),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .max(65535)
    .default(3333),
})

const parsedEnvironment = environmentSchema.safeParse(process.env)

if (!parsedEnvironment.success) {
  console.error(
    'Invalid environment variables:',
    parsedEnvironment.error.flatten().fieldErrors,
  )

  throw new Error('Invalid environment variables')
}

export const env = parsedEnvironment.data
