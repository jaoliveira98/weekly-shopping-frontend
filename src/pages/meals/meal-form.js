import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMeal, getMeal, updateMeal } from '../../api/meals';

const emptyRow = { name: '', quantity: '' };

const toRows = (ingredients) =>
    ingredients.map(({ product, quantity }) => ({ name: product.name, quantity: String(quantity) }));

const validateMeal = (name, rows) => {
    const errors = [];
    if (!name.trim()) errors.push('Give the meal a name.');
    const filled = rows
        .map((row, index) => ({ ...row, number: index + 1 }))
        .filter((row) => row.name.trim() || row.quantity.trim());
    if (filled.length === 0) errors.push('Add at least one ingredient.');
    filled.forEach(({ name: ingredient, quantity, number }) => {
        if (!ingredient.trim()) errors.push(`Ingredient ${number} needs a name.`);
        if (!/^\d+$/.test(quantity.trim()) || Number(quantity) < 1)
            errors.push(`Ingredient ${number} needs a quantity of at least 1.`);
    });
    return { errors, filled };
};

function MealForm() {
    const { id } = useParams();
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

    const save = async (event) => {
        event.preventDefault();
        if (status === 'saving') return;
        const { errors: found, filled } = validateMeal(name, rows);
        setErrors(found);
        if (found.length > 0) return;
        const meal = {
            name: name.trim(),
            ingredients: filled.map((row) => ({ product: { name: row.name.trim() }, quantity: Number(row.quantity) })),
        };
        setStatus('saving');
        try {
            await (id ? updateMeal(id, meal) : createMeal(meal));
            navigate('/meals');
        } catch {
            setErrors(['The meal could not be saved.']);
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
                    {errors.length > 0 && (
                        <ul className="text-red-600">
                            {errors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                    <label className="flex flex-col gap-1 font-bold">
                        Name
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="px-3 py-2 rounded-md border border-slate-300 font-normal"
                        />
                    </label>
                    <fieldset className="flex flex-col gap-2 min-w-0">
                        <legend className="font-bold mb-1">Ingredients</legend>
                        {rows.map((row, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    aria-label={`Ingredient ${index + 1}`}
                                    placeholder="Ingredient"
                                    value={row.name}
                                    onChange={(event) => changeRow(index, 'name', event.target.value)}
                                    className="flex-1 min-w-0 px-3 py-2 rounded-md border border-slate-300"
                                />
                                <input
                                    aria-label={`Quantity ${index + 1}`}
                                    placeholder="Quantity"
                                    type="number"
                                    min="1"
                                    value={row.quantity}
                                    onChange={(event) => changeRow(index, 'quantity', event.target.value)}
                                    className="w-24 px-3 py-2 rounded-md border border-slate-300"
                                />
                                <button
                                    type="button"
                                    aria-label={`Remove ingredient ${index + 1}`}
                                    onClick={() => setRows((shown) => shown.filter((_, at) => at !== index))}
                                    className="px-3 rounded-md bg-slate-200 font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
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

export default MealForm;
