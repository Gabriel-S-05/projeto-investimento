import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  ChartLine,
  Save,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  useEffect,
  useId,
  type MouseEvent,
} from 'react'
import {
  Controller,
  useForm,
} from 'react-hook-form'
import Select, {
  type StylesConfig,
} from 'react-select'
import { z } from 'zod'

import { Button } from '../../../../components/ui/Button/IndexButton'
import { TextField } from '../../../../components/ui/TextField/IndexTextField'
import type { BankOption } from '../../../banks/data/bank'
import {
  investmentCategories,
  investmentLiquidities,
  type InvestmentCategory,
  type InvestmentFormValues,
  type InvestmentLiquidity,
} from '../../types/investment'

import styles from '../InvestmentForm/InvestForm.module.css'

interface SelectOption<
  TValue extends string,
> {
  value: TValue
  label: string
}

interface InvestmentFormProps {
  isOpen: boolean
  bank: BankOption
  onClose: () => void
  onSave: (
    values: InvestmentFormValues,
  ) => void
}

function getCurrentDate(): string {
  const currentDate = new Date()

  const timezoneOffset =
    currentDate.getTimezoneOffset() *
    60_000

  return new Date(
    currentDate.getTime() -
      timezoneOffset,
  )
    .toISOString()
    .slice(0, 10)
}

function parseCurrencyToCents(
  value: string,
): number | null {
  const digits =
    value.replace(/\D/g, '')

  if (!digits) {
    return null
  }

  const valueInCents =
    Number(digits)

  if (
    !Number.isFinite(
      valueInCents,
    )
  ) {
    return null
  }

  return Math.round(
    valueInCents,
  )
}

function formatCurrencyInput(
  value: string,
): string {
  const digits =
    value.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(
    Number(digits) / 100,
  )
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

function formatPercentage(
  value: number,
): string {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value)
}

const investmentSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        'Informe um nome com pelo menos 2 caracteres.',
      )
      .max(
        60,
        'Utilize no máximo 60 caracteres.',
      ),

    category: z
      .string()
      .min(
        1,
        'Selecione a categoria do investimento.',
      ),

    liquidity: z
      .string()
      .min(
        1,
        'Selecione a liquidez do investimento.',
      ),

    investedAmount: z
      .string()
      .trim()
      .min(
        1,
        'Informe o valor investido.',
      )
      .refine(
        (value) => {
          const valueInCents =
            parseCurrencyToCents(
              value,
            )

          return (
            valueInCents !== null &&
            valueInCents > 0
          )
        },
        'Informe um valor investido maior que zero.',
      ),

    currentAmount: z
      .string()
      .trim()
      .min(
        1,
        'Informe o valor atual.',
      )
      .refine(
        (value) => {
          const valueInCents =
            parseCurrencyToCents(
              value,
            )

          return (
            valueInCents !== null &&
            valueInCents >= 0
          )
        },
        'Informe um valor atual válido.',
      ),

    applicationDate: z
      .string()
      .min(
        1,
        'Informe a data da aplicação.',
      ),

    referenceDate: z
      .string()
      .min(
        1,
        'Informe a data de referência.',
      ),

    maturityDate: z.string(),

    notes: z
      .string()
      .max(
        200,
        'Utilize no máximo 200 caracteres.',
      ),
  })
  .superRefine(
    (
      data,
      context,
    ) => {
      if (
        data.applicationDate &&
        data.referenceDate &&
        data.referenceDate <
          data.applicationDate
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            'referenceDate',
          ],
          message:
            'A data de referência não pode ser anterior à aplicação.',
        })
      }

      if (
        data.applicationDate &&
        data.maturityDate &&
        data.maturityDate <
          data.applicationDate
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            'maturityDate',
          ],
          message:
            'O vencimento não pode ser anterior à aplicação.',
        })
      }
    },
  )

type InvestmentFormData = z.infer<
  typeof investmentSchema
>

const categoryOptions:
  SelectOption<InvestmentCategory>[] =
  investmentCategories.map(
    (category) => ({
      value: category.value,
      label: category.label,
    }),
  )

const liquidityOptions:
  SelectOption<InvestmentLiquidity>[] =
  investmentLiquidities.map(
    (liquidity) => ({
      value: liquidity.value,
      label: liquidity.label,
    }),
  )

