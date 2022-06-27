import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components/PrimaryButton";
import { TextInput } from "../../components/TextInput";
import { Header } from "../../components/Header";

export function AddMeals() {
  const [meal, setMeal] = useState("");

  let navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("https://localhost:5000/api/v1/meal", {
        name: meal,
      })
      .then(function (response) {
        console.log(response);
        navigate("/meals");
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleMeal = (value) => {
    setMeal(value);
  };

  return (
    <div className="p-8">
      <div className="flex">
        <Header
          title="Add meal"
          description="Add your craving options"
        ></Header>
      </div>
      <form className="my-4" onSubmit={handleSubmit}>
        <TextInput
          label="Meal name"
          value={meal}
          onChange={handleMeal}
        ></TextInput>
        <PrimaryButton type="submit">Add meal</PrimaryButton>{" "}
      </form>
    </div>
  );
}
