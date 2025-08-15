import { Module } from "@nestjs/common";
import CategoriesController from "./CategoriesController";
import CategoriesService from "./CategoriesService";
import CategoriesRepository from "./CategoriesRepository";
import CreateCategory from "./useCases/CreateCategory";
import DeleteCategory from "./useCases/DeleteCategory";
import GetCategories from "./useCases/GetCategories";
import UpdateCategory from "./useCases/UpdateCategory";

@Module({
    imports: [],
    providers: [
        CategoriesService, 
        CategoriesRepository,
        CreateCategory,
        DeleteCategory,
        GetCategories,
        UpdateCategory
    ],
    controllers: [CategoriesController],
    exports: []
})

export class CategoryModule { }
