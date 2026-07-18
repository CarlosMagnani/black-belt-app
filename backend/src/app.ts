import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import { DefaultAuthService, type AuthService } from './modules/auth/auth.service'
import { createSupabaseTokenVerifier } from './modules/auth/supabase-token-verifier'
import type { AccessTokenVerifier } from './modules/auth/auth.types'
import { PrismaUserRepository } from './modules/users/user.repository'
import { authPlugin } from './plugins/auth'
import { createObjectStorage } from './modules/storage/create-object-storage'
import { DefaultAcademyService, type AcademyService } from './modules/academy/academy.service'
import { PrismaAcademyRepository } from './modules/academy/academy.repository'
import { academyRoutes } from './modules/academy/academy.routes'
import { DefaultMembershipService, type MembershipService } from './modules/membership/membership.service'
import { PrismaMembershipRepository } from './modules/membership/membership.repository'
import { membershipRoutes } from './modules/membership/membership.routes'
import { DefaultRosterService, type RosterService } from './modules/academy/roster/roster.service'
import { PrismaRosterRepository } from './modules/academy/roster/roster.repository'
import { rosterRoutes } from './modules/academy/roster/roster.routes'
import { DefaultScheduleService, type ScheduleService } from './modules/schedule/schedule.service'
import { PrismaScheduleRepository } from './modules/schedule/schedule.repository'
import { scheduleRoutes } from './modules/schedule/schedule.routes'

type BuildAppOptions = {
  academyService?: AcademyService
  authService?: AuthService
  logger?: boolean
  membershipService?: MembershipService
  rosterService?: RosterService
  scheduleService?: ScheduleService
  supabaseUrl: string
  supabaseSecretKey?: string
  storageBucket?: string
  verifyAccessToken?: AccessTokenVerifier
}

export function buildApp(options: BuildAppOptions) {
  const app = Fastify({ logger: options.logger ?? true })
  const userRepository = new PrismaUserRepository()
  const authService = options.authService ?? new DefaultAuthService(userRepository)
  const verifyAccessToken = options.verifyAccessToken ?? createSupabaseTokenVerifier(options.supabaseUrl)

  const academyService = options.academyService ?? createDefaultAcademyService(options)
  const membershipService = options.membershipService ?? createDefaultMembershipService(options)
  const rosterService = options.rosterService ?? new DefaultRosterService(new PrismaRosterRepository())
  const scheduleService = options.scheduleService ?? new DefaultScheduleService(new PrismaScheduleRepository())

  app.register(cors, { origin: true })
  app.register(helmet)
  app.register(multipart, {
    throwFileSizeLimit: false,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  })
  app.register(authPlugin, {
    authService,
    verifyAccessToken,
  })

  app.register(async (app) => {
    await academyRoutes(app, academyService, authService, verifyAccessToken)
    await membershipRoutes(app, membershipService, authService, verifyAccessToken)
    await rosterRoutes(app, rosterService, authService, verifyAccessToken)
    await scheduleRoutes(app, scheduleService, authService, verifyAccessToken)
  })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}

function createDefaultAcademyService(options: BuildAppOptions) {
  const objectStorage = createObjectStorage({
    provider: 'supabase',
    supabaseUrl: options.supabaseUrl,
    secretKey: options.supabaseSecretKey ?? '',
    bucket: options.storageBucket ?? 'academy-media',
  })

  return new DefaultAcademyService(new PrismaAcademyRepository(), objectStorage)
}

function createDefaultMembershipService(options: BuildAppOptions) {
  const objectStorage = createObjectStorage({
    provider: 'supabase',
    supabaseUrl: options.supabaseUrl,
    secretKey: options.supabaseSecretKey ?? '',
    bucket: options.storageBucket ?? 'academy-media',
  })

  return new DefaultMembershipService(new PrismaMembershipRepository(), objectStorage)
}
