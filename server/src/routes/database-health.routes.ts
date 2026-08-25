import type { FastifyInstance } from 'fastify'

import { getDatabasePool } from '../database/connection.js'

interface DatabaseHealthRow {
  databaseName: string
  connectedUser: string
  serverName: string
  serverDate: Date
}

export async function databaseHealthRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get('/health/database', async (_request, reply) => {
    const pool = await getDatabasePool()

    const result = await pool
      .request()
      .query<DatabaseHealthRow>(`
        SELECT
          DB_NAME() AS databaseName,
          SUSER_SNAME() AS connectedUser,
          @@SERVERNAME AS serverName,
          GETDATE() AS serverDate;
      `)

    const database = result.recordset[0]

    if (!database) {
      throw new Error(
        'SQL Server did not return health information',
      )
    }

    return reply.status(200).send({
      status: 'ok',
      database: {
        name: database.databaseName,
        server: database.serverName,
        connectedUser: database.connectedUser,
        serverDate: database.serverDate,
      },
    })
  })
}