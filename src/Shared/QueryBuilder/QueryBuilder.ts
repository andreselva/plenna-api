export default class QueryBuilder {
    /**
     * Gera uma string de placeholders (?) baseada no tamanho de um array.
     * Exemplo: para ['a', 'b', 'c'], retorna "?, ?, ?"
     * @param {any[]} values - O array de valores.
     * @returns {string} A string de placeholders.
     */
    static getPlaceholders(values: any[]): string {
        return values.map(() => "?").join(", ");
    }

    /**
     * Constrói uma query de INSERT ou UPDATE.
     * @param entity O objeto com os dados.
     * @param tableName O nome da tabela.
     * @param primaryKey O nome da coluna da chave primária.
     * @param ignoreProperties As propriedades do objeto que devem ser ignoradas.

     */
    static buildQuery(entity: object, tableName: string, primaryKey: string, ignoreProperties: string[] = []): { sql: string, values: any[] } {
        const allProperties = Object.keys(entity);

        const columns = allProperties.filter(prop =>
            typeof entity[prop as keyof object] !== 'function' && 
            prop !== primaryKey &&
            !ignoreProperties.includes(prop)
        );

        const primaryKeyValue = entity[primaryKey as keyof object];

        if (primaryKeyValue === null || primaryKeyValue === undefined || primaryKeyValue === 0) {
            const values = columns.map(col => entity[col as keyof object]);
            const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${this.getPlaceholders(values)})`;
            return { sql, values };
        } else {
            const setClause = columns.map(col => `${col} = ?`).join(", ");
            const valuesForSet = columns.map(col => entity[col as keyof object]);
            const allValues = [...valuesForSet, primaryKeyValue];
            const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${primaryKey} = ?`;
            return { sql, values: allValues };
        }
    }
}