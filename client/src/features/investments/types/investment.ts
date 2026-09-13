export const investmentCategories = [
  {
    value: 'treasury',
    label: 'Tesouro Direto',
  },
  {
    value: 'cdb',
    label: 'CDB',
  },
  {
    value: 'lci-lca',
    label: 'LCI ou LCA',
  },
  {
    value: 'savings',
    label: 'Poupança',
  },
  {
    value: 'fixed-income',
    label: 'Outra renda fixa',
  },
  {
    value: 'fund',
    label: 'Fundo de investimento',
  },
  {
    value: 'stock',
    label: 'Ação',
  },
  {
    value: 'etf',
    label: 'ETF',
  },
  {
    value: 'real-estate-fund',
    label: 'Fundo imobiliário',
  },
  {
    value: 'pension',
    label: 'Previdência privada',
  },
  {
    value: 'crypto',
    label: 'Criptomoeda',
  },
  {
    value: 'foreign-investment',
    label: 'Investimento internacional',
  },
  {
    value: 'other',
    label: 'Outro investimento',
  },
] as const

export const investmentLiquidities = [
  {
    value: 'immediate',
    label: 'Liquidez imediata',
  },
  {
    value: 'daily',
    label: 'Liquidez diária',
  },
  {
    value: 'at-maturity',
    label: 'Somente no vencimento',
  },
  {
    value: 'variable',
    label: 'Prazo variável',
  },
  {
    value: 'not-informed',
    label: 'Não informado',
  },
] as const

export const investmentStatuses = [
  {
    value: 'active',
    label: 'Ativo',
  },
  {
    value: 'redeemed',
    label: 'Resgatado',
  },
  {
    value: 'matured',
    label: 'Vencido',
  },
  {
    value: 'cancelled',
    label: 'Cancelado',
  },
] as const

export type InvestmentCategory =
  (typeof investmentCategories)[number]['value']

export type InvestmentLiquidity =
  (typeof investmentLiquidities)[number]['value']

export type InvestmentStatus =
  (typeof investmentStatuses)[number]['value']

export interface Investment {
  id: string
  bankId: string

  name: string
  category: InvestmentCategory
  liquidity: InvestmentLiquidity
  status: InvestmentStatus

  investedAmountInCents: number
  currentAmountInCents: number

  applicationDate: string
  referenceDate: string
  maturityDate: string | null

  notes: string | null

  createdAt: string
  updatedAt: string
}

export interface InvestmentFormValues {
  name: string
  category: InvestmentCategory
  liquidity: InvestmentLiquidity

  investedAmountInCents: number
  currentAmountInCents: number

  applicationDate: string
  referenceDate: string
  maturityDate: string | null

  notes: string | null
}