import { Injectable } from "@nestjs/common";
import CategoryDTO from "../CategoryDTO";
import CategoriesRepository from "../CategoriesRepository";
import Category from "src/EntityModels/Category";
import { CategoryKind } from "src/enum/category-kind.enum";

@Injectable()
export default class CreateCategory {
    constructor(
        private readonly repository: CategoriesRepository
    ) {}

    async execute(category: CategoryDTO): Promise<{category: Category}|true> {
        const entity = Category.fromDTO(category); 
        const categoryCreated = await this.repository.saveCategory(entity);

        if (categoryCreated.kind === CategoryKind.SUBCATEGORY) {
            return true;
        }
        return { category: categoryCreated };    
    }
}   