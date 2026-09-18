import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  InstallmentFormValues,
  InstallmentPurchase,
  InstallmentStatus,
} from '../types/installment'

type InstallmentsByBankId = Record<
  string,
  InstallmentPurchase[]
>

interface InstallmentsContextValue {
  installmentsByBankId:
    InstallmentsByBankId

  getInstallments: (
    bankId: string,
  ) => InstallmentPurchase[]

  getInstallmentsByCard: (
    bankId: string,
    cardId: string,
  ) => InstallmentPurchase[]

  getInstallmentById: (
    bankId: string,
    installmentId: string,
  ) => InstallmentPurchase | null

  getActiveInstallments: (
    bankId: string,
  ) => InstallmentPurchase[]

  getMonthlyCommitmentInCents: (
    bankId: string,
  ) => number

  getMonthlyCommitmentByCardInCents: (
    bankId: string,
    cardId: string,
  ) => number

  addInstallment: (
    bankId: string,
    values: InstallmentFormValues,
  ) => InstallmentPurchase

  updateInstallment: (
    bankId: string,
    installmentId: string,
    values: InstallmentFormValues,
  ) => void

  updateInstallmentProgress: (
    bankId: string,
    installmentId: string,
    currentInstallment: number,
  ) => void

  updateInstallmentStatus: (
    bankId: string,
    installmentId: string,
    status: InstallmentStatus,
  ) => void

  removeInstallment: (
    bankId: string,
    installmentId: string,
  ) => void

  removeInstallmentsByCard: (
    bankId: string,
    cardId: string,
  ) => void

  removeInstallmentsByBank: (
    bankId: string,
  ) => void
}

interface InstallmentsProviderProps {
  children: ReactNode
}

const InstallmentsContext =
  createContext<
    InstallmentsContextValue | null
  >(null)

function createInstallmentId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID()
  }

  return [
    'installment',
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

function normalizeTotalInstallments(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 2
  }

  return Math.min(
    120,
    Math.max(
      2,
      Math.round(value),
    ),
  )
}

function normalizeCurrentInstallment(
  value: number,
  totalInstallments: number,
): number {
  if (!Number.isFinite(value)) {
    return 1
  }

  return Math.min(
    totalInstallments,
    Math.max(
      1,
      Math.round(value),
    ),
  )
}

function calculateInstallmentAmountInCents(
  totalAmountInCents: number,
  totalInstallments: number,
): number {
  if (totalInstallments <= 0) {
    return 0
  }

  return Math.round(
    totalAmountInCents /
      totalInstallments,
  )
}

function calculateStatus(
  currentInstallment: number,
  totalInstallments: number,
): InstallmentStatus {
  if (
    currentInstallment >=
    totalInstallments
  ) {
    return 'completed'
  }

  return 'active'
}

