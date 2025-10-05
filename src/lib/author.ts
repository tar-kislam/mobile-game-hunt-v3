export type Authorable = {
  user?: { name?: string | null; role?: string | null } | null
  maker?: { name?: string | null; role?: string | null } | null
}

export function getAuthorLabel(entity: Authorable): string {
  const role = entity.user?.role || entity.maker?.role || ''
  if (role.toUpperCase?.() === 'ADMIN' || role === 'ADMIN') {
    return 'MobileGameHunt'
  }
  const name = entity.user?.name || entity.maker?.name
  return name || 'Anonymous'
}

