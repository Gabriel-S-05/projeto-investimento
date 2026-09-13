import {
  CalendarDays,
  CircleDollarSign,
  Pencil,
  Plus,
  Repeat2,
  Trash2,
} from 'lucide-react'

import { Button } from '../../../../components/ui/Button/IndexButton'
import {
  incomeFrequencies,
  incomeTypes,
  type IncomeFrequency,
  type IncomeSource,
  type IncomeType,
} from '../../types/income'

import styles from './IncomeSourceList.module.css'

interface IncomeSourcesListProps {
  incomeSources: IncomeSource[]
  onAddIncome: () => void

  onEditIncome?: (
    incomeSource: IncomeSource,
  ) => void

  onRemoveIncome?: (
    incomeSource: IncomeSource,
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

function getIncomeTypeLabel(
  type: IncomeType,
): string {
  return (
    incomeTypes.find(
      (incomeType) =>
        incomeType.value === type,
    )?.label ?? type
  )
}

function getIncomeFrequencyLabel(
  frequency: IncomeFrequency,
): string {
  return (
    incomeFrequencies.find(
      (incomeFrequency) =>
        incomeFrequency.value ===
        frequency,
    )?.label ?? frequency
  )
}

function getPaymentDescription(
  incomeSource: IncomeSource,
): string {
  if (
    incomeSource.frequency ===
      'monthly' &&
    incomeSource.paymentDay
  ) {
    return `Recebimento previsto no dia ${incomeSource.paymentDay}`
  }

  if (
    incomeSource.frequency ===
    'one-time'
  ) {
    return 'Recebimento único'
  }

  if (
    incomeSource.frequency ===
    'variable'
  ) {
    return 'Sem dia definido'
  }

  if (
    incomeSource.frequency ===
    'weekly'
  ) {
    return 'Recebimento semanal'
  }

  if (
    incomeSource.frequency ===
    'biweekly'
  ) {
    return 'Recebimento quinzenal'
  }

  return 'Acompanhamento recorrente'
}

export function IncomeSourcesList({
  incomeSources,
  onAddIncome,
  onEditIncome,
  onRemoveIncome,
}: IncomeSourcesListProps) {
  if (
    incomeSources.length === 0
  ) {
    return null
  }

  const hasItemActions =
    Boolean(onEditIncome) ||
    Boolean(onRemoveIncome)

  return (
    <section
      className={styles.section}
      aria-labelledby="income-sources-title"
    >
      <header
        className={styles.header}
      >
        <div>
          <span
            className={styles.eyebrow}
          >
            Fontes cadastradas
          </span>

          <h3 id="income-sources-title">
            Seus recebimentos
          </h3>

          <p>
            Consulte as entradas vinculadas
            a esta instituição.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onAddIncome}
        >
          <Plus
            size={18}
            aria-hidden="true"
          />

          Adicionar recebimento
        </Button>
      </header>

      <div className={styles.list}>
        {incomeSources.map(
          (incomeSource) => (
            <article
              key={incomeSource.id}
              className={styles.item}
            >
              <div
                className={
                  styles.itemIcon
                }
              >
                <CircleDollarSign
                  size={23}
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
                        incomeSource.description
                      }
                    </h4>

                    <span>
                      {getIncomeTypeLabel(
                        incomeSource.type,
                      )}
                    </span>
                  </div>

                  <div
                    className={
                      styles.itemAside
                    }
                  >
                    <strong
                      className={
                        styles.amount
                      }
                    >
                      {formatCurrency(
                        incomeSource
                          .amountInCents,
                      )}
                    </strong>

                    {hasItemActions ? (
                      <div
                        className={
                          styles.actions
                        }
                        aria-label={`Ações para ${incomeSource.description}`}
                      >
                        {onEditIncome ? (
                          <button
                            type="button"
                            className={
                              styles.editButton
                            }
                            onClick={() => {
                              onEditIncome(
                                incomeSource,
                              )
                            }}
                            aria-label={`Editar ${incomeSource.description}`}
                            title="Editar recebimento"
                          >
                            <Pencil
                              size={17}
                              aria-hidden="true"
                            />

                            <span>
                              Editar
                            </span>
                          </button>
                        ) : null}

                        {onRemoveIncome ? (
                          <button
                            type="button"
                            className={
                              styles.removeButton
                            }
                            onClick={() => {
                              onRemoveIncome(
                                incomeSource,
                              )
                            }}
                            aria-label={`Remover ${incomeSource.description}`}
                            title="Remover recebimento"
                          >
                            <Trash2
                              size={17}
                              aria-hidden="true"
                            />

                            <span>
                              Remover
                            </span>
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  className={
                    styles.metadata
                  }
                >
                  <span>
                    <Repeat2
                      size={16}
                      aria-hidden="true"
                    />

                    {getIncomeFrequencyLabel(
                      incomeSource.frequency,
                    )}
                  </span>

                  <span>
                    <CalendarDays
                      size={16}
                      aria-hidden="true"
                    />

                    {getPaymentDescription(
                      incomeSource,
                    )}
                  </span>

                  {incomeSource
                    .isVariableAmount ? (
                    <span
                      className={
                        styles.variableBadge
                      }
                    >
                      Valor variável
                    </span>
                  ) : (
                    <span
                      className={
                        styles.fixedBadge
                      }
                    >
                      Valor fixo
                    </span>
                  )}
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  )
}
