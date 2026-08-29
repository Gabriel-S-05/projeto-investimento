import type { IconType } from 'react-icons'
import {
  SiMercadopago,
  SiNubank,
  SiPicpay,
} from 'react-icons/si'

export const bankIcons: Partial<
  Record<string, IconType>
> = {
  nubank: SiNubank,
  'mercado-pago': SiMercadopago,
  picpay: SiPicpay,
}