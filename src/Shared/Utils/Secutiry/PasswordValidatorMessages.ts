import { PasswordValidationError } from "./PasswordValidator";

export const PASSWORD_ERROR_MESSAGES: Record<PasswordValidationError, string> = {
  TOO_SHORT: 'A senha deve ter pelo menos 12 caracteres.',
  TOO_LONG: 'A senha é longa demais.',
  COMMON_PASSWORD: 'A senha é muito comum. Escolha uma senha mais forte.',
  REPETITION_PATTERN: 'A senha tem um padrão de repetição fácil de adivinhar.',
  SEQUENCE_PATTERN: 'A senha contém sequência (ex: 1234, abcd).',
  KEYBOARD_PATTERN: 'A senha contém padrão de teclado (ex: qwerty).',
  LOW_COMPLEXITY: 'A senha precisa misturar melhor os tipos de caracteres (ou ter 16+ caracteres).',
};