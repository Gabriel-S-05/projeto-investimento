import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  CreditCard,
  CreditCardFormValues,
} from '../types/credit-card'

type CreditCardsByBankId = Record<
  string,
  CreditCard[]
>

interface CreditCardsContextValue {
  creditCardsByBankId:
    CreditCardsByBankId

  getCreditCards: (
    bankId: string,
  ) => CreditCard[]

  getCreditCardById: (
    bankId: string,
    cardId: string,
  ) => CreditCard | null

  getCurrentInvoiceInCents: (
    bankId: string,
  ) => number

  getTotalLimitInCents: (
    bankId: string,
  ) => number

  getUsedLimitInCents: (
    bankId: string,
  ) => number

  getAvailableLimitInCents: (
    bankId: string,
  ) => number

  addCreditCard: (
    bankId: string,
    values: CreditCardFormValues,
  ) => CreditCard

  updateCreditCard: (
    bankId: string,
    cardId: string,
    values: CreditCardFormValues,
  ) => void

  removeCreditCard: (
    bankId: string,
    cardId: string,
  ) => void

  removeCreditCardsByBank: (
    bankId: string,
  ) => void
}

interface CreditCardsProviderProps {
  children: ReactNode
}

const CreditCardsContext =
  createContext<
    CreditCardsContextValue | null
  >(null)

function createCreditCardId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID()
  }

  return [
    'card',
    Date.now(),
    Math.random()
      .toString(16)
      .slice(2),
  ].join('-')
}

function normalizeMoneyValue(
  value: number | null,
): number | null {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return null
  }

  return Math.max(
    0,
    Math.round(value),
  )
}

function normalizeDay(
  value: number | null,
): number | null {
  if (
    value === null ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 31
  ) {
    return null
  }

  return value
}

