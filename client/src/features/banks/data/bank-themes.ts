export interface BankTheme {
  background: string
  foreground: string
  mutedForeground: string
  accent: string
  chipBackground: string
  shadow: string
}

const defaultTheme: BankTheme = {
  background:
    'linear-gradient(135deg, #176f62 0%, #0b3e39 100%)',
  foreground: '#ffffff',
  mutedForeground: 'rgba(255, 255, 255, 0.72)',
  accent: '#7ce5ca',
  chipBackground: 'rgba(255, 255, 255, 0.18)',
  shadow: 'rgba(10, 63, 56, 0.28)',
}

export const bankThemes: Record<string, BankTheme> = {
  nubank: {
    background:
      'linear-gradient(135deg, #5f0f8b 0%, #9f28c8 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.72)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(95, 15, 139, 0.34)',
  },

  inter: {
    background:
      'linear-gradient(135deg, #ff7a00 0%, #f04b00 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.78)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.22)',
    shadow: 'rgba(240, 75, 0, 0.32)',
  },

  'mercado-pago': {
    background:
      'linear-gradient(135deg, #4ab9f1 0%, #157ebc 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.8)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.22)',
    shadow: 'rgba(21, 126, 188, 0.3)',
  },

  itau: {
    background:
      'linear-gradient(135deg, #ff7a1a 0%, #e94b00 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.78)',
    accent: '#173f82',
    chipBackground: 'rgba(255, 255, 255, 0.22)',
    shadow: 'rgba(233, 75, 0, 0.3)',
  },

  'banco-do-brasil': {
    background:
      'linear-gradient(135deg, #fddd28 0%, #f4bb00 100%)',
    foreground: '#173a78',
    mutedForeground: 'rgba(23, 58, 120, 0.7)',
    accent: '#173a78',
    chipBackground: 'rgba(255, 255, 255, 0.34)',
    shadow: 'rgba(210, 161, 0, 0.28)',
  },

  santander: {
    background:
      'linear-gradient(135deg, #ed1c24 0%, #a80712 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.77)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(168, 7, 18, 0.3)',
  },

  bradesco: {
    background:
      'linear-gradient(135deg, #d7195f 0%, #940735 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.76)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(148, 7, 53, 0.3)',
  },

  caixa: {
    background:
      'linear-gradient(135deg, #1277b4 0%, #07558d 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.76)',
    accent: '#ef9f1a',
    chipBackground: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(7, 85, 141, 0.3)',
  },

  'c6-bank': {
    background:
      'linear-gradient(135deg, #242424 0%, #060606 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.68)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.16)',
    shadow: 'rgba(0, 0, 0, 0.32)',
  },

  picpay: {
    background:
      'linear-gradient(135deg, #20c96b 0%, #087a42 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.77)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(8, 122, 66, 0.3)',
  },

  'btg-pactual': {
    background:
      'linear-gradient(135deg, #163b66 0%, #071c35 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.7)',
    accent: '#87b9e8',
    chipBackground: 'rgba(255, 255, 255, 0.16)',
    shadow: 'rgba(7, 28, 53, 0.32)',
  },

  neon: {
    background:
      'linear-gradient(135deg, #20d8e8 0%, #1384c4 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.78)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(19, 132, 196, 0.3)',
  },

  pagbank: {
    background:
      'linear-gradient(135deg, #86d51c 0%, #3a960a 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.78)',
    accent: '#ffffff',
    chipBackground: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(58, 150, 10, 0.3)',
  },

  xp: {
    background:
      'linear-gradient(135deg, #242424 0%, #080808 100%)',
    foreground: '#ffffff',
    mutedForeground: 'rgba(255, 255, 255, 0.68)',
    accent: '#f3c72b',
    chipBackground: 'rgba(255, 255, 255, 0.15)',
    shadow: 'rgba(0, 0, 0, 0.34)',
  },
}

export function getBankTheme(
  bankId: string,
): BankTheme {
  return bankThemes[bankId] ?? defaultTheme
}