import { Injectable } from "@nestjs/common";
import CategoryDTO from "../CategoryDTO";
import CategoriesRepository from "../CategoriesRepository";
import Category from "src/EntityModels/Category";

@Injectable()
export default class CreateCategory {
    constructor(
        private readonly repository: CategoriesRepository
    ) {}

    async execute(category: CategoryDTO): Promise<{category: Category}> {
        const entity = new Category();
        entity.name = category.name;
        entity.description = category.description;
        entity.type = category.type;
        entity.color = category.color;

        if (category.id !== undefined && category.id > 0) {
            entity.id = category.id;
        }

        const categoryCreated = await this.repository.createCategory(entity);
        return { category: categoryCreated };    
    }
}   