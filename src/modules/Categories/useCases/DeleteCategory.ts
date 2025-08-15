import { Injectable } from "@nestjs/common";
import CategoriesRepository from "../CategoriesRepository";

@Injectable()
export default class DeleteCategory {
    constructor(
        private readonly repository: CategoriesRepository
    ) {}

    async delete(id: number) {
        if (typeof id !== 'number') {
            throw new Error('Invalid ID format');
        }
        return await this.repository.deleteCategory(id);
    }
}