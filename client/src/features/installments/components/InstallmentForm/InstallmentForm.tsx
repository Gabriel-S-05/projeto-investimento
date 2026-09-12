import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  CreditCard as CreditCardIcon,
  ReceiptText,
  Save,
  ShieldCheck,
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
import type { CreditCard } from '../../../cards/types/credit-card'
import {
  installmentCategories,
  type InstallmentCategory,
  type InstallmentFormValues,
} from '../../types/installment'

import styles from './InstallmentForm.module.css'

interface SelectOption<
  TValue extends string,
> {
  value: TValue
  label: string
}

interface InstallmentFormProps {
  isOpen: boolean
  bank: BankOption
  creditCards: CreditCard[]
  onClose: () => void
  onSave: (
    values: InstallmentFormValues,
  ) => void
}

interface CardOption {
  value: string
  label: string
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

const installmentSchema = z
  .object({
    cardId: z
      .string()
      .min(
        1,
        'Selecione o cartão utilizado.',
      ),

    description: z
      .string()
      .trim()
      .min(
        2,
        'Informe uma descrição com pelo menos 2 caracteres.',
      )
      .max(
        60,
        'Utilize no máximo 60 caracteres.',
      ),

    category: z
      .string()
      .min(
        1,
        'Selecione a categoria da compra.',
      ),

    totalAmount: z
      .string()
      .trim()
      .min(
        1,
        'Informe o valor total da compra.',
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
        'Informe um valor maior que zero.',
      ),

    totalInstallments: z
      .string()
      .min(
        1,
        'Informe a quantidade de parcelas.',
      ),

    currentInstallment: z
      .string()
      .min(
        1,
        'Informe a parcela atual.',
      ),

    purchaseDate: z
      .string()
      .min(
        1,
        'Informe a data da compra.',
      ),

    nextDueDate: z.string(),
  })
  .superRefine(
    (
      data,
      context,
    ) => {
      const totalInstallments =
        Number(
          data.totalInstallments,
        )

      const currentInstallment =
        Number(
          data.currentInstallment,
        )

      if (
        !Number.isInteger(
          totalInstallments,
        ) ||
        totalInstallments < 2 ||
        totalInstallments > 120
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            'totalInstallments',
          ],
          message:
            'Informe uma quantidade entre 2 e 120 parcelas.',
        })
      }

      if (
        !Number.isInteger(
          currentInstallment,
        ) ||
        currentInstallment < 1
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            'currentInstallment',
          ],
          message:
            'Informe uma parcela atual válida.',
        })

        return
      }

      if (
        Number.isInteger(
          totalInstallments,
        ) &&
        currentInstallment >
          totalInstallments
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            'currentInstallment',
          ],
          message:
            'A parcela atual não pode ser maior que o total de parcelas.',
        })
      }

      const purchaseDate =
        new Date(
          `${data.purchaseDate}T12:00:00`,
        )

      if (
        Number.isNaN(
          purchaseDate.getTime(),
        )
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            'purchaseDate',
          ],
          message:
            'Informe uma data de compra válida.',
        })
      }

      const purchaseIsComplete =
        Number.isInteger(
          totalInstallments,
        ) &&
        currentInstallment >=
          totalInstallments

      if (
        !purchaseIsComplete &&
        !data.nextDueDate
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            'nextDueDate',
          ],
          message:
            'Informe a data do próximo vencimento.',
        })

        return
      }

      if (
        data.nextDueDate &&
        data.purchaseDate &&
        data.nextDueDate <
          data.purchaseDate
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            'nextDueDate',
          ],
          message:
            'O próximo vencimento não pode ser anterior à compra.',
        })
      }
    },
  )

type InstallmentFormData = z.infer<
  typeof installmentSchema
>

const categoryOptions:
  SelectOption<InstallmentCategory>[] =
  installmentCategories.map(
    (category) => ({
      value: category.value,
      label: category.label,
    }),
  )

function createSelectStyles<
  TOption,
>(): StylesConfig<
  TOption,
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
      zIndex: 1400,
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

const cardSelectStyles =
  createSelectStyles<CardOption>()

const categorySelectStyles =
  createSelectStyles<
    SelectOption<InstallmentCategory>
  >()

