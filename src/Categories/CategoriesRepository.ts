import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Category from "src/EntityModels/Category";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class CategoriesRepository extends BaseRepository<Category>{
    constructor(database: MySQLDatabase) {
        super(database);
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
    async saveCategory(category: Category): Promise<Category> {
        const result = await this.save(category);

        if (result.affectedRows > 0 && category.id === 0) {
            category.id = result.insertId;
        }
        return category;
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
}