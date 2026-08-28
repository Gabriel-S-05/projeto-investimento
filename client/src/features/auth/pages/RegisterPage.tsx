import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '../../../components/ui/Button/IndexButton'
import { TextField } from '../../../components/ui/TextField/IndexTextField'
import { AuthLayout } from '../../../layouts/AuthLayout/AuthLayout'
import { routePaths } from '../../../routes/route-paths'
import { banks } from '../../../features/auth/data/bank'

import styles from './AuthPages.module.css'

const credentialsSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Utilize pelo menos 3 caracteres.')
      .max(30, 'Utilize no máximo 30 caracteres.')
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Utilize letras, números, ponto, hífen ou underline.',
      ),

    password: z
      .string()
      .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
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

    passwordConfirmation: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.passwordConfirmation,
    {
      message: 'As senhas precisam ser iguais.',
      path: ['passwordConfirmation'],
    },
  )

const additionalDataSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Informe um e-mail válido.'),

  bank: z
    .string()
    .min(1, 'Selecione seu banco principal.'),
})

type CredentialsFormData = z.infer<
  typeof credentialsSchema
>

type AdditionalDataFormData = z.infer<
  typeof additionalDataSchema
>

export function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [credentials, setCredentials] =
    useState<CredentialsFormData | null>(null)
  const [isComplete, setIsComplete] =
    useState(false)

  const credentialsForm =
    useForm<CredentialsFormData>({
      resolver: zodResolver(credentialsSchema),
      defaultValues: {
        username: '',
        password: '',
        passwordConfirmation: '',
      },
    })

  const additionalDataForm =
    useForm<AdditionalDataFormData>({
      resolver: zodResolver(additionalDataSchema),
      defaultValues: {
        email: '',
        bank: '',
      },
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
    await new Promise((resolve) => {
      window.setTimeout(resolve, 450)
    })

    console.log('Cadastro apenas visual:', {
      username: credentials?.username,
      email: data.email,
      bank: data.bank,
    })

    setIsComplete(true)
  }

  if (isComplete) {
    return (
      <AuthLayout>
        <header className={styles.header}>
          <CheckCircle2
            size={40}
            color="var(--color-primary-600)"
            aria-hidden="true"
          />

          <h2>Cadastro visual concluído</h2>

          <p>
            O formulário está funcionando. Nenhum dado foi
            enviado ao backend nesta etapa.
          </p>
        </header>

        <Link to={routePaths.login}>
          <Button fullWidth>
            Voltar para o login
          </Button>
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className={styles.stepText}>
        <span>
          {step === 1
            ? 'Crie seu acesso'
            : 'Complete seu perfil'}
        </span>

        <span>Etapa {step} de 2</span>
      </div>

      <div
        className={styles.steps}
        aria-label={`Etapa ${step} de 2`}
      >
        <span
          className={`${styles.step} ${styles.stepActive}`}
        />

        <span
          className={`${styles.step} ${
            step === 2 ? styles.stepActive : ''
          }`}
        />
      </div>

      {step === 1 ? (
        <>
          <header className={styles.header}>
            <h2>Crie sua conta</h2>

            <p>
              Escolha um nome de usuário e uma senha segura.
            </p>
          </header>

          <form
            className={styles.form}
            onSubmit={credentialsForm.handleSubmit(
              handleCredentials,
            )}
            noValidate
          >
            <TextField
              label="Nome de usuário"
              autoComplete="username"
              placeholder="Exemplo: gabriel.sousa"
              error={
                credentialsForm.formState.errors.username
                  ?.message
              }
              {...credentialsForm.register('username')}
            />

            <TextField
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="Crie uma senha segura"
              hint="Mínimo de 8 caracteres, com maiúscula, minúscula e número."
              error={
                credentialsForm.formState.errors.password
                  ?.message
              }
              {...credentialsForm.register('password')}
            />

            <TextField
              label="Confirme sua senha"
              type="password"
              autoComplete="new-password"
              placeholder="Digite a senha novamente"
              error={
                credentialsForm.formState.errors
                  .passwordConfirmation?.message
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
          <header className={styles.header}>
            <h2>Últimos detalhes</h2>

            <p>
              Informe seu e-mail e selecione a instituição
              que mais utiliza.
            </p>
          </header>

          <form
            className={styles.form}
            onSubmit={additionalDataForm.handleSubmit(
              handleAdditionalData,
            )}
            noValidate
          >
            <TextField
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              error={
                additionalDataForm.formState.errors.email
                  ?.message
              }
              {...additionalDataForm.register('email')}
            />

            <div className={styles.selectField}>
              <label
                className={styles.label}
                htmlFor="bank"
              >
                Banco principal
              </label>

              <select
                id="bank"
                className={styles.select}
                aria-invalid={Boolean(
                  additionalDataForm.formState.errors.bank,
                )}
                {...additionalDataForm.register('bank')}
              >
                <option value="">
                  Selecione uma instituição
                </option>

                {banks.map((bank) => (
                  <option
                    key={bank}
                    value={bank}
                  >
                    {bank}
                  </option>
                ))}
              </select>

              {additionalDataForm.formState.errors.bank ? (
                <span
                  className={styles.error}
                  role="alert"
                >
                  {
                    additionalDataForm.formState.errors.bank
                      .message
                  }
                </span>
              ) : null}
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
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
                  additionalDataForm.formState.isSubmitting
                }
              >
                Criar conta
              </Button>
            </div>
          </form>
        </>
      )}

      <p className={styles.footer}>
        Já possui uma conta?{' '}
        <Link to={routePaths.login}>
          Entrar
        </Link>
      </p>

      <p className={styles.securityNote}>
        A seleção do banco não solicita agência, conta,
        senha ou qualquer credencial bancária.
      </p>
    </AuthLayout>
  )
}