import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
} from 'react'
import {
  Eye,
  EyeOff,
} from 'lucide-react'

import styles from './PasswordField.module.css'

interface PasswordFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type'
  > {
  label: string
  error?: string
  hint?: string
}

export const PasswordField = forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(function PasswordField(
  {
    label,
    error,
    hint,
    id,
    className = '',
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false)

  const inputId = id ?? generatedId

  const descriptionId = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined

  function togglePasswordVisibility(): void {
    setIsPasswordVisible((currentValue) => !currentValue)
  }

  return (
    <div className={styles.field}>
      <label
        className={styles.label}
        htmlFor={inputId}
      >
        {label}
      </label>

      <div className={styles.inputWrapper}>
        <input
          ref={ref}
          id={inputId}
          type={isPasswordVisible ? 'text' : 'password'}
          className={[
            styles.input,
            error ? styles.inputError : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          {...props}
        />

        <button
          type="button"
          className={styles.visibilityButton}
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={
            isPasswordVisible
              ? 'Ocultar senha'
              : 'Mostrar senha'
          }
          aria-pressed={isPasswordVisible}
          title={
            isPasswordVisible
              ? 'Ocultar senha'
              : 'Mostrar senha'
          }
        >
          {isPasswordVisible ? (
            <Eye
              size={19}
              aria-hidden="true"
            />
          ) : (
            <EyeOff
              size={19}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {error ? (
        <span
          id={descriptionId}
          className={styles.error}
          role="alert"
        >
          {error}
        </span>
      ) : hint ? (
        <span
          id={descriptionId}
          className={styles.hint}
        >
          {hint}
        </span>
      ) : null}
    </div>
  )
})