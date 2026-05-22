/**
 * Configuração do OpenAPI/Swagger para documentação da API
 */

import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChronosSystem API',
      version: '2.0.0',
      description: 'API completa do sistema de registro de ponto eletrônico ChronosSystem',
      contact: {
        name: 'Suporte ChronosSystem',
        email: 'suporte@chronossystem.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://chronossystem.com',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido via autenticação',
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'Cookie de sessão do NextAuth',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'name', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único do usuário (CUID)',
              example: 'clh1234567890abcdef',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'usuario@exemplo.com',
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'],
              description: 'Função do usuário no sistema',
              example: 'EMPLOYEE',
            },
            department: {
              type: 'string',
              description: 'Departamento do usuário',
              example: 'TI',
            },
            profileComplete: {
              type: 'boolean',
              description: 'Indica se o perfil está completo',
              example: true,
            },
            twoFactorEnabled: {
              type: 'boolean',
              description: 'Indica se 2FA está habilitado',
              example: false,
            },
          },
        },
        AttendanceRecord: {
          type: 'object',
          required: ['id', 'userId', 'machineId', 'type', 'timestamp'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único do registro',
              example: 'clh1234567890abcdef',
            },
            userId: {
              type: 'string',
              description: 'ID do usuário',
              example: 'clh1234567890abcdef',
            },
            machineId: {
              type: 'string',
              description: 'ID da máquina',
              example: 'clh1234567890abcdef',
            },
            type: {
              type: 'string',
              enum: ['ENTRY', 'EXIT'],
              description: 'Tipo de registro',
              example: 'ENTRY',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora do registro',
              example: '2024-12-28T14:30:00Z',
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'Latitude da localização',
              example: -3.7319,
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'Longitude da localização',
              example: -38.5267,
            },
            qrData: {
              type: 'string',
              description: 'Dados do QR Code escaneado',
            },
            hash: {
              type: 'string',
              description: 'Hash para integridade do registro',
            },
          },
        },
        Machine: {
          type: 'object',
          required: ['id', 'name', 'location'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único da máquina',
              example: 'clh1234567890abcdef',
            },
            name: {
              type: 'string',
              description: 'Nome da máquina',
              example: 'Terminal Entrada Principal',
            },
            location: {
              type: 'string',
              description: 'Localização da máquina',
              example: 'Recepção - 1º Andar',
            },
            isActive: {
              type: 'boolean',
              description: 'Indica se a máquina está ativa',
              example: true,
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'Latitude da máquina',
              example: -3.732,
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'Longitude da máquina',
              example: -38.5268,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Não autorizado',
            },
            message: {
              type: 'string',
              description: 'Descrição detalhada do erro',
              example: 'Você não tem permissão para acessar este recurso',
            },
            details: {
              type: 'object',
              description: 'Detalhes adicionais do erro',
            },
          },
        },
        RateLimitError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Rate limit exceeded',
            },
            message: {
              type: 'string',
              example: 'Too many requests. Please try again later.',
            },
            retryAfter: {
              type: 'integer',
              description: 'Segundos até poder tentar novamente',
              example: 60,
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Não autenticado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Forbidden: {
          description: 'Não autorizado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        RateLimitExceeded: {
          description: 'Limite de requisições excedido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RateLimitError',
              },
            },
          },
        },
        ServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        sessionAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticação e autorização',
      },
      {
        name: 'Attendance',
        description: 'Endpoints de registro de ponto',
      },
      {
        name: 'Users',
        description: 'Gerenciamento de usuários',
      },
      {
        name: 'Machines',
        description: 'Gerenciamento de máquinas',
      },
      {
        name: 'Reports',
        description: 'Geração de relatórios',
      },
      {
        name: 'Dashboard',
        description: 'Dados do dashboard',
      },
    ],
  },
  apis: ['./app/api/**/*.ts'], // Caminho para os arquivos com JSDoc
}

export const swaggerSpec = swaggerJsdoc(options)
