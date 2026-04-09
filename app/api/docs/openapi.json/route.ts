import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/swagger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/docs/openapi.json:
 *   get:
 *     summary: Retorna a especificação OpenAPI em formato JSON
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Especificação OpenAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  return NextResponse.json(swaggerSpec)
}
