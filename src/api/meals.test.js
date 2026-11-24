import { createMeal, deleteMeal, getMeal, listMeals, updateMeal } from './meals';

const pasta = {
    name: 'Pasta',
    ingredients: [{ product: { name: 'Spaghetti' }, quantity: 1 }],
};

describe('meals kept in the browser', () => {
    beforeEach(() => {
        localStorage.clear();
        delete process.env.REACT_APP_API_URL;
    });

    test('a created meal is listed and found by id', async () => {
        const created = await createMeal(pasta);

        expect(created.id).toEqual(expect.any(String));
        expect(await listMeals()).toEqual([{ id: created.id, ...pasta }]);
        expect(await getMeal(created.id)).toEqual({ id: created.id, ...pasta });
    });

    test('meals survive a reload', async () => {
        const created = await createMeal(pasta);

        expect(JSON.parse(localStorage.getItem('meals'))).toEqual([{ id: created.id, ...pasta }]);
    });

    test('an update replaces the name and ingredients', async () => {
        const created = await createMeal(pasta);
        const soup = { name: 'Soup', ingredients: [{ product: { name: 'Carrot' }, quantity: 3 }] };

        await updateMeal(created.id, soup);

        expect(await listMeals()).toEqual([{ id: created.id, ...soup }]);
    });

    test('a deleted meal is gone', async () => {
        const first = await createMeal(pasta);
        const second = await createMeal({ ...pasta, name: 'Salad' });

        await deleteMeal(first.id);

        expect(await listMeals()).toEqual([{ id: second.id, ...pasta, name: 'Salad' }]);
    });

    test('an unknown id finds nothing', async () => {
        expect(await getMeal('missing')).toBeNull();
    });

    test.each(['not json', 'null', '{}', '"text"', '42'])('a stored %s reads as no meals and saving still works', async (stored) => {
        localStorage.setItem('meals', stored);

        expect(await listMeals()).toEqual([]);
        const created = await createMeal(pasta);
        expect(await listMeals()).toEqual([{ id: created.id, ...pasta }]);
    });

    test('badly formed meals are skipped', async () => {
        const good = { id: 'g', ...pasta };
        localStorage.setItem(
            'meals',
            JSON.stringify([
                null,
                'Pasta',
                { id: 'a', name: 'No ingredients' },
                { id: 'b', ingredients: [] },
                { name: 'No id', ingredients: [] },
                { id: 'c', name: 'Bad ingredient', ingredients: [{ quantity: 1 }] },
                { id: 'd', name: 'Bad quantity', ingredients: [{ product: { name: 'Rice' }, quantity: 'lots' }] },
                good,
            ])
        );

        expect(await listMeals()).toEqual([good]);
        expect(await getMeal('a')).toBeNull();
    });
});

describe('meals kept by the backend', () => {
    beforeEach(() => {
        process.env.REACT_APP_API_URL = 'http://api.test';
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete process.env.REACT_APP_API_URL;
        delete global.fetch;
    });

    const answer = (body, ok = true, status = 200) =>
        fetch.mockResolvedValueOnce({ ok, status, json: async () => body });

    test('lists meals from the meal endpoint', async () => {
        answer([{ id: '1', ...pasta }]);

        expect(await listMeals()).toEqual([{ id: '1', ...pasta }]);
        expect(fetch).toHaveBeenCalledWith('http://api.test/api/v1/meal', expect.objectContaining({ method: 'GET' }));
    });

    test('creates, updates and deletes through the meal endpoint', async () => {
        answer({ id: '1', ...pasta });
        answer({ id: '1', ...pasta });
        answer(null);

        await createMeal(pasta);
        await updateMeal('1', pasta);
        await deleteMeal('1');

        expect(fetch.mock.calls.map(([url, init]) => [init.method, url, init.body])).toEqual([
            ['POST', 'http://api.test/api/v1/meal', JSON.stringify(pasta)],
            ['PUT', 'http://api.test/api/v1/meal/1', JSON.stringify(pasta)],
            ['DELETE', 'http://api.test/api/v1/meal/1', undefined],
        ]);
    });

    test('a missing meal finds nothing', async () => {
        answer(null, false, 404);

        expect(await getMeal('1')).toBeNull();
    });

    test.each([
        ['an object', {}],
        ['nothing', null],
        ['text', 'meals'],
    ])('a meal list answered as %s is an error', async (_, body) => {
        answer(body);

        await expect(listMeals()).rejects.toThrow('The meal list');
    });

    test('badly formed meals in the backend list are skipped', async () => {
        const good = { id: '1', ...pasta };
        answer([
            null,
            { id: '2', name: 'No ingredients' },
            { id: '3', name: 'Bad quantity', ingredients: [{ product: { name: 'Rice' }, quantity: 'lots' }] },
            good,
        ]);

        expect(await listMeals()).toEqual([good]);
    });

    test('a meal with an ingredient whose quantity is null stays listed', async () => {
        const noAmount = { id: '4', name: 'Rice bowl', ingredients: [{ product: { name: 'Salt' }, quantity: null }] };
        answer([noAmount]);

        expect(await listMeals()).toEqual([noAmount]);
    });

    test('a badly formed meal from the backend is an error', async () => {
        answer({ id: '1', name: 'Pasta', ingredients: null });

        await expect(getMeal('1')).rejects.toThrow('The meal');
    });

    test('a meal id the backend cannot read finds nothing', async () => {
        answer(null, false, 400);

        expect(await getMeal('not-an-id')).toBeNull();
    });

    test('a refused request throws', async () => {
        answer(null, false, 400);

        await expect(createMeal(pasta)).rejects.toThrow('400');
    });
});
