import { Injectable } from "@nestjs/common";
import CategoriesRepository from "../CategoriesRepository";

@Injectable()
export default class GetCategories {
    constructor(
        private readonly categoriesRepository: CategoriesRepository,
    ) {}

    async execute() {
        const result = await this.categoriesRepository.getCategories();
        return {categories: result};
    }
}