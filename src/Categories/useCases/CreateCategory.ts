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
        const entity = Category.fromDTO(category); 
        const categoryCreated = await this.repository.saveCategory(entity);
        return { category: categoryCreated };    
    }
}   