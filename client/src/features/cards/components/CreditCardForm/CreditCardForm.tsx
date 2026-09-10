import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  CreditCard,
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
import {
  creditCardCategories,
  creditCardKinds,
  creditCardTypes,
  type CreditCardCategory,
  type CreditCardFormValues,
  type CreditCardKind,
  type CreditCardType,
} from '../../types/credit-card'

import styles from './CreditCardForm.module.css'

interface SelectOption<
  TValue extends string,
> {
  value: TValue
  label: string
}

interface CreditCardFormProps {
  isOpen: boolean
  bank: BankOption
  onClose: () => void
  onSave: (
    values: CreditCardFormValues,
  ) => void
}

const creditCardSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(
        2,
        'Informe um apelido com pelo menos 2 caracteres.',
      )
      .max(
        40,
        'Utilize no máximo 40 caracteres.',
      ),

    type: z
      .string()
      .min(
        1,
        'Selecione a modalidade do cartão.',
      ),

    category: z
      .string()
      .min(
        1,
        'Selecione a categoria do cartão.',
      ),

    kind: z
      .string()
      .min(
        1,
        'Selecione o tipo de cartão.',
      ),

    totalLimit: z.string(),
    usedLimit: z.string(),
    currentInvoice: z.string(),
    closingDay: z.string(),
    dueDay: z.string(),
  })
  .superRefine(
    (
      data,
      context,
    ) => {
      if (
        data.type === 'debit'
      ) {
        return
      }

      const totalLimitInCents =
        parseOptionalCurrencyToCents(
          data.totalLimit,
        )

      const usedLimitInCents =
        parseOptionalCurrencyToCents(
          data.usedLimit,
        )

      const currentInvoiceInCents =
        parseOptionalCurrencyToCents(
          data.currentInvoice,
        )

      if (
        totalLimitInCents === null
      ) {
        context.addIssue({
          code: 'custom',
          path: ['totalLimit'],
          message:
            'Informe o limite total do cartão.',
        })
      }

      if (
        usedLimitInCents === null
      ) {
        context.addIssue({
          code: 'custom',
          path: ['usedLimit'],
          message:
            'Informe o limite utilizado.',
        })
      }

      if (
        currentInvoiceInCents === null
      ) {
        context.addIssue({
          code: 'custom',
          path: ['currentInvoice'],
          message:
            'Informe o valor da fatura atual.',
        })
      }

      if (
        totalLimitInCents !== null &&
        usedLimitInCents !== null &&
        usedLimitInCents >
          totalLimitInCents
      ) {
        context.addIssue({
          code: 'custom',
          path: ['usedLimit'],
          message:
            'O limite utilizado não pode ser maior que o limite total.',
        })
      }

      validateDay(
        data.closingDay,
        'closingDay',
        'Informe um dia de fechamento entre 1 e 31.',
        context,
      )

      validateDay(
        data.dueDay,
        'dueDay',
        'Informe um dia de vencimento entre 1 e 31.',
        context,
      )
    },
  )

type CreditCardFormData = z.infer<
  typeof creditCardSchema
>

const cardTypeOptions:
  SelectOption<CreditCardType>[] =
  creditCardTypes.map(
    (cardType) => ({
      value: cardType.value,
      label: cardType.label,
    }),
  )

const cardCategoryOptions:
  SelectOption<CreditCardCategory>[] =
  creditCardCategories.map(
    (category) => ({
      value: category.value,
      label: category.label,
    }),
  )

const cardKindOptions:
  SelectOption<CreditCardKind>[] =
  creditCardKinds.map(
    (kind) => ({
      value: kind.value,
      label: kind.label,
    }),
  )

function validateDay(
  value: string,
  path:
    | 'closingDay'
    | 'dueDay',
  message: string,
  context: z.RefinementCtx,
): void {
  const day = Number(value)

  if (
    !Number.isInteger(day) ||
    day < 1 ||
    day > 31
  ) {
    context.addIssue({
      code: 'custom',
      path: [path],
      message,
    })
  }
}

