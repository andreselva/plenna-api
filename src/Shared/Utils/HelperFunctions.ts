export class HelperFunctions {
    static deterministicJson<T>(obj: T): string {
        return JSON.stringify(
            HelperFunctions.sortRecursively(obj)
        );
    }

    private static sortRecursively(value: unknown): unknown {
        if (value === null || typeof value !== 'object') {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map(item => HelperFunctions.sortRecursively(item));
        }

        const sortedKeys = Object.keys(value).sort();
        const result: Record<string, unknown> = {};

        for (const key of sortedKeys) {
            result[key] = HelperFunctions.sortRecursively(
                (value as Record<string, unknown>)[key]
            );
        }

        return result;
    }

    static cleanNullables<T extends object>(obj: T): T {
        for (const key of Object.keys(obj)) {
            const typedKey = key as keyof T;

            if (obj[typedKey] === null || obj[typedKey] === undefined) {
                delete (obj as Partial<T>)[typedKey];
            }
        }

        return obj;
    }

    static isNullable(
        value: unknown,
        considerEmptyValues: boolean = false,
        considerZeroValues: boolean = false
    ): boolean {
        if (value === null || value === undefined) {
            return true;
        }

        if (considerEmptyValues && typeof value === 'string' && value.trim() === '') {
            return true;
        }

        if (considerZeroValues && value === 0) {
            return true;
        }

        if (typeof value === 'number' && Number.isNaN(value)) {
            return true;
        }

        return false;
    }

    static isDuplicateKeyError(error: unknown): boolean {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code?: string }).code === 'ER_DUP_ENTRY'
        );
    }
}