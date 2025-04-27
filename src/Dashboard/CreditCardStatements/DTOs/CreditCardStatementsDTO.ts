export default class CreditCardStatementsDTO {
    constructor(
        public readonly value: number,
        public readonly card: string
    ) {}
}