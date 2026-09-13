import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarClock,
  CircleDollarSign,
  Save,
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
  incomeFrequencies,
  incomeTypes,
  type IncomeFormValues,
  type IncomeFrequency,
  type IncomeSource,
  type IncomeType,
} from '../../types/income'

import styles from './IncomeForm.module.css'

interface SelectOption<TValue extends string> {
  value: TValue
  label: string
}

interface IncomeFormProps {
  isOpen: boolean
  bank: BankOption
  initialValues?: IncomeSource | null
  onClose: () => void
  onSave: (
    values: IncomeFormValues,
  ) => void
}

function parseCurrencyToCents(
  value: string,
): number | null {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return null
  }

  const cents = Number(digits)

  return Number.isFinite(cents)
    ? cents
    : null
}

function formatCurrencyInput(
  value: string,
): string {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(Number(digits) / 100)
}

function formatCentsToCurrency(
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

const incomeSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(
        2,
        'Informe uma descrição com pelo menos 2 caracteres.',
      )
      .max(
        50,
        'Utilize no máximo 50 caracteres.',
      ),

    type: z
      .string()
      .min(
        1,
        'Selecione o tipo do recebimento.',
      ),

    amount: z
      .string()
      .trim()
      .min(
        1,
        'Informe o valor.',
      )
      .refine(
        (value) => {
          const cents =
            parseCurrencyToCents(value)

          return (
            cents !== null &&
            cents > 0
          )
        },
        'Informe um valor maior que zero.',
      ),

    frequency: z
      .string()
      .min(
        1,
        'Selecione a frequência.',
      ),

    paymentDay: z.string(),

    isVariableAmount: z.boolean(),
  })
  .superRefine(
    (data, context) => {
      if (
        data.frequency !== 'monthly'
      ) {
        return
      }

      const paymentDay =
        Number(data.paymentDay)

      if (
        !Number.isInteger(paymentDay) ||
        paymentDay < 1 ||
        paymentDay > 31
      ) {
        context.addIssue({
          code: 'custom',
          path: ['paymentDay'],
          message:
            'Informe um dia entre 1 e 31.',
        })
      }
    },
  )

type IncomeFormData = z.infer<
  typeof incomeSchema
>

const incomeTypeOptions:
  SelectOption<IncomeType>[] =
  incomeTypes.map(
    (incomeType) => ({
      value: incomeType.value,
      label: incomeType.label,
    }),
  )

