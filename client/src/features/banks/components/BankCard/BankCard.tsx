import type {
  CSSProperties,
} from 'react'

import {
  ArrowRight,
  Trash2,
  Wifi,
} from 'lucide-react'

import { bankIcons } from '../../data/bank-icons'
import {
  getBankTheme,
} from '../../data/bank-themes'
import type { BankOption } from '../../data/bank'

import styles from './BankCard.module.css'

interface BankCardProps {
  bank: BankOption
  holderName?: string
  onViewDetails: (
    bank: BankOption,
  ) => void
  onRequestRemove: (
    bank: BankOption,
  ) => void
}

interface BankCardCssVariables
  extends CSSProperties {
  '--bank-background': string
  '--bank-foreground': string
  '--bank-muted-foreground': string
  '--bank-accent': string
  '--bank-chip': string
  '--bank-shadow': string
}

export function BankCard({
  bank,
  holderName = 'Finance App',
  onViewDetails,
  onRequestRemove,
}: BankCardProps) {
  const theme =
    getBankTheme(bank.value)

  const BankIcon =
    bankIcons[bank.value]

  const cardStyle:
    BankCardCssVariables = {
      '--bank-background':
        theme.background,
      '--bank-foreground':
        theme.foreground,
      '--bank-muted-foreground':
        theme.mutedForeground,
      '--bank-accent':
        theme.accent,
      '--bank-chip':
        theme.chipBackground,
      '--bank-shadow':
        theme.shadow,
    }

  return (
    <article
      className={styles.wrapper}
    >
      <div
        className={styles.card}
        style={cardStyle}
      >
        <div
          className={styles.glow}
          aria-hidden="true"
        />

        <header
          className={
            styles.cardHeader
          }
        >
          <div
            className={
              styles.brand
            }
          >
            {BankIcon ? (
              <BankIcon
                className={
                  styles.logoIcon
                }
                size={34}
                aria-label={
                  bank.label
                }
              />
            ) : (
              <span
                className={
                  styles.logoFallback
                }
                aria-label={
                  bank.label
                }
              >
                {bank.shortName}
              </span>
            )}
          </div>

          <button
            type="button"
            className={
              styles.removeButton
            }
            onClick={() => {
              onRequestRemove(bank)
            }}
            aria-label={`Remover ${bank.label}`}
            title={`Remover ${bank.label}`}
          >
            <Trash2
              size={18}
              aria-hidden="true"
            />
          </button>
        </header>

        <div
          className={
            styles.cardMiddle
          }
          aria-hidden="true"
        >
          <span
            className={
              styles.chip
            }
          >
            <span />
            <span />
            <span />
            <span />
          </span>

          <Wifi
            size={25}
            className={
              styles.contactless
            }
          />
        </div>

        <footer
          className={
            styles.cardFooter
          }
        >
          <div>
            <span
              className={
                styles.holderLabel
              }
            >
              Instituição
            </span>

            <strong
              className={
                styles.bankName
              }
            >
              {bank.label}
            </strong>
          </div>

          <div
            className={
              styles.holder
            }
          >
            <span>
              Organizado por
            </span>

            <strong>
              {holderName}
            </strong>
          </div>
        </footer>

        <div
          className={
            styles.decorativeCircles
          }
          aria-hidden="true"
        >
          <span />
          <span />
        </div>
      </div>

      <div
        className={
          styles.actions
        }
      >
        <div>
          <span
            className={
              styles.status
            }
          >
            Dados ainda não
            informados
          </span>
        </div>

        <button
          type="button"
          className={
            styles.detailsButton
          }
          onClick={() => {
            onViewDetails(bank)
          }}
          aria-label={`Ver detalhes de ${bank.label}`}
        >
          Ver detalhes

          <ArrowRight
            size={18}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  )
}