const STORAGE_KEY = 'meals';

const apiUrl = () => process.env.REACT_APP_API_URL;

const request = async (method, path = '', body) => {
    const response = await fetch(`${apiUrl()}/api/v1/meal${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (method === 'GET' && path && [400, 404].includes(response.status)) return null;
    if (!response.ok) throw new Error(`The meal request failed with ${response.status}`);
    return method === 'DELETE' ? null : response.json();
};

const isObject = (value) => typeof value === 'object' && value !== null;

const isIngredient = (ingredient) =>
    isObject(ingredient) &&
    isObject(ingredient.product) &&
    typeof ingredient.product.name === 'string' &&
    (ingredient.quantity === null || Number.isInteger(ingredient.quantity));

const isMeal = (meal) =>
    isObject(meal) &&
    typeof meal.id === 'string' &&
    typeof meal.name === 'string' &&
    Array.isArray(meal.ingredients) &&
    meal.ingredients.every(isIngredient);

const readStored = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
        return Array.isArray(stored) ? stored.filter(isMeal) : [];
    } catch {
        return [];
    }
};

const writeStored = (meals) => localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const listMeals = async () => {
    if (!apiUrl()) return readStored();
    const meals = await request('GET');
    if (!Array.isArray(meals)) throw new Error('The meal list from the backend is not a list');
    return meals.filter(isMeal);
};

export const getMeal = async (id) => {
    if (!apiUrl()) return readStored().find((meal) => meal.id === id) ?? null;
    const meal = await request('GET', `/${id}`);
    if (meal !== null && !isMeal(meal)) throw new Error('The meal from the backend is badly formed');
    return meal;
};

export const createMeal = async ({ name, ingredients }) => {
    if (apiUrl()) return request('POST', '', { name, ingredients });
    const meal = { id: newId(), name, ingredients };
    writeStored([...readStored(), meal]);
    return meal;
};

export const updateMeal = async (id, { name, ingredients }) => {
    if (apiUrl()) return request('PUT', `/${id}`, { name, ingredients });
    const meal = { id, name, ingredients };
    writeStored(readStored().map((stored) => (stored.id === id ? meal : stored)));
    return meal;
};

export const deleteMeal = async (id) => {
    if (apiUrl()) return request('DELETE', `/${id}`);
    writeStored(readStored().filter((meal) => meal.id !== id));
    return null;
};
