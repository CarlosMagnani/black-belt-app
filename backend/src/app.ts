import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })
  app.register(helmet)

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
