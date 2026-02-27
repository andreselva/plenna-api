/**
 * Erro lançado pelo MigrationRepository quando operações no banco falham.
 */
export class MigrationRepositoryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationRepositoryException';
  }
}
