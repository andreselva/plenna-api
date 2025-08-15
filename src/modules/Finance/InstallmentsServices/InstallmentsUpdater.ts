interface InstallmentUpdaterOptions<T, R> {
    items: T[];
    changedFields: Partial<T>;
    dynamicFieldProcessors?: Partial<Record<keyof T, (index: number) => any>>;
    updateFn: (item: T) => Promise<R>;
}

export async function InstallmentUpdater<T, R>({
    items,
    changedFields,
    dynamicFieldProcessors = {},
    updateFn,
}: InstallmentUpdaterOptions<T, R>): Promise<R[]> {
    const results: R[] = [];

    for (let i = 1; i < items.length; i++) {
        const item = items[i];

        for (const key in changedFields) {
            const field = key as keyof T;

            if (dynamicFieldProcessors[field]) {
                item[field] = dynamicFieldProcessors[field](i);
            } else {
                item[field] = changedFields[field]!;
            }
        }
    }

    for (const item of items) {
        results.push(await updateFn(item));
    }

    return results;
}