function createSelectStyles<
  TValue extends string,
>(): StylesConfig<
  SelectOption<TValue>,
  false
> {
  return {
    control: (
      baseStyles,
      state,
    ) => ({
      ...baseStyles,
      minHeight: 48,
      padding: '0 4px',
      backgroundColor:
        'var(--color-surface)',
      borderColor: state.isFocused
        ? 'var(--color-primary-500)'
        : 'var(--color-border)',
      borderRadius:
        'var(--radius-md)',
      boxShadow: state.isFocused
        ? '0 0 0 4px var(--color-primary-100)'
        : 'none',
      cursor: 'pointer',
      transition:
        'border-color var(--transition-fast), box-shadow var(--transition-fast)',

      '&:hover': {
        borderColor: state.isFocused
          ? 'var(--color-primary-500)'
          : 'var(--color-border-strong)',
      },
    }),

    valueContainer: (
      baseStyles,
    ) => ({
      ...baseStyles,
      padding: '0 10px',
    }),

    indicatorSeparator: () => ({
      display: 'none',
    }),

    placeholder: (
      baseStyles,
    ) => ({
      ...baseStyles,
      color:
        'var(--color-text-muted)',
    }),

    singleValue: (
      baseStyles,
    ) => ({
      ...baseStyles,
      color:
        'var(--color-text)',
    }),

    input: (
      baseStyles,
    ) => ({
      ...baseStyles,
      color:
        'var(--color-text)',
    }),

    dropdownIndicator: (
      baseStyles,
      state,
    ) => ({
      ...baseStyles,
      color: state.isFocused
        ? 'var(--color-primary-600)'
        : 'var(--color-text-muted)',
      transition:
        'color var(--transition-fast), transform var(--transition-fast)',
      transform:
        state.selectProps.menuIsOpen
          ? 'rotate(180deg)'
          : 'rotate(0deg)',

      '&:hover': {
        color:
          'var(--color-primary-700)',
      },
    }),

    menu: (
      baseStyles,
    ) => ({
      ...baseStyles,
      zIndex: 1500,
      overflow: 'hidden',
      marginTop: 8,
      backgroundColor:
        'var(--color-surface)',
      border:
        '1px solid var(--color-border)',
      borderRadius:
        'var(--radius-md)',
      boxShadow:
        '0 20px 48px rgba(19, 51, 59, 0.18)',
    }),

    menuList: (
      baseStyles,
    ) => ({
      ...baseStyles,
      maxHeight: 220,
      padding: 6,
    }),

    option: (
      baseStyles,
      {
        isFocused,
        isSelected,
      },
    ) => ({
      ...baseStyles,
      padding: '11px 12px',
      color: isSelected
        ? 'var(--color-text-on-primary)'
        : 'var(--color-text)',
      backgroundColor: isSelected
        ? 'var(--color-primary-600)'
        : isFocused
          ? 'var(--color-primary-50)'
          : 'transparent',
      borderRadius:
        'var(--radius-sm)',
      cursor: 'pointer',

      '&:active': {
        backgroundColor: isSelected
          ? 'var(--color-primary-700)'
          : 'var(--color-primary-100)',
      },
    }),

    noOptionsMessage: (
      baseStyles,
    ) => ({
      ...baseStyles,
      color:
        'var(--color-text-secondary)',
      fontSize: '0.88rem',
    }),
  }
}

const categorySelectStyles =
  createSelectStyles<InvestmentCategory>()

const liquiditySelectStyles =
  createSelectStyles<InvestmentLiquidity>()

