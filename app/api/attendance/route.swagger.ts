/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Lista registros de ponto
 *     tags: [Attendance]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID do usuário (opcional, apenas ADMIN/SUPERVISOR)
 *       - in: query
 *         name: machineId
 *         schema:
 *           type: string
 *         description: ID da máquina
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data inicial
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data final
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de registros de ponto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 *   post:
 *     summary: Cria um novo registro de ponto
 *     tags: [Attendance]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - machineId
 *               - type
 *               - qrData
 *             properties:
 *               machineId:
 *                 type: string
 *                 description: ID da máquina
 *               type:
 *                 type: string
 *                 enum: [ENTRY, EXIT]
 *                 description: Tipo de registro
 *               qrData:
 *                 type: string
 *                 description: Dados do QR Code
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude (opcional)
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude (opcional)
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
