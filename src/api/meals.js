const STORAGE_KEY = 'meals';

const apiUrl = () => process.env.REACT_APP_API_URL;

const request = async (method, path = '', body) => {
    const response = await fetch(`${apiUrl()}/api/v1/meal${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (method === 'GET' && response.status === 404) return null;
    if (!response.ok) throw new Error(`The meal request failed with ${response.status}`);
    return method === 'DELETE' ? null : response.json();
};

const readStored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

const writeStored = (meals) => localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const listMeals = async () => (apiUrl() ? request('GET') : readStored());

export const getMeal = async (id) =>
    apiUrl() ? request('GET', `/${id}`) : readStored().find((meal) => meal.id === id) ?? null;

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
