import { Injectable } from "@nestjs/common";
import CategoriesRepository from "../CategoriesRepository";
import CategoryDTO from "../CategoryDTO";
import Validator from "./Validator";
import Category from "../Entity/Category";

@Injectable()
export default class UpdateCategory {
    constructor(
        private readonly categoryRepository: CategoriesRepository
    ) {}

    async execute(id: string, category: CategoryDTO) {
        Validator.validate(category);
        Validator.validateId(id);
        const entidade = Category.fromDTO(category);
        const updatedCategory = await this.categoryRepository.updateCategory(Number(id), entidade);
        return { category: updatedCategory };
    }
}