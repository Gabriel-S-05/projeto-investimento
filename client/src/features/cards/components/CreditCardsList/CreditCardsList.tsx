import {
  CalendarDays,
  CreditCard as CreditCardIcon,
  Gauge,
  Plus,
  ReceiptText,
  WalletCards,
} from 'lucide-react'

import { Button } from '../../../../components/ui/Button/IndexButton'
import {
  creditCardCategories,
  creditCardKinds,
  creditCardTypes,
  type CreditCard,
  type CreditCardCategory,
  type CreditCardKind,
  type CreditCardType,
} from '../../types/credit-card'

import styles from './CreditCardsList.module.css'

interface CreditCardsListProps {
  creditCards: CreditCard[]
  onAddCreditCard: () => void
}

function formatCurrency(
  valueInCents: number,
): string {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(
    valueInCents / 100,
  )
}

function getCreditCardTypeLabel(
  type: CreditCardType,
): string {
  return (
    creditCardTypes.find(
      (cardType) =>
        cardType.value === type,
    )?.label ?? type
  )
}

function getCreditCardCategoryLabel(
  category: CreditCardCategory,
): string {
  return (
    creditCardCategories.find(
      (cardCategory) =>
        cardCategory.value ===
        category,
    )?.label ?? category
  )
}

function getCreditCardKindLabel(
  kind: CreditCardKind,
): string {
  return (
    creditCardKinds.find(
      (cardKind) =>
        cardKind.value === kind,
    )?.label ?? kind
  )
}

function getAvailableLimitInCents(
  creditCard: CreditCard,
): number | null {
  if (
    creditCard.totalLimitInCents ===
    null
  ) {
    return null
  }

  const usedLimitInCents =
    creditCard.usedLimitInCents ??
    0

  return Math.max(
    creditCard.totalLimitInCents -
      usedLimitInCents,
    0,
  )
}

export function CreditCardsList({
  creditCards,
  onAddCreditCard,
}: CreditCardsListProps) {
  if (
    creditCards.length === 0
  ) {
    return null
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="credit-cards-list-title"
    >
      <header
        className={styles.header}
      >
        <div>
          <span
            className={styles.eyebrow}
          >
            Cartões cadastrados
          </span>

          <h3 id="credit-cards-list-title">
            Seus cartões
          </h3>

          <p>
            Consulte os cartões vinculados
            a esta instituição.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={
            onAddCreditCard
          }
        >
          <Plus
            size={18}
            aria-hidden="true"
          />

          Adicionar cartão
        </Button>
      </header>

      <div className={styles.list}>
        {creditCards.map(
          (creditCard) => {
            const hasCreditFunction =
              creditCard.type ===
                'credit' ||
              creditCard.type ===
                'multiple'

            const availableLimitInCents =
              getAvailableLimitInCents(
                creditCard,
              )

            return (
              <article
                key={creditCard.id}
                className={styles.item}
              >
                <div
                  className={
                    styles.itemIcon
                  }
                >
                  <CreditCardIcon
                    size={24}
                    aria-hidden="true"
                  />
                </div>

                <div
                  className={
                    styles.itemContent
                  }
                >
                  <div
                    className={
                      styles.itemHeading
                    }
                  >
                    <div
                      className={
                        styles.itemTitle
                      }
                    >
                      <h4>
                        {
                          creditCard.nickname
                        }
                      </h4>

                      <span>
                        {getCreditCardTypeLabel(
                          creditCard.type,
                        )}

                        {' • '}

                        {getCreditCardCategoryLabel(
                          creditCard.category,
                        )}

                        {' • '}

                        {getCreditCardKindLabel(
                          creditCard.kind,
                        )}
                      </span>
                    </div>

                    <span
                      className={
                        hasCreditFunction
                          ? styles.creditBadge
                          : styles.debitBadge
                      }
                    >
                      {hasCreditFunction
                        ? 'Função crédito'
                        : 'Somente débito'}
                    </span>
                  </div>

                  {hasCreditFunction ? (
                    <>
                      <div
                        className={
                          styles.financialGrid
                        }
                      >
                        <div
                          className={
                            styles.financialItem
                          }
                        >
                          <span>
                            Limite total
                          </span>

                          <strong>
                            {creditCard
                              .totalLimitInCents !==
                            null
                              ? formatCurrency(
                                  creditCard
                                    .totalLimitInCents,
                                )
                              : 'Não informado'}
                          </strong>
                        </div>

                        <div
                          className={
                            styles.financialItem
                          }
                        >
                          <span>
                            Limite utilizado
                          </span>

                          <strong>
                            {creditCard
                              .usedLimitInCents !==
                            null
                              ? formatCurrency(
                                  creditCard
                                    .usedLimitInCents,
                                )
                              : 'Não informado'}
                          </strong>
                        </div>

                        <div
                          className={
                            styles.financialItem
                          }
                        >
                          <span>
                            Limite disponível
                          </span>

                          <strong>
                            {availableLimitInCents !==
                            null
                              ? formatCurrency(
                                  availableLimitInCents,
                                )
                              : 'Não informado'}
                          </strong>
                        </div>

                        <div
                          className={
                            styles.financialItem
                          }
                        >
                          <span>
                            Fatura atual
                          </span>

                          <strong>
                            {creditCard
                              .currentInvoiceInCents !==
                            null
                              ? formatCurrency(
                                  creditCard
                                    .currentInvoiceInCents,
                                )
                              : 'Não informado'}
                          </strong>
                        </div>
                      </div>

                      <div
                        className={
                          styles.metadata
                        }
                      >
                        <span>
                          <CalendarDays
                            size={16}
                            aria-hidden="true"
                          />

                          {creditCard.closingDay !==
                          null
                            ? `Fechamento no dia ${creditCard.closingDay}`
                            : 'Fechamento não informado'}
                        </span>

                        <span>
                          <ReceiptText
                            size={16}
                            aria-hidden="true"
                          />

                          {creditCard.dueDay !==
                          null
                            ? `Vencimento no dia ${creditCard.dueDay}`
                            : 'Vencimento não informado'}
                        </span>

                        {availableLimitInCents !==
                        null ? (
                          <span>
                            <Gauge
                              size={16}
                              aria-hidden="true"
                            />

                            Disponível:{' '}
                            {formatCurrency(
                              availableLimitInCents,
                            )}
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <div
                      className={
                        styles.debitNotice
                      }
                    >
                      <WalletCards
                        size={18}
                        aria-hidden="true"
                      />

                      <span>
                        Este cartão não possui
                        limite ou fatura de
                        crédito.
                      </span>
                    </div>
                  )}
                </div>
              </article>
            )
          },
        )}
      </div>
    </section>
  )
}