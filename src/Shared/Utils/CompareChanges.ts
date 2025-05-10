export function getChangedFields<T extends object>(original: T, updated: T): Partial<T> {
    const changedFields: Partial<T> = {};

    for (const key of Object.keys(updated) as (keyof T)[]) {
        const originalValue = original[key];
        const newValue = updated[key];

        if (key === 'value') {
            if (Number(originalValue) !== Number(newValue)) {
                changedFields[key] = newValue;
            }
        } else if (originalValue !== newValue) {
            changedFields[key] = newValue;
        }
    }

    return changedFields;
}