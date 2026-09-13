import {
  useCallback,
  useState,
  type ReactNode,
} from 'react'
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
import { CreditCardForm } from '../../cards/components/CreditCardForm/IndexCreditCardForm'
import { useCreditCards } from '../../cards/context/CreditCardsContext'
import type { CreditCardFormValues } from '../../cards/types/credit-card'
import { IncomeForm } from '../../income/components/IncomeForm/IndexIncomeForm'
import { useIncome } from '../../income/context/IncomeContext'
import type { IncomeFormValues } from '../../income/types/income'
import { InstallmentForm } from '../../installments/components/InstallmentForm/IndexInstallmentForm'
import { useInstallments } from '../../installments/context/InstallmentsContext'
import type { InstallmentFormValues } from '../../installments/types/installment'
import { InvestmentForm } from '../../investments/components/InvestmentForm/IndexInvestForm'
import { useInvestments } from '../../investments/context/InvestmentsContext'
import type { InvestmentFormValues } from '../../investments/types/investment'
import { AddBalanceModal } from '../components/AddBalanceModal/IndexAddBalanceModal'
import { BankCard } from '../components/BankCard/IndexBankCard'
import { useBankDetails } from '../context/BankDetailsContext'
import { useBanks } from '../context/BanksContext'
import type { BankAccountDetails } from '../types/bank-details'

import styles from './BankDetailsPage.module.css'

interface EmptySectionProps {
  icon: ReactNode
  title: string
  description: string
  buttonLabel: string
  onAction: () => void
}

function formatReferenceDate(
  date: string,
): string {
  const [
    year,
    month,
    day,
  ] = date.split('-')

  if (
    !year ||
    !month ||
    !day
  ) {
    return date
  }

  return `${day}/${month}/${year}`
}

function formatCurrency(
  valueInCents: number,
): string {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(
    valueInCents / 100,
  )
}

function formatSignedCurrency(
  valueInCents: number,
): string {
  const formattedValue =
    formatCurrency(
      valueInCents,
    )

  if (valueInCents > 0) {
    return `+${formattedValue}`
  }

  return formattedValue
}

