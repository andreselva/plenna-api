export default class QueryBuilder {
    static getPlaceholders(values: any[]): string {
        return values.map(() => "?").join(", ");
    }
}