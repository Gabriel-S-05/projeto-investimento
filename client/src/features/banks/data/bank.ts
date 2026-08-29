export interface BankOption {
  value: string
  label: string
  shortName: string
}

export const banks: BankOption[] = [
  {
    value: 'nubank',
    label: 'Nubank',
    shortName: 'nu',
  },
  {
    value: 'inter',
    label: 'Banco Inter',
    shortName: 'inter',
  },
  {
    value: 'mercado-pago',
    label: 'Mercado Pago',
    shortName: 'MP',
  },
  {
    value: 'itau',
    label: 'Itaú Unibanco',
    shortName: 'Itaú',
  },
  {
    value: 'banco-do-brasil',
    label: 'Banco do Brasil',
    shortName: 'BB',
  },
  {
    value: 'santander',
    label: 'Santander',
    shortName: 'Santander',
  },
  {
    value: 'bradesco',
    label: 'Bradesco',
    shortName: 'Bradesco',
  },
  {
    value: 'caixa',
    label: 'Caixa Econômica Federal',
    shortName: 'CAIXA',
  },
  {
    value: 'c6-bank',
    label: 'C6 Bank',
    shortName: 'C6',
  },
  {
    value: 'picpay',
    label: 'PicPay',
    shortName: 'PicPay',
  },
  {
    value: 'btg-pactual',
    label: 'BTG Pactual',
    shortName: 'BTG',
  },
  {
    value: 'sicoob',
    label: 'Sicoob',
    shortName: 'Sicoob',
  },
  {
    value: 'sicredi',
    label: 'Sicredi',
    shortName: 'Sicredi',
  },
  {
    value: 'safra',
    label: 'Banco Safra',
    shortName: 'Safra',
  },
  {
    value: 'banco-pan',
    label: 'Banco Pan',
    shortName: 'PAN',
  },
  {
    value: 'neon',
    label: 'Banco Neon',
    shortName: 'Neon',
  },
  {
    value: 'pagbank',
    label: 'PagBank',
    shortName: 'PagBank',
  },
  {
    value: 'original',
    label: 'Banco Original',
    shortName: 'Original',
  },
  {
    value: 'xp',
    label: 'XP Investimentos',
    shortName: 'XP',
  },
  {
    value: 'outro',
    label: 'Outro banco',
    shortName: 'Banco',
  },
]