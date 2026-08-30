export const incomeTypes = [
  {
    value: 'salary',
    label: 'Salário',
  },
  {
    value: 'freelance',
    label: 'Freelance',
  },
  {
    value: 'business',
    label: 'Pró-labore ou empresa',
  },
  {
    value: 'benefit',
    label: 'Benefício',
  },
  {
    value: 'retirement',
    label: 'Aposentadoria',
  },
  {
    value: 'allowance',
    label: 'Bolsa ou auxílio',
  },
  {
    value: 'rent',
    label: 'Aluguel recebido',
  },
  {
    value: 'other',
    label: 'Outra renda',
  },
] as const

export const incomeFrequencies = [
  {
    value: 'monthly',
    label: 'Mensal',
  },
  {
    value: 'weekly',
    label: 'Semanal',
  },
  {
    value: 'biweekly',
    label: 'Quinzenal',
  },
  {
    value: 'variable',
    label: 'Sem frequência definida',
  },
  {
    value: 'one-time',
    label: 'Recebimento único',
  },
] as const

export type IncomeType =
  (typeof incomeTypes)[number]['value']

export type IncomeFrequency =
  (typeof incomeFrequencies)[number]['value']

export interface IncomeSource {
  id: string
  bankId: string
  description: string
  type: IncomeType
  amountInCents: number
  frequency: IncomeFrequency
  paymentDay: number | null
  isVariableAmount: boolean
  createdAt: string
  updatedAt: string
}

export interface IncomeFormValues {
  description: string
  type: IncomeType
  amountInCents: number
  frequency: IncomeFrequency
  paymentDay: number | null
  isVariableAmount: boolean
}