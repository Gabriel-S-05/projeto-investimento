import {
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import {
  Building2,
  Plus,
  X,
} from 'lucide-react'
import Select, {
  type MultiValue,
  type StylesConfig,
} from 'react-select'

import { Button } from '../../../../components/ui/Button/IndexButton'
import {
  type BankOption,
} from '../../data/bank'

import styles from './AddBankModal.module.css'

interface AddBankModalProps {
  isOpen: boolean
  availableBanks: BankOption[]
  onClose: () => void
  onAddBanks: (
    bankIds: string[],
  ) => void
}

const bankSelectStyles: StylesConfig<
  BankOption,
  true
> = {
  control: (
    baseStyles,
    state,
  ) => ({
    ...baseStyles,
    minHeight: 50,
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
    cursor: 'text',
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
    zIndex: 100,
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
    maxHeight: 230,
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

export function AddBankModal({
  isOpen,
  availableBanks,
  onClose,
  onAddBanks,
}: AddBankModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  const [
    selectedBanks,
    setSelectedBanks,
  ] = useState<BankOption[]>([])

  const availableBankOptions =
    useMemo(
      () => availableBanks,
      [availableBanks],
    )

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
      setSelectedBanks([])
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  function handleSelectionChange(
    options: MultiValue<BankOption>,
  ): void {
    setSelectedBanks([
      ...options,
    ])
  }

  function handleAdd(): void {
    if (
      selectedBanks.length === 0
    ) {
      return
    }

    onAddBanks(
      selectedBanks.map(
        (bank) => bank.value,
      ),
    )

    setSelectedBanks([])
    onClose()
  }

  function handleOverlayClick(
    event:
      React.MouseEvent<HTMLDivElement>,
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose()
    }
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
              <Building2
                size={23}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 id={titleId}>
                Adicionar bancos
              </h2>

              <p id={descriptionId}>
                Selecione uma ou mais
                instituições para exibir
                no painel.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={
              styles.closeButton
            }
            onClick={onClose}
            aria-label="Fechar janela"
            title="Fechar"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </header>

        <div
          className={
            styles.content
          }
        >
          {availableBankOptions.length >
          0 ? (
            <>
              <label
                className={
                  styles.label
                }
                htmlFor="add-banks"
              >
                Instituições disponíveis
              </label>

              <Select<
                BankOption,
                true
              >
                inputId="add-banks"
                instanceId="add-banks-select"
                options={
                  availableBankOptions
                }
                value={
                  selectedBanks
                }
                onChange={
                  handleSelectionChange
                }
                placeholder="Pesquise e selecione os bancos"
                noOptionsMessage={() =>
                  'Nenhuma instituição encontrada'
                }
                styles={
                  bankSelectStyles
                }
                isMulti
                isSearchable
                isClearable
                autoFocus
                closeMenuOnSelect={
                  false
                }
                hideSelectedOptions
              />

              <p
                className={
                  styles.helperText
                }
              >
                Apenas instituições
                ainda não adicionadas
                aparecem nesta lista.
              </p>

              {selectedBanks.length >
              0 ? (
                <p
                  className={
                    styles.selectionCount
                  }
                  role="status"
                >
                  {
                    selectedBanks.length
                  }{' '}
                  {selectedBanks.length ===
                  1
                    ? 'instituição selecionada'
                    : 'instituições selecionadas'}
                </p>
              ) : null}
            </>
          ) : (
            <div
              className={
                styles.finishedState
              }
            >
              <Building2
                size={32}
                aria-hidden="true"
              />

              <h3>
                Todas as instituições
                foram adicionadas
              </h3>

              <p>
                Não há outros bancos
                disponíveis na lista
                neste momento.
              </p>
            </div>
          )}
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
            type="button"
            disabled={
              selectedBanks.length ===
                0 ||
              availableBankOptions.length ===
                0
            }
            onClick={handleAdd}
          >
            <Plus
              size={18}
              aria-hidden="true"
            />

            Adicionar{' '}
            {selectedBanks.length >
            0
              ? `(${selectedBanks.length})`
              : ''}
          </Button>
        </footer>
      </section>
    </div>
  )
}
``