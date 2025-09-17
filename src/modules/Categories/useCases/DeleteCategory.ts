import { Injectable } from "@nestjs/common";
import CategoriesRepository from "../CategoriesRepository";
import Category from "src/EntityModels/Category";
import GetCategories from "./GetCategories";

@Injectable()
export default class DeleteCategory {
    constructor(
        private readonly repository: CategoriesRepository,
        private readonly getCategoriesUC: GetCategories
    ) {}

    async delete(id: number): Promise<{ categories: Category[] }> {
        if (typeof id !== 'number') {
            throw new Error('Invalid ID format');
        }
        await this.repository.deleteCategory(id);
        return await this.getCategoriesUC.execute();
    }
}