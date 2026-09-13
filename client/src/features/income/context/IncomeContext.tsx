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

  getIncomeSourceById: (
    bankId: string,
    incomeId: string,
  ) => IncomeSource | null

  getEstimatedMonthlyIncomeInCents: (
    bankId: string,
  ) => number

  addIncomeSource: (
    bankId: string,
    values: IncomeFormValues,
  ) => IncomeSource

  updateIncomeSource: (
    bankId: string,
    incomeId: string,
    values: IncomeFormValues,
  ) => void

  removeIncomeSource: (
    bankId: string,
    incomeId: string,
  ) => void

  removeIncomeSourcesByBank: (
    bankId: string,
  ) => void
}

interface IncomeProviderProps {
  children: ReactNode
}

const IncomeContext =
  createContext<
    IncomeContextValue | null
  >(null)

function createIncomeId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID()
  }

  return [
    'income',
    Date.now(),
    Math.random()
      .toString(16)
      .slice(2),
  ].join('-')
}

function normalizeAmountInCents(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(
    0,
    Math.round(value),
  )
}

function normalizePaymentDay(
  value: number | null,
  frequency:
    IncomeFormValues['frequency'],
): number | null {
  if (
    frequency !== 'monthly' ||
    value === null ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 31
  ) {
    return null
  }

  return value
}

function calculateMonthlyValue(
  incomeSource: IncomeSource,
): number {
  switch (
    incomeSource.frequency
  ) {
    case 'monthly':
      return incomeSource
        .amountInCents

    case 'weekly':
      return Math.round(
        incomeSource
          .amountInCents * 4.33,
      )

    case 'biweekly':
      return (
        incomeSource
          .amountInCents * 2
      )

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
  ] = useState<
    IncomeSourcesByBankId
  >({})

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
      [
        incomeSourcesByBankId,
      ],
    )

  const getIncomeSourceById =
    useCallback(
      (
        bankId: string,
        incomeId: string,
      ): IncomeSource | null => {
        const incomeSources =
          incomeSourcesByBankId[
            bankId
          ] ?? []

        return (
          incomeSources.find(
            (incomeSource) =>
              incomeSource.id ===
              incomeId,
          ) ?? null
        )
      },
      [
        incomeSourcesByBankId,
      ],
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
            incomeSource,
          ) => {
            return (
              total +
              calculateMonthlyValue(
                incomeSource,
              )
            )
          },
          0,
        )
      },
      [
        incomeSourcesByBankId,
      ],
    )

  const addIncomeSource =
    useCallback(
      (
        bankId: string,
        values:
          IncomeFormValues,
      ): IncomeSource => {
        const currentDate =
          new Date().toISOString()

        const incomeSource:
          IncomeSource = {
            id:
              createIncomeId(),

            bankId,

            description:
              values.description
                .trim(),

            type:
              values.type,

            amountInCents:
              normalizeAmountInCents(
                values.amountInCents,
              ),

            frequency:
              values.frequency,

            paymentDay:
              normalizePaymentDay(
                values.paymentDay,
                values.frequency,
              ),

            isVariableAmount:
              values.isVariableAmount,

            createdAt:
              currentDate,

            updatedAt:
              currentDate,
          }

        setIncomeSourcesByBankId(
          (
            currentIncomeSources,
          ) => ({
            ...currentIncomeSources,
            [bankId]:

            [
              ...(
                currentIncomeSources[
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

  const updateIncomeSource =
    useCallback(
      (
        bankId: string,
        incomeId: string,
        values:
          IncomeFormValues,
      ): void => {
        setIncomeSourcesByBankId(
          (
            currentIncomeSources,
          ) => {
            const bankIncomeSources =
              currentIncomeSources[
                bankId
              ] ?? []

            const updatedIncomeSources =
              bankIncomeSources.map(
                (incomeSource) => {
                  if (
                    incomeSource.id !==
                    incomeId
                  ) {
                    return incomeSource
                  }

                  return {
                    ...incomeSource,

                    description:
                      values.description
                        .trim(),

                    type:
                      values.type,

                    amountInCents:
                      normalizeAmountInCents(
                        values
                          .amountInCents,
                      ),

                    frequency:
                      values.frequency,

                    paymentDay:
                      normalizePaymentDay(
                        values.paymentDay,
                        values.frequency,
                      ),

                    isVariableAmount:
                      values
                        .isVariableAmount,

                    updatedAt:
                      new Date()
                        .toISOString(),
                  }
                },
              )

            return {
              ...currentIncomeSources,
              [bankId]: updatedIncomeSources,
            }
          },
        )
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
          (
            currentIncomeSources,
          ) => {
            const updatedIncomeSources =
              (
                currentIncomeSources[
                  bankId
                ] ?? []
              ).filter(
                (incomeSource) =>
                  incomeSource.id !==
                  incomeId,
              )

            if (
              updatedIncomeSources.length ===
              0
            ) {
              const nextIncomeSources = {
                ...currentIncomeSources,
              }

              delete nextIncomeSources[
                bankId
              ]

              return nextIncomeSources
            }

            return {
              ...currentIncomeSources,
              [bankId]: updatedIncomeSources,
            }
          },
        )
      },
      [],
    )
  const removeIncomeSourcesByBank =
    useCallback(
      (
        bankId: string,
      ): void => {
        setIncomeSourcesByBankId(
          (
            currentIncomeSources,
          ) => {
            if (
              !currentIncomeSources[
                bankId
              ]
            ) {
              return currentIncomeSources
            }

            const nextIncomeSources = {
              ...currentIncomeSources,
            }

            delete nextIncomeSources[
              bankId
            ]

            return nextIncomeSources
          },
        )
      },
      [],
    )

  const contextValue =
    useMemo<
      IncomeContextValue
    >(
      () => ({
        incomeSourcesByBankId,
        getIncomeSources,
        getIncomeSourceById,
        getEstimatedMonthlyIncomeInCents,
        addIncomeSource,
        updateIncomeSource,
        removeIncomeSource,
        removeIncomeSourcesByBank,
      }),
      [
        incomeSourcesByBankId,
        getIncomeSources,
        getIncomeSourceById,
        getEstimatedMonthlyIncomeInCents,
        addIncomeSource,
        updateIncomeSource,
        removeIncomeSource,
        removeIncomeSourcesByBank,
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
    useContext(
      IncomeContext,
    )

  if (!context) {
    throw new Error(
      'useIncome must be used inside IncomeProvider',
    )
  }

  return context
}