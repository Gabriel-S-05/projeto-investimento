import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  Landmark,
  Save,
  WalletCards,
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
  type SingleValue,
  type StylesConfig,
} from 'react-select'
import { z } from 'zod'

import { Button } from '../../../../components/ui/Button/IndexButton'
import { TextField } from '../../../../components/ui/TextField/IndexTextField'
import type { BankOption } from '../../data/bank'
import {
  accountTypes,
  type AccountType,
  type BankAccountDetails,
} from '../../types/bank-details'

import styles from './AddBalanceModal.module.css'

interface AccountTypeOption {
  value: AccountType
  label: string
}

interface AddBalanceModalProps {
  isOpen: boolean
  bank: BankOption
  initialValues?: BankAccountDetails | null
  onClose: () => void
  onSave: (
    accountDetails: BankAccountDetails,
  ) => void
}

const balanceSchema = z.object({
  accountType: z
    .string()
    .min(
      1,
      'Selecione o tipo da conta.',
    ),

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

  balance: z
    .string()
    .trim()
    .min(
      1,
      'Informe o saldo atual.',
    )
    .refine(
      (value) =>
        parseCurrencyToCents(value) !== null,
      'Informe um valor válido.',
    ),

  referenceDate: z
    .string()
    .min(
      1,
      'Informe a data de referência.',
    ),
})

type BalanceFormData = z.infer<
  typeof balanceSchema
>

const accountTypeOptions: AccountTypeOption[] =
  accountTypes.map(
    (accountType) => ({
      value: accountType.value,
      label: accountType.label,
    }),
  )

const selectStyles: StylesConfig<
  AccountTypeOption,
  false
> = {
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

  indicatorSeparator: () => ({
    display: 'none',
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
    zIndex: 1100,
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
  const trimmedValue =
    value.trim()

  if (!trimmedValue) {
    return null
  }

  const normalizedValue =
    trimmedValue
      .replace(/\s/g, '')
      .replace(/^R\$/i, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(
        /[^0-9.-]/g,
        '',
      )

  if (
    !normalizedValue ||
    normalizedValue === '-' ||
    normalizedValue === '.'
  ) {
    return null
  }

  const numericValue =
    Number(normalizedValue)

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return null
  }

  return Math.round(
    numericValue * 100,
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

  const valueInCents =
    Number(digits)

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

export function AddBalanceModal({
  isOpen,
  bank,
  initialValues = null,
  onClose,
  onSave,
}: AddBalanceModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<BalanceFormData>({
    resolver:
      zodResolver(
        balanceSchema,
      ),

    defaultValues: {
      accountType: '',
      nickname:
        'Conta principal',
      balance: '',
      referenceDate:
        getCurrentDate(),
    },

    mode: 'onTouched',
  })

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
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (initialValues) {
      reset({
        accountType:
          initialValues.accountType,

        nickname:
          initialValues.nickname,

        balance:
          formatCentsToCurrency(
            initialValues.currentBalanceInCents,
          ),

        referenceDate:
          initialValues.referenceDate,
      })

      return
    }

    reset({
      accountType: '',
      nickname: 'Conta principal',
      balance: '',
      referenceDate: getCurrentDate(),
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
    data: BalanceFormData,
  ): Promise<void> {
    const currentBalanceInCents =
      parseCurrencyToCents(
        data.balance,
      )

    if (
      currentBalanceInCents ===
      null
    ) {
      return
    }

    const accountDetails:
      BankAccountDetails = {
        bankId:
          bank.value,

        accountType:
          data.accountType as AccountType,

        nickname:
          data.nickname.trim(),

        currentBalanceInCents,

        referenceDate:
          data.referenceDate,

        updatedAt:
          new Date().toISOString(),
      }

    onSave(accountDetails)
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
          className={
            styles.header
          }
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
              <WalletCards
                size={24}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 id={titleId}>
                {initialValues
                  ? 'Editar saldo'
                  : 'Adicionar saldo'}
              </h2>
              <p id={descriptionId}>
                {initialValues
                  ? 'Atualize manualmente os dados da sua conta no '
                  : 'Informe manualmente os dados da sua conta no '}

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
          className={styles.form}
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
            <div>
              <label
                className={
                  styles.label
                }
                htmlFor="account-type"
              >
                Tipo de conta
              </label>

              <Controller
                name="accountType"
                control={control}
                render={({
                  field,
                  fieldState,
                }) => {
                  const selectedOption =
                    accountTypeOptions.find(
                      (
                        accountType,
                      ) =>
                        accountType.value ===
                        field.value,
                    ) ?? null

                  function handleAccountTypeChange(
                    option: SingleValue<AccountTypeOption>,
                  ): void {
                    field.onChange(
                      option?.value ??
                        '',
                    )
                  }

                  return (
                    <Select<
                      AccountTypeOption,
                      false
                    >
                      inputId="account-type"
                      instanceId="account-type-select"
                      name={
                        field.name
                      }
                      options={
                        accountTypeOptions
                      }
                      value={
                        selectedOption
                      }
                      onChange={
                        handleAccountTypeChange
                      }
                      onBlur={
                        field.onBlur
                      }
                      placeholder="Selecione o tipo da conta"
                      noOptionsMessage={() =>
                        'Nenhum tipo encontrado'
                      }
                      styles={
                        selectStyles
                      }
                      isSearchable
                      autoFocus
                      aria-invalid={
                        fieldState.invalid
                      }
                      aria-describedby={
                        fieldState.error
                          ? 'account-type-error'
                          : undefined
                      }
                    />
                  )
                }}
              />

              {errors.accountType ? (
                <span
                  id="account-type-error"
                  className={
                    styles.error
                  }
                  role="alert"
                >
                  {
                    errors
                      .accountType
                      .message
                  }
                </span>
              ) : null}
            </div>

            <TextField
              label="Apelido da conta"
              placeholder="Exemplo: Conta principal"
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

            <Controller
              name="balance"
              control={control}
              render={({
                field,
              }) => (
                <TextField
                  ref={field.ref}
                  name={field.name}
                  label="Saldo atual"
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                  autoComplete="off"
                  value={
                    field.value
                  }
                  error={
                    errors.balance
                      ?.message
                  }
                  onBlur={
                    field.onBlur
                  }
                  onChange={(
                    event,
                  ) => {
                    const formattedValue =
                      formatCurrencyInput(
                        event.target.value,
                      )

                    field.onChange(
                      formattedValue,
                    )
                  }}
                />
              )}
            />

            <div
              className={
                styles.dateField
              }
            >
              <div
                className={
                  styles.dateLabel
                }
              >
                <label
                  htmlFor="reference-date"
                >
                  Data de referência
                </label>

                <CalendarDays
                  size={17}
                  aria-hidden="true"
                />
              </div>

              <input
                id="reference-date"
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
                    ? 'reference-date-error'
                    : undefined
                }
                {...register(
                  'referenceDate',
                )}
              />

              {errors.referenceDate ? (
                <span
                  id="reference-date-error"
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

            <div
              className={
                styles.notice
              }
            >
              <Landmark
                size={19}
                aria-hidden="true"
              />

              <p>
                Informe apenas o saldo
                disponível. O Finance App
                não solicita agência,
                número da conta, senha
                bancária ou código de
                segurança.
              </p>
            </div>
          </div>

          <footer
            className={
              styles.footer
            }
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
              isLoading={isSubmitting}
            >
              <Save
                size={18}
                aria-hidden="true"
              />

              {initialValues
                ? 'Salvar alterações'
                : 'Salvar saldo'}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  )
}