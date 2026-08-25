import { buildApp } from './app.js'
import { env } from './env/index.js'

const app = buildApp()

async function startServer() {
  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    })

    app.log.info(`API running at http://${env.HOST}:${env.PORT}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

async function shutdown(signal: string) {
  app.log.info({ signal }, 'Shutting down API')

  try {
    await app.close()
    process.exit(0)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})

void startServer()
