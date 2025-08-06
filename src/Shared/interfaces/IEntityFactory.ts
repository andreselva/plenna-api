/**
 * Define o contrato para uma classe que pode atuar como uma fábrica para uma entidade T.
 */
export interface IEntityFactory<T> {
    /**
     * Um construtor que não recebe argumentos e retorna uma instância de T.
     */
    new (): T;

    /**
     * Um método estático que cria uma instância de T a partir de uma linha de dados.
     */
    fromRow(row: object): T;
}