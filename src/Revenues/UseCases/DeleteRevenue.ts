import { Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";

@Injectable()
export class DeleteRevenue {
    constructor(
        private readonly repository: RevenuesRepository
    ) { }

    async execute(id: string) {
        if (Number(id) <= 0) {
            throw new Error("Invalid ID!");
        }
        return await this.repository.deleteRevenue(Number(id));
    }
}