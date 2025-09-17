import { Injectable } from "@nestjs/common";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import Category from "src/EntityModels/Category";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class CategoriesRepository extends BaseRepository<Category>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext)
    }

    /**
     * Busca todas as categorias no banco de dados.
     */
    async getCategories(): Promise<Category[]> {
        const query = `SELECT * FROM category WHERE clientId = ? AND kind = 'C'`;
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        return this.extractToEntity(rows, Category)
    }

    /**
     * Busca todas as subcategorias de uma categoria no banco de dados.
     */
    async getSubcategoriesByParentId(parentId: number): Promise<Category[]> {
        const query = `SELECT * FROM category WHERE clientId = ? AND kind = 'S' AND parentId = ?`
        const rows = await this.database.select(query, [this.authContext.getClientId(), parentId]);
        return this.extractToEntity(rows, Category);
    }

    /**
     * Cria uma nova categoria.
     */
    async saveCategory(category: Category): Promise<Category> {
        category.clientId =  this.authContext.getClientId();
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
        const query = 'DELETE FROM category WHERE clientId = ? AND id = ?';
        const result = await this.database.execute(query, [this.authContext.getClientId(), id]);

        if (result.affectedRows > 0) {
            return { success: true, message: 'Categoria deletada com sucesso.' };
        }
        throw new Error('Falha ao deletar a categoria, possivelmente não foi encontrada.');
    }
}