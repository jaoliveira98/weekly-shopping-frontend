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
        setMeals(response.data);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  }, []);

  return (
    <div className="p-8 ">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My meals</h1>
          <p>Add and edit your cookbook</p>
        </div>
        <Link to="create">+</Link>
      </div>
      {meals.length === 0 && "Nothing found"}

      <div className="grid grid-cols-2 gap-4">
        {meals.map((meal) => {
          return (
            <div className="w-full">
              <img
                src="https://static.onecms.io/wp-content/uploads/sites/44/2019/08/26231113/5783153.jpg"
                alt="meal"
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
              <h3>{meal.name}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
