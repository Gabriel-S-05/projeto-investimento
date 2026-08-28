import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { useState } from 'react'
import {
  Controller,
  useForm,
} from 'react-hook-form'
import { Link } from 'react-router-dom'
import Select, {
  type StylesConfig,
} from 'react-select'
import { z } from 'zod'

import { Button } from '../../../components/ui/Button/IndexButton'
import { PasswordField } from '../../../components/ui/PasswordField/PasswordField'
import { TextField } from '../../../components/ui/TextField/IndexTextField'
import { AuthLayout } from '../../../layouts/AuthLayout/AuthLayout'
import { routePaths } from '../../../routes/route-paths'
import {
  banks,
  type BankOption,
} from '../data/bank'

import styles from './AuthPages.module.css'

const credentialsSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(
        3,
        'Utilize pelo menos 3 caracteres.',
      )
      .max(
        30,
        'Utilize no máximo 30 caracteres.',
      )
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Utilize letras, números, ponto, hífen ou underline.',
      ),

    password: z
      .string()
      .min(
        8,
        'A senha precisa ter pelo menos 8 caracteres.',
      )
      .regex(
        /[A-Z]/,
        'Inclua pelo menos uma letra maiúscula.',
      )
      .regex(
        /[a-z]/,
        'Inclua pelo menos uma letra minúscula.',
      )
      .regex(
        /[0-9]/,
        'Inclua pelo menos um número.',
      ),

    passwordConfirmation: z
      .string()
      .min(
        1,
        'Confirme sua senha.',
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.passwordConfirmation,
    {
      message:
        'As senhas precisam ser iguais.',
      path: ['passwordConfirmation'],
    },
  )

const additionalDataSchema = z.object({
  email: z
    .string()
    .trim()
    .email(
      'Informe um e-mail válido.',
    ),

  banks: z
    .array(z.string())
    .min(
      1,
      'Selecione pelo menos um banco.',
    ),
})

type CredentialsFormData = z.infer<
  typeof credentialsSchema
>

type AdditionalDataFormData = z.infer<
  typeof additionalDataSchema
>

const bankSelectStyles: StylesConfig<
  BankOption,
  true
