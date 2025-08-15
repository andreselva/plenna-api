export class BillsDueResponseDTO {
    constructor(
        public readonly nome: string,
        public readonly vencimento: string,
        public readonly valor: string
    ) {}
}