import { Injectable } from "@nestjs/common";
import CategoriesRepository from "../CategoriesRepository";
import CategoryDTO from "../CategoryDTO";
import Category from "src/EntityModels/Category";

@Injectable()
export default class UpdateCategory {
    constructor(
        private readonly categoryRepository: CategoriesRepository
    ) {}

    async execute(id: number, category: CategoryDTO): Promise<{ category: Category }> {
        category.id = id;
        const entity = Category.fromDTO(category);
        
        const updatedCategory = await this.categoryRepository.saveCategory(entity);
        return { category: updatedCategory };
    }
}