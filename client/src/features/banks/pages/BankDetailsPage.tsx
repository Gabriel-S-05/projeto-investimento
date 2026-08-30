import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Banknote,
  ChartLine,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Plus,
  ReceiptText,
  WalletCards,
} from 'lucide-react'
import {
  Link,
  Navigate,
  useParams,
} from 'react-router-dom'

import { Button } from '../../../components/ui/Button/IndexButton'
import { routePaths } from '../../../routes/route-paths'
import { BankCard } from '../components/BankCard/IndexBankCard'
import { useBanks } from '../context/BanksContext'

import styles from './BankDetailsPage.module.css'

type DetailsSection =
  | 'balance'
  | 'income'
  | 'cards'
  | 'installments'
  | 'investments'

interface EmptySectionProps {
  icon: ReactNode
  title: string
  description: string
  buttonLabel: string
  onAction: () => void
}

function EmptySection({
  icon,
  title,
  description,
  buttonLabel,
  onAction,
}: EmptySectionProps) {
  return (
    <section className={styles.emptySection}>
      <div className={styles.emptySectionIcon}>
        {icon}
      </div>

      <div className={styles.emptySectionContent}>
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={onAction}
      >
        <Plus
          size={18}
          aria-hidden="true"
        />

        {buttonLabel}
      </Button>
    </section>
  )
}

export function BankDetailsPage() {
  const { bankId } = useParams<{
    bankId: string
  }>()

  const { selectedBanks } = useBanks()

  const bank = selectedBanks.find(
    (selectedBank) =>
      selectedBank.value === bankId,
  )

  if (!bankId || !bank) {
    return (
      <Navigate
        to={routePaths.banks}
        replace
      />
    )
  }

  function handleTemporaryAction(
    section: DetailsSection,
  ): void {
    console.log(
      'Ação visual da instituição:',
      {
        bankId,
        section,
      },
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link
          to={routePaths.banks}
          className={styles.backLink}
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Voltar para meus bancos
        </Link>

        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Detalhes da instituição
            </span>

            <h1>{bank.label}</h1>

            <p>
              Organize o saldo, os recebimentos, os cartões,
              as parcelas e os investimentos vinculados a
              esta instituição.
            </p>
          </div>

          <span className={styles.frontendBadge}>
            Protótipo frontend
          </span>
        </header>

        <section className={styles.hero}>
          <div className={styles.bankCardWrapper}>
            <BankCard
              bank={bank}
              holderName="Minha conta"
              showRemoveButton={false}
              showDetailsAction={false}
              showStatus={false}
            />
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryHeader}>
              <div>
                <span className={styles.summaryEyebrow}>
                  Resumo financeiro
                </span>

                <h2>Visão geral</h2>
              </div>

              <Landmark
                size={24}
                aria-hidden="true"
              />
            </div>

            <div className={styles.summaryGrid}>
              <article className={styles.summaryItem}>
                <span>Saldo atual</span>
                <strong>Não informado</strong>
              </article>

              <article className={styles.summaryItem}>
                <span>Entradas mensais</span>
                <strong>Não informado</strong>
              </article>

              <article className={styles.summaryItem}>
                <span>Fatura atual</span>
                <strong>Não informado</strong>
              </article>

              <article className={styles.summaryItem}>
                <span>Total investido</span>
                <strong>Não informado</strong>
              </article>
            </div>

            <Button
              type="button"
              fullWidth
              onClick={() => {
                handleTemporaryAction('balance')
              }}
            >
              <Plus
                size={18}
                aria-hidden="true"
              />

              Adicionar saldo atual
            </Button>
          </div>
        </section>

        <section
          className={styles.content}
          aria-labelledby="financial-information-title"
        >
          <header className={styles.contentHeader}>
            <div>
              <span className={styles.eyebrow}>
                Organização financeira
              </span>

              <h2 id="financial-information-title">
                Informações da instituição
              </h2>

              <p>
                Preencha cada seção no seu ritmo. Nenhuma
                informação financeira é obrigatória neste
                protótipo.
              </p>
            </div>
          </header>

          <div className={styles.sections}>
            <EmptySection
              icon={
                <Banknote
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Saldo e conta"
              description="Informe o saldo atual e o tipo de conta que você possui nesta instituição."
              buttonLabel="Adicionar saldo"
              onAction={() => {
                handleTemporaryAction('balance')
              }}
            />

            <EmptySection
              icon={
                <CircleDollarSign
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Recebimentos"
              description="Informe salários, freelances ou outras entradas recebidas nesta instituição."
              buttonLabel="Adicionar recebimento"
              onAction={() => {
                handleTemporaryAction('income')
              }}
            />

            <EmptySection
              icon={
                <CreditCard
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Cartões"
              description="Cadastre apelido, limite, fechamento e vencimento dos seus cartões."
              buttonLabel="Adicionar cartão"
              onAction={() => {
                handleTemporaryAction('cards')
              }}
            />

            <EmptySection
              icon={
                <ReceiptText
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Parcelas"
              description="Organize compras parceladas e acompanhe os próximos vencimentos."
              buttonLabel="Adicionar parcela"
              onAction={() => {
                handleTemporaryAction('installments')
              }}
            />

            <EmptySection
              icon={
                <ChartLine
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Investimentos"
              description="Registre os investimentos mantidos nesta instituição e seus valores atuais."
              buttonLabel="Adicionar investimento"
              onAction={() => {
                handleTemporaryAction('investments')
              }}
            />
          </div>
        </section>

        <aside className={styles.securityNotice}>
          <WalletCards
            size={23}
            aria-hidden="true"
          />

          <div>
            <strong>
              Não precisamos de credenciais bancárias
            </strong>

            <p>
              O Finance App não solicitará número completo
              de cartão, CVV, senha bancária ou código de
              segurança.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}