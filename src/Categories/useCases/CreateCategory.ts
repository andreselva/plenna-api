import { Injectable } from "@nestjs/common";
import CategoryDTO from "../CategoryDTO";
import CategoriesRepository from "../CategoriesRepository";
import Category from "../Entity/Category";
import Validator from "./Validator";

@Injectable()
export default class CreateCategory {
    constructor(
        private readonly repository: CategoriesRepository
    ) {}

    async execute(category: CategoryDTO) {
        Validator.validate(category);
        const entity = Category.fromDTO(category);
        const categoryCreated = await this.repository.createCategory(entity);
        return {category: categoryCreated};    
    }
}   