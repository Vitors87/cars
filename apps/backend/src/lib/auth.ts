import { prisma } from './prisma'

type AppUser = {
  id: string
  clerkId: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  country: string
  totalPoints: number
  isPremium: boolean
  premiumUntil: Date | null
  createdAt: Date
  updatedAt: Date
}

const DEV_USER = {
  clerkId: 'dev-user-001',
  username: 'testdriver',
  displayName: 'Test Driver',
  avatarUrl: null,
  country: 'CL',
}

async function getDevUser(): Promise<AppUser> {
  return prisma.user.upsert({
    where: { clerkId: DEV_USER.clerkId },
    update: {},
    create: DEV_USER,
  }) as Promise<AppUser>
}

export async function getOrCreateUser(): Promise<AppUser | null> {
  return getDevUser()
}

export async function requireUser(): Promise<AppUser> {
  const user = await getOrCreateUser()
  if (!user) throw Object.assign(new Error('No autorizado'), { code: 'UNAUTHORIZED' })
  return user
}

export function isAdmin(req: Request): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}
