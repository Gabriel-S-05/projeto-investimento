import {
  useCallback,
  useState,
} from 'react'
import {
  ArrowRight,
  Building2,
  Plus,
  Trash2,
  WalletCards,
} from 'lucide-react'

import { Button } from '../../../components/ui/Button/IndexButton'
import { AddBankModal } from '../components/AddBankModal/IndexAddBankModal'
import { RemoveBankModal } from '../components/RemoveBankModal/IndexRemoveBankModal'
import { useBanks } from '../context/BanksContext'
import type { BankOption } from '../data/bank'

import styles from './BankPage.module.css'

export function BanksPage() {
  const [
    isAddBankModalOpen,
    setIsAddBankModalOpen,
  ] = useState(false)

  const [
    bankToRemove,
    setBankToRemove,
  ] = useState<BankOption | null>(
    null,
  )

  const {
    selectedBanks,
    availableBanks,
    addBanks,
    removeBank,
  } = useBanks()

  const openAddBankModal =
    useCallback((): void => {
      setIsAddBankModalOpen(true)
    }, [])

  const closeAddBankModal =
    useCallback((): void => {
      setIsAddBankModalOpen(false)
    }, [])

  const handleAddBanks =
    useCallback(
      (bankIds: string[]): void => {
        addBanks(bankIds)
      },
      [addBanks],
    )

  const openRemoveBankModal =
    useCallback(
      (bank: BankOption): void => {
        setBankToRemove(bank)
      },
      [],
    )

  const closeRemoveBankModal =
    useCallback((): void => {
      setBankToRemove(null)
    }, [])

  const handleConfirmRemove =
    useCallback(
      (bankId: string): void => {
        removeBank(bankId)
        setBankToRemove(null)
      },
      [removeBank],
    )

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Finance App
          </span>

          <h1>
            Meus bancos e instituições
          </h1>

          <p>
            Gerencie as instituições que fazem parte da sua
            organização financeira.
          </p>
        </div>

        {selectedBanks.length > 0 &&
        availableBanks.length > 0 ? (
          <Button
            type="button"
            onClick={openAddBankModal}
          >
            <Plus
              size={18}
              aria-hidden="true"
            />

            Adicionar banco
          </Button>
        ) : null}
      </header>

      {selectedBanks.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <WalletCards
              size={34}
              aria-hidden="true"
            />
          </div>

          <h2>
            Nenhum banco adicionado
          </h2>

          <p>
            Adicione as instituições que você utiliza para
            começar a organizar sua vida financeira.
          </p>

          <Button
            type="button"
            onClick={openAddBankModal}
          >
            <Plus
              size={18}
              aria-hidden="true"
            />

            Adicionar primeiro banco
          </Button>
        </section>
      ) : (
        <section
          className={styles.grid}
          aria-label="Instituições adicionadas"
        >
          {selectedBanks.map(
            (bank) => (
              <article
                key={bank.value}
                className={styles.card}
              >
                <div
                  className={
                    styles.cardHeader
                  }
                >
                  <div
                    className={
                      styles.bankIcon
                    }
                  >
                    <Building2
                      size={24}
                      aria-hidden="true"
                    />
                  </div>

                  <button
                    type="button"
                    className={
                      styles.removeButton
                    }
                    aria-label={`Remover ${bank.label}`}
                    title={`Remover ${bank.label}`}
                    onClick={() => {
                      openRemoveBankModal(
                        bank,
                      )
                    }}
                  >
                    <Trash2
                      size={18}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div
                  className={
                    styles.cardContent
                  }
                >
                  <span
                    className={
                      styles.cardEyebrow
                    }
                  >
                    Instituição financeira
                  </span>

                  <h2>
                    {bank.label}
                  </h2>

                  <p>
                    Dados ainda não
                    informados.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    styles.detailsButton
                  }
                  aria-label={`Ver detalhes de ${bank.label}`}
                >
                  Ver detalhes

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              </article>
            ),
          )}

          {availableBanks.length > 0 ? (
            <button
              type="button"
              className={styles.addCard}
              onClick={openAddBankModal}
            >
              <span
                className={
                  styles.addCardIcon
                }
              >
                <Plus
                  size={26}
                  aria-hidden="true"
                />
              </span>

              <strong>
                Adicionar banco
              </strong>

              <span>
                Inclua outra instituição
                na sua organização.
              </span>
            </button>
          ) : null}
        </section>
      )}

      <AddBankModal
        isOpen={
          isAddBankModalOpen
        }
        availableBanks={
          availableBanks
        }
        onClose={
          closeAddBankModal
        }
        onAddBanks={
          handleAddBanks
        }
      />

      <RemoveBankModal
        isOpen={
          bankToRemove !== null
        }
        bank={bankToRemove}
        onClose={
          closeRemoveBankModal
        }
        onConfirm={
          handleConfirmRemove
        }
      />
    </main>
  )
}