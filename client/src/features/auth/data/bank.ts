export const banks = [
  'Nubank',
  'Banco Inter',
  'Mercado Pago',
  'Itaú Unibanco',
  'Banco do Brasil',
  'Santander',
  'Bradesco',
  'Caixa Econômica Federal',
  'C6 Bank',
  'PicPay',
  'BTG Pactual',
  'Sicoob',
  'Sicredi',
  'Safra',
  'Banco Pan',
  'Outro banco',
] as const

export type BankName = (typeof banks)[number]