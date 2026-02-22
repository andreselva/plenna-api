export type PasswordValidationError =
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'COMMON_PASSWORD'
  | 'REPETITION_PATTERN'
  | 'SEQUENCE_PATTERN'
  | 'KEYBOARD_PATTERN'
  | 'LOW_COMPLEXITY';

export type PasswordValidationResult = {
  valid: boolean;
  errors: PasswordValidationError[];
};

export default class PasswordValidator {
  private static readonly MIN_LEN = 8;
  private static readonly MAX_LEN = 128;

  /**
   * Lista curta (exemplo). Em produção, pluga uma wordlist maior (top 10k/100k).
   * Importante: manter tudo em minúsculo.
   */
  private static readonly COMMON_PASSWORDS = new Set<string>([
    '123456',
    '12345678',
    '123456789',
    'password',
    'qwerty',
    'admin',
    'letmein',
    'iloveyou',
    'senha',
    'senha123',
    'senhateste',
    'teste123',
    '123123',
    '111111',
    '000000',
  ]);

  /**
   * Valida a senha com um conjunto de regras "modernas":
   * - Min 12, max 128
   * - Se len >= 16: dispensa complexidade (passphrase friendly)
   * - Caso contrário: exigir 3 de 4 categorias (lower/upper/digit/symbol)
   * - Bloquear senhas comuns
   * - Bloquear repetição óbvia, sequências e padrões de teclado
   */
  public static validate(password: string): PasswordValidationResult {
    const errors: PasswordValidationError[] = [];

    // Sanitização mínima (não faz "trim" pra não mudar o significado)
    if (typeof password !== 'string') {
      return { valid: false, errors: ['TOO_SHORT'] };
    }

    // Normalização Unicode (reduz "confusões" de caracteres equivalentes)
    const pwd = password.normalize('NFKC');

    // Tamanho
    if (pwd.length < this.MIN_LEN) errors.push('TOO_SHORT');
    if (pwd.length > this.MAX_LEN) errors.push('TOO_LONG');

    // Se já estourou tamanho, ainda pode continuar acumulando erros (ou retornar cedo)
    const lowered = pwd.toLowerCase();
    if (this.COMMON_PASSWORDS.has(lowered)) errors.push('COMMON_PASSWORD');

    // Padrões óbvios: repetição / sequência / teclado
    if (this.hasRepetitionPattern(lowered)) errors.push('REPETITION_PATTERN');
    if (this.hasSequencePattern(lowered)) errors.push('SEQUENCE_PATTERN');
    if (this.hasKeyboardPattern(lowered)) errors.push('KEYBOARD_PATTERN');

    // Complexidade (só exige se len < 16)
    if (pwd.length < 16) {
      const categories = this.countCategories(pwd);
      if (categories < 3) errors.push('LOW_COMPLEXITY');
    }
    return { valid: errors.length === 0, errors };
  }

  private static countCategories(pwd: string): number {
    let hasLower = false;
    let hasUpper = false;
    let hasDigit = false;
    let hasSymbol = false;

    for (const ch of pwd) {
      const code = ch.codePointAt(0) ?? 0;

      if (code >= 48 && code <= 57) {
        hasDigit = true;
      } else if (code >= 65 && code <= 90) {
        hasUpper = true;
      } else if (code >= 97 && code <= 122) {
        hasLower = true;
      } else {
        hasSymbol = true;
      }
    }

    return Number(hasLower) + Number(hasUpper) + Number(hasDigit) + Number(hasSymbol);
  }

  private static hasRepetitionPattern(s: string): boolean {
    if (s.length >= 6 && /^(.)(\1)+$/.test(s)) return true;
    if (s.length >= 9 && /^(.{1,4})\1{2,}$/.test(s)) return true;
    return false;
  }

  private static hasSequencePattern(s: string): boolean {
    if (s.length < 4) return false;

    const filtered = s.replace(/[^a-z0-9]/g, '');
    if (filtered.length < 4) return false;

    let incRun = 1;
    let decRun = 1;

    for (let i = 1; i < filtered.length; i++) {
      const prev = filtered.charCodeAt(i - 1);
      const cur = filtered.charCodeAt(i);

      if (cur === prev + 1) {
        incRun++;
      } else {
        incRun = 1;
      }

      if (cur === prev - 1) {
        decRun++;
      } else {
        decRun = 1;
      }

      if (incRun >= 4 || decRun >= 4) return true;
    }

    return false;
  }

  private static hasKeyboardPattern(s: string): boolean {
    const keyboardRuns = [
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm',
      '1234567890',
    ];

    const lowered = s.toLowerCase();

    for (const run of keyboardRuns) {
      const rev = run.split('').reverse().join('');
      if (this.containsAnyRun(lowered, run, 4)) return true;
      if (this.containsAnyRun(lowered, rev, 4)) return true;
    }

    return false;
  }

  private static containsAnyRun(input: string, run: string, minLen: number): boolean {
    // Busca substrings de tamanho minLen..run.length
    for (let len = minLen; len <= run.length; len++) {
      for (let i = 0; i + len <= run.length; i++) {
        const piece = run.slice(i, i + len);
        if (input.includes(piece)) return true;
      }
    }
    return false;
  }
}