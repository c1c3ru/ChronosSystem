/**
 * Lista de matrículas SIAPE autorizadas como administradores
 * 
 * Apenas usuários com essas matrículas podem se cadastrar como ADMIN
 * Todos os outros serão automaticamente definidos como EMPLOYEE
 */

export const AUTHORIZED_ADMIN_SIAPE = [
  // Adicione aqui as matrículas SIAPE dos administradores autorizados
  '2283496',  // Exemplo - substitua pelas matrículas reais
  '2418058',  // Exemplo - substitua pelas matrículas reais
  '1525904',  // Exemplo - substitua pelas matrículas reais
  '1757600',  // Exemplo - substitua pelas matrículas reais
  '1390898',  // Exemplo - substitua pelas matrículas reais
  '1641862',  // Exemplo - substitua pelas matrículas reais
  '1943432',  // Exemplo - substitua pelas matrículas reais
  '3071234',  // Exemplo - substitua pelas matrículas reais
  '2232252',  // Exemplo - substitua pelas matrículas reais
  '1648779',  // Exemplo - substitua pelas matrículas reais
  '1954873',  // Exemplo - substitua pelas matrículas reais
  '2703399',  // Exemplo - substitua pelas matrículas reais
  '1954453',  // Exemplo - substitua pelas matrículas reais
  '1818968',  // Exemplo - substitua pelas matrículas reais
  '2239943',  // Exemplo - substitua pelas matrículas reais
  '1838642',  // Exemplo - substitua pelas matrículas reais
  '2795588',  // Exemplo - substitua pelas matrículas reais
  '2187585',  // Exemplo - substitua pelas matrículas reais
  '1418335',  // Exemplo - substitua pelas matrículas reais
  '1683102',  // Exemplo - substitua pelas matrículas reais
  '1955023',  // Exemplo - substitua pelas matrículas reais
  '1675632',  // Exemplo - substitua pelas matrículas reais
  '1793556',  // Exemplo - substitua pelas matrículas reais
  '1683113',  // Exemplo - substitua pelas matrículas reais
  '2280853',  // Exemplo - substitua pelas matrículas reais
  '2765550',  // Exemplo - substitua pelas matrículas reais
  '1955099',  // Exemplo - substitua pelas matrículas reais
  '2558539',  // Exemplo - substitua pelas matrículas reais
  '2229734',  // Exemplo - substitua pelas matrículas reais
  '1795230',  // Exemplo - substitua pelas matrículas reais
  '2165051',  // Exemplo - substitua pelas matrículas reais
  '2279734',  // Exemplo - substitua pelas matrículas reais
  '1978162',  // Exemplo - substitua pelas matrículas reais
  '1675435',  // Exemplo - substitua pelas matrículas reais
  '1794127',  // Exemplo - substitua pelas matrículas reais
  '1586384',  // Exemplo - substitua pelas matrículas reais
  '2416569',  // Exemplo - substitua pelas matrículas reais
  '1557215',  // Exemplo - substitua pelas matrículas reais
  '3095244',  // Exemplo - substitua pelas matrículas reais
  '2857778',  // Exemplo - substitua pelas matrículas reais
  '2809160',  // Exemplo - substitua pelas matrículas reais
  '2390918',  // Exemplo - substitua pelas matrículas reais
  '1891121',  // Exemplo - substitua pelas matrículas reais
  '2225884',  // Exemplo - substitua pelas matrículas reais
  '2773490',  // Exemplo - substitua pelas matrículas reais
  '2230726'   // Exemplo - substitua pelas matrículas reais
]

/**
 * Verifica se uma matrícula SIAPE está autorizada como admin
 */
export function isAuthorizedAdminSiape(siapeNumber: string): boolean {
  return AUTHORIZED_ADMIN_SIAPE.includes(siapeNumber.trim())
}

/**
 * Determina o role baseado na matrícula SIAPE
 */
export function determineRoleFromSiape(siapeNumber?: string): 'ADMIN' | 'EMPLOYEE' {
  if (!siapeNumber) return 'EMPLOYEE'
  
  return isAuthorizedAdminSiape(siapeNumber) ? 'ADMIN' : 'EMPLOYEE'
}