export function InvestmentForm({
  isOpen,
  bank,
  onClose,
  onSave,
}: InvestmentFormProps) {
  const titleId = useId()
  const descriptionId = useId()

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<InvestmentFormData>({
    resolver:
      zodResolver(
        investmentSchema,
      ),

    defaultValues: {
      name: '',
      category: 'other',
      liquidity: 'not-informed',
      investedAmount: '',
      currentAmount: '',
      applicationDate:
        getCurrentDate(),
      referenceDate:
        getCurrentDate(),
      maturityDate: '',
      notes: '',
    },

    mode: 'onTouched',
  })

  const investedAmount =
    watch('investedAmount')

  const currentAmount =
    watch('currentAmount')

  const investedAmountInCents =
    parseCurrencyToCents(
      investedAmount,
    )

  const currentAmountInCents =
    parseCurrencyToCents(
      currentAmount,
    )

  const canShowPreview =
    investedAmountInCents !== null &&
    investedAmountInCents > 0 &&
    currentAmountInCents !== null

  const resultInCents =
    canShowPreview
      ? currentAmountInCents -
        investedAmountInCents
      : 0

  const returnPercentage =
    canShowPreview
      ? (
          resultInCents /
          investedAmountInCents
        ) * 100
      : 0

  const hasPositiveResult =
    resultInCents >= 0

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (
        event.key === 'Escape'
      ) {
        onClose()
      }
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    isOpen,
    onClose,
  ])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    reset({
      name: '',
      category: 'other',
      liquidity: 'not-informed',
      investedAmount: '',
      currentAmount: '',
      applicationDate:
        getCurrentDate(),
      referenceDate:
        getCurrentDate(),
      maturityDate: '',
      notes: '',
    })
  }, [
    isOpen,
    reset,
  ])

  if (!isOpen) {
    return null
  }

  function handleOverlayClick(
    event:
      MouseEvent<HTMLDivElement>,
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose()
    }
  }

  async function handleSave(
    data: InvestmentFormData,
  ): Promise<void> {
    const normalizedInvestedAmount =
      parseCurrencyToCents(
        data.investedAmount,
      )

    const normalizedCurrentAmount =
      parseCurrencyToCents(
        data.currentAmount,
      )

    if (
      normalizedInvestedAmount ===
        null ||
      normalizedInvestedAmount <= 0 ||
      normalizedCurrentAmount ===
        null
    ) {
      return
    }

    const normalizedNotes =
      data.notes.trim()

    onSave({
      name:
        data.name.trim(),

      category:
        data.category as
          InvestmentCategory,

      liquidity:
        data.liquidity as
          InvestmentLiquidity,

      investedAmountInCents:
        normalizedInvestedAmount,

      currentAmountInCents:
        normalizedCurrentAmount,

      applicationDate:
        data.applicationDate,

      referenceDate:
        data.referenceDate,

      maturityDate:
        data.maturityDate ||
        null,

      notes:
        normalizedNotes ||
        null,
    })

    onClose()
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={
        handleOverlayClick
      }
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          descriptionId
        }
      >
        <header
          className={styles.header}
        >
          <div
            className={
              styles.headerContent
            }
          >
            <div
              className={
                styles.headerIcon
              }
            >
              <ChartLine
                size={24}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 id={titleId}>
                Adicionar investimento
              </h2>

              <p id={descriptionId}>
                Registre manualmente um
                investimento mantido no{' '}
                <strong>
                  {bank.label}
                </strong>
                .
              </p>
            </div>
          </div>

          <button
            type="button"
            className={
              styles.closeButton
            }
            onClick={onClose}
            aria-label="Fechar modal"
            title="Fechar"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </header>

        <form
          onSubmit={
            handleSubmit(
              handleSave,
            )
          }
          noValidate
        >
          <div
            className={
              styles.content
            }
          >
            <TextField
              label="Nome do investimento"
              placeholder="Exemplo: CDB Reserva"
              maxLength={60}
              autoComplete="off"
              error={
                errors.name?.message
              }
              {...register('name')}
            />

            <div
              className={
                styles.twoColumns
              }
            >
              <div
                className={
                  styles.field
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="investment-category"
                >
                  Categoria
                </label>

                <Controller
                  name="category"
                  control={control}
                  render={({
                    field,
                    fieldState,
                  }) => {
                    const selectedOption =
                      categoryOptions.find(
                        (option) =>
                          option.value ===
                          field.value,
                      ) ?? null

                    return (
                      <Select<
                        SelectOption<InvestmentCategory>,
                        false
                      >
                        inputId="investment-category"
                        instanceId="investment-category-select"
                        name={field.name}
                        options={
                          categoryOptions
                        }
                        value={
                          selectedOption
                        }
                        onChange={(
                          option,
                        ) => {
                          field.onChange(
                            option?.value ??
                              '',
                          )
                        }}
                        onBlur={
                          field.onBlur
                        }
                        placeholder="Selecione"
                        noOptionsMessage={() =>
                          'Nenhuma categoria encontrada'
                        }
                        styles={
                          categorySelectStyles
                        }
                        isSearchable
                        aria-invalid={
                          fieldState.invalid
                        }
                        aria-describedby={
                          fieldState.error
                            ? 'investment-category-error'
                            : undefined
                        }
                      />
                    )
                  }}
                />

                {errors.category ? (
                  <span
                    id="investment-category-error"
                    className={
                      styles.error
                    }
                    role="alert"
                  >
                    {
                      errors.category
                        .message
                    }
                  </span>
                ) : null}
              </div>

              <div
                className={
                  styles.field
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="investment-liquidity"
                >
                  Liquidez
                </label>

                <Controller
                  name="liquidity"
                  control={control}
                  render={({
                    field,
                    fieldState,
                  }) => {
                    const selectedOption =
                      liquidityOptions.find(
                        (option) =>
                          option.value ===
                          field.value,
                      ) ?? null

                    return (
                      <Select<
                        SelectOption<InvestmentLiquidity>,
                        false
                      >
                        inputId="investment-liquidity"
                        instanceId="investment-liquidity-select"
                        name={field.name}
                        options={
                          liquidityOptions
                        }
                        value={
                          selectedOption
                        }
                        onChange={(
                          option,
                        ) => {
                          field.onChange(
                            option?.value ??
                              '',
                          )
                        }}
                        onBlur={
                          field.onBlur
                        }
                        placeholder="Selecione"
                        noOptionsMessage={() =>
                          'Nenhuma opção encontrada'
                        }
                        styles={
                          liquiditySelectStyles
                        }
                        isSearchable
                        aria-invalid={
                          fieldState.invalid
                        }
                        aria-describedby={
                          fieldState.error
                            ? 'investment-liquidity-error'
                            : undefined
                        }
                      />
                    )
                  }}
                />

                {errors.liquidity ? (
                  <span
                    id="investment-liquidity-error"
                    className={
                      styles.error
                    }
                    role="alert"
                  >
                    {
                      errors.liquidity
                        .message
                    }
                  </span>
                ) : null}
              </div>
            </div>

            <div
              className={
                styles.twoColumns
              }
            >
              <Controller
                name="investedAmount"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    ref={field.ref}
                    name={field.name}
                    label="Valor investido"
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                    autoComplete="off"
                    value={
                      field.value
                    }
                    error={
                      errors
                        .investedAmount
                        ?.message
                    }
                    onBlur={
                      field.onBlur
                    }
                    onChange={(
                      event,
                    ) => {
                      field.onChange(
                        formatCurrencyInput(
                          event.target.value,
                        ),
                      )
                    }}
                  />
                )}
              />

              <Controller
                name="currentAmount"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    ref={field.ref}
                    name={field.name}
                    label="Valor atual"
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                    autoComplete="off"
                    value={
                      field.value
                    }
                    error={
                      errors
                        .currentAmount
                        ?.message
                    }
                    onBlur={
                      field.onBlur
                    }
                    onChange={(
                      event,
                    ) => {
                      field.onChange(
                        formatCurrencyInput(
                          event.target.value,
                        ),
                      )
                    }}
                  />
                )}
              />
            </div>

            {canShowPreview ? (
              <div
                className={[
                  styles.preview,
                  hasPositiveResult
                    ? styles.positivePreview
                    : styles.negativePreview,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-live="polite"
              >
                {hasPositiveResult ? (
                  <TrendingUp
                    size={22}
                    aria-hidden="true"
                  />
                ) : (
                  <TrendingDown
                    size={22}
                    aria-hidden="true"
                  />
                )}

                <div>
                  <span>
                    Resultado informado
                  </span>

                  <strong>
                    {formatCurrency(
                      resultInCents,
                    )}
                  </strong>

                  <small>
                    {formatPercentage(
                      returnPercentage,
                    )}
                    % sobre o valor
                    investido.
                  </small>
                </div>
              </div>
            ) : null}

            <div
              className={
                styles.twoColumns
              }
            >
              <div
                className={
                  styles.dateField
                }
              >
                <label
                  className={
                    styles.dateLabel
                  }
                  htmlFor="investment-application-date"
                >
                  <span>
                    Data da aplicação
                  </span>

                  <CalendarDays
                    size={17}
                    aria-hidden="true"
                  />
                </label>

                <input
                  id="investment-application-date"
                  type="date"
                  className={[
                    styles.dateInput,
                    errors.applicationDate
                      ? styles.inputError
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  max={
                    getCurrentDate()
                  }
                  aria-invalid={
                    Boolean(
                      errors.applicationDate,
                    )
                  }
                  aria-describedby={
                    errors.applicationDate
                      ? 'investment-application-date-error'
                      : undefined
                  }
                  {...register(
                    'applicationDate',
                  )}
                />

                {errors.applicationDate ? (
                  <span
                    id="investment-application-date-error"
                    className={
                      styles.error
                    }
                    role="alert"
                  >
                    {
                      errors
                        .applicationDate
                        .message
                    }
                  </span>
                ) : null}
              </div>

              <div
                className={
                  styles.dateField
                }
              >
                <label
                  className={
                    styles.dateLabel
                  }
                  htmlFor="investment-reference-date"
                >
                  <span>
                    Data de referência
                  </span>

                  <CalendarDays
                    size={17}
                    aria-hidden="true"
                  />
                </label>

                <input
                  id="investment-reference-date"
                  type="date"
                  className={[
                    styles.dateInput,
                    errors.referenceDate
                      ? styles.inputError
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  max={
                    getCurrentDate()
                  }
                  aria-invalid={
                    Boolean(
                      errors.referenceDate,
                    )
                  }
                  aria-describedby={
                    errors.referenceDate
                      ? 'investment-reference-date-error'
                      : undefined
                  }
                  {...register(
                    'referenceDate',
                  )}
                />

                {errors.referenceDate ? (
                  <span
                    id="investment-reference-date-error"
                    className={
                      styles.error
                    }
                    role="alert"
                  >
                    {
                      errors
                        .referenceDate
                        .message
                    }
                  </span>
                ) : null}
              </div>
            </div>

            <div
              className={
                styles.dateField
              }
            >
              <label
                className={
                  styles.dateLabel
                }
                htmlFor="investment-maturity-date"
              >
                <span>
                  Data de vencimento
                  opcional
                </span>

                <CalendarDays
                  size={17}
                  aria-hidden="true"
                />
              </label>

              <input
                id="investment-maturity-date"
                type="date"
                className={[
                  styles.dateInput,
                  errors.maturityDate
                    ? styles.inputError
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-invalid={
                  Boolean(
                    errors.maturityDate,
                  )
                }
                aria-describedby={
                  errors.maturityDate
                    ? 'investment-maturity-date-error'
                    : undefined
                }
                {...register(
                  'maturityDate',
                )}
              />

              {errors.maturityDate ? (
                <span
                  id="investment-maturity-date-error"
                  className={
                    styles.error
                  }
                  role="alert"
                >
                  {
                    errors
                      .maturityDate
                      .message
                  }
                </span>
              ) : null}
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                className={
                  styles.label
                }
                htmlFor="investment-notes"
              >
                Observações opcionais
              </label>

              <textarea
                id="investment-notes"
                className={[
                  styles.textarea,
                  errors.notes
                    ? styles.inputError
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                rows={4}
                maxLength={200}
                placeholder="Exemplo: Reserva de emergência"
                aria-invalid={
                  Boolean(
                    errors.notes,
                  )
                }
                aria-describedby={
                  errors.notes
                    ? 'investment-notes-error'
                    : undefined
                }
                {...register('notes')}
              />

              {errors.notes ? (
                <span
                  id="investment-notes-error"
                  className={
                    styles.error
                  }
                  role="alert"
                >
                  {errors.notes.message}
                </span>
              ) : null}
            </div>

            <div
              className={
                styles.securityNotice
              }
            >
              <ShieldCheck
                size={20}
                aria-hidden="true"
              />

              <p>
                Os valores são informados
                manualmente e servem
                apenas para organização.
                O Finance App não faz
                recomendações de compra,
                venda ou resgate.
              </p>
            </div>
          </div>

          <footer
            className={styles.footer}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={
                isSubmitting
              }
            >
              <Save
                size={18}
                aria-hidden="true"
              />

              Salvar investimento
            </Button>
          </footer>
        </form>
      </section>
    </div>
  )
}