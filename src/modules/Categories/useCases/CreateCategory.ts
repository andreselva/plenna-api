import { Injectable } from "@nestjs/common";
import CategoryDTO from "../CategoryDTO";
import CategoriesRepository from "../CategoriesRepository";
import Category from "src/EntityModels/Category";
import GetCategories from "./GetCategories";

@Injectable()
export default class CreateCategory {
    constructor(
        private readonly repository: CategoriesRepository,
        private readonly getCategoriesUC: GetCategories
    ) {}

    async execute(category: CategoryDTO): Promise<{ categories: Category[] }> {
        const entity = Category.fromDTO(category); 
        await this.repository.saveCategory(entity);
        return await this.getCategoriesUC.execute();
    }
}   