export function CreditCardsProvider({
  children,
}: CreditCardsProviderProps) {
  const [
    creditCardsByBankId,
    setCreditCardsByBankId,
  ] = useState<
    CreditCardsByBankId
  >({})

  const getCreditCards =
    useCallback(
      (
        bankId: string,
      ): CreditCard[] => {
        return (
          creditCardsByBankId[
            bankId
          ] ?? []
        )
      },
      [creditCardsByBankId],
    )

  const getCreditCardById =
    useCallback(
      (
        bankId: string,
        cardId: string,
      ): CreditCard | null => {
        const cards =
          creditCardsByBankId[
            bankId
          ] ?? []

        return (
          cards.find(
            (card) =>
              card.id === cardId,
          ) ?? null
        )
      },
      [creditCardsByBankId],
    )

  const getCurrentInvoiceInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const cards =
          creditCardsByBankId[
            bankId
          ] ?? []

        return cards.reduce(
          (
            total,
            card,
          ) => {
            return (
              total +
              (
                card.currentInvoiceInCents ??
                0
              )
            )
          },
          0,
        )
      },
      [creditCardsByBankId],
    )

  const getTotalLimitInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const cards =
          creditCardsByBankId[
            bankId
          ] ?? []

        return cards.reduce(
          (
            total,
            card,
          ) => {
            return (
              total +
              (
                card.totalLimitInCents ??
                0
              )
            )
          },
          0,
        )
      },
      [creditCardsByBankId],
    )

  const getUsedLimitInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const cards =
          creditCardsByBankId[
            bankId
          ] ?? []

        return cards.reduce(
          (
            total,
            card,
          ) => {
            return (
              total +
              (
                card.usedLimitInCents ??
                0
              )
            )
          },
          0,
        )
      },
      [creditCardsByBankId],
    )

  const getAvailableLimitInCents =
    useCallback(
      (
        bankId: string,
      ): number => {
        const cards =
          creditCardsByBankId[
            bankId
          ] ?? []

        return cards.reduce(
          (
            total,
            card,
          ) => {
            const totalLimit =
              card.totalLimitInCents ??
              0

            const usedLimit =
              card.usedLimitInCents ??
              0

            return (
              total +
              Math.max(
                totalLimit -
                  usedLimit,
                0,
              )
            )
          },
          0,
        )
      },
      [creditCardsByBankId],
    )

  const addCreditCard =
    useCallback(
      (
        bankId: string,
        values:
          CreditCardFormValues,
      ): CreditCard => {
        const currentDate =
          new Date().toISOString()

        const creditCard:
          CreditCard = {
            id:
              createCreditCardId(),

            bankId,

            nickname:
              values.nickname.trim(),

            type:
              values.type,

            category:
              values.category,

            kind:
              values.kind,

            totalLimitInCents:
              normalizeMoneyValue(
                values.totalLimitInCents,
              ),

            usedLimitInCents:
              normalizeMoneyValue(
                values.usedLimitInCents,
              ),

            currentInvoiceInCents:
              normalizeMoneyValue(
                values.currentInvoiceInCents,
              ),

            closingDay:
              normalizeDay(
                values.closingDay,
              ),

            dueDay:
              normalizeDay(
                values.dueDay,
              ),

            createdAt:
              currentDate,

            updatedAt:
              currentDate,
          }

        setCreditCardsByBankId(
          (currentCards) => ({
            ...currentCards,
            [bankId]:

            [
              ...(
                currentCards[
                  bankId
                ] ?? []
              ),
              creditCard,
            ],
          }),
        )

        return creditCard
      },
      [],
    )

  const updateCreditCard =
    useCallback(
      (
        bankId: string,
        cardId: string,
        values:
          CreditCardFormValues,
      ): void => {
        setCreditCardsByBankId(
          (currentCards) => {
            const bankCards =
              currentCards[
                bankId
              ] ?? []

            const updatedCards =
              bankCards.map(
                (card) => {
                  if (
                    card.id !== cardId
                  ) {
                    return card
                  }

                  return {
                    ...card,

                    nickname:
                      values.nickname
                        .trim(),

                    type:
                      values.type,

                    category:
                      values.category,

                    kind:
                      values.kind,

                    totalLimitInCents:
                      normalizeMoneyValue(
                        values
                          .totalLimitInCents,
                      ),

                    usedLimitInCents:
                      normalizeMoneyValue(
                        values
                          .usedLimitInCents,
                      ),

                    currentInvoiceInCents:
                      normalizeMoneyValue(
                        values
                          .currentInvoiceInCents,
                      ),

                    closingDay:
                      normalizeDay(
                        values.closingDay,
                      ),

                    dueDay:
                      normalizeDay(
                        values.dueDay,
                      ),

                    updatedAt:
                      new Date()
                        .toISOString(),
                  }
                },
              )

            return {
              ...currentCards,
              [bankId]: updatedCards,
            }
          },
        )
      },
      [],
    )

  const removeCreditCard =
    useCallback(
      (
        bankId: string,
        cardId: string,
      ): void => {
        setCreditCardsByBankId(
          (currentCards) => {
            const updatedCards =
              (
                currentCards[
                  bankId
                ] ?? []
              ).filter(
                (card) =>
                  card.id !== cardId,
              )

            if (
              updatedCards.length === 0
            ) {
              const nextCards = {
                ...currentCards,
              }

              delete nextCards[
                bankId
              ]

              return nextCards
            }

            return {
              ...currentCards,
              [bankId]: updatedCards,
            }
          },
        )
      },
      [],
    )
  const removeCreditCardsByBank =
    useCallback(
      (
        bankId: string,
      ): void => {
        setCreditCardsByBankId(
          (currentCards) => {
            const updatedCards = {
              ...currentCards,
            }

            delete updatedCards[
              bankId
            ]

            return updatedCards
          },
        )
      },
      [],
    )

  const contextValue =
    useMemo<
      CreditCardsContextValue
    >(
      () => ({
        creditCardsByBankId,
        getCreditCards,
        getCreditCardById,
        getCurrentInvoiceInCents,
        getTotalLimitInCents,
        getUsedLimitInCents,
        getAvailableLimitInCents,
        addCreditCard,
        updateCreditCard,
        removeCreditCard,
        removeCreditCardsByBank,
      }),
      [
        creditCardsByBankId,
        getCreditCards,
        getCreditCardById,
        getCurrentInvoiceInCents,
        getTotalLimitInCents,
        getUsedLimitInCents,
        getAvailableLimitInCents,
        addCreditCard,
        updateCreditCard,
        removeCreditCard,
        removeCreditCardsByBank,
      ],
    )

  return (
    <CreditCardsContext.Provider
      value={contextValue}
    >
      {children}
    </CreditCardsContext.Provider>
  )
}

export function useCreditCards():
  CreditCardsContextValue {
  const context =
    useContext(
      CreditCardsContext,
    )

  if (!context) {
    throw new Error(
      'useCreditCards must be used inside CreditCardsProvider',
    )
  }

  return context
}