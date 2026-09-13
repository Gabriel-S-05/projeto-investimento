import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  Investment,
  InvestmentFormValues,
  InvestmentStatus,
} from '../types/investment'

type InvestmentsByBankId = Record<
  string,
  Investment[]
>

interface InvestmentSummary {
  investedAmountInCents: number
  currentAmountInCents: number
  resultInCents: number
  returnPercentage: number
}

interface InvestmentsContextValue {
  investmentsByBankId:
    InvestmentsByBankId

  getInvestments: (
    bankId: string,
  ) => Investment[]

  getActiveInvestments: (
    bankId: string,
  ) => Investment[]

  getInvestmentById: (
    bankId: string,
    investmentId: string,
  ) => Investment | null

  getTotalInvestedInCents: (
    bankId: string,
  ) => number

  getTotalCurrentAmountInCents: (
    bankId: string,
  ) => number

  getTotalResultInCents: (
    bankId: string,
  ) => number

  getInvestmentResultInCents: (
    bankId: string,
    investmentId: string,
  ) => number | null

  getInvestmentReturnPercentage: (
    bankId: string,
    investmentId: string,
  ) => number | null

  getInvestmentSummary: (
    bankId: string,
  ) => InvestmentSummary

  addInvestment: (
    bankId: string,
    values: InvestmentFormValues,
  ) => Investment

  updateInvestment: (
    bankId: string,
    investmentId: string,
    values: InvestmentFormValues,
  ) => void

  updateInvestmentStatus: (
    bankId: string,
    investmentId: string,
    status: InvestmentStatus,
  ) => void

  removeInvestment: (
    bankId: string,
    investmentId: string,
  ) => void

  removeInvestmentsByBank: (
    bankId: string,
  ) => void
}

interface InvestmentsProviderProps {
  children: ReactNode
}

const InvestmentsContext =
  createContext<
    InvestmentsContextValue | null
  >(null)

function createInvestmentId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID()
  }

  return [
    'investment',
    Date.now(),
    Math.random()
      .toString(16)
      .slice(2),
  ].join('-')
}