export function InstallmentsProvider({
  children,
}: InstallmentsProviderProps) {
  const [
    installmentsByBankId,
    setInstallmentsByBankId,
  ] = useState<
    InstallmentsByBankId
  >({})

  const getInstallments =
    useCallback(
      (
        bankId: string,
      ): InstallmentPurchase[] => {
        return (
          installmentsByBankId[
            bankId
          ] ?? []
        )
      },
      [
        installmentsByBankId,
      ],
    )

  const getInstallmentsByCard =
    useCallback(
      (
        bankId: string,
        cardId: string,
      ): InstallmentPurchase[] => {
        const installments =
          installmentsByBankId[
            bankId
          ] ?? []

        return installments.filter(
          (installment) =>
            installment.cardId ===
            cardId,
        )
      },
      [
        installmentsByBankId,
      ],
    )

  const getInstallmentById =
    useCallback(
      (
        bankId: string,
        installmentId: string,
      ): InstallmentPurchase | null => {
        const installments =
          installmentsByBankId[
            bankId
          ] ?? []

        return (
          installments.find(
            (installment) =>
              installment.id ===
              installmentId,
          ) ?? null
        )
      },
      [
        installmentsByBankId,
      ],
    )

  const getActiveInstallments =
    useCallback(
      (
        bankId: string,
      ): InstallmentPurchase[] => {
        const installments =
          installmentsByBankId[
            bankId
          ] ?? []

        return installments.filter(
          (installment) =>
            installment.status ===
            'active',
        )
      },
      [
        installmentsByBankId,
      ],
    )

  const getMonthlyCommitmentInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const installments =
          installmentsByBankId[
            bankId
          ] ?? []

        return installments.reduce(
          (
            total,
            installment,
          ) => {
            if (
              installment.status !==
              'active'
            ) {
              return total
            }

            return (
              total +
              installment
                .installmentAmountInCents
            )
          },
          0,
        )
      },
      [
        installmentsByBankId,
      ],
    )

  const getMonthlyCommitmentByCardInCents =
    useCallback(
      (
        bankId: string,
        cardId: string,
      ): number => {
        const installments =
          installmentsByBankId[
            bankId
          ] ?? []

        return installments.reduce(
          (
            total,
            installment,
          ) => {
            const belongsToCard =
              installment.cardId ===
              cardId

            const isActive =
              installment.status ===
              'active'

            if (
              !belongsToCard ||
              !isActive
            ) {
              return total
            }

            return (
              total +
              installment
                .installmentAmountInCents
            )
          },
          0,
        )
      },
      [
        installmentsByBankId,
      ],
    )

  const addInstallment =
    useCallback(
      (
        bankId: string,
        values:
          InstallmentFormValues,
      ): InstallmentPurchase => {
        const totalAmountInCents =
          normalizeMoneyValue(
            values.totalAmountInCents,
          )

        const totalInstallments =
          normalizeTotalInstallments(
            values.totalInstallments,
          )

        const currentInstallment =
          normalizeCurrentInstallment(
            values.currentInstallment,
            totalInstallments,
          )

        const currentDate =
          new Date().toISOString()

        const status =
          calculateStatus(
            currentInstallment,
            totalInstallments,
          )

        const installment:
          InstallmentPurchase = {
            id:
              createInstallmentId(),

            bankId,

            cardId:
              values.cardId,

            description:
              values.description.trim(),

            category:
              values.category,

            status,

            totalAmountInCents,

            installmentAmountInCents:
              calculateInstallmentAmountInCents(
                totalAmountInCents,
                totalInstallments,
              ),

            totalInstallments,

            currentInstallment,

            purchaseDate:
              values.purchaseDate,

            nextDueDate:
              status === 'completed'
                ? null
                : values.nextDueDate,

            createdAt:
              currentDate,

            updatedAt:
              currentDate,
          }

        setInstallmentsByBankId(
          (currentInstallments) => ({
            ...currentInstallments,
            [bankId]:
            [
              ...(
                currentInstallments[
                  bankId
                ] ?? []
              ),
              installment,
            ],
          }),
        )

        return installment
      },
      [],
    )

  const updateInstallment =
    useCallback(
      (
        bankId: string,
        installmentId: string,
        values:
          InstallmentFormValues,
      ): void => {
        setInstallmentsByBankId(
          (currentInstallments) => {
            const bankInstallments =
              currentInstallments[
                bankId
              ] ?? []

            const totalAmountInCents =
              normalizeMoneyValue(
                values.totalAmountInCents,
              )

            const totalInstallments =
              normalizeTotalInstallments(
                values.totalInstallments,
              )

            const currentInstallment =
              normalizeCurrentInstallment(
                values.currentInstallment,
                totalInstallments,
              )

            const status =
              calculateStatus(
                currentInstallment,
                totalInstallments,
              )

            const updatedInstallments =
              bankInstallments.map(
                (installment) => {
                  if (
                    installment.id !==
                    installmentId
                  ) {
                    return installment
                  }

                  return {
                    ...installment,

                    cardId:
                      values.cardId,

                    description:
                      values.description
                        .trim(),

                    category:
                      values.category,

                    status,

                    totalAmountInCents,

                    installmentAmountInCents:
                      calculateInstallmentAmountInCents(
                        totalAmountInCents,
                        totalInstallments,
                      ),

                    totalInstallments,

                    currentInstallment,

                    purchaseDate:
                      values.purchaseDate,

                    nextDueDate:
                      status ===
                      'completed'
                        ? null
                        : values.nextDueDate,

                    updatedAt:
                      new Date()
                        .toISOString(),
                  }
                },
              )

            return {
              ...currentInstallments,

              updatedInstallments,
            }
          },
        )
      },
      [],
    )

  const updateInstallmentProgress =
    useCallback(
      (
        bankId: string,
        installmentId: string,
        currentInstallment: number,
      ): void => {
        setInstallmentsByBankId(
          (currentInstallments) => {
            const bankInstallments =
              currentInstallments[
                bankId
              ] ?? []

            const updatedInstallments =
              bankInstallments.map(
                (installment) => {
                  if (
                    installment.id !==
                    installmentId
                  ) {
                    return installment
                  }

                  if (
                    installment.status !==
                    'active'
                  ) {
                    return installment
                  }

                  const normalizedProgress =
                    normalizeCurrentInstallment(
                      currentInstallment,
                      installment
                        .totalInstallments,
                    )

                  const status =
                    calculateStatus(
                      normalizedProgress,
                      installment
                        .totalInstallments,
                    )

                  return {
                    ...installment,

                    currentInstallment:
                      normalizedProgress,

                    status,

                    nextDueDate:
                      status ===
                      'completed'
                        ? null
                        : installment
                            .nextDueDate,

                    updatedAt:
                      new Date()
                        .toISOString(),
                  }
                },
              )

            return {
              ...currentInstallments,

              updatedInstallments,
            }
          },
        )
      },
      [],
    )

  const updateInstallmentStatus =
    useCallback(
      (
        bankId: string,
        installmentId: string,
        status:
          InstallmentStatus,
      ): void => {
        setInstallmentsByBankId(
          (currentInstallments) => {
            const bankInstallments =
              currentInstallments[
                bankId
              ] ?? []

            const updatedInstallments =
              bankInstallments.map(
                (installment) => {
                  if (
                    installment.id !==
                    installmentId
                  ) {
                    return installment
                  }

                  const isCompleted =
                    status ===
                    'completed'

                  return {
                    ...installment,

                    status,

                    currentInstallment:
                      isCompleted
                        ? installment
                            .totalInstallments
                        : installment
                            .currentInstallment,

                    nextDueDate:
                      status ===
                      'active'
                        ? installment
                            .nextDueDate
                        : null,

                    updatedAt:
                      new Date()
                        .toISOString(),
                  }
                },
              )

            return {
              ...currentInstallments,

              updatedInstallments,
            }
          },
        )
      },
      [],
    )

  const removeInstallment =
    useCallback(
      (
        bankId: string,
        installmentId: string,
      ): void => {
        setInstallmentsByBankId(
          (currentInstallments) => {
            const bankInstallments =
              currentInstallments[
                bankId
              ]

            if (!bankInstallments) {
              return currentInstallments
            }

            const updatedInstallments =
              bankInstallments.filter(
                (installment) =>
                  installment.id !==
                  installmentId,
              )

            if (
              updatedInstallments.length ===
              bankInstallments.length
            ) {
              return currentInstallments
            }

            if (
              updatedInstallments.length ===
              0
            ) {
              const nextInstallments = {
                ...currentInstallments,
              }

              delete nextInstallments[
                bankId
              ]

              return nextInstallments
            }

            return {
              ...currentInstallments,

              updatedInstallments,
            }
          },
        )
      },
      [],
    )

  const removeInstallmentsByCard =
    useCallback(
      (
        bankId: string,
        cardId: string,
      ): void => {
        setInstallmentsByBankId(
          (currentInstallments) => {
            const bankInstallments =
              currentInstallments[
                bankId
              ]

            if (!bankInstallments) {
              return currentInstallments
            }

            const updatedInstallments =
              bankInstallments.filter(
                (installment) =>
                  installment.cardId !==
                  cardId,
              )

            if (
              updatedInstallments.length ===
              bankInstallments.length
            ) {
              return currentInstallments
            }

            if (
              updatedInstallments.length ===
              0
            ) {
              const nextInstallments = {
                ...currentInstallments,
              }

              delete nextInstallments[
                bankId
              ]

              return nextInstallments
            }

            return {
              ...currentInstallments,

              updatedInstallments,
            }
          },
        )
      },
      [],
    )

  const removeInstallmentsByBank =
    useCallback(
      (
        bankId: string,
      ): void => {
        setInstallmentsByBankId(
          (currentInstallments) => {
            if (
              !currentInstallments[
                bankId
              ]
            ) {
              return currentInstallments
            }

            const nextInstallments = {
              ...currentInstallments,
            }

            delete nextInstallments[
              bankId
            ]

            return nextInstallments
          },
        )
      },
      [],
    )

  const contextValue =
    useMemo<
      InstallmentsContextValue
    >(
      () => ({
        installmentsByBankId,
        getInstallments,
        getInstallmentsByCard,
        getInstallmentById,
        getActiveInstallments,
        getMonthlyCommitmentInCents,
        getMonthlyCommitmentByCardInCents,
        addInstallment,
        updateInstallment,
        updateInstallmentProgress,
        updateInstallmentStatus,
        removeInstallment,
        removeInstallmentsByCard,
        removeInstallmentsByBank,
      }),
      [
        installmentsByBankId,
        getInstallments,
        getInstallmentsByCard,
        getInstallmentById,
        getActiveInstallments,
        getMonthlyCommitmentInCents,
        getMonthlyCommitmentByCardInCents,
        addInstallment,
        updateInstallment,
        updateInstallmentProgress,
        updateInstallmentStatus,
        removeInstallment,
        removeInstallmentsByCard,
        removeInstallmentsByBank,
      ],
    )

  return (
    <InstallmentsContext.Provider
      value={contextValue}
    >
      {children}
    </InstallmentsContext.Provider>
  )
}

export function useInstallments():
  InstallmentsContextValue {
  const context =
    useContext(
      InstallmentsContext,
    )

  if (!context) {
    throw new Error(
      'useInstallments must be used inside InstallmentsProvider',
    )
  }

  return context
}