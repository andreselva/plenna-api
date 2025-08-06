import { Dependencies, Injectable } from "@nestjs/common";
import GetCategoriesUseCase from "./useCases/GetCategories";
import CreateCategory from "./useCases/CreateCategory";
import CategoryDTO from "./CategoryDTO";
import DeleteCategory from "./useCases/DeleteCategory";
import UpdateCategory from "./useCases/UpdateCategory";

@Injectable()
@Dependencies(
    GetCategoriesUseCase,
    CreateCategory,
    DeleteCategory,
    UpdateCategory
)
export default class CategoriesService {
    constructor(
        private readonly getCategoriesUseCase: GetCategoriesUseCase,
        private readonly createCategoryUseCase: CreateCategory,
        private readonly deleteCategoryUseCase: DeleteCategory,
        private readonly updateCategoryUseCase: UpdateCategory
    ) {}

    async getCategories() {
        return await this.getCategoriesUseCase.execute();
    }

    async createCategory(category: CategoryDTO) {
        return await this.createCategoryUseCase.execute(category);
    }

    async deleteCategory(id: string) {
        return await this.deleteCategoryUseCase.delete(Number(id));
    }

    async updateCategory(id: string, category: CategoryDTO) {
        return await this.updateCategoryUseCase.execute(Number(id), category);
    }
}
