'use client'

import dynamic from 'next/dynamic'

// SwaggerUIClient importa swagger-ui-react e seu CSS com imports ESM normais.
// O dynamic com ssr:false impede que o Turbopack processe esses módulos no servidor.
const SwaggerUIClient = dynamic(() => import('./SwaggerUIClient'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ChronosSystem API Documentation</h1>
          <p className="text-gray-600">Documentação completa da API REST do ChronosSystem</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <SwaggerUIClient url="/api/docs/openapi.json" />
        </div>
      </div>
    </div>
  )
}
