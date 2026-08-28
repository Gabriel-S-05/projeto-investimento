import {
  useEffect,
  useId,
  type MouseEvent,
} from 'react'
import {
  AlertTriangle,
  Trash2,
  X,
} from 'lucide-react'

import { Button } from '../../../../components/ui/Button/IndexButton'
import type { BankOption } from '../../data/bank'

import styles from './RemoveBankModal.module.css'

interface RemoveBankModalProps {
  isOpen: boolean
  bank: BankOption | null
  onClose: () => void
  onConfirm: (
    bankId: string,
  ) => void
}

export function RemoveBankModal({
  isOpen,
  bank,
  onClose,
  onConfirm,
}: RemoveBankModalProps) {
  const titleId = useId()
  const descriptionId = useId()

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

  if (!isOpen || !bank) {
    return null
  }

  const selectedBank = bank

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

  function handleConfirm(): void {
    onConfirm(selectedBank.value)
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={handleOverlayClick}
    >
      <section
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className={styles.header}>
          <div className={styles.warningIcon}>
            <AlertTriangle
              size={25}
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar confirmação"
            title="Fechar"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className={styles.content}>
          <h2 id={titleId}>
            Remover {bank.label}?
          </h2>

          <p id={descriptionId}>
            A instituição deixará de aparecer no seu painel
            e será removida da sua seleção de bancos.
          </p>

          <div className={styles.warning}>
            <AlertTriangle
              size={18}
              aria-hidden="true"
            />

            <span>
              Neste protótipo, apenas a seleção armazenada no
              navegador será removida.
            </span>
          </div>
        </div>

        <footer className={styles.footer}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            autoFocus
          >
            Cancelar
          </Button>

          <button
            type="button"
            className={styles.removeButton}
            onClick={handleConfirm}
          >
            <Trash2
              size={18}
              aria-hidden="true"
            />

            Remover banco
          </button>
        </footer>
      </section>
    </div>
  )
}