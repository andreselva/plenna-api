import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Category from "./Entity/Category";

@Injectable()
export default class CategoriesRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) {}

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
        const query = 'INSERT INTO category (name, description, type, color) VALUES (?, ?, ?, ?)';
        const values = [category.getName(), category.getDescription(), category.getType(), category.getColor()];
        const result = await this.database.execute(query, values);

        if (result.affectedRows > 0) {
            return {
                id: result.insertId,
                name: category.getName(),
                description: category.getDescription(),
                type: category.getType(),
                color: category.getColor(),
            };
        }
        // Este erro é específico da lógica de negócio, então faz sentido lançá-lo aqui.
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
                name: category.getName(),
                description: category.getDescription(),
                type: category.getType(),
                color: category.getColor()
            };
        }
        throw new Error('Falha ao atualizar a categoria, possivelmente não foi encontrada.');
    }
}