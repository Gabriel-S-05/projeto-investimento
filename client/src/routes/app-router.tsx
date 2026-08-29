import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom'

import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { BanksPage } from '../features/banks/pages/BankPage'
import { BankDetailsPage } from '../features/banks/pages/BankDetailsPage'

import { routePaths } from './route-paths'

export const appRouter = createBrowserRouter([
  {
    path: routePaths.home,
    element: (
      <Navigate
        to={routePaths.login}
        replace
      />
    ),
  },
  {
    path: routePaths.login,
    element: <LoginPage />,
  },
  {
    path: routePaths.register,
    element: <RegisterPage />,
  },
  {
    path: routePaths.banks,
    element: <BanksPage />,
  },
  {
  path: routePaths.bankDetails,
  element: <BankDetailsPage />,
  },
  {
    path: '*',
    element: (
      <Navigate
        to={routePaths.login}
        replace
      />
    ),
  },
])