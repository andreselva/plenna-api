import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import CategoriesService from "./CategoriesService";
import CategoryDTO from "./CategoryDTO";

@Controller('categories')
export default class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getCategories() {
        return await this.categoriesService.getCategories();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCategory(@Body() category: CategoryDTO) {
        return await this.categoriesService.createCategory(category);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCategory(@Param('id') id: string) {
        return await this.categoriesService.deleteCategory(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async updateCategory(@Param('id') id: string, @Body() category: CategoryDTO) {
        return await this.categoriesService.updateCategory(id, category);
    }
}