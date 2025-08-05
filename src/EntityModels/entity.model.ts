export default abstract class EntityModel {
    public constructor() {}
    public abstract setTableName(): string;
    public abstract setPrimaryKey(): string;
}