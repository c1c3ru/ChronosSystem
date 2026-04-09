import { InternshipRegistrationForm } from '@/components/InternshipRegistrationForm'

export const metadata = {
  title: 'Demo - Formulário de Cadastro de Estágio',
  description: 'Demonstração do formulário oficial do IFCE',
}

export default function DemoFormPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[210mm] mx-auto mb-4 px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h2 className="font-bold text-blue-900 mb-2">📋 Demonstração do Formulário Oficial</h2>
          <p className="text-blue-800">
            Esta é uma demonstração do novo layout dos formulários oficiais do IFCE. O formulário
            agora possui bordas visíveis nos campos, estilo de documento impresso, e segue fielmente
            o padrão oficial.
          </p>
        </div>
      </div>
      <InternshipRegistrationForm
        userId="demo-user"
        userName="João da Silva"
        userEmail="joao@demo.com"
      />
    </div>
  )
}
