// Custo do bcrypt (fator de trabalho). 12 é o mínimo recomendado atualmente
// pela OWASP para bcrypt (2024+). Mantido centralizado para facilitar
// futuras revisões e evitar divergência entre rotas.
export const BCRYPT_SALT_ROUNDS = 12

// Tamanho mínimo de senha aceito em cadastro/reset/alteração de senha.
export const MIN_PASSWORD_LENGTH = 8
