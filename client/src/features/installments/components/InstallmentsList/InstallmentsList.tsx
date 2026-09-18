import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleX,
  CreditCard as CreditCardIcon,
  Plus,
  ReceiptText,
  Timer,
} from 'lucide-react'

import { Button } from '../../../../components/ui/Button/IndexButton'
import type { CreditCard } from '../../../cards/types/credit-card'
import {
  installmentCategories,
  installmentStatuses,
  type InstallmentCategory,
  type InstallmentPurchase,
  type InstallmentStatus,
} from '../../types/installment'

import styles from './InstallmentsList.module.css'

interface InstallmentsListProps {
  installments:
    InstallmentPurchase[]

  creditCards:
    CreditCard[]

  onAddInstallment:
    () => void

  onAdvanceInstallment?: (
    installment: InstallmentPurchase,
  ) => void
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

function formatDate(
  date: string | null,
): string {
  if (!date) {
    return 'Não informado'
  }

  const [
    year,
    month,
    day,
  ] = date.split('-')

  if (
    !year ||
    !month ||
    !day
  ) {
    return date
  }

  return `${day}/${month}/${year}`
}

function getCategoryLabel(
  category:
    InstallmentCategory,
): string {
  return (
    installmentCategories.find(
      (item) =>
        item.value === category,
    )?.label ?? category
  )
}

function getStatusLabel(
  status:
    InstallmentStatus,
): string {
  return (
    installmentStatuses.find(
      (item) =>
        item.value === status,
    )?.label ?? status
  )
}

function getCreditCardName(
  cardId: string,
  creditCards: CreditCard[],
): string {
  return (
    creditCards.find(
      (creditCard) =>
        creditCard.id === cardId,
    )?.nickname ??
    'Cartão não encontrado'
  )
}

function getRemainingInstallments(
  installment:
    InstallmentPurchase,
): number {
  if (
    installment.status !==
    'active'
  ) {
    return 0
  }

  return Math.max(
    installment.totalInstallments -
      installment.currentInstallment,
    0,
  )
}

function getProgressPercentage(
  installment:
    InstallmentPurchase,
): number {
  if (
    installment.totalInstallments <=
    0
  ) {
    return 0
  }

  return Math.min(
    100,
    Math.max(
      0,
      (
        installment.currentInstallment /
        installment.totalInstallments
      ) * 100,
    ),
  )
}

function getStatusIcon(
  status: InstallmentStatus,
) {
  if (status === 'completed') {
    return (
      <CheckCircle2
        size={16}
        aria-hidden="true"
      />
    )
  }

  if (status === 'cancelled') {
    return (
      <CircleX
        size={16}
        aria-hidden="true"
      />
    )
  }

  return (
    <Timer
      size={16}
      aria-hidden="true"
    />
  )
}

export function InstallmentsList({
  installments,
  creditCards,
  onAddInstallment,
  onAdvanceInstallment,
}: InstallmentsListProps) {
  if (
    installments.length === 0
  ) {
    return null
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="installments-list-title"
    >
      <header
        className={styles.header}
      >
        <div>
          <span
            className={styles.eyebrow}
          >
            Compras cadastradas
          </span>

          <h3 id="installments-list-title">
            Suas compras parceladas
          </h3>

          <p>
            Consulte as compras, os
            cartões vinculados e o
            progresso dos parcelamentos.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={
            onAddInstallment
          }
        >
          <Plus
            size={18}
            aria-hidden="true"
          />

          Adicionar parcela
        </Button>
      </header>

      <div className={styles.list}>
        {installments.map(
          (installment) => {
            const remainingInstallments =
              getRemainingInstallments(
                installment,
              )

            const progressPercentage =
              getProgressPercentage(
                installment,
              )

            return (
              <article
                key={installment.id}
                className={styles.item}
              >
                <div
                  className={
                    styles.itemIcon
                  }
                >
                  <ReceiptText
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
                          installment.description
                        }
                      </h4>

                      <span>
                        {getCategoryLabel(
                          installment.category,
                        )}
                      </span>
                    </div>

                    <div
                      className={
                        styles.itemAside
                      }
                    >
                      <span
                        className={[
                          styles.statusBadge,
                          installment.status ===
                          'active'
                            ? styles.activeBadge
                            : '',
                          installment.status ===
                          'completed'
                            ? styles.completedBadge
                            : '',
                          installment.status ===
                          'cancelled'
                            ? styles.cancelledBadge
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {getStatusIcon(
                          installment.status,
                        )}

                        {getStatusLabel(
                          installment.status,
                        )}
                      </span>

                      {installment.status ===
                        'active' &&
                      installment.currentInstallment <
                        installment.totalInstallments &&
                      onAdvanceInstallment ? (
                        <button
                          type="button"
                          className={
                            styles.advanceButton
                          }
                          onClick={() => {
                            onAdvanceInstallment(
                              installment,
                            )
                          }}
                          aria-label={`Avançar a compra ${installment.description} para a parcela ${
                            installment.currentInstallment +
                            1
                          } de ${
                            installment.totalInstallments
                          }`}
                          title="Avançar parcela"
                        >
                          <span>
                            Avançar parcela
                          </span>

                          <ChevronRight
                            size={17}
                            aria-hidden="true"
                          />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className={
                      styles.cardReference
                    }
                  >
                    <CreditCardIcon
                      size={18}
                      aria-hidden="true"
                    />

                    <div>
                      <span>
                        Cartão utilizado
                      </span>

                      <strong>
                        {getCreditCardName(
                          installment.cardId,
                          creditCards,
                        )}
                      </strong>
                    </div>
                  </div>

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
                        Valor total
                      </span>

                      <strong>
                        {formatCurrency(
                          installment
                            .totalAmountInCents,
                        )}
                      </strong>
                    </div>

                    <div
                      className={
                        styles.financialItem
                      }
                    >
                      <span>
                        Valor da parcela
                      </span>

                      <strong>
                        {formatCurrency(
                          installment
                            .installmentAmountInCents,
                        )}
                      </strong>
                    </div>

                    <div
                      className={
                        styles.financialItem
                      }
                    >
                      <span>
                        Parcela atual
                      </span>

                      <strong>
                        {
                          installment.currentInstallment
                        }{' '}
                        de{' '}
                        {
                          installment.totalInstallments
                        }
                      </strong>
                    </div>

                    <div
                      className={
                        styles.financialItem
                      }
                    >
                      <span>
                        Restantes
                      </span>

                      <strong>
                        {remainingInstallments}{' '}
                        {remainingInstallments ===
                        1
                          ? 'parcela'
                          : 'parcelas'}
                      </strong>
                    </div>
                  </div>

                  <div
                    className={
                      styles.progressSection
                    }
                  >
                    <div
                      className={
                        styles.progressHeader
                      }
                    >
                      <span>
                        Progresso do parcelamento
                      </span>

                      <strong>
                        {Math.round(
                          progressPercentage,
                        )}
                        %
                      </strong>
                    </div>

                    <div
                      className={
                        styles.progressTrack
                      }
                      role="progressbar"
                      aria-label={`Progresso de ${installment.description}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(
                        progressPercentage,
                      )}
                    >
                      <div
                        className={
                          styles.progressBar
                        }
                        style={{
                          width: `${progressPercentage}%`,
                        }}
                      />
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

                      Compra em{' '}
                      {formatDate(
                        installment.purchaseDate,
                      )}
                    </span>

                    <span>
                      <CalendarDays
                        size={16}
                        aria-hidden="true"
                      />

                      {installment.nextDueDate
                        ? `Próximo vencimento em ${formatDate(
                            installment
                              .nextDueDate,
                          )}`
                        : 'Sem próximo vencimento'}
                    </span>
                  </div>
                </div>
              </article>
            )
          },
        )}
      </div>
    </section>
  )
}