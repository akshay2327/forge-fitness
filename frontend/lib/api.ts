const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'

export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('forge_token') : null

export const getUser = () => {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('forge_user')
  return u ? JSON.parse(u) : null
}

export const setSession = (token: string, user: any) => {
  localStorage.setItem('forge_token', token)
  localStorage.setItem('forge_user', JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem('forge_token')
  localStorage.removeItem('forge_user')
}

async function request(path: string, opts: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  get:    (path: string)              => request(path),
  post:   (path: string, body: any)   => request(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  (path: string, body: any)   => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string)              => request(path, { method: 'DELETE' }),
}