const frequencyOptions:
  SelectOption<IncomeFrequency>[] =
  incomeFrequencies.map(
    (frequency) => ({
      value: frequency.value,
      label: frequency.label,
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
      zIndex: 1200,
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

const incomeTypeSelectStyles =
  createSelectStyles<IncomeType>()

const frequencySelectStyles =
  createSelectStyles<IncomeFrequency>()

export function IncomeForm({
  isOpen,
  bank,
  initialValues = null,
  onClose,
  onSave,
}: IncomeFormProps) {
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
  } = useForm<IncomeFormData>({
    resolver:
      zodResolver(incomeSchema),

    defaultValues: {
      description: 'Salário',
      type: 'salary',
      amount: '',
      frequency: 'monthly',
      paymentDay: '',
      isVariableAmount: false,
    },

    mode: 'onTouched',
  })

  const selectedFrequency =
    watch('frequency')

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (event.key === 'Escape') {
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

    if (initialValues) {
      reset({
        description:
          initialValues.description,

        type:
          initialValues.type,

        amount:
          formatCentsToCurrency(
            initialValues.amountInCents,
          ),

        frequency:
          initialValues.frequency,

        paymentDay:
          initialValues.paymentDay !==
          null
            ? String(
                initialValues.paymentDay,
              )
            : '',

        isVariableAmount:
          initialValues.isVariableAmount,
      })

      return
    }

    reset({
      description: 'Salário',
      type: 'salary',
      amount: '',
      frequency: 'monthly',
      paymentDay: '',
      isVariableAmount: false,
    })
  }, [
    initialValues,
    isOpen,
    reset,
  ])

  if (!isOpen) {
    return null
  }

  function handleOverlayClick(
    event: MouseEvent<HTMLDivElement>,
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose()
    }
  }

  async function handleSave(
    data: IncomeFormData,
  ): Promise<void> {
    const amountInCents =
      parseCurrencyToCents(
        data.amount,
      )

    if (
      amountInCents === null ||
      amountInCents <= 0
    ) {
      return
    }

    const paymentDay =
      data.frequency === 'monthly'
        ? Number(data.paymentDay)
        : null

    onSave({
      description:
        data.description.trim(),

      type:
        data.type as IncomeType,

      amountInCents,

      frequency:
        data.frequency as IncomeFrequency,

      paymentDay,

      isVariableAmount:
        data.isVariableAmount,
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
              <CircleDollarSign
                size={24}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 id={titleId}>
                {initialValues
                  ? 'Editar recebimento'
                  : 'Adicionar recebimento'}
              </h2>

              <p id={descriptionId}>
                {initialValues
                  ? 'Atualize os dados da entrada recebida no '
                  : 'Cadastre uma entrada recebida no '}

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
              label="Descrição"
              placeholder="Exemplo: Salário"
              maxLength={50}
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
              className={styles.field}
            >
              <label
                className={
                  styles.label
                }
                htmlFor="income-type"
              >
                Tipo de recebimento
              </label>

              <Controller
                name="type"
                control={control}
                render={({
                  field,
                  fieldState,
                }) => {
                  const selectedOption =
                    incomeTypeOptions.find(
                      (option) =>
                        option.value ===
                        field.value,
                    ) ?? null

                  return (
                    <Select<
                      SelectOption<IncomeType>,
                      false
                    >
                      inputId="income-type"
                      instanceId="income-type-select"
                      name={field.name}
                      options={
                        incomeTypeOptions
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
                      placeholder="Selecione o tipo"
                      noOptionsMessage={() =>
                        'Nenhum tipo encontrado'
                      }
                      styles={
                        incomeTypeSelectStyles
                      }
                      isSearchable
                      aria-invalid={
                        fieldState.invalid
                      }
                      aria-describedby={
                        fieldState.error
                          ? 'income-type-error'
                          : undefined
                      }
                    />
                  )
                }}
              />

              {errors.type ? (
                <span
                  id="income-type-error"
                  className={styles.error}
                  role="alert"
                >
                  {
                    errors.type
                      .message
                  }
                </span>
              ) : null}
            </div>

            <Controller
              name="amount"
              control={control}
              render={({
                field,
              }) => (
                <TextField
                  ref={field.ref}
                  name={field.name}
                  label="Valor"
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                  autoComplete="off"
                  value={
                    field.value
                  }
                  error={
                    errors.amount
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
              className={styles.field}
            >
              <label
                className={
                  styles.label
                }
                htmlFor="income-frequency"
              >
                Frequência
              </label>

              <Controller
                name="frequency"
                control={control}
                render={({
                  field,
                  fieldState,
                }) => {
                  const selectedOption =
                    frequencyOptions.find(
                      (option) =>
                        option.value ===
                        field.value,
                    ) ?? null

                  return (
                    <Select<
                      SelectOption<IncomeFrequency>,
                      false
                    >
                      inputId="income-frequency"
                      instanceId="income-frequency-select"
                      name={field.name}
                      options={
                        frequencyOptions
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
                      placeholder="Selecione a frequência"
                      noOptionsMessage={() =>
                        'Nenhuma frequência encontrada'
                      }
                      styles={
                        frequencySelectStyles
                      }
                      isSearchable
                      aria-invalid={
                        fieldState.invalid
                      }
                      aria-describedby={
                        fieldState.error
                          ? 'income-frequency-error'
                          : undefined
                      }
                    />
                  )
                }}
              />

              {errors.frequency ? (
                <span
                  id="income-frequency-error"
                  className={styles.error}
                  role="alert"
                >
                  {
                    errors.frequency
                      .message
                  }
                </span>
              ) : null}
            </div>

            {selectedFrequency ===
            'monthly' ? (
              <TextField
                label="Dia do recebimento"
                type="number"
                inputMode="numeric"
                min={1}
                max={31}
                placeholder="Exemplo: 5"
                error={
                  errors.paymentDay
                    ?.message
                }
                {...register(
                  'paymentDay',
                )}
              />
            ) : null}

            <label
              className={
                styles.checkbox
              }
            >
              <input
                type="checkbox"
                {...register(
                  'isVariableAmount',
                )}
              />

              <span>
                O valor pode variar a
                cada recebimento
              </span>
            </label>

            <div
              className={
                styles.notice
              }
            >
              <CalendarClock
                size={19}
                aria-hidden="true"
              />

              <p>
                Use valores fictícios
                neste protótipo. Os dados
                ainda não são enviados
                ao servidor nem
                persistidos após
                atualizar a página.
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

              {initialValues
                ? 'Salvar alterações'
                : 'Salvar recebimento'}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  )
}