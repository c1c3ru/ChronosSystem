import Link from 'next/link'
import { Clock, Users, Shield, Smartphone, ArrowRight, Zap, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <Clock className="h-16 w-16 text-primary animate-glow" />
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
            </div>
            <div className="ml-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight">
                Chronos System
              </h1>
              <div className="h-1 w-32 bg-gradient-primary rounded-full mt-2" />
            </div>
          </div>
          
          <p className="text-xl lg:text-2xl text-neutral-300 max-w-3xl mx-auto text-balance leading-relaxed">
            Sistema moderno de registro de ponto eletrônico para estagiários
            <span className="block mt-2 text-lg text-primary font-medium">
              Simples • Seguro • Eficiente
            </span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card variant="glass" className="group hover:scale-105 transition-all duration-300 animate-slide-up">
            <CardContent className="p-8 text-center">
              <div className="bg-primary/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Gestão Completa
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                Controle total de usuários, máquinas e registros com interface intuitiva
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className="group hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-8 text-center">
              <div className="bg-secondary-500/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-500/30 transition-colors">
                <Shield className="h-10 w-10 text-secondary-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Segurança Avançada
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                QR codes seguros com validação temporal e sistema de auditoria
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className="group hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-8 text-center">
              <div className="bg-warning/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-warning/30 transition-colors">
                <Zap className="h-10 w-10 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Performance
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                Interface rápida e responsiva para todos os dispositivos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Por que escolher o Chronos System?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              'Setup em 2 minutos - sem configurações complexas',
              'Interface única para admin, estagiário e kiosk',
              'Banco SQLite - zero configuração necessária',
              'Deploy com 1 clique na Vercel ou Netlify',
              'Design moderno com tokens profissionais',
              'Código limpo e bem documentado'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-neutral-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <Card variant="elevated" className="group hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="gradient-primary h-2" />
            <CardContent className="p-8 text-center">
              <div className="bg-primary/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Painel Administrativo
              </h3>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                Dashboard completo para administradores e supervisores gerenciarem o sistema
              </p>
              <Button asChild className="w-full group">
                <Link href="/admin">
                  Acessar Admin
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated" className="group hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="gradient-secondary h-2" />
            <CardContent className="p-8 text-center">
              <div className="bg-secondary-500/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-500/30 transition-colors">
                <Users className="h-10 w-10 text-secondary-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Portal do Estagiário
              </h3>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                Interface mobile-first para registrar ponto e acompanhar histórico
              </p>
              <Button asChild variant="secondary" className="w-full group">
                <Link href="/employee">
                  Acessar Portal
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated" className="group hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-warning to-orange-500 h-2" />
            <CardContent className="p-8 text-center">
              <div className="bg-warning/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-warning/30 transition-colors">
                <Clock className="h-10 w-10 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Kiosk
              </h3>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                Tela fullscreen com QR code rotativo para registro de ponto
              </p>
              <Button asChild variant="ghost" className="w-full group border border-warning/30 hover:bg-warning/10">
                <Link href="/kiosk">
                  Abrir Kiosk
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-neutral-700/50">
          <p className="text-neutral-500 text-sm">
            © 2024 Chronos System. Sistema de ponto eletrônico moderno e seguro.
          </p>
          <p className="text-neutral-600 text-xs mt-2">
            Desenvolvido com ❤️ usando Next.js, Tailwind CSS e Design Tokens
          </p>
        </div>
      </div>
    </div>
  )
}
