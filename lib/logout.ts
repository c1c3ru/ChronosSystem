import { signOut } from 'next-auth/react'

/**
 * Função para fazer logout completo incluindo Google
 */
export async function handleCompleteLogout() {
  try {
    // Fazer logout do NextAuth com redirecionamento para página inicial
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
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

/**
 * Função para logout sem redirecionamento (para uso em componentes)
 */
export async function handleLogoutNoRedirect() {
  try {
    await signOut({ redirect: false })
    
    // Limpar storage local
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  } catch (error) {
    console.error('Erro durante logout:', error)
  }
}
