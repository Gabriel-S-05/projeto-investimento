import {
  useCallback,
  useState,
} from 'react'
import {
  Plus,
  WalletCards,
} from 'lucide-react'

import { Button } from '../../../components/ui/Button/IndexButton'
import { AddBankModal } from '../components/AddBankModal/IndexAddBankModal'
import { BankCard } from '../components/BankCard/IndexBankCard'
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

  const handleViewDetails =
    useCallback(
      (bank: BankOption): void => {
        console.log(
          'Ver detalhes da instituição:',
          bank.value,
        )
      },
      [],
    )

  const hasSelectedBanks =
    selectedBanks.length > 0

  const hasAvailableBanks =
    availableBanks.length > 0

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

        {hasSelectedBanks &&
        hasAvailableBanks ? (
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

      {!hasSelectedBanks ? (
        <section
          className={styles.emptyState}
          aria-labelledby="empty-banks-title"
        >
          <div className={styles.emptyIcon}>
            <WalletCards
              size={34}
              aria-hidden="true"
            />
          </div>

          <h2 id="empty-banks-title">
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
          {selectedBanks.map((bank) => (
            <BankCard
              key={bank.value}
              bank={bank}
              holderName="Finance App"
              onViewDetails={
                handleViewDetails
              }
              onRequestRemove={
                openRemoveBankModal
              }
            />
          ))}

          {hasAvailableBanks ? (
            <button
              type="button"
              className={styles.addCard}
              onClick={openAddBankModal}
              aria-label="Adicionar outra instituição"
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
                Inclua outra instituição na sua organização.
              </span>
            </button>
          ) : null}
        </section>
      )}

      <AddBankModal
        isOpen={isAddBankModalOpen}
        availableBanks={availableBanks}
        onClose={closeAddBankModal}
        onAddBanks={handleAddBanks}
      />

      <RemoveBankModal
        isOpen={bankToRemove !== null}
        bank={bankToRemove}
        onClose={closeRemoveBankModal}
        onConfirm={handleConfirmRemove}
      />
    </main>
  )
}