function parseOptionalCurrencyToCents(
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
      zIndex: 1300,
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

const cardTypeSelectStyles =
  createSelectStyles<CreditCardType>()

const cardCategorySelectStyles =
  createSelectStyles<CreditCardCategory>()

const cardKindSelectStyles =
  createSelectStyles<CreditCardKind>()

export function CreditCardForm({
  isOpen,
  bank,
  onClose,
  onSave,
}: CreditCardFormProps) {
  const titleId = useId()
  const descriptionId = useId()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CreditCardFormData>({
    resolver:
      zodResolver(
        creditCardSchema,
      ),

    defaultValues: {
      nickname:
        'Cartão principal',
      type: 'credit',
      category: 'standard',
      kind: 'physical',
      totalLimit: '',
      usedLimit: '',
      currentInvoice: '',
      closingDay: '',
      dueDay: '',
    },

    mode: 'onTouched',
  })

  const selectedCardType =
    watch('type')

  const hasCreditFunction =
    selectedCardType !== 'debit'

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
      nickname:
        'Cartão principal',
      type: 'credit',
      category: 'standard',
      kind: 'physical',
      totalLimit: '',
      usedLimit: '',
      currentInvoice: '',
      closingDay: '',
      dueDay: '',
    })
  }, [
    isOpen,
    reset,
  ])

  useEffect(() => {
    if (
      selectedCardType !== 'debit'
    ) {
      return
    }

    setValue(
      'totalLimit',
      '',
    )

    setValue(
      'usedLimit',
      '',
    )

    setValue(
      'currentInvoice',
      '',
    )

    setValue(
      'closingDay',
      '',
    )

    setValue(
      'dueDay',
      '',
    )
  }, [
    selectedCardType,
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
    data: CreditCardFormData,
  ): Promise<void> {
    const isDebitOnly =
      data.type === 'debit'

    const totalLimitInCents =
      isDebitOnly
        ? null
        : parseOptionalCurrencyToCents(
            data.totalLimit,
          )

    const usedLimitInCents =
      isDebitOnly
        ? null
        : parseOptionalCurrencyToCents(
            data.usedLimit,
          )

    const currentInvoiceInCents =
      isDebitOnly
        ? null
        : parseOptionalCurrencyToCents(
            data.currentInvoice,
          )

    const closingDay =
      isDebitOnly
        ? null
        : Number(
            data.closingDay,
          )

    const dueDay =
      isDebitOnly
        ? null
        : Number(
            data.dueDay,
          )

    onSave({
      nickname:
        data.nickname.trim(),

      type:
        data.type as CreditCardType,

      category:
        data.category as CreditCardCategory,

      kind:
        data.kind as CreditCardKind,

      totalLimitInCents,

      usedLimitInCents,

      currentInvoiceInCents,

      closingDay,

      dueDay,
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
              <CreditCard
                size={24}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 id={titleId}>
                Adicionar cartão
              </h2>

              <p id={descriptionId}>
                Cadastre as informações
                financeiras do cartão no{' '}
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
            className={styles.content}
          >
            <TextField
              label="Apelido do cartão"
              placeholder="Exemplo: Cartão principal"
              autoComplete="off"
              maxLength={40}
              error={
                errors.nickname
                  ?.message
              }
              {...register(
                'nickname',
              )}
            />

            <div
              className={styles.field}
            >
              <label
                className={
                  styles.label
                }
                htmlFor="credit-card-type"
              >
                Modalidade
              </label>

              <Controller
                name="type"
                control={control}
                render={({
                  field,
                  fieldState,
                }) => {
                  const selectedOption =
                    cardTypeOptions.find(
                      (option) =>
                        option.value ===
                        field.value,
                    ) ?? null

                  return (
                    <Select<
                      SelectOption<CreditCardType>,
                      false
                    >
                      inputId="credit-card-type"
                      instanceId="credit-card-type-select"
                      name={field.name}
                      options={
                        cardTypeOptions
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
                      placeholder="Selecione a modalidade"
                      noOptionsMessage={() =>
                        'Nenhuma modalidade encontrada'
                      }
                      styles={
                        cardTypeSelectStyles
                      }
                      isSearchable
                      aria-invalid={
                        fieldState.invalid
                      }
                      aria-describedby={
                        fieldState.error
                          ? 'credit-card-type-error'
                          : undefined
                      }
                    />
                  )
                }}
              />

              {errors.type ? (
                <span
                  id="credit-card-type-error"
                  className={styles.error}
                  role="alert"
                >
                  {errors.type.message}
                </span>
              ) : null}
            </div>

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
                  htmlFor="credit-card-category"
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
                      cardCategoryOptions.find(
                        (option) =>
                          option.value ===
                          field.value,
                      ) ?? null

                    return (
                      <Select<
                        SelectOption<CreditCardCategory>,
                        false
                      >
                        inputId="credit-card-category"
                        instanceId="credit-card-category-select"
                        name={field.name}
                        options={
                          cardCategoryOptions
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
                          cardCategorySelectStyles
                        }
                        isSearchable
                        aria-invalid={
                          fieldState.invalid
                        }
                        aria-describedby={
                          fieldState.error
                            ? 'credit-card-category-error'
                            : undefined
                        }
                      />
                    )
                  }}
                />

                {errors.category ? (
                  <span
                    id="credit-card-category-error"
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
                  htmlFor="credit-card-kind"
                >
                  Tipo de cartão
                </label>

                <Controller
                  name="kind"
                  control={control}
                  render={({
                    field,
                    fieldState,
                  }) => {
                    const selectedOption =
                      cardKindOptions.find(
                        (option) =>
                          option.value ===
                          field.value,
                      ) ?? null

                    return (
                      <Select<
                        SelectOption<CreditCardKind>,
                        false
                      >
                        inputId="credit-card-kind"
                        instanceId="credit-card-kind-select"
                        name={field.name}
                        options={
                          cardKindOptions
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
                          'Nenhum tipo encontrado'
                        }
                        styles={
                          cardKindSelectStyles
                        }
                        isSearchable
                        aria-invalid={
                          fieldState.invalid
                        }
                        aria-describedby={
                          fieldState.error
                            ? 'credit-card-kind-error'
                            : undefined
                        }
                      />
                    )
                  }}
                />

                {errors.kind ? (
                  <span
                    id="credit-card-kind-error"
                    className={
                      styles.error
                    }
                    role="alert"
                  >
                    {
                      errors.kind
                        .message
                    }
                  </span>
                ) : null}
              </div>
            </div>

            {hasCreditFunction ? (
              <div
                className={
                  styles.creditFields
                }
              >
                <div
                  className={
                    styles.sectionHeader
                  }
                >
                  <CreditCard
                    size={19}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Informações de crédito
                    </strong>

                    <span>
                      Informe os valores atuais do cartão.
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.twoColumns
                  }
                >
                  <Controller
                    name="totalLimit"
                    control={control}
                    render={({
                      field,
                    }) => (
                      <TextField
                        ref={field.ref}
                        name={field.name}
                        label="Limite total"
                        placeholder="R$ 0,00"
                        inputMode="numeric"
                        autoComplete="off"
                        value={
                          field.value
                        }
                        error={
                          errors.totalLimit
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
                    name="usedLimit"
                    control={control}
                    render={({
                      field,
                    }) => (
                      <TextField
                        ref={field.ref}
                        name={field.name}
                        label="Limite utilizado"
                        placeholder="R$ 0,00"
                        inputMode="numeric"
                        autoComplete="off"
                        value={
                          field.value
                        }
                        error={
                          errors.usedLimit
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

                <Controller
                  name="currentInvoice"
                  control={control}
                  render={({
                    field,
                  }) => (
                    <TextField
                      ref={field.ref}
                      name={field.name}
                      label="Fatura atual"
                      placeholder="R$ 0,00"
                      inputMode="numeric"
                      autoComplete="off"
                      value={
                        field.value
                      }
                      error={
                        errors.currentInvoice
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
                    label="Dia de fechamento"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={31}
                    placeholder="Exemplo: 3"
                    error={
                      errors.closingDay
                        ?.message
                    }
                    {...register(
                      'closingDay',
                    )}
                  />

                  <TextField
                    label="Dia de vencimento"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={31}
                    placeholder="Exemplo: 10"
                    error={
                      errors.dueDay
                        ?.message
                    }
                    {...register(
                      'dueDay',
                    )}
                  />
                </div>

                <div
                  className={
                    styles.dateHint
                  }
                >
                  <CalendarDays
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    Informe apenas o dia do mês, entre 1 e 31.
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={
                  styles.debitNotice
                }
              >
                <CreditCard
                  size={20}
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Cartão somente de débito
                  </strong>

                  <p>
                    Limite, fatura, fechamento e vencimento
                    não são necessários para esta modalidade.
                  </p>
                </div>
              </div>
            )}

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
                Não informe número completo, validade, CVV,
                senha ou código de segurança do cartão.
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

              Salvar cartão
            </Button>
          </footer>
        </form>
      </section>
    </div>
  )
}