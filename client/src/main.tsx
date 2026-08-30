import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { BanksProvider } from './features/banks/context/BanksContext'
import { BankDetailsProvider } from './features/banks/context/BankDetailsContext'

import { appRouter } from './routes/app-router'

import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider
      client={queryClient}
    >
      <BanksProvider>
        <BankDetailsProvider>
          <RouterProvider
            router={appRouter}
          />
        </BankDetailsProvider>
      </BanksProvider>
    </QueryClientProvider>
  </StrictMode>,
)