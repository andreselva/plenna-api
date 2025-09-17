import { Injectable } from "@nestjs/common";
import CategoriesRepository from "../CategoriesRepository";

@Injectable()
export default class GetCategories {
    constructor(
        private readonly categoriesRepository: CategoriesRepository,
    ) {}

    async execute() {
        const categories = await this.categoriesRepository.getCategories();

        await Promise.all(
            categories.map(async (category) => {
                category.subcategories = await this.categoriesRepository.getSubcategoriesByParentId(category.id);
            })
        );
        
        return {categories: categories};
    }
}