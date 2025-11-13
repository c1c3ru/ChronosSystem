'use client'

import { useSession } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { handleCompleteLogout } from '@/lib/logout'

export function SessionButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button asChild variant="secondary" size="sm">
          <Link href="/auth/signin">
            <User className="h-4 w-4 mr-2" />
            Entrar
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
        <span className="text-white text-sm font-medium">
          {session.user.name || session.user.email}
        </span>
        <span className="text-slate-400 text-xs ml-2">
          ({session.user.role})
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleCompleteLogout}
        className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:bg-slate-700/80"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
