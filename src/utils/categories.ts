export const CATEGORY_MAP: Record<string, string> = {
    art: 'Art',
    vocabulary: 'Vocabulary',
    history: 'History',
    science: 'Science',
    politics: 'Politics',
    sports: 'Sports'
};

export const normalizeCategory = (category: string): string => {
    return category.toLowerCase().trim();
};

export const getDisplayCategory = (category: string): string => {
    const normalized = normalizeCategory(category);
    return CATEGORY_MAP[normalized] || category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

export const getAvailableCategories = (): string[] => {
    return Object.keys(CATEGORY_MAP);
};