/**
 * Erro lançado por RunSQL quando uma statement falha.
 *
 * Permite o Runner distinguir erros de SQL de outros erros inesperados.
 */
export class RunSqlException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RunSqlException';
  }
}
