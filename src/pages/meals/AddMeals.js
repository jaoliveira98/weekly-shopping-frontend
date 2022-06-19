import { Link } from "react-router-dom";

export function AddMeals() {
  return (
    <div className="p-8">
      <div className="flex">
        <Link to="../meals" className="mr-6">
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Add Meals</h1>
          <p>Add your craving options</p>
        </div>
      </div>
      <form>
        <label className="flex flex-col">
          Name:
          <input
            type="text"
            name="name"
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          />
        </label>
        Name:
        <div className="shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline">
          Name:
        </div>
      </form>
    </div>
  );
}
