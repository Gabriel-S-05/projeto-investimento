import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '../../../components/ui/Button/IndexButton'
import { TextField } from '../../../components/ui/TextField/IndexTextField'
import { AuthLayout } from '../../../layouts/AuthLayout/AuthLayout'
import { routePaths } from '../../../routes/route-paths'

import styles from './AuthPages.module.css'

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Informe pelo menos 3 caracteres.'),

  password: z
    .string()
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function handleLogin(
    data: LoginFormData,
  ): Promise<void> {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 400)
    })

    console.log('Login apenas visual:', {
      username: data.username,
    })

    setMessage(
      'Frontend validado. A autenticação com o servidor será implementada na próxima etapa.',
    )
  }

  return (
    <AuthLayout>
      <header className={styles.header}>
        <h2>Boas-vindas de volta</h2>

        <p>
          Entre para acompanhar sua organização financeira.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={handleSubmit(handleLogin)}
        noValidate
      >
        <TextField
          label="Nome de usuário"
          autoComplete="username"
          placeholder="Digite seu usuário"
          error={errors.username?.message}
          {...register('username')}
        />

        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className={styles.passwordRow}>
          <button
            type="button"
            className={styles.textButton}
          >
            Esqueci minha senha
          </button>
        </div>

        {message ? (
          <div
            className={styles.success}
            role="status"
          >
            {message}
          </div>
        ) : null}

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
        >
          <LogIn
            size={18}
            aria-hidden="true"
          />
          Entrar
        </Button>
      </form>

      <div className={styles.divider}>
        ou
      </div>

      <Link to={routePaths.register}>
        <Button
          type="button"
          variant="secondary"
          fullWidth
        >
          Criar minha conta
          <ArrowRight
            size={18}
            aria-hidden="true"
          />
        </Button>
      </Link>

      <p className={styles.securityNote}>
        Nunca solicitaremos a senha da sua conta bancária.
      </p>
    </AuthLayout>
  )
}