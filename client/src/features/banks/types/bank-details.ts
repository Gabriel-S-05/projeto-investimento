export const accountTypes = [
  {
    value: 'checking',
    label: 'Conta corrente',
  },
  {
    value: 'savings',
    label: 'Conta poupança',
  },
  {
    value: 'payment',
    label: 'Conta de pagamento',
  },
  {
    value: 'investment',
    label: 'Conta de investimentos',
  },
  {
    value: 'salary',
    label: 'Conta salário',
  },
  {
    value: 'other',
    label: 'Outro tipo',
  },
] as const

export type AccountType =
  (typeof accountTypes)[number]['value']

export interface BankAccountDetails {
  bankId: string
  accountType: AccountType
  nickname: string
  currentBalanceInCents: number
  referenceDate: string
  updatedAt: string
}