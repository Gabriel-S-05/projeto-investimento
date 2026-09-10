export const creditCardTypes = [
  {
    value: 'credit',
    label: 'Crédito',
  },
  {
    value: 'debit',
    label: 'Débito',
  },
  {
    value: 'multiple',
    label: 'Crédito e débito',
  },
] as const

export const creditCardCategories = [
  {
    value: 'standard',
    label: 'Padrão',
  },
  {
    value: 'gold',
    label: 'Gold',
  },
  {
    value: 'platinum',
    label: 'Platinum',
  },
  {
    value: 'black',
    label: 'Black',
  },
  {
    value: 'infinite',
    label: 'Infinite',
  },
  {
    value: 'nanquim',
    label: 'Nanquim',
  },
  {
    value: 'other',
    label: 'Outra categoria',
  },
] as const

export const creditCardKinds = [
  {
    value: 'physical',
    label: 'Cartão físico',
  },
  {
    value: 'virtual',
    label: 'Cartão virtual',
  },
  {
    value: 'additional',
    label: 'Cartão adicional',
  },
] as const

export type CreditCardType =
  (typeof creditCardTypes)[number]['value']

export type CreditCardCategory =
  (typeof creditCardCategories)[number]['value']

export type CreditCardKind =
  (typeof creditCardKinds)[number]['value']

export interface CreditCard {
  id: string
  bankId: string
  nickname: string
  type: CreditCardType
  category: CreditCardCategory
  kind: CreditCardKind

  totalLimitInCents: number | null
  usedLimitInCents: number | null
  currentInvoiceInCents: number | null

  closingDay: number | null
  dueDay: number | null

  createdAt: string
  updatedAt: string
}

export interface CreditCardFormValues {
  nickname: string
  type: CreditCardType
  category: CreditCardCategory
  kind: CreditCardKind

  totalLimitInCents: number | null
  usedLimitInCents: number | null
  currentInvoiceInCents: number | null

  closingDay: number | null
  dueDay: number | null
}