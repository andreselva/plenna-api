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
        if (id <= 0) {
            throw new Error('Invalid ID!');
        }

        const entity = new Category();
        entity.name = category.name;
        entity.type = category.type;
        entity.description = category.description;
        entity.color = category.color;
        entity.id = id;
        
        const updatedCategory = await this.categoryRepository.updateCategory(entity);
        return { category: updatedCategory };
    }
}