export function InstallmentForm({
  isOpen,
  bank,
  creditCards,
  onClose,
  onSave,
}: InstallmentFormProps) {
  const titleId = useId()
  const descriptionId = useId()

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<InstallmentFormData>({
    resolver:
      zodResolver(
        installmentSchema,
      ),

    defaultValues: {
      cardId: '',
      description: '',
      category: 'other',
      totalAmount: '',
      totalInstallments: '2',
      currentInstallment: '1',
      purchaseDate:
        getCurrentDate(),
      nextDueDate: '',
    },

    mode: 'onTouched',
  })

  const totalAmount =
    watch('totalAmount')

  const totalInstallments =
    watch('totalInstallments')

  const currentInstallment =
    watch('currentInstallment')

  const eligibleCreditCards =
    creditCards.filter(
      (card) =>
        card.type === 'credit' ||
        card.type === 'multiple',
    )

  const cardOptions:
    CardOption[] =
    eligibleCreditCards.map(
      (card) => ({
        value: card.id,
        label: [
          card.nickname,
          card.kind === 'virtual'
            ? 'Virtual'
            : null,
        ]
          .filter(Boolean)
          .join(' • '),
      }),
    )

  const parsedTotalAmount =
    parseCurrencyToCents(
      totalAmount,
    )

  const parsedTotalInstallments =
    Number(totalInstallments)

  const parsedCurrentInstallment =
    Number(currentInstallment)

  const installmentAmountInCents =
    parsedTotalAmount !== null &&
    Number.isInteger(
      parsedTotalInstallments,
    ) &&
    parsedTotalInstallments > 0
      ? Math.round(
          parsedTotalAmount /
            parsedTotalInstallments,
        )
      : null

  const remainingInstallments =
    Number.isInteger(
      parsedTotalInstallments,
    ) &&
    Number.isInteger(
      parsedCurrentInstallment,
    ) &&
    parsedCurrentInstallment >= 1 &&
    parsedCurrentInstallment <=
      parsedTotalInstallments
      ? parsedTotalInstallments -
        parsedCurrentInstallment +
        1
      : null

  const isPurchaseComplete =
    Number.isInteger(
      parsedTotalInstallments,
    ) &&
    Number.isInteger(
      parsedCurrentInstallment,
    ) &&
    parsedCurrentInstallment >=
      parsedTotalInstallments

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
      cardId:
        eligibleCreditCards.length === 1
          ? eligibleCreditCards[0]
              ?.id ?? ''
          : '',

      description: '',

      category: 'other',

      totalAmount: '',

      totalInstallments: '2',

      currentInstallment: '1',

      purchaseDate:
        getCurrentDate(),

      nextDueDate: '',
    })
  }, [
    isOpen,
    reset,
  ])

  useEffect(() => {
    if (!isPurchaseComplete) {
      return
    }

    setValue(
      'nextDueDate',
      '',
    )
  }, [
    isPurchaseComplete,
    setValue,
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
    data: InstallmentFormData,
  ): Promise<void> {
    const selectedCard =
      eligibleCreditCards.find(
        (card) =>
          card.id === data.cardId,
      )

    if (!selectedCard) {
      return
    }

    const totalAmountInCents =
      parseCurrencyToCents(
        data.totalAmount,
      )

    if (
      totalAmountInCents === null ||
      totalAmountInCents <= 0
    ) {
      return
    }

    const normalizedTotalInstallments =
      Number(
        data.totalInstallments,
      )

    const normalizedCurrentInstallment =
      Number(
        data.currentInstallment,
      )

    onSave({
      cardId:
        selectedCard.id,

      description:
        data.description.trim(),

      category:
        data.category as
          InstallmentCategory,

      totalAmountInCents,

      totalInstallments:
        normalizedTotalInstallments,

      currentInstallment:
        normalizedCurrentInstallment,

      purchaseDate:
        data.purchaseDate,

      nextDueDate:
        normalizedCurrentInstallment >=
        normalizedTotalInstallments
          ? null
          : data.nextDueDate ||
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
              <ReceiptText
                size={24}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 id={titleId}>
                Adicionar compra parcelada
              </h2>

              <p id={descriptionId}>
                Cadastre uma compra
                parcelada vinculada a um
                cartão do{' '}
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

        {eligibleCreditCards.length ===
        0 ? (
          <div
            className={
              styles.noCardsState
            }
          >
            <div
              className={
                styles.noCardsIcon
              }
            >
              <CreditCardIcon
                size={30}
                aria-hidden="true"
              />
            </div>

            <h3>
              Cadastre um cartão de crédito
            </h3>

            <p>
              Para registrar uma compra
              parcelada, adicione primeiro
              um cartão com modalidade
              Crédito ou Crédito e débito.
            </p>

            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        ) : (
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
              <div
                className={
                  styles.field
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="installment-card"
                >
                  Cartão utilizado
                </label>

                <Controller
                  name="cardId"
                  control={control}
                  render={({
                    field,
                    fieldState,
                  }) => {
                    const selectedOption =
                      cardOptions.find(
                        (option) =>
                          option.value ===
                          field.value,
                      ) ?? null

                    return (
                      <Select<
                        CardOption,
                        false
                      >
                        inputId="installment-card"
                        instanceId="installment-card-select"
                        name={field.name}
                        options={cardOptions}
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
                        placeholder="Selecione o cartão"
                        noOptionsMessage={() =>
                          'Nenhum cartão disponível'
                        }
                        styles={
                          cardSelectStyles
                        }
                        isSearchable
                        aria-invalid={
                          fieldState.invalid
                        }
                        aria-describedby={
                          fieldState.error
                            ? 'installment-card-error'
                            : undefined
                        }
                      />
                    )
                  }}
                />

                {errors.cardId ? (
                  <span
                    id="installment-card-error"
                    className={
                      styles.error
                    }
                    role="alert"
                  >
                    {
                      errors.cardId
                        .message
                    }
                  </span>
                ) : null}
              </div>

              <TextField
                label="Descrição da compra"
                placeholder="Exemplo: Notebook"
                maxLength={60}
                autoComplete="off"
                error={
                  errors.description
                    ?.message
                }
                {...register(
                  'description',
                )}
              />

              <div
                className={
                  styles.field
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="installment-category"
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
                        SelectOption<InstallmentCategory>,
                        false
                      >
                        inputId="installment-category"
                        instanceId="installment-category-select"
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
                        placeholder="Selecione a categoria"
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
                            ? 'installment-category-error'
                            : undefined
                        }
                      />
                    )
                  }}
                />

                {errors.category ? (
                  <span
                    id="installment-category-error"
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

              <Controller
                name="totalAmount"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    ref={field.ref}
                    name={field.name}
                    label="Valor total da compra"
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                    autoComplete="off"
                    value={
                      field.value
                    }
                    error={
                      errors.totalAmount
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

              <div
                className={
                  styles.twoColumns
                }
              >
                <TextField
                  label="Quantidade de parcelas"
                  type="number"
                  inputMode="numeric"
                  min={2}
                  max={120}
                  placeholder="Exemplo: 12"
                  error={
                    errors.totalInstallments
                      ?.message
                  }
                  {...register(
                    'totalInstallments',
                  )}
                />

                <TextField
                  label="Parcela atual"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={
                    parsedTotalInstallments >
                    0
                      ? parsedTotalInstallments
                      : 120
                  }
                  placeholder="Exemplo: 3"
                  error={
                    errors.currentInstallment
                      ?.message
                  }
                  {...register(
                    'currentInstallment',
                  )}
                />
              </div>

              {installmentAmountInCents !==
              null ? (
                <div
                  className={
                    styles.preview
                  }
                  aria-live="polite"
                >
                  <ReceiptText
                    size={20}
                    aria-hidden="true"
                  />

                  <div>
                    <span>
                      Valor médio da parcela
                    </span>

                    <strong>
                      {formatCurrency(
                        installmentAmountInCents,
                      )}
                    </strong>

                    {remainingInstallments !==
                    null ? (
                      <small>
                        {
                          remainingInstallments
                        }{' '}
                        {remainingInstallments ===
                        1
                          ? 'parcela restante'
                          : 'parcelas restantes'}
                        , incluindo a atual.
                      </small>
                    ) : null}
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
                    htmlFor="purchase-date"
                  >
                    <span>
                      Data da compra
                    </span>

                    <CalendarDays
                      size={17}
                      aria-hidden="true"
                    />
                  </label>

                  <input
                    id="purchase-date"
                    type="date"
                    className={[
                      styles.dateInput,
                      errors.purchaseDate
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
                        errors.purchaseDate,
                      )
                    }
                    aria-describedby={
                      errors.purchaseDate
                        ? 'purchase-date-error'
                        : undefined
                    }
                    {...register(
                      'purchaseDate',
                    )}
                  />

                  {errors.purchaseDate ? (
                    <span
                      id="purchase-date-error"
                      className={
                        styles.error
                      }
                      role="alert"
                    >
                      {
                        errors.purchaseDate
                          .message
                      }
                    </span>
                  ) : null}
                </div>

                {!isPurchaseComplete ? (
                  <div
                    className={
                      styles.dateField
                    }
                  >
                    <label
                      className={
                        styles.dateLabel
                      }
                      htmlFor="next-due-date"
                    >
                      <span>
                        Próximo vencimento
                      </span>

                      <CalendarDays
                        size={17}
                        aria-hidden="true"
                      />
                    </label>

                    <input
                      id="next-due-date"
                      type="date"
                      className={[
                        styles.dateInput,
                        errors.nextDueDate
                          ? styles.inputError
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-invalid={
                        Boolean(
                          errors.nextDueDate,
                        )
                      }
                      aria-describedby={
                        errors.nextDueDate
                          ? 'next-due-date-error'
                          : undefined
                      }
                      {...register(
                        'nextDueDate',
                      )}
                    />

                    {errors.nextDueDate ? (
                      <span
                        id="next-due-date-error"
                        className={
                          styles.error
                        }
                        role="alert"
                      >
                        {
                          errors.nextDueDate
                            .message
                        }
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className={
                      styles.completedNotice
                    }
                  >
                    <strong>
                      Parcelamento concluído
                    </strong>

                    <span>
                      Não é necessário informar
                      um próximo vencimento.
                    </span>
                  </div>
                )}
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
                  A compra será vinculada
                  apenas ao identificador
                  interno do cartão. Não
                  informe número completo,
                  CVV, senha ou código de
                  segurança.
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

                Salvar parcela
              </Button>
            </footer>
          </form>
        )}
      </section>
    </div>
  )
}