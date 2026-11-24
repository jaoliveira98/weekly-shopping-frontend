import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import App from './App';
import { createMeal } from './api/meals';

const renderAt = (path) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <App />
        </MemoryRouter>
    );

const fillMeal = (name, ingredient, quantity) => {
    userEvent.clear(screen.getByLabelText('Name'));
    userEvent.type(screen.getByLabelText('Name'), name);
    userEvent.clear(screen.getByLabelText('Ingredient 1'));
    userEvent.type(screen.getByLabelText('Ingredient 1'), ingredient);
    userEvent.clear(screen.getByLabelText('Quantity 1'));
    userEvent.type(screen.getByLabelText('Quantity 1'), quantity);
};

beforeEach(() => localStorage.clear());

test('the navbar links home, the meals list and the new meal form', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation');

    userEvent.click(within(nav).getByRole('link', { name: 'Meals' }));
    expect(screen.getByRole('heading', { name: 'Meals' })).toBeInTheDocument();

    userEvent.click(within(nav).getByRole('link', { name: 'New meal' }));
    expect(screen.getByRole('heading', { name: 'New meal' })).toBeInTheDocument();

    userEvent.click(within(nav).getByRole('link', { name: 'Home' }));
    expect(screen.getByText('Hello Sofia')).toBeInTheDocument();
});

test('an empty list says there are no meals yet', async () => {
    renderAt('/meals');

    expect(await screen.findByText('No meals yet.')).toBeInTheDocument();
});

test('adding a meal shows it on the list', async () => {
    renderAt('/meals/new');

    fillMeal('Pasta', 'Spaghetti', '2');
    userEvent.click(screen.getByRole('button', { name: 'Add ingredient' }));
    userEvent.type(screen.getByLabelText('Ingredient 2'), 'Tomato');
    userEvent.type(screen.getByLabelText('Quantity 2'), '3');
    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    const meal = await screen.findByRole('listitem');
    expect(within(meal).getByText('Pasta')).toBeInTheDocument();
    expect(within(meal).getByText('2 Spaghetti, 3 Tomato')).toBeInTheDocument();
});

test('a meal needs a name and at least one ingredient', async () => {
    renderAt('/meals/new');

    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    expect(screen.getByText('Give the meal a name.')).toBeInTheDocument();
    expect(screen.getByText('Add at least one ingredient.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'New meal' })).toBeInTheDocument();
    expect(localStorage.getItem('meals')).toBeNull();
});

test('every ingredient needs a name and a quantity of at least 1', () => {
    renderAt('/meals/new');

    fillMeal('Pasta', 'Spaghetti', '0');
    userEvent.click(screen.getByRole('button', { name: 'Add ingredient' }));
    userEvent.type(screen.getByLabelText('Quantity 2'), '1');
    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    expect(screen.getByText('Ingredient 1 needs a quantity of at least 1.')).toBeInTheDocument();
    expect(screen.getByText('Ingredient 2 needs a name.')).toBeInTheDocument();
    expect(localStorage.getItem('meals')).toBeNull();
});

test('editing a meal changes it on the list', async () => {
    await createMeal({ name: 'Pasta', ingredients: [{ product: { name: 'Spaghetti' }, quantity: 1 }] });
    renderAt('/meals');

    userEvent.click(await screen.findByRole('link', { name: 'Edit Pasta' }));
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Pasta'));
    expect(screen.getByLabelText('Ingredient 1')).toHaveValue('Spaghetti');

    fillMeal('Soup', 'Carrot', '4');
    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    const meal = await screen.findByRole('listitem');
    expect(within(meal).getByText('Soup')).toBeInTheDocument();
    expect(within(meal).getByText('4 Carrot')).toBeInTheDocument();
});

test('removing an ingredient row leaves it out of the meal', async () => {
    renderAt('/meals/new');

    fillMeal('Pasta', 'Spaghetti', '1');
    userEvent.click(screen.getByRole('button', { name: 'Add ingredient' }));
    userEvent.type(screen.getByLabelText('Ingredient 2'), 'Tomato');
    userEvent.type(screen.getByLabelText('Quantity 2'), '3');
    userEvent.click(screen.getByRole('button', { name: 'Remove ingredient 2' }));
    expect(screen.queryByLabelText('Ingredient 2')).not.toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    const meal = await screen.findByRole('listitem');
    expect(within(meal).getByText('1 Spaghetti')).toBeInTheDocument();
    expect(screen.queryByText(/Tomato/)).not.toBeInTheDocument();
});

test('clicking New meal while editing starts an empty form and saves a second meal', async () => {
    const pasta = await createMeal({ name: 'Pasta', ingredients: [{ product: { name: 'Spaghetti' }, quantity: 1 }] });
    renderAt(`/meals/${pasta.id}/edit`);
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Pasta'));

    userEvent.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'New meal' }));

    expect(screen.getByRole('heading', { name: 'New meal' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Ingredient 1')).toHaveValue('');
    fillMeal('Soup', 'Carrot', '4');
    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));
    const saved = JSON.parse(localStorage.getItem('meals'));
    expect(saved.map((meal) => meal.name)).toEqual(['Pasta', 'Soup']);
    expect(saved[0].id).not.toEqual(saved[1].id);
});

