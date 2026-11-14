import { signOut } from 'next-auth/react'
import { clearLocalDrafts } from '@/lib/form-drafts'

/**
 * Função para fazer logout completo incluindo Google
 */
export async function handleCompleteLogout() {
  try {
    // Limpar antes do signOut: com redirect: true, o código depois dele pode não rodar.
    // Os rascunhos de formulário têm CPF e endereço e não podem ficar para o próximo usuário.
    clearLocalDrafts()

    // Fazer logout do NextAuth com redirecionamento para página inicial
    await signOut({
      callbackUrl: '/',
      redirect: true,
    })

    // Opcional: Limpar storage local
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  } catch (error) {
    console.error('Erro durante logout:', error)
    // Fallback: redirecionar manualmente
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }
}