function normalizeMoneyValue(
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

function normalizeOptionalText(
  value: string | null,
): string | null {
  if (value === null) {
    return null
  }

  const normalizedValue =
    value.trim()

  return normalizedValue ||
    null
}

function calculateReturnPercentage(
  investedAmountInCents: number,
  currentAmountInCents: number,
): number {
  if (
    investedAmountInCents <= 0
  ) {
    return 0
  }

  const resultInCents =
    currentAmountInCents -
    investedAmountInCents

  return (
    resultInCents /
    investedAmountInCents
  ) * 100
}

export function InvestmentsProvider({
  children,
}: InvestmentsProviderProps) {
  const [
    investmentsByBankId,
    setInvestmentsByBankId,
  ] = useState<
    InvestmentsByBankId
  >({})

  const getInvestments =
    useCallback(
      (
        bankId: string,
      ): Investment[] => {
        return (
          investmentsByBankId[
            bankId
          ] ?? []
        )
      },
      [
        investmentsByBankId,
      ],
    )

  const getActiveInvestments =
    useCallback(
      (
        bankId: string,
      ): Investment[] => {
        const investments =
          investmentsByBankId[
            bankId
          ] ?? []

        return investments.filter(
          (investment) =>
            investment.status ===
            'active',
        )
      },
      [
        investmentsByBankId,
      ],
    )

  const getInvestmentById =
    useCallback(
      (
        bankId: string,
        investmentId: string,
      ): Investment | null => {
        const investments =
          investmentsByBankId[
            bankId
          ] ?? []

        return (
          investments.find(
            (investment) =>
              investment.id ===
              investmentId,
          ) ?? null
        )
      },
      [
        investmentsByBankId,
      ],
    )

  const getTotalInvestedInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const investments =
          investmentsByBankId[
            bankId
          ] ?? []

        return investments.reduce(
          (
            total,
            investment,
          ) => {
            if (
              investment.status !==
              'active'
            ) {
              return total
            }

            return (
              total +
              investment
                .investedAmountInCents
            )
          },
          0,
        )
      },
      [
        investmentsByBankId,
      ],
    )

  const getTotalCurrentAmountInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const investments =
          investmentsByBankId[
            bankId
          ] ?? []

        return investments.reduce(
          (
            total,
            investment,
          ) => {
            if (
              investment.status !==
              'active'
            ) {
              return total
            }

            return (
              total +
              investment
                .currentAmountInCents
            )
          },
          0,
        )
      },
      [
        investmentsByBankId,
      ],
    )

  const getTotalResultInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const investments =
          investmentsByBankId[
            bankId
          ] ?? []

        return investments.reduce(
          (
            total,
            investment,
          ) => {
            if (
              investment.status !==
              'active'
            ) {
              return total
            }

            return (
              total +
              (
                investment
                  .currentAmountInCents -
                investment
                  .investedAmountInCents
              )
            )
          },
          0,
        )
      },
      [
        investmentsByBankId,
      ],
    )

  const getInvestmentResultInCents =
    useCallback(
      (
        bankId: string,
        investmentId: string,
      ): number | null => {
        const investment =
          (
            investmentsByBankId[
              bankId
            ] ?? []
          ).find(
            (currentInvestment) =>
              currentInvestment.id ===
              investmentId,
          )

        if (!investment) {
          return null
        }

        return (
          investment
            .currentAmountInCents -
          investment
            .investedAmountInCents
        )
      },
      [
        investmentsByBankId,
      ],
    )

  const getInvestmentReturnPercentage =
    useCallback(
      (
        bankId: string,
        investmentId: string,
      ): number | null => {
        const investment =
          (
            investmentsByBankId[
              bankId
            ] ?? []
          ).find(
            (currentInvestment) =>
              currentInvestment.id ===
              investmentId,
          )

        if (!investment) {
          return null
        }

        return calculateReturnPercentage(
          investment
            .investedAmountInCents,
          investment
            .currentAmountInCents,
        )
      },
      [
        investmentsByBankId,
      ],
    )

  const getInvestmentSummary =
    useCallback(
      (
        bankId: string,
      ): InvestmentSummary => {
        const activeInvestments =
          (
            investmentsByBankId[
              bankId
            ] ?? []
          ).filter(
            (investment) =>
              investment.status ===
              'active',
          )

        const summary =
          activeInvestments.reduce(
            (
              currentSummary,
              investment,
            ) => ({
              investedAmountInCents:
                currentSummary
                  .investedAmountInCents +
                investment
                  .investedAmountInCents,

              currentAmountInCents:
                currentSummary
                  .currentAmountInCents +
                investment
                  .currentAmountInCents,
            }),
            {
              investedAmountInCents:
                0,
              currentAmountInCents:
                0,
            },
          )

        const resultInCents =
          summary
            .currentAmountInCents -
          summary
            .investedAmountInCents

        return {
          ...summary,

          resultInCents,

          returnPercentage:
            calculateReturnPercentage(
              summary
                .investedAmountInCents,
              summary
                .currentAmountInCents,
            ),
        }
      },
      [
        investmentsByBankId,
      ],
    )

  const addInvestment =
    useCallback(
      (
        bankId: string,
        values:
          InvestmentFormValues,
      ): Investment => {
        const currentDate =
          new Date().toISOString()

        const investment:
          Investment = {
            id:
              createInvestmentId(),

            bankId,

            name:
              values.name.trim(),

            category:
              values.category,

            liquidity:
              values.liquidity,

            status:
              'active',

            investedAmountInCents:
              normalizeMoneyValue(
                values
                  .investedAmountInCents,
              ),

            currentAmountInCents:
              normalizeMoneyValue(
                values
                  .currentAmountInCents,
              ),

            applicationDate:
              values.applicationDate,

            referenceDate:
              values.referenceDate,

            maturityDate:
              values.maturityDate ||
              null,

            notes:
              normalizeOptionalText(
                values.notes,
              ),

            createdAt:
              currentDate,

            updatedAt:
              currentDate,
          }

        setInvestmentsByBankId(
          (
            currentInvestments,
          ) => ({
            ...currentInvestments,
            [bankId]:

            [
              ...(
                currentInvestments[
                  bankId
                ] ?? []
              ),
              investment,
            ],
          }),
        )

        return investment
      },
      [],
    )

  const updateInvestment =
    useCallback(
      (
        bankId: string,
        investmentId: string,
        values:
          InvestmentFormValues,
      ): void => {
        setInvestmentsByBankId(
          (
            currentInvestments,
          ) => {
            const bankInvestments =
              currentInvestments[
                bankId
              ] ?? []

            const updatedInvestments =
              bankInvestments.map(
                (investment) => {
                  if (
                    investment.id !==
                    investmentId
                  ) {
                    return investment
                  }

                  return {
                    ...investment,

                    name:
                      values.name.trim(),

                    category:
                      values.category,

                    liquidity:
                      values.liquidity,

                    investedAmountInCents:
                      normalizeMoneyValue(
                        values
                          .investedAmountInCents,
                      ),

                    currentAmountInCents:
                      normalizeMoneyValue(
                        values
                          .currentAmountInCents,
                      ),

                    applicationDate:
                      values.applicationDate,

                    referenceDate:
                      values.referenceDate,

                    maturityDate:
                      values.maturityDate ||
                      null,

                    notes:
                      normalizeOptionalText(
                        values.notes,
                      ),

                    updatedAt:
                      new Date()
                        .toISOString(),
                  }
                },
              )

            return {
              ...currentInvestments,
              updatedInvestments,
            }
          },
        )
      },
      [],
    )

  const updateInvestmentStatus =
    useCallback(
      (
        bankId: string,
        investmentId: string,
        status:
          InvestmentStatus,
      ): void => {
        setInvestmentsByBankId(
          (
            currentInvestments,
          ) => {
            const bankInvestments =
              currentInvestments[
                bankId
              ] ?? []

            const updatedInvestments =
              bankInvestments.map(
                (investment) => {
                  if (
                    investment.id !==
                    investmentId
                  ) {
                    return investment
                  }

                  return {
                    ...investment,
                    status,

                    updatedAt:
                      new Date()
                        .toISOString(),
                  }
                },
              )

            return {
              ...currentInvestments,
              updatedInvestments,
            }
          },
        )
      },
      [],
    )

  const removeInvestment =
    useCallback(
      (
        bankId: string,
        investmentId: string,
      ): void => {
        setInvestmentsByBankId(
          (
            currentInvestments,
          ) => {
            const updatedInvestments =
              (
                currentInvestments[
                  bankId
                ] ?? []
              ).filter(
                (investment) =>
                  investment.id !==
                  investmentId,
              )

            if (
              updatedInvestments.length ===
              0
            ) {
              const nextInvestments = {
                ...currentInvestments,
              }

              delete nextInvestments[
                bankId
              ]

              return nextInvestments
            }

            return {
              ...currentInvestments,
              updatedInvestments,
            }
          },
        )
      },
      [],
    )

  const removeInvestmentsByBank =
    useCallback(
      (
        bankId: string,
      ): void => {
        setInvestmentsByBankId(
          (
            currentInvestments,
          ) => {
            const nextInvestments = {
              ...currentInvestments,
            }

            delete nextInvestments[
              bankId
            ]

            return nextInvestments
          },
        )
      },
      [],
    )

  const contextValue =
    useMemo<
      InvestmentsContextValue
    >(
      () => ({
        investmentsByBankId,
        getInvestments,
        getActiveInvestments,
        getInvestmentById,
        getTotalInvestedInCents,
        getTotalCurrentAmountInCents,
        getTotalResultInCents,
        getInvestmentResultInCents,
        getInvestmentReturnPercentage,
        getInvestmentSummary,
        addInvestment,
        updateInvestment,
        updateInvestmentStatus,
        removeInvestment,
        removeInvestmentsByBank,
      }),
      [
        investmentsByBankId,
        getInvestments,
        getActiveInvestments,
        getInvestmentById,
        getTotalInvestedInCents,
        getTotalCurrentAmountInCents,
        getTotalResultInCents,
        getInvestmentResultInCents,
        getInvestmentReturnPercentage,
        getInvestmentSummary,
        addInvestment,
        updateInvestment,
        updateInvestmentStatus,
        removeInvestment,
        removeInvestmentsByBank,
      ],
    )

  return (
    <InvestmentsContext.Provider
      value={contextValue}
    >
      {children}
    </InvestmentsContext.Provider>
  )
}

export function useInvestments():
  InvestmentsContextValue {
  const context =
    useContext(
      InvestmentsContext,
    )

  if (!context) {
    throw new Error(
      'useInvestments must be used inside InvestmentsProvider',
    )
  }

  return context
}