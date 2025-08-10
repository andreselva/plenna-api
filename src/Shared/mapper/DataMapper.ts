import { IEntityFactory } from "../interfaces/IEntityFactory";

export default class DataMapper {

    /**
     * Converte um array de objetos genéricos em um array de entidades tipadas.
     * @param rows O array de linhas retornado pela query.
     * @param entityClass A classe da entidade que implementa o contrato IEntityFactory.
     * @returns Um array de entidades do tipo T.
     */
    public static toEntities<T>(rows: object[], entityClass: IEntityFactory<T>): T[] {
        if (!rows || rows.length === 0) {
            return [];
        }
        return rows.map(row => entityClass.fromRow(row));
    }
}