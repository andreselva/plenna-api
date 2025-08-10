export default interface IEntity {
    getTableName(): string;
    getPrimaryKey(): string;
    getIgnoredProperties(): string[];
}