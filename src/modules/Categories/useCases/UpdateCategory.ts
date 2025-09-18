import { Injectable } from "@nestjs/common";
import CategoriesRepository from "../CategoriesRepository";
import CategoryDTO from "../CategoryDTO";
import Category from "src/EntityModels/Category";
import GetCategories from "./GetCategories";

@Injectable()
export default class UpdateCategory {
    constructor(
        private readonly categoryRepository: CategoriesRepository,
        private readonly getCategoriesUC: GetCategories
    ) {}

    async execute(id: number, category: CategoryDTO): Promise<{ categories: Category[] }> {
        category.id = id;
        const entity = Category.fromDTO(category);
        await this.categoryRepository.saveCategory(entity);
        return await this.getCategoriesUC.execute();
    }
}