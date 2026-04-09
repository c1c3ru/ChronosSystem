/**
 * Funções de geolocalização para validação de proximidade
 * Implementa cálculo de distância usando fórmula de Haversine
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Raio da Terra em metros
 */
const EARTH_RADIUS_METERS = 6371000

/**
 * Converte graus para radianos
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 *
 * A fórmula de Haversine calcula a distância do grande círculo entre dois pontos
 * na superfície de uma esfera, dadas suas latitudes e longitudes.
 *
 * @param point1 - Primeira coordenada (latitude, longitude)
 * @param point2 - Segunda coordenada (latitude, longitude)
 * @returns Distância em metros
 *
 * @example
 * ```typescript
 * const userLocation = { latitude: -3.7319, longitude: -38.5267 }
 * const machineLocation = { latitude: -3.7320, longitude: -38.5268 }
 * const distance = calculateDistance(userLocation, machineLocation)
 * console.log(`Distância: ${distance.toFixed(2)} metros`)
 * ```
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  // Validar coordenadas
  if (!isValidCoordinate(point1) || !isValidCoordinate(point2)) {
    throw new Error('Coordenadas inválidas')
  }

  const lat1 = toRadians(point1.latitude)
  const lat2 = toRadians(point2.latitude)
  const deltaLat = toRadians(point2.latitude - point1.latitude)
  const deltaLon = toRadians(point2.longitude - point1.longitude)

  // Fórmula de Haversine
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = EARTH_RADIUS_METERS * c

  return distance
}

/**
 * Verifica se as coordenadas são válidas
 */
export function isValidCoordinate(coord: Coordinates): boolean {
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180 &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude)
  )
}

/**
 * Verifica se o usuário está dentro do raio permitido da máquina
 *
 * @param userLocation - Localização do usuário
 * @param machineLocation - Localização da máquina
 * @param maxRadiusMeters - Raio máximo permitido em metros (padrão: 100m)
 * @returns true se o usuário está dentro do raio, false caso contrário
 *
 * @example
 * ```typescript
 * const isNearby = isWithinRadius(
 *   { latitude: -3.7319, longitude: -38.5267 },
 *   { latitude: -3.7320, longitude: -38.5268 },
 *   100 // 100 metros
 * )
 * ```
 */
export function isWithinRadius(
  userLocation: Coordinates,
  machineLocation: Coordinates,
  maxRadiusMeters: number = 100
): boolean {
  const distance = calculateDistance(userLocation, machineLocation)
  return distance <= maxRadiusMeters
}

/**
 * Valida a proximidade e retorna informações detalhadas
 *
 * @param userLocation - Localização do usuário
 * @param machineLocation - Localização da máquina
 * @param maxRadiusMeters - Raio máximo permitido em metros
 * @returns Objeto com resultado da validação e detalhes
 */
export function validateProximity(
  userLocation: Coordinates,
  machineLocation: Coordinates,
  maxRadiusMeters: number = 100
): {
  isValid: boolean
  distance: number
  maxRadius: number
  message: string
} {
  try {
    const distance = calculateDistance(userLocation, machineLocation)
    const isValid = distance <= maxRadiusMeters

    return {
      isValid,
      distance: Math.round(distance * 10) / 10, // Arredondar para 1 casa decimal
      maxRadius: maxRadiusMeters,
      message: isValid
        ? `Usuário dentro do raio permitido (${Math.round(distance)}m de ${maxRadiusMeters}m)`
        : `Usuário muito distante (${Math.round(distance)}m, máximo permitido: ${maxRadiusMeters}m)`,
    }
  } catch (error) {
    return {
      isValid: false,
      distance: 0,
      maxRadius: maxRadiusMeters,
      message: error instanceof Error ? error.message : 'Erro ao validar proximidade',
    }
  }
}

/**
 * Formata distância para exibição amigável
 *
 * @param meters - Distância em metros
 * @returns String formatada (ex: "50m" ou "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * Obtém coordenadas do navegador (client-side)
 *
 * @param options - Opções de geolocalização
 * @returns Promise com as coordenadas
 */
export function getCurrentPosition(options?: PositionOptions): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        let message = 'Erro ao obter localização'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Localização indisponível'
            break
          case error.TIMEOUT:
            message = 'Timeout ao obter localização'
            break
        }
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    )
  })
}

/**
 * Configuração padrão de raio por tipo de ambiente
 */
export const DEFAULT_RADIUS = {
  STRICT: 50, // 50 metros - ambiente controlado
  NORMAL: 100, // 100 metros - padrão
  RELAXED: 200, // 200 metros - mais flexível
  VERY_RELAXED: 500, // 500 metros - muito flexível
} as const

/**
 * Exemplo de uso completo:
 *
 * ```typescript
 * import { getCurrentPosition, validateProximity, DEFAULT_RADIUS } from '@/lib/geolocation'
 *
 * // No cliente (browser)
 * const userLocation = await getCurrentPosition()
 *
 * // No servidor (API)
 * const machineLocation = { latitude: -3.7320, longitude: -38.5268 }
 * const validation = validateProximity(
 *   userLocation,
 *   machineLocation,
 *   DEFAULT_RADIUS.NORMAL
 * )
 *
 * if (!validation.isValid) {
 *   throw new Error(validation.message)
 * }
 * ```
 */
