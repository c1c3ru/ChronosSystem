'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Importar SwaggerUI dinamicamente para evitar SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        ChronosSystem API Documentation
                    </h1>
                    <p className="text-gray-600">
                        Documentação completa da API REST do ChronosSystem
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <SwaggerUI url="/api/docs/openapi.json" />
                </div>
            </div>
        </div>
    );
}
