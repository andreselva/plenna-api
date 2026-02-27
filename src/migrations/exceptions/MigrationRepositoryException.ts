/**
 * Erro lançado pelo MigrationRepository quando operações no banco falham.
 * Inspirado em MigrationRepositoryException.php.
 */
export class MigrationRepositoryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationRepositoryException';
  }
}