> = {
  control: (
    baseStyles,
    state,
  ) => ({
    ...baseStyles,
    minHeight: 48,
    padding: '2px 4px',
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
    gap: 4,
    padding: '3px 8px',
  }),

  placeholder: (
    baseStyles,
  ) => ({
    ...baseStyles,
    color:
      'var(--color-text-muted)',
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

  clearIndicator: (
    baseStyles,
  ) => ({
    ...baseStyles,
    color:
      'var(--color-text-muted)',
    cursor: 'pointer',

    '&:hover': {
      color:
        'var(--color-danger)',
    },
  }),

  menu: (
    baseStyles,
  ) => ({
    ...baseStyles,
    zIndex: 20,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor:
      'var(--color-surface)',
    border:
      '1px solid var(--color-border)',
    borderRadius:
      'var(--radius-md)',
    boxShadow:
      '0 18px 40px rgba(19, 51, 59, 0.16)',
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

  multiValue: (
    baseStyles,
  ) => ({
    ...baseStyles,
    overflow: 'hidden',
    margin: 2,
    backgroundColor:
      'var(--color-primary-50)',
    border:
      '1px solid var(--color-primary-200)',
    borderRadius:
      'var(--radius-sm)',
  }),

  multiValueLabel: (
    baseStyles,
  ) => ({
    ...baseStyles,
    padding: '4px 6px',
    color:
      'var(--color-primary-800)',
    fontSize: '0.82rem',
    fontWeight: 700,
  }),

  multiValueRemove: (
    baseStyles,
  ) => ({
    ...baseStyles,
    color:
      'var(--color-primary-700)',
    cursor: 'pointer',

    '&:hover': {
      color:
        'var(--color-danger)',
      backgroundColor:
        'var(--color-danger-soft)',
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

export function RegisterPage() {
  const [step, setStep] =
    useState<1 | 2>(1)

  const [
    credentials,
    setCredentials,
  ] = useState<
    CredentialsFormData | null
  >(null)

  const [
    isComplete,
    setIsComplete,
  ] = useState(false)

  const credentialsForm =
    useForm<CredentialsFormData>({
      resolver:
        zodResolver(
          credentialsSchema,
        ),

      defaultValues: {
        username: '',
        password: '',
        passwordConfirmation: '',
      },

      mode: 'onTouched',
    })

  const additionalDataForm =
    useForm<AdditionalDataFormData>({
      resolver:
        zodResolver(
          additionalDataSchema,
        ),

      defaultValues: {
        email: '',
        banks: [],
      },

      mode: 'onTouched',
    })

  function handleCredentials(
    data: CredentialsFormData,
  ): void {
    setCredentials(data)
    setStep(2)
  }

  async function handleAdditionalData(
    data: AdditionalDataFormData,
  ): Promise<void> {
    await new Promise<void>(
      (resolve) => {
        window.setTimeout(
          resolve,
          450,
        )
      },
    )

    /*
     * Fluxo exclusivamente visual.
     * Nenhuma senha é registrada no console.
     */
    console.log(
      'Cadastro apenas visual:',
      {
        username:
          credentials?.username,
        email: data.email,
        banks: data.banks,
      },
    )

    setIsComplete(true)
  }

  function handlePreviousStep(): void {
    setStep(1)
  }

  if (isComplete) {
    return (
      <AuthLayout>
        <header
          className={
            styles.header
          }
        >
          <CheckCircle2
            size={40}
            color="var(--color-primary-600)"
            aria-hidden="true"
          />

          <h2>
            Cadastro visual concluído
          </h2>

          <p>
            O formulário está
            funcionando. Nenhum dado foi
            enviado ao backend nesta
            etapa.
          </p>
        </header>

        <Link
          to={routePaths.login}
        >
          <Button fullWidth>
            Voltar para o login
          </Button>
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div
        className={
          styles.stepText
        }
      >
        <span>
          {step === 1
            ? 'Crie seu acesso'
            : 'Complete seu perfil'}
        </span>

        <span>
          Etapa {step} de 2
        </span>
      </div>

      <div
        className={styles.steps}
        aria-label={`Etapa ${step} de 2`}
      >
        <span
          className={[
            styles.step,
            styles.stepActive,
          ].join(' ')}
        />

        <span
          className={[
            styles.step,
            step === 2
              ? styles.stepActive
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </div>

      {step === 1 ? (
        <>
          <header
            className={
              styles.header
            }
          >
            <h2>
              Crie sua conta
            </h2>

            <p>
              Escolha um nome de
              usuário e uma senha
              segura.
            </p>
          </header>

          <form
            className={
              styles.form
            }
            onSubmit={
              credentialsForm
                .handleSubmit(
                  handleCredentials,
                )
            }
            noValidate
          >
            <TextField
              label="Nome de usuário"
              autoComplete="username"
              placeholder="Exemplo: gabriel.sousa"
              error={
                credentialsForm
                  .formState
                  .errors
                  .username
                  ?.message
              }
              {...credentialsForm.register(
                'username',
              )}
            />

            <PasswordField
              label="Senha"
              autoComplete="new-password"
              placeholder="Crie uma senha segura"
              hint="Mínimo de 8 caracteres, com maiúscula, minúscula e número."
              error={
                credentialsForm
                  .formState
                  .errors
                  .password
                  ?.message
              }
              {...credentialsForm.register(
                'password',
              )}
            />

            <PasswordField
              label="Confirme sua senha"
              autoComplete="new-password"
              placeholder="Digite a senha novamente"
              error={
                credentialsForm
                  .formState
                  .errors
                  .passwordConfirmation
                  ?.message
              }
              {...credentialsForm.register(
                'passwordConfirmation',
              )}
            />

            <Button
              type="submit"
              fullWidth
            >
              Continuar

              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </Button>
          </form>
        </>
      ) : (
        <>
          <header
            className={
              styles.header
            }
          >
            <h2>
              Últimos detalhes
            </h2>

            <p>
              Informe seu e-mail e
              selecione os bancos que
              você utiliza.
            </p>
          </header>

          <form
            className={
              styles.form
            }
            onSubmit={
              additionalDataForm
                .handleSubmit(
                  handleAdditionalData,
                )
            }
            noValidate
          >
            <TextField
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              error={
                additionalDataForm
                  .formState
                  .errors
                  .email
                  ?.message
              }
              {...additionalDataForm.register(
                'email',
              )}
            />

            <div
              className={
                styles.selectField
              }
            >
              <label
                className={
                  styles.label
                }
                htmlFor="banks"
              >
                Bancos que você utiliza
              </label>

              <Controller
                name="banks"
                control={
                  additionalDataForm.control
                }
                render={({
                  field,
                  fieldState,
                }) => {
                  const selectedBanks =
                    banks.filter(
                      (bank) =>
                        field.value.includes(
                          bank.value,
                        ),
                    )

                  return (
                    <Select<
                      BankOption,
                      true
                    >
                      inputId="banks"
                      instanceId="banks-select"
                      name={
                        field.name
                      }
                      options={banks}
                      value={
                        selectedBanks
                      }
                      onChange={(
                        selectedOptions,
                      ) => {
                        field.onChange(
                          selectedOptions.map(
                            (bank) =>
                              bank.value,
                          ),
                        )
                      }}
                      onBlur={
                        field.onBlur
                      }
                      placeholder="Pesquise e selecione seus bancos"
                      noOptionsMessage={() =>
                        'Nenhum banco encontrado'
                      }
                      loadingMessage={() =>
                        'Carregando bancos...'
                      }
                      styles={
                        bankSelectStyles
                      }
                      isMulti
                      isSearchable
                      isClearable
                      closeMenuOnSelect={
                        false
                      }
                      hideSelectedOptions
                      aria-invalid={
                        fieldState.invalid
                      }
                      aria-describedby={
                        fieldState.error
                          ? 'banks-error'
                          : undefined
                      }
                    />
                  )
                }}
              />

              {additionalDataForm
                .formState
                .errors
                .banks ? (
                <span
                  id="banks-error"
                  className={
                    styles.error
                  }
                  role="alert"
                >
                  {
                    additionalDataForm
                      .formState
                      .errors
                      .banks
                      .message
                  }
                </span>
              ) : null}
            </div>

            <div
              className={
                styles.actions
              }
            >
              <Button
                type="button"
                variant="ghost"
                onClick={
                  handlePreviousStep
                }
              >
                <ArrowLeft
                  size={18}
                  aria-hidden="true"
                />

                Voltar
              </Button>

              <Button
                type="submit"
                isLoading={
                  additionalDataForm
                    .formState
                    .isSubmitting
                }
              >
                Criar conta
              </Button>
            </div>
          </form>
        </>
      )}

      <p
        className={
          styles.footer
        }
      >
        Já possui uma conta?{' '}

        <Link
          to={routePaths.login}
        >
          Entrar
        </Link>
      </p>

      <p
        className={
          styles.securityNote
        }
      >
        A seleção dos bancos não
        solicita agência, conta, senha
        ou qualquer credencial
        bancária.
      </p>
    </AuthLayout>
  )
}