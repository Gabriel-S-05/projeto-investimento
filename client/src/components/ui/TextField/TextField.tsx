import {
  forwardRef,
  type InputHTMLAttributes,
} from 'react'

import styles from './TextField.module.css'

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const TextField = forwardRef<
  HTMLInputElement,
  TextFieldProps
>(function TextField(
  {
    label,
    error,
    hint,
    id,
    className = '',
    ...props
  },
  ref,
) {
  const inputId =
    id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`

  const descriptionId = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined

  return (
    <div className={styles.field}>
      <label
        className={styles.label}
        htmlFor={inputId}
      >
        {label}
      </label>

      <input
        ref={ref}
        id={inputId}
        className={[
          styles.input,
          error ? styles.inputError : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        {...props}
      />

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