import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { MealsPage } from "./pages/meals/MealsPage";
import { HomePage } from "./pages/home/HomePage";

function App() {
  return (
    <BrowserRouter>
      <div className="fixed bottom-0 left-0 right-0 flex justify-around bg-slate-200 py-5">
        <Link to="/">Home</Link>
        <Link to="/meals">Meals</Link>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/meals" element={<MealsPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