test('going back from one edit page to another shows that meal', async () => {
    const pasta = await createMeal({ name: 'Pasta', ingredients: [{ product: { name: 'Spaghetti' }, quantity: 1 }] });
    const soup = await createMeal({ name: 'Soup', ingredients: [{ product: { name: 'Carrot' }, quantity: 4 }] });
    const Back = () => {
        const navigate = useNavigate();
        return <button onClick={() => navigate(-1)}>Back</button>;
    };
    render(
        <MemoryRouter initialEntries={[`/meals/${pasta.id}/edit`, `/meals/${soup.id}/edit`]} initialIndex={1}>
            <Back />
            <App />
        </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Soup'));

    userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.queryByDisplayValue('Soup')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Pasta'));
    expect(screen.getByLabelText('Ingredient 1')).toHaveValue('Spaghetti');
});

describe('meals saved in a bad shape', () => {
    test.each([
        ['text that is not a list', 'not json'],
        ['nothing', 'null'],
        ['an object', '{}'],
    ])('a list stored as %s reads as no meals and new meals still save', async (_, stored) => {
        localStorage.setItem('meals', stored);
        renderAt('/meals');

        expect(await screen.findByText('No meals yet.')).toBeInTheDocument();

        userEvent.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'New meal' }));
        fillMeal('Pasta', 'Spaghetti', '1');
        userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

        expect(await screen.findByText('1 Spaghetti')).toBeInTheDocument();
    });

    test('a meal without ingredients is left out and the others still show', async () => {
        localStorage.setItem(
            'meals',
            JSON.stringify([
                { id: 'a', name: 'Broken' },
                { id: 'b', name: 'Pasta', ingredients: [{ product: { name: 'Spaghetti' }, quantity: 1 }] },
            ])
        );
        renderAt('/meals');

        expect(await screen.findByText('1 Spaghetti')).toBeInTheDocument();
        expect(screen.queryByText('Broken')).not.toBeInTheDocument();
    });
});

test('a failed save announces the errors, marks the bad boxes and moves focus to the first', () => {
    renderAt('/meals/new');

    userEvent.type(screen.getByLabelText('Ingredient 1'), 'Rice');
    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('Give the meal a name.')).toBeInTheDocument();
    expect(within(alert).getByText('Ingredient 1 needs a quantity of at least 1.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Give the meal a name.');
    expect(screen.getByLabelText('Ingredient 1')).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Quantity 1')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Quantity 1')).toHaveAccessibleDescription('Ingredient 1 needs a quantity of at least 1.');
    expect(screen.getByLabelText('Name')).toHaveFocus();

    userEvent.type(screen.getByLabelText('Name'), 'Rice bowl');
    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Quantity 1')).toHaveFocus();
});

test('a form with no ingredient rows marks the missing ingredient on the Add ingredient button', () => {
    renderAt('/meals/new');

    userEvent.type(screen.getByLabelText('Name'), 'Pasta');
    userEvent.click(screen.getByRole('button', { name: 'Remove ingredient 1' }));
    userEvent.click(screen.getByRole('button', { name: 'Save meal' }));

    expect(within(screen.getByRole('alert')).getByText('Add at least one ingredient.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add ingredient' })).toHaveFocus();
});

test('deleting a meal takes it off the list', async () => {
    await createMeal({ name: 'Pasta', ingredients: [{ product: { name: 'Spaghetti' }, quantity: 1 }] });
    renderAt('/meals');

    userEvent.click(await screen.findByRole('button', { name: 'Delete Pasta' }));

    expect(await screen.findByText('No meals yet.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('meals'))).toEqual([]);
});

test('editing a meal that no longer exists says so', async () => {
    renderAt('/meals/missing/edit');

    expect(await screen.findByText('This meal no longer exists.')).toBeInTheDocument();
});
