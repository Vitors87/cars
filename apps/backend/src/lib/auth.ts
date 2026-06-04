import type { User } from '@prisma/client'
import { prisma } from './prisma'

const DEV_USER = {
  clerkId: 'dev-user-001',
  username: 'testdriver',
  displayName: 'Test Driver',
  avatarUrl: null,
  country: 'CL',
}

async function getDevUser(): Promise<User> {
  return prisma.user.upsert({
    where: { clerkId: DEV_USER.clerkId },
    update: {},
    create: DEV_USER,
  })
}

export async function getOrCreateUser(): Promise<User | null> {
  // TODO producción: validar JWT de Clerk aquí
  return getDevUser()
}

export async function requireUser(): Promise<User> {
  const user = await getOrCreateUser()
  if (!user) throw Object.assign(new Error('No autorizado'), { code: 'UNAUTHORIZED' })
  return user
}

export function isAdmin(req: Request): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}
