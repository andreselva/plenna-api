import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Category from "./Entity/Category";
import CategoryModel from "src/EntityModels/category.model";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class CategoriesRepository extends BaseRepository<CategoryModel>{
    constructor(database: MySQLDatabase) {
        super(database, 'category', 'id');
    }

    /**
     * Busca todas as categorias no banco de dados.
     */
    async getCategories() {
        const query = 'SELECT * FROM category';
        return await this.database.select(query);
    }

    /**
     * Cria uma nova categoria.
     */
    async createCategory(category: Category) {
        const categoryModel = new CategoryModel();
        categoryModel.id = category.getId();
        categoryModel.description = category.getDescription();
        categoryModel.name = category.getName();
        categoryModel.type = category.getType();
        categoryModel.color = category.getColor();
        const result = await this.save(categoryModel);

        if (result.affectedRows > 0) {
            return {
                id: result.insertId,
                name: category.getName(),
                description: category.getDescription(),
                type: category.getType(),
                color: category.getColor(),
            };
        }
        throw new Error('Falha ao criar a categoria.');
    }

    /**
     * Deleta uma categoria pelo ID.
     */
    async deleteCategory(id: number) {
        const query = 'DELETE FROM category WHERE id = ?';
        const result = await this.database.execute(query, [id]);

        if (result.affectedRows > 0) {
            return { success: true, message: 'Categoria deletada com sucesso.' };
        }
        throw new Error('Falha ao deletar a categoria, possivelmente não foi encontrada.');
    }

    /**
     * Atualiza uma categoria pelo ID.
     */
    async updateCategory(id: number, category: Category) {
        const query = "UPDATE category SET name = ?, type = ?, description = ?, color = ? WHERE id = ?";
        const params = [category.getName(), category.getType(), category.getDescription(), category.getColor(), id];
        const result = await this.database.execute(query, params);
        
        if (result.affectedRows > 0) {
            return {
                id: id,
                name: category.getName(),
                description: category.getDescription(),
                type: category.getType(),
                color: category.getColor()
            };
        }
        throw new Error('Falha ao atualizar a categoria, possivelmente não foi encontrada.');
    }
}