import type { ReactNode } from 'react'
import {
  BarChart3,
  Landmark,
  LockKeyhole,
  WalletCards,
} from 'lucide-react'

import styles from './AuthLayout.module.css'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <section
        className={styles.presentation}
        aria-label="Apresentação do Finance App"
      >
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <WalletCards
              size={24}
              aria-hidden="true"
            />
          </div>

          <span>Finance App</span>
        </div>

        <div className={styles.presentationContent}>
          <span className={styles.eyebrow}>
            Organização financeira pessoal
          </span>

          <h1>
            Seu dinheiro mais claro, organizado e sob
            controle.
          </h1>

          <p>
            Reúna contas, receitas, despesas, parcelas e
            investimentos em um único lugar.
          </p>

          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <Landmark
                size={21}
                aria-hidden="true"
              />
              <span>Organize suas contas bancárias</span>
            </div>

            <div className={styles.benefit}>
              <BarChart3
                size={21}
                aria-hidden="true"
              />
              <span>Acompanhe sua evolução financeira</span>
            </div>

            <div className={styles.benefit}>
              <LockKeyhole
                size={21}
                aria-hidden="true"
              />
              <span>Seus dados tratados com segurança</span>
            </div>
          </div>
        </div>

        <p className={styles.presentationFooter}>
          Construído para decisões financeiras mais
          conscientes.
        </p>
      </section>

      <section className={styles.formArea}>
        <div className={styles.mobileBrand}>
          <WalletCards
            size={22}
            aria-hidden="true"
          />
          <span>Finance App</span>
        </div>

        <div className={styles.card}>
          {children}
        </div>
      </section>
    </main>
  )
}