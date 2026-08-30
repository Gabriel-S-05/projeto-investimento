import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  IncomeFormValues,
  IncomeSource,
} from '../types/income'

type IncomeSourcesByBankId = Record<
  string,
  IncomeSource[]
>

interface IncomeContextValue {
  incomeSourcesByBankId:
    IncomeSourcesByBankId

  getIncomeSources: (
    bankId: string,
  ) => IncomeSource[]

  getEstimatedMonthlyIncomeInCents: (
    bankId: string,
  ) => number

  addIncomeSource: (
    bankId: string,
    values: IncomeFormValues,
  ) => IncomeSource

  removeIncomeSource: (
    bankId: string,
    incomeId: string,
  ) => void
}

interface IncomeProviderProps {
  children: ReactNode
}

const IncomeContext =
  createContext<IncomeContextValue | null>(
    null,
  )

function createIncomeId(): string {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID()
  }

  return `income-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
}

function calculateMonthlyValue(
  income: IncomeSource,
): number {
  switch (income.frequency) {
    case 'weekly':
      return Math.round(
        income.amountInCents * 4.33,
      )

    case 'biweekly':
      return income.amountInCents * 2

    case 'monthly':
      return income.amountInCents

    case 'variable':
    case 'one-time':
      return 0

    default:
      return 0
  }
}

export function IncomeProvider({
  children,
}: IncomeProviderProps) {
  const [
    incomeSourcesByBankId,
    setIncomeSourcesByBankId,
  ] = useState<IncomeSourcesByBankId>(
    {},
  )

  const getIncomeSources =
    useCallback(
      (
        bankId: string,
      ): IncomeSource[] => {
        return (
          incomeSourcesByBankId[
            bankId
          ] ?? []
        )
      },
      [incomeSourcesByBankId],
    )

  const getEstimatedMonthlyIncomeInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const incomeSources =
          incomeSourcesByBankId[
            bankId
          ] ?? []

        return incomeSources.reduce(
          (
            total,
            income,
          ) =>
            total +
            calculateMonthlyValue(
              income,
            ),
          0,
        )
      },
      [incomeSourcesByBankId],
    )

  const addIncomeSource =
    useCallback(
      (
        bankId: string,
        values: IncomeFormValues,
      ): IncomeSource => {
        const currentDate =
          new Date().toISOString()

        const incomeSource:
          IncomeSource = {
            id: createIncomeId(),
            bankId,
            description:
              values.description,
            type: values.type,
            amountInCents:
              values.amountInCents,
            frequency:
              values.frequency,
            paymentDay:
              values.paymentDay,
            isVariableAmount:
              values.isVariableAmount,
            createdAt: currentDate,
            updatedAt: currentDate,
          }

        setIncomeSourcesByBankId(
          (currentSources) => ({
            ...currentSources,

            [bankId]: [
              ...(
                currentSources[
                  bankId
                ] ?? []
              ),
              incomeSource,
            ],
          }),
        )

        return incomeSource
      },
      [],
    )

  const removeIncomeSource =
    useCallback(
      (
        bankId: string,
        incomeId: string,
      ): void => {
        setIncomeSourcesByBankId(
          (currentSources) => ({
            ...currentSources,
            [bankId]:

            (
              currentSources[
                bankId
              ] ?? []
            ).filter(
              (incomeSource) =>
                incomeSource.id !==
                incomeId,
            ),
          }),
        )
      },
      [],
    )

  const contextValue =
    useMemo<IncomeContextValue>(
      () => ({
        incomeSourcesByBankId,
        getIncomeSources,
        getEstimatedMonthlyIncomeInCents,
        addIncomeSource,
        removeIncomeSource,
      }),
      [
        incomeSourcesByBankId,
        getIncomeSources,
        getEstimatedMonthlyIncomeInCents,
        addIncomeSource,
        removeIncomeSource,
      ],
    )

  return (
    <IncomeContext.Provider
      value={contextValue}
    >
      {children}
    </IncomeContext.Provider>
  )
}

export function useIncome():
  IncomeContextValue {
  const context =
    useContext(IncomeContext)

  if (!context) {
    throw new Error(
      'useIncome must be used inside IncomeProvider',
    )
  }

  return context
}