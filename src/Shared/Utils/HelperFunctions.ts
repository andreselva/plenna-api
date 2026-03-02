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
}