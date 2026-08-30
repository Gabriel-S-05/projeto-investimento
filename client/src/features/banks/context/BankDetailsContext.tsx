import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  BankAccountDetails,
} from '../types/bank-details'

type BankAccountDetailsByBankId =
  Record<
    string,
    BankAccountDetails
  >

interface BankDetailsContextValue {
  accountDetailsByBankId:
    BankAccountDetailsByBankId

  getAccountDetails: (
    bankId: string,
  ) => BankAccountDetails | null

  saveAccountDetails: (
    accountDetails:
      BankAccountDetails,
  ) => void

  removeAccountDetails: (
    bankId: string,
  ) => void

  hasAccountDetails: (
    bankId: string,
  ) => boolean
}

interface BankDetailsProviderProps {
  children: ReactNode
}

const BankDetailsContext =
  createContext<
    BankDetailsContextValue | null
  >(null)

export function BankDetailsProvider({
  children,
}: BankDetailsProviderProps) {
  const [
    accountDetailsByBankId,
    setAccountDetailsByBankId,
  ] = useState<
    BankAccountDetailsByBankId
  >({})

  const getAccountDetails =
    useCallback(
      (
        bankId: string,
      ): BankAccountDetails | null => {
        return (
          accountDetailsByBankId[
            bankId
          ] ?? null
        )
      },
      [accountDetailsByBankId],
    )

  const saveAccountDetails =
    useCallback(
      (
        accountDetails:
          BankAccountDetails,
      ): void => {
        setAccountDetailsByBankId(
          (currentDetails) => ({
            ...currentDetails,

            [accountDetails.bankId]:
              accountDetails,
          }),
        )
      },
      [],
    )

  const removeAccountDetails =
    useCallback(
      (
        bankId: string,
      ): void => {
        setAccountDetailsByBankId(
          (currentDetails) => {
            const updatedDetails = {
              ...currentDetails,
            }

            delete updatedDetails[
              bankId
            ]

            return updatedDetails
          },
        )
      },
      [],
    )

  const hasAccountDetails =
    useCallback(
      (
        bankId: string,
      ): boolean => {
        return Boolean(
          accountDetailsByBankId[
            bankId
          ],
        )
      },
      [accountDetailsByBankId],
    )

  const contextValue =
    useMemo<
      BankDetailsContextValue
    >(
      () => ({
        accountDetailsByBankId,
        getAccountDetails,
        saveAccountDetails,
        removeAccountDetails,
        hasAccountDetails,
      }),
      [
        accountDetailsByBankId,
        getAccountDetails,
        saveAccountDetails,
        removeAccountDetails,
        hasAccountDetails,
      ],
    )

  return (
    <BankDetailsContext.Provider
      value={contextValue}
    >
      {children}
    </BankDetailsContext.Provider>
  )
}

export function useBankDetails():
  BankDetailsContextValue {
  const context =
    useContext(
      BankDetailsContext,
    )

  if (!context) {
    throw new Error(
      'useBankDetails must be used inside BankDetailsProvider',
    )
  }

  return context
}