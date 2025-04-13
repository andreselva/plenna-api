import { Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";

@Injectable()
export class DeleteExpense {
    constructor(
        private readonly repository: ExpensesRepository,
    ) {}

    async execute(id: string) {
        if (Number(id) <= 0) {
            throw new Error("O id não pode ser menor ou igual a zero!");
        }
        return await this.repository.deleteExpense(Number(id));
    }

}