import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  banks,
  type BankOption,
} from '../data/bank'

const STORAGE_KEY =
  'finance-app:selected-banks'

interface BanksContextValue {
  selectedBankIds: string[]
  selectedBanks: BankOption[]
  availableBanks: BankOption[]
  setSelectedBanks: (
    bankIds: string[],
  ) => void
  addBanks: (
    bankIds: string[],
  ) => void
  removeBank: (
    bankId: string,
  ) => void
  hasBank: (
    bankId: string,
  ) => boolean
}

interface BanksProviderProps {
  children: ReactNode
}

const BanksContext =
  createContext<BanksContextValue | null>(
    null,
  )

function readStoredBankIds(): string[] {
  try {
    const storedValue =
      window.localStorage.getItem(
        STORAGE_KEY,
      )

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown =
      JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    const validBankIds = new Set(
      banks.map((bank) => bank.value),
    )

    return parsedValue.filter(
      (bankId): bankId is string =>
        typeof bankId === 'string' &&
        validBankIds.has(bankId),
    )
  } catch {
    return []
  }
}

function saveBankIds(
  bankIds: string[],
): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(bankIds),
  )
}

function removeDuplicateBankIds(
  bankIds: string[],
): string[] {
  return [...new Set(bankIds)]
}

export function BanksProvider({
  children,
}: BanksProviderProps) {
  const [
    selectedBankIds,
    setSelectedBankIds,
  ] = useState<string[]>(
    readStoredBankIds,
  )

  const setSelectedBanks =
    useCallback(
      (bankIds: string[]) => {
        const uniqueBankIds =
          removeDuplicateBankIds(
            bankIds,
          )

        setSelectedBankIds(
          uniqueBankIds,
        )

        saveBankIds(
          uniqueBankIds,
        )
      },
      [],
    )

  const addBanks =
    useCallback(
      (bankIds: string[]) => {
        setSelectedBankIds(
          (currentBankIds) => {
            const updatedBankIds =
              removeDuplicateBankIds([
                ...currentBankIds,
                ...bankIds,
              ])

            saveBankIds(
              updatedBankIds,
            )

            return updatedBankIds
          },
        )
      },
      [],
    )

  const removeBank =
    useCallback(
      (bankId: string) => {
        setSelectedBankIds(
          (currentBankIds) => {
            const updatedBankIds =
              currentBankIds.filter(
                (currentBankId) =>
                  currentBankId !==
                  bankId,
              )

            saveBankIds(
              updatedBankIds,
            )

            return updatedBankIds
          },
        )
      },
      [],
    )

  const hasBank =
    useCallback(
      (bankId: string) =>
        selectedBankIds.includes(
          bankId,
        ),
      [selectedBankIds],
    )

  const selectedBanks =
    useMemo(
      () =>
        banks.filter((bank) =>
          selectedBankIds.includes(
            bank.value,
          ),
        ),
      [selectedBankIds],
    )

  const availableBanks =
    useMemo(
      () =>
        banks.filter(
          (bank) =>
            !selectedBankIds.includes(
              bank.value,
            ),
        ),
      [selectedBankIds],
    )

  const contextValue =
    useMemo<BanksContextValue>(
      () => ({
        selectedBankIds,
        selectedBanks,
        availableBanks,
        setSelectedBanks,
        addBanks,
        removeBank,
        hasBank,
      }),
      [
        selectedBankIds,
        selectedBanks,
        availableBanks,
        setSelectedBanks,
        addBanks,
        removeBank,
        hasBank,
      ],
    )

  return (
    <BanksContext.Provider
      value={contextValue}
    >
      {children}
    </BanksContext.Provider>
  )
}

export function useBanks(): BanksContextValue {
  const context =
    useContext(BanksContext)

  if (!context) {
    throw new Error(
      'useBanks must be used inside BanksProvider',
    )
  }

  return context
}