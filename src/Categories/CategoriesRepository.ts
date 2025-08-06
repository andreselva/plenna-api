import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Category from "src/EntityModels/Category";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class CategoriesRepository extends BaseRepository<Category>{
    constructor(database: MySQLDatabase) {
        super(database, 'category', 'id');
    }

    /**
     * Busca todas as categorias no banco de dados.
     */
    async getCategories(): Promise<Category[]> {
        const query = 'SELECT * FROM category';
        const rows = await this.database.select(query);
        return this.extractToEntity(rows, Category)
    }

    /**
     * Cria uma nova categoria.
     */
    async createCategory(category: Category): Promise<Category> {
        const result = await this.save(category);

        if (result.affectedRows > 0) {
            category.id = result.insertId;
            return category;
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

    async updateCategory(category: Category): Promise<Category> {
        const result = await this.save(category);
        if (result.affectedRows > 0) {
            return category;
        }
        throw new Error('Falha ao atualizar a categoria, possivelmente não foi encontrada.');
    }
}