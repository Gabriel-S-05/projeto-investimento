export const installmentStatuses = [
  {
    value: 'active',
    label: 'Em andamento',
  },
  {
    value: 'completed',
    label: 'Concluída',
  },
  {
    value: 'cancelled',
    label: 'Cancelada',
  },
] as const

export const installmentCategories = [
  {
    value: 'electronics',
    label: 'Eletrônicos',
  },
  {
    value: 'home',
    label: 'Casa',
  },
  {
    value: 'education',
    label: 'Educação',
  },
  {
    value: 'health',
    label: 'Saúde',
  },
  {
    value: 'transport',
    label: 'Transporte',
  },
  {
    value: 'travel',
    label: 'Viagem',
  },
  {
    value: 'clothing',
    label: 'Vestuário',
  },
  {
    value: 'services',
    label: 'Serviços',
  },
  {
    value: 'subscriptions',
    label: 'Assinaturas',
  },
  {
    value: 'other',
    label: 'Outros',
  },
] as const

export type InstallmentStatus =
  (typeof installmentStatuses)[number]['value']

export type InstallmentCategory =
  (typeof installmentCategories)[number]['value']

export interface InstallmentPurchase {
  id: string
  bankId: string
  cardId: string

  description: string
  category: InstallmentCategory
  status: InstallmentStatus

  totalAmountInCents: number
  installmentAmountInCents: number

  totalInstallments: number
  currentInstallment: number

  purchaseDate: string
  nextDueDate: string | null

  createdAt: string
  updatedAt: string
}

export interface InstallmentFormValues {
  cardId: string

  description: string
  category: InstallmentCategory

  totalAmountInCents: number
  totalInstallments: number
  currentInstallment: number

  purchaseDate: string
  nextDueDate: string | null
}