import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMeal, getMeal, updateMeal } from '../../api/meals';

const emptyRow = { name: '', quantity: '' };

const toRows = (ingredients) =>
    ingredients.map(({ product, quantity }) => ({ name: product.name, quantity: String(quantity) }));

const validateMeal = (name, rows) => {
    const errors = [];
    if (!name.trim()) errors.push({ field: 'name', message: 'Give the meal a name.' });
    const filled = rows
        .map((row, index) => ({ ...row, index }))
        .filter((row) => row.name.trim() || row.quantity.trim());
    if (filled.length === 0)
        errors.push({ field: rows.length > 0 ? 'ingredient-0' : 'add', message: 'Add at least one ingredient.' });
    filled.forEach(({ name: ingredient, quantity, index }) => {
        if (!ingredient.trim())
            errors.push({ field: `ingredient-${index}`, message: `Ingredient ${index + 1} needs a name.` });
        if (!/^\d+$/.test(quantity.trim()) || Number(quantity) < 1)
            errors.push({
                field: `quantity-${index}`,
                message: `Ingredient ${index + 1} needs a quantity of at least 1.`,
            });
    });
    return { errors, filled };
};

function MealForm({ id }) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [rows, setRows] = useState([emptyRow]);
    const [errors, setErrors] = useState([]);
    const [status, setStatus] = useState(id ? 'loading' : 'ready');

    useEffect(() => {
        if (!id) return;
        let current = true;
        getMeal(id)
            .then((meal) => {
                if (!current) return;
                if (!meal) return setStatus('missing');
                setName(meal.name);
                setRows(toRows(meal.ingredients));
                setStatus('ready');
            })
            .catch(() => current && setStatus('failed'));
        return () => {
            current = false;
        };
    }, [id]);

    const changeRow = (index, field, value) =>
        setRows((shown) => shown.map((row, at) => (at === index ? { ...row, [field]: value } : row)));

    const errorFor = (field) => errors.find((error) => error.field === field);

    const fieldProps = (field) =>
        errorFor(field)
            ? { name: field, 'aria-invalid': true, 'aria-describedby': `${field}-error` }
            : { name: field };

    const save = async (event) => {
        event.preventDefault();
        if (status === 'saving') return;
        const { errors: found, filled } = validateMeal(name, rows);
        setErrors(found);
        if (found.length > 0) {
            event.target.elements.namedItem(found[0].field)?.focus();
            return;
        }
        const meal = {
            name: name.trim(),
            ingredients: filled.map((row) => ({ product: { name: row.name.trim() }, quantity: Number(row.quantity) })),
        };
        setStatus('saving');
        try {
            await (id ? updateMeal(id, meal) : createMeal(meal));
            navigate('/meals');
        } catch {
            setErrors([{ field: 'save', message: 'The meal could not be saved.' }]);
            setStatus('ready');
        }
    };

    return (
        <main className="max-w-2xl mx-auto px-6 py-10 text-slate-800">
            <h1 className="text-3xl font-extrabold mb-6">{id ? 'Edit meal' : 'New meal'}</h1>
            {status === 'loading' && <p>Loading the meal...</p>}
            {status === 'missing' && <p>This meal no longer exists.</p>}
            {status === 'failed' && <p className="text-red-600">The meal could not be loaded.</p>}
            {(status === 'ready' || status === 'saving') && (
                <form onSubmit={save} noValidate className="flex flex-col gap-4">
                    <div role="alert" className="empty:hidden">
                        {errors.length > 0 && (
                            <ul className="text-red-600">
                                {errors.map((error) => (
                                    <li key={`${error.field} ${error.message}`} id={`${error.field}-error`}>
                                        {error.message}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <label className="flex flex-col gap-1 font-bold">
                        Name
                        <input
                            {...fieldProps('name')}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="px-3 py-2 rounded-md border border-slate-300 font-normal [&[aria-invalid=true]]:border-red-600"
                        />
                    </label>
                    <fieldset className="flex flex-col gap-2 min-w-0">
                        <legend className="font-bold mb-1">Ingredients</legend>
                        {rows.map((row, index) => (
                            <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2">
                                <input
                                    {...fieldProps(`ingredient-${index}`)}
                                    aria-label={`Ingredient ${index + 1}`}
                                    placeholder="Ingredient"
                                    value={row.name}
                                    onChange={(event) => changeRow(index, 'name', event.target.value)}
                                    className="w-full sm:w-auto sm:flex-1 min-w-0 px-3 py-2 rounded-md border border-slate-300 [&[aria-invalid=true]]:border-red-600"
                                />
                                <input
                                    {...fieldProps(`quantity-${index}`)}
                                    aria-label={`Quantity ${index + 1}`}
                                    placeholder="Quantity"
                                    type="number"
                                    min="1"
                                    value={row.quantity}
                                    onChange={(event) => changeRow(index, 'quantity', event.target.value)}
                                    className="w-32 px-3 py-2 rounded-md border border-slate-300 [&[aria-invalid=true]]:border-red-600"
                                />
                                <button
                                    type="button"
                                    aria-label={`Remove ingredient ${index + 1}`}
                                    onClick={() => {
                                        setRows((shown) => shown.filter((_, at) => at !== index));
                                        setErrors([]);
                                    }}
                                    className="px-3 rounded-md bg-slate-200 font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            name="add"
                            aria-describedby={errorFor('add') ? 'add-error' : undefined}
                            onClick={() => setRows((shown) => [...shown, emptyRow])}
                            className="self-start px-3 py-1 rounded-md bg-slate-200 font-bold"
                        >
                            Add ingredient
                        </button>
                    </fieldset>
                    <button
                        type="submit"
                        disabled={status === 'saving'}
                        className="self-start px-4 py-2 rounded-md bg-slate-800 text-white font-bold disabled:opacity-50"
                    >
                        Save meal
                    </button>
                </form>
            )}
        </main>
    );
}

function MealFormPage() {
    const { id } = useParams();
    return <MealForm key={id ?? 'new'} id={id} />;
}

export default MealFormPage;
