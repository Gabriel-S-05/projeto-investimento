import {
  ArrowRight,
  Building2,
  Plus,
  Trash2,
  WalletCards,
} from 'lucide-react'

import { Button } from '../../../components/ui/Button/IndexButton'
import { useBanks } from '../context/BanksContext'

import styles from './BankPage.module.css'

export function BanksPage() {
  const {
    selectedBanks,
    removeBank,
  } = useBanks()

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

        <Button type="button">
          <Plus
            size={18}
            aria-hidden="true"
          />
          Adicionar banco
        </Button>
      </header>

      {selectedBanks.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <WalletCards
              size={34}
              aria-hidden="true"
            />
          </div>

          <h2>Nenhum banco adicionado</h2>

          <p>
            Adicione as instituições que você utiliza para
            começar a organizar sua vida financeira.
          </p>

          <Button type="button">
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
            <article
              key={bank.value}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <div className={styles.bankIcon}>
                  <Building2
                    size={24}
                    aria-hidden="true"
                  />
                </div>

                <button
                  type="button"
                  className={styles.removeButton}
                  aria-label={`Remover ${bank.label}`}
                  title={`Remover ${bank.label}`}
                  onClick={() => removeBank(bank.value)}
                >
                  <Trash2
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className={styles.cardContent}>
                <span className={styles.cardEyebrow}>
                  Instituição financeira
                </span>

                <h2>{bank.label}</h2>

                <p>
                  Dados ainda não informados.
                </p>
              </div>

              <button
                type="button"
                className={styles.detailsButton}
              >
                Ver detalhes

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </button>
            </article>
          ))}

          <button
            type="button"
            className={styles.addCard}
          >
            <span className={styles.addCardIcon}>
              <Plus
                size={26}
                aria-hidden="true"
              />
            </span>

            <strong>Adicionar banco</strong>

            <span>
              Inclua outra instituição na sua organização.
            </span>
          </button>
        </section>
      )}
    </main>
  )
}