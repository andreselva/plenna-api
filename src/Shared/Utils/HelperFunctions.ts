export class HelperFunctions {
    static deterministicJson<T>(obj: T): string {
        return JSON.stringify(
            HelperFunctions.sortRecursively(obj)
        )
    }

    private static sortRecursively(value: any): any {
        // null ou primitivo -> retorna direto
        if (value === null || typeof value !== 'object') {
            return value
        }

        // Array -> aplica recursivamente nos itens
        if (Array.isArray(value)) {
            return value.map(item => HelperFunctions.sortRecursively(item))
        }

        // Objeto → ordena chaves alfabeticamente
        const sortedKeys = Object.keys(value).sort()

        const result: any = {}

        for (const key of sortedKeys) {
            result[key] = HelperFunctions.sortRecursively(value[key])
        }

        return result
    }

    static cleanNullables(obj: any) {
        Object.keys(obj).forEach(key => {
            if (obj[key] === null || obj[key] === undefined) {
                delete obj[key];
            }
        })
        return obj;
    }

    static isNullable(value: any, considerEmptyValues: boolean = false, considerZeroValues: boolean = false) {
        if (value === null || value === undefined){
            return true;
        }

        if (considerEmptyValues) {
            if (typeof value === 'string' && value.trim() === '') {
                return true;
            }
        }

        if (considerZeroValues) {
            if (value === 0) return true;
        }

        if (typeof value === 'number' && isNaN(value)) {
            return true;
        }
        
        return false;
    }

    static isDuplicateKeyError(error: any): boolean {
        return error?.code === 'ER_DUP_ENTRY';
    }
}