import DocumentsAuthGuard from './DocumentsAuthGuard'

export const metadata = {
  title: 'Documentos de Estágio - Chronos System',
  description: 'Formulários e documentos para estágio supervisionado',
}

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DocumentsAuthGuard>{children}</DocumentsAuthGuard>
}
