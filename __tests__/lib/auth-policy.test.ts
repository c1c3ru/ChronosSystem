import { isAdminApiPath, isOwnUserApiPath } from '@/lib/auth-policy'

describe('isOwnUserApiPath ("Meu perfil")', () => {
  it('libera só o próprio id', () => {
    expect(isOwnUserApiPath('/api/users/aluno-1', 'aluno-1')).toBe(true)
    expect(isOwnUserApiPath('/api/users/aluno-2', 'aluno-1')).toBe(false)
  })

  it('não libera a listagem nem sub-rotas', () => {
    expect(isOwnUserApiPath('/api/users', 'aluno-1')).toBe(false)
    expect(isOwnUserApiPath('/api/users/contract', 'aluno-1')).toBe(false)
    expect(isOwnUserApiPath('/api/users/aluno-1/extra', 'aluno-1')).toBe(false)
  })

  it('não libera sem id no token', () => {
    expect(isOwnUserApiPath('/api/users/', undefined)).toBe(false)
    expect(isOwnUserApiPath('/api/users/', '')).toBe(false)
  })

  it('/api/users continua sendo API administrativa', () => {
    expect(isAdminApiPath('/api/users/aluno-1')).toBe(true)
  })
})
