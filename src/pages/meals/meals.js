import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteMeal, listMeals } from '../../api/meals';

const describeIngredients = (ingredients) =>
    ingredients
        .map(({ product, quantity }) => (quantity === null ? product.name : `${quantity} ${product.name}`))
        .join(', ');

function Meals() {
    const [meals, setMeals] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let current = true;
        listMeals()
            .then((loaded) => current && setMeals(loaded))
            .catch(() => current && setError('The meals could not be loaded.'));
        return () => {
            current = false;
        };
    }, []);

    const remove = async (id) => {
        setError(null);
        try {
            await deleteMeal(id);
            setMeals((shown) => shown.filter((meal) => meal.id !== id));
        } catch {
            setError('The meal could not be deleted.');
        }
    };

    return (
        <main className="max-w-2xl mx-auto px-6 py-10 text-slate-800">
            <h1 className="text-3xl font-extrabold mb-6">Meals</h1>
            {error && <p className="mb-4 text-red-600">{error}</p>}
            {meals === null && !error && <p>Loading meals...</p>}
            {meals?.length === 0 && <p>No meals yet.</p>}
            {meals?.length > 0 && (
                <ul className="flex flex-col gap-3">
                    {meals.map((meal) => (
                        <li key={meal.id} className="flex items-center gap-4 p-4 rounded-md bg-slate-100">
                            <div className="flex-1">
                                <p className="font-bold">{meal.name}</p>
                                <p className="text-sm text-slate-600">{describeIngredients(meal.ingredients)}</p>
                            </div>
                            <Link
                                to={`/meals/${meal.id}/edit`}
                                aria-label={`Edit ${meal.name}`}
                                className="px-3 py-1 rounded-md bg-slate-800 text-white font-bold"
                            >
                                Edit
                            </Link>
                            <button
                                type="button"
                                onClick={() => remove(meal.id)}
                                aria-label={`Delete ${meal.name}`}
                                className="px-3 py-1 rounded-md bg-red-600 text-white font-bold"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default Meals;