function formatPercentage(
  value: number,
): string {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value)
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
        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>
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
  const [
    isAddBalanceModalOpen,
    setIsAddBalanceModalOpen,
  ] = useState(false)

  const [
    isIncomeFormOpen,
    setIsIncomeFormOpen,
  ] = useState(false)

  const [
    isCreditCardFormOpen,
    setIsCreditCardFormOpen,
  ] = useState(false)

  const [
    isInstallmentFormOpen,
    setIsInstallmentFormOpen,
  ] = useState(false)

  const [
    isInvestmentFormOpen,
    setIsInvestmentFormOpen,
  ] = useState(false)

  const {
    bankId,
  } = useParams<{
    bankId: string
  }>()

  const {
    selectedBanks,
  } = useBanks()

  const {
    getAccountDetails,
    saveAccountDetails,
  } = useBankDetails()

  const {
    getIncomeSources,
    getEstimatedMonthlyIncomeInCents,
    addIncomeSource,
  } = useIncome()

  const {
    getCreditCards,
    getCurrentInvoiceInCents,
    addCreditCard,
  } = useCreditCards()

  const {
    getInstallments,
    getMonthlyCommitmentInCents,
    addInstallment,
  } = useInstallments()

  const {
    getInvestments,
    getActiveInvestments,
    getTotalCurrentAmountInCents,
    getInvestmentSummary,
    addInvestment,
  } = useInvestments()

  const bank =
    selectedBanks.find(
      (selectedBank) =>
        selectedBank.value ===
        bankId,
    )

  const accountDetails =
    bankId
      ? getAccountDetails(
          bankId,
        )
      : null

  const incomeSources =
    bankId
      ? getIncomeSources(
          bankId,
        )
      : []

  const monthlyIncomeInCents =
    bankId
      ? getEstimatedMonthlyIncomeInCents(
          bankId,
        )
      : 0

  const creditCards =
    bankId
      ? getCreditCards(
          bankId,
        )
      : []

  const currentInvoiceInCents =
    bankId
      ? getCurrentInvoiceInCents(
          bankId,
        )
      : 0

  const installments =
    bankId
      ? getInstallments(
          bankId,
        )
      : []

  const monthlyInstallmentCommitmentInCents =
    bankId
      ? getMonthlyCommitmentInCents(
          bankId,
        )
      : 0

  const activeInstallments =
    installments.filter(
      (installment) =>
        installment.status ===
        'active',
    )

  const investments =
    bankId
      ? getInvestments(
          bankId,
        )
      : []

  const activeInvestments =
    bankId
      ? getActiveInvestments(
          bankId,
        )
      : []

  const totalCurrentInvestmentInCents =
    bankId
      ? getTotalCurrentAmountInCents(
          bankId,
        )
      : 0

  const investmentSummary =
    bankId
      ? getInvestmentSummary(
          bankId,
        )
      : {
          investedAmountInCents:
            0,

          currentAmountInCents:
            0,

          resultInCents:
            0,

          returnPercentage:
            0,
        }

  const hasCreditCard =
    creditCards.some(
      (card) =>
        card.type === 'credit' ||
        card.type === 'multiple',
    )

  const creditCardsDescription =
    creditCards.length > 0
      ? `${creditCards.length} ${
          creditCards.length === 1
            ? 'cartão cadastrado'
            : 'cartões cadastrados'
        } nesta instituição.`
      : 'Cadastre apelido, limite, fechamento e vencimento dos seus cartões.'

  const installmentsDescription =
    installments.length === 0
      ? 'Organize compras parceladas e acompanhe os próximos vencimentos.'
      : activeInstallments.length > 0
        ? `${installments.length} ${
            installments.length === 1
              ? 'compra parcelada cadastrada'
              : 'compras parceladas cadastradas'
          }. Compromisso mensal estimado: ${formatCurrency(
            monthlyInstallmentCommitmentInCents,
          )}.`
        : `${installments.length} ${
            installments.length === 1
              ? 'compra parcelada cadastrada'
              : 'compras parceladas cadastradas'
          }, sem parcelamentos ativos no momento.`

  const investmentsDescription =
    investments.length === 0
      ? 'Registre os investimentos mantidos nesta instituição e seus valores atuais.'
      : activeInvestments.length === 0
        ? `${investments.length} ${
            investments.length === 1
              ? 'investimento cadastrado'
              : 'investimentos cadastrados'
          }, sem investimentos ativos no momento.`
        : `${investments.length} ${
            investments.length === 1
              ? 'investimento cadastrado'
              : 'investimentos cadastrados'
          }. Aplicado: ${formatCurrency(
            investmentSummary
              .investedAmountInCents,
          )}. Resultado: ${formatSignedCurrency(
            investmentSummary
              .resultInCents,
          )} (${formatPercentage(
            investmentSummary
              .returnPercentage,
          )}%).`

  const openAddBalanceModal =
    useCallback((): void => {
      setIsAddBalanceModalOpen(
        true,
      )
    }, [])

  const closeAddBalanceModal =
    useCallback((): void => {
      setIsAddBalanceModalOpen(
        false,
      )
    }, [])

  const handleSaveBalance =
    useCallback(
      (
        updatedAccountDetails:
          BankAccountDetails,
      ): void => {
        saveAccountDetails(
          updatedAccountDetails,
        )
      },
      [
        saveAccountDetails,
      ],
    )

  const openIncomeForm =
    useCallback((): void => {
      setIsIncomeFormOpen(
        true,
      )
    }, [])

  const closeIncomeForm =
    useCallback((): void => {
      setIsIncomeFormOpen(
        false,
      )
    }, [])

  const handleSaveIncome =
    useCallback(
      (
        values:
          IncomeFormValues,
      ): void => {
        if (!bankId) {
          return
        }

        addIncomeSource(
          bankId,
          values,
        )
      },
      [
        addIncomeSource,
        bankId,
      ],
    )

  const openCreditCardForm =
    useCallback((): void => {
      setIsCreditCardFormOpen(
        true,
      )
    }, [])

  const closeCreditCardForm =
    useCallback((): void => {
      setIsCreditCardFormOpen(
        false,
      )
    }, [])

  const handleSaveCreditCard =
    useCallback(
      (
        values:
          CreditCardFormValues,
      ): void => {
        if (!bankId) {
          return
        }

        addCreditCard(
          bankId,
          values,
        )
      },
      [
        addCreditCard,
        bankId,
      ],
    )

  const openInstallmentForm =
    useCallback((): void => {
      setIsInstallmentFormOpen(
        true,
      )
    }, [])

  const closeInstallmentForm =
    useCallback((): void => {
      setIsInstallmentFormOpen(
        false,
      )
    }, [])

  const handleSaveInstallment =
    useCallback(
      (
        values:
          InstallmentFormValues,
      ): void => {
        if (!bankId) {
          return
        }

        addInstallment(
          bankId,
          values,
        )
      },
      [
        addInstallment,
        bankId,
      ],
    )

  const openInvestmentForm =
    useCallback((): void => {
      setIsInvestmentFormOpen(
        true,
      )
    }, [])

  const closeInvestmentForm =
    useCallback((): void => {
      setIsInvestmentFormOpen(
        false,
      )
    }, [])

  const handleSaveInvestment =
    useCallback(
      (
        values:
          InvestmentFormValues,
      ): void => {
        if (!bankId) {
          return
        }

        addInvestment(
          bankId,
          values,
        )
      },
      [
        addInvestment,
        bankId,
      ],
    )

  if (
    !bankId ||
    !bank
  ) {
    return (
      <Navigate
        to={routePaths.banks}
        replace
      />
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

            <h1>
              {bank.label}
            </h1>

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

                <h2>
                  Visão geral
                </h2>
              </div>

              <Landmark
                size={24}
                aria-hidden="true"
              />
            </div>

            <div className={styles.summaryGrid}>
              <article className={styles.summaryItem}>
                <span>
                  Saldo atual
                </span>

                <strong>
                  {accountDetails
                    ? formatCurrency(
                        accountDetails
                          .currentBalanceInCents,
                      )
                    : 'Não informado'}
                </strong>
              </article>

              <article className={styles.summaryItem}>
                <span>
                  Entradas mensais
                </span>

                <strong>
                  {incomeSources.length > 0
                    ? formatCurrency(
                        monthlyIncomeInCents,
                      )
                    : 'Não informado'}
                </strong>
              </article>

              <article className={styles.summaryItem}>
                <span>
                  Fatura atual
                </span>

                <strong>
                  {hasCreditCard
                    ? formatCurrency(
                        currentInvoiceInCents,
                      )
                    : 'Não informado'}
                </strong>
              </article>

              <article className={styles.summaryItem}>
                <span>
                  Total investido
                </span>

                <strong>
                  {activeInvestments.length > 0
                    ? formatCurrency(
                        totalCurrentInvestmentInCents,
                      )
                    : 'Não informado'}
                </strong>
              </article>
            </div>

            <Button
              type="button"
              fullWidth
              onClick={
                openAddBalanceModal
              }
            >
              <Plus
                size={18}
                aria-hidden="true"
              />

              {accountDetails
                ? 'Editar saldo atual'
                : 'Adicionar saldo atual'}
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
              description={
                accountDetails
                  ? `${accountDetails.nickname}. Saldo atualizado em ${formatReferenceDate(
                      accountDetails
                        .referenceDate,
                    )}.`
                  : 'Informe o saldo atual e o tipo de conta que você possui nesta instituição.'
              }
              buttonLabel={
                accountDetails
                  ? 'Editar saldo'
                  : 'Adicionar saldo'
              }
              onAction={
                openAddBalanceModal
              }
            />

            <EmptySection
              icon={
                <CircleDollarSign
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Recebimentos"
              description={
                incomeSources.length > 0
                  ? `${incomeSources.length} ${
                      incomeSources.length === 1
                        ? 'fonte cadastrada'
                        : 'fontes cadastradas'
                    } nesta instituição.`
                  : 'Informe salários, freelances ou outras entradas recebidas nesta instituição.'
              }
              buttonLabel="Adicionar recebimento"
              onAction={
                openIncomeForm
              }
            />

            <EmptySection
              icon={
                <CreditCard
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Cartões"
              description={
                creditCardsDescription
              }
              buttonLabel={
                creditCards.length > 0
                  ? 'Adicionar outro cartão'
                  : 'Adicionar cartão'
              }
              onAction={
                openCreditCardForm
              }
            />

            <EmptySection
              icon={
                <ReceiptText
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Parcelas"
              description={
                installmentsDescription
              }
              buttonLabel={
                installments.length > 0
                  ? 'Adicionar outra parcela'
                  : 'Adicionar parcela'
              }
              onAction={
                openInstallmentForm
              }
            />

            <EmptySection
              icon={
                <ChartLine
                  size={24}
                  aria-hidden="true"
                />
              }
              title="Investimentos"
              description={
                investmentsDescription
              }
              buttonLabel={
                investments.length > 0
                  ? 'Adicionar outro investimento'
                  : 'Adicionar investimento'
              }
              onAction={
                openInvestmentForm
              }
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

        <AddBalanceModal
          isOpen={
            isAddBalanceModalOpen
          }
          bank={bank}
          initialValues={
            accountDetails
          }
          onClose={
            closeAddBalanceModal
          }
          onSave={
            handleSaveBalance
          }
        />

        <IncomeForm
          isOpen={
            isIncomeFormOpen
          }
          bank={bank}
          onClose={
            closeIncomeForm
          }
          onSave={
            handleSaveIncome
          }
        />

        <CreditCardForm
          isOpen={
            isCreditCardFormOpen
          }
          bank={bank}
          onClose={
            closeCreditCardForm
          }
          onSave={
            handleSaveCreditCard
          }
        />

        <InstallmentForm
          isOpen={
            isInstallmentFormOpen
          }
          bank={bank}
          creditCards={
            creditCards
          }
          onClose={
            closeInstallmentForm
          }
          onSave={
            handleSaveInstallment
          }
        />

        <InvestmentForm
          isOpen={
            isInvestmentFormOpen
          }
          bank={bank}
          onClose={
            closeInvestmentForm
          }
          onSave={
            handleSaveInvestment
          }
        />
      </div>
    </main>
  )
}