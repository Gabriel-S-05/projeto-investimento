export const routePaths = {
  home: '/',
  login: '/login',
  register: '/cadastro',
  dashboard: '/dashboard',
  banks: '/bancos',
  bankDetails: '/bancos/:bankId',
} as const

export function getBankDetailsPath(
  bankId: string,
): string {
  return `/bancos/${bankId}`
}