export default interface DatabaseInterface {
    connect(): void;
    getConnection(): void;
}