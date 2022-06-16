import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function MealsPage() {
  const [meals, setMeals] = useState([]);
  useEffect(() => {
    axios
      .get("https://localhost:5000/api/v1/meal")
      .then((response) => {
        // handle success
        setMeals(response);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  }, []);

  return (
    <>
      <div className="flex justify-between p-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My meals</h1>
          <p>Add and edit your cookbook</p>
        </div>
        <Link to="create">+</Link>
      </div>

      <div>
        <p>
          {meals.map((meal) => {
            return (
              <>
                Meal name:
                {meal.name} <br />
              </>
            );
          })}
        </p>
      </div>
    </>
  );
}
