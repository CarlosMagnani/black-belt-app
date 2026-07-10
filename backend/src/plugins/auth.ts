import type { FastifyInstance } from 'fastify'
import { authRoutes } from '../modules/auth/auth.routes'
import type { AuthService } from '../modules/auth/auth.service'
import type { AccessTokenVerifier } from '../modules/auth/auth.types'

type AuthPluginOptions = {
  authService: AuthService
  verifyAccessToken: AccessTokenVerifier
}

export async function authPlugin(app: FastifyInstance, options: AuthPluginOptions) {
  app.decorateRequest('authenticatedUser')
  app.decorateRequest('userOnboardingRole')
  await authRoutes(app, options.authService, options.verifyAccessToken)
}
