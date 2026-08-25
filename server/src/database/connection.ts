import { createRequire } from 'node:module'

import type { ConnectionPool } from 'mssql'

import { env } from '../env/index.js'

const require = createRequire(import.meta.url)

const sql = require(
  'mssql/msnodesqlv8',
) as typeof import('mssql')

interface Msnodesqlv8Config {
  connectionString: string

  pool: {
    min: number
    max: number
    idleTimeoutMillis: number
  }

  connectionTimeout: number
  requestTimeout: number
}

const connectionString = [
  'Driver={ODBC Driver 18 for SQL Server}',
  `Server=${env.DB_SERVER}`,
  `Database=${env.DB_DATABASE}`,
  'Trusted_Connection=Yes',
  'Encrypt=Yes',
  'TrustServerCertificate=Yes',
].join(';')

const databaseConfig: Msnodesqlv8Config = {
  connectionString,

  pool: {
    min: 0,
    max: 10,
    idleTimeoutMillis: 30_000,
  },

  connectionTimeout: 15_000,
  requestTimeout: 30_000,
}

let databasePool: ConnectionPool | null = null

let connectionPromise:
  | Promise<ConnectionPool>
  | null = null

export async function getDatabasePool(): Promise<ConnectionPool> {
  if (databasePool?.connected) {
    return databasePool
  }

  if (connectionPromise) {
    return connectionPromise
  }

  const newPool = new sql.ConnectionPool(
    databaseConfig,
  )

  newPool.on('error', (error: Error) => {
    console.error(
      'SQL Server pool error:',
      error.message,
    )
  })

  connectionPromise = newPool
    .connect()
    .then((connectedPool: ConnectionPool) => {
      databasePool = connectedPool

      console.log(
        `Connected to SQL Server database: ${env.DB_DATABASE}`,
      )

      return connectedPool
    })
    .catch((error: unknown) => {
      databasePool = null
      throw error
    })
    .finally(() => {
      connectionPromise = null
    })

  return connectionPromise
}

export async function closeDatabasePool(): Promise<void> {
  if (!databasePool) {
    return
  }

  await databasePool.close()
  databasePool = null
}
